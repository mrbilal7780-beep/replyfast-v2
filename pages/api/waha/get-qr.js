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
    console.log(`📱 [WAHA] Fetching QR code for session:`, session)

    // Récupérer le QR code depuis WAHA
    const response = await axios.get(
      `${wahaUrl}/api/sessions/${session}/qr`,
      {
        headers: wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {},
        timeout: 10000
      }
    )

    if (response.data && response.data.qr) {
      console.log('✅ [WAHA] QR code retrieved successfully')
      
      return res.status(200).json({
        success: true,
        qr: response.data.qr
      })
    } else {
      console.log('⏳ [WAHA] QR code not ready yet')
      
      return res.status(202).json({
        success: false,
        message: 'QR code not ready yet'
      })
    }

  } catch (error) {
    console.error('❌ [WAHA] Error fetching QR code:', error.response?.data || error.message)
    
    // Si le QR code n'est pas encore disponible, retourner 202
    if (error.response?.status === 404) {
      return res.status(202).json({
        success: false,
        message: 'QR code not ready yet'
      })
    }
    
    return res.status(500).json({
      error: 'Failed to fetch QR code',
      details: error.response?.data || error.message
    })
  }
}
