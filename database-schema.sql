-- ============================================
-- REPLYFAST AI - DATABASE SCHEMA
-- Version: 2.0
-- ============================================

-- Table: clients (commerçants)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  sector TEXT,
  address TEXT,
  phone TEXT,
  horaires JSONB,
  
  -- WhatsApp WAHA
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  waha_session_name TEXT,
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_avatar_url TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_email, customer_phone)
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message_text TEXT,
  direction TEXT NOT NULL, -- 'sent' ou 'received'
  waha_message_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: appointments (rendez-vous)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  
  -- Feedback
  feedback_sent BOOLEAN DEFAULT FALSE,
  feedback_response TEXT,
  feedback_rating INTEGER,
  
  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: rdv_waitlist (liste d'attente)
CREATE TABLE IF NOT EXISTS rdv_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  service TEXT,
  
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: menu_items (produits/services)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: special_offers (offres spéciales)
CREATE TABLE IF NOT EXISTS special_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10, 2),
  promo_price DECIMAL(10, 2),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: payment_history (historique paiements)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'eur',
  status TEXT,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: potential_clients (leads identifiés par IA)
CREATE TABLE IF NOT EXISTS potential_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL REFERENCES clients(email) ON DELETE CASCADE,
  
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  qualification_score INTEGER, -- 0-100
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_client_email ON conversations(client_email);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_client_email ON messages(client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_client_email ON menu_items(client_email);
CREATE INDEX IF NOT EXISTS idx_special_offers_client_email ON special_offers(client_email);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_offers_updated_at BEFORE UPDATE ON special_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS UTILITAIRES
-- ============================================

-- Fonction pour nettoyer les anciens leads (> 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_leads()
RETURNS void AS $$
BEGIN
  DELETE FROM potential_clients
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour désactiver les offres expirées
CREATE OR REPLACE FUNCTION deactivate_expired_offers()
RETURNS void AS $$
BEGIN
  UPDATE special_offers
  SET active = FALSE
  WHERE end_date < CURRENT_DATE AND active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REALTIME (Supabase)
-- ============================================

-- Activer Realtime sur les tables importantes
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- ============================================
-- RLS (Row Level Security) - Optionnel
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (à adapter selon vos besoins)
-- Exemple: Un client ne peut voir que ses propres données
CREATE POLICY "Users can view own data" ON clients
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update own data" ON clients
  FOR UPDATE USING (auth.email() = email);
