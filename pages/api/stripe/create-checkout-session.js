import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, priceId } = req.body

  if (!email || !priceId) {
    return res.status(400).json({ error: 'Email and priceId are required' })
  }

  try {
    // Récupérer ou créer le client Stripe
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id')
      .eq('email', email)
      .single()

    let customerId = client?.stripe_customer_id

    if (!customerId) {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_email: email
        }
      })

      customerId = customer.id

      // Sauvegarder dans Supabase
      await supabase
        .from('clients')
        .update({ stripe_customer_id: customerId })
        .eq('email', email)
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=true`,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          supabase_email: email
        }
      },
      metadata: {
        supabase_email: email
      }
    })

    console.log('✅ [STRIPE] Checkout session created:', session.id)

    return res.status(200).json({ sessionId: session.id })

  } catch (error) {
    console.error('❌ [STRIPE] Error creating checkout session:', error)
    return res.status(500).json({ error: error.message })
  }
}
