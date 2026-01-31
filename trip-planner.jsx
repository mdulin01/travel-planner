import React, { useState, useEffect } from 'react';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, Link, Globe, Loader, LogIn, LogOut, User } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';

// Import your Firebase config
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Rainbow gradient for pride flair
const RainbowBar = () => (
  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
);

// Unicorn emoji component
const Unicorn = ({ className }) => (
  <span className={className}>🦄</span>
);

// Rainbow heart
const RainbowHeart = () => (
  <div className="relative inline-block">
    <Heart className="w-5 h-5 text-pink-400" fill="url(#rainbow-gradient)" />
    <svg width="0" height="0">
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="20%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="80%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const defaultTrips = [
  {
    id: 1,
    destination: 'New York City',
    emoji: '🗽',
    dates: { start: '2026-03-19', end: '2026-03-23' },
    color: 'from-indigo-400 to-blue-500',
    accent: 'bg-indigo-400',
    isWishlist: false,
    coverImage: 'https://picsum.photos/seed/nyc/800/400'
  },
  {
    id: 2,
    destination: 'Indianapolis',
    emoji: '🏎️',
    dates: { start: '2026-04-30', end: '2026-05-06' },
    color: 'from-teal-400 to-cyan-500',
    accent: 'bg-teal-400',
    isWishlist: false,
    coverImage: 'https://picsum.photos/seed/indy/800/400'
  },
  {
    id: 3,
    destination: 'Provincetown',
    emoji: '🏖️',
    dates: { start: '2026-08-01', end: '2026-08-08' },
    color: 'from-emerald-400 to-teal-500',
    accent: 'bg-emerald-400',
    isWishlist: false,
    coverImage: 'https://picsum.photos/seed/beach/800/400'
  },
  {
    id: 4,
    destination: 'London',
    emoji: '🇬🇧',
    dates: { start: '2026-06-13', end: '2026-06-16' },
    color: 'from-violet-400 to-purple-500',
    accent: 'bg-violet-400',
    special: '🎤 Harry Styles Concert!',
    isWishlist: false,
    coverImage: 'https://picsum.photos/seed/london/800/400'
  }
];

const defaultWishlist = [
  {
    id: 100,
    destination: 'Mykonos',
    emoji: '🇬🇷',
    color: 'from-blue-400 to-cyan-400',
    accent: 'bg-blue-400',
    isWishlist: true,
    notes: 'Pride week in June?'
  },
  {
    id: 101,
    destination: 'Puerto Vallarta',
    emoji: '🌴',
    color: 'from-green-400 to-emerald-500',
    accent: 'bg-green-400',
    isWishlist: true,
    notes: 'Zona Romántica!'
  }
];

// Emoji suggestions based on destination keywords
const emojiSuggestions = {
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

const travelEmojis = [
  '✈️', '🌴', '🏖️', '🏝️', '🗽', '🗼', '🏰', '🎢', '🚢', '🏔️',
  '⛷️', '🌺', '🎭', '🎤', '🏎️', '🇬🇧', '🇫🇷', '🇮🇹', '🇪🇸', '🇬🇷',
  '🇯🇵', '🇲🇽', '🇧🇷', '🇦🇺', '🏳️‍🌈', '💕', '🎉', '🧭', '🌈', '🦄',
];

const getEmojiSuggestion = (destination) => {
  if (!destination) return '✈️';
  const lower = destination.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiSuggestions)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✈️';
};

const tripColors = [
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

const initialTripDetails = {
  1: {
    flights: [
      { id: 1, addedBy: 'Mike', airline: 'Delta', flightNo: 'DL 1247', depart: '8:30 AM', arrive: '11:45 AM', date: 'Mar 19' }
    ],
    hotels: [
      { id: 1, addedBy: 'Mike', name: 'The Standard High Line', address: '848 Washington St', checkIn: 'Mar 19', checkOut: 'Mar 23' }
    ],
    events: [
      { id: 1, addedBy: 'Adam', name: 'Broadway Show - Hadestown', time: '7:00 PM', date: 'Mar 20' },
      { id: 2, addedBy: 'Mike', name: 'Brunch at Cafeteria', time: '11:00 AM', date: 'Mar 21' }
    ],
    links: [
      { id: 1, addedBy: 'Mike', url: 'https://www.standardhotels.com/new-york/properties/high-line', title: 'The Standard High Line', description: 'Iconic hotel in the Meatpacking District with stunning views', image: 'https://picsum.photos/seed/hotel/400/300', category: 'hotel' },
      { id: 2, addedBy: 'Adam', url: 'https://hadestown.com', title: 'Hadestown on Broadway', description: 'Tony Award-winning musical', image: 'https://picsum.photos/seed/theater/400/300', category: 'event' }
    ]
  },
  2: { flights: [], hotels: [], events: [], links: [] },
  3: { flights: [], hotels: [], events: [], links: [] },
  4: {
    flights: [],
    hotels: [],
    events: [
      { id: 1, addedBy: 'Adam', name: '🎤 Harry Styles Concert', time: 'TBD', date: 'Jun 14' }
    ],
    links: []
  }
};

// Starburst SVG component for mid-century flair with pulse animation
const Starburst = ({ className, animated = false }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <style>
      {`
        @keyframes starburst-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); transform-origin: center; }
          50% { opacity: 0.4; transform: scale(1.1); transform-origin: center; }
        }
        .starburst-animated {
          animation: starburst-pulse 3s ease-in-out infinite;
        }
        @keyframes ray-pulse {
          0%, 100% { stroke-width: 2; }
          50% { stroke-width: 3; }
        }
        .ray-animated {
          animation: ray-pulse 3s ease-in-out infinite;
        }
      `}
    </style>
    <g className={animated ? 'starburst-animated' : ''}>
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="50"
          x2={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
          y2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={animated ? 'ray-animated' : ''}
          style={animated ? { animationDelay: `${i * 0.1}s` } : {}}
        />
      ))}
      {/* Center circle for pulse effect */}
      {animated && (
        <>
          <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3">
            <animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.5" />
        </>
      )}
    </g>
  </svg>
);

