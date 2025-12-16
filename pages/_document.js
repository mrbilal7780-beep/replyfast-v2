import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="ReplyFast AI - Automatisez vos réponses WhatsApp 24/7 avec l'intelligence artificielle" />
        <meta name="keywords" content="WhatsApp, IA, automatisation, chatbot, réponses automatiques, rendez-vous" />
        <meta name="author" content="ReplyFast AI" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ReplyFast AI - Réponses WhatsApp automatiques 24/7" />
        <meta property="og:description" content="Automatisez vos réponses WhatsApp avec l'IA. Gestion des rendez-vous, menu intelligent, et bien plus." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="ReplyFast AI - Réponses WhatsApp automatiques 24/7" />
        <meta property="twitter:description" content="Automatisez vos réponses WhatsApp avec l'IA. Gestion des rendez-vous, menu intelligent, et bien plus." />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
