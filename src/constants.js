// constants.js - Extracted from trip-planner.jsx

// File upload limits
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Emoji suggestions based on destination keywords
export const emojiSuggestions = {
  // Cities
  'new york': '🗽', 'nyc': '🗽', 'manhattan': '🗽',
  'london': '🇬🇧', 'paris': '🗼', 'tokyo': '🗼', 'rome': '🏛️', 'venice': '🎭',
  'las vegas': '🎰', 'vegas': '🎰', 'miami': '🌴', 'la': '🌴', 'los angeles': '🌴',
  'san francisco': '🌉', 'sf': '🌉', 'chicago': '🏙️', 'seattle': '☕',
  'amsterdam': '🌷', 'barcelona': '🏖️', 'berlin': '🎸', 'dublin': '🍀',
  'sydney': '🦘', 'melbourne': '🦘', 'toronto': '🍁', 'vancouver': '🍁',

  // Beach/Tropical
  'beach': '🏖️', 'island': '🏝️', 'tropical': '🌴', 'caribbean': '🏝️',
  'hawaii': '🌺', 'maui': '🌺', 'cancun': '🏖️', 'bahamas': '🏝️',
  'provincetown': '🏖️', 'ptown': '🏖️', 'key west': '🌴',
  'puerto vallarta': '🌴', 'cabo': '🏖️', 'mykonos': '🇬🇷', 'ibiza': '🎉',
  'bali': '🏝️', 'maldives': '🏝️', 'fiji': '🏝️', 'tahiti': '🏝️',

  // Countries
  'mexico': '🇲🇽', 'spain': '🇪🇸', 'italy': '🇮🇹', 'france': '🇫🇷',
  'germany': '🇩🇪', 'japan': '🇯🇵', 'greece': '🇬🇷', 'ireland': '🇮🇪',
  'australia': '🇦🇺', 'canada': '🇨🇦', 'brazil': '🇧🇷', 'thailand': '🇹🇭',

  // Activities/Themes
  'ski': '⛷️', 'skiing': '⛷️', 'snow': '❄️', 'mountain': '🏔️', 'mountains': '🏔️',
  'cruise': '🚢', 'disney': '🏰', 'theme park': '🎢', 'safari': '🦁',
  'wine': '🍷', 'napa': '🍷', 'concert': '🎤', 'music': '🎵', 'festival': '🎪',
  'camping': '🏕️', 'hiking': '🥾', 'adventure': '🧭',
  'spa': '💆', 'wellness': '🧘', 'retreat': '🧘',
  'wedding': '💒', 'honeymoon': '💕', 'anniversary': '💑', 'romantic': '💕',
  'pride': '🏳️‍🌈', 'gay': '🏳️‍🌈',

  // Sports/Events
  'racing': '🏎️', 'indy': '🏎️', 'indianapolis': '🏎️', 'formula': '🏎️',
  'golf': '⛳', 'tennis': '🎾', 'football': '🏈', 'soccer': '⚽',

  // Other
  'road trip': '🚗', 'roadtrip': '🚗', 'cabin': '🏡', 'lake': '🏞️',
  'desert': '🏜️', 'aurora': '🌌', 'northern lights': '🌌',
};

export const travelEmojis = [
  '✈️', '🌴', '🏖️', '🏝️', '🗽', '🗼', '🏰', '🎢', '🚢', '🏔️',
  '⛷️', '🌺', '🎭', '🎤', '🏎️', '🇬🇧', '🇫🇷', '🇮🇹', '🇪🇸', '🇬🇷',
  '🇯🇵', '🇲🇽', '🇧🇷', '🇦🇺', '🏳️‍🌈', '💕', '🎉', '🧭', '🌈', '🦄',
];

