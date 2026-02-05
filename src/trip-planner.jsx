import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, Link, Globe, Loader, LogIn, LogOut, User, UserPlus, Share2, Upload, Folder, Edit3, CheckSquare } from 'lucide-react';

// Import constants and utilities
import {
  emojiSuggestions, travelEmojis, tripColors, bougieLabels, travelQuotes,
  achievementDefinitions, eventCategories, defaultPackingItems, experienceDatabase,
  airlines, ownerEmails, months, days, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES
} from './constants';
import {
  parseLocalDate, formatDate, validateFileSize, getEmojiSuggestion,
  getRandomExperience, getDaysInMonth, isHeicFile, getSafeFileName,
  getCompanionDisplayName
} from './utils';

// Component imports
import AddModal from './components/AddModal';
import LoginScreen from './components/LoginScreen';
import NewTripModal from './components/NewTripModal';
import RandomExperienceModal from './components/RandomExperienceModal';
import LinkModal from './components/LinkModal';
import GuestModal from './components/GuestModal';
import OpenDateModal from './components/OpenDateModal';
import CompanionsModal from './components/CompanionsModal';
import MyProfileModal from './components/MyProfileModal';
import TripDetail from './components/TripDetail';

// Firebase imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import heic2any from 'heic2any';

// Import your Firebase config
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
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
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop',
    guests: [] // Just Mike & Adam
  },
  {
    id: 2,
    destination: 'Indianapolis',
    emoji: '🏎️',
    dates: { start: '2026-04-30', end: '2026-05-06' },
    color: 'from-teal-400 to-cyan-500',
    accent: 'bg-teal-400',
    isWishlist: false,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    guests: [
      { id: 1, name: 'Josh', email: 'josh@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Son' },
      { id: 2, name: 'Liam', email: 'liam@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Son' }
    ]
  },
  {
    id: 3,
    destination: 'Provincetown',
    emoji: '🏖️',
    dates: { start: '2026-08-01', end: '2026-08-08' },
    color: 'from-emerald-400 to-teal-500',
    accent: 'bg-emerald-400',
    isWishlist: false,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    guests: [
      { id: 1, name: 'Rhett', email: 'rhett@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 2, name: 'Carl', email: 'carl@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 3, name: 'Frankie', email: 'frankie@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 4, name: 'Anthony', email: 'anthony@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 5, name: 'Glen', email: 'glen@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 6, name: 'Jason', email: 'jason@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
      { id: 7, name: 'Rusty', email: 'rusty@example.com', role: 'guest', addedBy: 'Adam', relationship: 'Friend' },
      { id: 8, name: 'Jimmy', email: 'jimmy@example.com', role: 'guest', addedBy: 'Mike', relationship: 'Friend' },
    ]
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
    isPlanning: true, // Trip is in planning stage
    theme: 'Harry Styles Concert',
    expectedDuration: '3-4 days',
    planningLinks: [
      { id: 1, title: 'Harry Styles Wembley Tickets', url: 'https://www.ticketmaster.co.uk', type: 'event' },
      { id: 2, title: 'The Londoner Hotel', url: 'https://www.thelondoner.com', type: 'hotel' },
    ],
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop',
    guests: [] // Just Mike & Adam
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

// Regular travel companions who have calendar access
const defaultCompanions = [
  { id: 'kate', firstName: 'Kate', lastName: '', email: 'kate@example.com', phone: '', relationship: 'Friend', color: 'from-pink-400 to-rose-500' },
  { id: 'chris', firstName: 'Chris', lastName: '', email: 'chris@example.com', phone: '', relationship: 'Friend', color: 'from-blue-400 to-indigo-500' },
  { id: 'joe', firstName: 'Joe', lastName: 'Dulin', email: 'joe@example.com', phone: '', relationship: 'Brother', color: 'from-green-400 to-emerald-500' },
  { id: 'ryan', firstName: 'Ryan', lastName: '', email: 'ryan@example.com', phone: '', relationship: 'Cousin', color: 'from-amber-400 to-orange-500' },
  { id: 'josh', firstName: 'Josh', lastName: 'Dulin', email: 'josh@example.com', phone: '', relationship: 'Son', color: 'from-purple-400 to-violet-500' },
  { id: 'liam', firstName: 'Liam', lastName: 'Dulin', email: 'liam@example.com', phone: '', relationship: 'Son', color: 'from-cyan-400 to-teal-500' },
];

// Default open for travel dates
const defaultOpenDates = [
  {
    id: 1,
    start: '2026-02-14',
    end: '2026-02-17',
    note: 'Presidents Day Weekend',
    visibleTo: ['all'], // 'all' or array of companion ids
  },
  {
    id: 2,
    start: '2026-05-22',
    end: '2026-05-25',
    note: 'Memorial Day Weekend',
    visibleTo: ['all'],
  },
  {
    id: 3,
    start: '2026-07-03',
    end: '2026-07-05',
    note: '4th of July',
    visibleTo: ['joe', 'ryan', 'josh', 'liam'], // Family only
  },
  {
    id: 4,
    start: '2026-09-05',
    end: '2026-09-07',
    note: 'Labor Day Weekend',
    visibleTo: ['kate', 'chris'], // Friends only
  },
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
    ],
    packingList: [
      { id: 1, item: 'Passport', packed: true, addedBy: 'Mike' },
      { id: 2, item: 'Broadway tickets', packed: false, addedBy: 'Adam' },
    ],
    budget: {
      total: 3500,
      expenses: [
        { id: 1, description: 'Hotel (4 nights)', amount: 1200, paidBy: 'Mike', category: 'lodging' },
        { id: 2, description: 'Flights', amount: 600, paidBy: 'Adam', category: 'transport' },
        { id: 3, description: 'Broadway tickets', amount: 400, paidBy: 'Adam', category: 'entertainment' },
      ]
    },
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', caption: 'NYC Skyline', addedBy: 'Mike' },
    ],
    places: [
      { id: 1, name: 'Cafeteria', type: 'restaurant', address: '119 7th Ave', addedBy: 'Mike', visited: false },
      { id: 2, name: 'The High Line', type: 'activity', address: 'Gansevoort St', addedBy: 'Adam', visited: false },
    ],
    notes: 'Remember to pack warm layers - March in NYC can be chilly! Also check if we need to book the rooftop bar in advance. 💕'
  },
  2: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], places: [], notes: '' },
  3: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], places: [], notes: '' },
  4: {
    flights: [],
    hotels: [],
    events: [
      { id: 1, addedBy: 'Adam', name: '🎤 Harry Styles Concert', time: 'TBD', date: 'Jun 14' }
    ],
    links: [],
    packingList: [
      { id: 1, item: 'Concert outfit', packed: false, addedBy: 'Adam' },
      { id: 2, item: 'Rainbow flag', packed: false, addedBy: 'Mike' },
    ],
    budget: { total: 2000, expenses: [] },
    photos: [],
    places: [],
    notes: 'OMG HARRY! 🎤✨'
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


export default function TripPlanner() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

  // Track component mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Show toast helper
  const showToast = useCallback((message, type = 'info') => {
    if (!isMountedRef.current) return;
    setToast({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 4000);
  }, []);

  // Main section navigation
  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'travel' | 'fitness' | 'nutrition' | 'events' | 'lifePlanning' | 'business' | 'memories'
  const [memoriesView, setMemoriesView] = useState('timeline'); // 'timeline' | 'events' | 'media'

  // Memories state - imported from memories_data.xlsx
  const [memories, setMemories] = useState([
    { id: 128, category: 'concert', date: '2025-02-26', title: 'Shucked', description: 'Yea Haw!', icon: '🎭', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
    { id: 2, category: 'datenight', date: '2025-03-02', title: 'First Date', description: 'Brunch, Sage Mule ✨', icon: '🥂', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 17, category: 'karaoke', date: '2025-03-03', title: 'First Playlist', description: 'Mike made Adam a playlist with Dolly Parton 🎶', icon: '🎤', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 3, category: 'datenight', date: '2025-03-12', title: 'First Sleepover', description: 'Second date magic 💫', icon: '🌙', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 24, category: 'datenight', date: '2025-03-12', title: 'Second Date', description: 'Lucky 32', icon: '🥂', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 23, category: 'datenight', date: '2025-03-15', title: 'Third Date', description: 'Arcade, Funny Business', icon: '🎆', location: 'Winston-Salem, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 6, category: 'travel', date: '2025-04-11', title: 'Travel to Ashville', description: 'Hot Tub, Firestarter', icon: '🗽', location: 'Ashville, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 125, category: 'datenight', date: '2025-04-19', title: 'Friendly Nails', description: 'Mani/Pedi', icon: '🏳️‍🌈', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
    { id: 4, category: 'datenight', date: '2025-05-17', title: 'Becoming Official', description: 'Champagne, flowers, and a big question 💐', icon: '❤️', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 8, category: 'datenight', date: '2025-05-21', title: 'Greenvally Grill', description: 'Fancy Dinner', icon: '🌴', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 9, category: 'datenight', date: '2025-06-02', title: 'White and Wood', description: 'First Downtown Datenight', icon: '🌊', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
    { id: 7, category: 'travel', date: '2025-06-12', title: 'Meeting the Family', description: "Trip to NY to meet Adam's family and new nephew", icon: '👨‍👩‍👦', location: 'New York', image: '', link: '', comment: '', isFirstTime: true },
    { id: 13, category: 'concert', date: '2025-06-14', title: 'Boop', description: 'Broadway magic in NYC', icon: '🎭', location: 'New York City', image: '', link: '', comment: '', isFirstTime: true },
    { id: 129, category: 'travel', date: '2025-06-16', title: 'Mercer Labs', description: "Ball pit for adults? I'm in!", icon: '🗽', location: 'New York City', image: '', link: '', comment: '', isFirstTime: false },
    { id: 5, category: 'datenight', date: '2025-06-29', title: 'I Love You', description: 'Some Like It Hot', icon: '❤️', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 14, category: 'datenight', date: '2025-07-15', title: 'Lucky 32', description: 'Funky Music and GF Meatloaf', icon: '🎬', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
    { id: 18, category: 'travel', date: '2025-07-19', title: "Mike's First Cruise", description: 'Disney Caribbean Cruise', icon: '🚢', location: 'Ft. Lauderdale', image: '', link: '', comment: '', isFirstTime: true },
    { id: 12, category: 'fitness', date: '2025-07-21', title: 'Adam Graduates!', description: 'Sonography school complete! 🎓', icon: '🎓', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 127, category: 'concert', date: '2025-07-31', title: 'Dolly Nashville Show', description: 'Where was the real Dolly?', icon: '🎭', location: 'Nashville, TN', image: '', link: '', comment: '', isFirstTime: false },
    { id: 11, category: 'travel', date: '2025-08-01', title: 'Ptown (Triple Trip), Nashville, Boston', description: 'Seasick Together', icon: '🎆', location: 'Provincetown, MA', image: '', link: '', comment: '', isFirstTime: true },
    { id: 15, category: 'datenight', date: '2025-08-04', title: 'Printworks', description: 'Fancy Dinner', icon: '🎵', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 16, category: 'pride', date: '2025-09-20', title: 'Greensboro Pride Festival', description: 'Rainbow flags and community love, train trip to Raleigh 🏳️‍🌈', icon: '🏳️‍🌈', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 19, category: 'concert', date: '2025-09-25', title: 'Beauty and The Beast', description: 'Tanger Center Season Tickets', icon: '🎭', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 20, category: 'travel', date: '2025-10-03', title: 'Anaheim and Vegas Road Trip', description: "Don't Let it Rain on your parade", icon: '🏳️‍🌈', location: 'Anaheim, CA', image: '', link: '', comment: '', isFirstTime: true },
    { id: 21, category: 'travel', date: '2025-10-16', title: 'DC for Work/Fun', description: 'DC Gay Bars', icon: '🏳️‍🌈', location: 'Washington DC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 22, category: 'concert', date: '2025-10-29', title: 'Depeche Mode Movie', description: 'First Movie', icon: '🎬', location: 'High Point, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 130, category: 'concert', date: '2025-10-30', title: 'The Wiz', description: 'Tanger Center', icon: '🎭', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: true },
    { id: 10, category: 'travel', date: '2025-11-12', title: 'Miami Cruise Trip', description: 'Yacht Club Caribbean', icon: '🚢', location: 'Miami, FL', image: '', link: '', comment: '', isFirstTime: true },
    { id: 25, category: 'datenight', date: '2025-12-11', title: 'The Outsiders', description: 'Tanger Center Season Tickets', icon: '🎵', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
    { id: 126, category: 'concert', date: '2025-12-17', title: 'Dolly Christmas Show', description: 'Looking good in the new Christmas shirt', icon: '🎵', location: 'Greensboro, NC', image: '', link: '', comment: '', isFirstTime: false },
  ]);
  const [editingMemory, setEditingMemory] = useState(null); // memory object being edited
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(null); // category for new memory
  const [newMemoryData, setNewMemoryData] = useState({
    title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingToMemoryId, setUploadingToMemoryId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragOverMemoryId, setDragOverMemoryId] = useState(null);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [dismissedEmojis, setDismissedEmojis] = useState(new Set());

  // Get all images for a memory (backward compatible with old 'image' field)
  const getMemoryImages = (memory) => {
    const images = memory.images || [];
    if (memory.image && !images.includes(memory.image)) {
      return [memory.image, ...images];
    }
    return images;
  };

  // Get a random image for display (deterministic based on memory id + date for consistency)
  const getRandomMemoryImage = (memory) => {
    const images = getMemoryImages(memory);
    if (images.length === 0) return null;
    if (images.length === 1) return images[0];
    // Use memory id as seed for consistent random selection per render
    const seed = memory.id + new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return images[Math.abs(hash) % images.length];
  };

  // Get all photos from all memories for hero carousel
  const getAllMemoryPhotos = useCallback(() => {
    return memories.flatMap(memory => getMemoryImages(memory)).filter(Boolean);
  }, [memories]);

  // Hero photo carousel effect
  useEffect(() => {
    const photos = getAllMemoryPhotos();
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setHeroPhotoIndex(prev => (prev + 1) % photos.length);
    }, 5000); // Change photo every 5 seconds

    return () => clearInterval(interval);
  }, [getAllMemoryPhotos]);

  // Handle drag and drop for photo upload in modals
  const handleDrop = (e, isEdit = false) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadMemoryPhoto(file, isEdit);
    }
  };

  // Handle drop directly on a memory card
  const handleCardDrop = async (e, memoryId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverMemoryId(null);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadPhotoToMemory(file, memoryId);
    }
  };

  // Upload photo and add to a specific memory's images array
  const uploadPhotoToMemory = async (file, memoryId) => {
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingToMemoryId(memoryId);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Convert HEIC/HEIF to JPEG
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                     file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        fileToUpload = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        fileName = fileToUpload.name;
      }

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Add to memory's images array (check if still mounted)
      if (!isMountedRef.current) return;
      setMemories(prev => prev.map(m => {
        if (m.id === memoryId) {
          const currentImages = m.images || [];
          // Also migrate old 'image' field if present
          if (m.image && !currentImages.includes(m.image)) {
            return { ...m, images: [m.image, ...currentImages, downloadURL], image: '' };
          }
          return { ...m, images: [...currentImages, downloadURL] };
        }
        return m;
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      if (isMountedRef.current) showToast('Photo upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingToMemoryId(null);
    }
  };

  // Upload photo to a party event (with HEIC conversion)
  const uploadPhotoToEvent = async (file, eventId) => {
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingToEventId(eventId);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Convert HEIC/HEIF to JPEG
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                     file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        fileToUpload = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        fileName = fileToUpload.name;
      }

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `events/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      // Add to event's images array
      const newEvents = partyEvents.map(e => {
        if (e.id === eventId) {
          const currentImages = e.images || [];
          return { ...e, images: [...currentImages, downloadURL] };
        }
        return e;
      });
      setPartyEvents(newEvents);

      // Update selected event if viewing it
      if (selectedPartyEvent?.id === eventId) {
        setSelectedPartyEvent(newEvents.find(e => e.id === eventId));
      }

      savePartyEventsToFirestore(newEvents);
    } catch (error) {
      console.error('Event photo upload failed:', error);
      if (isMountedRef.current) showToast('Event photo upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingToEventId(null);
    }
  };

  // Handle drop on event card
  const handleEventCardDrop = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverEventId(null);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadPhotoToEvent(file, eventId);
    }
  };

  // Upload photo to Firebase Storage (with HEIC conversion) - for modals
  const uploadMemoryPhoto = async (file, isEdit = false) => {
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Convert HEIC/HEIF to JPEG
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                     file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        fileToUpload = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        fileName = fileToUpload.name;
      }

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      if (isEdit) {
        // Add to images array instead of replacing
        setEditingMemory(prev => {
          const currentImages = prev.images || [];
          const allImages = prev.image && !currentImages.includes(prev.image)
            ? [prev.image, ...currentImages]
            : currentImages;
          return { ...prev, images: [...allImages, downloadURL], image: '' };
        });
      } else {
        setNewMemoryData(prev => {
          const currentImages = prev.images || [];
          return { ...prev, images: [...currentImages, downloadURL] };
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (isMountedRef.current) showToast('Photo upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  };

  // App state
  const [trips, setTrips] = useState(defaultTrips);
  const [wishlist, setWishlist] = useState(defaultWishlist);
  const [companions, setCompanions] = useState(defaultCompanions);
  const [openDates, setOpenDates] = useState(defaultOpenDates);
  const [showOpenDateModal, setShowOpenDateModal] = useState(false);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(initialTripDetails);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [showAddModal, setShowAddModal] = useState(null); // { type, tripId } or null
  const [showNewTripModal, setShowNewTripModal] = useState(null); // 'adventure' or 'wishlist'
  const [showTripMenu, setShowTripMenu] = useState(null); // trip id for menu
  const [showColorPicker, setShowColorPicker] = useState(null); // trip id for color picker
  const [showEmojiEditor, setShowEmojiEditor] = useState(null); // trip id for emoji editor
  const [showImageEditor, setShowImageEditor] = useState(null); // trip id for image editor
  const [showLinkModal, setShowLinkModal] = useState(null); // trip id for link modal
  const [currentUser, setCurrentUser] = useState('Mike');
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [showRandomExperience, setShowRandomExperience] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showDisneyMagic, setShowDisneyMagic] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // overview, packing, budget, photos, places, notes
  const [showGuestModal, setShowGuestModal] = useState(null); // trip id for guest management
  const [editingTripDates, setEditingTripDates] = useState(null); // { tripId, start, end } for date editing
  const [generatedExperience, setGeneratedExperience] = useState(null);
  const [experienceFilters, setExperienceFilters] = useState({ type: 'any', vibes: [] });
  const [currentCompanion, setCurrentCompanion] = useState(null); // logged-in companion object
  const [showMyProfileModal, setShowMyProfileModal] = useState(false); // companion profile editor
  const [editingTrainingWeek, setEditingTrainingWeek] = useState(null); // { eventId, week } for editing training week
  const [isOwner, setIsOwner] = useState(false); // true if Mike or Adam
  const [bouncingEmoji, setBouncingEmoji] = useState(null); // { emoji, x, y, dx, dy } for bouncing animation

  // Guest state - for users invited to specific trips
  const [isGuest, setIsGuest] = useState(false); // true if user is a trip guest (not owner or companion)
  const [guestTripIds, setGuestTripIds] = useState([]); // array of trip IDs this guest has access to
  const [guestPermissions, setGuestPermissions] = useState({}); // { tripId: 'edit' | 'view' }

  // ========== CELEBRATION STATE ==========
  const [confetti, setConfetti] = useState(null); // { type: 'run' | 'week', x?, y? }
  const [weekCelebration, setWeekCelebration] = useState(null); // { weekNumber, eventName }

  // Vibration helper - works on mobile devices
  const vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Trigger run completion celebration (both completed together)
  const celebrateRunTogether = () => {
    vibrate(200); // Short buzz
    setConfetti({ type: 'run' });
    showToast('High Five! 🙌 You both crushed it!', 'success');
    setTimeout(() => setConfetti(null), 2000);
  };

  // Trigger week completion celebration (both completed all runs)
  const celebrateWeekComplete = (weekNumber, eventName) => {
    vibrate([200, 100, 200, 100, 400]); // Pattern: buzz-pause-buzz-pause-long buzz
    setConfetti({ type: 'week' });
    setWeekCelebration({ weekNumber, eventName });
    setTimeout(() => {
      setConfetti(null);
      setWeekCelebration(null);
    }, 4000);
  };

  // ========== FITNESS SECTION STATE ==========
  // Default fitness events
  const defaultFitnessEvents = [
    {
      id: 'indy-half-2026',
      name: 'Indy Half Marathon',
      emoji: '🏃',
      date: '2026-05-02',
      type: 'half-marathon',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'triathlon-2026',
      name: 'Triathlon',
      emoji: '🏊',
      date: '2026-09-26',
      type: 'triathlon',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  // Hardcoded Indy Half Marathon Training Plan - "Salad, Run, Salad"
  const indyHalfTrainingPlan = [
    { weekNumber: 1, startDate: '2026-01-11', endDate: '2026-01-17', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '4', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 9, weekNotes: '' },
    { weekNumber: 2, startDate: '2026-01-18', endDate: '2026-01-24', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '4', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 9, weekNotes: '' },
    { weekNumber: 3, startDate: '2026-01-25', endDate: '2026-01-31', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '5', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 10, weekNotes: '' },
    { weekNumber: 4, startDate: '2026-02-01', endDate: '2026-02-07', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 11, weekNotes: 'SOBER!! 🎯' },
    { weekNumber: 5, startDate: '2026-02-08', endDate: '2026-02-14', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 12, weekNotes: '' },
    { weekNumber: 6, startDate: '2026-02-15', endDate: '2026-02-21', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 13, weekNotes: '' },
    { weekNumber: 7, startDate: '2026-02-22', endDate: '2026-02-28', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '' },
    { weekNumber: 8, startDate: '2026-03-01', endDate: '2026-03-07', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '✈️ Mike in Spain (Fri-Sat)' },
    { weekNumber: 9, startDate: '2026-03-08', endDate: '2026-03-14', runs: [
      { id: 1, label: 'Short Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 17, weekNotes: '✈️ Mike in Spain (all week)' },
    { weekNumber: 10, startDate: '2026-03-15', endDate: '2026-03-21', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '9', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 17, weekNotes: '🗽 Mike & Adam in NYC (Thurs-Sat)' },
    { weekNumber: 11, startDate: '2026-03-22', endDate: '2026-03-28', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '10', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 18, weekNotes: '🗽 Mike & Adam in NYC (Sun-Mon)' },
    { weekNumber: 12, startDate: '2026-03-29', endDate: '2026-04-04', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '11', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 19, weekNotes: '' },
    { weekNumber: 13, startDate: '2026-04-05', endDate: '2026-04-11', runs: [
      { id: 1, label: 'Short Run', distance: '5.5', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '12', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 22.5, weekNotes: '🏛️ Mike & Adam in DC (Thurs-Sat)' },
    { weekNumber: 14, startDate: '2026-04-12', endDate: '2026-04-18', runs: [
      { id: 1, label: 'Short Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '14', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 24, weekNotes: '🏛️ Mike & Adam in DC (Sun-Mon)' },
    { weekNumber: 15, startDate: '2026-04-19', endDate: '2026-04-25', runs: [
      { id: 1, label: 'Short Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '📉 Taper Week - Rest up!' },
    { weekNumber: 16, startDate: '2026-04-26', endDate: '2026-05-02', runs: [
      { id: 1, label: 'Short Run', distance: '2', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '13.1', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 18.1, weekNotes: '🏁 RACE WEEK! You got this! 🎉', isRaceWeek: true }
  ].map(week => ({ ...week, id: `indy-half-2026-week-${week.weekNumber}` }));

  // Hardcoded Triathlon Training Plan - Mike only
  // Pre-season (Feb-May): Swimming cross-training while doing Half Marathon runs
  // Main training (May onwards): Full swim/bike/run/bricks
  const triathlonTrainingPlan = [
    // === PRE-SEASON: Swimming Cross-Training (Feb 2 - May 9) ===
    // During this phase, runs are tracked in Half Marathon plan
    { weekNumber: 1, startDate: '2026-02-02', endDate: '2026-02-08', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '400m', mike: false, notes: 'Easy pace, focus on form' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Pre-Season Week 1 - Getting in the water!' },
    { weekNumber: 2, startDate: '2026-02-09', endDate: '2026-02-15', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '450m', mike: false, notes: 'Freestyle drills' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 3, startDate: '2026-02-16', endDate: '2026-02-22', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '500m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 4, startDate: '2026-02-23', endDate: '2026-03-01', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '550m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 5, startDate: '2026-03-02', endDate: '2026-03-08', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '600m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Building endurance!' },
    { weekNumber: 6, startDate: '2026-03-09', endDate: '2026-03-15', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '650m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 7, startDate: '2026-03-16', endDate: '2026-03-22', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '700m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 8, startDate: '2026-03-23', endDate: '2026-03-29', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '750m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 9, startDate: '2026-03-30', endDate: '2026-04-05', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '800m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Halfway to race swim distance!' },
    { weekNumber: 10, startDate: '2026-04-06', endDate: '2026-04-12', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '850m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 11, startDate: '2026-04-13', endDate: '2026-04-19', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '900m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 12, startDate: '2026-04-20', endDate: '2026-04-26', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '950m', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 13, startDate: '2026-04-27', endDate: '2026-05-03', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '1000m', mike: false, notes: 'Race distance achieved!' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏃 Half Marathon Week! Focus on race.' },
    { weekNumber: 14, startDate: '2026-05-04', endDate: '2026-05-09', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '600m', mike: false, notes: 'Recovery swim' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🔄 Transition week - recover from Half!' },

    // === MAIN TRAINING: Full Triathlon (May 10 onwards) ===
    { weekNumber: 15, startDate: '2026-05-10', endDate: '2026-05-16', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '500m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '10 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🚴 Full tri training begins!' },
    { weekNumber: 16, startDate: '2026-05-17', endDate: '2026-05-23', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '600m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '12 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 17, startDate: '2026-05-24', endDate: '2026-05-30', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '700m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '14 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 18, startDate: '2026-05-31', endDate: '2026-06-06', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '800m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '15 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 19, startDate: '2026-06-07', endDate: '2026-06-13', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '900m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '16 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 20, startDate: '2026-06-14', endDate: '2026-06-20', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1000m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '18 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 21, startDate: '2026-06-21', endDate: '2026-06-27', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1000m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '20 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 22, startDate: '2026-06-28', endDate: '2026-07-04', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1100m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '22 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🎆 4th of July Week!' },
    { weekNumber: 23, startDate: '2026-07-05', endDate: '2026-07-11', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1200m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '24 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 24, startDate: '2026-07-12', endDate: '2026-07-18', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1300m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '26 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 25, startDate: '2026-07-19', endDate: '2026-07-25', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1400m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '28 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 26, startDate: '2026-07-26', endDate: '2026-08-01', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1500m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '30 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🏊 Peak Swim Week!' },
    { weekNumber: 27, startDate: '2026-08-02', endDate: '2026-08-08', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1500m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '30 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 28, startDate: '2026-08-09', endDate: '2026-08-15', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1500m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '28 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 29, startDate: '2026-08-16', endDate: '2026-08-22', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1400m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '26 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 30, startDate: '2026-08-23', endDate: '2026-08-29', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1300m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '24 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 31, startDate: '2026-08-30', endDate: '2026-09-05', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1200m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '22 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper begins!' },
    { weekNumber: 32, startDate: '2026-09-06', endDate: '2026-09-12', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1000m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '18 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper Week 2' },
    { weekNumber: 33, startDate: '2026-09-13', endDate: '2026-09-19', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '800m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '14 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2.5', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper Week 3 - Rest up!' },
    { weekNumber: 34, startDate: '2026-09-20', endDate: '2026-09-26', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '500m', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '10 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6.2', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Race Day Prep', mike: false, notes: '' },
      { id: 2, label: 'Rest', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🏁 RACE WEEK! Sprint Tri - You got this! 🎉', isRaceWeek: true }
  ].map(week => ({ ...week, id: `triathlon-2026-week-${week.weekNumber}` }));

  // Generate generic training weeks for other events
  const generateTrainingWeeks = (startDate, eventDate, eventId) => {
    const weeks = [];
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(eventDate);

    const firstMonday = new Date(start);
    firstMonday.setDate(start.getDate() - start.getDay() + 1);

    let currentWeek = new Date(firstMonday);
    let weekNumber = 1;

    while (currentWeek < end) {
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        id: `${eventId}-week-${weekNumber}`,
        weekNumber,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        runs: [
          { id: 1, label: 'Short Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Medium Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 3, label: 'Long Run', distance: '', mike: false, adam: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
        ],
        weekNotes: ''
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
      weekNumber++;
    }

    // Add 2 recovery weeks after the event
    for (let i = 0; i < 2; i++) {
      const weekStart = new Date(currentWeek);
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        id: `${eventId}-recovery-${i + 1}`,
        weekNumber: weekNumber + i,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        isRecovery: true,
        runs: [
          { id: 1, label: 'Short Run', distance: '', mike: false, adam: false, notes: '' },
          { id: 2, label: 'Medium Run', distance: '', mike: false, adam: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' }
        ],
        weekNotes: 'Recovery Week - Take it easy! 🌟'
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return weeks;
  };

  // Fitness state
  const [fitnessEvents, setFitnessEvents] = useState(defaultFitnessEvents);
  const [fitnessTrainingPlans, setFitnessTrainingPlans] = useState({});
  const [selectedFitnessEvent, setSelectedFitnessEvent] = useState(null);
  const [fitnessViewMode, setFitnessViewMode] = useState('events'); // 'events' | 'training' | 'stats'
  // ========== END FITNESS SECTION STATE ==========

  // ========== EVENTS/PARTY SECTION STATE ==========
  const [partyEvents, setPartyEvents] = useState([]);
  const [selectedPartyEvent, setSelectedPartyEvent] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventViewMode, setEventViewMode] = useState('upcoming');
  const [newEventData, setNewEventData] = useState({
    name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
    location: '', entryCode: '', description: '', color: 'from-purple-400 to-pink-500'
  });
  const [eventGuestEmail, setEventGuestEmail] = useState('');
  const [eventGuestPermission, setEventGuestPermission] = useState('edit');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [uploadingToEventId, setUploadingToEventId] = useState(null);
  const [dragOverEventId, setDragOverEventId] = useState(null);
  // ========== END EVENTS/PARTY SECTION STATE ==========

  // Use refs for companions and trips to avoid recreating auth listener when they change
  const companionsRef = useRef(companions);
  companionsRef.current = companions;
  const tripsRef = useRef(trips);
  tripsRef.current = trips;

  // Auth effect - listen for auth state changes (runs once, uses ref for companions)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMountedRef.current) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        const userEmail = firebaseUser.email?.toLowerCase();

        // Check if user is an owner (Mike or Adam)
        const isOwnerUser = ownerEmails.some(email => userEmail?.includes(email.split('@')[0]));
        setIsOwner(isOwnerUser);

        if (isOwnerUser) {
          // Owner login
          const displayName = userEmail?.includes('mdulin') ? 'Mike' : 'Adam';
          setCurrentUser(displayName);
          setCurrentCompanion(null);
          setIsGuest(false);
          setGuestTripIds([]);
          setGuestPermissions({});
        } else {
          // Check if user is a companion (use ref to get latest companions)
          const matchedCompanion = companionsRef.current.find(c =>
            c.email?.toLowerCase() === userEmail
          );

          if (matchedCompanion) {
            setCurrentCompanion(matchedCompanion);
            setCurrentUser(matchedCompanion.firstName || matchedCompanion.name);
            setIsGuest(false);
            setGuestTripIds([]);
            setGuestPermissions({});
          } else {
            // Check if user is a trip guest (invited to specific trips)
            const currentTrips = tripsRef.current;
            const invitedTrips = [];
            const permissions = {};

            currentTrips.forEach(trip => {
              const guestMatch = (trip.guests || []).find(g =>
                g.email?.toLowerCase() === userEmail
              );
              if (guestMatch) {
                invitedTrips.push(trip.id);
                permissions[trip.id] = guestMatch.permission || 'view';
              }
            });

            if (invitedTrips.length > 0) {
              // User is a guest on one or more trips
              setIsGuest(true);
              setGuestTripIds(invitedTrips);
              setGuestPermissions(permissions);
              setCurrentUser(firebaseUser.displayName || 'Guest');
              setCurrentCompanion(null);
            } else {
              // Unknown user - no access
              setCurrentUser(firebaseUser.displayName || 'Guest');
              setCurrentCompanion(null);
              setIsGuest(false);
              setGuestTripIds([]);
              setGuestPermissions({});
            }
          }
        }
      } else {
        setUser(null);
        setCurrentCompanion(null);
        setIsOwner(false);
        setIsGuest(false);
        setGuestTripIds([]);
        setGuestPermissions({});
      }
      if (isMountedRef.current) setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency - listener created once, uses refs for current data

  // Re-check guest status when trips change (handles Firestore data loading after initial auth)
  useEffect(() => {
    if (!user || isOwner || currentCompanion) return; // Only check for non-owner, non-companion users

    const userEmail = user.email?.toLowerCase();
    if (!userEmail) return;

    const invitedTrips = [];
    const permissions = {};

    trips.forEach(trip => {
      const guestMatch = (trip.guests || []).find(g =>
        g.email?.toLowerCase() === userEmail
      );
      if (guestMatch) {
        invitedTrips.push(trip.id);
        permissions[trip.id] = guestMatch.permission || 'view';
      }
    });

    // Update guest status if it changed
    if (invitedTrips.length > 0) {
      setIsGuest(true);
      setGuestTripIds(invitedTrips);
      setGuestPermissions(permissions);
    } else if (isGuest) {
      // Was a guest but no longer invited to any trips
      setIsGuest(false);
      setGuestTripIds([]);
      setGuestPermissions({});
    }
  }, [trips, user, isOwner, currentCompanion, isGuest]);

  // Rotate travel quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % travelQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Bouncing emoji animation - use ref to avoid recreating interval on every state change
  const bouncingEmojiRef = useRef(bouncingEmoji);
  bouncingEmojiRef.current = bouncingEmoji;

  useEffect(() => {
    if (!bouncingEmoji) return;

    const animate = () => {
      setBouncingEmoji(prev => {
        if (!prev) return null;
        let { x, y, dx, dy, emoji, ttl } = prev;

        // Bounce off walls
        if (x <= 0 || x >= window.innerWidth - 60) dx = -dx;
        if (y <= 0 || y >= window.innerHeight - 60) dy = -dy;

        // Update position
        x += dx;
        y += dy;
        ttl -= 1;

        // Stop after time-to-live expires
        if (ttl <= 0) return null;

        return { emoji, x, y, dx, dy, ttl };
      });
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [bouncingEmoji ? 'active' : 'inactive']); // Only restart when emoji becomes active/inactive

  const startBouncingEmoji = (emoji, startX, startY) => {
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = 8;
    setBouncingEmoji({
      emoji,
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      ttl: 180 // 3 seconds at 60fps
    });
  };

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
          if (data.memories) setMemories(data.memories);
        }
        setDataLoading(false);
      },
      (error) => {
        console.error('Error loading data:', error);
        setDataLoading(false);
      }
    );

    // Subscribe to fitness collection
    const fitnessUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'fitness'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.events) setFitnessEvents(data.events);
          if (data.trainingPlans) setFitnessTrainingPlans(data.trainingPlans);
        }
      },
      (error) => {
        console.error('Error loading fitness data:', error);
      }
    );

    // Subscribe to party events collection
    const partyEventsUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'partyEvents'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.events) setPartyEvents(data.events);
        }
      },
      (error) => {
        console.error('Error loading party events:', error);
      }
    );

    return () => {
      tripsUnsubscribe();
      fitnessUnsubscribe();
      partyEventsUnsubscribe();
    };
  }, [user]);

  // Compute visible open dates based on user role
  const visibleOpenDates = isOwner
    ? openDates // Owners see all dates
    : openDates.filter(od =>
        od.visibleTo.includes('all') ||
        (currentCompanion && od.visibleTo.includes(currentCompanion.id))
      );

  // Compute visible trips based on user role
  const visibleTrips = isOwner || currentCompanion
    ? trips // Owners and companions see all trips
    : isGuest
      ? trips.filter(trip => guestTripIds.includes(trip.id)) // Guests see only invited trips
      : []; // Unknown users see nothing

  // Helper to check if current user can edit a specific trip
  const canEditTrip = (tripId) => {
    if (isOwner) return true;
    if (currentCompanion) return false; // Companions are view-only for now
    if (isGuest) return guestPermissions[tripId] === 'edit';
    return false;
  };

  // Helper to check if current user can delete a trip (owners only)
  const canDeleteTrip = (tripId) => {
    return isOwner;
  };

  // Save to Firestore whenever data changes
  const saveToFirestore = async (newTrips, newWishlist, newTripDetails, newMemories) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'tripData', 'shared'), {
        trips: newTrips || trips,
        wishlist: newWishlist || wishlist,
        tripDetails: newTripDetails || tripDetails,
        memories: newMemories || memories,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      });
      showToast('Changes saved', 'success');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    }
  };

  // Save memories to Firestore
  const saveMemoriesToFirestore = async (newMemories) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'tripData', 'shared'), {
        trips,
        wishlist,
        tripDetails,
        memories: newMemories,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      });
    } catch (error) {
      console.error('Error saving memories to Firestore:', error);
      showToast('Failed to save memory. Please try again.', 'error');
    }
  };

  // Save fitness data to Firestore
  const saveFitnessToFirestore = async (newEvents, newTrainingPlans) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'tripData', 'fitness'), {
        events: newEvents || fitnessEvents,
        trainingPlans: newTrainingPlans || fitnessTrainingPlans,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      });
    } catch (error) {
      console.error('Error saving fitness to Firestore:', error);
      showToast('Failed to save fitness data. Please try again.', 'error');
    }
  };

  // Save party/social events to Firestore
  const savePartyEventsToFirestore = async (newEvents) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'tripData', 'partyEvents'), {
        events: newEvents || partyEvents,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      });
    } catch (error) {
      console.error('Error saving party events to Firestore:', error);
      showToast('Failed to save event. Please try again.', 'error');
    }
  };

  // Update a training week
  const updateTrainingWeek = async (eventId, weekId, updates) => {
    const newPlans = { ...fitnessTrainingPlans };
    if (!newPlans[eventId]) {
      // Generate training weeks for this event
      const event = fitnessEvents.find(e => e.id === eventId);
      if (event) {
        const today = new Date().toISOString().split('T')[0];
        newPlans[eventId] = generateTrainingWeeks(today, event.date, eventId);
      }
    }

    newPlans[eventId] = newPlans[eventId].map(week =>
      week.id === weekId ? { ...week, ...updates } : week
    );

    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);
  };

  // Update a workout (run or cross-training)
  const updateWorkout = async (eventId, weekId, workoutType, workoutId, updates) => {
    const newPlans = { ...fitnessTrainingPlans };
    if (!newPlans[eventId]) return;

    // Get current workout state before update
    const currentWeek = newPlans[eventId].find(w => w.id === weekId);
    const currentWorkout = currentWeek?.[workoutType]?.find(w => w.id === workoutId);
    const wasCompletedTogether = currentWorkout?.mike && currentWorkout?.adam;

    // Check if all runs were complete before this update
    const wereAllRunsComplete = currentWeek?.runs?.every(r => r.mike && r.adam);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (week.id !== weekId) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      return { ...week, [workoutType]: updatedWorkouts };
    });

    // Get updated state
    const updatedWeek = newPlans[eventId].find(w => w.id === weekId);
    const updatedWorkout = updatedWeek?.[workoutType]?.find(w => w.id === workoutId);
    const isNowCompletedTogether = updatedWorkout?.mike && updatedWorkout?.adam;

    // Check if all runs are now complete
    const areAllRunsNowComplete = updatedWeek?.runs?.every(r => r.mike && r.adam);

    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);

    // Trigger celebrations (only for runs, not cross-training)
    if (workoutType === 'runs') {
      // Week completion takes priority over single run
      if (!wereAllRunsComplete && areAllRunsNowComplete) {
        const event = fitnessEvents.find(e => e.id === eventId);
        celebrateWeekComplete(updatedWeek.weekNumber, event?.name || 'Training');
      } else if (!wasCompletedTogether && isNowCompletedTogether) {
        // Single run completed together
        celebrateRunTogether();
      }
    }
  };

  // Initialize training plan for an event
  const initializeTrainingPlan = async (eventId) => {
    const event = fitnessEvents.find(e => e.id === eventId);
    if (!event) return;

    // Use hardcoded plan for Indy Half Marathon
    let weeks;
    if (eventId === 'indy-half-2026') {
      weeks = indyHalfTrainingPlan;
    } else {
      const today = new Date().toISOString().split('T')[0];
      weeks = generateTrainingWeeks(today, event.date, eventId);
    }

    const newPlans = { ...fitnessTrainingPlans, [eventId]: weeks };
    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);
  };

  // Get the active training plan for an event - always uses hardcoded plans
  // but merges completion status from Firebase
  const getActiveTrainingPlan = (eventId) => {
    // Helper to merge Firebase completion status into hardcoded plan
    const mergeWithFirebase = (hardcodedPlan) => {
      const firebasePlan = fitnessTrainingPlans[eventId];
      if (!firebasePlan) return hardcodedPlan;

      return hardcodedPlan.map(week => {
        const fbWeek = firebasePlan.find(w => w.weekNumber === week.weekNumber);
        if (!fbWeek) return week;

        return {
          ...week,
          runs: week.runs.map((run, idx) => ({
            ...run,
            mike: fbWeek.runs?.[idx]?.mike ?? run.mike,
            adam: fbWeek.runs?.[idx]?.adam ?? run.adam
          })),
          crossTraining: week.crossTraining.map((ct, idx) => ({
            ...ct,
            mike: fbWeek.crossTraining?.[idx]?.mike ?? ct.mike,
            adam: fbWeek.crossTraining?.[idx]?.adam ?? ct.adam
          })),
          weekNotes: fbWeek.weekNotes || week.weekNotes
        };
      });
    };

    if (eventId === 'indy-half-2026') {
      return mergeWithFirebase(indyHalfTrainingPlan);
    }
    if (eventId === 'triathlon-2026') {
      return mergeWithFirebase(triathlonTrainingPlan);
    }
    return fitnessTrainingPlans[eventId] || [];
  };

  // Handle redirect result on page load (for Safari/iOS compatibility)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          showToast('Signed in successfully!', 'success');
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
        showToast('Sign in failed. Please try again.', 'error');
      });
  }, [showToast]);

  // Auth handlers - try popup first, fall back to redirect for Safari/iOS
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      // Try popup first (works on most browsers)
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!', 'success');
    } catch (error) {
      // If popup fails (Safari blocks it), use redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('Redirect login error:', redirectError);
          showToast('Sign in failed. Please try again.', 'error');
          setAuthLoading(false);
        }
      } else {
        console.error('Login error:', error);
        showToast('Sign in failed. Please try again.', 'error');
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sort trips by start date (with null safety) - uses visibleTrips for role-based filtering
  const sortedTrips = [...(visibleTrips || [])].sort((a, b) => {
    const aStart = a?.dates?.start ? parseLocalDate(a.dates.start) : new Date();
    const bStart = b?.dates?.start ? parseLocalDate(b.dates.start) : new Date();
    return aStart - bStart;
  });

  // Separate confirmed adventures from trips in planning
  const confirmedTrips = sortedTrips.filter(t => !t?.isPlanning);
  const planningTrips = sortedTrips.filter(t => t?.isPlanning);

  const isDateInTrip = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (visibleTrips || []).find(trip => {
      if (!trip?.dates?.start || !trip?.dates?.end) return false;
      const start = parseLocalDate(trip.dates.start);
      const end = parseLocalDate(trip.dates.end);
      return checkDate >= start && checkDate <= end;
    });
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const addItem = (tripId, type, item) => {
    // Check edit permission
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
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
    // Check edit permission
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
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

  const updateItem = (tripId, type, itemId, updatedData) => {
    // Check edit permission
    if (!canEditTrip(tripId)) {
      showToast('You don\'t have permission to edit this trip', 'error');
      return;
    }
    const newTripDetails = {
      ...tripDetails,
      [tripId]: {
        ...tripDetails[tripId],
        [type]: tripDetails[tripId][type].map(item =>
          item.id === itemId ? { ...item, ...updatedData } : item
        )
      }
    };
    setTripDetails(newTripDetails);
    saveToFirestore(null, null, newTripDetails);
    setShowAddModal(null);
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

  const updateTripDates = async (tripId, newStart, newEnd) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, dates: { start: newStart, end: newEnd } }
        : trip
    );
    setTrips(newTrips);
    await saveToFirestore(newTrips, null, null);
    // Return the updated trip so caller can update selectedTrip
    return newTrips.find(t => t.id === tripId);
  };

  const deleteTrip = (tripId) => {
    // Only owners can delete trips
    if (!canDeleteTrip(tripId)) {
      showToast('Only trip owners can delete trips', 'error');
      return;
    }
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
    // Check if this is a planning trip - if so, add to trip's planningLinks
    const trip = trips.find(t => t.id === tripId);
    if (trip?.isPlanning) {
      const newLink = { id: Date.now(), title: linkData.title, url: linkData.url, type: linkData.category };
      setTrips(prev => prev.map(t =>
        t.id === tripId
          ? { ...t, planningLinks: [...(t.planningLinks || []), newLink] }
          : t
      ));
      return;
    }

    // Otherwise add to tripDetails.links
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

  // NewTripModal - moved to ./components/NewTripModal.jsx

  // Guest Modal State (lifted out to prevent re-render issues)
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPermission, setGuestPermission] = useState('edit');

  // GuestModal - moved to ./components/GuestModal.jsx

  // CompanionsModal - moved to ./components/CompanionsModal.jsx

  // MyProfileModal - moved to ./components/MyProfileModal.jsx

  // TripDetail - moved to ./components/TripDetail.jsx

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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white' :
          toast.type === 'success' ? 'bg-green-500 text-white' :
          'bg-slate-700 text-white'
        }`}>
          {toast.type === 'error' && <X className="w-4 h-4" />}
          {toast.type === 'success' && <Check className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            @keyframes confetti-fall-slow {
              0% { transform: translateY(-100vh) rotate(0deg) scale(1); opacity: 1; }
              100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; }
            }
          `}</style>
          {[...Array(confetti.type === 'week' ? 60 : 25)].map((_, i) => {
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * (confetti.type === 'week' ? 1 : 0.5);
            const duration = confetti.type === 'week' ? 3 + Math.random() * 2 : 1.5 + Math.random();
            const size = confetti.type === 'week' ? 10 + Math.random() * 10 : 6 + Math.random() * 6;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: 0,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  animation: `${confetti.type === 'week' ? 'confetti-fall-slow' : 'confetti-fall'} ${duration}s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Week Completion Celebration Overlay */}
      {weekCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-pulse" style={{ animationDuration: '2s' }}>
          <div className="text-center p-8 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl shadow-2xl transform animate-bounce" style={{ animationDuration: '0.5s' }}>
            <div className="text-6xl mb-4">🎉🏃‍♂️🏃‍♂️🎉</div>
            <h2 className="text-4xl font-bold text-white mb-2">Week {weekCelebration.weekNumber} Complete!</h2>
            <p className="text-xl text-white/90 mb-4">{weekCelebration.eventName}</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-bold">Mike ✓</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-bold">Adam ✓</span>
              </div>
            </div>
            <p className="text-white/80 mt-4 text-lg">You both crushed it! 💪</p>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5.5s' }} />

        
        {/* Floating travel emojis with animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-3deg); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
          }
          @keyframes shooting {
            0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
            100% { transform: translateX(200px) translateY(200px) rotate(-45deg); opacity: 0; }
          }
          @keyframes borderCircle {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5), 0 0 10px rgba(236, 72, 153, 0.3), 0 0 15px rgba(236, 72, 153, 0.2); }
            50% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.5), 0 0 30px rgba(236, 72, 153, 0.3); }
          }
          .special-memory-card {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            overflow: visible;
          }
          .special-memory-card::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(90deg, #ec4899, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899);
            background-size: 300% 300%;
            border-radius: 1.2rem;
            z-index: -1;
            animation: borderCircle 3s linear infinite;
          }
          .special-memory-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgb(30 41 59);
            border-radius: 1rem;
            z-index: -1;
          }
          .float { animation: float 6s ease-in-out infinite; }
          .float-slow { animation: floatSlow 8s ease-in-out infinite; }
          .twinkle { animation: twinkle 3s ease-in-out infinite; }
        `}</style>

        
        {/* Hidden Mickey silhouette - visible when Disney magic is activated */}
        {showDisneyMagic && (
          <div className="absolute bottom-10 right-10 opacity-20 transition-opacity duration-1000">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full" />
              <div className="absolute -top-6 -left-4 w-10 h-10 bg-white rounded-full" />
              <div className="absolute -top-6 -right-4 w-10 h-10 bg-white rounded-full" />
            </div>
          </div>
        )}

        {/* Disney magic sparkles when activated */}
        {showDisneyMagic && (
          <>
            <style>{`
              @keyframes disneySparkle {
                0% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
              }
            `}</style>
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute text-yellow-300"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `disneySparkle 2s ease-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 12}px`
                }}
              >
                ✨
              </span>
            ))}
          </>
        )}
      </div>

      {/* Interactive Anchor - outside pointer-events-none container */}
      <DroppableAnchor className="absolute top-40 right-40 z-10" />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  <button
                    onClick={() => isOwner && setCurrentUser('Mike')}
                    className={`${currentUser === 'Mike' ? 'text-teal-400' : 'text-white'} ${isOwner ? 'hover:opacity-80 cursor-pointer' : ''} transition`}
                  >
                    Mike
                  </button>
                  <span className="text-white"> & </span>
                  <button
                    onClick={() => isOwner && setCurrentUser('Adam')}
                    className={`${currentUser === 'Adam' ? 'text-purple-400' : 'text-white'} ${isOwner ? 'hover:opacity-80 cursor-pointer' : ''} transition`}
                  >
                    Adam
                  </button>
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  Living our best life together
                  <span className="text-pink-400">💕</span>
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
                {currentCompanion && (
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                    {currentCompanion.relationship}
                  </span>
                )}
                {/* Profile button for companions */}
                {currentCompanion && (
                  <button
                    onClick={() => setShowMyProfileModal(true)}
                    className="ml-1 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
                    title="Edit my profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-2 text-xs text-white/50 hover:text-white transition underline"
                >
                  log out
                </button>
              </div>


              {/* Companion badge */}
              {currentCompanion && !isOwner && (
                <div className="flex items-center bg-amber-500/20 rounded-full px-3 py-1.5">
                  <span className="text-amber-300 text-sm">👋 Welcome, {currentCompanion.firstName || currentCompanion.name}!</span>
                </div>
              )}

            </div>
          </div>

          {/* Sync status indicator */}
          {dataLoading && (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}

          {/* Section Navigation */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {[
              { id: 'home', label: 'Home', emoji: '🏠', gradient: 'from-pink-500 to-purple-500' },
              { id: 'travel', label: 'Travel', emoji: '✈️', gradient: 'from-teal-400 to-cyan-500' },
              { id: 'fitness', label: 'Fitness', emoji: '🏃', gradient: 'from-orange-400 to-red-500' },
              { id: 'nutrition', label: 'Nutrition', emoji: '🥗', gradient: 'from-green-400 to-emerald-500' },
              { id: 'events', label: 'Events', emoji: '🎉', gradient: 'from-amber-400 to-orange-500' },
              { id: 'lifePlanning', label: 'Life Planning', emoji: '🎯', gradient: 'from-purple-400 to-indigo-500' },
              { id: 'business', label: 'Business', emoji: '💼', gradient: 'from-slate-400 to-zinc-500' },
              { id: 'memories', label: 'Memories', emoji: '💝', gradient: 'from-rose-400 to-pink-500' },
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition shadow-lg ${
                  activeSection === section.id
                    ? `bg-gradient-to-r ${section.gradient} text-white`
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>{section.emoji}</span>
                {section.label}
              </button>
            ))}
          </div>

          {/* Action Buttons - Travel Section */}
          {activeSection === 'travel' && (
          <div className="flex gap-3 mt-6 flex-wrap">
            {/* Owner-only buttons */}
            {isOwner && (
              <>
                <button
                  onClick={() => setShowNewTripModal('adventure')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Adventure
                </button>
                <button
                  onClick={() => setShowRandomExperience(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  🎲 Random Adventure
                </button>
                <button
                  onClick={() => setShowNewTripModal('wishlist')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Add to Wishlist 🦄
                </button>
              </>
            )}
            {/* Owner-only management buttons */}
            {isOwner && (
              <>
                <button
                  onClick={() => setShowOpenDateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  📅 Open Dates
                </button>
                <button
                  onClick={() => setShowCompanionsModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  👥 Travel Circle
                </button>
              </>
            )}
            {/* Companion profile button */}
            {currentCompanion && !isOwner && (
              <button
                onClick={() => setShowMyProfileModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
              >
                <User className="w-5 h-5" />
                My Profile
              </button>
            )}
          </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">

          {/* ========== HOME SECTION ========== */}
          {activeSection === 'home' && (
            <div className="mt-8">
              {/* Photo Carousel Hero with Dramatic Floating Animations */}
              <div className="mb-12 relative">
                {/* Enhanced CSS animations */}
                <style>{`
                  @keyframes floatDramatic {
                    0% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
                    25% { transform: translateY(-30px) translateX(20px) rotate(10deg) scale(1.1); }
                    50% { transform: translateY(-15px) translateX(-15px) rotate(-5deg) scale(0.95); }
                    75% { transform: translateY(-40px) translateX(10px) rotate(8deg) scale(1.05); }
                    100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
                  }
                  @keyframes driftAcross {
                    0% { transform: translateX(-100px) translateY(0px) rotate(-10deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(100vw) translateY(-50px) rotate(20deg); opacity: 0; }
                  }
                  @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    15% { transform: scale(1.3); }
                    30% { transform: scale(1); }
                    45% { transform: scale(1.2); }
                    60% { transform: scale(1); }
                  }
                  @keyframes rainbowPulse {
                    0%, 100% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); }
                    50% { transform: scale(1.2) rotate(10deg); filter: hue-rotate(30deg); }
                  }
                  @keyframes sparkleFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.7; }
                    25% { transform: translateY(-20px) rotate(90deg) scale(1.3); opacity: 1; }
                    50% { transform: translateY(-10px) rotate(180deg) scale(0.8); opacity: 0.5; }
                    75% { transform: translateY(-35px) rotate(270deg) scale(1.2); opacity: 1; }
                  }
                  @keyframes orbitSlow {
                    0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
                  }
                  @keyframes bounceHigh {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-50px) scale(1.15); }
                  }
                  @keyframes zipOff {
                    0% { transform: scale(1) rotate(0deg); opacity: 1; }
                    30% { transform: scale(1.3) rotate(15deg); opacity: 1; }
                    100% { transform: scale(0) rotate(720deg) translateY(-200px); opacity: 0; }
                  }
                  @keyframes fadeCarousel {
                    0% { opacity: 0; transform: scale(1.05); }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.95); }
                  }
                `}</style>

                {/* Floating emojis container - behind photo, clickable */}
                <div className="absolute inset-0 overflow-hidden">
                  {(() => {
                    // Randomized emoji animations
                    const animations = [
                      'heartbeat 1.5s ease-in-out infinite',
                      'bounceHigh 2s ease-in-out infinite',
                      'floatDramatic 5s ease-in-out infinite',
                      'sparkleFloat 4s ease-in-out infinite',
                      'rainbowPulse 3s ease-in-out infinite',
                      'driftAcross 12s linear infinite',
                    ];
                    const getRandomAnimation = (seed) => {
                      const idx = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % animations.length;
                      return animations[idx];
                    };
                    const emojis = [
                      { emoji: '💕', left: '3%', top: '15%', size: 'text-4xl' },
                      { emoji: '❤️', left: '12%', top: '65%', size: 'text-3xl' },
                      { emoji: '💖', right: '5%', top: '25%', size: 'text-4xl' },
                      { emoji: '💗', right: '15%', top: '75%', size: 'text-3xl' },
                      { emoji: '💝', left: '50%', top: '5%', size: 'text-5xl' },
                      { emoji: '🌈', left: '0%', top: '35%', size: 'text-5xl' },
                      { emoji: '🌈', right: '0%', top: '10%', size: 'text-4xl' },
                      { emoji: '🏳️‍🌈', right: '10%', bottom: '15%', size: 'text-3xl' },
                      { emoji: '🕊️', left: '5%', top: '8%', size: 'text-3xl' },
                      { emoji: '🐦', right: '15%', top: '5%', size: 'text-2xl' },
                      { emoji: '✈️', left: '25%', top: '12%', size: 'text-3xl' },
                      { emoji: '🍊', left: '5%', bottom: '10%', size: 'text-3xl' },
                      { emoji: '🍋', right: '3%', bottom: '25%', size: 'text-2xl' },
                      { emoji: '🍇', left: '18%', bottom: '20%', size: 'text-3xl' },
                      { emoji: '🍑', right: '20%', top: '45%', size: 'text-2xl' },
                      { emoji: '✨', left: '2%', bottom: '45%', size: 'text-3xl' },
                      { emoji: '⭐', right: '2%', top: '50%', size: 'text-2xl' },
                      { emoji: '💫', left: '8%', top: '40%', size: 'text-3xl' },
                      { emoji: '🌟', right: '8%', bottom: '40%', size: 'text-2xl' },
                      { emoji: '🦋', left: '25%', top: '30%', size: 'text-2xl' },
                      { emoji: '🌸', right: '25%', bottom: '30%', size: 'text-2xl' },
                      { emoji: '🦄', left: '40%', bottom: '5%', size: 'text-4xl' },
                      { emoji: '🌺', right: '35%', top: '3%', size: 'text-3xl' },
                    ];
                    return emojis.map((e, idx) => {
                      const emojiKey = `emoji-${idx}`;
                      const isDismissed = dismissedEmojis.has(emojiKey);
                      if (isDismissed) return null;
                      return (
                        <span
                          key={idx}
                          className={`absolute ${e.size} cursor-pointer hover:scale-125 transition-transform`}
                          style={{
                            left: e.left,
                            right: e.right,
                            top: e.top,
                            bottom: e.bottom,
                            animation: getRandomAnimation(e.emoji + idx + new Date().toDateString()),
                            animationDelay: `${(idx * 0.3) % 3}s`,
                          }}
                          onClick={() => {
                            // Add zip-off animation then dismiss
                            const el = document.getElementById(emojiKey);
                            if (el) {
                              el.style.animation = 'zipOff 0.5s ease-out forwards';
                              setTimeout(() => {
                                setDismissedEmojis(prev => new Set([...prev, emojiKey]));
                              }, 500);
                            } else {
                              setDismissedEmojis(prev => new Set([...prev, emojiKey]));
                            }
                          }}
                          id={emojiKey}
                        >
                          {e.emoji}
                        </span>
                      );
                    });
                  })()}
                </div>

                {/* Photo Carousel - above emojis */}
                <div className="flex justify-center relative z-10">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full max-w-xl h-96">
                    {(() => {
                      const allPhotos = getAllMemoryPhotos();
                      if (allPhotos.length === 0) {
                        return (
                          <>
                            <img
                              src="/gallery/pier-painting.jpg"
                              alt="Provincetown Pier Painting"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <p className="text-white text-lg font-medium text-center">Add photos to memories to see them here! 📷</p>
                            </div>
                          </>
                        );
                      }
                      const currentPhoto = allPhotos[heroPhotoIndex % allPhotos.length];
                      const currentMemory = memories.find(m => getMemoryImages(m).includes(currentPhoto));
                      return (
                        <>
                          {allPhotos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={currentMemory?.title || 'Memory'}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                idx === heroPhotoIndex % allPhotos.length ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                          ))}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
                            <p className="text-white text-lg font-medium text-center">
                              {currentMemory?.title || 'Our Memories'} 💕
                            </p>
                            <p className="text-white/70 text-sm text-center">{currentMemory?.date}</p>
                          </div>
                          {/* Photo indicators */}
                          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
                            {allPhotos.slice(0, 10).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setHeroPhotoIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === heroPhotoIndex % allPhotos.length
                                    ? 'bg-white w-4'
                                    : 'bg-white/50 hover:bg-white/70'
                                }`}
                              />
                            ))}
                            {allPhotos.length > 10 && (
                              <span className="text-white/50 text-xs ml-1">+{allPhotos.length - 10}</span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Welcome to Our World
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  A space for Mike & Adam to plan adventures, stay healthy, and build our future together.
                </p>
              </div>

              {/* Values Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Travel Value */}
                <div
                  onClick={() => setActiveSection('travel')}
                  className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl p-8 border border-teal-500/30 hover:border-teal-500/60 transition cursor-pointer group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✈️</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Love of Travel</h3>
                  <p className="text-slate-300">
                    Exploring the world together, one adventure at a time. From beaches to cities, every journey is better when we're together.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-teal-400 font-medium">
                    <span>View trips</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Health Value */}
                <div
                  onClick={() => setActiveSection('fitness')}
                  className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl p-8 border border-orange-500/30 hover:border-orange-500/60 transition cursor-pointer group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💪</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Being Healthy</h3>
                  <p className="text-slate-300">
                    Training for half marathons, triathlons, and beyond. Supporting each other to be our strongest selves.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-orange-400 font-medium">
                    <span>View fitness</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Pride Value */}
                <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl p-8 border border-purple-500/30 hover:border-purple-500/60 transition group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏳️‍🌈</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Embracing Who We Are</h3>
                  <p className="text-slate-300">
                    Living authentically, celebrating our love, and building a life filled with pride, joy, and adventure.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-purple-400 font-medium">
                    <span>Love is love</span>
                    <span>💕</span>
                  </div>
                </div>

                {/* Entertaining Value */}
                <div
                  onClick={() => setActiveSection('events')}
                  className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl p-8 border border-amber-500/30 hover:border-amber-500/60 transition cursor-pointer group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Effortless Entertaining</h3>
                  <p className="text-slate-300">
                    Hosting friends, throwing parties, and creating memorable moments in our home together.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-amber-400 font-medium">
                    <span>Plan events</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-12">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Our Journey So Far</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-teal-400">{trips.length}</div>
                    <div className="text-slate-400">Trips Planned</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-purple-400">{wishlist.length}</div>
                    <div className="text-slate-400">Dream Destinations</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-orange-400">{fitnessEvents.length}</div>
                    <div className="text-slate-400">Fitness Goals</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-pink-400">∞</div>
                    <div className="text-slate-400">Adventures Ahead</div>
                  </div>
                </div>
              </div>

              {/* Love Note */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30">
                  <span className="text-2xl">💕</span>
                  <span className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 font-medium">
                    Together since March 2nd, 2025
                  </span>
                  <span className="text-2xl">💕</span>
                </div>
              </div>
            </div>
          )}
          {/* ========== END HOME SECTION ========== */}

          {/* ========== TRAVEL SECTION ========== */}
          {activeSection === 'travel' && (
          <>
          {/* Countdown Banner for Next Trip */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcomingTrips = sortedTrips.filter(t => parseLocalDate(t.dates.start) > today);
            if (upcomingTrips.length === 0) return null;
            const nextTrip = upcomingTrips[0];
            const daysUntil = Math.ceil((parseLocalDate(nextTrip.dates.start) - today) / (1000 * 60 * 60 * 24));
            const tripDuration = Math.ceil((parseLocalDate(nextTrip.dates.end) - parseLocalDate(nextTrip.dates.start)) / (1000 * 60 * 60 * 24)) + 1;

            // Get trip details (hotels, events)
            const details = tripDetails[nextTrip.id] || { hotels: [], events: [], flights: [] };

            // Mock weather based on destination and month
            const tripMonth = parseLocalDate(nextTrip.dates.start).getMonth();
            const getWeather = () => {
              const dest = nextTrip.destination.toLowerCase();
              const isWinter = tripMonth >= 11 || tripMonth <= 2;
              const isSummer = tripMonth >= 5 && tripMonth <= 8;
              if (dest.includes('beach') || dest.includes('island') || dest.includes('key west') || dest.includes('puerto') || dest.includes('caribbean') || dest.includes('provincetown')) {
                return { temp: isSummer ? '88°F' : '78°F', icon: '☀️', desc: 'Sunny & warm' };
              }
              if (dest.includes('london') || dest.includes('seattle')) {
                return { temp: isSummer ? '68°F' : '45°F', icon: '🌧️', desc: 'Might rain' };
              }
              if (dest.includes('nyc') || dest.includes('new york') || dest.includes('chicago')) {
                return { temp: isWinter ? '35°F' : isSummer ? '82°F' : '58°F', icon: isWinter ? '❄️' : '🌤️', desc: isWinter ? 'Bundle up!' : 'Nice weather' };
              }
              return { temp: isSummer ? '75°F' : '65°F', icon: '🌤️', desc: 'Pleasant' };
            };
            const weather = getWeather();

            return (
              <div className={`mt-6 bg-gradient-to-r ${nextTrip.color} rounded-2xl p-4 md:p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex flex-col md:flex-row items-start justify-between gap-4">
                  {/* Left side - Trip info */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        startBouncingEmoji(nextTrip.emoji, rect.left, rect.top);
                      }}
                      className="text-5xl md:text-6xl hover:scale-125 transition-transform cursor-pointer"
                      title="Click me! 🎉"
                    >
                      {nextTrip.emoji}
                    </button>
                    <div className="text-white">
                      <p className="text-sm md:text-base opacity-80 font-medium">Next Adventure</p>
                      <h3 className="text-2xl md:text-3xl font-bold">{nextTrip.destination}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm opacity-80">{tripDuration} days</span>
                        <span className="text-sm opacity-60">•</span>
                        <span className="text-sm flex items-center gap-1">
                          <span>{weather.icon}</span>
                          <span className="opacity-80">{weather.temp}</span>
                        </span>
                        <span className="text-sm opacity-60">•</span>
                        <span className="text-sm opacity-80">
                          {formatDate(nextTrip.dates.start)} - {formatDate(nextTrip.dates.end)}
                        </span>
                      </div>

                      {/* Trip Details - Hotels & Events */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {details.hotels && details.hotels.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                            <Hotel className="w-4 h-4" />
                            <span className="text-sm font-medium">{details.hotels[0].name}</span>
                            {details.hotels[0].nights && (
                              <span className="text-xs opacity-70">({details.hotels[0].nights} nights)</span>
                            )}
                          </div>
                        )}
                        {details.flights && details.flights.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                            <Plane className="w-4 h-4" />
                            <span className="text-sm font-medium">{details.flights[0].airline}</span>
                          </div>
                        )}
                        {details.events && details.events.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                            <Music className="w-4 h-4" />
                            <span className="text-sm font-medium">{event.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Countdown */}
                  <div className="flex items-center gap-3 self-center md:self-start">
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 md:px-6 md:py-3">
                      <div className="text-3xl md:text-5xl font-bold text-white">{daysUntil}</div>
                      <div className="text-xs md:text-sm text-white/80 font-medium">{daysUntil === 1 ? 'day' : 'days'} to go!</div>
                    </div>
                    <div className="text-4xl md:text-5xl">
                      {daysUntil <= 7 ? '🎉' : daysUntil <= 30 ? '✨' : '🗓️'}
                    </div>
                  </div>
                </div>

                {/* Bottom row - Special event & Share */}
                <div className="relative mt-3 flex items-center gap-3 flex-wrap">
                  {nextTrip.special && (
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                      {nextTrip.special}
                    </span>
                  )}
                  {nextTrip.guests && nextTrip.guests.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/15 rounded-full text-white text-sm">
                      <Users className="w-3.5 h-3.5" />
                      +{nextTrip.guests.length} guest{nextTrip.guests.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const text = `${nextTrip.emoji} ${daysUntil} days until ${nextTrip.destination}! ✨\n\n#TravelCountdown #${nextTrip.destination.replace(/[^a-zA-Z]/g, '')}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Trip Countdown', text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert('Countdown copied to clipboard! 📋');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-medium transition"
                  >
                    📤 Share Countdown
                  </button>
                </div>
                <Starburst className="absolute -right-8 -bottom-8 w-32 h-32 text-white/10" />
              </div>
            );
          })()}

          {/* Trip Cards - Confirmed Adventures */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-cyan-400" />
              Our Adventures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {confirmedTrips.map(trip => (
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

                  {/* 3-dot menu button - Owner only */}
                  {isOwner && (
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
                            setShowGuestModal(trip.id);
                            setShowTripMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm"
                        >
                          <Users className="w-4 h-4" />
                          Manage Guests
                          {trip.guests && trip.guests.length > 0 && (
                            <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                              {trip.guests.length}
                            </span>
                          )}
                        </button>
                        {canDeleteTrip(trip.id) && (
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
                        )}
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
                  )}

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
                      {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                    </p>
                    {trip.special && (
                      <div className="mt-3 text-sm font-semibold bg-white/20 inline-block px-3 py-1 rounded-full">
                        {trip.special}
                      </div>
                    )}
                    {/* Guest Count Indicator */}
                    {trip.guests && trip.guests.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {trip.guests.slice(0, 3).map((guest) => (
                            <div
                              key={guest.id}
                              className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/50"
                              title={guest.name}
                            >
                              {guest.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs opacity-80">
                          +{trip.guests.length} guest{trip.guests.length !== 1 ? 's' : ''}
                        </span>
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

          {/* In the Works - Planning Section */}
          {planningTrips.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🔨</span>
                In the Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {planningTrips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`bg-gradient-to-br ${trip.color} rounded-3xl text-white text-left relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl border-2 border-dashed border-white/40 cursor-pointer`}
                  >
                    {/* Stripe pattern overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                    }} />

                    {/* Cover Image */}
                    {trip.coverImage && (
                      <div className="h-28 w-full overflow-hidden">
                        <img
                          src={trip.coverImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />
                      </div>
                    )}

                    <div className={`p-6 ${trip.coverImage ? 'pt-4' : ''} relative z-10`}>
                      {/* Planning Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-500/40 text-yellow-200 text-xs font-bold rounded-full">
                          🔨 Planning
                        </span>
                      </div>

                      <div className="text-4xl mb-3">{trip.emoji}</div>
                      <h3 className="text-xl font-bold leading-tight mb-1">{trip.destination}</h3>
                      <p className="text-white/70 text-sm mb-2">
                        {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                      </p>

                      {/* Theme */}
                      {trip.theme && (
                        <div className="text-sm bg-white/20 px-2 py-1 rounded-lg inline-flex items-center gap-1 mb-3">
                          🎯 {trip.theme}
                        </div>
                      )}

                      {/* Planning Links Count */}
                      {trip.planningLinks && trip.planningLinks.length > 0 && (
                        <div className="text-xs text-white/60 flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          {trip.planningLinks.length} planning link{trip.planningLinks.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Click to view */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-white/60">Click to plan</span>
                        <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

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

            {/* Upcoming Trips This Month */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const monthTrips = sortedTrips.filter(trip => {
                const start = parseLocalDate(trip.dates.start);
                const end = parseLocalDate(trip.dates.end);
                return (start.getMonth() === currentMonth.getMonth() && start.getFullYear() === currentMonth.getFullYear()) ||
                       (end.getMonth() === currentMonth.getMonth() && end.getFullYear() === currentMonth.getFullYear());
              });
              if (monthTrips.length === 0) return null;

              return (
                <div className="mb-6 space-y-2">
                  {monthTrips.map(trip => {
                    const start = parseLocalDate(trip.dates.start);
                    const daysUntil = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
                    const isOngoing = today >= parseLocalDate(trip.dates.start) && today <= parseLocalDate(trip.dates.end);
                    const isPast = today > parseLocalDate(trip.dates.end);

                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTrip(trip)}
                        className={`bg-gradient-to-r ${trip.color} ${trip.isPlanning ? 'opacity-70 border-2 border-dashed border-white/40' : ''} rounded-xl p-3 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden`}
                      >
                        {trip.isPlanning && (
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)'
                          }} />
                        )}
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="text-2xl">{trip.emoji}</span>
                          <div className="text-white">
                            <div className="font-bold flex items-center gap-2">
                              {trip.destination}
                              {trip.isPlanning && <span className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded-full">Planning</span>}
                            </div>
                            <div className="text-sm opacity-80">
                              {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white text-right relative z-10">
                          {trip.isPlanning ? (
                            <span className="text-sm opacity-80">🔨 In the works</span>
                          ) : isPast ? (
                            <span className="text-sm opacity-70">Memories made! 💕</span>
                          ) : isOngoing ? (
                            <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold animate-pulse">🎉 You're there!</span>
                          ) : daysUntil <= 7 ? (
                            <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">🔥 {daysUntil} {daysUntil === 1 ? 'day' : 'days'}!</span>
                          ) : (
                            <span className="text-sm opacity-80">{daysUntil} days away ✨</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {days.map(day => (
                <div key={day} className="text-center text-slate-400 text-xs font-semibold py-2 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 border border-white/10 rounded-xl overflow-hidden">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} className="h-20 md:h-24 bg-white/5 border-r border-b border-white/5" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const tripOnDate = isDateInTrip(day);
                const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isStartDay = tripOnDate && parseLocalDate(tripOnDate.dates.start).toDateString() === checkDate.toDateString();
                const isEndDay = tripOnDate && parseLocalDate(tripOnDate.dates.end).toDateString() === checkDate.toDateString();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = checkDate.toDateString() === today.toDateString();
                const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;

                // Check if this date falls within any visible open date range
                const openDateOnDay = visibleOpenDates.find(od => {
                  const start = parseLocalDate(od.start);
                  const end = parseLocalDate(od.end);
                  return checkDate >= start && checkDate <= end;
                });
                const isOpenDateStart = openDateOnDay && parseLocalDate(openDateOnDay.start).toDateString() === checkDate.toDateString();

                return (
                  <div
                    key={day}
                    className={`h-20 md:h-24 p-1 relative group border-r border-b border-white/5 transition-all ${
                      tripOnDate
                        ? 'cursor-pointer hover:z-10'
                        : openDateOnDay
                        ? 'cursor-pointer hover:z-10'
                        : ''
                    } ${isWeekend && !tripOnDate ? 'bg-white/[0.02]' : 'bg-white/5'} ${
                      openDateOnDay && !tripOnDate ? 'bg-green-500/10' : ''
                    }`}
                    onClick={() => tripOnDate ? setSelectedTrip(tripOnDate) : openDateOnDay ? setShowOpenDateModal(true) : null}
                  >
                    {/* Date number */}
                    <div className={`text-xs font-medium mb-1 flex items-center justify-between ${
                      isToday
                        ? 'text-teal-400'
                        : tripOnDate
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}>
                      <span className={`${isToday ? 'bg-teal-400 text-slate-900 w-5 h-5 rounded-full flex items-center justify-center font-bold' : ''}`}>
                        {day}
                      </span>
                      {isStartDay && <span className="text-xs">🛫</span>}
                      {isEndDay && !isStartDay && <span className="text-xs">🛬</span>}
                    </div>

                    {/* Trip content */}
                    {tripOnDate && (
                      <div className={`${tripOnDate.isPlanning
                        ? 'bg-gradient-to-br ' + tripOnDate.color + ' opacity-60 border-2 border-dashed border-white/50'
                        : 'bg-gradient-to-br ' + tripOnDate.color + ' shadow-md hover:shadow-lg'
                      } rounded-lg p-1.5 h-[calc(100%-20px)] flex flex-col justify-between overflow-hidden transition-shadow relative`}>
                        {/* Planning stripe pattern overlay */}
                        {tripOnDate.isPlanning && (
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)'
                          }} />
                        )}
                        <div className="flex items-center gap-1 relative z-10">
                          <span className="text-sm md:text-base">{tripOnDate.emoji}</span>
                          <span className="text-xs font-semibold text-white truncate hidden md:block">
                            {tripOnDate.destination}
                          </span>
                        </div>
                        {tripOnDate.isPlanning && isStartDay && (
                          <div className="text-xs text-white/90 truncate hidden md:block relative z-10">
                            🔨 Planning
                          </div>
                        )}
                        {!tripOnDate.isPlanning && tripOnDate.special && isStartDay && (
                          <div className="text-xs text-white/80 truncate hidden md:block">
                            {tripOnDate.special}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Open Date indicator */}
                    {openDateOnDay && !tripOnDate && (
                      <div className="bg-gradient-to-br from-green-400/80 to-emerald-500/80 rounded-lg p-1.5 h-[calc(100%-20px)] flex flex-col justify-between overflow-hidden border-2 border-dashed border-green-300/50">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">✨</span>
                          <span className="text-xs font-semibold text-white truncate hidden md:block">
                            Open!
                          </span>
                        </div>
                        {isOpenDateStart && openDateOnDay.note && (
                          <div className="text-xs text-white/90 truncate hidden md:block">
                            {openDateOnDay.note}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hover Preview Card */}
                    {tripOnDate && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 scale-95 group-hover:scale-100">
                        <div className={`bg-gradient-to-br ${tripOnDate.color} ${tripOnDate.isPlanning ? 'border-2 border-dashed border-white/50' : ''} rounded-xl p-3 shadow-2xl min-w-[200px] text-white`}>
                          {tripOnDate.isPlanning && (
                            <div className="mb-2 text-xs bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full inline-flex items-center gap-1">
                              🔨 Planning
                            </div>
                          )}
                          {tripOnDate.coverImage && (
                            <img src={tripOnDate.coverImage} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{tripOnDate.emoji}</span>
                            <span className="font-bold text-lg">{tripOnDate.destination}</span>
                          </div>
                          <div className="text-sm opacity-90">
                            {formatDate(tripOnDate.dates.start, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(tripOnDate.dates.end, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          {tripOnDate.theme && tripOnDate.isPlanning && (
                            <div className="mt-2 text-sm bg-white/20 inline-block px-2 py-1 rounded-full">
                              🎯 {tripOnDate.theme}
                            </div>
                          )}
                          {tripOnDate.special && !tripOnDate.isPlanning && (
                            <div className="mt-2 text-sm bg-white/20 inline-block px-2 py-1 rounded-full">
                              {tripOnDate.special}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2 text-xs">
                            {isStartDay && <span className="bg-white/20 px-2 py-1 rounded-full">🛫 Trip starts!</span>}
                            {isEndDay && <span className="bg-white/20 px-2 py-1 rounded-full">🛬 Last day!</span>}
                            {!isStartDay && !isEndDay && <span className="bg-white/20 px-2 py-1 rounded-full">📍 Day {Math.ceil((checkDate - parseLocalDate(tripOnDate.dates.start)) / (1000 * 60 * 60 * 24)) + 1}</span>}
                          </div>
                          <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                            <span>Click to view details →</span>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/20" />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Fill remaining cells to complete the grid */}
              {[...Array((7 - ((firstDay + daysInMonth) % 7)) % 7)].map((_, i) => (
                <div key={`end-empty-${i}`} className="h-20 md:h-24 bg-white/5 border-r border-b border-white/5" />
              ))}
            </div>

            {/* Legend with more info */}
            <div className="mt-6 flex flex-wrap gap-4">
              {sortedTrips.map(trip => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const start = parseLocalDate(trip.dates.start);
                const daysUntil = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
                const tripDuration = Math.ceil((parseLocalDate(trip.dates.end) - start) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full cursor-pointer transition"
                  >
                    <span className="text-lg">{trip.emoji}</span>
                    <span className="text-white text-sm font-medium">{trip.destination}</span>
                    <span className="text-slate-400 text-xs">({tripDuration}d)</span>
                  </div>
                );
              })}
              {/* Open dates in legend */}
              {visibleOpenDates.length > 0 && (
                <div
                  onClick={() => isOwner && setShowOpenDateModal(true)}
                  className={`flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-full transition border border-dashed border-green-400/50 ${isOwner ? 'hover:bg-green-500/30 cursor-pointer' : ''}`}
                >
                  <span className="text-lg">✨</span>
                  <span className="text-green-300 text-sm font-medium">Open for Travel</span>
                  <span className="text-green-400 text-xs">({visibleOpenDates.length} dates)</span>
                </div>
              )}
            </div>

            {/* Open Dates Summary */}
            {visibleOpenDates.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-300 font-semibold flex items-center gap-2">
                    ✨ {isOwner ? 'Open for Travel Dates' : 'Mike & Adam are available'}
                  </h4>
                  {isOwner && (
                    <button
                      onClick={() => setShowOpenDateModal(true)}
                      className="text-sm text-green-400 hover:text-green-300 underline"
                    >
                      Manage
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleOpenDates.map(od => (
                    <div key={od.id} className="bg-green-500/20 px-3 py-1.5 rounded-full text-sm text-green-200">
                      {new Date(od.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(od.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {od.note && <span className="text-green-400 ml-1">({od.note})</span>}
                      {isOwner && !od.visibleTo.includes('all') && (
                        <span className="ml-1 text-xs text-green-400/70">
                          👁️ {od.visibleTo.map(id => (companions || []).find(c => c.id === id)?.firstName || (companions || []).find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          {/* Travel Quote */}
          <div className="mt-12 mb-8 text-center">
            <div className="max-w-2xl mx-auto px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-lg md:text-xl text-white/80 italic">
                "{travelQuotes[currentQuoteIndex].quote}"
              </p>
              <p className="text-sm text-white/50 mt-2">— {travelQuotes[currentQuoteIndex].author}</p>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="mb-12">
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Travel Achievements</h3>
                  <p className="text-sm text-white/60">
                    {achievementDefinitions.filter(a => a.condition(trips, tripDetails)).length} of {achievementDefinitions.length} unlocked
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-6 h-6 text-white/60 transition-transform ${showAchievements ? 'rotate-90' : ''}`} />
            </button>

            {showAchievements && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievementDefinitions.map(achievement => {
                  const unlocked = achievement.condition(trips, tripDetails);
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl text-center transition ${
                        unlocked
                          ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border border-yellow-500/50'
                          : 'bg-white/5 border border-white/10 opacity-50'
                      }`}
                    >
                      <span className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{achievement.emoji}</span>
                      <div className={`text-sm font-bold mt-2 ${unlocked ? 'text-yellow-300' : 'text-white/50'}`}>
                        {achievement.name}
                      </div>
                      <div className="text-xs text-white/40 mt-1">{achievement.description}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map View */}
          <div className="mb-12">
            <button
              onClick={() => setShowMapView(!showMapView)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl border border-teal-500/30 hover:border-teal-500/50 transition"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-teal-400" />
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Our Adventures Map</h3>
                  <p className="text-sm text-white/60">{trips.length + wishlist.length} destinations on our list</p>
                </div>
              </div>
              <ChevronRight className={`w-6 h-6 text-white/60 transition-transform ${showMapView ? 'rotate-90' : ''}`} />
            </button>

            {showMapView && (
              <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...trips, ...wishlist].map(trip => (
                    <div
                      key={trip.id}
                      onClick={() => !trip.isWishlist && setSelectedTrip(trip)}
                      className={`p-3 rounded-xl ${trip.isWishlist ? 'bg-white/5 border border-dashed border-white/20' : `bg-gradient-to-br ${trip.color}`} cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <div className="text-2xl mb-1">{trip.emoji}</div>
                      <div className="text-sm font-medium text-white">{trip.destination}</div>
                      {trip.dates && (
                        <div className="text-xs text-white/60">
                          {formatDate(trip.dates.start, { month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      {trip.isWishlist && (
                        <div className="text-xs text-purple-400 mt-1">✨ Wishlist</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Love Note */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30">
              <span className="text-xl">🏳️‍🌈</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-300 to-indigo-300 font-medium">
                Every adventure is better with you, Adam
              </span>
              <span className="text-xl">💕</span>
            </div>
            <p className="text-slate-500 text-sm mt-3">Made with love in 2026 🦄</p>
          </div>
          </>
          )}
          {/* ========== END TRAVEL SECTION ========== */}

          {/* ========== FITNESS SECTION ========== */}
          {activeSection === 'fitness' && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">🏃 Fitness Training</h2>
                <p className="text-slate-400">Train together, achieve together</p>
              </div>

              {/* Fitness View Mode Toggle */}
              <div className="flex gap-2 mb-6 justify-center">
                {[
                  { id: 'events', label: 'Events', emoji: '🎯' },
                  { id: 'training', label: 'Training Plan', emoji: '📋' },
                  { id: 'stats', label: 'Stats', emoji: '📊' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setFitnessViewMode(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                      fitnessViewMode === mode.id
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <span>{mode.emoji}</span>
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Events View */}
              {fitnessViewMode === 'events' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {fitnessEvents.map(event => {
                    const eventDate = parseLocalDate(event.date);
                    const today = new Date();
                    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                    const weeksUntil = Math.ceil(daysUntil / 7);
                    const isPast = daysUntil < 0;
                    const trainingPlan = getActiveTrainingPlan(event.id);
                    const completedWorkouts = trainingPlan.reduce((acc, week) => {
                      const runsDone = week.runs?.filter(r => r.mike && r.adam).length || 0;
                      const crossDone = week.crossTraining?.filter(c => c.mike && c.adam).length || 0;
                      return acc + runsDone + crossDone;
                    }, 0);
                    const totalWorkouts = trainingPlan.reduce((acc, week) => {
                      return acc + (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                    }, 0);

                    return (
                      <div
                        key={event.id}
                        className={`bg-gradient-to-br ${event.color} rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={() => {
                          setSelectedFitnessEvent(event);
                          setFitnessViewMode('training');
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className="text-4xl">{event.emoji}</span>
                              <h3 className="text-2xl font-bold text-white mt-2">{event.name}</h3>
                              <p className="text-white/80">{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className={`text-right px-4 py-2 rounded-full ${isPast ? 'bg-green-500/30' : 'bg-white/20'}`}>
                              {isPast ? (
                                <span className="text-white font-bold">✓ Completed!</span>
                              ) : (
                                <>
                                  <div className="text-3xl font-bold text-white">{daysUntil}</div>
                                  <div className="text-xs text-white/80 uppercase">days to go</div>
                                </>
                              )}
                            </div>
                          </div>

                          {!isPast && (
                            <>
                              <div className="flex items-center gap-2 text-white/80 mb-3">
                                <Clock className="w-4 h-4" />
                                <span>{weeksUntil} weeks of training</span>
                              </div>

                              {/* Progress Bar */}
                              {totalWorkouts > 0 && (
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm text-white/80 mb-1">
                                    <span>Progress</span>
                                    <span>{completedWorkouts}/{totalWorkouts} workouts</span>
                                  </div>
                                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-white rounded-full transition-all"
                                      style={{ width: `${(completedWorkouts / totalWorkouts) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-white/60 text-sm">Click to view training plan →</span>
                            <div className="flex gap-1">
                              {['🏃', '💪', '🎯'].map((e, i) => (
                                <span key={i} className="text-xl opacity-50 group-hover:opacity-100 transition">{e}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Training Plan View */}
              {fitnessViewMode === 'training' && (
                <div>
                  {/* Event Selector */}
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {fitnessEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedFitnessEvent(event);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                          selectedFitnessEvent?.id === event.id
                            ? `bg-gradient-to-r ${event.color} text-white`
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <span>{event.emoji}</span>
                        {event.name}
                      </button>
                    ))}
                  </div>

                  {selectedFitnessEvent && getActiveTrainingPlan(selectedFitnessEvent.id) && (
                    <div className="space-y-4">
                      {/* Stats and Encouragement */}
                      {(() => {
                        const plan = getActiveTrainingPlan(selectedFitnessEvent.id);
                        // A week is "done" if both Mike and Adam completed all workouts
                        const completedWeeks = plan.filter(w =>
                          w.runs?.every(r => r.mike && r.adam) && w.crossTraining?.every(c => c.mike && c.adam)
                        ).length;
                        // Calculate miles for Mike and Adam separately
                        const mikeMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.mike).reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0) || 0;
                          return acc + weekMiles;
                        }, 0);
                        const adamMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.adam).reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0) || 0;
                          return acc + weekMiles;
                        }, 0);
                        const mikeWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0), 0);
                        const adamWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.adam).length || 0) + (w.crossTraining?.filter(c => c.adam).length || 0), 0);

                        const encouragements = [
                          "You're crushing it! 💪",
                          "Every mile makes you stronger! 🔥",
                          "Keep going, champions! 🏆",
                          "The finish line is waiting for you! 🎯",
                          "Together you're unstoppable! 💕"
                        ];
                        const encouragement = encouragements[Math.floor(mikeMiles + adamMiles) % encouragements.length];

                        return (
                          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30 mb-6">
                            {/* Color Legend */}
                            <div className="flex justify-center gap-6 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                <span className="text-blue-400">Mike</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                                <span className="text-purple-400">Adam</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500/40"></div>
                                <span className="text-green-400">Both ✓</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-500/40"></div>
                                <span className="text-yellow-400">One ✓</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                              <div>
                                <div className="text-3xl font-bold text-orange-400">{completedWeeks}</div>
                                <div className="text-white/60 text-sm">Weeks Done (Both)</div>
                              </div>
                              <div>
                                <div className="flex justify-center gap-4">
                                  <div>
                                    <div className="text-2xl font-bold text-blue-400">{mikeMiles.toFixed(1)}</div>
                                    <div className="text-white/40 text-xs">Mike</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-purple-400">{adamMiles.toFixed(1)}</div>
                                    <div className="text-white/40 text-xs">Adam</div>
                                  </div>
                                </div>
                                <div className="text-white/60 text-sm">Miles Run</div>
                              </div>
                              <div>
                                <div className="flex justify-center gap-4">
                                  <div>
                                    <div className="text-2xl font-bold text-blue-400">{mikeWorkouts}</div>
                                    <div className="text-white/40 text-xs">Mike</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-purple-400">{adamWorkouts}</div>
                                    <div className="text-white/40 text-xs">Adam</div>
                                  </div>
                                </div>
                                <div className="text-white/60 text-sm">Workouts</div>
                              </div>
                            </div>
                            <div className="text-center text-lg text-white font-medium">
                              {encouragement}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Current Week Highlight */}
                      {(() => {
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        const currentWeek = getActiveTrainingPlan(selectedFitnessEvent.id).find(
                          week => week.startDate <= todayStr && week.endDate >= todayStr
                        );
                        const currentWeekIndex = getActiveTrainingPlan(selectedFitnessEvent.id).findIndex(
                          week => week.startDate <= todayStr && week.endDate >= todayStr
                        );

                        if (currentWeek) {
                          return (
                            <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl p-6 border-2 border-orange-500/50 mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">📅</span>
                                <h3 className="text-xl font-bold text-white">This Week - Week {currentWeek.weekNumber || currentWeekIndex + 1}</h3>
                                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">CURRENT</span>
                                {currentWeek.totalMiles && (
                                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">{currentWeek.totalMiles} mi goal</span>
                                )}
                                <button
                                  onClick={() => setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...currentWeek } })}
                                  className="ml-auto p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition"
                                  title="Edit week"
                                >
                                  <Pencil className="w-5 h-5" />
                                </button>
                              </div>
                              {currentWeek.weekNotes && (
                                <div className="mb-4 px-4 py-2 bg-white/10 rounded-lg text-white/90">{currentWeek.weekNotes}</div>
                              )}

                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Runs */}
                                <div className="bg-white/10 rounded-xl p-4">
                                  <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
                                    <span>🏃</span> Runs
                                  </h4>
                                  <div className="space-y-2">
                                    {currentWeek.runs?.map(run => (
                                      <div
                                        key={run.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                          ('adam' in run)
                                            ? ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')
                                            : (run.mike ? 'bg-green-500/20' : 'bg-white/5')
                                        }`}
                                      >
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { mike: !run.mike })}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                              run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'
                                            }`}
                                            title="Mike"
                                          >
                                            {run.mike && <Check className="w-4 h-4 text-white" />}
                                          </button>
                                          {'adam' in run && (
                                            <button
                                              onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { adam: !run.adam })}
                                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                                run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'
                                              }`}
                                              title="Adam"
                                            >
                                              {run.adam && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">{run.label || run.day}</div>
                                          <div className="text-xs text-white/50">
                                            {'adam' in run ? (
                                              <>
                                                <span className={run.mike ? 'text-blue-400' : 'text-white/30'}>M</span>
                                                {' / '}
                                                <span className={run.adam ? 'text-purple-400' : 'text-white/30'}>A</span>
                                              </>
                                            ) : (
                                              <span className={run.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-white font-bold">{run.distance}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Cross Training */}
                                <div className="bg-white/10 rounded-xl p-4">
                                  <h4 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                                    <span>💪</span> Cross Training
                                  </h4>
                                  <div className="space-y-2">
                                    {currentWeek.crossTraining?.map(ct => (
                                      <div
                                        key={ct.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                          ('adam' in ct)
                                            ? ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')
                                            : (ct.mike ? 'bg-green-500/20' : 'bg-white/5')
                                        }`}
                                      >
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { mike: !ct.mike })}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                              ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'
                                            }`}
                                            title="Mike"
                                          >
                                            {ct.mike && <Check className="w-4 h-4 text-white" />}
                                          </button>
                                          {'adam' in ct && (
                                            <button
                                              onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { adam: !ct.adam })}
                                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                                ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'
                                              }`}
                                              title="Adam"
                                            >
                                              {ct.adam && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">{ct.label || ct.day}</div>
                                          <div className="text-xs text-white/50">
                                            {'adam' in ct ? (
                                              <>
                                                <span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>M</span>
                                                {' / '}
                                                <span className={ct.adam ? 'text-purple-400' : 'text-white/30'}>A</span>
                                              </>
                                            ) : (
                                              <span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span>
                                            )}
                                          </div>
                                        </div>
                                        <span className="text-white/60 text-sm">30+ min</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Week Notes */}
                              <div className="mt-4">
                                <textarea
                                  value={currentWeek.weekNotes}
                                  onChange={(e) => updateTrainingWeek(selectedFitnessEvent.id, currentWeek.id, { weekNotes: e.target.value })}
                                  placeholder="Add notes for this week..."
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none"
                                  rows={2}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* All Weeks Accordion */}
                      <div className="space-y-2">
                        {getActiveTrainingPlan(selectedFitnessEvent.id).map((week, index) => {
                          const today = new Date();
                          const todayStr = today.toISOString().split('T')[0];
                          const isCurrent = week.startDate <= todayStr && week.endDate >= todayStr;
                          const isPast = week.endDate < todayStr;
                          const completedCount = (week.runs?.filter(r => r.mike && r.adam).length || 0) + (week.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                          const totalCount = (week.runs?.length || 0) + (week.crossTraining?.length || 0);

                          return (
                            <details
                              key={week.id}
                              className={`group bg-white/5 rounded-xl border transition ${
                                isCurrent ? 'border-orange-500/50' : 'border-white/10 hover:border-white/20'
                              } ${week.isRecovery ? 'bg-green-500/10' : ''}`}
                              open={isCurrent}
                            >
                              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isCurrent ? 'bg-orange-500 text-white' : isPast ? 'bg-white/20 text-white/60' : 'bg-white/10 text-white/80'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium flex items-center gap-2">
                                      Week {index + 1}
                                      {week.isRecovery && <span className="text-xs px-2 py-0.5 bg-green-500/30 text-green-300 rounded-full">Recovery</span>}
                                      {isCurrent && <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">Current</span>}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                      {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-white/60 text-sm">
                                    {completedCount}/{totalCount} done
                                  </div>
                                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${completedCount === totalCount ? 'bg-green-500' : 'bg-orange-400'}`}
                                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...week } });
                                    }}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition"
                                    title="Edit week"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                                </div>
                              </summary>

                              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Runs */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-orange-300 mb-2">🏃 Runs</h4>
                                    <div className="space-y-1">
                                      {week.runs?.map(run => (
                                        <div
                                          key={run.id}
                                          className={`flex items-center gap-2 p-2 rounded ${
                                            ('adam' in run)
                                              ? ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')
                                              : (run.mike ? 'bg-green-500/20' : 'bg-white/5')
                                          }`}
                                        >
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { mike: !run.mike })}
                                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'
                                              }`}
                                              title="Mike"
                                            >
                                              {run.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {'adam' in run && (
                                              <button
                                                onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { adam: !run.adam })}
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                  run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'
                                                }`}
                                                title="Adam"
                                              >
                                                {run.adam && <Check className="w-3 h-3 text-white" />}
                                              </button>
                                            )}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{run.label || run.day}</span>
                                          <span className="text-white font-medium text-sm">{run.distance}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Cross Training */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-red-300 mb-2">💪 Cross Training</h4>
                                    <div className="space-y-1">
                                      {week.crossTraining?.map(ct => (
                                        <div
                                          key={ct.id}
                                          className={`flex items-center gap-2 p-2 rounded ${
                                            ('adam' in ct)
                                              ? ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')
                                              : (ct.mike ? 'bg-green-500/20' : 'bg-white/5')
                                          }`}
                                        >
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { mike: !ct.mike })}
                                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'
                                              }`}
                                              title="Mike"
                                            >
                                              {ct.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {'adam' in ct && (
                                              <button
                                                onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { adam: !ct.adam })}
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                  ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'
                                                }`}
                                                title="Adam"
                                              >
                                                {ct.adam && <Check className="w-3 h-3 text-white" />}
                                              </button>
                                            )}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{ct.label || ct.day}</span>
                                          <span className="text-white/60 text-xs">30+ min</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Week Notes */}
                                <div className="mt-3">
                                  <textarea
                                    value={week.weekNotes}
                                    onChange={(e) => updateTrainingWeek(selectedFitnessEvent.id, week.id, { weekNotes: e.target.value })}
                                    placeholder="Notes for this week..."
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm resize-none"
                                    rows={1}
                                  />
                                </div>
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!selectedFitnessEvent && (
                    <div className="text-center text-white/60 py-12">
                      <span className="text-4xl mb-4 block">👆</span>
                      <p>Select an event above to view its training plan</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats View */}
              {fitnessViewMode === 'stats' && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Total Stats */}
                  {(() => {
                    let totalRuns = 0;
                    let mikeRuns = 0;
                    let adamRuns = 0;
                    let totalCross = 0;
                    let mikeCross = 0;
                    let adamCross = 0;
                    let mikeMiles = 0;
                    let adamMiles = 0;

                    Object.values(fitnessTrainingPlans).forEach(plan => {
                      plan.forEach(week => {
                        week.runs?.forEach(run => {
                          totalRuns++;
                          const miles = parseFloat(run.distance) || 0;
                          if (run.mike) {
                            mikeRuns++;
                            mikeMiles += miles;
                          }
                          if (run.adam) {
                            adamRuns++;
                            adamMiles += miles;
                          }
                        });
                        week.crossTraining?.forEach(ct => {
                          totalCross++;
                          if (ct.mike) mikeCross++;
                          if (ct.adam) adamCross++;
                        });
                      });
                    });

                    return (
                      <>
                        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
                          <div className="text-4xl mb-2">🏃</div>
                          <div className="text-xl font-bold text-white mb-2">Runs Completed</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeRuns}</div>
                              <div className="text-xs text-white/60">Mike</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamRuns}</div>
                              <div className="text-xs text-white/60">Adam</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-orange-300 text-center">{totalRuns} total runs in plan</div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-500/30">
                          <div className="text-4xl mb-2">💪</div>
                          <div className="text-xl font-bold text-white mb-2">Cross Training</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeCross}</div>
                              <div className="text-xs text-white/60">Mike</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamCross}</div>
                              <div className="text-xs text-white/60">Adam</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-red-300 text-center">{totalCross} total sessions in plan</div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                          <div className="text-4xl mb-2">📏</div>
                          <div className="text-xl font-bold text-white mb-2">Miles Logged</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeMiles.toFixed(1)}</div>
                              <div className="text-xs text-white/60">Mike</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamMiles.toFixed(1)}</div>
                              <div className="text-xs text-white/60">Adam</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-yellow-300 text-center">Keep going! 🔥</div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Weekly Streak */}
                  <div className="md:col-span-3 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Training Consistency
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {fitnessEvents.map(event => {
                        const plan = getActiveTrainingPlan(event.id);
                        return plan.slice(0, 12).map((week, i) => {
                          // Count workouts where both Mike AND Adam completed
                          const completed = (week.runs?.filter(r => r.mike && r.adam).length || 0) + (week.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                          const total = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                          const percentage = total > 0 ? (completed / total) * 100 : 0;

                          return (
                            <div
                              key={week.id}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                                percentage === 100 ? 'bg-green-500 text-white' :
                                percentage >= 50 ? 'bg-yellow-500 text-white' :
                                percentage > 0 ? 'bg-orange-500/50 text-white' :
                                'bg-white/10 text-white/40'
                              }`}
                              title={`Week ${i + 1}: ${completed}/${total}`}
                            >
                              {i + 1}
                            </div>
                          );
                        });
                      })}
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-white/60">100%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span className="text-white/60">50-99%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500/50 rounded" />
                        <span className="text-white/60">1-49%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <span className="text-white/60">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Love Note for Fitness */}
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full border border-red-500/30">
                  <span className="text-xl">💪</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 font-medium">
                    Stronger together, one workout at a time
                  </span>
                  <span className="text-xl">❤️</span>
                </div>
              </div>
            </div>
          )}
          {/* ========== END FITNESS SECTION ========== */}

          {/* ========== NUTRITION SECTION ========== */}
          {activeSection === 'nutrition' && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">🥗 Nutrition</h2>
                <p className="text-slate-400">Recipes, meal planning & grocery lists</p>
              </div>

              {/* Coming Soon Placeholder */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl p-8 text-center border border-green-500/30">
                <div className="text-6xl mb-4">👨‍🍳</div>
                <h3 className="text-2xl font-bold text-white mb-2">Nutrition Section Coming Soon!</h3>
                <p className="text-slate-300 mb-4">Plan meals together with:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="bg-white/10 px-4 py-2 rounded-full text-green-300">
                    📖 Recipe Collection
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-emerald-300">
                    📅 Meal Planning
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-lime-300">
                    🛒 Grocery Lists
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ========== END NUTRITION SECTION ========== */}

          {/* ========== EVENTS SECTION ========== */}
          {activeSection === 'events' && (
            <div className="mt-8">
              {/* Event Detail View */}
              {selectedPartyEvent ? (
                <div>
                  {/* Back Button & Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedPartyEvent(null)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-4xl">{selectedPartyEvent.emoji}</span>
                        {selectedPartyEvent.name}
                      </h2>
                      <p className="text-slate-400">
                        {formatDate(selectedPartyEvent.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        {selectedPartyEvent.time && ` at ${selectedPartyEvent.time}`}
                        {selectedPartyEvent.endTime && ` - ${selectedPartyEvent.endTime}`}
                      </p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setEditingEvent(selectedPartyEvent)}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                        title="Edit event"
                      >
                        <Edit3 className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Event Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Location Card */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">Location</span>
                      </div>
                      <p className="text-white">{selectedPartyEvent.location || 'TBD'}</p>
                      {selectedPartyEvent.entryCode && (
                        <p className="text-slate-400 text-sm mt-1">
                          🔑 {selectedPartyEvent.entryCode}
                        </p>
                      )}
                    </div>

                    {/* Time Card */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Time</span>
                      </div>
                      <p className="text-white">
                        {selectedPartyEvent.time || 'TBD'}
                        {selectedPartyEvent.endTime && ` - ${selectedPartyEvent.endTime}`}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {formatDate(selectedPartyEvent.date, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedPartyEvent.description && (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                      <h3 className="text-white font-semibold mb-2">📝 Details</h3>
                      <p className="text-slate-300">{selectedPartyEvent.description}</p>
                    </div>
                  )}

                  {/* Event Photos */}
                  <div
                    className={`bg-white/10 rounded-2xl p-4 border border-white/20 mb-6 transition ${
                      dragOverEventId === selectedPartyEvent.id ? 'border-purple-500 bg-purple-500/10' : ''
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverEventId(selectedPartyEvent.id); }}
                    onDragLeave={() => setDragOverEventId(null)}
                    onDrop={(e) => handleEventCardDrop(e, selectedPartyEvent.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Image className="w-5 h-5 text-purple-400" />
                        Photos ({(selectedPartyEvent.images || []).length})
                      </h3>
                      {uploadingToEventId === selectedPartyEvent.id && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>

                    {/* Photo Grid */}
                    {(selectedPartyEvent.images || []).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                        {(selectedPartyEvent.images || []).map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden">
                            <img src={img} alt={`Event photo ${idx + 1}`} className="w-full h-full object-cover" />
                            {isOwner && (
                              <button
                                onClick={() => {
                                  const newEvents = partyEvents.map(e =>
                                    e.id === selectedPartyEvent.id
                                      ? { ...e, images: e.images.filter((_, i) => i !== idx) }
                                      : e
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-4 mb-4">No photos yet - drop images here or use the button below</p>
                    )}

                    {/* Upload Button */}
                    {(isOwner || (selectedPartyEvent.guests || []).some(g => g.email === user?.email && g.permission === 'edit')) && (
                      <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition border-2 border-dashed ${
                        uploadingToEventId === selectedPartyEvent.id
                          ? 'bg-white/5 text-white/40 border-white/10'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-purple-500'
                      }`}>
                        {uploadingToEventId === selectedPartyEvent.id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        <span>{uploadingToEventId === selectedPartyEvent.id ? 'Uploading...' : 'Add Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingToEventId === selectedPartyEvent.id}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              if (file.type.startsWith('image/')) {
                                uploadPhotoToEvent(file, selectedPartyEvent.id);
                              }
                            });
                          }}
                        />
                      </label>
                    )}

                    {dragOverEventId === selectedPartyEvent.id && (
                      <div className="text-center text-purple-400 mt-2 text-sm">Drop images here to add</div>
                    )}
                  </div>

                  {/* Guest List with RSVP */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        Guest List ({(selectedPartyEvent.guests || []).length + 2})
                      </h3>
                      {isOwner && (
                        <div className="text-sm text-slate-400">
                          ✅ {(selectedPartyEvent.guests || []).filter(g => g.rsvp === 'yes').length + 2} confirmed
                        </div>
                      )}
                    </div>

                    {/* Hosts */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-3 py-2 rounded-full border border-purple-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="text-white text-sm">Mike</span>
                        <span className="text-xs bg-purple-500/50 text-purple-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 px-3 py-2 rounded-full border border-blue-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                        <span className="text-white text-sm">Adam</span>
                        <span className="text-xs bg-blue-500/50 text-blue-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                    </div>

                    {/* Invited Guests */}
                    {(selectedPartyEvent.guests || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {(selectedPartyEvent.guests || []).map(guest => (
                          <div key={guest.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {(guest.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white text-sm">{guest.email}</div>
                                <div className="text-slate-500 text-xs">
                                  {guest.permission === 'edit' ? '✏️ Can edit' : '👁️ View only'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* RSVP Status */}
                              <select
                                value={guest.rsvp || 'pending'}
                                onChange={(e) => {
                                  const newEvents = partyEvents.map(ev =>
                                    ev.id === selectedPartyEvent.id
                                      ? {
                                          ...ev,
                                          guests: ev.guests.map(g =>
                                            g.id === guest.id ? { ...g, rsvp: e.target.value } : g
                                          )
                                        }
                                      : ev
                                  );
                                  setPartyEvents(newEvents);
                                  setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                  savePartyEventsToFirestore(newEvents);
                                }}
                                className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${
                                  guest.rsvp === 'yes' ? 'bg-green-500/30 text-green-300' :
                                  guest.rsvp === 'no' ? 'bg-red-500/30 text-red-300' :
                                  guest.rsvp === 'maybe' ? 'bg-yellow-500/30 text-yellow-300' :
                                  'bg-slate-500/30 text-slate-300'
                                }`}
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="yes">✅ Going</option>
                                <option value="no">❌ Not Going</option>
                                <option value="maybe">🤔 Maybe</option>
                              </select>
                              {isOwner && (
                                <button
                                  onClick={() => {
                                    const newEvents = partyEvents.map(ev =>
                                      ev.id === selectedPartyEvent.id
                                        ? { ...ev, guests: ev.guests.filter(g => g.id !== guest.id) }
                                        : ev
                                    );
                                    setPartyEvents(newEvents);
                                    setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                    savePartyEventsToFirestore(newEvents);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-400 transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Guest */}
                    {isOwner && (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Add guest email..."
                          value={eventGuestEmail}
                          onChange={(e) => setEventGuestEmail(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && eventGuestEmail.includes('@')) {
                              const newGuest = {
                                id: Date.now(),
                                email: eventGuestEmail,
                                permission: eventGuestPermission,
                                rsvp: 'pending',
                                addedBy: currentUser,
                                addedAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, guests: [...(ev.guests || []), newGuest] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setEventGuestEmail('');
                            }
                          }}
                        />
                        <select
                          value={eventGuestPermission}
                          onChange={(e) => setEventGuestPermission(e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
                        >
                          <option value="edit">✏️ Edit</option>
                          <option value="view">👁️ View</option>
                        </select>
                        <button
                          onClick={() => {
                            if (eventGuestEmail.includes('@')) {
                              const newGuest = {
                                id: Date.now(),
                                email: eventGuestEmail,
                                permission: eventGuestPermission,
                                rsvp: 'pending',
                                addedBy: currentUser,
                                addedAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, guests: [...(ev.guests || []), newGuest] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setEventGuestEmail('');
                            }
                          }}
                          disabled={!eventGuestEmail.includes('@')}
                          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Task List */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-400" />
                        To-Do List
                      </h3>
                      <div className="text-sm text-slate-400">
                        {(selectedPartyEvent.tasks || []).filter(t => t.completed).length}/{(selectedPartyEvent.tasks || []).length} done
                      </div>
                    </div>

                    {/* Task Items */}
                    <div className="space-y-2 mb-4">
                      {(selectedPartyEvent.tasks || []).map(task => (
                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl transition ${task.completed ? 'bg-green-500/10' : 'bg-white/5'}`}>
                          <button
                            onClick={() => {
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? {
                                      ...ev,
                                      tasks: ev.tasks.map(t =>
                                        t.id === task.id ? { ...t, completed: !t.completed } : t
                                      )
                                    }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                            }}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-500 hover:border-green-500'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                            <span className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.text}
                            </span>
                            {task.assignee && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                task.assignee === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                                task.assignee === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                                'bg-amber-500/30 text-amber-300'
                              }`}>
                                {task.assignee}
                              </span>
                            )}
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => {
                                const newEvents = partyEvents.map(ev =>
                                  ev.id === selectedPartyEvent.id
                                    ? { ...ev, tasks: ev.tasks.filter(t => t.id !== task.id) }
                                    : ev
                                );
                                setPartyEvents(newEvents);
                                setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                                savePartyEventsToFirestore(newEvents);
                              }}
                              className="p-1 text-slate-400 hover:text-red-400 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {(selectedPartyEvent.tasks || []).length === 0 && (
                        <p className="text-slate-500 text-center py-4">No tasks yet</p>
                      )}
                    </div>

                    {/* Add Task */}
                    {(isOwner || (selectedPartyEvent.guests || []).some(g => g.email === user?.email && g.permission === 'edit')) && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a task..."
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTaskText.trim()) {
                              const newTask = {
                                id: Date.now(),
                                text: newTaskText.trim(),
                                assignee: newTaskAssignee || null,
                                completed: false,
                                createdBy: currentUser,
                                createdAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, tasks: [...(ev.tasks || []), newTask] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setNewTaskText('');
                              setNewTaskAssignee('');
                            }
                          }}
                        />
                        <select
                          value={newTaskAssignee}
                          onChange={(e) => setNewTaskAssignee(e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          <option value="Mike">Mike</option>
                          <option value="Adam">Adam</option>
                          {(selectedPartyEvent.guests || []).map(g => (
                            <option key={g.id} value={g.email}>{g.email.split('@')[0]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (newTaskText.trim()) {
                              const newTask = {
                                id: Date.now(),
                                text: newTaskText.trim(),
                                assignee: newTaskAssignee || null,
                                completed: false,
                                createdBy: currentUser,
                                createdAt: new Date().toISOString()
                              };
                              const newEvents = partyEvents.map(ev =>
                                ev.id === selectedPartyEvent.id
                                  ? { ...ev, tasks: [...(ev.tasks || []), newTask] }
                                  : ev
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setNewTaskText('');
                              setNewTaskAssignee('');
                            }
                          }}
                          disabled={!newTaskText.trim()}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Events List View */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white">🎉 Events</h2>
                      <p className="text-slate-400">Plan parties and gather friends</p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setShowAddEventModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                      >
                        <Plus className="w-5 h-5" />
                        New Event
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2 mb-6">
                    {['upcoming', 'past', 'all'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setEventViewMode(mode)}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          eventViewMode === mode
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {mode === 'upcoming' ? '📅 Upcoming' : mode === 'past' ? '📜 Past' : '📋 All'}
                      </button>
                    ))}
                  </div>

                  {/* Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partyEvents
                      .filter(event => {
                        const eventDate = parseLocalDate(event.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (eventViewMode === 'upcoming') return eventDate >= today;
                        if (eventViewMode === 'past') return eventDate < today;
                        return true;
                      })
                      .sort((a, b) => {
                        const dateA = parseLocalDate(a.date);
                        const dateB = parseLocalDate(b.date);
                        return eventViewMode === 'past' ? dateB - dateA : dateA - dateB;
                      })
                      .map(event => {
                        const eventDate = parseLocalDate(event.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                        const isPast = eventDate < today;
                        const isToday = daysUntil === 0;

                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedPartyEvent(event)}
                            onDragOver={(e) => { e.preventDefault(); setDragOverEventId(event.id); }}
                            onDragLeave={() => setDragOverEventId(null)}
                            onDrop={(e) => { e.stopPropagation(); handleEventCardDrop(e, event.id); }}
                            className={`relative bg-gradient-to-br ${event.color || 'from-purple-500/30 to-pink-500/30'} rounded-2xl p-5 border cursor-pointer hover:scale-[1.02] transition-all ${isPast ? 'opacity-60' : ''} ${
                              dragOverEventId === event.id ? 'border-purple-500 scale-105' : 'border-white/20'
                            }`}
                          >
                            {/* Upload indicator */}
                            {uploadingToEventId === event.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                                <Loader className="w-8 h-8 text-purple-500 animate-spin" />
                              </div>
                            )}
                            {/* Drop indicator */}
                            {dragOverEventId === event.id && (
                              <div className="absolute inset-0 bg-purple-500/30 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-white font-semibold">📷 Drop to add photo</div>
                              </div>
                            )}
                            {/* Photo preview if event has images */}
                            {(event.images || []).length > 0 && (
                              <div className="absolute top-2 right-2 flex -space-x-2">
                                {(event.images || []).slice(0, 3).map((img, i) => (
                                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/50 overflow-hidden">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {(event.images || []).length > 3 && (
                                  <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                    +{(event.images || []).length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-4xl">{event.emoji}</span>
                              {!isPast && !(event.images || []).length && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  isToday ? 'bg-green-500 text-white' :
                                  daysUntil <= 7 ? 'bg-amber-500 text-white' :
                                  'bg-white/20 text-white'
                                }`}>
                                  {isToday ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </span>
                              )}
                              {isPast && !(event.images || []).length && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-500/50 text-slate-300">
                                  Past
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                            <p className="text-white/80 text-sm mb-3">
                              {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                              {event.time && ` • ${event.time}`}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Users className="w-4 h-4" />
                                <span>{(event.guests || []).length + 2}</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <Image className="w-4 h-4" />
                                <span>{(event.images || []).length}</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/70 text-sm">
                                <CheckSquare className="w-4 h-4" />
                                <span>{(event.tasks || []).filter(t => t.completed).length}/{(event.tasks || []).length}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Empty State */}
                    {partyEvents.filter(event => {
                      const eventDate = parseLocalDate(event.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (eventViewMode === 'upcoming') return eventDate >= today;
                      if (eventViewMode === 'past') return eventDate < today;
                      return true;
                    }).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">🎈</div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {eventViewMode === 'upcoming' ? 'No upcoming events' :
                           eventViewMode === 'past' ? 'No past events' : 'No events yet'}
                        </h3>
                        <p className="text-slate-400 mb-4">
                          {isOwner ? 'Create your first event to get started!' : 'Check back soon for new events!'}
                        </p>
                        {isOwner && (
                          <button
                            onClick={() => setShowAddEventModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                          >
                            Create Event
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Add/Edit Event Modal */}
              {(showAddEventModal || editingEvent) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">
                        {editingEvent ? 'Edit Event' : 'New Event'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddEventModal(false);
                          setEditingEvent(null);
                          setNewEventData({
                            name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                            location: '', entryCode: '', description: '', color: 'from-purple-400 to-pink-500'
                          });
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Event Name & Emoji */}
                      <div className="flex gap-3">
                        <div className="relative">
                          <button
                            type="button"
                            className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl hover:bg-white/20 transition border border-white/20"
                            onClick={() => {
                              const allEmojis = Object.values(eventCategories).flat();
                              const currentIdx = allEmojis.indexOf(editingEvent ? editingEvent.emoji : newEventData.emoji);
                              const nextIdx = (currentIdx + 1) % allEmojis.length;
                              if (editingEvent) {
                                setEditingEvent({ ...editingEvent, emoji: allEmojis[nextIdx] });
                              } else {
                                setNewEventData({ ...newEventData, emoji: allEmojis[nextIdx] });
                              }
                            }}
                          >
                            {editingEvent ? editingEvent.emoji : newEventData.emoji}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Event name"
                          value={editingEvent ? editingEvent.name : newEventData.name}
                          onChange={(e) => {
                            if (editingEvent) {
                              setEditingEvent({ ...editingEvent, name: e.target.value });
                            } else {
                              setNewEventData({ ...newEventData, name: e.target.value });
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Date</label>
                          <input
                            type="date"
                            value={editingEvent ? editingEvent.date : newEventData.date}
                            onChange={(e) => {
                              if (editingEvent) {
                                setEditingEvent({ ...editingEvent, date: e.target.value });
                              } else {
                                setNewEventData({ ...newEventData, date: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={editingEvent ? editingEvent.time : newEventData.time}
                            onChange={(e) => {
                              if (editingEvent) {
                                setEditingEvent({ ...editingEvent, time: e.target.value });
                              } else {
                                setNewEventData({ ...newEventData, time: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">End Time</label>
                          <input
                            type="time"
                            value={editingEvent ? editingEvent.endTime : newEventData.endTime}
                            onChange={(e) => {
                              if (editingEvent) {
                                setEditingEvent({ ...editingEvent, endTime: e.target.value });
                              } else {
                                setNewEventData({ ...newEventData, endTime: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="Address or location name"
                          value={editingEvent ? editingEvent.location : newEventData.location}
                          onChange={(e) => {
                            if (editingEvent) {
                              setEditingEvent({ ...editingEvent, location: e.target.value });
                            } else {
                              setNewEventData({ ...newEventData, location: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Entry Code */}
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Entry Instructions (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Buzzer #4B, Gate code 1234"
                          value={editingEvent ? editingEvent.entryCode : newEventData.entryCode}
                          onChange={(e) => {
                            if (editingEvent) {
                              setEditingEvent({ ...editingEvent, entryCode: e.target.value });
                            } else {
                              setNewEventData({ ...newEventData, entryCode: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Description</label>
                        <textarea
                          placeholder="What's this event about?"
                          value={editingEvent ? editingEvent.description : newEventData.description}
                          onChange={(e) => {
                            if (editingEvent) {
                              setEditingEvent({ ...editingEvent, description: e.target.value });
                            } else {
                              setNewEventData({ ...newEventData, description: e.target.value });
                            }
                          }}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>

                      {/* Color Picker */}
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Theme Color</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'from-purple-400 to-pink-500',
                            'from-blue-400 to-cyan-500',
                            'from-green-400 to-emerald-500',
                            'from-amber-400 to-orange-500',
                            'from-red-400 to-pink-500',
                            'from-indigo-400 to-purple-500',
                            'from-teal-400 to-blue-500',
                            'from-yellow-400 to-amber-500',
                          ].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                if (editingEvent) {
                                  setEditingEvent({ ...editingEvent, color });
                                } else {
                                  setNewEventData({ ...newEventData, color });
                                }
                              }}
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} border-2 transition ${
                                (editingEvent ? editingEvent.color : newEventData.color) === color
                                  ? 'border-white scale-110'
                                  : 'border-transparent hover:border-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        {editingEvent && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this event?')) {
                                const newEvents = partyEvents.filter(e => e.id !== editingEvent.id);
                                setPartyEvents(newEvents);
                                savePartyEventsToFirestore(newEvents);
                                setEditingEvent(null);
                                setSelectedPartyEvent(null);
                              }
                            }}
                            className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowAddEventModal(false);
                            setEditingEvent(null);
                            setNewEventData({
                              name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                              location: '', entryCode: '', description: '', color: 'from-purple-400 to-pink-500'
                            });
                          }}
                          className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editingEvent) {
                              // Update existing event
                              const newEvents = partyEvents.map(e =>
                                e.id === editingEvent.id ? { ...editingEvent, updatedAt: new Date().toISOString() } : e
                              );
                              setPartyEvents(newEvents);
                              setSelectedPartyEvent(newEvents.find(e => e.id === editingEvent.id));
                              savePartyEventsToFirestore(newEvents);
                              setEditingEvent(null);
                            } else {
                              // Create new event
                              const newEvent = {
                                ...newEventData,
                                id: `event-${Date.now()}`,
                                guests: [],
                                tasks: [],
                                createdBy: currentUser,
                                createdAt: new Date().toISOString()
                              };
                              const newEvents = [...partyEvents, newEvent];
                              setPartyEvents(newEvents);
                              savePartyEventsToFirestore(newEvents);
                              setShowAddEventModal(false);
                              setNewEventData({
                                name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                                location: '', entryCode: '', description: '', color: 'from-purple-400 to-pink-500'
                              });
                            }
                          }}
                          disabled={!(editingEvent ? editingEvent.name && editingEvent.date : newEventData.name && newEventData.date)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingEvent ? 'Save Changes' : 'Create Event'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ========== END EVENTS SECTION ========== */}

          {/* ========== LIFE PLANNING SECTION ========== */}
          {activeSection === 'lifePlanning' && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">🎯 Life Planning</h2>
                <p className="text-slate-400">Dream big, plan together</p>
              </div>

              {/* Coming Soon Placeholder */}
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl p-8 text-center border border-purple-500/30">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-white mb-2">Life Planning Section Coming Soon!</h3>
                <p className="text-slate-300 mb-4">Plan your future together:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="bg-white/10 px-4 py-2 rounded-full text-purple-300">
                    🏡 Where to Live
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-indigo-300">
                    🌴 Retirement Plans
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-violet-300">
                    📝 Life Goals
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ========== END LIFE PLANNING SECTION ========== */}

          {/* ========== BUSINESS SECTION ========== */}
          {activeSection === 'business' && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">💼 Business</h2>
                <p className="text-slate-400">Build and grow together</p>
              </div>

              {/* Coming Soon Placeholder */}
              <div className="bg-gradient-to-r from-slate-500/20 to-zinc-500/20 rounded-3xl p-8 text-center border border-slate-500/30">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-white mb-2">Business Section Coming Soon!</h3>
                <p className="text-slate-300 mb-4">Track your business ventures:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="bg-white/10 px-4 py-2 rounded-full text-slate-300">
                    📊 Projects
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-slate-300">
                    💰 Finances
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-slate-300">
                    📈 Goals
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full text-slate-300">
                    🤝 Partnerships
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ========== END BUSINESS SECTION ========== */}

          {/* ========== MEMORIES SECTION ========== */}
          {activeSection === 'memories' && (
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">💝 Our Memories</h2>
                <p className="text-slate-400">The story of us, one moment at a time</p>
              </div>

              {/* View Switcher */}
              <div className="flex justify-center gap-2 mb-8">
                {[
                  { id: 'timeline', label: 'Timeline', emoji: '📅' },
                  { id: 'events', label: 'Events', emoji: '🎭' },
                  { id: 'media', label: 'Media', emoji: '📸' },
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setMemoriesView(view.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                      memoriesView === view.id
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span>{view.emoji}</span>
                    {view.label}
                  </button>
                ))}
              </div>

              {/* Timeline View */}
              {memoriesView === 'timeline' && (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-rose-500 via-pink-500 to-purple-500 h-full rounded-full" />

                  {/* Timeline events - dynamically built */}
                  <div className="space-y-12">
                    {(() => {
                      const today = new Date();
                      const timelineEvents = [];

                      // Add all memories from state to timeline
                      const categoryIcons = {
                        milestone: '✨',
                        datenight: '🥂',
                        travel: '✈️',
                        fitness: '🏆',
                        concert: '🎵',
                        pride: '🏳️‍🌈',
                        karaoke: '🎤'
                      };
                      memories.forEach(memory => {
                        const memDate = parseLocalDate(memory.date);
                        timelineEvents.push({
                          id: memory.id,
                          isMemory: true,
                          date: memDate,
                          year: memDate.getFullYear().toString(),
                          month: memDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                          title: memory.title,
                          description: memory.description,
                          icon: memory.icon || categoryIcons[memory.category] || '✨',
                          location: memory.location,
                          image: memory.image,
                          link: memory.link,
                          comment: memory.comment,
                          category: memory.category,
                          memory: memory
                        });
                      });

                      // Add past trips to timeline
                      trips.filter(trip => {
                        if (!trip.dates?.end) return false;
                        const endDate = parseLocalDate(trip.dates.end);
                        return endDate < today;
                      }).forEach(trip => {
                        const tripDate = parseLocalDate(trip.dates.start);
                        timelineEvents.push({
                          id: `trip-${trip.id}`,
                          isTrip: true,
                          date: tripDate,
                          year: tripDate.getFullYear().toString(),
                          month: tripDate.toLocaleDateString('en-US', { month: 'long' }),
                          title: `${trip.emoji} ${trip.destination}`,
                          description: `Our adventure to ${trip.destination}`,
                          icon: trip.emoji,
                          image: trip.coverImage
                        });
                      });

                      // Add completed fitness events to timeline
                      const fitnessEvents = [
                        { id: 'indy-half-2026', name: 'Indy Half Marathon', date: '2026-05-02', emoji: '🏃' },
                        { id: 'triathlon-2026', name: 'Triathlon', date: '2026-09-20', emoji: '🏊' },
                      ];
                      fitnessEvents.forEach(event => {
                        const eventDate = parseLocalDate(event.date);
                        if (eventDate < today) {
                          timelineEvents.push({
                            id: `fitness-${event.id}`,
                            isFitness: true,
                            date: eventDate,
                            year: eventDate.getFullYear().toString(),
                            month: eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                            title: `${event.emoji} ${event.name}`,
                            description: 'We did it together!',
                            icon: '🏆'
                          });
                        }
                      });

                      // Add "present" marker
                      timelineEvents.push({
                        id: 'present',
                        isPresent: true,
                        date: today,
                        year: today.getFullYear().toString(),
                        month: 'Present',
                        title: 'Building Our Story 🌈',
                        description: 'And the adventure continues...',
                        icon: '🚀'
                      });

                      // Sort by date and alternate sides
                      return timelineEvents
                        .sort((a, b) => a.date - b.date)
                        .map((event, idx) => ({ ...event, side: idx % 2 === 0 ? 'left' : 'right' }));
                    })().map((event, idx) => (
                      <div key={event.id} className={`flex items-center gap-8 ${event.side === 'right' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-5/12 ${event.side === 'right' ? 'text-left' : 'text-right'}`}>
                          <div
                            onClick={() => event.isMemory && setEditingMemory(event.memory)}
                            onDragOver={(e) => { if (event.isMemory) { e.preventDefault(); setDragOverMemoryId(event.memory?.id); }}}
                            onDragLeave={() => setDragOverMemoryId(null)}
                            onDrop={(e) => event.isMemory && handleCardDrop(e, event.memory?.id)}
                            className={`backdrop-blur-sm rounded-2xl p-6 transition group relative ${event.isMemory ? 'cursor-pointer' : ''} ${
                              event.memory?.isSpecial || event.memory?.isFirstTime
                                ? 'special-memory-card'
                                : 'bg-white/10 border-2 border-white/20 hover:border-rose-400/50'
                            } ${dragOverMemoryId === event.memory?.id ? 'ring-4 ring-orange-500 ring-opacity-50' : ''}`}
                          >
                            {/* Upload indicator */}
                            {uploadingToMemoryId === event.memory?.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                                <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                              </div>
                            )}
                            {/* Drop indicator */}
                            {dragOverMemoryId === event.memory?.id && (
                              <div className="absolute inset-0 bg-orange-500/20 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-orange-400 font-semibold">Drop photo here</div>
                              </div>
                            )}
                            {/* Memory highlight indicators */}
                            {event.memory?.isFirstTime && (
                              <div className="absolute -top-2 -right-2 text-2xl">🎉</div>
                            )}
                            {event.memory?.isSpecial && !event.memory?.isFirstTime && (
                              <div className="absolute -top-2 -right-2 text-2xl">🌈</div>
                            )}
                            {/* Edit button for memories */}
                            {event.isMemory && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingMemory(event.memory); }}
                                className={`absolute ${event.side === 'right' ? 'right-3' : 'left-3'} top-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition`}
                              >
                                <Pencil className="w-4 h-4 text-white/70" />
                              </button>
                            )}
                            {/* Image if exists (random from images array, or from link field if it's an image URL) */}
                            {(() => {
                              const isLinkImage = event.link && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link);
                              const imageUrl = (event.memory ? getRandomMemoryImage(event.memory) : event.image) || (isLinkImage ? event.link : null);
                              return imageUrl ? (
                                <div className="mb-3 -mx-2 -mt-2">
                                  <img src={imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                                </div>
                              ) : null;
                            })()}
                            <div className="text-4xl mb-3">{event.icon}</div>
                            <div className="text-rose-400 text-sm font-medium mb-1">{event.month} {event.year}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-slate-300">{event.description}</p>
                            {event.location && (
                              <p className="text-slate-400 text-sm mt-2 flex items-center gap-1 justify-center">
                                <MapPin className="w-3 h-3" /> {event.location}
                              </p>
                            )}
                            {event.comment && (
                              <p className="text-slate-400 text-sm mt-2 italic">"{event.comment}"</p>
                            )}
                            {event.link && !/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link) && (
                              <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-rose-400 text-sm mt-2 flex items-center gap-1 hover:underline justify-center">
                                <ExternalLink className="w-3 h-3" /> View more
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="w-2/12 flex justify-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full border-4 border-slate-900 z-10 shadow-lg" />
                        </div>
                        <div className="w-5/12" />
                      </div>
                    ))}
                  </div>

                  {/* Add Memory Button */}
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setShowAddMemoryModal('milestone')}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      Add Memory
                    </button>
                  </div>
                </div>
              )}

              {/* Events View */}
              {memoriesView === 'events' && (
                <div className="space-y-8">
                  {/* Event Categories - Dynamic from app data */}
                  {(() => {
                    const today = new Date();

                    // Get past trips (where end date has passed)
                    const pastTrips = trips.filter(trip => {
                      if (!trip.dates?.end) return false;
                      const endDate = parseLocalDate(trip.dates.end);
                      return endDate < today;
                    }).map(trip => ({
                      id: `trip-${trip.id}`,
                      title: `${trip.emoji} ${trip.destination}`,
                      date: new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                      location: trip.destination,
                      image: trip.coverImage,
                      isTrip: true
                    }));

                    // Get completed fitness events (races that have passed)
                    const completedFitnessEvents = [];
                    const fitnessEventsData = [
                      { id: 'indy-half-2026', name: 'Indy Half Marathon', date: '2026-05-02', location: 'Indianapolis, IN', emoji: '🏃' },
                      { id: 'triathlon-2026', name: 'Triathlon', date: '2026-09-20', location: 'TBD', emoji: '🏊' },
                    ];
                    fitnessEventsData.forEach(event => {
                      const eventDate = parseLocalDate(event.date);
                      if (eventDate < today) {
                        completedFitnessEvents.push({
                          id: `fitness-${event.id}`,
                          title: `${event.emoji} ${event.name}`,
                          date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          location: event.location,
                          isFitness: true
                        });
                      }
                    });

                    // Get memories by category
                    const getMemoriesByCategory = (cat) => memories.filter(m => m.category === cat).map(m => ({
                      ...m,
                      isMemory: true,
                      date: m.date ? parseLocalDate(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'
                    }));

                    // Get past party events
                    const pastPartyEvents = partyEvents.filter(event => {
                      if (!event.date) return false;
                      const eventDate = parseLocalDate(event.date);
                      return eventDate < today;
                    }).map(event => ({
                      id: `party-${event.id}`,
                      title: event.name,
                      emoji: event.emoji,
                      date: event.date ? parseLocalDate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
                      location: event.location,
                      image: (event.images || [])[0],
                      images: event.images || [],
                      isPartyEvent: true,
                      partyEvent: event
                    }));

                    const categories = [
                      {
                        id: 'datenight',
                        category: 'Dates',
                        emoji: '🥂',
                        color: 'from-rose-500/20 to-pink-500/20',
                        borderColor: 'border-rose-500/30',
                        events: getMemoriesByCategory('datenight')
                      },
                      {
                        id: 'travel',
                        category: 'Travel Adventures',
                        emoji: '✈️',
                        color: 'from-teal-500/20 to-cyan-500/20',
                        borderColor: 'border-teal-500/30',
                        events: [...pastTrips, ...getMemoriesByCategory('travel')]
                      },
                      {
                        id: 'fitness',
                        category: 'Fitness Achievements',
                        emoji: '🏆',
                        color: 'from-orange-500/20 to-red-500/20',
                        borderColor: 'border-orange-500/30',
                        events: [...completedFitnessEvents, ...getMemoriesByCategory('fitness')]
                      },
                      {
                        id: 'concert',
                        category: 'Concerts & Shows',
                        emoji: '🎵',
                        color: 'from-purple-500/20 to-indigo-500/20',
                        borderColor: 'border-purple-500/30',
                        events: getMemoriesByCategory('concert')
                      },
                      {
                        id: 'pride',
                        category: 'Pride & Community',
                        emoji: '🏳️‍🌈',
                        color: 'from-amber-500/20 to-orange-500/20',
                        borderColor: 'border-amber-500/30',
                        events: getMemoriesByCategory('pride')
                      },
                      {
                        id: 'karaoke',
                        category: 'Songs & Karaoke',
                        emoji: '🎤',
                        color: 'from-fuchsia-500/20 to-pink-500/20',
                        borderColor: 'border-fuchsia-500/30',
                        events: getMemoriesByCategory('karaoke')
                      },
                      {
                        id: 'parties',
                        category: 'Parties & Gatherings',
                        emoji: '🎉',
                        color: 'from-violet-500/20 to-purple-500/20',
                        borderColor: 'border-violet-500/30',
                        events: pastPartyEvents
                      },
                    ];

                    return categories;
                  })().map((cat) => (
                    <div key={cat.id} className={`bg-gradient-to-r ${cat.color} rounded-3xl p-6 border ${cat.borderColor}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{cat.emoji}</span>
                        <h3 className="text-xl font-bold text-white">{cat.category}</h3>
                        <span className="text-white/50 text-sm">({cat.events.length} memories)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cat.events.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (event.isMemory) setEditingMemory(event);
                              else if (event.isPartyEvent) {
                                setActiveSection('events');
                                setSelectedPartyEvent(event.partyEvent);
                              }
                            }}
                            onDragOver={(e) => {
                              if (event.isMemory || event.isPartyEvent) {
                                e.preventDefault();
                                if (event.isMemory) setDragOverMemoryId(event.id);
                                else if (event.isPartyEvent) setDragOverEventId(event.partyEvent.id);
                              }
                            }}
                            onDragLeave={() => {
                              setDragOverMemoryId(null);
                              setDragOverEventId(null);
                            }}
                            onDrop={(e) => {
                              if (event.isMemory) handleCardDrop(e, event.id);
                              else if (event.isPartyEvent) handleEventCardDrop(e, event.partyEvent.id);
                            }}
                            className={`rounded-xl p-4 hover:bg-white/20 transition ${(event.isMemory || event.isPartyEvent) ? 'cursor-pointer' : ''} relative group ${
                              event.isSpecial || event.isFirstTime ? 'special-memory-card' : 'bg-white/10'
                            } ${dragOverMemoryId === event.id ? 'ring-4 ring-orange-500 ring-opacity-50' : ''} ${
                              event.isPartyEvent && dragOverEventId === event.partyEvent?.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                            }`}
                          >
                            {/* Upload indicator */}
                            {uploadingToMemoryId === event.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                                <Loader className="w-6 h-6 text-orange-500 animate-spin" />
                              </div>
                            )}
                            {event.isPartyEvent && uploadingToEventId === event.partyEvent?.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                                <Loader className="w-6 h-6 text-purple-500 animate-spin" />
                              </div>
                            )}
                            {/* Drop indicator */}
                            {dragOverMemoryId === event.id && (
                              <div className="absolute inset-0 bg-orange-500/20 rounded-xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-orange-400 text-sm font-semibold">Drop photo</div>
                              </div>
                            )}
                            {event.isPartyEvent && dragOverEventId === event.partyEvent?.id && (
                              <div className="absolute inset-0 bg-purple-500/20 rounded-xl flex items-center justify-center z-10 pointer-events-none">
                                <div className="text-purple-400 text-sm font-semibold">Drop photo</div>
                              </div>
                            )}
                            {/* Memory highlight indicators */}
                            {event.isFirstTime && (
                              <div className="absolute -top-1 -right-1 text-lg">🎉</div>
                            )}
                            {event.isSpecial && !event.isFirstTime && (
                              <div className="absolute -top-1 -right-1 text-lg">🌈</div>
                            )}
                            {/* Party event indicator */}
                            {event.isPartyEvent && event.emoji && (
                              <div className="absolute -top-1 -right-1 text-lg">{event.emoji}</div>
                            )}
                            {/* Edit button for memories */}
                            {event.isMemory && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingMemory(event); }}
                                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition"
                              >
                                <Pencil className="w-3 h-3 text-white/70" />
                              </button>
                            )}
                            {/* Image thumbnail (random from images array, or from link field if it's an image URL) */}
                            {(() => {
                              const isLinkImage = event.link && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link);
                              const imageUrl = (event.isMemory ? getRandomMemoryImage(event) : event.image) || (isLinkImage ? event.link : null);
                              return imageUrl ? (
                                <div className="mb-2 -mx-2 -mt-2">
                                  <img src={imageUrl} alt="" className="w-full h-20 object-cover rounded-t-lg" />
                                </div>
                              ) : null;
                            })()}
                            <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                            <p className="text-slate-400 text-sm">{event.date}</p>
                            {event.location && (
                              <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.comment && (
                              <p className="text-slate-400 text-xs mt-2 italic truncate">"{event.comment}"</p>
                            )}
                            {/* Photo count for party events */}
                            {event.isPartyEvent && (event.images || []).length > 0 && (
                              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {(event.images || []).length} photos
                              </p>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setShowAddMemoryModal(cat.id)}
                          className="bg-white/5 rounded-xl p-4 border-2 border-dashed border-white/20 hover:border-white/40 transition flex items-center justify-center gap-2 text-white/50 hover:text-white/70"
                        >
                          <Plus className="w-5 h-5" />
                          Add Memory
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Media View */}
              {memoriesView === 'media' && (() => {
                // Collect all photos from memories
                const memoryPhotos = memories.flatMap(memory => {
                  const images = getMemoryImages(memory);
                  return images.map(img => ({
                    src: img,
                    memory: memory,
                    event: null,
                    title: memory.title,
                    date: memory.date,
                    category: memory.category,
                    type: 'memory'
                  }));
                });

                // Collect all photos from events
                const eventPhotos = partyEvents.flatMap(event => {
                  const images = event.images || [];
                  return images.map(img => ({
                    src: img,
                    memory: null,
                    event: event,
                    title: event.name,
                    date: event.date,
                    category: 'events',
                    type: 'event'
                  }));
                });

                // Combine and sort by date
                const allPhotos = [...memoryPhotos, ...eventPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));

                // Get category counts for albums (including events)
                const categoryAlbums = [
                  { id: 'datenight', name: 'Dates', emoji: '🥂' },
                  { id: 'travel', name: 'Travel', emoji: '✈️' },
                  { id: 'fitness', name: 'Fitness', emoji: '🏆' },
                  { id: 'concert', name: 'Concerts & Shows', emoji: '🎵' },
                  { id: 'pride', name: 'Pride', emoji: '🏳️‍🌈' },
                  { id: 'karaoke', name: 'Songs & Karaoke', emoji: '🎤' },
                  { id: 'milestone', name: 'Milestones', emoji: '⭐' },
                  { id: 'events', name: 'Events & Parties', emoji: '🎉' },
                ].map(cat => ({
                  ...cat,
                  count: allPhotos.filter(p => p.category === cat.id).length
                })).filter(cat => cat.count > 0);

                const memoriesWithPhotos = memories.filter(m => getMemoryImages(m).length > 0).length;
                const eventsWithPhotos = partyEvents.filter(e => (e.images || []).length > 0).length;

                return (
                <div className="space-y-8">
                  {/* Photo count */}
                  <div className="text-center">
                    <p className="text-white/60">
                      {allPhotos.length} photos from {memoriesWithPhotos} memories
                      {eventsWithPhotos > 0 && ` and ${eventsWithPhotos} events`}
                    </p>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (photo.type === 'memory' && photo.memory) {
                            setEditingMemory(photo.memory);
                          } else if (photo.type === 'event' && photo.event) {
                            setActiveSection('events');
                            setSelectedPartyEvent(photo.event);
                          }
                        }}
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition">
                          <div className="flex items-center gap-1 mb-1">
                            {photo.type === 'event' && <span className="text-xs bg-purple-500/80 px-1.5 py-0.5 rounded">Event</span>}
                            <p className="text-white font-medium text-sm truncate">{photo.title}</p>
                          </div>
                          <p className="text-white/60 text-xs">{photo.date}</p>
                        </div>
                      </div>
                    ))}
                    {allPhotos.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📷</div>
                        <p className="text-white/60">No photos yet</p>
                        <p className="text-white/40 text-sm mt-1">Add photos to your memories or events to see them here</p>
                      </div>
                    )}
                  </div>

                  {/* Albums by Category */}
                  {categoryAlbums.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Albums by Category
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categoryAlbums.map((album, idx) => (
                          <div key={idx} className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition cursor-pointer group">
                            <div className="text-4xl mb-2">{album.emoji}</div>
                            <h4 className="font-semibold text-white">{album.name}</h4>
                            <p className="text-slate-400 text-sm">{album.count} photo{album.count !== 1 ? 's' : ''}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}
            </div>
          )}
          {/* ========== END MEMORIES SECTION ========== */}

        </div>
      </main>

      {/* Trip Detail Modal */}
      {selectedTrip && <TripDetail trip={selectedTrip} />}

      {/* New Trip Modal */}
      {showNewTripModal && (
        <NewTripModal
          type={showNewTripModal}
          onClose={() => setShowNewTripModal(null)}
          wishlist={wishlist}
          setWishlist={setWishlist}
          saveToFirestore={saveToFirestore}
          addNewTrip={addNewTrip}
        />
      )}

      {/* Random Experience Modal */}
      {showRandomExperience && (
        <RandomExperienceModal
          onClose={() => setShowRandomExperience(false)}
          wishlist={wishlist}
          setWishlist={setWishlist}
          saveToFirestore={saveToFirestore}
          setShowNewTripModal={setShowNewTripModal}
        />
      )}

      {/* Guest Modal - Top Level */}
      {showGuestModal && !selectedTrip && (() => {
        const trip = trips.find(t => t.id === showGuestModal);
        return trip ? (
          <GuestModal
            trip={trip}
            onClose={() => setShowGuestModal(null)}
          />
        ) : null;
      })()}

      {/* Open Date Modal */}
      {showOpenDateModal && (
        <OpenDateModal onClose={() => setShowOpenDateModal(false)} />
      )}

      {/* Companions Modal */}
      {showCompanionsModal && (
        <CompanionsModal onClose={() => setShowCompanionsModal(false)} />
      )}

      {/* My Profile Modal - For companions */}
      {showMyProfileModal && currentCompanion && (
        <MyProfileModal onClose={() => setShowMyProfileModal(false)} />
      )}

      {/* Edit Training Week Modal */}
      {editingTrainingWeek && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Edit Week {editingTrainingWeek.week.weekNumber || getActiveTrainingPlan(editingTrainingWeek.eventId).findIndex(w => w.id === editingTrainingWeek.week.id) + 1}
                </h2>
                <button
                  onClick={() => setEditingTrainingWeek(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/60 text-sm mt-1">
                {formatDate(editingTrainingWeek.week.startDate)} - {formatDate(editingTrainingWeek.week.endDate)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Runs Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-orange-300">🏃 Runs</h3>
                  <button
                    onClick={() => {
                      const newRun = {
                        id: Date.now(),
                        label: 'New Run',
                        distance: '0',
                        mike: false,
                        adam: false,
                        notes: ''
                      };
                      setEditingTrainingWeek(prev => ({
                        ...prev,
                        week: {
                          ...prev.week,
                          runs: [...(prev.week.runs || []), newRun]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Run
                  </button>
                </div>
                <div className="space-y-2">
                  {editingTrainingWeek.week.runs?.map((run, idx) => (
                    <div key={run.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <input
                        type="text"
                        value={run.label || ''}
                        onChange={(e) => {
                          const updatedRuns = [...editingTrainingWeek.week.runs];
                          updatedRuns[idx] = { ...run, label: e.target.value };
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, runs: updatedRuns }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        placeholder="Run name"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={run.distance || ''}
                          onChange={(e) => {
                            const updatedRuns = [...editingTrainingWeek.week.runs];
                            updatedRuns[idx] = { ...run, distance: e.target.value };
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, runs: updatedRuns }
                            }));
                          }}
                          className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
                          placeholder="0"
                          step="0.1"
                        />
                        <span className="text-white/60 text-sm">mi</span>
                      </div>
                      <button
                        onClick={() => {
                          const updatedRuns = editingTrainingWeek.week.runs.filter((_, i) => i !== idx);
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, runs: updatedRuns }
                          }));
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross Training Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-red-300">💪 Cross Training</h3>
                  <button
                    onClick={() => {
                      const newCT = {
                        id: Date.now(),
                        label: 'New Cross Training',
                        mike: false,
                        adam: false,
                        notes: ''
                      };
                      setEditingTrainingWeek(prev => ({
                        ...prev,
                        week: {
                          ...prev.week,
                          crossTraining: [...(prev.week.crossTraining || []), newCT]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Cross Training
                  </button>
                </div>
                <div className="space-y-2">
                  {editingTrainingWeek.week.crossTraining?.map((ct, idx) => (
                    <div key={ct.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <input
                        type="text"
                        value={ct.label || ''}
                        onChange={(e) => {
                          const updatedCT = [...editingTrainingWeek.week.crossTraining];
                          updatedCT[idx] = { ...ct, label: e.target.value };
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, crossTraining: updatedCT }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        placeholder="Activity name"
                      />
                      <button
                        onClick={() => {
                          const updatedCT = editingTrainingWeek.week.crossTraining.filter((_, i) => i !== idx);
                          setEditingTrainingWeek(prev => ({
                            ...prev,
                            week: { ...prev.week, crossTraining: updatedCT }
                          }));
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week Notes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📝 Week Notes</h3>
                <textarea
                  value={editingTrainingWeek.week.weekNotes || ''}
                  onChange={(e) => {
                    setEditingTrainingWeek(prev => ({
                      ...prev,
                      week: { ...prev.week, weekNotes: e.target.value }
                    }));
                  }}
                  placeholder="Add notes for this week..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingTrainingWeek(null)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save the edited week
                  const { eventId, week } = editingTrainingWeek;

                  // Calculate new total miles
                  const totalMiles = week.runs?.reduce((sum, run) => sum + (parseFloat(run.distance) || 0), 0) || 0;

                  // Update the training plan
                  updateTrainingWeek(eventId, week.id, {
                    runs: week.runs,
                    crossTraining: week.crossTraining,
                    weekNotes: week.weekNotes,
                    totalMiles: totalMiles
                  });

                  setEditingTrainingWeek(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Memory</h2>
                <button
                  onClick={() => setEditingMemory(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  value={editingMemory.title || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Memory title"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
                <input
                  type="date"
                  value={editingMemory.date || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  value={editingMemory.location || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Where did this happen?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <input
                  type="text"
                  value={editingMemory.description || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Short description"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Images ({getMemoryImages(editingMemory).length})
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-orange-500 bg-orange-500/10' : 'border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, true)}
                >
                  {/* Existing images grid */}
                  {getMemoryImages(editingMemory).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {getMemoryImages(editingMemory).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => {
                              const allImages = getMemoryImages(editingMemory);
                              const newImages = allImages.filter((_, i) => i !== idx);
                              setEditingMemory(prev => ({ ...prev, images: newImages, image: '' }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload area */}
                  <div className="flex gap-2">
                    <label className={`flex-1 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition border-2 border-dashed ${
                      uploadingPhoto ? 'bg-white/5 text-white/40 border-white/10' : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-orange-500'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryPhoto(e.target.files[0], true)}
                      />
                    </label>
                  </div>
                  {dragOver && (
                    <div className="text-center text-orange-400 mt-2 text-sm">Drop image here to add</div>
                  )}
                </div>
              </div>

              {/* Link / Video */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Link (Video URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingMemory.link || ''}
                    onChange={(e) => setEditingMemory(prev => ({ ...prev, link: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="YouTube, Sora, or other video link..."
                  />
                  {editingMemory.link && (
                    <button
                      onClick={() => setEditingMemory(prev => ({ ...prev, link: '' }))}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      title="Remove link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Comment / Note</label>
                <textarea
                  value={editingMemory.comment || ''}
                  onChange={(e) => setEditingMemory(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={3}
                  placeholder="Any personal notes or comments..."
                />
              </div>

              {/* Icon (for timeline) */}
              {editingMemory.category === 'milestone' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={editingMemory.icon || ''}
                    onChange={(e) => setEditingMemory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-24 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl"
                    placeholder="✨"
                  />
                </div>
              )}

              {/* Highlight Toggles */}
              <div className="pt-2 space-y-3">
                {/* Extra Special Toggle */}
                <button
                  onClick={() => setEditingMemory(prev => ({ ...prev, isSpecial: !prev.isSpecial }))}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-center gap-3 ${
                    editingMemory.isSpecial
                      ? 'border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                  style={editingMemory.isSpecial ? {
                    backgroundSize: '200% 200%',
                    animation: 'rainbow-shift 3s ease infinite'
                  } : {}}
                >
                  <span className="text-2xl">🌈</span>
                  <span className="font-semibold">
                    {editingMemory.isSpecial ? 'Extra Special Memory!' : 'Make Extra Special'}
                  </span>
                  {editingMemory.isSpecial && <span className="text-2xl">✨</span>}
                </button>

                {/* First Time Toggle */}
                <button
                  onClick={() => setEditingMemory(prev => ({ ...prev, isFirstTime: !prev.isFirstTime }))}
                  className={`w-full p-4 rounded-xl border-4 transition flex items-center justify-center gap-3 ${
                    editingMemory.isFirstTime
                      ? 'border-transparent text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                  style={editingMemory.isFirstTime ? {
                    background: 'linear-gradient(#1e293b, #1e293b) padding-box, repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 10px, #f97316 10px, #f97316 20px, #eab308 20px, #eab308 30px, #22c55e 30px, #22c55e 40px, #3b82f6 40px, #3b82f6 50px, #8b5cf6 50px, #8b5cf6 60px) border-box',
                  } : {}}
                >
                  <span className="text-2xl">🎉</span>
                  <span className="font-semibold">
                    {editingMemory.isFirstTime ? 'A First Time Memory!' : 'Mark as First Time'}
                  </span>
                  {editingMemory.isFirstTime && <span className="text-2xl">⭐</span>}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <button
                onClick={() => {
                  // Delete memory
                  const newMemories = memories.filter(m => m.id !== editingMemory.id);
                  setMemories(newMemories);
                  saveMemoriesToFirestore(newMemories);
                  setEditingMemory(null);
                }}
                className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingMemory(null)}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save memory
                    const newMemories = memories.map(m => m.id === editingMemory.id ? editingMemory : m);
                    setMemories(newMemories);
                    saveMemoriesToFirestore(newMemories);
                    setEditingMemory(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add New Memory</h2>
                <button
                  onClick={() => {
                    setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                    setShowAddMemoryModal(null);
                  }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                <select
                  value={showAddMemoryModal}
                  onChange={(e) => setShowAddMemoryModal(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="milestone">📅 Timeline Milestone</option>
                  <option value="datenight">🥂 Date</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="fitness">🏆 Fitness</option>
                  <option value="concert">🎵 Concert / Show</option>
                  <option value="pride">🏳️‍🌈 Pride / Community</option>
                  <option value="karaoke">🎤 Songs / Karaoke</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                <input
                  type="text"
                  value={newMemoryData.title}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="What happened?"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Date *</label>
                <input
                  type="date"
                  value={newMemoryData.date}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  value={newMemoryData.location}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Where?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <input
                  type="text"
                  value={newMemoryData.description}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="Short description"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Images ({(newMemoryData.images || []).length})
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-orange-500 bg-orange-500/10' : 'border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, false)}
                >
                  {/* Existing images grid */}
                  {(newMemoryData.images || []).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(newMemoryData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => {
                              const newImages = (newMemoryData.images || []).filter((_, i) => i !== idx);
                              setNewMemoryData(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload area */}
                  <div className="flex gap-2">
                    <label className={`flex-1 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition border-2 border-dashed ${
                      uploadingPhoto ? 'bg-white/5 text-white/40 border-white/10' : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-orange-500'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryPhoto(e.target.files[0], false)}
                      />
                    </label>
                  </div>
                  {dragOver && (
                    <div className="text-center text-orange-400 mt-2 text-sm">Drop image here to add</div>
                  )}
                </div>
              </div>

              {/* Link / Video */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Link (Video URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newMemoryData.link}
                    onChange={(e) => setNewMemoryData(prev => ({ ...prev, link: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="YouTube, Sora, or other video link..."
                  />
                  {newMemoryData.link && (
                    <button
                      onClick={() => setNewMemoryData(prev => ({ ...prev, link: '' }))}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      title="Remove link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Comment</label>
                <textarea
                  value={newMemoryData.comment}
                  onChange={(e) => setNewMemoryData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={2}
                  placeholder="Any notes..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                  setShowAddMemoryModal(null);
                }}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newMemoryData.title || !newMemoryData.date) {
                    alert('Title and Date are required');
                    return;
                  }

                  const newMemory = {
                    id: Date.now(),
                    category: showAddMemoryModal,
                    title: newMemoryData.title,
                    date: newMemoryData.date,
                    location: newMemoryData.location,
                    description: newMemoryData.description,
                    image: '',
                    images: newMemoryData.images || [],
                    link: newMemoryData.link,
                    comment: newMemoryData.comment,
                    icon: '✨'
                  };

                  const newMemories = [...memories, newMemory];
                  setMemories(newMemories);
                  saveMemoriesToFirestore(newMemories);
                  setNewMemoryData({ title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: '' });
                  setShowAddMemoryModal(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
              >
                Add Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouncing Emoji Overlay */}
      {bouncingEmoji && (
        <div
          className="fixed pointer-events-none z-[100] text-6xl transition-none"
          style={{
            left: bouncingEmoji.x,
            top: bouncingEmoji.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {bouncingEmoji.emoji}
        </div>
      )}

      {/* AddModal - rendered at root level for stability */}
      {showAddModal && (
        <AddModal
          type={showAddModal.type}
          tripId={showAddModal.tripId}
          onClose={() => setShowAddModal(null)}
          addItem={addItem}
          updateItem={updateItem}
          editItem={showAddModal.editItem}
        />
      )}

      {/* Global Styles for Rainbow Effects */}
      <style>{`
        @keyframes rainbow-border {
          0% { background-position: 100% 100%, 0% 50%; }
          100% { background-position: 100% 100%, 200% 50%; }
        }
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Bottom rainbow bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
    </div>
  );
}
