import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customerId } = req.body

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription`
    })

    console.log('✅ [STRIPE] Portal session created')

    return res.status(200).json({ url: session.url })

  } catch (error) {
    console.error('❌ [STRIPE] Error creating portal session:', error)
    return res.status(500).json({ error: error.message })
  }
}
