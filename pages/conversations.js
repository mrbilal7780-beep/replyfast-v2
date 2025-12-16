import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { Search, Send, Archive, Tag, MoreVertical, Edit2, Check } from 'lucide-react'
import axios from 'axios'

export default function Conversations({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [client, setClient] = useState(null)
  
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Renommage
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session])

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id)
      markAsRead(selectedConv.id)
    }
  }, [selectedConv])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_email=eq.${session.user.email}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new)
          
          // Ajouter le message si c'est la conversation active
          if (selectedConv && payload.new.conversation_id === selectedConv.id) {
            setMessages(prev => [...prev, payload.new])
          }
          
          // Recharger les conversations pour mettre à jour le compteur
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, selectedConv])

  const loadData = async () => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (clientData) {
        setClient(clientData)
        setUserName(clientData.first_name || clientData.company_name || 'Utilisateur')
      }

      await loadConversations()
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', session.user.email)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }

  const markAsRead = async (conversationId) => {
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

      // Mettre à jour localement
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
      )
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !client) return

    setSending(true)
    try {
      // Envoyer via WhatsApp
      const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://localhost:3000'
      
      await axios.post(`${wahaUrl}/api/sendText`, {
        session: client.waha_session_name,
        chatId: `${selectedConv.customer_phone}@c.us`,
        text: newMessage
      }, {
        headers: process.env.NEXT_PUBLIC_WAHA_API_KEY 
          ? { 'X-Api-Key': process.env.NEXT_PUBLIC_WAHA_API_KEY }
          : {}
      })

      // Enregistrer dans la base
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConv.id,
          client_email: session.user.email,
          customer_phone: selectedConv.customer_phone,
          message_text: newMessage,
          direction: 'sent'
        }])
        .select()
        .single()

      if (error) throw error

      // Ajouter le message localement
      setMessages(prev => [...prev, data])

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConv.id)

      setNewMessage('')
      await loadConversations()

    } catch (error) {
      console.error('Erreur envoi message:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim() || !selectedConv) return

    try {
      await supabase
        .from('conversations')
        .update({ customer_name: newName })
        .eq('id', selectedConv.id)

      setSelectedConv({ ...selectedConv, customer_name: newName })
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, customer_name: newName } : c)
      )
      setEditingName(false)
    } catch (error) {
      console.error('Erreur renommage:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredConversations = conversations.filter(conv =>
    (conv.customer_name || conv.customer_phone).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout session={session} userName={userName}>
      <div className="h-[calc(100vh-120px)] flex gap-6">
        {/* Liste des conversations */}
        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Recherche */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
                    selectedConv?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {(conv.customer_name || conv.customer_phone).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {conv.customer_name || conv.customer_phone}
                        </p>
                        {conv.unread_count > 0 && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">{conv.unread_count}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conv.last_message_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune conversation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          {selectedConv ? (
            <>
              {/* En-tête */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {(selectedConv.customer_name || selectedConv.customer_phone).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          placeholder="Nouveau nom"
                          autoFocus
                        />
                        <button
                          onClick={handleRename}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedConv.customer_name || selectedConv.customer_phone}
                        </p>
                        <button
                          onClick={() => {
                            setEditingName(true)
                            setNewName(selectedConv.customer_name || '')
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConv.customer_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        msg.direction === 'sent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.direction === 'sent' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone d'envoi */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Sélectionnez une conversation pour commencer
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