export const tripColors = [
  { color: 'from-teal-400 to-cyan-500', accent: 'bg-teal-400' },
  { color: 'from-violet-400 to-purple-500', accent: 'bg-violet-400' },
  { color: 'from-indigo-400 to-blue-500', accent: 'bg-indigo-400' },
  { color: 'from-emerald-400 to-teal-500', accent: 'bg-emerald-400' },
  { color: 'from-cyan-400 to-sky-500', accent: 'bg-cyan-400' },
  { color: 'from-purple-400 to-indigo-500', accent: 'bg-purple-400' },
  { color: 'from-sky-400 to-blue-500', accent: 'bg-sky-400' },
  { color: 'from-blue-500 to-indigo-600', accent: 'bg-blue-500' },
  { color: 'from-fuchsia-400 to-purple-500', accent: 'bg-fuchsia-400' },
  { color: 'from-green-400 to-emerald-500', accent: 'bg-green-400' },
  { color: 'from-lime-400 to-green-500', accent: 'bg-lime-400' },
  { color: 'from-purple-500 to-violet-600', accent: 'bg-purple-500' },
  { color: 'from-indigo-500 to-purple-600', accent: 'bg-indigo-500' },
  { color: 'from-teal-500 to-emerald-600', accent: 'bg-teal-500' },
  { color: 'from-cyan-500 to-blue-600', accent: 'bg-cyan-500' },
];

export const bougieLabels = [
  { level: 1, label: 'Kinda Bougie', emoji: '✨', description: 'Nice but budget-friendly' },
  { level: 2, label: 'Bougie', emoji: '💅', description: 'Treat yourself vibes' },
  { level: 3, label: 'Pretty Bougie', emoji: '🥂', description: 'Splurge-worthy' },
  { level: 4, label: 'Very Bougie', emoji: '💎', description: 'Luxury experience' },
  { level: 5, label: 'Super Bougie', emoji: '👑', description: 'Ultimate indulgence' },
];

