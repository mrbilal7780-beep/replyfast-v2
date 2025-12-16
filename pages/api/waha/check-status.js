import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session } = req.query

  if (!session) {
    return res.status(400).json({ error: 'Session name is required' })
  }

  const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000'
  const wahaApiKey = process.env.WAHA_API_KEY

  try {
    console.log(`🔍 [WAHA] Checking status for session:`, session)

    // Vérifier le statut de la session
    const response = await axios.get(
      `${wahaUrl}/api/sessions/${session}`,
      {
        headers: wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {},
        timeout: 10000
      }
    )

    const status = response.data.status
    console.log(`📊 [WAHA] Session status:`, status)

    return res.status(200).json({
      success: true,
      status: status,
      data: response.data
    })

  } catch (error) {
    console.error('❌ [WAHA] Error checking status:', error.response?.data || error.message)
    
    return res.status(500).json({
      error: 'Failed to check session status',
      details: error.response?.data || error.message,
      status: 'FAILED'
    })
  }
}
