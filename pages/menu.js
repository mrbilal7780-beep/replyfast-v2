import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Edit2, Trash2, Tag, Calendar, DollarSign, Package } from 'lucide-react'

export default function MenuManager({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState('menu') // 'menu' ou 'offers'
  
  // Menu items
  const [menuItems, setMenuItems] = useState([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  })

  // Special offers
  const [specialOffers, setSpecialOffers] = useState([])
  const [showAddOffer, setShowAddOffer] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    original_price: '',
    promo_price: '',
    start_date: '',
    end_date: '',
    active: true
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (client) {
        setUserName(client.first_name || client.company_name || 'Utilisateur')
      }

      await loadMenuItems()
      await loadSpecialOffers()

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('client_email', session.user.email)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Erreur chargement menu:', error)
    }
  }

  const loadSpecialOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('client_email', session.user.email)
        .order('start_date', { ascending: false })

      if (error) throw error
      setSpecialOffers(data || [])
    } catch (error) {
      console.error('Erreur chargement offres:', error)
    }
  }

  // ============================================
  // MENU ITEMS
  // ============================================

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('menu_items')
          .update(itemForm)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('menu_items')
          .insert([{
            ...itemForm,
            client_email: session.user.email
          }])

        if (error) throw error
      }

      await loadMenuItems()
      setShowAddItem(false)
      setEditingItem(null)
      setItemForm({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true
      })
    } catch (error) {
      console.error('Erreur sauvegarde item:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadMenuItems()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      available: item.available
    })
    setShowAddItem(true)
  }

  // ============================================
  // SPECIAL OFFERS
  // ============================================

  const handleSaveOffer = async () => {
    try {
      if (editingOffer) {
        // Update
        const { error } = await supabase
          .from('special_offers')
          .update(offerForm)
          .eq('id', editingOffer.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('special_offers')
          .insert([{
            ...offerForm,
            client_email: session.user.email
          }])

        if (error) throw error
      }

      await loadSpecialOffers()
      setShowAddOffer(false)
      setEditingOffer(null)
      setOfferForm({
        title: '',
        description: '',
        original_price: '',
        promo_price: '',
        start_date: '',
        end_date: '',
        active: true
      })
    } catch (error) {
      console.error('Erreur sauvegarde offre:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteOffer = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadSpecialOffers()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEditOffer = (offer) => {
    setEditingOffer(offer)
    setOfferForm({
      title: offer.title,
      description: offer.description || '',
      original_price: offer.original_price || '',
      promo_price: offer.promo_price || '',
      start_date: offer.start_date,
      end_date: offer.end_date,
      active: offer.active
    })
    setShowAddOffer(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout session={session} userName={userName}>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menu Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos produits, services et offres spéciales
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'menu'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-5 h-5 inline-block mr-2" />
            Produits & Services
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'offers'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-5 h-5 inline-block mr-2" />
            Offres Spéciales
          </button>
        </div>

        {/* Contenu Menu Items */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowAddItem(true)
                  setEditingItem(null)
                  setItemForm({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    available: true
                  })
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter un produit/service
              </button>
            </div>

            {/* Liste des items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </h3>
                        {item.category && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.price ? `${item.price}€` : 'Prix sur demande'}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        item.available
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {item.available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun produit ou service ajouté
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenu Offres Spéciales */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowAddOffer(true)
                  setEditingOffer(null)
                  setOfferForm({
                    title: '',
                    description: '',
                    original_price: '',
                    promo_price: '',
                    start_date: '',
                    end_date: '',
                    active: true
                  })
                }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter une offre spéciale
              </button>
            </div>

            {/* Liste des offres */}
            <div className="space-y-4">
              {specialOffers.length > 0 ? (
                specialOffers.map((offer) => {
                  const isActive = offer.active && new Date(offer.end_date) >= new Date()
                  const discount = offer.original_price && offer.promo_price
                    ? Math.round((1 - offer.promo_price / offer.original_price) * 100)
                    : 0

                  return (
                    <div
                      key={offer.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 ${
                        isActive
                          ? 'border-orange-500'
                          : 'border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {offer.title}
                            </h3>
                            {discount > 0 && (
                              <span className="text-lg font-bold text-orange-600">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          {offer.description && (
                            <p className="text-gray-600 dark:text-gray-400">
                              {offer.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Prix normal</label>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white line-through">
                            {offer.original_price}€
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Prix promo</label>
                          <p className="text-2xl font-bold text-orange-600">
                            {offer.promo_price}€
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Période</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            Du {new Date(offer.start_date).toLocaleDateString('fr-FR')}
                            <br />
                            au {new Date(offer.end_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {isActive ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune offre spéciale créée
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajout/Édition Item */}
      {showAddItem && (
        <Modal
          title={editingItem ? 'Modifier le produit/service' : 'Ajouter un produit/service'}
          onClose={() => {
            setShowAddItem(false)
            setEditingItem(null)
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Coupe homme"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Description détaillée..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="29.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Coiffure"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemForm.available}
                  onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disponible
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddItem(false)
                  setEditingItem(null)
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveItem}
                disabled={!itemForm.name}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Ajout/Édition Offre */}
      {showAddOffer && (
        <Modal
          title={editingOffer ? 'Modifier l\'offre spéciale' : 'Ajouter une offre spéciale'}
          onClose={() => {
            setShowAddOffer(false)
            setEditingOffer(null)
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de l'offre
              </label>
              <input
                type="text"
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Promo Black Friday"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Description de l'offre..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix normal (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.original_price}
                  onChange={(e) => setOfferForm({ ...offerForm, original_price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix promo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.promo_price}
                  onChange={(e) => setOfferForm({ ...offerForm, promo_price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={offerForm.start_date}
                  onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={offerForm.end_date}
                  onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={offerForm.active}
                  onChange={(e) => setOfferForm({ ...offerForm, active: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Offre active
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddOffer(false)
                  setEditingOffer(null)
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveOffer}
                disabled={!offerForm.title || !offerForm.start_date || !offerForm.end_date}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingOffer ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
