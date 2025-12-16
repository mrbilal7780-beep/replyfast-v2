import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionName, email } = req.body

  if (!sessionName || !email) {
    return res.status(400).json({ error: 'Session name and email are required' })
  }

  const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000'
  const wahaApiKey = process.env.WAHA_API_KEY

  try {
    console.log(`🚀 [WAHA] Starting session for ${email}:`, sessionName)

    // Démarrer la session WAHA
    const response = await axios.post(
      `${wahaUrl}/api/sessions/start`,
      {
        name: sessionName,
        config: {
          proxy: null,
          webhooks: [
            {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/api/waha/webhook`,
              events: ['message'],
              hmac: null,
              retries: null,
              customHeaders: null
            }
          ]
        }
      },
      {
        headers: wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {},
        timeout: 30000
      }
    )

    console.log('✅ [WAHA] Session started successfully:', response.data)

    return res.status(200).json({
      success: true,
      session: sessionName,
      data: response.data
    })

  } catch (error) {
    console.error('❌ [WAHA] Error starting session:', error.response?.data || error.message)
    
    return res.status(500).json({
      error: 'Failed to start WAHA session',
      details: error.response?.data || error.message
    })
  }
}
