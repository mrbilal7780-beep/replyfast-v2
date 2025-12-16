import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { getSectorById } from '../../../lib/sectors'
import axios from 'axios'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientEmail, customerPhone, messageText, conversationId } = req.body

  if (!clientEmail || !customerPhone || !messageText) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    console.log(`🤖 [BOT] Processing message from ${customerPhone} for ${clientEmail}`)

    // 1. Charger les infos du client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientEmail)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    // 2. Charger l'historique de conversation
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    // 3. Construire le contexte pour l'IA
    const sector = getSectorById(client.sector)
    const context = buildContext(client, sector, messages)

    // 4. Détecter si c'est une demande de RDV
    const appointmentData = await detectAppointment(context, messageText, client)

    // 5. Générer la réponse de l'IA
    const aiResponse = await generateAIResponse(context, messageText, appointmentData, client)

    // 6. Si RDV détecté et prêt, créer le RDV
    if (appointmentData.readyToCreate) {
      await createAppointment(client.email, customerPhone, appointmentData)
    }

    // 7. Envoyer la réponse via WhatsApp
    await sendWhatsAppMessage(client.waha_session_name, customerPhone, aiResponse)

    // 8. Enregistrer la réponse dans la base
    await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        client_email: clientEmail,
        customer_phone: customerPhone,
        message_text: aiResponse,
        direction: 'sent',
        created_at: new Date().toISOString()
      }])

    // 9. Mettre à jour la conversation
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: 0
      })
      .eq('id', conversationId)

    console.log('✅ [BOT] Message processed successfully')

    return res.status(200).json({ success: true, response: aiResponse })

  } catch (error) {
    console.error('❌ [BOT] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function buildContext(client, sector, messages) {
  const horaires = client.horaires || {}
  const horairesText = Object.keys(horaires)
    .map(jour => {
      const h = horaires[jour]
      if (h.ouvert) {
        return `${jour}: ${h.debut} - ${h.fin}`
      }
      return `${jour}: Fermé`
    })
    .join('\n')

  const conversationHistory = messages
    .map(m => `${m.direction === 'received' ? 'Client' : 'Assistant'}: ${m.message_text}`)
    .join('\n')

  return {
    companyName: client.company_name || 'l\'entreprise',
    sector: sector.name,
    address: client.address || 'Non renseignée',
    phone: client.phone || 'Non renseigné',
    horaires: horairesText,
    conversationHistory,
    defaultPrompt: sector.defaultPrompt
  }
}

async function detectAppointment(context, messageText, client) {
  const today = new Date()
  const todayStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const prompt = `Tu es un expert en analyse de conversations pour la prise de rendez-vous.

CONVERSATION ACTUELLE:
${context.conversationHistory}

DERNIER MESSAGE DU CLIENT:
${messageText}

CONTEXTE TEMPOREL:
- Aujourd'hui: ${todayStr}
- Date ISO: ${today.toISOString().split('T')[0]}

MISSION:
Analyse ce message et détermine si le client veut prendre un rendez-vous.
Extrais: date, heure, service demandé, nom du client.

RÈGLES:
- "demain" = ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}
- "après-demain" = ${new Date(today.getTime() + 172800000).toISOString().split('T')[0]}
- readyToCreate = true SEULEMENT si tu as date + heure
- missingInfo = liste exacte de ce qui manque

Réponds UNIQUEMENT avec ce JSON (sans markdown):
{
  "hasAppointment": true/false,
  "readyToCreate": true/false,
  "date": "YYYY-MM-DD" ou null,
  "time": "HH:MM" ou null,
  "service": "service exact" ou null,
  "name": "nom" ou null,
  "missingInfo": ["date", "time", "service"],
  "confidence": 0.95
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 400
    })

    let result = response.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const appointmentData = JSON.parse(result)
    console.log('🧠 [BOT] Appointment detection:', appointmentData)

    return appointmentData

  } catch (error) {
    console.error('❌ [BOT] Error detecting appointment:', error)
    return { hasAppointment: false, readyToCreate: false }
  }
}

async function generateAIResponse(context, messageText, appointmentData, client) {
  let systemPrompt = `${context.defaultPrompt}

INFORMATIONS DE L'ENTREPRISE:
- Nom: ${context.companyName}
- Adresse: ${context.address}
- Téléphone: ${context.phone}

HORAIRES D'OUVERTURE:
${context.horaires}

INSTRUCTIONS:
- Réponds de manière professionnelle et chaleureuse
- Utilise les informations de l'entreprise pour répondre
- Si le client demande un RDV, guide-le pour obtenir date et heure
- Sois concis (max 3-4 phrases)
- Utilise des emojis avec modération`

  // Si RDV détecté
  if (appointmentData.hasAppointment) {
    if (appointmentData.readyToCreate) {
      systemPrompt += `\n\nLE CLIENT VIENT DE PRENDRE UN RENDEZ-VOUS:
- Date: ${appointmentData.date}
- Heure: ${appointmentData.time}
- Service: ${appointmentData.service || 'Non spécifié'}

CONFIRME le rendez-vous au client avec enthousiasme.`
    } else {
      systemPrompt += `\n\nLE CLIENT VEUT PRENDRE UN RENDEZ-VOUS MAIS IL MANQUE:
${appointmentData.missingInfo.join(', ')}

DEMANDE-LUI ces informations manquantes de manière naturelle.`
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    return response.choices[0].message.content.trim()

  } catch (error) {
    console.error('❌ [BOT] Error generating response:', error)
    return 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?'
  }
}

async function createAppointment(clientEmail, customerPhone, appointmentData) {
  try {
    // Vérifier si le créneau est libre
    const { data: existingRdv } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_email', clientEmail)
      .eq('appointment_date', appointmentData.date)
      .eq('appointment_time', appointmentData.time)
      .in('status', ['pending', 'confirmed'])

    if (existingRdv && existingRdv.length > 0) {
      console.log('⚠️ [BOT] Slot already taken, adding to waitlist')
      
      // Ajouter à la liste d'attente
      await supabase
        .from('rdv_waitlist')
        .insert([{
          client_email: clientEmail,
          customer_phone: customerPhone,
          customer_name: appointmentData.name,
          requested_date: appointmentData.date,
          requested_time: appointmentData.time,
          service: appointmentData.service
        }])

      return { success: false, reason: 'slot_taken' }
    }

    // Créer le rendez-vous
    const { error } = await supabase
      .from('appointments')
      .insert([{
        client_email: clientEmail,
        customer_phone: customerPhone,
        customer_name: appointmentData.name,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        service: appointmentData.service,
        status: 'pending',
        notes: 'RDV pris automatiquement par IA'
      }])

    if (error) throw error

    console.log('✅ [BOT] Appointment created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ [BOT] Error creating appointment:', error)
    throw error
  }
}

async function sendWhatsAppMessage(sessionName, customerPhone, messageText) {
  try {
    const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000'
    const wahaApiKey = process.env.WAHA_API_KEY

    await axios.post(
      `${wahaUrl}/api/sendText`,
      {
        session: sessionName,
        chatId: `${customerPhone}@c.us`,
        text: messageText
      },
      {
        headers: wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {}
      }
    )

    console.log('✅ [BOT] WhatsApp message sent')

  } catch (error) {
    console.error('❌ [BOT] Error sending WhatsApp message:', error)
    throw error
  }
}
