import { createClient } from '@supabase/supabase-js'
import getRawBody from 'raw-body'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Lire le body brut
    const rawBody = await getRawBody(req)
    const body = JSON.parse(rawBody.toString())

    console.log('📥 [WAHA WEBHOOK] Received:', JSON.stringify(body, null, 2))

    const { event, session, payload } = body

    // Traiter uniquement les messages entrants
    if (event === 'message' && payload.from && !payload.fromMe) {
      const customerPhone = payload.from.split('@')[0]
      const messageText = payload.body || ''
      const messageId = payload.id

      console.log(`💬 [WAHA] New message from ${customerPhone}: ${messageText}`)

      // Trouver le client propriétaire de cette session
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('waha_session_name', session)
        .single()

      if (clientError || !client) {
        console.error('❌ [WAHA] Client not found for session:', session)
        return res.status(200).json({ success: true, message: 'Client not found' })
      }

      // Créer ou récupérer la conversation
      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', client.email)
        .eq('customer_phone', customerPhone)
        .single()

      if (convError || !conversation) {
        // Créer nouvelle conversation
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert([{
            client_email: client.email,
            customer_phone: customerPhone,
            customer_name: payload.from_name || customerPhone,
            last_message_at: new Date().toISOString(),
            unread_count: 1
          }])
          .select()
          .single()

        if (newConvError) {
          console.error('❌ [WAHA] Error creating conversation:', newConvError)
          return res.status(500).json({ error: 'Failed to create conversation' })
        }

        conversation = newConv
      } else {
        // Mettre à jour la conversation existante
        await supabase
          .from('conversations')
          .update({
            last_message_at: new Date().toISOString(),
            unread_count: (conversation.unread_count || 0) + 1
          })
          .eq('id', conversation.id)
      }

      // Enregistrer le message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          client_email: client.email,
          customer_phone: customerPhone,
          message_text: messageText,
          direction: 'received',
          waha_message_id: messageId,
          created_at: new Date().toISOString()
        }])

      if (messageError) {
        console.error('❌ [WAHA] Error saving message:', messageError)
        return res.status(500).json({ error: 'Failed to save message' })
      }

      console.log('✅ [WAHA] Message saved successfully')

      // Déclencher le bot IA
      try {
        const botResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bot/process-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientEmail: client.email,
            customerPhone,
            messageText,
            conversationId: conversation.id
          })
        })

        if (!botResponse.ok) {
          console.error('❌ [WAHA] Bot processing failed')
        } else {
          console.log('✅ [WAHA] Bot processed message successfully')
        }
      } catch (botError) {
        console.error('❌ [WAHA] Error calling bot:', botError)
      }

      return res.status(200).json({ success: true })
    }

    return res.status(200).json({ success: true, message: 'Event ignored' })

  } catch (error) {
    console.error('❌ [WAHA WEBHOOK] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