// Animated Anchor component that drops when clicked
const DroppableAnchor = ({ className }) => {
  const [isDropping, setIsDropping] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);

  const handleClick = () => {
    if (!isDropping && !hasDropped) {
      setIsDropping(true);
      setTimeout(() => {
        setHasDropped(true);
        // Reset after a delay so it can be clicked again
        setTimeout(() => {
          setIsDropping(false);
          setHasDropped(false);
        }, 2000);
      }, 1500);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-100 hover:scale-110 ${className}`}
      style={{
        transform: isDropping ? 'translateY(500px) rotate(20deg)' : hasDropped ? 'translateY(500px)' : 'translateY(0)',
        transition: isDropping ? 'transform 1.5s cubic-bezier(0.55, 0, 1, 0.45)' : hasDropped ? 'none' : 'transform 0.3s ease-out',
        opacity: hasDropped ? 0 : 1,
      }}
      title="Click to drop anchor! ⚓"
    >
      <Anchor className="w-12 h-12 text-white/20 hover:text-white/40 transition-colors" />
    </div>
  );
};

// Atomic decoration
const AtomicDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

// Login Component
const LoginScreen = ({ onLogin, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-6">
    <div className="max-w-md w-full">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <span className="text-5xl">🦄</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Bon Voyage!</h1>
        <p className="text-slate-400 mb-8">Mike & Adam's Adventure Planner 💕</p>

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Sign in to sync your trips across devices ✨
        </p>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30">
          <span className="text-xl">🏳️‍🌈</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-300 to-indigo-300 font-medium text-sm">
            Every adventure is better together
          </span>
          <span className="text-xl">💕</span>
        </div>
      </div>
    </div>
  </div>
);

export default function TripPlanner() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // App state
  const [trips, setTrips] = useState(defaultTrips);
  const [wishlist, setWishlist] = useState(defaultWishlist);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(initialTripDetails);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [showAddModal, setShowAddModal] = useState(null);
  const [showNewTripModal, setShowNewTripModal] = useState(null); // 'adventure' or 'wishlist'
  const [showTripMenu, setShowTripMenu] = useState(null); // trip id for menu
  const [showColorPicker, setShowColorPicker] = useState(null); // trip id for color picker
  const [showEmojiEditor, setShowEmojiEditor] = useState(null); // trip id for emoji editor
  const [showImageEditor, setShowImageEditor] = useState(null); // trip id for image editor
  const [showLinkModal, setShowLinkModal] = useState(null); // trip id for link modal
  const [currentUser, setCurrentUser] = useState('Mike');
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Auth effect - listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Determine which user (Mike or Adam) based on email
        const displayName = firebaseUser.email?.includes('mdulin') ? 'Mike' :
                          firebaseUser.displayName || 'Guest';
        setCurrentUser(displayName);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firestore sync - load and listen for changes
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);

    // Subscribe to trips collection
    const tripsUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'shared'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.trips) setTrips(data.trips);
          if (data.wishlist) setWishlist(data.wishlist);
          if (data.tripDetails) setTripDetails(data.tripDetails);
        }
        setDataLoading(false);
      },
      (error) => {
        console.error('Error loading data:', error);
        setDataLoading(false);
      }
    );

    return () => tripsUnsubscribe();
  }, [user]);

  // Save to Firestore whenever data changes
  const saveToFirestore = async (newTrips, newWishlist, newTripDetails) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'tripData', 'shared'), {
        trips: newTrips || trips,
        wishlist: newWishlist || wishlist,
        tripDetails: newTripDetails || tripDetails,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  // Auth handlers
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sort trips by start date
  const sortedTrips = [...trips].sort((a, b) =>
    new Date(a.dates.start) - new Date(b.dates.start)
  );

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const isDateInTrip = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return trips.find(trip => {
      const start = new Date(trip.dates.start);
      const end = new Date(trip.dates.end);
      return checkDate >= start && checkDate <= end;
    });
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const addItem = (tripId, type, item) => {
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        [type]: [...tripDetails[tripId][type], { ...item, id: Date.now(), addedBy: currentUser }]
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
    setShowAddModal(null);
  };

  const removeItem = (tripId, type, itemId) => {
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        [type]: tripDetails[tripId][type].filter(item => item.id !== itemId)
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
  };

  const addNewTrip = (tripData, isWishlist) => {
    const colorSet = tripColors[Math.floor(Math.random() * tripColors.length)];
    const suggestedEmoji = getEmojiSuggestion(tripData.destination);
    const newTrip = {
      id: Date.now(),
      destination: tripData.destination,
      emoji: tripData.emoji || suggestedEmoji || '✈️',
      dates: isWishlist ? null : { start: tripData.startDate, end: tripData.endDate },
      ...colorSet,
      isWishlist,
      notes: tripData.notes || '',
      special: tripData.special || ''
    };

    if (isWishlist) {
      const newWishlist = [...wishlist, newTrip];
      setWishlist(newWishlist);
      saveToFirestore(null, newWishlist, null);
    } else {
      const newTrips = [...trips, newTrip];
      const newTripDetails = {
        ...tripDetails,
        [newTrip.id]: { flights: [], hotels: [], events: [], links: [] }
      };
      setTrips(newTrips);
      setTripDetails(newTripDetails);
      saveToFirestore(newTrips, null, newTripDetails);
    }
    setShowNewTripModal(null);
  };

  const convertToAdventure = (wishlistItem) => {
    // Remove from wishlist, will need dates added
    setShowNewTripModal({ type: 'convert', item: wishlistItem });
  };

  const updateTripDates = (tripId, newStart, newEnd) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, dates: { start: newStart, end: newEnd } }
        : trip
    );
    setTrips(newTrips);
    saveToFirestore(newTrips, null, null);
  };

  const deleteTrip = (tripId) => {
    const newTrips = trips.filter(trip => trip.id !== tripId);
    setTrips(newTrips);
    saveToFirestore(newTrips, null, null);
    setShowTripMenu(null);
  };

  const updateTripColor = (tripId, colorSet) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, color: colorSet.color, accent: colorSet.accent }
        : trip
    );
    setTrips(newTrips);
    saveToFirestore(newTrips, null, null);
    setShowColorPicker(null);
    setShowTripMenu(null);
  };

  const updateTripEmoji = (tripId, emoji) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, emoji }
        : trip
    );
    setTrips(newTrips);
    saveToFirestore(newTrips, null, null);
    setShowEmojiEditor(null);
    setShowTripMenu(null);
  };

  const updateTripCoverImage = (tripId, imageUrl) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, coverImage: imageUrl }
        : trip
    );
    setTrips(newTrips);
    saveToFirestore(newTrips, null, null);
    setShowImageEditor(null);
    setShowTripMenu(null);
  };

  const addLink = (tripId, linkData) => {
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        links: [...(tripDetails[tripId]?.links || []), { ...linkData, id: Date.now(), addedBy: currentUser }]
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
  };

  const removeLink = (tripId, linkId) => {
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        links: tripDetails[tripId].links.filter(link => link.id !== linkId)
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
  };

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={authLoading} />;
  }

  // New Trip Modal Component
  const NewTripModal = ({ type, onClose }) => {
    const [formData, setFormData] = useState(
      type.item ? { destination: type.item.destination, emoji: type.item.emoji } : {}
    );
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const isWishlist = type === 'wishlist';
    const isConvert = type.type === 'convert';

    // Auto-suggest emoji when destination changes
    const handleDestinationChange = (value) => {
      const suggestedEmoji = getEmojiSuggestion(value);
      setFormData({
        ...formData,
        destination: value,
        emoji: formData.emoji || suggestedEmoji
      });
    };

    const currentEmoji = formData.emoji || getEmojiSuggestion(formData.destination) || '✈️';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
          <div className="flex justify-between items-center mb-6 mt-2">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {isWishlist ? '🦄 Dream Destination' : isConvert ? '✨ Make It Real!' : '🌈 New Adventure'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Destination"
              value={formData.destination || ''}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => handleDestinationChange(e.target.value)}
            />

            {/* Emoji Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Trip Icon</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-14 h-14 text-3xl bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition border-2 border-slate-200"
                >
                  {currentEmoji}
                </button>
                <div className="text-sm text-slate-500">
                  {formData.destination && !formData.emoji && (
                    <span className="text-purple-500">✨ Auto-suggested based on destination</span>
                  )}
                  {!formData.destination && <span>Click to choose an icon</span>}
                </div>
              </div>

              {/* Emoji Picker Grid */}
              {showEmojiPicker && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-10 gap-1">
                    {travelEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, emoji });
                          setShowEmojiPicker(false);
                        }}
                        className={`w-8 h-8 text-xl rounded-lg hover:bg-purple-100 transition flex items-center justify-center ${
                          currentEmoji === emoji ? 'bg-purple-200 ring-2 ring-purple-400' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">Or type any emoji in the box below</p>
                  <input
                    type="text"
                    placeholder="Type or paste emoji..."
                    value={formData.emoji || ''}
                    className="w-full mt-2 px-3 py-2 text-center border border-slate-200 rounded-lg focus:border-purple-400 outline-none"
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  />
                </div>
              )}
            </div>
            {!isWishlist && (
              <>
                <input
                  type="date"
                  placeholder="Start Date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </>
            )}
            {!isWishlist && (
              <input
                type="text"
                placeholder="Special occasion? (optional)"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setFormData({ ...formData, special: e.target.value })}
              />
            )}
            {isWishlist && (
              <input
                type="text"
                placeholder="Notes / Dreams (optional)"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            )}
            <button
              onClick={() => {
                if (isConvert) {
                  // Remove from wishlist and add as trip
                  const newWishlist = wishlist.filter(w => w.id !== type.item.id);
                  setWishlist(newWishlist);
                  saveToFirestore(null, newWishlist, null);
                }
                // Use currentEmoji which includes auto-suggested emoji
                addNewTrip({ ...formData, emoji: currentEmoji }, isWishlist);
              }}
              className="w-full py-3 bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isWishlist ? 'Add to Wishlist' : isConvert ? 'Book This Dream!' : 'Add Adventure'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              💡 Tip: Type a destination and we'll suggest an icon!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add Modal Component
  const AddModal = ({ type, tripId, onClose }) => {
    const [formData, setFormData] = useState({});

    const fields = {
      flights: ['airline', 'flightNo', 'depart', 'arrive', 'date'],
      hotels: ['name', 'address', 'checkIn', 'checkOut'],
      events: ['name', 'time', 'date']
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 capitalize">Add {type.slice(0, -1)}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {fields[type].map(field => (
              <input
                key={field}
                type="text"
                placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            ))}
            <button
              onClick={() => addItem(tripId, type, formData)}
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition"
            >
              Add to Trip ✨
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Link Modal Component
  const LinkModal = ({ tripId, onClose }) => {
    const [linkData, setLinkData] = useState({ url: '', title: '', description: '', image: '', category: 'other' });
    const [isLoading, setIsLoading] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

    const categories = [
      { value: 'hotel', label: '🏨 Hotel', icon: Hotel },
      { value: 'flight', label: '✈️ Flight', icon: Plane },
      { value: 'event', label: '🎭 Event', icon: Music },
      { value: 'restaurant', label: '🍽️ Restaurant', icon: MapPin },
      { value: 'attraction', label: '🎡 Attraction', icon: Star },
      { value: 'other', label: '🔗 Other', icon: Link }
    ];

    // Simple URL preview - in a real app this would call a backend service
    const fetchPreview = async () => {
      if (!linkData.url) return;
      setIsLoading(true);
      // Simulate loading - in production, you'd call an API to fetch metadata
      setTimeout(() => {
        // Auto-detect category from URL
        const url = linkData.url.toLowerCase();
        let category = 'other';
        if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb') || url.includes('marriott') || url.includes('hilton')) {
          category = 'hotel';
        } else if (url.includes('airline') || url.includes('delta') || url.includes('united') || url.includes('flight')) {
          category = 'flight';
        } else if (url.includes('ticketmaster') || url.includes('broadway') || url.includes('concert') || url.includes('event')) {
          category = 'event';
        } else if (url.includes('yelp') || url.includes('opentable') || url.includes('restaurant')) {
          category = 'restaurant';
        }
        setLinkData(prev => ({ ...prev, category }));
        setIsLoading(false);
        setPreviewLoaded(true);
      }, 500);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Link className="w-6 h-6 text-purple-500" />
              Add Link
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkData.url}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                />
                <button
                  onClick={fetchPreview}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition flex items-center gap-1"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Fetch
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setLinkData({ ...linkData, category: cat.value })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      linkData.category === cat.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g., The Standard Hotel"
                value={linkData.title}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Description (optional)</label>
              <input
                type="text"
                placeholder="Brief description..."
                value={linkData.description}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Image URL (optional)</label>
              <input
                type="url"
                placeholder="https://... (paste image URL)"
                value={linkData.image}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setLinkData({ ...linkData, image: e.target.value })}
              />
              {linkData.image && (
                <div className="mt-2 relative">
                  <img src={linkData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">Tip: Right-click an image on website → "Copy image address", or use picsum.photos/seed/keyword/400/300</p>
            </div>

            {/* Submit */}
            <button
              onClick={() => {
                if (linkData.url && linkData.title) {
                  addLink(tripId, linkData);
                  onClose();
                }
              }}
              disabled={!linkData.url || !linkData.title}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Link className="w-5 h-5" />
              Add Link to Trip
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Trip Detail View
  const TripDetail = ({ trip }) => {
    const details = tripDetails[trip.id] || { flights: [], hotels: [], events: [], links: [] };
    const [isEditingDates, setIsEditingDates] = useState(false);
    const [editedStart, setEditedStart] = useState(trip.dates.start);
    const [editedEnd, setEditedEnd] = useState(trip.dates.end);

    const handleSaveDates = () => {
      updateTripDates(trip.id, editedStart, editedEnd);
      // Update the selected trip to reflect changes
      setSelectedTrip({ ...trip, dates: { start: editedStart, end: editedEnd } });
      setIsEditingDates(false);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 z-40 overflow-auto">
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${trip.color} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-6`}>
              <AtomicDots />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsEditingDates(!isEditingDates)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                  title="Edit dates"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-6xl mb-4">{trip.emoji}</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>

              {isEditingDates ? (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <input
                    type="date"
                    value={editedStart}
                    onChange={(e) => setEditedStart(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  />
                  <span className="text-white/80">to</span>
                  <input
                    type="date"
                    value={editedEnd}
                    onChange={(e) => setEditedEnd(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  />
                  <button
                    onClick={handleSaveDates}
                    className="flex items-center gap-1 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-lg font-medium transition"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-xl opacity-90">
                  {new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}

              {trip.special && (
                <div className="mt-4 inline-block px-4 py-2 bg-white/20 rounded-full text-lg font-semibold">
                  {trip.special}
                </div>
              )}
              <Starburst className="absolute -right-10 -bottom-10 w-40 h-40 text-white/20" />
            </div>

            {/* Sections */}
            {['flights', 'hotels', 'events'].map(type => (
              <div key={type} className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {type === 'flights' && <Plane className="w-6 h-6 text-indigo-500" />}
                    {type === 'hotels' && <Hotel className="w-6 h-6 text-teal-500" />}
                    {type === 'events' && <Music className="w-6 h-6 text-purple-500" />}
                    <h3 className="text-2xl font-bold text-slate-800 capitalize">{type}</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(type)}
                    className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {details[type].length === 0 ? (
                  <p className="text-slate-400 italic">No {type} added yet. Click + to add!</p>
                ) : (
                  <div className="space-y-3">
                    {details[type].map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                        <div>
                          <div className="font-semibold text-slate-800">
                            {item.name || `${item.airline} ${item.flightNo}`}
                          </div>
                          <div className="text-sm text-slate-500">
                            {type === 'flights' && `${item.date} • ${item.depart} → ${item.arrive}`}
                            {type === 'hotels' && `${item.checkIn} - ${item.checkOut} • ${item.address}`}
                            {type === 'events' && `${item.date} at ${item.time}`}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Added by {item.addedBy}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(trip.id, type, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-full transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Links Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link className="w-6 h-6 text-purple-500" />
                  <h3 className="text-2xl font-bold text-slate-800">Links & Resources</h3>
                </div>
                <button
                  onClick={() => setShowLinkModal(trip.id)}
                  className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(!details.links || details.links.length === 0) ? (
                <p className="text-slate-400 italic">No links added yet. Add hotel bookings, event tickets, and more!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.links.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex bg-slate-50 rounded-2xl overflow-hidden group hover:shadow-md transition"
                    >
                      {link.image && (
                        <div className="w-24 h-24 flex-shrink-0">
                          <img src={link.image} alt={link.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full capitalize">
                                {link.category}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-800 truncate group-hover:text-purple-600 transition">
                              {link.title}
                            </div>
                            {link.description && (
                              <div className="text-sm text-slate-500 truncate">{link.description}</div>
                            )}
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Added by {link.addedBy}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeLink(trip.id, link.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded-full transition flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {showAddModal && <AddModal type={showAddModal} tripId={trip.id} onClose={() => setShowAddModal(null)} />}
        {showLinkModal === trip.id && <LinkModal tripId={trip.id} onClose={() => setShowLinkModal(null)} />}
      </div>
    );
  };

  const closeMenus = () => {
    setShowTripMenu(null);
    setShowColorPicker(null);
    setShowEmojiEditor(null);
    setShowImageEditor(null);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden"
      onClick={closeMenus}
    >
      {/* Rainbow top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
        <Starburst className="absolute top-10 right-20 w-24 h-24 text-cyan-400" animated={true} />
        <Starburst className="absolute bottom-40 left-20 w-16 h-16 text-teal-400/30" />
        <Sun className="absolute bottom-20 left-40 w-16 h-16 text-purple-400/10" />
        <span className="absolute top-32 left-1/4 text-4xl opacity-10">🦄</span>
        <span className="absolute bottom-48 right-1/3 text-3xl opacity-10">🌈</span>
        <span className="absolute top-1/2 right-20 text-2xl opacity-10">✨</span>
      </div>

      {/* Interactive Anchor - outside pointer-events-none container */}
      <DroppableAnchor className="absolute top-40 right-40 z-10" />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg relative">
                <span className="text-3xl">🦄</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Bon Voyage! <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">✈️</span>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  Mike & Adam's Adventure Planner
                  <span className="text-purple-400">💕</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* User info and logout */}
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-white/70" />
                )}
                <span className="text-white/70 text-sm">{currentUser}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 text-white/50 hover:text-white transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* User Toggle */}
              <div className="flex items-center bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setCurrentUser('Mike')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentUser === 'Mike' ? 'bg-teal-400 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  Mike
                </button>
                <button
                  onClick={() => setCurrentUser('Adam')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentUser === 'Adam' ? 'bg-purple-400 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  Adam
                </button>
              </div>

              {/* Google Calendar Connect */}
              <button
                onClick={() => setCalendarConnected(!calendarConnected)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${calendarConnected ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Calendar className="w-4 h-4" />
                {calendarConnected ? 'Calendar Synced ✓' : 'Connect Google Calendar'}
              </button>
            </div>
          </div>

          {/* Sync status indicator */}
          {dataLoading && (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setShowNewTripModal('adventure')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Adventure
            </button>
            <button
              onClick={() => setShowNewTripModal('wishlist')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Add to Wishlist 🦄
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">

          {/* Trip Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-cyan-400" />
              Our Adventures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedTrips.map(trip => (
                <div
                  key={trip.id}
                  className={`bg-gradient-to-br ${trip.color} rounded-3xl text-white text-left relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl`}
                >
                  {/* Cover Image */}
                  {trip.coverImage && (
                    <div className="h-28 w-full overflow-hidden">
                      <img
                        src={trip.coverImage}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className={`p-6 ${trip.coverImage ? 'pt-4' : ''}`}>
                  <AtomicDots />

                  {/* 3-dot menu button */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTripMenu(showTripMenu === trip.id ? null : trip.id);
                        setShowColorPicker(null);
                        setShowEmojiEditor(null);
                        setShowImageEditor(null);
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showTripMenu === trip.id && (
                      <div className="absolute top-8 right-0 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEmojiEditor(trip.id);
                            setShowColorPicker(null);
                            setShowImageEditor(null);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm"
                        >
                          <span className="text-lg">😀</span>
                          Change Icon
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColorPicker(trip.id);
                            setShowEmojiEditor(null);
                            setShowImageEditor(null);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm"
                        >
                          <Palette className="w-4 h-4" />
                          Change Color
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageEditor(trip.id);
                            setShowColorPicker(null);
                            setShowEmojiEditor(null);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm"
                        >
                          <Image className="w-4 h-4" />
                          {trip.coverImage ? 'Change Photo' : 'Add Photo'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete trip to ${trip.destination}?`)) {
                              deleteTrip(trip.id);
                            }
                          }}
                          className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 text-sm border-t"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Trip
                        </button>
                      </div>
                    )}

                    {/* Color Picker */}
                    {showColorPicker === trip.id && (
                      <div className="absolute top-8 right-0 w-48 bg-white rounded-xl shadow-xl p-3 z-30">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Choose a color</p>
                        <div className="grid grid-cols-4 gap-2">
                          {tripColors.map((colorSet, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTripColor(trip.id, colorSet);
                              }}
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorSet.color} hover:scale-110 transition ${
                                trip.color === colorSet.color ? 'ring-2 ring-white ring-offset-2' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emoji Editor */}
                    {showEmojiEditor === trip.id && (
                      <div className="absolute top-8 right-0 w-56 bg-white rounded-xl shadow-xl p-3 z-30">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Choose an icon</p>
                        <div className="grid grid-cols-6 gap-1 mb-2">
                          {travelEmojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTripEmoji(trip.id, emoji);
                              }}
                              className={`w-8 h-8 text-lg rounded-lg hover:bg-purple-100 transition flex items-center justify-center ${
                                trip.emoji === emoji ? 'bg-purple-200 ring-2 ring-purple-400' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Or type emoji..."
                          className="w-full px-2 py-1 text-sm text-center border border-slate-200 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateTripEmoji(trip.id, e.target.value);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Image Editor */}
                    {showImageEditor === trip.id && (
                      <div className="absolute top-8 right-0 w-72 bg-white rounded-xl shadow-xl p-3 z-30">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Add a cover photo</p>
                        {trip.coverImage && (
                          <div className="mb-2 relative">
                            <img src={trip.coverImage} alt="Current cover" className="w-full h-20 object-cover rounded-lg" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTripCoverImage(trip.id, null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-purple-400 outline-none"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              updateTripCoverImage(trip.id, e.target.value);
                            }
                          }}
                        />
                        <p className="text-xs text-slate-400 mt-2">Press Enter to save. Try: picsum.photos/seed/yourword/800/400</p>
                      </div>
                    )}
                  </div>

                  {/* Clickable card content */}
                  <button
                    onClick={() => {
                      if (!showTripMenu && !showColorPicker && !showEmojiEditor && !showImageEditor) {
                        setSelectedTrip(trip);
                      }
                    }}
                    className="w-full text-left relative z-10"
                  >
                    <div className="text-4xl mb-3">{trip.emoji}</div>
                    <h3 className="text-xl font-bold mb-1">{trip.destination}</h3>
                    <p className="text-white/80 text-sm">
                      {new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {trip.special && (
                      <div className="mt-3 text-sm font-semibold bg-white/20 inline-block px-3 py-1 rounded-full">
                        {trip.special}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition">
                      <span>Plan this trip</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                  <Starburst className="absolute -right-6 -bottom-6 w-24 h-24 text-white/10 group-hover:rotate-45 transition-transform duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Calendar Section */}
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-400" />
                Travel Calendar
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-semibold min-w-[140px] text-center">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {days.map(day => (
                <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const tripOnDate = isDateInTrip(day);
                return (
                  <button
                    key={day}
                    onClick={() => tripOnDate && setSelectedTrip(tripOnDate)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition ${
                      tripOnDate
                        ? `bg-gradient-to-br ${tripOnDate.color} text-white hover:scale-110 cursor-pointer shadow-lg`
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
              {sortedTrips.map(trip => (
                <div key={trip.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${trip.accent}`} />
                  <span className="text-slate-400 text-sm">{trip.destination}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Wishlist Section */}
          {wishlist.length > 0 && (
            <section className="mt-12 mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-3xl">🦄</span>
                Dream Destinations
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400">✨</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400" />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <h3 className="text-xl font-bold text-white mb-1">{item.destination}</h3>
                        {item.notes && (
                          <p className="text-slate-400 text-sm">{item.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => convertToAdventure(item)}
                        className="px-3 py-1.5 bg-gradient-to-r from-teal-400 to-purple-400 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        Book it! 🎉
                      </button>
                    </div>
                    <Starburst className="absolute -right-4 -bottom-4 w-16 h-16 text-white/5" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Love Note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30">
              <span className="text-xl">🏳️‍🌈</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-300 to-indigo-300 font-medium">
                Every adventure is better with you, Adam
              </span>
              <span className="text-xl">💕</span>
            </div>
            <p className="text-slate-500 text-sm mt-3">Made with love in 2026 🦄</p>
          </div>
        </div>
      </main>

      {/* Trip Detail Modal */}
      {selectedTrip && <TripDetail trip={selectedTrip} />}

      {/* New Trip Modal */}
      {showNewTripModal && (
        <NewTripModal
          type={showNewTripModal}
          onClose={() => setShowNewTripModal(null)}
        />
      )}

      {/* Bottom rainbow bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
    </div>
  );
}
