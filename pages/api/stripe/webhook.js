import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import getRawBody from 'raw-body'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('❌ [STRIPE WEBHOOK] Signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`📥 [STRIPE WEBHOOK] Event received: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`⚠️ [STRIPE WEBHOOK] Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    console.error('❌ [STRIPE WEBHOOK] Error processing event:', error)
    return res.status(500).json({ error: error.message })
  }
}

// ============================================
// HANDLERS
// ============================================

async function handleCheckoutCompleted(session) {
  const email = session.metadata.supabase_email
  const customerId = session.customer
  const subscriptionId = session.subscription

  console.log(`✅ [STRIPE] Checkout completed for ${email}`)

  // Calculer la date de fin de période d'essai (30 jours)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  await supabase
    .from('clients')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString()
    })
    .eq('email', email)
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer
  const subscriptionId = subscription.id
  const status = subscription.status

  console.log(`✅ [STRIPE] Subscription created: ${subscriptionId}`)

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (client) {
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    await supabase
      .from('clients')
      .update({
        stripe_subscription_id: subscriptionId,
        subscription_status: status,
        subscription_ends_at: currentPeriodEnd.toISOString()
      })
      .eq('email', client.email)
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer
  const status = subscription.status

  console.log(`🔄 [STRIPE] Subscription updated: ${subscription.id} - Status: ${status}`)

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (client) {
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    await supabase
      .from('clients')
      .update({
        subscription_status: status,
        subscription_ends_at: currentPeriodEnd.toISOString()
      })
      .eq('email', client.email)
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer

  console.log(`❌ [STRIPE] Subscription deleted: ${subscription.id}`)

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (client) {
    await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null
      })
      .eq('email', client.email)
  }
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer
  const amount = invoice.amount_paid / 100 // Convertir de centimes en euros

  console.log(`💰 [STRIPE] Payment succeeded: ${amount}€`)

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (client) {
    // Enregistrer dans l'historique des paiements
    await supabase
      .from('payment_history')
      .insert([{
        client_email: client.email,
        stripe_payment_intent_id: invoice.payment_intent,
        amount,
        currency: invoice.currency,
        status: 'succeeded',
        description: invoice.description || 'Abonnement ReplyFast AI'
      }])

    // Mettre à jour le statut de l'abonnement
    await supabase
      .from('clients')
      .update({
        subscription_status: 'active'
      })
      .eq('email', client.email)
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer

  console.log(`⚠️ [STRIPE] Payment failed for customer: ${customerId}`)

  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (client) {
    await supabase
      .from('clients')
      .update({
        subscription_status: 'past_due'
      })
      .eq('email', client.email)

    // TODO: Envoyer un email de notification
  }
}