export const travelQuotes = [
  { quote: "The world is a book and those who do not travel read only one page.", author: "Saint Augustine" },
  { quote: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { quote: "Life is short and the world is wide.", author: "Simon Raven" },
  { quote: "Adventure is worthwhile.", author: "Aesop" },
  { quote: "Take only memories, leave only footprints.", author: "Chief Seattle" },
  { quote: "Travel far enough, you meet yourself.", author: "David Mitchell" },
  { quote: "Jobs fill your pocket, but adventures fill your soul.", author: "Jaime Lyn Beatty" },
  { quote: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { quote: "To travel is to live.", author: "Hans Christian Andersen" },
  { quote: "Collect moments, not things.", author: "Anonymous" },
  { quote: "Oh the places you'll go!", author: "Dr. Seuss" },
  { quote: "Happiness is planning a trip with someone you love.", author: "Anonymous" },
];

export const achievementDefinitions = [
  { id: 'first_trip', name: 'First Adventure', emoji: '🎉', description: 'Plan your first trip together', condition: (trips) => trips.length >= 1 },
  { id: 'beach_bum', name: 'Beach Bums', emoji: '🏖️', description: 'Plan 3 beach destinations', condition: (trips) => trips.filter(t => ['🏖️', '🌴', '🌺'].includes(t.emoji)).length >= 3 },
  { id: 'city_explorer', name: 'City Explorers', emoji: '🏙️', description: 'Visit 5 major cities', condition: (trips) => trips.filter(t => ['🗽', '🏙️', '🗼', '🌉'].includes(t.emoji)).length >= 5 },
  { id: 'international', name: 'International Travelers', emoji: '🌍', description: 'Plan an international trip', condition: (trips) => trips.some(t => ['🇬🇧', '🇲🇽', '🇬🇷', '🇪🇸', '🇩🇪', '🇯🇵', '🇫🇷', '🇮🇹'].includes(t.emoji)) },
  { id: 'pride_travelers', name: 'Pride Travelers', emoji: '🏳️‍🌈', description: 'Visit 3 LGBTQ+ friendly destinations', condition: (trips) => trips.length >= 3 },
  { id: 'frequent_flyers', name: 'Frequent Flyers', emoji: '✈️', description: 'Plan 10 trips', condition: (trips) => trips.length >= 10 },
  { id: 'cruise_lovers', name: 'Cruise Lovers', emoji: '🚢', description: 'Plan a cruise', condition: (trips) => trips.some(t => t.emoji === '🚢') },
  { id: 'road_warriors', name: 'Road Warriors', emoji: '🚗', description: 'Plan 5 road trips', condition: (trips) => trips.length >= 5 },
  { id: 'luxury_seekers', name: 'Luxury Seekers', emoji: '👑', description: 'Plan a super bougie trip', condition: (trips) => trips.length >= 1 },
  { id: 'memory_makers', name: 'Memory Makers', emoji: '📸', description: 'Add photos to 3 trips', condition: (trips, details) => Object.values(details).filter(d => d.photos?.length > 0).length >= 3 },
  { id: 'planners', name: 'Master Planners', emoji: '📋', description: 'Complete a packing list', condition: (trips, details) => Object.values(details).some(d => d.packingList?.every(i => i.packed)) },
  { id: 'bon_voyage', name: 'Bon Voyage!', emoji: '🦄', description: 'Use the app for a year', condition: () => true },
];

export const eventCategories = {
  'Party': ['🎉', '🥳', '🎊', '🪩', '🎈'],
  'Food': ['🍖', '🍕', '🍽️', '🥘', '🍰', '🧁', '🍷', '🍸', '🥂'],
  'Celebration': ['🎂', '🎁', '💍', '👶', '🎓', '🏆'],
  'Social': ['👥', '🏠', '🎬', '🎮', '🎤', '🎭'],
  'Outdoor': ['🏕️', '🌳', '🏖️', '⛺', '🔥'],
  'Holiday': ['🎃', '🎄', '🦃', '❤️', '🇺🇸', '☘️'],
};

export const defaultPackingItems = [
  { category: 'Essentials', items: ['Passport/ID', 'Wallet', 'Phone & Charger', 'Medications'] },
  { category: 'Clothing', items: ['Underwear', 'Socks', 'Shirts', 'Pants/Shorts', 'Sleepwear'] },
  { category: 'Toiletries', items: ['Toothbrush', 'Toothpaste', 'Deodorant', 'Shampoo', 'Sunscreen'] },
  { category: 'Tech', items: ['Camera', 'Headphones', 'Portable charger', 'Adapters'] },
  { category: 'Extras', items: ['Snacks', 'Books/Kindle', 'Travel pillow', 'Sunglasses'] },
];

export const experienceDatabase = {
  dayTrips: [
    { destination: 'Asheville, NC', emoji: '🏔️', description: 'Artsy mountain town with breweries & galleries', distance: '1.5 hrs', vibes: ['artsy', 'glutenFree'], bougie: 2, highlights: ['River Arts District', 'Biltmore Estate', 'Downtown galleries'] },
    { destination: 'Durham, NC', emoji: '🐂', description: 'Foodie paradise with amazing restaurants', distance: '1 hr', vibes: ['artsy', 'glutenFree'], bougie: 2, highlights: ['Durham Food Hall', 'Duke Gardens', 'American Tobacco Campus'] },
    { destination: 'Charlotte, NC', emoji: '🏙️', description: 'Big city vibes with great food scene', distance: '1.5 hrs', vibes: ['glutenFree'], bougie: 2, highlights: ['NoDa Arts District', 'Uptown', 'Camp North End'] },
    { destination: 'Raleigh, NC', emoji: '🌳', description: 'Museums, gardens & Southern charm', distance: '1 hr', vibes: ['artsy'], bougie: 1, highlights: ['NC Museum of Art', 'Downtown Raleigh', 'Historic Oakwood'] },
    { destination: 'Winston-Salem, NC', emoji: '🎨', description: 'Arts & innovation hub', distance: '30 min', vibes: ['artsy'], bougie: 1, highlights: ['Reynolda House', 'Old Salem', 'Downtown Arts District'] },
    { destination: 'Chapel Hill, NC', emoji: '🎓', description: 'College town with great food & culture', distance: '50 min', vibes: ['artsy', 'glutenFree'], bougie: 1, highlights: ['Franklin Street', 'Carolina Inn', 'Botanical Gardens'] },
    { destination: 'Blowing Rock, NC', emoji: '🍂', description: 'Charming mountain village', distance: '2 hrs', vibes: ['artsy'], bougie: 2, highlights: ['The Blowing Rock', 'Main Street shops', 'Blue Ridge Parkway'] },
    { destination: 'Pinehurst, NC', emoji: '⛳', description: 'Legendary golf resort & spa', distance: '1 hr', vibes: [], bougie: 4, highlights: ['Championship golf', 'Spa treatments', 'Fine dining'] },
    { destination: 'The Umstead (Cary)', emoji: '🧖', description: 'Five-star spa day escape', distance: '1 hr', vibes: ['glutenFree'], bougie: 5, highlights: ['World-class spa', 'Herons restaurant', 'Art collection'] },
  ],
  trainTrips: [
    { destination: 'Washington, DC', emoji: '🏛️', description: 'Museums, monuments & history', duration: '5 hrs via Amtrak', vibes: ['artsy', 'gay'], bougie: 2, highlights: ['Smithsonian museums', 'Dupont Circle', 'U Street'] },
    { destination: 'New York City', emoji: '🗽', description: 'The city that never sleeps', duration: '9 hrs via Amtrak', vibes: ['artsy', 'gay', 'glutenFree'], bougie: 3, highlights: ['Broadway', "Hell's Kitchen", 'Chelsea'] },
    { destination: 'Savannah, GA', emoji: '🌴', description: 'Southern charm & historic squares', duration: '6 hrs via Amtrak', vibes: ['artsy', 'gay'], bougie: 2, highlights: ['Historic District', 'River Street', 'SCAD galleries'] },
    { destination: 'Charleston, SC', emoji: '🏘️', description: 'Historic beauty & amazing food', duration: '4 hrs via Amtrak', vibes: ['artsy', 'glutenFree'], bougie: 3, highlights: ['Rainbow Row', 'King Street', 'Waterfront Park'] },
    { destination: 'New Orleans', emoji: '🎺', description: 'Jazz, food & endless fun', duration: '15 hrs via Amtrak', vibes: ['artsy', 'gay', 'glutenFree'], bougie: 3, highlights: ['French Quarter', 'Marigny', 'Garden District'] },
    { destination: 'NYC First Class', emoji: '🥂', description: 'Amtrak Acela First Class experience', duration: '8 hrs Acela First', vibes: ['artsy', 'gay', 'glutenFree'], bougie: 4, highlights: ['First class lounge', 'Complimentary dining', 'Premium seats'] },
  ],
  cruises: [
    { destination: 'Caribbean Cruise', emoji: '🚢', description: 'Island hopping in paradise', duration: '7 days', vibes: ['gay'], bougie: 2, highlights: ['Beach days', 'Snorkeling', 'Island culture'], ports: ['Cozumel', 'Grand Cayman', 'Jamaica'] },
    { destination: 'Atlantis Caribbean', emoji: '🏳️‍🌈', description: 'The ultimate gay cruise experience', duration: '7 days', vibes: ['gay'], bougie: 4, highlights: ['All-gay experience', 'World-class entertainment', 'Caribbean islands'] },
    { destination: 'Alaska Cruise', emoji: '🐋', description: 'Glaciers, wildlife & stunning scenery', duration: '7 days', vibes: ['artsy'], bougie: 3, highlights: ['Glacier viewing', 'Whale watching', 'Juneau & Ketchikan'] },
    { destination: 'Mediterranean Cruise', emoji: '🏛️', description: 'European history & culture', duration: '10 days', vibes: ['artsy', 'glutenFree'], bougie: 3, highlights: ['Barcelona', 'Rome', 'Greek Islands'] },
    { destination: 'RSVP Caribbean', emoji: '🌈', description: 'All-gay cruise adventure', duration: '7 days', vibes: ['gay'], bougie: 3, highlights: ['Gay-only experience', 'Amazing parties', 'Island excursions'] },
    { destination: 'Virgin Voyages', emoji: '🔥', description: 'Adults-only boutique cruising', duration: '5-7 days', vibes: ['gay', 'glutenFree'], bougie: 4, highlights: ['No kids', 'Tattoo parlor', "Richard's Rooftop"] },
    { destination: 'Regent Seven Seas', emoji: '👑', description: 'Ultra-luxury all-inclusive', duration: '10 days', vibes: ['glutenFree'], bougie: 5, highlights: ['All-suite ships', 'Unlimited shore excursions', 'Butler service'] },
    { destination: 'Silversea Mediterranean', emoji: '🏆', description: 'Intimate luxury expedition', duration: '12 days', vibes: ['artsy', 'glutenFree'], bougie: 5, highlights: ['300 guests max', 'Michelin-level dining', 'All-inclusive'] },
  ],
  flights: [
    { destination: 'Key West, FL', emoji: '🌺', description: "America's most gay-friendly town", vibes: ['gay'], bougie: 2, highlights: ['Duval Street', 'Sunset Pier', 'Historic tours'] },
    { destination: 'Wilton Manors, FL', emoji: '🏳️‍🌈', description: 'Gay village paradise near Fort Lauderdale', vibes: ['gay'], bougie: 2, highlights: ['Wilton Drive', 'Beach days', 'Nightlife'] },
    { destination: 'San Diego, CA', emoji: '🌴', description: 'Perfect weather & Hillcrest gayborhood', vibes: ['gay', 'glutenFree'], bougie: 2, highlights: ['Hillcrest', 'Balboa Park', 'Gaslamp Quarter'] },
    { destination: 'Palm Springs, CA', emoji: '🌵', description: 'Desert oasis & gay resort town', vibes: ['gay', 'glutenFree'], bougie: 3, highlights: ['Pool parties', 'Mid-century architecture', 'Joshua Tree nearby'] },
    { destination: 'Provincetown, MA', emoji: '🏖️', description: 'Ultimate East Coast gay destination', vibes: ['gay', 'artsy'], bougie: 2, highlights: ['Commercial Street', 'Beach time', 'Whale watching'] },
    { destination: 'Fire Island, NY', emoji: '🔥', description: 'Iconic gay beach community', vibes: ['gay'], bougie: 3, highlights: ['Cherry Grove', 'The Pines', 'Beach parties'] },
    { destination: 'Rehoboth Beach, DE', emoji: '🏖️', description: 'Mid-Atlantic gay beach town', vibes: ['gay'], bougie: 1, highlights: ['Beach days', 'Poodle Beach', 'Downtown shops'] },
    { destination: 'Puerto Vallarta, MX', emoji: '🇲🇽', description: "Mexico's gay paradise", vibes: ['gay', 'glutenFree'], bougie: 2, highlights: ['Zona Romántica', 'Beach clubs', 'Malecón'] },
    { destination: 'Santa Fe, NM', emoji: '🎨', description: 'Art galleries & Southwestern culture', vibes: ['artsy', 'glutenFree'], bougie: 3, highlights: ['Canyon Road', "Georgia O'Keeffe Museum", 'Plaza'] },
    { destination: 'Portland, OR', emoji: '🌲', description: 'Weird, wonderful & super GF-friendly', vibes: ['artsy', 'glutenFree', 'gay'], bougie: 2, highlights: ['Food carts', "Powell's Books", 'Alberta Arts District'] },
    { destination: 'Austin, TX', emoji: '🎸', description: 'Live music capital with great food', vibes: ['artsy', 'glutenFree', 'gay'], bougie: 2, highlights: ['6th Street', 'South Congress', 'Live music venues'] },
    { destination: 'Taos, NM', emoji: '🏜️', description: 'Artist colony in the desert', vibes: ['artsy'], bougie: 2, highlights: ['Taos Pueblo', 'Art galleries', 'Rio Grande Gorge'] },
    { destination: 'Marfa, TX', emoji: '✨', description: 'Tiny art town in the desert', vibes: ['artsy'], bougie: 3, highlights: ['Prada Marfa', 'Chinati Foundation', 'Stargazing'] },
    { destination: 'Ojai, CA', emoji: '🧘', description: 'Wellness retreat & artistic haven', vibes: ['artsy', 'glutenFree'], bougie: 4, highlights: ['Spas', 'Art galleries', 'Farm-to-table dining'] },
    { destination: 'Sedona, AZ', emoji: '🔴', description: 'Red rocks & spiritual vibes', vibes: ['artsy', 'glutenFree'], bougie: 3, highlights: ['Vortex sites', 'Hiking', 'Art galleries'] },
    { destination: 'Los Angeles, CA', emoji: '🌟', description: 'Entertainment capital with endless GF options', vibes: ['gay', 'glutenFree', 'artsy'], bougie: 3, highlights: ['WeHo', 'Venice', 'LACMA'] },
    { destination: 'San Francisco, CA', emoji: '🌉', description: 'The Castro & amazing food scene', vibes: ['gay', 'glutenFree', 'artsy'], bougie: 3, highlights: ['The Castro', 'Mission District', 'Golden Gate Park'] },
    { destination: 'Mykonos, Greece', emoji: '🇬🇷', description: 'Greek island gay paradise', vibes: ['gay'], bougie: 4, highlights: ['Beach clubs', 'Windmills', 'Nightlife'] },
    { destination: 'Barcelona, Spain', emoji: '🇪🇸', description: 'Art, architecture & vibrant gay scene', vibes: ['gay', 'artsy', 'glutenFree'], bougie: 3, highlights: ['Eixample (Gayxample)', 'Gaudí architecture', 'La Rambla'] },
    { destination: 'Berlin, Germany', emoji: '🇩🇪', description: 'Edgy art scene & legendary nightlife', vibes: ['gay', 'artsy'], bougie: 2, highlights: ['Schöneberg', 'Museum Island', 'Street art'] },
    { destination: 'Amalfi Coast, Italy', emoji: '🍋', description: 'Stunning cliffside luxury', vibes: ['artsy', 'glutenFree'], bougie: 5, highlights: ['Positano', 'Ravello', 'Capri day trip'] },
    { destination: 'St. Barts', emoji: '🏝️', description: "Caribbean's chicest island", vibes: ['gay'], bougie: 5, highlights: ['Shell Beach', 'Designer shopping', 'Yacht culture'] },
    { destination: 'Bora Bora', emoji: '🏝️', description: 'Overwater bungalow paradise', vibes: [], bougie: 5, highlights: ['Overwater villas', 'Crystal lagoon', 'Private beaches'] },
    { destination: 'Tokyo, Japan', emoji: '🗼', description: 'Culture, food & Ni-chōme nightlife', vibes: ['gay', 'artsy', 'glutenFree'], bougie: 4, highlights: ['Shinjuku Ni-chōme', 'Shibuya', 'Harajuku'] },
    { destination: 'Paris, France', emoji: '🗼', description: 'City of lights & Le Marais', vibes: ['gay', 'artsy', 'glutenFree'], bougie: 4, highlights: ['Le Marais', 'Louvre', 'Montmartre'] },
    { destination: 'Tulum, Mexico', emoji: '🌴', description: 'Bohemian beach luxury', vibes: ['artsy', 'glutenFree', 'gay'], bougie: 4, highlights: ['Beach clubs', 'Cenotes', 'Wellness retreats'] },
  ]
};

// Airlines list for flight forms
export const airlines = [
  'American Airlines', 'Delta', 'United', 'Southwest', 'JetBlue',
  'Alaska Airlines', 'Spirit', 'Frontier', 'Hawaiian Airlines',
  'British Airways', 'Air France', 'Lufthansa', 'Emirates', 'Other'
];

// Owner emails
export const ownerEmails = ['mdulin@gmail.com', 'adamjosephbritten@gmail.com'];

// Calendar months and days
export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ========== SHARED HUB CONSTANTS ==========

export const timeHorizons = [
  { value: 'today', label: 'Today', emoji: '📌' },
  { value: 'this-week', label: 'This Week', emoji: '📅' },
  { value: 'this-month', label: 'This Month', emoji: '🗓️' },
  { value: 'this-quarter', label: 'This Quarter', emoji: '🎯' },
  { value: 'this-year', label: 'This Year', emoji: '⭐' },
  { value: 'someday', label: 'Someday', emoji: '💭' },
];

export const listCategories = [
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'groceries', label: 'Groceries', emoji: '🥛' },
  { value: 'packing', label: 'Packing', emoji: '🧳' },
  { value: 'todo', label: 'To-Do', emoji: '✅' },
  { value: 'custom', label: 'Custom', emoji: '📝' },
];

export const ideaCategories = [
  { value: 'trip', label: 'Trip', emoji: '✈️' },
  { value: 'recipe', label: 'Recipe', emoji: '🍝' },
  { value: 'date', label: 'Date Night', emoji: '🍷' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'gift', label: 'Gift', emoji: '🎁' },
  { value: 'activity', label: 'Activity', emoji: '🎯' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '💡' },
];

export const taskPriorities = [
  { value: 'low', label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'high', label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' },
];

export const taskStatuses = ['pending', 'in-progress', 'done'];
export const ideaStatuses = ['inbox', 'saved', 'planned', 'done'];

export const socialTypes = [
  { value: 'text', label: 'Text', emoji: '💬' },
  { value: 'call', label: 'Call', emoji: '📞' },
  { value: 'meetup', label: 'Meet Up', emoji: '☕' },
  { value: 'gathering', label: 'Gathering', emoji: '🎉' },
  { value: 'invite', label: 'Invite', emoji: '✉️' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { value: 'activity', label: 'Activity', emoji: '🎳' },
  { value: 'other', label: 'Other', emoji: '👋' },
];

export const socialStatuses = ['planned', 'done'];

// ========== HABITS CONSTANTS ==========

export const habitCategories = [
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'relationship', label: 'Relationship', emoji: '💕' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'growth', label: 'Growth', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export const habitFrequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
