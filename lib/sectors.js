export const sectors = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un restaurant. Tu réponds aux questions sur le menu, les horaires, et tu prends les réservations.',
  },
  {
    id: 'coiffure',
    name: 'Salon de coiffure',
    icon: '💇',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un salon de coiffure. Tu présentes les services, les tarifs, et tu prends les rendez-vous.',
  },
  {
    id: 'esthetique',
    name: 'Institut de beauté',
    icon: '💅',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un institut de beauté. Tu présentes les soins, les tarifs, et tu gères les rendez-vous.',
  },
  {
    id: 'garage',
    name: 'Garage automobile',
    icon: '🔧',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un garage automobile. Tu informes sur les services de réparation, d\'entretien, et tu prends les rendez-vous.',
  },
  {
    id: 'medecin',
    name: 'Cabinet médical',
    icon: '⚕️',
    menuEnabled: false,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un cabinet médical. Tu gères les prises de rendez-vous et informes sur les horaires de consultation.',
  },
  {
    id: 'avocat',
    name: 'Cabinet d\'avocat',
    icon: '⚖️',
    menuEnabled: false,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un cabinet d\'avocat. Tu prends les rendez-vous pour des consultations juridiques.',
  },
  {
    id: 'fitness',
    name: 'Salle de sport',
    icon: '💪',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une salle de sport. Tu présentes les abonnements, les cours collectifs, et tu prends les réservations.',
  },
  {
    id: 'commerce',
    name: 'Commerce de détail',
    icon: '🛍️',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un commerce. Tu réponds aux questions sur les produits, les prix, et les disponibilités.',
  },
  {
    id: 'boutique-en-ligne',
    name: 'Boutique en ligne',
    icon: '🛒',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une boutique en ligne. Tu aides les clients à trouver des produits et tu réponds à leurs questions.',
  },
  {
    id: 'epicerie',
    name: 'Épicerie',
    icon: '🥖',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une épicerie. Tu informes sur les produits disponibles, les horaires, et les promotions.',
  },
  {
    id: 'supermarche',
    name: 'Supermarché',
    icon: '🏪',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un supermarché. Tu aides les clients à trouver des produits et tu informes sur les offres spéciales.',
  },
  {
    id: 'vetements',
    name: 'Magasin de vêtements',
    icon: '👔',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un magasin de vêtements. Tu présentes les collections, les tailles disponibles, et les prix.',
  },
  {
    id: 'librairie',
    name: 'Librairie',
    icon: '📚',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une librairie. Tu aides les clients à trouver des livres et tu informes sur les nouveautés.',
  },
  {
    id: 'pharmacie',
    name: 'Pharmacie',
    icon: '💊',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une pharmacie. Tu informes sur les produits disponibles et les horaires d\'ouverture.',
  },
  {
    id: 'boucherie',
    name: 'Boucherie',
    icon: '🥩',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une boucherie. Tu présentes les viandes disponibles, les prix, et les spécialités.',
  },
  {
    id: 'fromagerie',
    name: 'Fromagerie',
    icon: '🧀',
    menuEnabled: true,
    appointmentsEnabled: false,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une fromagerie. Tu présentes les fromages disponibles, leurs origines, et les conseils de dégustation.',
  },
  {
    id: 'immobilier',
    name: 'Agence immobilière',
    icon: '🏠',
    menuEnabled: false,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'une agence immobilière. Tu prends les rendez-vous pour les visites de biens immobiliers.',
  },
  {
    id: 'hotel',
    name: 'Hôtel',
    icon: '🏨',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es l\'assistant virtuel d\'un hôtel. Tu informes sur les chambres disponibles, les tarifs, et tu prends les réservations.',
  },
  {
    id: 'autre',
    name: 'Autre',
    icon: '💼',
    menuEnabled: true,
    appointmentsEnabled: true,
    defaultPrompt: 'Tu es un assistant virtuel professionnel. Tu réponds aux questions des clients et tu les aides dans leurs démarches.',
  },
]

export const getSectorById = (id) => {
  return sectors.find(sector => sector.id === id) || sectors[sectors.length - 1]
}

export const getSectorsByFeature = (feature) => {
  if (feature === 'menu') {
    return sectors.filter(sector => sector.menuEnabled)
  }
  if (feature === 'appointments') {
    return sectors.filter(sector => sector.appointmentsEnabled)
  }
  return sectors
}
