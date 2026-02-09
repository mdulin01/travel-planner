import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, ImagePlus, Link, Globe, Loader, LogIn, LogOut, User, UserPlus, Share2, Upload, Folder, Edit3, CheckSquare, RefreshCw, Camera, Search, Bell, BellOff } from 'lucide-react';

// Import constants and utilities
import {
  emojiSuggestions, travelEmojis, tripColors, bougieLabels, travelQuotes,
  achievementDefinitions, eventCategories, defaultPackingItems, experienceDatabase,
  airlines, ownerEmails, months, days, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES,
  timeHorizons, listCategories, ideaCategories, taskPriorities, socialTypes, habitCategories
} from './constants';
import {
  parseLocalDate, formatDate, validateFileSize, getEmojiSuggestion,
  getRandomExperience, getDaysInMonth, isHeicFile, getSafeFileName,
  getCompanionDisplayName, isTaskDueToday, isTaskDueThisWeek, taskMatchesHorizon, getDomainFromUrl
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

// Hooks
import { useSharedHub } from './hooks/useSharedHub';
import { useTravel } from './hooks/useTravel';
import { useFitness } from './hooks/useFitness';

// Contexts
import { SharedHubProvider } from './contexts/SharedHubContext';

// Shared Hub imports
import AddTaskModal from './components/SharedHub/AddTaskModal';
import SharedListModal from './components/SharedHub/SharedListModal';
import AddIdeaModal from './components/SharedHub/AddIdeaModal';
import TaskCard from './components/SharedHub/TaskCard';
import ListCard from './components/SharedHub/ListCard';
import IdeaCard from './components/SharedHub/IdeaCard';
import AddSocialModal from './components/SharedHub/AddSocialModal';
import SocialCard from './components/SharedHub/SocialCard';
import AddHabitModal from './components/SharedHub/AddHabitModal';
import HabitCard from './components/SharedHub/HabitCard';


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
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import heic2any from 'heic2any';

// Import your Firebase config
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn('FCM not supported on this device:', e.message);
}
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
  // Check URL for deep link to a specific Hub item (?hub=task&id=123)
  const initialDeepLink = (() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubType = urlParams.get('hub');
    const hubId = urlParams.get('id');
    const validTypes = ['task', 'list', 'idea', 'social', 'habit'];
    if (hubType && validTypes.includes(hubType) && hubId) {
      window.history.replaceState({}, '', window.location.pathname);
      return { type: hubType, id: hubId };
    }
    return null;
  })();

  // Check URL for app mode at initialization - supports multiple app types
  const initialAppMode = (() => {
    if (initialDeepLink) return null; // Deep links always go to Hub
    const urlParams = new URLSearchParams(window.location.search);
    const appParam = urlParams.get('app');
    const validApps = ['fitness', 'travel', 'events', 'memories'];
    if (appParam && validApps.includes(appParam)) {
      return appParam;
    }
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    );
    // Check for any app mode in standalone
    for (const app of validApps) {
      if (isStandalone && window.location.search.includes(app)) {
        return app;
      }
    }
    return null;
  })();

  const [activeSection, setActiveSection] = useState(initialAppMode || 'home'); // 'home' (hub) | 'travel' | 'fitness' | 'nutrition' | 'events' | 'lifePlanning' | 'business' | 'memories'

  // User profile selection
  const [currentUser, setCurrentUser] = useState('Mike');

  // Ref to store saveSharedHub function (defined later in useEffect)
  const saveSharedHubRef = useRef(() => {});

  // ========== SHARED HUB: All state and operations from hook =====
  const sharedHub = useSharedHub(currentUser, saveSharedHubRef.current, showToast);
  const {
    sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedHabits,
    addTask, updateTask, deleteTask, completeTask, highlightTask,
    addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, highlightList,
    addIdea, updateIdea, deleteIdea, highlightIdea,
    addSocial, updateSocial, deleteSocial, completeSocial, highlightSocial,
    addHabit, updateHabit, deleteHabit, toggleHabitDay, highlightHabit,
    hubSubView, setHubSubView, hubTaskFilter, setHubTaskFilter, hubTaskSort, setHubTaskSort,
    hubListFilter, setHubListFilter, hubIdeaFilter, setHubIdeaFilter, hubIdeaStatusFilter, setHubIdeaStatusFilter,
    hubSocialFilter, setHubSocialFilter, hubHabitFilter, setHubHabitFilter,
    collapsedSections, toggleDashSection,
    setSharedTasks, setSharedLists, setSharedIdeas, setSharedSocial, setSharedHabits,
    // Hub modal states (now from context)
    showAddTaskModal, setShowAddTaskModal,
    showSharedListModal, setShowSharedListModal,
    showAddIdeaModal, setShowAddIdeaModal,
    showAddSocialModal, setShowAddSocialModal,
    showAddHabitModal, setShowAddHabitModal,
  } = sharedHub;

  // Deep link state — opens a specific Hub item when the URL contains ?hub=type&id=itemId
  const [pendingDeepLink, setPendingDeepLink] = useState(initialDeepLink);

  // Refs for dependencies defined later
  const saveToFirestoreRef = useRef(() => {});
  const tripColorsRef = useRef([]);

  // ========== TRAVEL: All state and operations from hook =====
  const travel = useTravel(user, currentUser, saveToFirestoreRef.current, showToast, getEmojiSuggestion, tripColorsRef.current);
  const {
    trips, tripDetails, wishlist,
    addNewTrip, updateTripDates, deleteTrip, updateTripColor, updateTripEmoji, updateTripCoverImage,
    convertToAdventure, addItem: hookAddItem, removeItem: hookRemoveItem, updateItem: hookUpdateItem,
    setTrips, setTripDetails, setWishlist,
    showNewTripModal, setShowNewTripModal,
    showAddModal, setShowAddModal,
  } = travel;

  // Ref for saveFitness (defined later)
  const saveFitnessRef = useRef(() => {});

  // ========== FITNESS: All state and operations from hook =====
  // Note: generateTrainingWeeks, triathlonTrainingPlan, indyHalfTrainingPlan are defined later
  const generateTrainingWeeksRef = useRef(() => []);
  const triathlonTrainingPlanRef = useRef([]);
  const indyHalfTrainingPlanRef = useRef([]);

  const fitness = useFitness(saveFitnessRef.current, showToast, generateTrainingWeeksRef.current, triathlonTrainingPlanRef.current, indyHalfTrainingPlanRef.current);
  const {
    fitnessEvents, fitnessTrainingPlans, selectedFitnessEvent, fitnessViewMode,
    updateFitnessEvent, deleteFitnessEvent, updateTrainingWeek, addWorkout, deleteWorkout,
    setFitnessEvents, setFitnessTrainingPlans, setSelectedFitnessEvent, setFitnessViewMode,
    showAddFitnessEventModal, setShowAddFitnessEventModal, editingFitnessEvent, setEditingFitnessEvent,
  } = fitness;

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ tasks: true, lists: true, ideas: true, social: true, habits: true, travel: true, events: true, fitness: true, memories: true });
  const [searchHighlightId, setSearchHighlightId] = useState(null); // { type, id } - scroll-to target after search nav
  const [memoriesView, setMemoriesView] = useState('timeline'); // 'timeline' | 'events' | 'media'
  const [collapsedMemorySections, setCollapsedMemorySections] = useState({}); // { sectionId: true/false }
  const [timelineSortOrder, setTimelineSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [timelineYearFilter, setTimelineYearFilter] = useState('all'); // 'all' | specific year

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
  const [editingTrip, setEditingTrip] = useState(null); // trip object being edited
  const [editingPartyEvent, setEditingPartyEvent] = useState(null); // event object being edited
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null); // which photo is being edited for positioning
  const [photoPosition, setPhotoPosition] = useState({ x: 50, y: 50, zoom: 100 }); // x%, y%, zoom%
  const [showPartnershipQuote, setShowPartnershipQuote] = useState(false); // cute quote popup
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(null); // category for new memory
  const [newMemoryData, setNewMemoryData] = useState({
    title: '', date: '', location: '', description: '', image: '', images: [], link: '', comment: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingToMemoryId, setUploadingToMemoryId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragOverMemoryId, setDragOverMemoryId] = useState(null);
  const [uploadingWeekPhotoId, setUploadingWeekPhotoId] = useState(null);
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
    }, 20000); // Change photo every 20 seconds

    return () => clearInterval(interval);
  }, [getAllMemoryPhotos]);

  // Handle drag and drop for photo/video upload in modals
  const handleDrop = (e, isEdit = false) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      uploadMemoryMedia(file, isEdit);
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

  // Handle event cover image upload in modal
  const handleEventCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setEventCoverImagePreview(previewUrl);
    setUploadingEventCoverImage(true);

    try {
      // Convert to data URL for storage (works offline, persists in Firestore)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (editingEvent) {
          setEditingEvent({ ...editingEvent, coverImage: dataUrl });
        } else {
          setNewEventData({ ...newEventData, coverImage: dataUrl });
        }
        setUploadingEventCoverImage(false);
      };
      reader.onerror = () => {
        if (editingEvent) {
          setEditingEvent({ ...editingEvent, coverImage: previewUrl });
        } else {
          setNewEventData({ ...newEventData, coverImage: previewUrl });
        }
        setUploadingEventCoverImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing event cover image:', error);
      if (editingEvent) {
        setEditingEvent({ ...editingEvent, coverImage: previewUrl });
      } else {
        setNewEventData({ ...newEventData, coverImage: previewUrl });
      }
      setUploadingEventCoverImage(false);
    }
  };

  const removeEventCoverImage = () => {
    setEventCoverImagePreview(null);
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, coverImage: '' });
    } else {
      setNewEventData({ ...newEventData, coverImage: '' });
    }
    if (eventCoverFileRef.current) eventCoverFileRef.current.value = '';
    if (eventCoverCameraRef.current) eventCoverCameraRef.current.value = '';
  };

  // Handle fitness cover image upload in modal
  const handleFitnessCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setFitnessCoverImagePreview(previewUrl);
    setUploadingFitnessCoverImage(true);

    try {
      // Convert to data URL for storage (works offline, persists in Firestore)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (editingFitnessEvent) {
          setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: dataUrl });
        } else {
          setNewFitnessEventData(prev => ({ ...prev, coverImage: dataUrl }));
        }
        setUploadingFitnessCoverImage(false);
      };
      reader.onerror = () => {
        if (editingFitnessEvent) {
          setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: previewUrl });
        } else {
          setNewFitnessEventData(prev => ({ ...prev, coverImage: previewUrl }));
        }
        setUploadingFitnessCoverImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing fitness cover image:', error);
      if (editingFitnessEvent) {
        setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: previewUrl });
      } else {
        setNewFitnessEventData(prev => ({ ...prev, coverImage: previewUrl }));
      }
      setUploadingFitnessCoverImage(false);
    }
  };

  const removeFitnessCoverImage = () => {
    setFitnessCoverImagePreview(null);
    if (editingFitnessEvent) {
      setEditingFitnessEvent({ ...editingFitnessEvent, coverImage: '' });
    } else {
      setNewFitnessEventData(prev => ({ ...prev, coverImage: '' }));
    }
    if (fitnessCoverFileRef.current) fitnessCoverFileRef.current.value = '';
    if (fitnessCoverCameraRef.current) fitnessCoverCameraRef.current.value = '';
  };

  // ========== FITNESS WEEK PHOTO HELPERS ==========
  // Uses Firebase Storage (same pattern as working memory photo upload)
  const handleWeekPhotoAdd = async (eventId, weekId, existingPhotos, file) => {
    if (!file) return;
    // Accept images even without a proper MIME type (some mobile browsers)
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp)$/i.test(file.name);
    if (!isImage) {
      showToast('Please select an image file', 'error');
      return;
    }

    const sizeError = validateFileSize(file);
    if (sizeError) {
      showToast(sizeError, 'error');
      return;
    }

    setUploadingWeekPhotoId(weekId);
    try {
      let fileToUpload = file;
      let fileName = file.name || 'photo.jpg';

      // Convert HEIC/HEIF to JPEG (same as memories)
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                     fileName.toLowerCase().endsWith('.heic') || fileName.toLowerCase().endsWith('.heif');
      if (isHeic) {
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        fileToUpload = new File([convertedBlob], fileName.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        fileName = fileToUpload.name;
      }

      // Upload to Firebase Storage using memories/ prefix (allowed by storage rules)
      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `memories/fitness-${eventId}-${weekId}-${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Save the download URL (not base64) to training week
      const photos = [...(existingPhotos || []), { id: timestamp, url: downloadURL, addedAt: new Date().toISOString() }];
      await updateTrainingWeek(eventId, weekId, { photos });
      showToast('Photo added!', 'success');
    } catch (error) {
      console.error('Fitness week photo upload failed:', error);
      showToast('Photo upload failed: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setUploadingWeekPhotoId(null);
    }
  };

  const handleWeekPhotoRemove = async (eventId, weekId, existingPhotos, photoId) => {
    const photos = (existingPhotos || []).filter(p => p.id !== photoId);
    await updateTrainingWeek(eventId, weekId, { photos });
  };

  // Upload photo/video to Firebase Storage (with HEIC conversion for images) - for modals
  const uploadMemoryMedia = async (file, isEdit = false) => {
    if (!file) return;

    // Check if it's a video file
    const isVideo = file.type.startsWith('video/') ||
                    /\.(mp4|mov|m4v|webm|avi)$/i.test(file.name);

    // Validate file size (more lenient for videos - 50MB)
    const maxSize = isVideo ? 50 * 1024 * 1024 : MAX_FILE_SIZE_BYTES;
    if (file.size > maxSize) {
      showToast(`File too large. Max size: ${isVideo ? '50MB' : MAX_FILE_SIZE_MB + 'MB'}`, 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      let fileToUpload = file;
      let fileName = file.name;

      // Convert HEIC/HEIF to JPEG (only for images)
      if (!isVideo) {
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
      }

      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const folder = isVideo ? 'videos' : 'memories';
      const storageRef = ref(storage, `${folder}/${timestamp}_${safeName}`);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      if (isEdit) {
        if (isVideo) {
          // Add to videos array
          setEditingMemory(prev => {
            const currentVideos = prev.videos || [];
            return { ...prev, videos: [...currentVideos, downloadURL] };
          });
        } else {
          // Add to images array
          setEditingMemory(prev => {
            const currentImages = prev.images || [];
            const allImages = prev.image && !currentImages.includes(prev.image)
              ? [prev.image, ...currentImages]
              : currentImages;
            return { ...prev, images: [...allImages, downloadURL], image: '' };
          });
        }
      } else {
        if (isVideo) {
          setNewMemoryData(prev => {
            const currentVideos = prev.videos || [];
            return { ...prev, videos: [...currentVideos, downloadURL] };
          });
        } else {
          setNewMemoryData(prev => {
            const currentImages = prev.images || [];
            return { ...prev, images: [...currentImages, downloadURL] };
          });
        }
      }
      showToast(isVideo ? 'Video uploaded!' : 'Photo uploaded!', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      if (isMountedRef.current) showToast('Upload failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) setUploadingPhoto(false);
    }
  };

  // Alias for backward compatibility
  const uploadMemoryPhoto = uploadMemoryMedia;

  // PWA App Mode Detection - Check if running as installed app or with ?app=fitness parameter
  const [isAppMode, setIsAppMode] = useState(() => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const appParam = urlParams.get('app');
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone || // iOS Safari
                         document.referrer.includes('android-app://');
    return appParam === 'fitness' || (isStandalone && window.location.search.includes('fitness'));
  });

  // App state
  const [companions, setCompanions] = useState(defaultCompanions);
  const [openDates, setOpenDates] = useState(defaultOpenDates);
  const [showOpenDateModal, setShowOpenDateModal] = useState(false);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [showTripMenu, setShowTripMenu] = useState(null); // trip id for menu
  const [showColorPicker, setShowColorPicker] = useState(null); // trip id for color picker
  const [showEmojiEditor, setShowEmojiEditor] = useState(null); // trip id for emoji editor
  const [showImageEditor, setShowImageEditor] = useState(null); // trip id for image editor
  const [showLinkModal, setShowLinkModal] = useState(null); // trip id for link modal
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(null); // Google Calendar event to import
  const [importSettings, setImportSettings] = useState({ type: 'event', color: 'from-blue-400 to-indigo-500', customName: '' });
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date()); // Month for calendar section view
  const [availableCalendars, setAvailableCalendars] = useState([]); // List of user's calendars
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary'); // Selected calendar to fetch from
  const [showCalendarPicker, setShowCalendarPicker] = useState(false); // Show calendar selection modal
  const [showRandomExperience, setShowRandomExperience] = useState(false);
  const [travelViewMode, setTravelViewMode] = useState('main'); // 'main', 'random', 'wishlist'
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
  // Sync editingTrainingWeek photos when fitnessTrainingPlans updates (e.g., after upload from within modal)
  useEffect(() => {
    if (editingTrainingWeek) {
      const plan = fitnessTrainingPlans[editingTrainingWeek.eventId];
      const freshWeek = plan?.find(w => w.id === editingTrainingWeek.week.id);
      if (freshWeek && JSON.stringify(freshWeek.photos) !== JSON.stringify(editingTrainingWeek.week.photos)) {
        setEditingTrainingWeek(prev => prev ? { ...prev, week: { ...prev.week, photos: freshWeek.photos } } : null);
      }
    }
  }, [fitnessTrainingPlans]);
  const [pastWeeksExpanded, setPastWeeksExpanded] = useState(false); // collapse past fitness weeks
  const [weekPhotoDrag, setWeekPhotoDrag] = useState(null); // weekId of week being dragged onto
  const [isOwner, setIsOwner] = useState(false); // true if Mike or Adam
  const [bouncingEmoji, setBouncingEmoji] = useState(null); // { emoji, x, y, dx, dy } for bouncing animation

  // Guest state - for users invited to specific trips
  const [isGuest, setIsGuest] = useState(false); // true if user is a trip guest (not owner or companion)
  const [guestTripIds, setGuestTripIds] = useState([]); // array of trip IDs this guest has access to
  const [guestPermissions, setGuestPermissions] = useState({}); // { tripId: 'edit' | 'view' }
  const [guestEmail, setGuestEmail] = useState(''); // for guest modal input
  const [guestPermission, setGuestPermission] = useState('edit'); // for guest modal input

  // ========== UI STATE ==========
  const [showComingSoonMenu, setShowComingSoonMenu] = useState(false); // click-based dropdown
  const [showAddNewMenu, setShowAddNewMenu] = useState(false); // home page add new menu

  // ========== CELEBRATION STATE ==========
  const [confetti, setConfetti] = useState(null); // { type: 'run' | 'week', x?, y? }
  const [weekCelebration, setWeekCelebration] = useState(null); // { weekNumber, eventName }

  // ========== COLOR OPTIONS FOR IMPORT MODAL ==========
  const tripColors = [
    { name: 'Ocean', gradient: 'from-teal-400 to-cyan-500' },
    { name: 'Sunset', gradient: 'from-orange-400 to-red-500' },
    { name: 'Lavender', gradient: 'from-purple-400 to-indigo-500' },
    { name: 'Rose', gradient: 'from-rose-400 to-pink-500' },
    { name: 'Amber', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Emerald', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Sky', gradient: 'from-blue-400 to-indigo-500' },
    { name: 'Coral', gradient: 'from-pink-500 to-purple-500' },
  ];
  tripColorsRef.current = tripColors;

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
      { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '4 mi', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 9, weekNotes: '' },
    { weekNumber: 2, startDate: '2026-01-18', endDate: '2026-01-24', runs: [
      { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '4 mi', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 9, weekNotes: '' },
    { weekNumber: 3, startDate: '2026-01-25', endDate: '2026-01-31', runs: [
      { id: 1, label: 'Short Run', distance: '2 mi', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3 mi', mike: true, adam: true, notes: '' },
      { id: 3, label: 'Long Run', distance: '5 mi', mike: true, adam: true, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: true, adam: true, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: true, adam: true, notes: '' }
    ], totalMiles: 10, weekNotes: '' },
    { weekNumber: 4, startDate: '2026-02-01', endDate: '2026-02-07', runs: [
      { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 11, weekNotes: 'SOBER!! 🎯' },
    { weekNumber: 5, startDate: '2026-02-08', endDate: '2026-02-14', runs: [
      { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 12, weekNotes: '' },
    { weekNumber: 6, startDate: '2026-02-15', endDate: '2026-02-21', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '6 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 13, weekNotes: '' },
    { weekNumber: 7, startDate: '2026-02-22', endDate: '2026-02-28', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '' },
    { weekNumber: 8, startDate: '2026-03-01', endDate: '2026-03-07', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '✈️ Mike in Spain (Fri-Sat)' },
    { weekNumber: 9, startDate: '2026-03-08', endDate: '2026-03-14', runs: [
      { id: 1, label: 'Short Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 17, weekNotes: '✈️ Mike in Spain (all week)' },
    { weekNumber: 10, startDate: '2026-03-15', endDate: '2026-03-21', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '9 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 17, weekNotes: '🗽 Mike & Adam in NYC (Thurs-Sat)' },
    { weekNumber: 11, startDate: '2026-03-22', endDate: '2026-03-28', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '10 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 18, weekNotes: '🗽 Mike & Adam in NYC (Sun-Mon)' },
    { weekNumber: 12, startDate: '2026-03-29', endDate: '2026-04-04', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '11 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 19, weekNotes: '' },
    { weekNumber: 13, startDate: '2026-04-05', endDate: '2026-04-11', runs: [
      { id: 1, label: 'Short Run', distance: '5.5 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '12 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 22.5, weekNotes: '🏛️ Mike & Adam in DC (Thurs-Sat)' },
    { weekNumber: 14, startDate: '2026-04-12', endDate: '2026-04-18', runs: [
      { id: 1, label: 'Short Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '5 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '14 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 24, weekNotes: '🏛️ Mike & Adam in DC (Sun-Mon)' },
    { weekNumber: 15, startDate: '2026-04-19', endDate: '2026-04-25', runs: [
      { id: 1, label: 'Short Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '4 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '8 mi', mike: false, adam: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Cross Train #1', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Cross Train #2', mike: false, adam: false, notes: '' }
    ], totalMiles: 15, weekNotes: '📉 Taper Week - Rest up!' },
    { weekNumber: 16, startDate: '2026-04-26', endDate: '2026-05-02', runs: [
      { id: 1, label: 'Short Run', distance: '2 mi', mike: false, adam: false, notes: '' },
      { id: 2, label: 'Medium Run', distance: '3 mi', mike: false, adam: false, notes: '' },
      { id: 3, label: 'Long Run', distance: '13.1 mi', mike: false, adam: false, notes: '' }
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
      { id: 1, label: '🏊 Swim', distance: '450 yds', mike: false, notes: 'Easy pace, focus on form' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Pre-Season Week 1 - Getting in the water!' },
    { weekNumber: 2, startDate: '2026-02-09', endDate: '2026-02-15', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '500 yds', mike: false, notes: 'Freestyle drills' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 3, startDate: '2026-02-16', endDate: '2026-02-22', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '550 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 4, startDate: '2026-02-23', endDate: '2026-03-01', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '600 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 5, startDate: '2026-03-02', endDate: '2026-03-08', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '650 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Building endurance!' },
    { weekNumber: 6, startDate: '2026-03-09', endDate: '2026-03-15', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '700 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 7, startDate: '2026-03-16', endDate: '2026-03-22', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '750 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 8, startDate: '2026-03-23', endDate: '2026-03-29', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '825 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 9, startDate: '2026-03-30', endDate: '2026-04-05', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '875 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏊 Halfway to race swim distance!' },
    { weekNumber: 10, startDate: '2026-04-06', endDate: '2026-04-12', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '925 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 11, startDate: '2026-04-13', endDate: '2026-04-19', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '1000 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 12, startDate: '2026-04-20', endDate: '2026-04-26', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '1050 yds', mike: false, notes: '' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '' },
    { weekNumber: 13, startDate: '2026-04-27', endDate: '2026-05-03', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '1100 yds', mike: false, notes: 'Race distance achieved!' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🏃 Half Marathon Week! Focus on race.' },
    { weekNumber: 14, startDate: '2026-05-04', endDate: '2026-05-09', phase: 'pre-season', runs: [
      { id: 1, label: '🏊 Swim', distance: '650 yds', mike: false, notes: 'Recovery swim' }
    ], crossTraining: [], totalMiles: 0, weekNotes: '🔄 Transition week - recover from Half!' },

    // === MAIN TRAINING: Full Triathlon (May 10 onwards) ===
    { weekNumber: 15, startDate: '2026-05-10', endDate: '2026-05-16', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '550 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '10 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🚴 Full tri training begins!' },
    { weekNumber: 16, startDate: '2026-05-17', endDate: '2026-05-23', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '650 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '12 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 17, startDate: '2026-05-24', endDate: '2026-05-30', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '750 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '14 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 18, startDate: '2026-05-31', endDate: '2026-06-06', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '875 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '15 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 19, startDate: '2026-06-07', endDate: '2026-06-13', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '16 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 20, startDate: '2026-06-14', endDate: '2026-06-20', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1100 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '18 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 21, startDate: '2026-06-21', endDate: '2026-06-27', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1100 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '20 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 22, startDate: '2026-06-28', endDate: '2026-07-04', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1200 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '22 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🎆 4th of July Week!' },
    { weekNumber: 23, startDate: '2026-07-05', endDate: '2026-07-11', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1300 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '24 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 24, startDate: '2026-07-12', endDate: '2026-07-18', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1425 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '26 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 25, startDate: '2026-07-19', endDate: '2026-07-25', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1530 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '28 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 26, startDate: '2026-07-26', endDate: '2026-08-01', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1640 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '30 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🏊 Peak Swim Week!' },
    { weekNumber: 27, startDate: '2026-08-02', endDate: '2026-08-08', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1640 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '30 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 28, startDate: '2026-08-09', endDate: '2026-08-15', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1640 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '28 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 29, startDate: '2026-08-16', endDate: '2026-08-22', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1530 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '26 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 30, startDate: '2026-08-23', endDate: '2026-08-29', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1425 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '24 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '' },
    { weekNumber: 31, startDate: '2026-08-30', endDate: '2026-09-05', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1300 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '22 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '4 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper begins!' },
    { weekNumber: 32, startDate: '2026-09-06', endDate: '2026-09-12', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '1100 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '18 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '3 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper Week 2' },
    { weekNumber: 33, startDate: '2026-09-13', endDate: '2026-09-19', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '875 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '14 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '2.5 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Brick (Bike+Run)', mike: false, notes: '' },
      { id: 2, label: 'Strength', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '📉 Taper Week 3 - Rest up!' },
    { weekNumber: 34, startDate: '2026-09-20', endDate: '2026-09-26', phase: 'main', runs: [
      { id: 1, label: 'Swim', distance: '550 yds', mike: false, notes: '' },
      { id: 2, label: 'Bike', distance: '10 mi', mike: false, notes: '' },
      { id: 3, label: 'Run', distance: '6.2 mi', mike: false, notes: '' }
    ], crossTraining: [
      { id: 1, label: 'Race Day Prep', mike: false, notes: '' },
      { id: 2, label: 'Rest', mike: false, notes: '' }
    ], totalMiles: 0, weekNotes: '🏁 RACE WEEK! Sprint Tri - You got this! 🎉', isRaceWeek: true }
  ].map(week => ({ ...week, id: `triathlon-2026-week-${week.weekNumber}` }));

  // Update refs for training plans (used by fitness hook)
  useEffect(() => {
    triathlonTrainingPlanRef.current = triathlonTrainingPlan;
    indyHalfTrainingPlanRef.current = indyHalfTrainingPlan;
  }, [triathlonTrainingPlan, indyHalfTrainingPlan]);

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

  // Update refs for fitness hook dependencies
  useEffect(() => {
    generateTrainingWeeksRef.current = generateTrainingWeeks;
  }, [generateTrainingWeeks]);

  // Fitness state and operations now in useFitness hook
  // Modal form data
  const [newFitnessEventData, setNewFitnessEventData] = useState({
    name: '',
    emoji: '🏃',
    date: '',
    type: 'running', // running, half-marathon, marathon, triathlon, cycling, swimming, other
    url: '',
    trainingWeeks: 12,
    color: 'from-orange-400 to-red-500',
    description: '',
    participants: 'both', // 'mike', 'adam', 'both'
    location: '',
    coverImage: null
  });
  const [fitnessCoverImagePreview, setFitnessCoverImagePreview] = useState(null);
  const [uploadingFitnessCoverImage, setUploadingFitnessCoverImage] = useState(false);
  const fitnessCoverFileRef = useRef(null);
  const fitnessCoverCameraRef = useRef(null);
  // ========== END FITNESS SECTION STATE ==========

  // ========== EVENTS/PARTY SECTION STATE ==========
  const [partyEvents, setPartyEvents] = useState([]);
  const [selectedPartyEvent, setSelectedPartyEvent] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventViewMode, setEventViewMode] = useState('upcoming');
  const [newEventData, setNewEventData] = useState({
    name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
    location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: []
  });
  const [eventGuestEmail, setEventGuestEmail] = useState('');
  const [eventGuestPermission, setEventGuestPermission] = useState('edit');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [swipeState, setSwipeState] = useState({ id: null, startX: 0, currentX: 0, swiping: false });
  const [uploadingToEventId, setUploadingToEventId] = useState(null);
  const [dragOverEventId, setDragOverEventId] = useState(null);
  const [eventCoverImagePreview, setEventCoverImagePreview] = useState(null);
  const [uploadingEventCoverImage, setUploadingEventCoverImage] = useState(false);
  const eventCoverFileRef = useRef(null);
  const eventCoverCameraRef = useRef(null);
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

  // ── Push Notifications Setup ──
  // Check if notifications are already enabled on mount
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, [user]);

  // Listen for foreground messages when enabled
  useEffect(() => {
    if (!messaging || !notificationsEnabled) return;
    const unsub = onMessage(messaging, (payload) => {
      console.log('Foreground push:', payload);
      showToast(payload.notification?.body || 'New notification!', 'info');
    });
    return () => unsub();
  }, [notificationsEnabled]);

  const enableNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      // Check basic support
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        showToast('Add this app to your Home Screen first, then enable notifications', 'error');
        setNotificationsLoading(false);
        return;
      }

      // Register the FCM service worker
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notification permission denied. Check your browser settings.', 'error');
        setNotificationsLoading(false);
        return;
      }

      // Initialize messaging if not already done
      let msg = messaging;
      if (!msg) {
        try {
          const { getMessaging: getMsgLazy } = await import('firebase/messaging');
          msg = getMsgLazy(app);
        } catch (e) {
          console.error('FCM init failed:', e);
          showToast('Push notifications not supported on this device', 'error');
          setNotificationsLoading(false);
          return;
        }
      }

      // Get FCM token
      const token = await getToken(msg, {
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        // Store token in Firestore under fcmTokens document
        const tokenData = {};
        const userKey = currentUser?.toLowerCase() || 'unknown';
        tokenData[userKey] = token;
        await setDoc(doc(db, 'tripData', 'fcmTokens'), tokenData, { merge: true });

        setNotificationsEnabled(true);
        showToast('Notifications enabled!', 'success');
      } else {
        showToast('Could not get notification token. Try adding the app to your Home Screen first.', 'error');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      showToast('Could not enable notifications: ' + error.message, 'error');
    }
    setNotificationsLoading(false);
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    showToast('Notifications paused', 'info');
  };

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

    // Subscribe to shared hub (lists, tasks, ideas)
    const hubUnsubscribe = onSnapshot(
      doc(db, 'tripData', 'sharedHub'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lists) setSharedLists(data.lists);
          if (data.tasks) setSharedTasks(data.tasks);
          if (data.ideas) setSharedIdeas(data.ideas);
          if (data.social) setSharedSocial(data.social);
          if (data.habits) setSharedHabits(data.habits);
        }
        // Mark hub data as loaded so saves are now safe
        hubDataLoadedRef.current = true;
      },
      (error) => {
        console.error('Error loading shared hub data:', error);
      }
    );

    return () => {
      tripsUnsubscribe();
      fitnessUnsubscribe();
      partyEventsUnsubscribe();
      hubUnsubscribe();
    };
  }, [user]);

  // Deep link handler — auto-open a Hub item when ?hub=type&id=itemId is in URL
  useEffect(() => {
    if (!pendingDeepLink || !hubDataLoadedRef.current) return;
    const { type, id } = pendingDeepLink;
    const numId = Number(id);

    const typeMap = {
      task: { data: sharedTasks, tab: 'tasks', open: setShowAddTaskModal },
      list: { data: sharedLists, tab: 'lists', open: setShowSharedListModal },
      idea: { data: sharedIdeas, tab: 'ideas', open: setShowAddIdeaModal },
      social: { data: sharedSocial, tab: 'social', open: setShowAddSocialModal },
      habit: { data: sharedHabits, tab: 'habits', open: setShowAddHabitModal },
    };

    const config = typeMap[type];
    if (!config) { setPendingDeepLink(null); return; }

    const item = config.data.find(i => i.id === numId);
    if (item) {
      setActiveSection('home');
      setHubSubView(config.tab);
      config.open(item);
      setPendingDeepLink(null);
    } else if (config.data.length > 0) {
      // Data loaded but item not found
      showToast('Item not found — it may have been deleted', 'info');
      setActiveSection('home');
      setHubSubView(config.tab);
      setPendingDeepLink(null);
    }
    // If data is still empty, wait for next render (Firebase may still be loading)
  }, [pendingDeepLink, sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedHabits]);

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

  // ========== GOOGLE CALENDAR INTEGRATION ==========

  const GOOGLE_CLIENT_ID = '803115812045-l2r8qgijts7rp56shcdt422cl8kjfb62.apps.googleusercontent.com';
  const GOOGLE_API_KEY = 'AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const [googleScriptsLoaded, setGoogleScriptsLoaded] = useState(false);

  // Load Google API scripts
  const loadGoogleScripts = () => {
    return new Promise((resolve, reject) => {
      const initGapiClient = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
            });
            console.log('GAPI client initialized');
            resolve();
          } catch (err) {
            console.error('Failed to init gapi client:', err);
            reject(err);
          }
        });
      };

      if (!window.gapi) {
        // Load GAPI script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = initGapiClient;
        gapiScript.onerror = () => reject(new Error('Failed to load GAPI'));
        document.body.appendChild(gapiScript);
      } else if (!window.gapi.client) {
        // GAPI loaded but client not initialized
        initGapiClient();
      } else {
        // Already fully initialized
        resolve();
      }
    });
  };

  // Initialize Google Identity Services
  const initGoogleCalendar = () => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => resolve();
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.body.appendChild(gisScript);
      } else {
        resolve();
      }
    });
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    setCalendarLoading(true);

    // Check if scripts are pre-loaded (Safari needs this to preserve user gesture)
    if (!googleScriptsLoaded) {
      try {
        // Quick load attempt - may break user gesture chain on Safari
        await loadGoogleScripts();
        await initGoogleCalendar();
      } catch (error) {
        console.error('Error loading Google scripts:', error);
        showToast('Failed to load Google Calendar. Please refresh and try again.', 'error');
        setCalendarLoading(false);
        return;
      }
    }

    try {
      // Create token client - this should happen synchronously after user click
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('OAuth error:', tokenResponse);
            showToast('Failed to connect to Google Calendar', 'error');
            setCalendarLoading(false);
            return;
          }

          try {
            // Set the access token on gapi client
            window.gapi.client.setToken({ access_token: tokenResponse.access_token });

            // Load the Calendar API discovery doc
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');

            // Fetch list of available calendars
            const calendarListResponse = await window.gapi.client.calendar.calendarList.list();
            const calendars = calendarListResponse.result.items || [];
            console.log('Loaded calendars:', calendars);
            setAvailableCalendars(calendars);

            // If multiple calendars, show picker; otherwise use primary
            if (calendars.length > 1) {
              setShowCalendarPicker(true);
              setCalendarLoading(false);
            } else {
              // Only one calendar, use it directly
              setCalendarConnected(true);
              await fetchGoogleCalendarEvents(calendars[0]?.id || 'primary');
              setCalendarLoading(false);
            }
          } catch (err) {
            console.error('Error after OAuth:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            showToast('Failed to load calendars: ' + (err.message || err.result?.error?.message || 'Unknown error'), 'error');
            setCalendarLoading(false);
          }
        },
      });

      // Request access token - should work now that scripts are pre-loaded
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      // Provide helpful message for Safari users
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        showToast('Calendar popup may be blocked. Check Safari settings or try on desktop.', 'error');
      } else {
        showToast('Failed to connect to Google Calendar. Please try again.', 'error');
      }
      setCalendarLoading(false);
    }
  };

  // Select a calendar and fetch its events
  const selectCalendar = async (calendarId) => {
    setSelectedCalendarId(calendarId);
    setShowCalendarPicker(false);
    setCalendarConnected(true);
    setCalendarLoading(true);
    await fetchGoogleCalendarEvents(calendarId);
    setCalendarLoading(false);
  };

  // Fetch events from Google Calendar
  const fetchGoogleCalendarEvents = async (calendarId = null) => {
    setCalendarLoading(true);
    try {
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calId = calendarId || selectedCalendarId || 'primary';
      const now = new Date();
      const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: calId,
        timeMin: now.toISOString(),
        timeMax: threeMonthsLater.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime',
      });

      const events = response.result.items.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        location: event.location || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        source: 'google',
        color: 'from-blue-400 to-indigo-500',
        htmlLink: event.htmlLink,
      }));

      setGoogleCalendarEvents(events);
      showToast(`Loaded ${events.length} events from Google Calendar`, 'success');
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      showToast('Failed to fetch calendar events', 'error');
    } finally {
      setCalendarLoading(false);
    }
  };

  // Import Google Calendar event as trip, event, or memory
  const importGoogleEvent = (googleEvent, settings) => {
    const { type, color, customName } = settings;
    const eventName = customName || googleEvent.title;

    if (type === 'travel') {
      const newTrip = {
        id: `trip-${Date.now()}`,
        destination: eventName,
        emoji: '✈️',
        dates: {
          start: googleEvent.start.split('T')[0],
          end: googleEvent.end.split('T')[0],
        },
        color: color,
        accent: 'bg-teal-500',
        special: googleEvent.description,
        status: 'upcoming',
        guests: [],
        coverImage: '', // Can be added later
      };
      setTrips(prev => [...prev, newTrip]);
      saveToFirestore([...trips, newTrip], wishlist, tripDetails);
      showToast(`Added "${eventName}" as a trip!`, 'success');
    } else if (type === 'event') {
      const newEvent = {
        id: `event-${Date.now()}`,
        name: eventName,
        emoji: '🎉',
        date: googleEvent.start.split('T')[0],
        time: googleEvent.start.includes('T') ? googleEvent.start.split('T')[1].substring(0, 5) : '',
        location: googleEvent.location,
        description: googleEvent.description,
        color: color,
        guests: [],
        tasks: [],
        photos: [],
        coverImage: '', // Cover image like trips
      };
      setPartyEvents(prev => [...prev, newEvent]);
      savePartyEventsToFirestore([...partyEvents, newEvent]);
      showToast(`Added "${eventName}" as an event!`, 'success');
    } else if (type === 'memory') {
      const newMemory = {
        id: `memory-${Date.now()}`,
        title: eventName,
        date: googleEvent.start.split('T')[0],
        category: 'Milestone',
        description: googleEvent.description,
        location: googleEvent.location,
        photos: [],
        isSpecial: false,
      };
      setMemories(prev => [...prev, newMemory]);
      saveMemoriesToFirestore([...memories, newMemory]);
      showToast(`Added "${eventName}" as a memory!`, 'success');
    }

    setShowImportModal(null);
    // Reset custom name for next import
    setImportSettings(prev => ({ ...prev, customName: '' }));
  };

  // Get all calendar events (trips + events + google)
  const getAllCalendarEvents = () => {
    const allEvents = [];

    // Add trips
    trips.forEach(trip => {
      if (trip.dates?.start) {
        allEvents.push({
          id: trip.id,
          title: `${trip.emoji} ${trip.destination}`,
          start: trip.dates.start,
          end: trip.dates.end,
          type: 'travel',
          color: trip.color || 'from-teal-400 to-cyan-500',
          data: trip,
        });
      }
    });

    // Add party events
    partyEvents.forEach(event => {
      if (event.date) {
        allEvents.push({
          id: event.id,
          title: `${event.emoji || '🎉'} ${event.name || event.title || 'Event'}`,
          start: event.date,
          end: event.date,
          type: 'event',
          color: event.color || 'from-amber-400 to-orange-500',
          data: event,
        });
      }
    });

    // Add Google Calendar events
    googleCalendarEvents.forEach(event => {
      const startDateStr = event.start.split('T')[0];
      let endDateStr = event.end.split('T')[0];

      // For all-day events, Google uses exclusive end dates, so we need to subtract 1 day
      if (event.allDay) {
        const endDate = parseLocalDate(endDateStr);
        endDate.setDate(endDate.getDate() - 1);
        endDateStr = endDate.toISOString().split('T')[0];
      }

      allEvents.push({
        id: event.id,
        title: event.title,
        start: startDateStr,
        end: endDateStr,
        type: 'google',
        color: 'from-blue-400 to-indigo-500',
        data: event,
      });
    });

    return allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  // Save to Firestore whenever data changes
  const saveToFirestore = useCallback(async (newTrips, newWishlist, newTripDetails, newMemories) => {
    if (!user) return;

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser };
      if (newTrips !== null && newTrips !== undefined) updates.trips = newTrips;
      if (newWishlist !== null && newWishlist !== undefined) updates.wishlist = newWishlist;
      if (newTripDetails !== null && newTripDetails !== undefined) updates.tripDetails = newTripDetails;
      if (newMemories !== null && newMemories !== undefined) updates.memories = newMemories;
      await setDoc(doc(db, 'tripData', 'shared'), updates, { merge: true });
      showToast('Changes saved', 'success');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Save memories to Firestore
  const saveMemoriesToFirestore = useCallback(async (newMemories) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'tripData', 'shared'), {
        memories: newMemories,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser
      }, { merge: true });
    } catch (error) {
      console.error('Error saving memories to Firestore:', error);
      showToast('Failed to save memory. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Save fitness data to Firestore
  const saveFitnessToFirestore = useCallback(async (newEvents, newTrainingPlans) => {
    if (!user) return;

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser };
      if (newEvents !== null && newEvents !== undefined) updates.events = newEvents;
      if (newTrainingPlans !== null && newTrainingPlans !== undefined) updates.trainingPlans = newTrainingPlans;
      await setDoc(doc(db, 'tripData', 'fitness'), updates, { merge: true });
    } catch (error) {
      console.error('Error saving fitness to Firestore:', error);
      showToast('Failed to save fitness data. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Update the ref so the hook can use the actual saveFitnessToFirestore function
  useEffect(() => {
    saveFitnessRef.current = saveFitnessToFirestore;
  }, [saveFitnessToFirestore]);

  // Save party/social events to Firestore
  const savePartyEventsToFirestore = useCallback(async (newEvents) => {
    if (!user) return;

    try {
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser };
      if (newEvents !== null && newEvents !== undefined) updates.events = newEvents;
      await setDoc(doc(db, 'tripData', 'partyEvents'), updates, { merge: true });
    } catch (error) {
      console.error('Error saving party events to Firestore:', error);
      showToast('Failed to save event. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // ========== SHARED HUB SAVE & CRUD ==========
  const hubDataLoadedRef = useRef(false);

  const saveSharedHub = useCallback(async (newLists, newTasks, newIdeas, newSocial, newHabits) => {
    if (!user) return;
    // Don't save until Firebase data has loaded — prevents overwriting with empty arrays
    if (!hubDataLoadedRef.current) {
      console.warn('saveSharedHub blocked: data not yet loaded from Firebase');
      return;
    }
    try {
      // Only write the fields that were explicitly passed (non-null)
      // This prevents stale closure values from overwriting other fields
      const updates = { lastUpdated: new Date().toISOString(), updatedBy: currentUser };
      if (newLists !== null && newLists !== undefined) updates.lists = newLists;
      if (newTasks !== null && newTasks !== undefined) updates.tasks = newTasks;
      if (newIdeas !== null && newIdeas !== undefined) updates.ideas = newIdeas;
      if (newSocial !== null && newSocial !== undefined) updates.social = newSocial;
      if (newHabits !== null && newHabits !== undefined) updates.habits = newHabits;
      await setDoc(doc(db, 'tripData', 'sharedHub'), updates, { merge: true });
    } catch (error) {
      console.error('Error saving shared hub:', error);
      showToast('Failed to save. Please try again.', 'error');
    }
  }, [user, currentUser, showToast]);

  // Update the ref so the hook can use the actual saveSharedHub function
  useEffect(() => {
    saveSharedHubRef.current = saveSharedHub;
  }, [saveSharedHub]);

  // Task CRUD
  // ===== All task/list/idea/social/habit CRUD ops now in useSharedHub hook =====

  const promoteIdeaToTask = (idea) => {
    setShowAddIdeaModal(null);
    setShowAddTaskModal({
      title: idea.title,
      description: idea.description || '',
      linkedTo: { section: 'idea', itemId: idea.id },
      _prefill: true,
    });
    // Mark idea as planned
    updateIdea(idea.id, { status: 'planned' });
  };


  const getEventLabel = (eventId) => {
    if (!eventId) return null;
    const evt = partyEvents.find(e => String(e.id) === String(eventId));
    return evt ? evt.name : null;
  };

  const navigateToEvent = (eventId) => {
    setActiveSection('events');
  };


  // ── Search functions ──
  const getSearchResults = useCallback(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { tasks: [], lists: [], ideas: [], social: [], habits: [], travel: [], events: [], fitness: [], memories: [] };
    const r = { tasks: [], lists: [], ideas: [], social: [], habits: [], travel: [], events: [], fitness: [], memories: [] };
    if (searchFilters.tasks) {
      r.tasks = sharedTasks.filter(t =>
        t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some(tg => tg.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.lists) {
      r.lists = sharedLists.filter(l =>
        l.name?.toLowerCase().includes(q) || l.items?.some(i => i.text?.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.ideas) {
      r.ideas = sharedIdeas.filter(i =>
        i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tags?.some(tg => tg.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    if (searchFilters.social) {
      r.social = sharedSocial.filter(s =>
        s.person?.toLowerCase().includes(q) || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.habits) {
      r.habits = sharedHabits.filter(h =>
        h.name?.toLowerCase().includes(q) || h.cue?.toLowerCase().includes(q) || h.routine?.toLowerCase().includes(q) || h.reward?.toLowerCase().includes(q) || h.identity?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.travel) {
      r.travel = trips.filter(t =>
        t.destination?.toLowerCase().includes(q) || t.special?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.events) {
      r.events = partyEvents.filter(e =>
        e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.fitness) {
      r.fitness = fitnessEvents.filter(f =>
        f.name?.toLowerCase().includes(q) || f.type?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    if (searchFilters.memories) {
      r.memories = memories.filter(m =>
        m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.location?.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    return r;
  }, [searchQuery, searchFilters, sharedTasks, sharedLists, sharedIdeas, sharedSocial, sharedHabits, trips, partyEvents, fitnessEvents, memories]);

  const searchResults = searchQuery.trim() ? getSearchResults() : { tasks: [], lists: [], ideas: [], social: [], habits: [], travel: [], events: [], fitness: [], memories: [] };
  const totalSearchResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  const handleSearchResultClick = (type, itemId) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchHighlightId({ type, id: itemId });
    if (['tasks', 'lists', 'ideas', 'social', 'habits'].includes(type)) {
      setActiveSection('home');
      setHubSubView(type);
    } else {
      setActiveSection(type === 'travel' ? 'travel' : type === 'events' ? 'events' : type === 'fitness' ? 'fitness' : 'memories');
    }
  };

  // Scroll to and highlight the search result after navigation
  useEffect(() => {
    if (!searchHighlightId) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-search-id="${searchHighlightId.type}-${searchHighlightId.id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('search-highlight-pulse');
        setTimeout(() => {
          el.classList.remove('search-highlight-pulse');
          setSearchHighlightId(null);
        }, 2500);
      } else {
        setSearchHighlightId(null);
      }
    }, 300); // delay to let section render
    return () => clearTimeout(timer);
  }, [searchHighlightId, activeSection, hubSubView]);

  // Get linked item label for display
  const getLinkedLabel = (linkedTo) => {
    if (!linkedTo) return null;
    switch (linkedTo.section) {
      case 'travel':
      case 'trips': {
        const trip = trips.find(t => t.id === linkedTo.itemId);
        return trip ? `✈️ ${trip.destination}` : null;
      }
      case 'fitness':
      case 'fitnessEvents': {
        const event = fitnessEvents.find(e => e.id === linkedTo.itemId);
        return event ? `🏃 ${event.name}` : null;
      }
      case 'events':
      case 'partyEvents': {
        const event = partyEvents.find(e => e.id === linkedTo.itemId);
        return event ? `🎉 ${event.name}` : null;
      }
      case 'idea': {
        const idea = sharedIdeas.find(i => i.id === linkedTo.itemId);
        return idea ? `💡 ${idea.title}` : null;
      }
      default: return null;
    }
  };

  // Get linked Hub items (tasks, lists) for a given section card
  const getLinkedHubItems = (section, itemId) => {
    const matchSection = (s) => {
      if (section === 'travel') return s === 'travel' || s === 'trips';
      if (section === 'fitness') return s === 'fitness' || s === 'fitnessEvents';
      if (section === 'events') return s === 'events' || s === 'partyEvents';
      return s === section;
    };
    const linkedTasks = (sharedTasks || []).filter(t => t.linkedTo && matchSection(t.linkedTo.section) && t.linkedTo.itemId === itemId);
    const linkedLists = (sharedLists || []).filter(l => l.linkedTo && matchSection(l.linkedTo.section) && l.linkedTo.itemId === itemId);
    return { linkedTasks, linkedLists };
  };

  // Navigate to a linked section item
  const navigateToLinked = (linkedTo) => {
    if (!linkedTo) return;
    const sectionMap = { travel: 'travel', trips: 'travel', fitness: 'fitness', fitnessEvents: 'fitness', events: 'events', partyEvents: 'events', idea: 'home' };
    const section = sectionMap[linkedTo.section];
    if (section) {
      setActiveSection(section);
      if (section === 'travel') {
        const trip = trips.find(t => t.id === linkedTo.itemId);
        if (trip) setSelectedTrip(trip);
      } else if (section === 'fitness') {
        const event = fitnessEvents.find(e => e.id === linkedTo.itemId);
        if (event) setSelectedFitnessEvent(event);
      } else if (section === 'events') {
        const event = partyEvents.find(e => e.id === linkedTo.itemId);
        if (event) setSelectedPartyEvent(event);
      }
    }
  };

  // Update a workout (run or cross-training)
  const updateWorkout = async (eventId, weekId, workoutType, workoutId, updates) => {
    const newPlans = { ...fitnessTrainingPlans };

    // Initialize plan if it doesn't exist
    if (!newPlans[eventId]) {
      if (eventId === 'triathlon-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(triathlonTrainingPlan));
      } else if (eventId === 'indy-half-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(indyHalfTrainingPlan));
      } else {
        return; // Can't update non-existent plan
      }
    }

    // Get current workout state before update
    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdNum = weekId.includes('week-') ? parseInt(weekId.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    const currentWeek = newPlans[eventId].find(findWeek);
    const currentWorkout = currentWeek?.[workoutType]?.find(w => w.id === workoutId);
    // For Mike-only plans (no adam field), consider complete when mike is done
    const isMikeOnlyPlan = currentWorkout && !('adam' in currentWorkout);
    const wasCompletedTogether = isMikeOnlyPlan ? currentWorkout?.mike : (currentWorkout?.mike && currentWorkout?.adam);

    // Check if all runs were complete before this update
    const wereAllRunsComplete = currentWeek?.runs?.every(r =>
      ('adam' in r) ? (r.mike && r.adam) : r.mike
    );

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      // Ensure the week has proper id for future lookups
      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    // Get updated state
    const updatedWeek = newPlans[eventId].find(findWeek);
    const updatedWorkout = updatedWeek?.[workoutType]?.find(w => w.id === workoutId);
    const isNowCompletedTogether = isMikeOnlyPlan ? updatedWorkout?.mike : (updatedWorkout?.mike && updatedWorkout?.adam);

    // Check if all runs are now complete
    const areAllRunsNowComplete = updatedWeek?.runs?.every(r =>
      ('adam' in r) ? (r.mike && r.adam) : r.mike
    );

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

  // Get the active training plan for an event - uses hardcoded plans as base
  // but merges all changes (completion status, edits, new activities) from Firebase
  const getActiveTrainingPlan = (eventId) => {
    // Helper to merge Firebase data into hardcoded plan
    const mergeWithFirebase = (hardcodedPlan) => {
      const firebasePlan = fitnessTrainingPlans[eventId];
      if (!firebasePlan) return hardcodedPlan;

      return hardcodedPlan.map(week => {
        const fbWeek = firebasePlan.find(w => w.weekNumber === week.weekNumber);
        if (!fbWeek) return week;

        // Merge runs - iterate over HARDCODED runs first, then add any extra Firebase runs
        const fbRuns = fbWeek.runs || [];

        // Start with hardcoded runs, merge Firebase data by index/id
        const mergedRuns = week.runs.map((hardcodedRun, idx) => {
          // Find matching Firebase run by id first, then fall back to index
          const fbRun = fbRuns.find(r => r.id === hardcodedRun.id) || fbRuns[idx];

          if (!fbRun) {
            // No Firebase data for this run, use hardcoded
            return { ...hardcodedRun };
          }

          // Merge Firebase values with hardcoded defaults
          // For boolean fields (mike, adam), use Firebase if defined (even if false)
          // For string fields (distance, label), only use Firebase if it has actual content
          const merged = {
            ...hardcodedRun,
            mike: fbRun.mike !== undefined ? fbRun.mike : hardcodedRun.mike,
            distance: fbRun.distance && fbRun.distance.trim() ? fbRun.distance : hardcodedRun.distance,
            label: fbRun.label && fbRun.label.trim() ? fbRun.label : hardcodedRun.label,
            notes: fbRun.notes || hardcodedRun.notes || ''
          };

          // Handle adam field
          if ('adam' in hardcodedRun) {
            merged.adam = fbRun.adam !== undefined ? fbRun.adam : hardcodedRun.adam;
          }

          return merged;
        });

        // Add any extra runs from Firebase that aren't in hardcoded (user-added runs)
        fbRuns.forEach((fbRun, idx) => {
          if (idx >= week.runs.length && !mergedRuns.find(r => r.id === fbRun.id)) {
            mergedRuns.push(fbRun);
          }
        });

        // Same for cross training - iterate over HARDCODED first
        const fbCrossTraining = fbWeek.crossTraining || [];

        const mergedCrossTraining = week.crossTraining.map((hardcodedCT, idx) => {
          const fbCT = fbCrossTraining.find(c => c.id === hardcodedCT.id) || fbCrossTraining[idx];

          if (!fbCT) {
            return { ...hardcodedCT };
          }

          const merged = {
            ...hardcodedCT,
            mike: fbCT.mike !== undefined ? fbCT.mike : hardcodedCT.mike,
            label: fbCT.label && fbCT.label.trim() ? fbCT.label : hardcodedCT.label,
            notes: fbCT.notes || hardcodedCT.notes || ''
          };

          if ('adam' in hardcodedCT) {
            merged.adam = fbCT.adam !== undefined ? fbCT.adam : hardcodedCT.adam;
          }

          return merged;
        });

        // Add any extra cross training from Firebase
        fbCrossTraining.forEach((fbCT, idx) => {
          if (idx >= week.crossTraining.length && !mergedCrossTraining.find(c => c.id === fbCT.id)) {
            mergedCrossTraining.push(fbCT);
          }
        });

        return {
          ...week,
          runs: mergedRuns,
          crossTraining: mergedCrossTraining,
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

  // Pre-load Google Calendar scripts on mount (for Safari/iOS popup compatibility)
  useEffect(() => {
    const preloadGoogleScripts = async () => {
      try {
        await loadGoogleScripts();
        await initGoogleCalendar();
        setGoogleScriptsLoaded(true);
        console.log('Google scripts pre-loaded');
      } catch (err) {
        console.log('Failed to pre-load Google scripts:', err);
      }
    };
    preloadGoogleScripts();
  }, []);

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

  // Travel operations now in useTravel hook

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
      className="h-[100dvh] md:h-screen flex flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative"
      onClick={closeMenus}
    >
      {/* Global styles for UI enhancements */}
      <style>{`
        html, body {
          background-color: #1e293b;
          overscroll-behavior: none;
          overflow: hidden;
        }
        @supports (-webkit-touch-callout: none) {
          body {
            min-height: -webkit-fill-available;
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Loading skeleton animation */
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
          background-size: 200% 100%;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
          border-radius: 0.5rem;
        }

        /* Standardized form inputs */
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        .form-input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }
      `}</style>

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
            // Yellow confetti for single run completion, rainbow for week completion
            const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
            const yellowColors = ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#d97706']; // Shades of yellow/gold
            const colors = confetti.type === 'week' ? rainbowColors : yellowColors;
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

      {/* Anchor removed for cleaner UI */}

      {/* Header */}
      <header className="relative z-10 pt-safe pb-2 md:pb-4 px-4 md:px-6 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2 md:gap-4 relative">
            {/* Left side: Names + Section Title on mobile */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <button
                  onClick={() => isOwner && setActiveSection('apps')}
                  className="hover:opacity-90 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 512 512" className="w-8 h-8 md:w-10 md:h-10 shrink-0">
                    <defs>
                      <linearGradient id="logoSpectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:'#2dd4bf'}}/>
                        <stop offset="20%" style={{stopColor:'#22d3ee'}}/>
                        <stop offset="45%" style={{stopColor:'#818cf8'}}/>
                        <stop offset="70%" style={{stopColor:'#c084fc'}}/>
                        <stop offset="100%" style={{stopColor:'#f472b6'}}/>
                      </linearGradient>
                    </defs>
                    <rect x="16" y="16" width="480" height="480" rx="96" fill="#1e293b"/>
                    <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="url(#logoSpectrum)" strokeWidth="14" opacity="0.5"/>
                    <polygon points="56,390 56,130 114,130 150,225 186,130 244,130 244,390 198,390 198,240 160,338 140,338 104,240 104,390" fill="url(#logoSpectrum)" opacity="0.92"/>
                    <polygon points="232,390 320,130 356,130 452,390 402,390 382,328 294,328 274,390" fill="url(#logoSpectrum)" opacity="0.92"/>
                    <polygon points="308,288 368,288 338,218" fill="#1e293b"/>
                  </svg>
                  <span className="hidden md:inline text-sm font-semibold bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    Mike & Adam
                  </span>
                </button>
                {/* Hearts icon - clickable */}
                <button
                  onClick={() => setShowPartnershipQuote(true)}
                  className="text-pink-400 hover:text-pink-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Our love story"
                >
                  💕
                </button>
                {/* Mobile section indicator - icon + name */}
                <span className="md:hidden text-white/40 text-sm">•</span>
                <span className="md:hidden text-sm font-semibold text-white/80 flex items-center gap-1">
                  {activeSection === 'home' && <><span>⚛️</span> Hub</>}
                  {activeSection === 'travel' && <><span>✈️</span> Travel</>}
                  {activeSection === 'fitness' && <><span>🏃</span> Fitness</>}
                  {activeSection === 'events' && <><span>🎉</span> Events</>}
                  {activeSection === 'memories' && <><span>💝</span> Memories</>}
                  {activeSection === 'nutrition' && <><span>🥗</span> Nutrition</>}
                  {activeSection === 'lifePlanning' && <><span>🎯</span> Life Planning</>}
                  {activeSection === 'business' && <><span>💼</span> Business</>}
                  {activeSection === 'calendar' && <><span>📅</span> Calendar</>}
                  {activeSection === 'apps' && <><span>📱</span> Apps</>}
                </span>
              </div>
            </div>

            {/* Section Title - Centered on desktop, below header on mobile */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden md:block">
              {activeSection === 'home' && (
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <span>⚛️</span>
                    Hub
                  </h2>
                  <p className="text-xs text-slate-400">Plan adventures, stay healthy, build our future</p>
                </div>
              )}
              {activeSection === 'travel' && (
                <div>
                  <h2 className="text-xl font-bold text-white">✈️ Our Adventures</h2>
                  <p className="text-xs text-slate-400">Let's Travel The World</p>
                </div>
              )}
              {activeSection === 'fitness' && (
                <div>
                  <h2 className="text-xl font-bold text-white">🏃 Fitness Training</h2>
                  <p className="text-xs text-slate-400">Train together, achieve together</p>
                </div>
              )}
              {activeSection === 'events' && (
                <div>
                  <h2 className="text-xl font-bold text-white">🎉 Events</h2>
                  <p className="text-xs text-slate-400">Plan parties and gather friends</p>
                </div>
              )}
              {activeSection === 'memories' && (
                <div>
                  <h2 className="text-xl font-bold text-white">💝 Our Memories</h2>
                  <p className="text-xs text-slate-400">The story of us, one moment at a time</p>
                </div>
              )}
              {activeSection === 'nutrition' && (
                <div>
                  <h2 className="text-xl font-bold text-white">🥗 Nutrition</h2>
                  <p className="text-xs text-slate-400">Recipes, meal planning & grocery lists</p>
                </div>
              )}
              {activeSection === 'lifePlanning' && (
                <div>
                  <h2 className="text-xl font-bold text-white">🎯 Life Planning</h2>
                  <p className="text-xs text-slate-400">Dream big, plan together</p>
                </div>
              )}
              {activeSection === 'business' && (
                <div>
                  <h2 className="text-xl font-bold text-white">💼 Business</h2>
                  <p className="text-xs text-slate-400">Build and grow together</p>
                </div>
              )}
              {activeSection === 'calendar' && (
                <div>
                  <h2 className="text-xl font-bold text-white">📅 Calendar</h2>
                  <p className="text-xs text-slate-400">Our schedule at a glance</p>
                </div>
              )}
              {activeSection === 'apps' && (
                <div>
                  <h2 className="text-xl font-bold text-white">📱 Mini Apps</h2>
                  <p className="text-xs text-slate-400">Add to your home screen</p>
                </div>
              )}
            </div>

            {/* User info - simplified in app mode */}
            {!initialAppMode ? (
              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                {/* Calendar icon */}
                <button
                  onClick={() => setActiveSection('calendar')}
                  className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl transition shadow-lg ${
                    activeSection === 'calendar'
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  title="Calendar"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Search button */}
                <button
                  onClick={() => setShowSearch(true)}
                  className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl transition shadow-lg ${
                    showSearch
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  title="Search"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Notification bell */}
                {isOwner && (
                  <button
                    onClick={notificationsEnabled ? disableNotifications : enableNotifications}
                    disabled={notificationsLoading}
                    className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl transition shadow-lg ${
                      notificationsEnabled
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                    title={notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
                  >
                    {notificationsLoading ? (
                      <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : notificationsEnabled ? (
                      <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <BellOff className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                )}

                {/* User info and logout - simplified on mobile */}
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1.5 md:px-4 md:py-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-white/70" />
                  )}
                  <span className="hidden md:inline text-white/70 text-sm">{currentUser}</span>
                  {currentCompanion && (
                    <span className="hidden md:inline text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                      {currentCompanion.relationship}
                    </span>
                  )}
                  {/* Profile button for companions */}
                  {currentCompanion && (
                    <button
                      onClick={() => setShowMyProfileModal(true)}
                      className="hidden md:block ml-1 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
                      title="Edit my profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hidden md:block ml-2 text-xs text-white/50 hover:text-white transition underline"
                  >
                    log out
                  </button>
                </div>


                {/* Companion badge - hidden on mobile */}
                {currentCompanion && !isOwner && (
                  <div className="hidden md:flex items-center bg-amber-500/20 rounded-full px-3 py-1.5">
                    <span className="text-amber-300 text-sm">👋 Welcome, {currentCompanion.firstName || currentCompanion.name}!</span>
                  </div>
                )}

              </div>
            ) : (
              /* Simplified user switcher for app mode */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => isOwner && setCurrentUser('Mike')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    currentUser === 'Mike'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Mike
                </button>
                <button
                  onClick={() => isOwner && setCurrentUser('Adam')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    currentUser === 'Adam'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Adam
                </button>
              </div>
            )}
          </div>

          {/* Sync status indicator */}
          {dataLoading && (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              Syncing...
            </div>
          )}

          {/* Section Navigation - Hidden on mobile (we have bottom nav) and in App Mode */}
          {!initialAppMode && (
            <div className="mt-6 hidden md:flex gap-2 flex-wrap items-center justify-center">
              {/* Main navigation buttons */}
              {[
                { id: 'home', label: 'Hub', emoji: '⚛️', gradient: 'from-pink-500 to-purple-500' },
                { id: 'travel', label: 'Travel', emoji: '✈️', gradient: 'from-teal-400 to-cyan-500' },
                { id: 'fitness', label: 'Fitness', emoji: '🏃', gradient: 'from-orange-400 to-red-500' },
                { id: 'events', label: 'Events', emoji: '🎉', gradient: 'from-amber-400 to-orange-500' },
                { id: 'memories', label: 'Memories', emoji: '💝', gradient: 'from-rose-400 to-pink-500' },
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (section.id === 'travel') setTravelViewMode('main');
                    if (section.id === 'home') setHubSubView('home');
                  }}
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
          )}

          {/* App Mode Header - Dynamic title based on app type */}
          {initialAppMode && (
            <div className="mt-4 text-center">
              {initialAppMode === 'fitness' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">🏃</span>
                  Fitness Training
                </h2>
              )}
              {initialAppMode === 'travel' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">✈️</span>
                  Travel Adventures
                </h2>
              )}
              {initialAppMode === 'events' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">🎉</span>
                  Events
                </h2>
              )}
              {initialAppMode === 'memories' && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center gap-2">
                  <span className="text-3xl">💝</span>
                  Our Memories
                </h2>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Main Content - scrollable area on mobile */}
      <main className="relative z-10 px-6 md:pb-12 flex-1 overflow-y-auto main-mobile-pb" id="main-scroll">
        <div className="max-w-6xl mx-auto">

          {/* ========== HUB SECTION (formerly Home) ========== */}
          {activeSection === 'home' && (
            <SharedHubProvider value={sharedHub}>
            <div>
              {/* Hub Sub-Navigation */}
              <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                {[
                  { id: 'home', emoji: '📊' },
                  { id: 'tasks', emoji: '✅' },
                  { id: 'lists', emoji: '📋' },
                  { id: 'social', emoji: '👥' },
                  { id: 'habits', emoji: '🔄' },
                  { id: 'ideas', emoji: '💡' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHubSubView(tab.id)}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                      hubSubView === tab.id
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {tab.emoji}
                  </button>
                ))}
              </div>

              {/* ===== HUB DASHBOARD VIEW ===== */}
              {hubSubView === 'home' && (
                <>
                  {/* TODAY'S TASKS WIDGET */}
                  {(() => {
                    const todayTasks = sharedTasks.filter(t => t.status !== 'done' && isTaskDueToday(t));
                    const doneTodayTasks = sharedTasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString());
                    const isCollapsed = collapsedSections.tasks;
                    return (
                      <div className="mb-6 rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(20,184,166,0.06)]">
                        <button
                          onClick={() => toggleDashSection('tasks')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>✅</span> Today's Tasks
                            {todayTasks.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">{todayTasks.length}</span>}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddTaskModal('create'); }}
                              className="w-7 h-7 rounded-full bg-teal-500/20 hover:bg-teal-500/40 flex items-center justify-center transition text-teal-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('tasks')} className="text-xs text-teal-400 hover:text-teal-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-2">
                              {todayTasks.length === 0 && doneTodayTasks.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">🎉</span>
                                  <p className="text-white/40 text-sm">No tasks for today!</p>
                                  <button onClick={() => setShowAddTaskModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add a task</button>
                                </div>
                              ) : (
                                <>
                                  {todayTasks.slice(0, 5).map(task => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                     
                                      onNavigateToLinked={navigateToLinked}
                                      getLinkedLabel={getLinkedLabel}
                                    />
                                  ))}
                                  {doneTodayTasks.slice(0, 2).map(task => (
                                    <TaskCard key={task.id} task={task} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                                  ))}
                                  {todayTasks.length > 5 && <div className="text-xs text-white/30 text-center pt-1">+{todayTasks.length - 5} more</div>}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* ACTIVE LISTS WIDGET */}
                  {(() => {
                    const activeLists = sharedLists.filter(l => l.status === 'active').slice(0, 3);
                    const isCollapsed = collapsedSections.lists;
                    return (
                      <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.06)]">
                        <button
                          onClick={() => toggleDashSection('lists')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🛒</span> Lists
                            {activeLists.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{activeLists.length}</span>}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowSharedListModal('create'); }}
                              className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center transition text-emerald-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('lists')} className="text-xs text-teal-400 hover:text-teal-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-3">
                              {activeLists.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">📝</span>
                                  <p className="text-white/40 text-sm">No active lists</p>
                                  <button onClick={() => setShowSharedListModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Create a list</button>
                                </div>
                              ) : (
                                activeLists.map(list => (
                                  <ListCard
                                    key={list.id}
                                    list={list}
                                    currentUser={currentUser}
                                   
                                    onNavigateToLinked={navigateToLinked}
                                    getLinkedLabel={getLinkedLabel}
                                  />
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* RECENT IDEAS WIDGET */}
                  {(() => {
                    const recentIdeas = sharedIdeas.filter(i => i.status === 'inbox' || i.status === 'saved').slice(0, 4);
                    const isCollapsed = collapsedSections.ideas;
                    return (
                      <div className="mb-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.06)]">
                        <button
                          onClick={() => toggleDashSection('ideas')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>💡</span> Ideas
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddIdeaModal('create'); }}
                              className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center transition text-amber-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('ideas')} className="text-xs text-teal-400 hover:text-teal-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 grid grid-cols-2 gap-3">
                              {recentIdeas.length === 0 ? (
                                <div className="col-span-2 text-center py-6">
                                  <span className="text-3xl mb-2 block">💡</span>
                                  <p className="text-white/40 text-sm">No ideas yet</p>
                                  <button onClick={() => setShowAddIdeaModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add an idea</button>
                                </div>
                              ) : (
                                recentIdeas.map(idea => (
                                  <IdeaCard
                                    key={idea.id}
                                    idea={idea}

                                    onPromoteToTask={promoteIdeaToTask}
                                  />
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* UPCOMING SOCIAL WIDGET */}
                  {(() => {
                    const upcomingSocial = sharedSocial.filter(s => s.status !== 'done').slice(0, 4);
                    const isCollapsed = collapsedSections.social;
                    return (
                      <div className="mb-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.06)]">
                        <button
                          onClick={() => toggleDashSection('social')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>👥</span> Social
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddSocialModal('create'); }}
                              className="w-7 h-7 rounded-full bg-purple-500/20 hover:bg-purple-500/40 flex items-center justify-center transition text-purple-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('social')} className="text-xs text-purple-400 hover:text-purple-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-2">
                              {upcomingSocial.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">👥</span>
                                  <p className="text-white/40 text-sm">No upcoming social items</p>
                                  <button onClick={() => setShowAddSocialModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add a social item</button>
                                </div>
                              ) : (
                                upcomingSocial.map(social => (
                                  <SocialCard
                                    key={social.id}
                                    social={social}

                                    onNavigateToEvent={navigateToEvent}
                                    getEventLabel={getEventLabel}
                                  />
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* HABITS WIDGET */}
                  {(() => {
                    const activeHabits = sharedHabits.filter(h => h.status === 'active');
                    const todayKey = new Date().toISOString().split('T')[0];
                    const doneToday = activeHabits.filter(h => h.log?.[todayKey] === true).length;
                    const isCollapsed = collapsedSections.habits;
                    return (
                      <div className="mb-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/30 via-slate-900/50 to-slate-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(244,63,94,0.06)]">
                        <button
                          onClick={() => toggleDashSection('habits')}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🔄</span> Habits
                            {activeHabits.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{doneToday}/{activeHabits.length}</span>}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowAddHabitModal('create'); }}
                              className="w-7 h-7 rounded-full bg-rose-500/20 hover:bg-rose-500/40 flex items-center justify-center transition text-rose-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div className="text-white/40">
                              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <>
                            <div className="px-4 pb-1">
                              <button onClick={() => setHubSubView('habits')} className="text-xs text-emerald-400 hover:text-emerald-300 transition">See All →</button>
                            </div>
                            <div className="p-4 pt-2 space-y-2">
                              {activeHabits.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="text-3xl mb-2 block">🔄</span>
                                  <p className="text-white/40 text-sm">No habits yet</p>
                                  <button onClick={() => setShowAddHabitModal('create')} className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition">+ Add a habit</button>
                                </div>
                              ) : (
                                <>
                                  {activeHabits.slice(0, 5).map(habit => (
                                    <HabitCard
                                      key={habit.id}
                                      habit={habit}
                                      currentUser={currentUser}
                                    />
                                  ))}
                                  {activeHabits.length > 5 && <div className="text-xs text-white/30 text-center pt-1">+{activeHabits.length - 5} more</div>}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Comprehensive Stats Dashboard */}
                  {(() => {
                    // Compute fitness stats
                    let totalMilesPlanned = 0;
                    let totalRunsDone = 0;
                    let totalCrossDone = 0;
                    let totalWorkoutsPlanned = 0;
                    let weeksCompleted = 0;
                    let currentStreak = 0;
                    const today = new Date();
                    today.setHours(0,0,0,0);

                    fitnessEvents.forEach(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      if (!plan || !Array.isArray(plan)) return;
                      plan.forEach(week => {
                        if (week.totalMiles) totalMilesPlanned += week.totalMiles;
                        const weekEnd = week.endDate ? parseLocalDate(week.endDate) : null;
                        let weekAllDone = true;
                        (week.runs || []).forEach(run => {
                          totalWorkoutsPlanned++;
                          if (run.mike || run.adam) totalRunsDone++;
                          else weekAllDone = false;
                        });
                        (week.crossTraining || []).forEach(ct => {
                          totalWorkoutsPlanned++;
                          if (ct.mike || ct.adam) totalCrossDone++;
                          else weekAllDone = false;
                        });
                        if (weekEnd && weekEnd <= today && weekAllDone && (week.runs?.length > 0 || week.crossTraining?.length > 0)) {
                          weeksCompleted++;
                        }
                      });
                    });

                    const totalWorkoutsDone = totalRunsDone + totalCrossDone;
                    const completionPct = totalWorkoutsPlanned > 0 ? Math.round((totalWorkoutsDone / totalWorkoutsPlanned) * 100) : 0;
                    const tasksDone = sharedTasks.filter(t => t.status === 'done').length;
                    const tasksPending = sharedTasks.filter(t => t.status !== 'done').length;
                    const socialDone = sharedSocial.filter(s => s.status === 'done').length;
                    const upcomingTrips = trips.filter(t => { const d = t.dates?.start ? parseLocalDate(t.dates.start) : null; return d && d >= today; }).length;
                    const memoriesCount = memories.length;
                    const eventsCount = partyEvents.length;

                    // Animated radial progress
                    const RadialProgress = ({ pct, size, color, label, value }) => {
                      const r = (size - 8) / 2;
                      const circ = 2 * Math.PI * r;
                      const offset = circ - (pct / 100) * circ;
                      return (
                        <div className="flex flex-col items-center gap-1.5">
                          <svg width={size} height={size} className="transform -rotate-90">
                            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={circ} strokeDashoffset={offset}
                              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                            <span className="text-lg font-bold text-white">{value}</span>
                          </div>
                        </div>
                      );
                    };

                    const isStatsCollapsed = collapsedSections.stats;
                    return (
                      <div className="mb-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                        <button
                          onClick={() => toggleDashSection('stats')}
                          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition"
                        >
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>📊</span> Stats & Progress
                          </h3>
                          <div className="text-white/40">
                            {isStatsCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                          </div>
                        </button>

                        {!isStatsCollapsed && <>
                        {/* Top row: big radial stats */}
                        <div className="p-5 grid grid-cols-3 gap-4">
                          {/* Fitness ring */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <svg width={72} height={72} className="transform -rotate-90">
                                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle cx={36} cy={36} r={30} fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round"
                                  strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 - (completionPct / 100) * 2 * Math.PI * 30}
                                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-base font-bold text-white">{completionPct}%</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40 mt-1.5">Fitness</span>
                          </div>

                          {/* Tasks ring */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <svg width={72} height={72} className="transform -rotate-90">
                                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle cx={36} cy={36} r={30} fill="none" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round"
                                  strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 - ((tasksDone + tasksPending > 0 ? tasksDone / (tasksDone + tasksPending) : 0)) * 2 * Math.PI * 30}
                                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-base font-bold text-white">{tasksDone}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40 mt-1.5">Tasks Done</span>
                          </div>

                          {/* Social ring */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <svg width={72} height={72} className="transform -rotate-90">
                                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle cx={36} cy={36} r={30} fill="none" stroke="#a78bfa" strokeWidth="6" strokeLinecap="round"
                                  strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 - ((socialDone / Math.max(sharedSocial.length, 1))) * 2 * Math.PI * 30}
                                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-base font-bold text-white">{socialDone}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40 mt-1.5">Social</span>
                          </div>
                        </div>

                        {/* Fitness detail strip */}
                        {totalWorkoutsPlanned > 0 && (
                          <div className="mx-5 mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span>🏃</span>
                                <div>
                                  <span className="font-semibold text-orange-400">{totalRunsDone}</span>
                                  <span className="text-white/40"> runs</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-amber-400">{totalCrossDone}</span>
                                  <span className="text-white/40"> cross</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="font-semibold text-red-400">{weeksCompleted}</span>
                                  <span className="text-white/40"> wks</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-white">{totalMilesPlanned}</span>
                                  <span className="text-white/40"> mi plan</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bottom stat tiles */}
                        <div className="px-5 pb-5 grid grid-cols-4 gap-2">
                          <button onClick={() => setActiveSection('travel')}
                            className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 text-center transition group">
                            <div className="text-lg font-bold text-teal-400 group-hover:scale-110 transition-transform">{trips.length}</div>
                            <div className="text-[9px] text-white/30">Trips</div>
                          </button>
                          <button onClick={() => setActiveSection('events')}
                            className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 text-center transition group">
                            <div className="text-lg font-bold text-amber-400 group-hover:scale-110 transition-transform">{eventsCount}</div>
                            <div className="text-[9px] text-white/30">Events</div>
                          </button>
                          <button onClick={() => setActiveSection('memories')}
                            className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 text-center transition group">
                            <div className="text-lg font-bold text-pink-400 group-hover:scale-110 transition-transform">{memoriesCount}</div>
                            <div className="text-[9px] text-white/30">Memories</div>
                          </button>
                          <button onClick={() => setHubSubView('ideas')}
                            className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 text-center transition group">
                            <div className="text-lg font-bold text-yellow-400 group-hover:scale-110 transition-transform">{sharedIdeas.length}</div>
                            <div className="text-[9px] text-white/30">Ideas</div>
                          </button>
                        </div>
                        </>}
                      </div>
                    );
                  })()}
                </>
              )}

              {/* ===== TASKS FULL VIEW ===== */}
              {hubSubView === 'tasks' && (
                <div>
                  {/* Time horizon filter tabs + sort toggle */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
                      {timeHorizons.map(h => (
                        <button key={h.value} onClick={() => setHubTaskFilter(h.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubTaskFilter === h.value ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                          {h.emoji} {h.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setHubTaskSort(prev => prev === 'date' ? 'priority' : 'date')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 ${
                        hubTaskSort === 'priority' ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                      title={hubTaskSort === 'priority' ? 'Sorted by priority' : 'Sort by priority'}
                    >
                      🔥 {hubTaskSort === 'priority' ? 'Priority' : 'Date'}
                    </button>
                  </div>
                  {/* Task list */}
                  <div className="space-y-2 mb-4">
                    {sharedTasks
                      .filter(t => t.status !== 'done' && taskMatchesHorizon(t, hubTaskFilter))
                      .sort((a, b) => {
                        if (hubTaskSort === 'priority') {
                          const pOrder = { high: 0, medium: 1, low: 2 };
                          const pa = pOrder[a.priority] ?? 2;
                          const pb = pOrder[b.priority] ?? 2;
                          if (pa !== pb) return pa - pb;
                        }
                        return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
                      })
                      .map(task => (
                        <div key={task.id} data-search-id={`tasks-${task.id}`}>
                          <TaskCard task={task} onComplete={completeTask} onDelete={deleteTask} onHighlight={highlightTask} onUpdatePriority={(id, p) => updateTask(id, { priority: p })} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        </div>
                      ))
                    }
                    {sharedTasks.filter(t => t.status !== 'done' && taskMatchesHorizon(t, hubTaskFilter)).length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">{timeHorizons.find(h => h.value === hubTaskFilter)?.emoji || '✅'}</span>
                        <p className="text-white/40 text-sm">No tasks for {timeHorizons.find(h => h.value === hubTaskFilter)?.label?.toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                  {/* Completed tasks */}
                  {sharedTasks.filter(t => t.status === 'done').length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs uppercase tracking-wider text-white/30 mb-3">Completed</h4>
                      <div className="space-y-2">
                        {sharedTasks.filter(t => t.status === 'done').slice(0, 10).map(task => (
                          <TaskCard key={task.id} task={task} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Add task button */}
                  <button onClick={() => setShowAddTaskModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-teal-500/30 hover:text-teal-400 transition text-sm">
                    + Add Task
                  </button>
                </div>
              )}

              {/* ===== LISTS FULL VIEW ===== */}
              {hubSubView === 'lists' && (
                <div>
                  {/* Category filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    <button onClick={() => setHubListFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubListFilter === 'all' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      All
                    </button>
                    {listCategories.map(c => (
                      <button key={c.value} onClick={() => setHubListFilter(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubListFilter === c.value ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Lists */}
                  <div className="space-y-3 mb-4">
                    {sharedLists
                      .filter(l => l.status === 'active' && (hubListFilter === 'all' || l.category === hubListFilter))
                      .map(list => (
                        <div key={list.id} data-search-id={`lists-${list.id}`}>
                          <ListCard list={list} currentUser={currentUser} onNavigateToLinked={navigateToLinked} getLinkedLabel={getLinkedLabel} />
                        </div>
                      ))
                    }
                    {sharedLists.filter(l => l.status === 'active' && (hubListFilter === 'all' || l.category === hubListFilter)).length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">📝</span>
                        <p className="text-white/40 text-sm">No lists yet</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowSharedListModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-emerald-400 transition text-sm">
                    + Create List
                  </button>
                </div>
              )}

              {/* ===== SOCIAL FULL VIEW ===== */}
              {hubSubView === 'social' && (
                <div>
                  {/* Type filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    {[{ value: 'all', label: 'All', emoji: '👥' }, ...socialTypes].map(st => (
                      <button key={st.value} onClick={() => setHubSocialFilter(st.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubSocialFilter === st.value ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {st.emoji} {st.label}
                      </button>
                    ))}
                  </div>
                  {/* Planned */}
                  <div className="space-y-2 mb-4">
                    {sharedSocial
                      .filter(s => s.status !== 'done')
                      .filter(s => hubSocialFilter === 'all' || s.type === hubSocialFilter)
                      .sort((a, b) => {
                        if (a.date && b.date) return a.date.localeCompare(b.date);
                        if (a.date) return -1;
                        if (b.date) return 1;
                        return (b.createdAt || '').localeCompare(a.createdAt || '');
                      })
                      .map(social => (
                        <div key={social.id} data-search-id={`social-${social.id}`}>
                          <SocialCard social={social} onNavigateToEvent={navigateToEvent} getEventLabel={getEventLabel} />
                        </div>
                      ))
                    }
                  </div>
                  {/* Done section */}
                  {sharedSocial.filter(s => s.status === 'done' && (hubSocialFilter === 'all' || s.type === hubSocialFilter)).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Done</h4>
                      <div className="space-y-2">
                        {sharedSocial
                          .filter(s => s.status === 'done' && (hubSocialFilter === 'all' || s.type === hubSocialFilter))
                          .slice(0, 10)
                          .map(social => (
                            <SocialCard key={social.id} social={social} onComplete={completeSocial} onDelete={deleteSocial} onHighlight={highlightSocial} onNavigateToEvent={navigateToEvent} getEventLabel={getEventLabel} />
                          ))
                        }
                      </div>
                    </div>
                  )}
                  {sharedSocial.filter(s => hubSocialFilter === 'all' || s.type === hubSocialFilter).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-4xl mb-3 block">👥</span>
                      <p className="text-white/40 text-sm">No social plans yet</p>
                      <p className="text-white/30 text-xs mt-1">Plan texts, calls, meetups, gatherings...</p>
                    </div>
                  )}
                  <button onClick={() => setShowAddSocialModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-purple-500/30 hover:text-purple-400 transition text-sm">
                    + Plan Social
                  </button>
                </div>
              )}

              {/* ===== HABITS FULL VIEW ===== */}
              {hubSubView === 'habits' && (
                <div>
                  {/* Identity statements banner */}
                  {(() => {
                    const identities = sharedHabits.filter(h => h.identity && h.status === 'active');
                    return identities.length > 0 && (
                      <div className="mb-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
                        <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-2">We are a couple that...</div>
                        <div className="space-y-1">
                          {identities.map(h => (
                            <p key={h.id} className="text-xs text-amber-200/70 italic">• {h.identity.replace(/^"?(we are a couple that\s*)/i, '')}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Category filter */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {[{ value: 'all', label: 'All', emoji: '🔄' }, ...habitCategories].map(cat => (
                      <button key={cat.value} onClick={() => setHubHabitFilter(cat.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubHabitFilter === cat.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Active habits */}
                  <div className="space-y-3 mb-4">
                    {sharedHabits
                      .filter(h => h.status === 'active')
                      .filter(h => hubHabitFilter === 'all' || h.category === hubHabitFilter)
                      .map(habit => (
                        <div key={habit.id} data-search-id={`habits-${habit.id}`}>
                          <HabitCard
                            habit={habit}
                            currentUser={currentUser}
                           
                          />
                        </div>
                      ))
                    }
                    {sharedHabits.filter(h => h.status === 'active' && (hubHabitFilter === 'all' || h.category === hubHabitFilter)).length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-3 block">🔄</span>
                        <p className="text-white/40 text-sm">No habits yet</p>
                        <p className="text-white/30 text-xs mt-1">Build consistency, not streaks</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowAddHabitModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-emerald-400 transition text-sm">
                    + New Habit
                  </button>
                </div>
              )}

              {/* ===== IDEAS FULL VIEW ===== */}
              {hubSubView === 'ideas' && (
                <div>
                  {/* Filters */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                    {[{ value: 'all', label: 'All' }, ...ideaCategories].map(c => (
                      <button key={c.value} onClick={() => setHubIdeaFilter(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${hubIdeaFilter === c.value ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {c.emoji || '🔍'} {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Ideas grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {sharedIdeas
                      .filter(i => (hubIdeaFilter === 'all' || i.category === hubIdeaFilter))
                      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                      .map(idea => (
                        <div key={idea.id} data-search-id={`ideas-${idea.id}`}>
                          <IdeaCard idea={idea} onDelete={deleteIdea} onHighlight={highlightIdea} onPromoteToTask={promoteIdeaToTask} />
                        </div>
                      ))
                    }
                  </div>
                  {sharedIdeas.filter(i => hubIdeaFilter === 'all' || i.category === hubIdeaFilter).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-4xl mb-3 block">💡</span>
                      <p className="text-white/40 text-sm">No ideas saved yet</p>
                      <p className="text-white/30 text-xs mt-1">Paste links from restaurants, travel sites, recipes...</p>
                    </div>
                  )}
                  <button onClick={() => setShowAddIdeaModal('create')}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-amber-500/30 hover:text-amber-400 transition text-sm">
                    + Add Idea
                  </button>
                </div>
              )}
            </div>
            </SharedHubProvider>
          )}
          {/* ========== END HUB SECTION ========== */}

          {/* ========== TRAVEL SECTION ========== */}
          {activeSection === 'travel' && (
          <div>
            {/* Action Buttons - Travel (left padding for FAB on mobile) */}
            <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
              {[
                { id: 'main', emoji: '✈️', action: () => setTravelViewMode('main') },
                { id: 'random', emoji: '🎲', action: () => setTravelViewMode('random') },
                { id: 'wishlist', emoji: '🦄', action: () => setTravelViewMode('wishlist') },
                ...(isOwner ? [
                  { id: 'opendates', emoji: '📅', action: () => setShowOpenDateModal(true) },
                  { id: 'circle', emoji: '👥', action: () => setShowTravelCircleModal(true) },
                ] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                    travelViewMode === tab.id
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {tab.emoji}
                </button>
              ))}
            </div>

          {/* Trip Detail View - Inline (like Events) */}
          {selectedTrip ? (
            <TripDetail
              trip={selectedTrip}
              editingTrip={editingTrip}
              setEditingTrip={setEditingTrip}
              editingTripDates={editingTripDates}
              setEditingTripDates={setEditingTripDates}
              setSelectedTrip={setSelectedTrip}
              tripDetails={tripDetails}
              setTripDetails={setTripDetails}
              canEditTrip={canEditTrip}
              removeItem={removeItem}
              removeLink={removeLink}
              addLink={addLink}
              setShowAddModal={setShowAddModal}
              setShowLinkModal={setShowLinkModal}
              setShowGuestModal={setShowGuestModal}
              showLinkModal={showLinkModal}
              showGuestModal={showGuestModal}
              isOwner={isOwner}
              isGuest={isGuest}
              guestPermissions={guestPermissions}
              currentUser={currentUser}
              updateTripDates={updateTripDates}
              showToast={showToast}
              saveToFirestore={saveToFirestore}
              setTrips={setTrips}
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
              guestPermission={guestPermission}
              setGuestPermission={setGuestPermission}
              linkedTasks={sharedTasks.filter(t => t && t.linkedTo && t.linkedTo.section === 'trips' && t.linkedTo.itemId === selectedTrip?.id)}
              onCompleteTask={completeTask}
              onEditTask={(t) => setShowAddTaskModal(t)}
            />
          ) : (
            <>

          {/* Main Adventures View */}
          {travelViewMode === 'main' && (
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
              <div
                onClick={() => setEditingTrip(nextTrip)}
                className={`mt-6 bg-gradient-to-r ${nextTrip.color} rounded-2xl p-4 md:p-6 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex flex-col md:flex-row items-start justify-between gap-4">
                  {/* Left side - Trip info */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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

          {/* Trip Cards - Confirmed Adventures (skip the first upcoming trip since it's in the banner) */}
          <section className="mt-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcomingTrips = sortedTrips.filter(t => parseLocalDate(t.dates.start) > today);
                const nextTripId = upcomingTrips.length > 0 ? upcomingTrips[0].id : null;
                // Filter out the next upcoming trip (shown in banner) from the grid
                return confirmedTrips.filter(trip => trip.id !== nextTripId);
              })().map(trip => (
                <div
                  key={trip.id}
                  data-search-id={`travel-${trip.id}`}
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
                        setEditingTrip(trip);
                      }
                    }}
                    className="w-full text-left relative z-10"
                  >
                    <div className="text-4xl mb-3">{trip.emoji}</div>
                    <h3 className="text-xl font-bold mb-1">{trip.destination}</h3>
                    <p className="text-white/80 text-sm">
                      {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                    </p>
                    {(() => {
                      const now = new Date();
                      const tripStart = parseLocalDate(trip.dates.start);
                      const tripEnd = parseLocalDate(trip.dates.end);
                      const daysTo = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
                      const isOngoing = now >= tripStart && now <= tripEnd;
                      if (isOngoing) return (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                          🎉 Happening now!
                        </div>
                      );
                      if (daysTo > 0) return (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                          {daysTo <= 7 ? '🔥' : daysTo <= 30 ? '✨' : '🗓️'} {daysTo} {daysTo === 1 ? 'day' : 'days'} to go!
                        </div>
                      );
                      return null;
                    })()}
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
                              title={guest.name || guest.email || 'Guest'}
                            >
                              {(guest.name || guest.email || '?').charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs opacity-80">
                          +{trip.guests.length} guest{trip.guests.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {/* Linked Hub Items */}
                    {(() => {
                      const { linkedTasks, linkedLists } = getLinkedHubItems('travel', trip.id);
                      if (linkedTasks.length === 0 && linkedLists.length === 0) return null;
                      return (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {linkedTasks.map(task => (
                            <button
                              key={task.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSection('home');
                                setHubSubView('home');
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition hover:scale-105 ${
                                task.status === 'done'
                                  ? 'bg-green-500/30 text-green-200'
                                  : 'bg-white/20 text-white'
                              }`}
                              title={task.title}
                            >
                              <span>{task.status === 'done' ? '✅' : '☑️'}</span>
                              <span className="max-w-[80px] truncate">{task.title}</span>
                            </button>
                          ))}
                          {linkedLists.map(list => (
                            <button
                              key={list.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSection('home');
                                setHubSubView('home');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white transition hover:scale-105"
                              title={list.name}
                            >
                              <span>{list.emoji || '📝'}</span>
                              <span className="max-w-[80px] truncate">{list.name}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
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
                    onClick={() => setEditingTrip(trip)}
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
                        onClick={() => setEditingTrip(trip)}
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
                    onClick={() => tripOnDate ? setEditingTrip(tripOnDate) : openDateOnDay ? setShowOpenDateModal(true) : null}
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
                    onClick={() => setEditingTrip(trip)}
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
                      onClick={() => !trip.isWishlist && setEditingTrip(trip)}
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
          {/* End Main Adventures View */}

          {/* Random Adventure View */}
          {travelViewMode === 'random' && (
            <div className="mt-8">
              {/* Mobile Back Button */}
              <button
                onClick={() => setTravelViewMode('main')}
                className="md:hidden flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4 active:scale-95 transition min-h-[44px]"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Adventures</span>
              </button>
              <div className="max-w-2xl mx-auto">
                {/* Random Experience Generator */}
                <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-3xl p-8 border border-amber-500/30 text-center mb-8">
                  <div className="text-6xl mb-4">🎲</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Random Adventure Generator</h2>
                  <p className="text-slate-300 mb-6">Let fate decide your next destination!</p>

                  <button
                    onClick={() => setShowRandomExperience(true)}
                    className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl rounded-2xl hover:opacity-90 transition shadow-lg"
                  >
                    🎰 Spin the Wheel!
                  </button>
                </div>

                {/* Experience Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { emoji: '🏖️', label: 'Beach / Warm', color: 'from-cyan-500/20 to-blue-500/20' },
                    { emoji: '🏔️', label: 'Mountain Escape', color: 'from-emerald-500/20 to-green-500/20' },
                    { emoji: '🏛️', label: 'Cultural', color: 'from-purple-500/20 to-indigo-500/20' },
                    { emoji: '🎢', label: 'Adventure', color: 'from-orange-500/20 to-red-500/20' },
                    { emoji: '🏃', label: 'Fitness / Active', color: 'from-red-500/20 to-orange-500/20' },
                    { emoji: '🧘', label: 'Relaxing / Spa', color: 'from-teal-500/20 to-cyan-500/20' },
                    { emoji: '🍷', label: 'Food & Wine', color: 'from-rose-500/20 to-pink-500/20' },
                    { emoji: '🌆', label: 'City Break', color: 'from-slate-500/20 to-zinc-500/20' },
                    { emoji: '🏕️', label: 'Nature / Outdoors', color: 'from-green-500/20 to-lime-500/20' },
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShowRandomExperience(true)}
                      className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition text-center active:scale-95`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{cat.emoji}</div>
                      <div className="text-white font-medium text-sm sm:text-base">{cat.label}</div>
                    </button>
                  ))}
                </div>

                {/* Recent Random Picks */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">💡 How it works</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">1.</span>
                      <span>Click "Spin the Wheel" to get a random destination suggestion</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">2.</span>
                      <span>Love it? Add it to your adventures or wishlist</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-400">3.</span>
                      <span>Not feeling it? Spin again for a new suggestion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* End Random Adventure View */}

          {/* Wishlist View */}
          {travelViewMode === 'wishlist' && (
            <div className="mt-8">
              {/* Mobile Back Button */}
              <button
                onClick={() => setTravelViewMode('main')}
                className="md:hidden flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4 active:scale-95 transition min-h-[44px]"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Adventures</span>
              </button>
              {/* Add to Wishlist Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">🦄</span>
                  Dream Destinations
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400">✨</span>
                </h2>
                {isOwner && (
                  <button
                    onClick={() => setShowNewTripModal('wishlist')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Dream
                  </button>
                )}
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(item => (
                    <div
                      key={item.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400" />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-4xl mb-3">{item.emoji}</div>
                          <h3 className="text-xl font-bold text-white mb-1">{item.destination}</h3>
                          {item.notes && (
                            <p className="text-slate-400 text-sm">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => convertToAdventure(item)}
                            className="px-3 py-1.5 bg-gradient-to-r from-teal-400 to-purple-400 text-white text-sm font-medium rounded-full hover:opacity-80 transition"
                          >
                            Book it! 🎉
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${item.destination} from wishlist?`)) {
                                  const newWishlist = wishlist.filter(w => w.id !== item.id);
                                  setWishlist(newWishlist);
                                  saveToFirestore(null, newWishlist, null);
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 text-slate-300 text-sm rounded-full hover:bg-red-500/20 hover:text-red-300 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <Starburst className="absolute -right-4 -bottom-4 w-16 h-16 text-white/5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold text-white mb-2">No dream destinations yet</h3>
                  <p className="text-slate-400 mb-6">Start adding places you'd love to visit!</p>
                  {isOwner && (
                    <button
                      onClick={() => setShowNewTripModal('wishlist')}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                    >
                      Add Your First Dream ✨
                    </button>
                  )}
                </div>
              )}

              {/* Inspiration Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-4">🌈 Need Inspiration?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { destination: 'Santorini', emoji: '🇬🇷', notes: 'Stunning sunsets' },
                    { destination: 'Kyoto', emoji: '🇯🇵', notes: 'Cherry blossoms' },
                    { destination: 'Reykjavik', emoji: '🇮🇸', notes: 'Northern lights' },
                    { destination: 'Bali', emoji: '🇮🇩', notes: 'Tropical paradise' },
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isOwner) {
                          const newItem = {
                            id: Date.now(),
                            destination: idea.destination,
                            emoji: idea.emoji,
                            notes: idea.notes,
                            color: 'from-violet-400 to-purple-400',
                            isWishlist: true
                          };
                          const newWishlist = [...wishlist, newItem];
                          setWishlist(newWishlist);
                          saveToFirestore(null, newWishlist, null);
                          showToast(`${idea.destination} added to wishlist!`, 'success');
                        }
                      }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition text-left"
                    >
                      <div className="text-2xl mb-1">{idea.emoji}</div>
                      <div className="text-white font-medium">{idea.destination}</div>
                      <div className="text-slate-400 text-xs">{idea.notes}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* End Wishlist View */}
            </>
          )}
          </div>
          )}
          {/* ========== END TRAVEL SECTION ========== */}

          {/* ========== FITNESS SECTION ========== */}
          {activeSection === 'fitness' && (
            <div>
              {/* Fitness View Mode Toggle (left padding for FAB on mobile) */}
              <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                {[
                  { id: 'events', emoji: '🎯' },
                  { id: 'training', emoji: '📋' },
                  { id: 'stats', emoji: '📊' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setFitnessViewMode(mode.id)}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                      fitnessViewMode === mode.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {mode.emoji}
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
                        data-search-id={`fitness-${event.id}`}
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const text = `🏃 Training for ${event.emoji} ${event.name}!\n\n` +
                                    `📅 ${daysUntil > 0 ? `${daysUntil} days to go!` : 'Race day!'}\n` +
                                    `✅ ${completedWorkouts}/${totalWorkouts} workouts completed\n` +
                                    `📊 ${Math.round((completedWorkouts / totalWorkouts) * 100)}% progress\n\n` +
                                    `#TrainingTogether #${event.name.replace(/[^a-zA-Z]/g, '')}`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'Training Progress', text });
                                  } else {
                                    navigator.clipboard.writeText(text);
                                    showToast('Progress copied to clipboard! 📋', 'success');
                                  }
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                                title="Share progress"
                              >
                                <Share2 className="w-4 h-4 text-white" />
                              </button>
                              <div className="flex gap-1">
                                {['🏃', '💪', '🎯'].map((e, i) => (
                                  <span key={i} className="text-xl opacity-50 group-hover:opacity-100 transition">{e}</span>
                                ))}
                              </div>
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
                  <div className="flex gap-2 mb-6 flex-wrap items-center">
                    {fitnessEvents.map(event => (
                      <div key={event.id} className="relative group">
                        <button
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
                        {/* Edit button - only show for non-hardcoded events */}
                        {!['indy-half-2026', 'triathlon-2026'].includes(event.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFitnessEvent(event);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Edit event"
                          >
                            <Pencil className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedFitnessEvent && getActiveTrainingPlan(selectedFitnessEvent.id) && (
                    <div className="space-y-4">
                      {/* Stats and Encouragement */}
                      {(() => {
                        const plan = getActiveTrainingPlan(selectedFitnessEvent.id);
                        const isTriathlon = selectedFitnessEvent.id === 'triathlon-2026';
                        const isMikeOnlyPlan = plan[0]?.runs?.[0] && !('adam' in plan[0].runs[0]);

                        // A week is "done" based on plan type
                        const completedWeeks = plan.filter(w => {
                          if (isMikeOnlyPlan) {
                            return w.runs?.every(r => r.mike) && w.crossTraining?.every(c => c.mike);
                          }
                          return w.runs?.every(r => r.mike && r.adam) && w.crossTraining?.every(c => c.mike && c.adam);
                        }).length;

                        // For triathlon, separate by activity type
                        if (isTriathlon) {
                          const mikeSwimYards = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('swim'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeBikeMiles = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('bike'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeRunMiles = plan.reduce((acc, w) => {
                            return acc + (w.runs?.filter(r => r.mike && r.label?.toLowerCase().includes('run'))
                              .reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0);
                          }, 0);
                          const mikeWorkouts = plan.reduce((acc, w) => acc + (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0), 0);

                          return (
                            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30 mb-6">
                              {/* Mike Only Legend */}
                              <div className="flex justify-center gap-6 mb-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                  <span className="text-blue-400">Mike</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-green-500/40"></div>
                                  <span className="text-green-400">Complete ✓</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-5 gap-3 text-center mb-4">
                                <div>
                                  <div className="text-2xl font-bold text-orange-400">{completedWeeks}</div>
                                  <div className="text-white/60 text-xs">Weeks Done</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-blue-400">{mikeSwimYards.toLocaleString()}</div>
                                  <div className="text-white/60 text-xs">🏊 Yards Swam</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-green-400">{mikeBikeMiles.toFixed(1)}</div>
                                  <div className="text-white/60 text-xs">🚴 Miles Biked</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-orange-400">{mikeRunMiles.toFixed(1)}</div>
                                  <div className="text-white/60 text-xs">🏃 Miles Run</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-purple-400">{mikeWorkouts}</div>
                                  <div className="text-white/60 text-xs">Workouts</div>
                                </div>
                              </div>
                              <div className="text-center text-lg text-white/80">
                                Go Mike! You're training for a triathlon! 🏊🚴🏃
                              </div>
                              <button
                                onClick={() => shareProgress(selectedFitnessEvent, { mikeSwimYards, mikeBikeMiles, mikeRunMiles, completedWeeks, totalWeeks: plan.length })}
                                className="mt-4 w-full py-2 bg-orange-500/30 hover:bg-orange-500/40 text-orange-300 rounded-lg transition flex items-center justify-center gap-2"
                              >
                                <Share2 className="w-4 h-4" />
                                Share Progress
                              </button>
                            </div>
                          );
                        }

                        // Calculate miles for Mike and Adam separately (half marathon and other plans)
                        const mikeMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.mike).reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0;
                          return acc + weekMiles;
                        }, 0);
                        const adamMiles = plan.reduce((acc, w) => {
                          const weekMiles = w.runs?.filter(r => r.adam).reduce((sum, r) => sum + (parseFloat(String(r.distance).replace(/[^\d.]/g, '')) || 0), 0) || 0;
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
                            <div className="text-center text-lg text-white font-medium mb-4">
                              {encouragement}
                            </div>

                            {/* Share Progress Button */}
                            <div className="text-center">
                              <button
                                onClick={() => {
                                  const eventDate = parseLocalDate(selectedFitnessEvent.date);
                                  const today = new Date();
                                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                                  const totalMiles = mikeMiles + adamMiles;
                                  const text = `🏃 Training Update for ${selectedFitnessEvent.emoji} ${selectedFitnessEvent.name}!\n\n` +
                                    `📅 ${daysUntil} days until race day\n` +
                                    `✅ ${completedWeeks} weeks completed together\n` +
                                    `🏃 ${totalMiles.toFixed(1)} miles run combined\n` +
                                    `💪 Mike: ${mikeWorkouts} workouts | Adam: ${adamWorkouts} workouts\n\n` +
                                    `${encouragement}\n\n#TrainingTogether #RunningPartners`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'Training Progress', text });
                                  } else {
                                    navigator.clipboard.writeText(text);
                                    showToast('Progress copied to clipboard! 📋', 'success');
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition"
                              >
                                <Share2 className="w-4 h-4" />
                                Share Progress
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Training Weeks - Past (collapsed) → Current (highlight) → Future (accordion) */}
                      {(() => {
                        const allWeeks = getActiveTrainingPlan(selectedFitnessEvent.id);
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        const pastWeeks = allWeeks.filter(w => w.endDate < todayStr);
                        const currentWeek = allWeeks.find(w => w.startDate <= todayStr && w.endDate >= todayStr);
                        const currentWeekIndex = allWeeks.findIndex(w => w.startDate <= todayStr && w.endDate >= todayStr);
                        const futureWeeks = allWeeks.filter(w => w.startDate > todayStr);
                        const isTriathlon = selectedFitnessEvent?.id === 'triathlon-2026';

                        const renderWeekAccordion = (week, index, opts = {}) => {
                          const isPast = week.endDate < todayStr;
                          const completedCount = isTriathlon
                            ? (week.runs?.filter(r => r.mike).length || 0) + (week.crossTraining?.filter(c => c.mike).length || 0)
                            : (week.runs?.filter(r => r.mike && r.adam).length || 0) + (week.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                          const totalCount = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                          const weekPhotos = week.photos || [];

                          return (
                            <details
                              key={week.id}
                              className={`group rounded-xl border transition ${
                                isPast ? 'border-white/10 bg-gray-600/20 opacity-70' :
                                'border-white/10 hover:border-white/20 bg-white/5'
                              } ${week.isRecovery ? 'bg-green-500/10' : ''}`}
                            >
                              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isPast ? 'bg-white/20 text-white/60' : 'bg-white/10 text-white/80'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium flex items-center gap-2">
                                      Week {index + 1}
                                      {week.isRecovery && <span className="text-xs px-2 py-0.5 bg-green-500/30 text-green-300 rounded-full">Recovery</span>}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                      {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {weekPhotos.length > 0 && (
                                    <div className="flex -space-x-2">
                                      {weekPhotos.slice(0, 3).map(photo => (
                                        <img key={photo.id} src={photo.url} alt="" className="w-8 h-8 rounded-lg object-cover border-2 border-slate-800" />
                                      ))}
                                      {weekPhotos.length > 3 && <span className="w-8 h-8 rounded-lg bg-white/20 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white/70 font-medium">+{weekPhotos.length - 3}</span>}
                                    </div>
                                  )}
                                  <div className="text-white/60 text-sm">{completedCount}/{totalCount} done</div>
                                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${completedCount === totalCount ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
                                  </div>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...week } }); }} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition" title="Edit week">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <ChevronRight className="w-5 h-5 text-white/40 transition-transform group-open:rotate-90" />
                                </div>
                              </summary>
                              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-orange-300 mb-2">{isTriathlon ? '🏃 Activities' : '🏃 Runs'}</h4>
                                    <div className="space-y-1">
                                      {week.runs?.map(run => (
                                        <div key={run.id} className={`flex items-center gap-2 p-2 rounded ${isTriathlon ? (run.mike ? 'bg-green-500/20' : 'bg-white/5') : ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-1">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { mike: !run.mike })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'}`} title="Mike">
                                              {run.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { adam: !run.adam })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'}`} title="Adam">{run.adam && <Check className="w-3 h-3 text-white" />}</button>}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{run.label || run.day}</span>
                                          <span className="text-white font-medium text-sm">{run.distance}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-red-300 mb-2">💪 Cross Training</h4>
                                    <div className="space-y-1">
                                      {week.crossTraining?.map(ct => (
                                        <div key={ct.id} className={`flex items-center gap-2 p-2 rounded ${isTriathlon ? (ct.mike ? 'bg-green-500/20' : 'bg-white/5') : ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-1">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { mike: !ct.mike })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40'}`} title="Mike">
                                              {ct.mike && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { adam: !ct.adam })} className={`w-5 h-5 rounded-full border flex items-center justify-center ${ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40'}`} title="Adam">{ct.adam && <Check className="w-3 h-3 text-white" />}</button>}
                                          </div>
                                          <span className="text-white/80 text-sm flex-1">{ct.label || ct.day}</span>
                                          <span className="text-white/60 text-xs">30+ min</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <textarea value={week.weekNotes || ''} onChange={(e) => updateTrainingWeek(selectedFitnessEvent.id, week.id, { weekNotes: e.target.value })} placeholder="Notes for this week..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm resize-y" rows={1} />
                                </div>
                                <div
                                  className="mt-3"
                                  onDrop={(e) => { e.preventDefault(); setWeekPhotoDrag(null); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, week.id, weekPhotos, file); }}
                                  onDragOver={(e) => { e.preventDefault(); setWeekPhotoDrag(week.id); }}
                                  onDragLeave={() => setWeekPhotoDrag(null)}
                                >
                                  {weekPhotos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {weekPhotos.map(photo => (
                                        <div key={photo.id} className="relative group/photo">
                                          <img src={photo.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                                          <button onClick={() => handleWeekPhotoRemove(selectedFitnessEvent.id, week.id, weekPhotos, photo.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {uploadingWeekPhotoId === week.id ? (
                                    <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-orange-400 bg-orange-500/10 text-orange-300">
                                      <Loader className="w-4 h-4 animate-spin" />
                                      <span className="text-xs">Uploading...</span>
                                    </div>
                                  ) : (
                                    <label className={`flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer transition ${weekPhotoDrag === week.id ? 'border-orange-400 bg-orange-500/10 text-orange-300' : 'border-white/10 text-white/30 hover:text-white/50 hover:border-white/20'}`}>
                                      <Upload className="w-4 h-4" />
                                      <span className="text-xs">Add Photo</span>
                                      <input
                                        type="file"
                                        accept="image/*,.heic,.heif"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, week.id, weekPhotos, file);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </details>
                          );
                        };

                        return (
                          <div className="space-y-2">
                            {/* 1. Past Weeks - Collapsed */}
                            {pastWeeks.length > 0 && (
                              <div className="rounded-xl border border-white/10 overflow-hidden">
                                <button
                                  onClick={() => setPastWeeksExpanded(!pastWeeksExpanded)}
                                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition text-white/60"
                                >
                                  <div className="flex items-center gap-2">
                                    {pastWeeksExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="text-sm font-medium">Past Weeks ({pastWeeks.length})</span>
                                  </div>
                                  <span className="text-xs text-white/40">
                                    {pastWeeks.filter(w => {
                                      const cc = isTriathlon ? (w.runs?.filter(r => r.mike).length || 0) + (w.crossTraining?.filter(c => c.mike).length || 0) : (w.runs?.filter(r => r.mike && r.adam).length || 0) + (w.crossTraining?.filter(c => c.mike && c.adam).length || 0);
                                      const tc = (w.runs?.length || 0) + (w.crossTraining?.length || 0);
                                      return tc > 0 && cc === tc;
                                    }).length}/{pastWeeks.length} completed
                                  </span>
                                </button>
                                {pastWeeksExpanded && (
                                  <div className="space-y-2 p-2">
                                    {pastWeeks.map((week) => renderWeekAccordion(week, allWeeks.findIndex(w => w.id === week.id)))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 2. Current Week Highlight */}
                            {currentWeek && (
                              <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl p-6 border-2 border-orange-500/50">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-2xl">📅</span>
                                  <h3 className="text-xl font-bold text-white">This Week - Week {currentWeek.weekNumber || currentWeekIndex + 1}</h3>
                                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">CURRENT</span>
                                  {currentWeek.totalMiles && <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">{currentWeek.totalMiles} mi goal</span>}
                                  <button onClick={() => setEditingTrainingWeek({ eventId: selectedFitnessEvent.id, week: { ...currentWeek } })} className="ml-auto p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition" title="Edit week">
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                </div>
                                {(currentWeek.photos || []).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {(currentWeek.photos || []).map(photo => (
                                      <div key={photo.id} className="relative group/photo">
                                        <img src={photo.url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                                        <button onClick={() => handleWeekPhotoRemove(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos, photo.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {currentWeek.weekNotes && <div className="mb-4 px-4 py-2 bg-white/10 rounded-lg text-white/90">{currentWeek.weekNotes}</div>}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="bg-white/10 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2"><span>🏃</span> {isTriathlon ? 'Activities' : 'Runs'}</h4>
                                    <div className="space-y-2">
                                      {currentWeek.runs?.map(run => (
                                        <div key={run.id} className={`flex items-center gap-3 p-3 rounded-lg ${isTriathlon ? (run.mike ? 'bg-green-500/20' : 'bg-white/5') : ((run.mike && run.adam) ? 'bg-green-500/20' : (run.mike || run.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-2">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { mike: !run.mike })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${run.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'}`} title="Mike">{run.mike && <Check className="w-4 h-4 text-white" />}</button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { adam: !run.adam })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${run.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'}`} title="Adam">{run.adam && <Check className="w-4 h-4 text-white" />}</button>}
                                          </div>
                                          <div className="flex-1">
                                            <div className="text-white font-medium">{run.label || run.day}</div>
                                            <div className="text-xs text-white/50">{isTriathlon ? <span className={run.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span> : <><span className={run.mike ? 'text-blue-400' : 'text-white/30'}>M</span>{' / '}<span className={run.adam ? 'text-purple-400' : 'text-white/30'}>A</span></>}</div>
                                          </div>
                                          <div className="text-white font-bold">{run.distance}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white/10 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2"><span>💪</span> Cross Training</h4>
                                    <div className="space-y-2">
                                      {currentWeek.crossTraining?.map(ct => (
                                        <div key={ct.id} className={`flex items-center gap-3 p-3 rounded-lg ${isTriathlon ? (ct.mike ? 'bg-green-500/20' : 'bg-white/5') : ((ct.mike && ct.adam) ? 'bg-green-500/20' : (ct.mike || ct.adam) ? 'bg-yellow-500/20' : 'bg-white/5')}`}>
                                          <div className="flex gap-2">
                                            <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { mike: !ct.mike })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${ct.mike ? 'bg-blue-500 border-blue-500' : 'border-white/40 hover:border-white'}`} title="Mike">{ct.mike && <Check className="w-4 h-4 text-white" />}</button>
                                            {!isTriathlon && <button onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { adam: !ct.adam })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${ct.adam ? 'bg-purple-500 border-purple-500' : 'border-white/40 hover:border-white'}`} title="Adam">{ct.adam && <Check className="w-4 h-4 text-white" />}</button>}
                                          </div>
                                          <div className="flex-1">
                                            <div className="text-white font-medium">{ct.label || ct.day}</div>
                                            <div className="text-xs text-white/50">{isTriathlon ? <span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>Mike</span> : <><span className={ct.mike ? 'text-blue-400' : 'text-white/30'}>M</span>{' / '}<span className={ct.adam ? 'text-purple-400' : 'text-white/30'}>A</span></>}</div>
                                          </div>
                                          <span className="text-white/60 text-sm">30+ min</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {/* Current Week Notes */}
                                <div className="mt-4">
                                  <textarea value={currentWeek.weekNotes || ''} onChange={(e) => updateTrainingWeek(selectedFitnessEvent.id, currentWeek.id, { weekNotes: e.target.value })} placeholder="Add notes for this week..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 resize-y" rows={2} />
                                </div>
                                {/* Current Week Photos */}
                                <div
                                  className="mt-4"
                                  onDrop={(e) => { e.preventDefault(); setWeekPhotoDrag(null); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos || [], file); }}
                                  onDragOver={(e) => { e.preventDefault(); setWeekPhotoDrag(currentWeek.id); }}
                                  onDragLeave={() => setWeekPhotoDrag(null)}
                                >
                                  {(currentWeek.photos || []).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {(currentWeek.photos || []).map(photo => (
                                        <div key={photo.id} className="relative group/photo">
                                          <img src={photo.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/20" />
                                          <button onClick={() => handleWeekPhotoRemove(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos, photo.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {uploadingWeekPhotoId === currentWeek.id ? (
                                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl border-orange-400 bg-orange-500/10 text-orange-300">
                                      <Loader className="w-5 h-5 animate-spin" />
                                      <span className="text-sm">Uploading photo...</span>
                                    </div>
                                  ) : (
                                  <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition ${weekPhotoDrag === currentWeek.id ? 'border-orange-400 bg-orange-500/10 text-orange-300' : 'border-white/20 text-white/40 hover:text-white/60 hover:border-white/30'}`}>
                                    <Upload className="w-5 h-5" />
                                    <span className="text-sm">Add Photo</span>
                                    <input
                                      type="file"
                                      accept="image/*,.heic,.heif"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleWeekPhotoAdd(selectedFitnessEvent.id, currentWeek.id, currentWeek.photos || [], file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 3. Future Weeks */}
                            {futureWeeks.map((week) => renderWeekAccordion(week, allWeeks.findIndex(w => w.id === week.id)))}
                          </div>
                        );
                      })()}
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
                    // Initialize counters
                    let totalRuns = 0, mikeRuns = 0, adamRuns = 0;
                    let totalSwims = 0, mikeSwims = 0, adamSwims = 0;
                    let totalBikes = 0, mikeBikes = 0, adamBikes = 0;
                    let totalCross = 0, mikeCross = 0, adamCross = 0;
                    let mikeRunMiles = 0, adamRunMiles = 0;
                    let mikeSwimYards = 0, adamSwimYards = 0;
                    let mikeBikeMiles = 0, adamBikeMiles = 0;

                    // Helper to detect activity type from label
                    const isSwim = (label) => label?.toLowerCase().includes('swim') || label?.includes('🏊');
                    const isBike = (label) => label?.toLowerCase().includes('bike') || label?.toLowerCase().includes('cycle') || label?.includes('🚴');

                    // Use getActiveTrainingPlan to get merged hardcoded + Firebase data
                    fitnessEvents.forEach(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      plan.forEach(week => {
                        week.runs?.forEach(activity => {
                          const label = activity.label || '';
                          const distanceStr = activity.distance || '';
                          const distanceNum = parseFloat(distanceStr) || 0;

                          if (isSwim(label)) {
                            totalSwims++;
                            if (activity.mike) {
                              mikeSwims++;
                              mikeSwimYards += distanceNum;
                            }
                            if (activity.adam) {
                              adamSwims++;
                              adamSwimYards += distanceNum;
                            }
                          } else if (isBike(label)) {
                            totalBikes++;
                            if (activity.mike) {
                              mikeBikes++;
                              mikeBikeMiles += distanceNum;
                            }
                            if (activity.adam) {
                              adamBikes++;
                              adamBikeMiles += distanceNum;
                            }
                          } else {
                            // Treat as run
                            totalRuns++;
                            if (activity.mike) {
                              mikeRuns++;
                              mikeRunMiles += distanceNum;
                            }
                            if (activity.adam) {
                              adamRuns++;
                              adamRunMiles += distanceNum;
                            }
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
                        {/* Runs */}
                        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
                          <div className="text-4xl mb-2">🏃</div>
                          <div className="text-xl font-bold text-white mb-2">Runs Completed</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeRuns}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeRunMiles.toFixed(1)} mi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamRuns}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamRunMiles.toFixed(1)} mi</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-orange-300 text-center">{totalRuns} total in plan</div>
                        </div>

                        {/* Swims */}
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-500/30">
                          <div className="text-4xl mb-2">🏊</div>
                          <div className="text-xl font-bold text-white mb-2">Swims Completed</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeSwims}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeSwimYards.toFixed(0)} yds</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamSwims}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamSwimYards.toFixed(0)} yds</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-cyan-300 text-center">{totalSwims} total in plan</div>
                        </div>

                        {/* Bikes */}
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                          <div className="text-4xl mb-2">🚴</div>
                          <div className="text-xl font-bold text-white mb-2">Bike Rides</div>
                          <div className="flex justify-around">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{mikeBikes}</div>
                              <div className="text-xs text-white/60">Mike</div>
                              <div className="text-xs text-blue-300">{mikeBikeMiles.toFixed(1)} mi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{adamBikes}</div>
                              <div className="text-xs text-white/60">Adam</div>
                              <div className="text-xs text-purple-300">{adamBikeMiles.toFixed(1)} mi</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-green-300 text-center">{totalBikes} total in plan</div>
                        </div>

                        {/* Cross Training */}
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
                          <div className="mt-2 text-sm text-red-300 text-center">{totalCross} total in plan</div>
                        </div>

                        {/* Total Distance Summary */}
                        <div className="md:col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                          <div className="text-4xl mb-2">📏</div>
                          <div className="text-xl font-bold text-white mb-4">Total Distance Logged</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-400 mb-1">Mike</div>
                              <div className="space-y-1 text-sm">
                                <div className="text-white/80">🏃 {mikeRunMiles.toFixed(1)} miles running</div>
                                <div className="text-white/80">🏊 {mikeSwimYards.toFixed(0)} yards swimming</div>
                                <div className="text-white/80">🚴 {mikeBikeMiles.toFixed(1)} miles biking</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-400 mb-1">Adam</div>
                              <div className="space-y-1 text-sm">
                                <div className="text-white/80">🏃 {adamRunMiles.toFixed(1)} miles running</div>
                                <div className="text-white/80">🏊 {adamSwimYards.toFixed(0)} yards swimming</div>
                                <div className="text-white/80">🚴 {adamBikeMiles.toFixed(1)} miles biking</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-yellow-300 text-center">Keep pushing! 🔥</div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Weekly Streak - Mike */}
                  <div className="md:col-span-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Mike's Training Consistency
                    </h3>
                    {fitnessEvents.map(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      return (
                        <div key={event.id} className="mb-4">
                          <div className="text-sm text-blue-300 mb-2">{event.emoji} {event.name}</div>
                          <div className="flex gap-2 flex-wrap">
                            {plan.map((week, i) => {
                              const completed = (week.runs?.filter(r => r.mike).length || 0) + (week.crossTraining?.filter(c => c.mike).length || 0);
                              const total = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                              const percentage = total > 0 ? (completed / total) * 100 : 0;

                              return (
                                <div
                                  key={week.id || i}
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
                            })}
                          </div>
                        </div>
                      );
                    })}
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

                  {/* Weekly Streak - Adam */}
                  <div className="md:col-span-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Adam's Training Consistency
                    </h3>
                    {fitnessEvents.filter(e => e.id !== 'triathlon-2026').map(event => {
                      const plan = getActiveTrainingPlan(event.id);
                      return (
                        <div key={event.id} className="mb-4">
                          <div className="text-sm text-purple-300 mb-2">{event.emoji} {event.name}</div>
                          <div className="flex gap-2 flex-wrap">
                            {plan.map((week, i) => {
                              const completed = (week.runs?.filter(r => r.adam).length || 0) + (week.crossTraining?.filter(c => c.adam).length || 0);
                              const total = (week.runs?.length || 0) + (week.crossTraining?.length || 0);
                              const percentage = total > 0 ? (completed / total) * 100 : 0;

                              return (
                                <div
                                  key={week.id || i}
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
                            })}
                          </div>
                        </div>
                      );
                    })}
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

          {/* ========== CALENDAR SECTION ========== */}
          {activeSection === 'calendar' && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <p className="text-slate-400">All our adventures, events, and memories in one place</p>
              </div>

              {/* Google Calendar Connection */}
              <div className="flex flex-col items-center gap-4 mb-8">
                {calendarConnected ? (
                  <>
                    {/* Connected State */}
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Google Calendar Connected</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setCalendarConnected(false);
                          setGoogleCalendarEvents([]);
                          setSelectedCalendarId('primary');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm"
                      >
                        <X className="w-4 h-4" />
                        Disconnect
                      </button>
                      <button
                        onClick={connectGoogleCalendar}
                        disabled={calendarLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm disabled:opacity-50"
                      >
                        {calendarLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                      </button>
                      <button
                        onClick={() => window.open('https://calendar.google.com', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Google
                      </button>
                    </div>

                    {/* Event Count */}
                    {googleCalendarEvents.length > 0 && (
                      <p className="text-slate-400 text-sm">
                        {googleCalendarEvents.length} event{googleCalendarEvents.length !== 1 ? 's' : ''} from Google Calendar
                      </p>
                    )}
                  </>
                ) : (
                  /* Not Connected State */
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={calendarLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg disabled:opacity-50"
                  >
                    {calendarLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        Connect Google Calendar
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Calendar Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-bold">
                      {months[calendarViewMonth.getMonth()]} {calendarViewMonth.getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() - 1, 1))}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCalendarViewMonth(new Date())}
                      className="px-3 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCalendarViewMonth(new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + 1, 1))}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Upcoming Events Cards - Only show app events (trips, party events), not raw Google Calendar events */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const allEvents = getAllCalendarEvents();
                  // Filter out Google Calendar events from banner - only show app-native events
                  const monthEvents = allEvents.filter(event => {
                    if (event.type === 'google') return false; // Don't show Google events in banner
                    const start = parseLocalDate(event.start);
                    const end = parseLocalDate(event.end);
                    return (start.getMonth() === calendarViewMonth.getMonth() && start.getFullYear() === calendarViewMonth.getFullYear()) ||
                           (end.getMonth() === calendarViewMonth.getMonth() && end.getFullYear() === calendarViewMonth.getFullYear());
                  });

                  if (monthEvents.length === 0) return null;

                  return (
                    <div className="mb-6 space-y-3">
                      {monthEvents.slice(0, 5).map(event => {
                        const startDate = parseLocalDate(event.start);
                        const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                        const isMultiDay = event.start !== event.end;
                        const endDate = parseLocalDate(event.end);

                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (event.type === 'google') {
                                setImportSettings(prev => ({ ...prev, customName: '' }));
                                setShowImportModal(event.data);
                              } else if (event.type === 'travel') {
                                setActiveSection('travel');
                                setSelectedTrip(event.data);
                              } else if (event.type === 'event') {
                                setActiveSection('events');
                                setSelectedPartyEvent(event.data);
                              }
                            }}
                            className={`bg-gradient-to-r ${event.color} rounded-xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-lg`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{event.type === 'google' ? '📅' : (event.data?.emoji || (event.type === 'travel' ? '✈️' : '🎉'))}</span>
                              <div className="text-white">
                                <div className="font-bold text-lg flex items-center gap-2">
                                  {event.data?.name || event.data?.destination || event.title?.replace(/^[^\s]+ /, '') || 'Event'}
                                  {event.data?.special && <span className="text-lg">💕🌈</span>}
                                </div>
                                <div className="text-sm opacity-90">
                                  {isMultiDay ? (
                                    `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                  ) : (
                                    `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${event.data?.time ? ` at ${event.data.time}` : ''}`
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-white text-right">
                              {daysUntil > 0 ? (
                                <span className="opacity-90">{daysUntil} days away</span>
                              ) : daysUntil === 0 ? (
                                <span className="font-bold">Today! 🎉</span>
                              ) : (
                                <span className="opacity-70">Past</span>
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
                  {(() => {
                    const { firstDay, daysInMonth } = getDaysInMonth(calendarViewMonth);
                    const allEvents = getAllCalendarEvents();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Helper to get events on a specific day
                    const getEventsOnDay = (day) => {
                      const checkDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), day);
                      checkDate.setHours(0, 0, 0, 0);
                      return allEvents.filter(event => {
                        const start = parseLocalDate(event.start);
                        const end = parseLocalDate(event.end);
                        return checkDate >= start && checkDate <= end;
                      });
                    };

                    return (
                      <>
                        {[...Array(firstDay)].map((_, i) => (
                          <div key={`empty-${i}`} className="h-16 md:h-20 bg-white/5 border-r border-b border-white/5" />
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const checkDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), day);
                          const isToday = checkDate.toDateString() === today.toDateString();
                          const eventsOnDay = getEventsOnDay(day);
                          const hasEvents = eventsOnDay.length > 0;

                          return (
                            <div
                              key={day}
                              onClick={() => {
                                if (eventsOnDay.length === 1) {
                                  const event = eventsOnDay[0];
                                  if (event.type === 'google') {
                                    setImportSettings(prev => ({ ...prev, customName: '' }));
                                    setShowImportModal(event.data);
                                  } else if (event.type === 'travel') {
                                    setActiveSection('travel');
                                    setSelectedTrip(event.data);
                                  } else if (event.type === 'event') {
                                    setActiveSection('events');
                                    setSelectedPartyEvent(event.data);
                                  }
                                }
                              }}
                              className={`h-16 md:h-20 p-1 relative border-r border-b border-white/5 transition-all ${
                                hasEvents ? 'cursor-pointer hover:bg-white/10' : ''
                              } ${isToday ? 'bg-blue-500/20' : 'bg-white/5'}`}
                            >
                              {/* Date number */}
                              <div className={`text-xs font-medium ${
                                isToday ? 'text-blue-400 font-bold' : hasEvents ? 'text-white' : 'text-slate-500'
                              }`}>
                                {day}
                              </div>

                              {/* Event indicators */}
                              {hasEvents && (
                                <div className="absolute inset-1 top-5 flex flex-col items-center justify-center gap-0.5">
                                  {eventsOnDay.slice(0, 2).map((event, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-full h-5 md:h-6 rounded bg-gradient-to-r ${event.color} flex items-center justify-center`}
                                    >
                                      <span className="text-xs md:text-sm">
                                        {event.type === 'google' ? '📅' : (event.data?.emoji || (event.type === 'travel' ? '✈️' : '🎉'))}
                                      </span>
                                    </div>
                                  ))}
                                  {eventsOnDay.length > 2 && (
                                    <div className="text-xs text-slate-400">+{eventsOnDay.length - 2}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Google Calendar status */}
              {calendarConnected && googleCalendarEvents.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">
                    🔗 {googleCalendarEvents.length} events synced from Google Calendar
                  </p>
                </div>
              )}
            </div>
          )}
          {/* ========== END CALENDAR SECTION ========== */}

          {/* ========== APPS SECTION ========== */}
          {activeSection === 'apps' && (
            <div className="mt-8">
              <div className="max-w-2xl mx-auto">
                {/* Instructions */}
                <div className="text-center mb-8">
                  <p className="text-slate-300 mb-2">Add any of these mini apps to your iPhone home screen for quick access!</p>
                  <p className="text-slate-400 text-sm">Tap an app, then use the share button and "Add to Home Screen"</p>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'home', name: 'Hub', emoji: '⚛️', color: 'from-pink-500 to-purple-500', desc: 'Tasks, lists, habits & more' },
                    { id: 'fitness', name: 'Fitness', emoji: '🏃', color: 'from-orange-400 to-red-500', desc: 'Track workouts & training' },
                    { id: 'travel', name: 'Travel', emoji: '✈️', color: 'from-teal-400 to-cyan-500', desc: 'Plan your adventures' },
                    { id: 'events', name: 'Events', emoji: '🎉', color: 'from-amber-400 to-orange-500', desc: 'Manage parties & gatherings' },
                    { id: 'memories', name: 'Memories', emoji: '💝', color: 'from-rose-400 to-pink-500', desc: 'Cherish special moments' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        const appUrl = `${window.location.origin}/?app=${app.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: `Mike & Adam's ${app.name}`,
                            text: `Open ${app.name} app`,
                            url: appUrl
                          });
                        } else {
                          navigator.clipboard.writeText(appUrl);
                          showToast(`${app.name} app link copied! Open in Safari and add to home screen.`, 'success');
                        }
                      }}
                      className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition active:scale-95"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-3xl shadow-lg`}>
                        {app.emoji}
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-lg">{app.name}</h3>
                        <p className="text-slate-400 text-xs mt-1">{app.desc}</p>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        <span>Share / Add to Home</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* How To Instructions */}
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span className="text-lg">📲</span> How to Add to Home Screen
                  </h3>
                  <ol className="space-y-3 text-slate-300 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Tap one of the apps above to open the share menu</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>On iPhone: Tap "Add to Home Screen" in the share sheet</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Give it a name and tap "Add" - you'll have a dedicated app icon!</span>
                    </li>
                  </ol>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setActiveSection('home')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ========== END APPS SECTION ========== */}

          {/* ========== NUTRITION SECTION ========== */}
          {activeSection === 'nutrition' && (
            <div className="mt-8">
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
            <div>
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

                  {/* Cover Image */}
                  {selectedPartyEvent.coverImage && (
                    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
                      <img
                        src={selectedPartyEvent.coverImage}
                        alt={selectedPartyEvent.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

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

                  {/* Linked Tasks Section */}
                  {sharedTasks && Array.isArray(sharedTasks) && sharedTasks.filter(t => t && t.linkedTo && t.linkedTo.section === 'partyEvents' && t.linkedTo.itemId === selectedPartyEvent?.id).length > 0 && (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
                      <div className="flex items-center gap-2 text-teal-400 mb-4">
                        <CheckSquare className="w-5 h-5" />
                        <h3 className="font-semibold">Linked Tasks</h3>
                      </div>
                      <div className="space-y-3">
                        {sharedTasks
                          .filter(t => t && t.linkedTo && t.linkedTo.section === 'partyEvents' && t.linkedTo.itemId === selectedPartyEvent?.id)
                          .map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onNavigateToLinked={() => {}}
                              getLinkedLabel={() => null}
                            />
                          ))}
                      </div>
                    </div>
                  )}

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
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 px-3 py-2 rounded-full border border-amber-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="text-white text-sm">Mike</span>
                        <span className="text-xs bg-amber-500/50 text-amber-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 px-3 py-2 rounded-full border border-amber-500/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                        <span className="text-white text-sm">Adam</span>
                        <span className="text-xs bg-amber-500/50 text-amber-100 px-2 py-0.5 rounded-full">Host</span>
                      </div>
                    </div>

                    {/* Invited Guests - With Swipe to Delete */}
                    {(selectedPartyEvent.guests || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {(selectedPartyEvent.guests || []).map(guest => {
                          const isSwipingThis = swipeState.id === `guest-${guest.id}` && swipeState.swiping;
                          const swipeOffset = isSwipingThis ? Math.min(0, swipeState.currentX - swipeState.startX) : 0;
                          const deleteGuest = () => {
                            const newEvents = partyEvents.map(ev =>
                              ev.id === selectedPartyEvent.id
                                ? { ...ev, guests: ev.guests.filter(g => g.id !== guest.id) }
                                : ev
                            );
                            setPartyEvents(newEvents);
                            setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                            savePartyEventsToFirestore(newEvents);
                          };

                          return (
                            <div key={guest.id} className="relative overflow-hidden rounded-xl">
                              {/* Delete action background */}
                              <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-white" />
                              </div>

                              <div
                                className="relative flex items-center justify-between bg-slate-800 px-3 py-2 rounded-xl"
                                style={{
                                  transform: `translateX(${swipeOffset}px)`,
                                  transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                                }}
                                onTouchStart={(e) => {
                                  if (!isOwner) return;
                                  setSwipeState({
                                    id: `guest-${guest.id}`,
                                    startX: e.touches[0].clientX,
                                    currentX: e.touches[0].clientX,
                                    swiping: true
                                  });
                                }}
                                onTouchMove={(e) => {
                                  if (!isOwner || swipeState.id !== `guest-${guest.id}`) return;
                                  setSwipeState(s => ({ ...s, currentX: e.touches[0].clientX }));
                                }}
                                onTouchEnd={() => {
                                  if (!isOwner || swipeState.id !== `guest-${guest.id}`) return;
                                  if (swipeState.startX - swipeState.currentX > 80) {
                                    deleteGuest();
                                  }
                                  setSwipeState({ id: null, startX: 0, currentX: 0, swiping: false });
                                }}
                              >
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
                                  {/* Desktop delete button */}
                                  {isOwner && (
                                    <button
                                      onClick={deleteGuest}
                                      className="hidden md:block p-1 text-slate-400 hover:text-red-400 transition"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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

                    {/* Task Items - With Swipe to Delete */}
                    <div className="space-y-2 mb-4">
                      {(selectedPartyEvent.tasks || []).map(task => {
                        const isSwipingThis = swipeState.id === `task-${task.id}` && swipeState.swiping;
                        const swipeOffset = isSwipingThis ? Math.min(0, swipeState.currentX - swipeState.startX) : 0;
                        const deleteTask = () => {
                          const newEvents = partyEvents.map(ev =>
                            ev.id === selectedPartyEvent.id
                              ? { ...ev, tasks: ev.tasks.filter(t => t.id !== task.id) }
                              : ev
                          );
                          setPartyEvents(newEvents);
                          setSelectedPartyEvent(newEvents.find(e => e.id === selectedPartyEvent.id));
                          savePartyEventsToFirestore(newEvents);
                        };

                        return (
                          <div key={task.id} className="relative overflow-hidden rounded-xl">
                            {/* Delete action background */}
                            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                              <Trash2 className="w-5 h-5 text-white" />
                            </div>

                            {/* Swipeable content */}
                            <div
                              className={`relative flex items-center gap-3 p-3 rounded-xl transition-colors ${task.completed ? 'bg-green-500/10' : 'bg-slate-800'}`}
                              style={{
                                transform: `translateX(${swipeOffset}px)`,
                                transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                              }}
                              onTouchStart={(e) => {
                                if (!isOwner) return;
                                setSwipeState({
                                  id: `task-${task.id}`,
                                  startX: e.touches[0].clientX,
                                  currentX: e.touches[0].clientX,
                                  swiping: true
                                });
                              }}
                              onTouchMove={(e) => {
                                if (!isOwner || swipeState.id !== `task-${task.id}`) return;
                                setSwipeState(s => ({ ...s, currentX: e.touches[0].clientX }));
                              }}
                              onTouchEnd={() => {
                                if (!isOwner || swipeState.id !== `task-${task.id}`) return;
                                // If swiped more than 80px, delete
                                if (swipeState.startX - swipeState.currentX > 80) {
                                  deleteTask();
                                }
                                setSwipeState({ id: null, startX: 0, currentX: 0, swiping: false });
                              }}
                            >
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
                              <div className="flex-1 min-w-0">
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
                              {/* Desktop delete button (hidden on mobile to favor swipe) */}
                              {isOwner && (
                                <button
                                  onClick={deleteTask}
                                  className="hidden md:block p-1 text-slate-400 hover:text-red-400 transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {/* Mobile swipe hint */}
                              <span className="md:hidden text-slate-600 text-xs">←</span>
                            </div>
                          </div>
                        );
                      })}
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
                  {/* View Mode Toggle (left padding for FAB on mobile) */}
                  <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                    {[
                      { id: 'upcoming', emoji: '📅' },
                      { id: 'past', emoji: '📜' },
                      { id: 'all', emoji: '📋' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setEventViewMode(mode.id)}
                        className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                          eventViewMode === mode.id
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {mode.emoji}
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
                            data-search-id={`events-${event.id}`}
                            onClick={() => setEditingPartyEvent(event)}
                            onDragOver={(e) => { e.preventDefault(); setDragOverEventId(event.id); }}
                            onDragLeave={() => setDragOverEventId(null)}
                            onDrop={(e) => { e.stopPropagation(); handleEventCardDrop(e, event.id); }}
                            className={`relative rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all overflow-hidden ${isPast ? 'opacity-60' : ''} ${
                              dragOverEventId === event.id ? 'border-purple-500 scale-105' : 'border-white/20'
                            }`}
                          >
                            {/* Cover Image or Gradient Background */}
                            {event.coverImage ? (
                              <div className="relative h-40">
                                <img
                                  src={event.coverImage}
                                  alt={event.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                {/* Content overlay on image */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="text-3xl drop-shadow-lg">{event.emoji}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      isPast ? 'bg-slate-500/80 text-slate-200' :
                                      isToday ? 'bg-green-500 text-white' :
                                      daysUntil <= 7 ? 'bg-amber-500 text-white' :
                                      'bg-white/30 text-white backdrop-blur-sm'
                                    }`}>
                                      {isPast ? 'Past' : isToday ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{event.name}</h3>
                                  <p className="text-white/90 text-sm">
                                    {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    {event.time && ` • ${event.time}`}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className={`bg-gradient-to-br ${event.color || 'from-amber-500/30 to-orange-500/30'} p-5`}>
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
                                {/* Linked Hub Items */}
                                {(() => {
                                  const { linkedTasks, linkedLists } = getLinkedHubItems('events', event.id);
                                  if (linkedTasks.length === 0 && linkedLists.length === 0) return null;
                                  return (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                      {linkedTasks.map(task => (
                                        <span
                                          key={task.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSection('home');
                                            setHubSubView('home');
                                          }}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition ${
                                            task.status === 'done'
                                              ? 'bg-green-500/30 text-green-200'
                                              : 'bg-white/20 text-white'
                                          }`}
                                          title={task.title}
                                        >
                                          <span>{task.status === 'done' ? '✅' : '☑️'}</span>
                                          <span className="max-w-[80px] truncate">{task.title}</span>
                                        </span>
                                      ))}
                                      {linkedLists.map(list => (
                                        <span
                                          key={list.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSection('home');
                                            setHubSubView('home');
                                          }}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white cursor-pointer hover:scale-105 transition"
                                          title={list.name}
                                        >
                                          <span>{list.emoji || '📝'}</span>
                                          <span className="max-w-[80px] truncate">{list.name}</span>
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
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
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                          >
                            Create Event
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {/* ========== END EVENTS SECTION ========== */}

          {/* ========== LIFE PLANNING SECTION ========== */}
          {activeSection === 'lifePlanning' && (
            <div className="mt-8">
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
            <div>
              {/* Controls Row - Responsive mobile buttons (left padding for FAB on mobile) */}
              <div className="flex gap-1.5 md:gap-2 mb-4 items-center justify-start sticky top-0 z-20 bg-slate-800/95 backdrop-blur-md py-3 -mx-6 px-6">
                {/* View Switcher */}
                {[
                  { id: 'timeline', emoji: '📅' },
                  { id: 'events', emoji: '🎭' },
                  { id: 'media', emoji: '📸' },
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setMemoriesView(view.id)}
                    className={`px-3 md:px-4 py-2 rounded-xl font-medium transition text-base md:text-lg text-center ${
                      memoriesView === view.id
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {view.emoji}
                  </button>
                ))}

                {/* Spacer to push controls right */}
                <div className="flex-1" />

                {/* Timeline Controls - Right justified (only show for timeline view) */}
                {memoriesView === 'timeline' && (
                  <>
                    {/* Sort Order Toggle - Just arrow icon */}
                    <button
                      onClick={() => setTimelineSortOrder(timelineSortOrder === 'newest' ? 'oldest' : 'newest')}
                      className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 transition"
                      title={timelineSortOrder === 'newest' ? 'Newest first - click for oldest' : 'Oldest first - click for newest'}
                    >
                      {timelineSortOrder === 'newest' ? (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>

                    {/* Year Filter Dropdown */}
                    <div className="relative group">
                      <button
                        className={`px-3 md:px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 text-sm md:text-base ${
                          timelineYearFilter === 'all'
                            ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {timelineYearFilter === 'all' ? 'All' : timelineYearFilter}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-xl shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[100px]">
                        <button
                          onClick={() => setTimelineYearFilter('all')}
                          className={`w-full px-4 py-2 text-left rounded-t-xl transition ${
                            timelineYearFilter === 'all' ? 'bg-rose-500/20 text-rose-300' : 'text-white/70 hover:bg-white/10'
                          }`}
                        >
                          All
                        </button>
                        {(() => {
                          const years = new Set();
                          memories.forEach(m => years.add(new Date(m.date).getFullYear()));
                          trips.forEach(t => t.dates?.start && years.add(new Date(t.dates.start).getFullYear()));
                          const yearArray = Array.from(years).sort((a, b) => b - a);
                          return yearArray.map((year, idx) => (
                            <button
                              key={year}
                              onClick={() => setTimelineYearFilter(year.toString())}
                              className={`w-full px-4 py-2 text-left transition ${
                                idx === yearArray.length - 1 ? 'rounded-b-xl' : ''
                              } ${
                                timelineYearFilter === year.toString() ? 'bg-rose-500/20 text-rose-300' : 'text-white/70 hover:bg-white/10'
                              }`}
                            >
                              {year}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Timeline View */}
              {memoriesView === 'timeline' && (
                <div className="relative">
                  {/* Top Banner Card */}
                  <div className="mb-8 relative z-10">
                    <div className="w-full bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 flex items-center justify-between">
                      <span className="text-5xl">🌈</span>
                      <div className="text-center flex-1 px-4">
                        <h3 className="text-xl font-bold text-white">Building Our Story</h3>
                        <p className="text-white/60 text-sm">And the adventure continues...</p>
                      </div>
                      <div className="flex gap-1">
                        {['💕', '✨', '🦄', '🏳️‍🌈', '💜'].map((emoji, i) => (
                          <span key={i} className="text-base">{emoji}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-rose-500 via-pink-500 to-purple-500 h-full rounded-full" style={{ top: '80px' }} />

                  {/* Timeline events - dynamically built - overlapping cards */}
                  <div className="flex flex-col">
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

                      // Filter by year if selected
                      let filteredEvents = timelineEvents;
                      if (timelineYearFilter !== 'all') {
                        const filterYear = parseInt(timelineYearFilter);
                        filteredEvents = timelineEvents.filter(e =>
                          e.date.getFullYear() === filterYear
                        );
                      }

                      // Sort by date based on sort order and alternate sides
                      return filteredEvents
                        .sort((a, b) => {
                          return timelineSortOrder === 'newest'
                            ? b.date - a.date
                            : a.date - b.date;
                        })
                        .map((event, idx) => ({ ...event, side: idx % 2 === 0 ? 'left' : 'right' }));
                    })().map((event, idx) => (
                      <div key={event.id} className={`flex items-center gap-8 ${event.side === 'right' ? 'flex-row-reverse' : ''} ${idx > 0 ? '-mt-24' : ''}`}>
                        <div className={`w-5/12 ${event.side === 'right' ? 'text-left' : 'text-right'}`}>
                          <div
                            data-search-id={event.isMemory ? `memories-${event.memory?.id}` : undefined}
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
                            {/* Video or Image if exists */}
                            {(() => {
                              const videos = event.memory?.videos || [];
                              const isLinkImage = event.link && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(event.link);
                              const imageUrl = (event.memory ? getRandomMemoryImage(event.memory) : event.image) || (isLinkImage ? event.link : null);
                              const imgSettings = event.memory?.imageSettings?.[0] || { x: 50, y: 50, zoom: 100 };

                              // Show video if exists
                              if (videos.length > 0) {
                                return (
                                  <div className="mb-3 -mx-2 -mt-2 overflow-hidden rounded-lg relative group">
                                    <video
                                      src={videos[0]}
                                      className="w-full h-32 object-cover"
                                      muted
                                      playsInline
                                      loop
                                      onMouseEnter={(e) => e.target.play()}
                                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:opacity-0 transition">
                                        <span className="text-white text-lg ml-1">▶</span>
                                      </div>
                                    </div>
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                                      🎬 Video
                                    </div>
                                  </div>
                                );
                              }

                              // Fallback to image
                              return imageUrl ? (
                                <div className="mb-3 -mx-2 -mt-2 overflow-hidden rounded-lg">
                                  <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-full h-32 object-cover"
                                    style={{
                                      objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                      transform: `scale(${imgSettings.zoom / 100})`,
                                      transformOrigin: `${imgSettings.x}% ${imgSettings.y}%`
                                    }}
                                  />
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

                    // Gather training week photos into Fitness Achievements
                    Object.entries(fitnessTrainingPlans).forEach(([eventId, weeks]) => {
                      const eventInfo = fitnessEvents.find(e => e.id === eventId);
                      (weeks || []).forEach((week, idx) => {
                        if (week.photos && week.photos.length > 0) {
                          completedFitnessEvents.push({
                            id: `fitness-week-${eventId}-${week.id || idx}`,
                            title: `📸 ${eventInfo?.name || 'Training'} - Week ${week.weekNumber || idx + 1}`,
                            date: week.startDate ? formatDate(week.startDate) : '',
                            image: week.photos[0]?.url,
                            images: week.photos.map(p => p.url),
                            isFitness: true,
                            isFitnessWeekPhoto: true,
                          });
                        }
                      });
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
                        {/* Spacer */}
                        <div className="flex-1" />
                        {/* Collapse/Expand Button */}
                        <button
                          onClick={() => setCollapsedMemorySections(prev => ({
                            ...prev,
                            [cat.id]: !prev[cat.id]
                          }))}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/70 hover:text-white"
                          title={collapsedMemorySections[cat.id] ? 'Expand section' : 'Collapse section'}
                        >
                          {collapsedMemorySections[cat.id] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronUp className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {!collapsedMemorySections[cat.id] && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cat.events.map((event) => (
                          <div
                            key={event.id}
                            data-search-id={event.isMemory ? `memories-${event.id}` : undefined}
                            onClick={() => {
                              if (event.isMemory) setEditingMemory(event);
                              else if (event.isPartyEvent) {
                                setActiveSection('events');
                                setSelectedPartyEvent(event.partyEvent);
                              } else if (event.isFitnessWeekPhoto) {
                                // Navigate to fitness and open the training week edit modal
                                const parts = event.id.replace('fitness-week-', '').split('-');
                                // eventId could contain hyphens, weekId starts with "week-"
                                const weekIdMatch = event.id.match(/week-(\d+)/);
                                if (weekIdMatch) {
                                  const weekId = `week-${weekIdMatch[1]}`;
                                  const eventId = event.id.replace('fitness-week-', '').replace(/-week-\d+$/, '');
                                  const plan = fitnessTrainingPlans[eventId];
                                  const week = plan?.find(w => w.id === weekId);
                                  if (week) {
                                    setActiveSection('fitness');
                                    setFitnessViewMode('training');
                                    const fitEvent = fitnessEvents.find(e => e.id === eventId);
                                    if (fitEvent) setSelectedFitnessEvent(fitEvent);
                                    setEditingTrainingWeek({ eventId, week: { ...week } });
                                  }
                                }
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
                            className={`rounded-xl p-4 hover:bg-white/20 transition ${(event.isMemory || event.isPartyEvent || event.isFitnessWeekPhoto) ? 'cursor-pointer' : ''} relative group ${
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
                              const imgSettings = event.isMemory && event.imageSettings?.[0] || { x: 50, y: 50, zoom: 100 };
                              return (
                                <div className="mb-2 -mx-2 -mt-2 overflow-hidden rounded-t-lg h-20">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      style={{
                                        objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                        transform: `scale(${imgSettings.zoom / 100})`,
                                        transformOrigin: `${imgSettings.x}% ${imgSettings.y}%`
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                      <span className="text-2xl opacity-30">📷</span>
                                    </div>
                                  )}
                                </div>
                              );
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
                      )}
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
            setTrips={setTrips}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            guestPermission={guestPermission}
            setGuestPermission={setGuestPermission}
            currentUser={currentUser}
          />
        ) : null;
      })()}

      {/* Open Date Modal */}
      {showOpenDateModal && (
        <OpenDateModal
          onClose={() => setShowOpenDateModal(false)}
          openDates={openDates}
          setOpenDates={setOpenDates}
          companions={companions}
        />
      )}

      {/* Companions Modal */}
      {showCompanionsModal && (
        <CompanionsModal
          onClose={() => setShowCompanionsModal(false)}
          companions={companions}
          setCompanions={setCompanions}
          setOpenDates={setOpenDates}
        />
      )}

      {/* My Profile Modal - For companions */}
      {showMyProfileModal && currentCompanion && (
        <MyProfileModal
          onClose={() => setShowMyProfileModal(false)}
          currentCompanion={currentCompanion}
          setCompanions={setCompanions}
          setCurrentCompanion={setCurrentCompanion}
        />
      )}

      {/* ========== SHARED HUB MODALS ========== */}
      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(null)}
          onSave={(task) => {
            if (showAddTaskModal && showAddTaskModal.id) {
              updateTask(showAddTaskModal.id, task);
            } else {
              addTask(task);
            }
            setShowAddTaskModal(null);
          }}
          editTask={typeof showAddTaskModal === 'object' && showAddTaskModal?.id ? showAddTaskModal : (typeof showAddTaskModal === 'object' && showAddTaskModal?._prefill ? showAddTaskModal : null)}
          currentUser={currentUser}
          trips={trips}
          fitnessEvents={fitnessEvents}
          partyEvents={partyEvents}
        />
      )}

      {showSharedListModal && (
        <SharedListModal
          onClose={() => setShowSharedListModal(null)}
          onSave={(list) => {
            if (typeof showSharedListModal === 'object' && showSharedListModal?.id) {
              updateList(showSharedListModal.id, list);
            } else {
              addList(list);
            }
            setShowSharedListModal(null);
          }}
          editList={typeof showSharedListModal === 'object' && showSharedListModal?.id ? showSharedListModal : null}
          currentUser={currentUser}
          trips={trips}
          fitnessEvents={fitnessEvents}
          partyEvents={partyEvents}
          onUpdateItems={(listId, items) => {
            const newLists = sharedLists.map(l => l.id === listId ? { ...l, items } : l);
            setSharedLists(newLists);
            saveSharedHub(newLists, null, null);
          }}
        />
      )}

      {showAddIdeaModal && (
        <AddIdeaModal
          onClose={() => setShowAddIdeaModal(null)}
          onSave={(idea) => {
            if (typeof showAddIdeaModal === 'object' && showAddIdeaModal?.id) {
              updateIdea(showAddIdeaModal.id, idea);
            } else {
              addIdea(idea);
            }
            setShowAddIdeaModal(null);
          }}
          editIdea={typeof showAddIdeaModal === 'object' && showAddIdeaModal?.id ? showAddIdeaModal : null}
          currentUser={currentUser}
          onPromoteToTask={promoteIdeaToTask}
        />
      )}

      {showAddSocialModal && (
        <AddSocialModal
          onClose={() => setShowAddSocialModal(null)}
          onSave={(social) => {
            if (typeof showAddSocialModal === 'object' && showAddSocialModal?.id) {
              updateSocial(showAddSocialModal.id, social);
            } else {
              addSocial(social);
            }
            setShowAddSocialModal(null);
          }}
          editSocial={typeof showAddSocialModal === 'object' && showAddSocialModal?.id ? showAddSocialModal : null}
          currentUser={currentUser}
          partyEvents={partyEvents}
          onLinkToEvent={navigateToEvent}
        />
      )}

      {showAddHabitModal && (
        <AddHabitModal
          onClose={() => setShowAddHabitModal(null)}
          onSave={(habit) => {
            if (typeof showAddHabitModal === 'object' && showAddHabitModal?.id) {
              updateHabit(showAddHabitModal.id, habit);
            } else {
              addHabit(habit);
            }
            setShowAddHabitModal(null);
          }}
          editHabit={typeof showAddHabitModal === 'object' && showAddHabitModal?.id ? showAddHabitModal : null}
          currentUser={currentUser}
        />
      )}

      {/* Add/Edit Fitness Event Modal */}
      {(showAddFitnessEventModal || editingFitnessEvent) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingFitnessEvent ? 'Edit Training Event' : 'New Training Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Name & Emoji */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/70 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={editingFitnessEvent?.name || newFitnessEventData.name}
                    onChange={(e) => editingFitnessEvent
                      ? setEditingFitnessEvent({ ...editingFitnessEvent, name: e.target.value })
                      : setNewFitnessEventData({ ...newFitnessEventData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="e.g., Chicago Marathon 2027"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Emoji</label>
                  <select
                    value={editingFitnessEvent?.emoji || newFitnessEventData.emoji}
                    onChange={(e) => editingFitnessEvent
                      ? setEditingFitnessEvent({ ...editingFitnessEvent, emoji: e.target.value })
                      : setNewFitnessEventData({ ...newFitnessEventData, emoji: e.target.value })
                    }
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-xl"
                  >
                    <option value="🏃">🏃 Running</option>
                    <option value="🏊">🏊 Swimming</option>
                    <option value="🚴">🚴 Cycling</option>
                    <option value="🏋️">🏋️ Strength</option>
                    <option value="🎯">🎯 Goal</option>
                    <option value="🏆">🏆 Race</option>
                    <option value="⛰️">⛰️ Trail</option>
                    <option value="🧘">🧘 Yoga</option>
                  </select>
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Type *</label>
                <select
                  value={editingFitnessEvent?.type || newFitnessEventData.type}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, type: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="running">5K / 10K Run</option>
                  <option value="half-marathon">Half Marathon</option>
                  <option value="marathon">Marathon</option>
                  <option value="triathlon">Triathlon</option>
                  <option value="cycling">Cycling Event</option>
                  <option value="swimming">Swimming Event</option>
                  <option value="obstacle">Obstacle Course / Spartan</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={editingFitnessEvent?.date || newFitnessEventData.date}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, date: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Chicago, IL or Course Address"
                  value={editingFitnessEvent?.location || newFitnessEventData.location}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, location: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cover Photo (optional)</label>
                {(editingFitnessEvent?.coverImage || newFitnessEventData.coverImage || fitnessCoverImagePreview) ? (
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img
                      src={fitnessCoverImagePreview || (editingFitnessEvent ? editingFitnessEvent.coverImage : newFitnessEventData.coverImage)}
                      alt="Cover preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {uploadingFitnessCoverImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFitnessCoverImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 mb-3">
                    {/* Camera capture button */}
                    <button
                      type="button"
                      onClick={() => fitnessCoverCameraRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-orange-400 hover:bg-white/5 transition"
                    >
                      <Camera className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Take Photo</span>
                    </button>
                    <input
                      ref={fitnessCoverCameraRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFitnessCoverImageSelect}
                      className="hidden"
                    />

                    {/* Gallery upload button */}
                    <button
                      type="button"
                      onClick={() => fitnessCoverFileRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-orange-400 hover:bg-white/5 transition"
                    >
                      <Image className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Choose Photo</span>
                    </button>
                    <input
                      ref={fitnessCoverFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFitnessCoverImageSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Training Duration */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Training Duration (weeks)</label>
                <input
                  type="number"
                  min="4"
                  max="52"
                  value={editingFitnessEvent?.trainingWeeks || newFitnessEventData.trainingWeeks}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, trainingWeeks: parseInt(e.target.value) || 12 })
                    : setNewFitnessEventData({ ...newFitnessEventData, trainingWeeks: parseInt(e.target.value) || 12 })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-white/40 text-xs mt-1">Training will start this many weeks before the event</p>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Who's Training?</label>
                <div className="flex gap-2">
                  {[
                    { value: 'both', label: 'Both Mike & Adam' },
                    { value: 'mike', label: 'Mike Only' },
                    { value: 'adam', label: 'Adam Only' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => editingFitnessEvent
                        ? setEditingFitnessEvent({ ...editingFitnessEvent, participants: opt.value })
                        : setNewFitnessEventData({ ...newFitnessEventData, participants: opt.value })
                      }
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        (editingFitnessEvent?.participants || newFitnessEventData.participants) === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event URL */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event URL (optional)</label>
                <input
                  type="url"
                  value={editingFitnessEvent?.url || newFitnessEventData.url}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, url: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, url: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                  placeholder="https://race-registration.com/event"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Color Theme</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'from-orange-400 to-red-500', label: 'Orange/Red' },
                    { value: 'from-blue-400 to-cyan-500', label: 'Blue/Cyan' },
                    { value: 'from-green-400 to-emerald-500', label: 'Green' },
                    { value: 'from-purple-400 to-pink-500', label: 'Purple/Pink' },
                    { value: 'from-yellow-400 to-orange-500', label: 'Yellow/Orange' }
                  ].map(color => (
                    <button
                      key={color.value}
                      onClick={() => editingFitnessEvent
                        ? setEditingFitnessEvent({ ...editingFitnessEvent, color: color.value })
                        : setNewFitnessEventData({ ...newFitnessEventData, color: color.value })
                      }
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color.value} ${
                        (editingFitnessEvent?.color || newFitnessEventData.color) === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                          : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Notes (optional)</label>
                <textarea
                  value={editingFitnessEvent?.description || newFitnessEventData.description}
                  onChange={(e) => editingFitnessEvent
                    ? setEditingFitnessEvent({ ...editingFitnessEvent, description: e.target.value })
                    : setNewFitnessEventData({ ...newFitnessEventData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
                  rows={2}
                  placeholder="Any notes about this event..."
                />
              </div>

              {/* Invite Guests - Coming Soon */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Invite Guests</label>
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-center">
                  <UserPlus className="w-6 h-6 text-white/30 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Guest invitations coming soon!</p>
                  <p className="text-white/30 text-xs mt-1">You'll be able to invite friends to train together</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              {editingFitnessEvent && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      const updatedEvents = fitnessEvents.filter(e => e.id !== editingFitnessEvent.id);
                      setFitnessEvents(updatedEvents);
                      // Also remove the training plan
                      const updatedPlans = { ...fitnessTrainingPlans };
                      delete updatedPlans[editingFitnessEvent.id];
                      setFitnessTrainingPlans(updatedPlans);
                      await saveFitnessToFirestore(updatedEvents, updatedPlans);
                      setEditingFitnessEvent(null);
                      if (selectedFitnessEvent?.id === editingFitnessEvent.id) {
                        setSelectedFitnessEvent(fitnessEvents[0] || null);
                      }
                      showToast('Event deleted', 'success');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                >
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const data = editingFitnessEvent || newFitnessEventData;
                    if (!data.name || !data.date) {
                      showToast('Please fill in event name and date', 'error');
                      return;
                    }

                    if (editingFitnessEvent) {
                      // Update existing event
                      const updatedEvents = fitnessEvents.map(e =>
                        e.id === editingFitnessEvent.id ? editingFitnessEvent : e
                      );
                      setFitnessEvents(updatedEvents);
                      await saveFitnessToFirestore(updatedEvents, fitnessTrainingPlans);
                      showToast('Event updated!', 'success');
                    } else {
                      // Create new event
                      const eventId = `event-${Date.now()}`;
                      const newEvent = {
                        id: eventId,
                        name: data.name,
                        emoji: data.emoji,
                        date: data.date,
                        type: data.type,
                        url: data.url,
                        trainingWeeks: data.trainingWeeks,
                        color: data.color,
                        description: data.description,
                        participants: data.participants,
                        location: data.location || '',
                        coverImage: data.coverImage || null
                      };

                      // Generate training plan based on event date and duration
                      const eventDate = new Date(data.date);
                      const startDate = new Date(eventDate);
                      startDate.setDate(startDate.getDate() - (data.trainingWeeks * 7));
                      const trainingPlan = generateTrainingWeeks(
                        startDate.toISOString().split('T')[0],
                        data.date,
                        eventId
                      );

                      // Mark as Mike-only if applicable
                      if (data.participants === 'mike') {
                        trainingPlan.forEach(week => {
                          week.runs.forEach(run => delete run.adam);
                          week.crossTraining.forEach(ct => delete ct.adam);
                        });
                      } else if (data.participants === 'adam') {
                        trainingPlan.forEach(week => {
                          week.runs.forEach(run => delete run.mike);
                          week.crossTraining.forEach(ct => delete ct.mike);
                        });
                      }

                      const updatedEvents = [...fitnessEvents, newEvent];
                      const updatedPlans = { ...fitnessTrainingPlans, [eventId]: trainingPlan };

                      setFitnessEvents(updatedEvents);
                      setFitnessTrainingPlans(updatedPlans);
                      setSelectedFitnessEvent(newEvent);
                      await saveFitnessToFirestore(updatedEvents, updatedPlans);
                      showToast('Training event created!', 'success');
                    }

                    setShowAddFitnessEventModal(false);
                    setEditingFitnessEvent(null);
                    setNewFitnessEventData({
                      name: '', emoji: '🏃', date: '', type: 'running',
                      url: '', trainingWeeks: 12, color: 'from-orange-400 to-red-500',
                      description: '', participants: 'both', location: '', coverImage: null
                    });
                    setFitnessCoverImagePreview(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  {editingFitnessEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Training Week Modal */}
      {editingTrainingWeek && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[85dvh] overflow-y-auto">
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
              {/* Activities Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-orange-300">🏃 Activities</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const isMikeOnly = editingTrainingWeek.eventId === 'triathlon-2026';
                        const newRun = {
                          id: Date.now(),
                          label: 'Run',
                          distance: '0 mi',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
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
                      Run
                    </button>
                    <button
                      onClick={() => {
                        const isMikeOnly = editingTrainingWeek.eventId === 'triathlon-2026';
                        const newSwim = {
                          id: Date.now(),
                          label: '🏊 Swim',
                          distance: '0 yds',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
                          notes: ''
                        };
                        setEditingTrainingWeek(prev => ({
                          ...prev,
                          week: {
                            ...prev.week,
                            runs: [...(prev.week.runs || []), newSwim]
                          }
                        }));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Swim
                    </button>
                    <button
                      onClick={() => {
                        const isMikeOnly = editingTrainingWeek.eventId === 'triathlon-2026';
                        const newBike = {
                          id: Date.now(),
                          label: 'Bike',
                          distance: '0 mi',
                          mike: false,
                          ...(isMikeOnly ? {} : { adam: false }),
                          notes: ''
                        };
                        setEditingTrainingWeek(prev => ({
                          ...prev,
                          week: {
                            ...prev.week,
                            runs: [...(prev.week.runs || []), newBike]
                          }
                        }));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Bike
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {editingTrainingWeek.week.runs?.map((run, idx) => {
                    // Determine if this is a swim based on label
                    const isSwim = run.label?.toLowerCase().includes('swim');
                    const unit = isSwim ? 'yds' : 'mi';
                    // Parse numeric value from distance string (e.g., "450 yds" → 450)
                    const numericDistance = parseFloat(String(run.distance || '0').replace(/[^\d.]/g, '')) || 0;

                    return (
                      <div key={run.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="text"
                          value={run.label || ''}
                          onChange={(e) => {
                            const updatedRuns = [...editingTrainingWeek.week.runs];
                            // Update unit when label changes
                            const newIsSwim = e.target.value.toLowerCase().includes('swim');
                            const newUnit = newIsSwim ? 'yds' : 'mi';
                            const currentNum = parseFloat(String(run.distance || '0').replace(/[^\d.]/g, '')) || 0;
                            updatedRuns[idx] = {
                              ...run,
                              label: e.target.value,
                              distance: `${currentNum} ${newUnit}`
                            };
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, runs: updatedRuns }
                            }));
                          }}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          placeholder="Activity name"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={numericDistance || ''}
                            onChange={(e) => {
                              const updatedRuns = [...editingTrainingWeek.week.runs];
                              updatedRuns[idx] = { ...run, distance: `${e.target.value} ${unit}` };
                              setEditingTrainingWeek(prev => ({
                                ...prev,
                                week: { ...prev.week, runs: updatedRuns }
                              }));
                            }}
                            className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
                            placeholder="0"
                            step={isSwim ? "25" : "0.1"}
                          />
                          <span className={`text-sm ${isSwim ? 'text-blue-400' : 'text-white/60'}`}>{unit}</span>
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
                    );
                  })}
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

              {/* Photos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📷 Photos</h3>
                {(editingTrainingWeek.week.photos || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {(editingTrainingWeek.week.photos || []).map(photo => (
                      <div key={photo.id} className="relative group/photo">
                        <img src={photo.url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/20" />
                        <button
                          onClick={() => {
                            setEditingTrainingWeek(prev => ({
                              ...prev,
                              week: { ...prev.week, photos: (prev.week.photos || []).filter(p => p.id !== photo.id) }
                            }));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-lg"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) handleWeekPhotoAdd(editingTrainingWeek.eventId, editingTrainingWeek.week.id, editingTrainingWeek.week.photos || [], file); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {uploadingWeekPhotoId === editingTrainingWeek.week.id ? (
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl border-orange-400 bg-orange-500/10 text-orange-300">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Uploading photo...</span>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition border-white/20 text-white/40 hover:text-white/60 hover:border-white/30">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleWeekPhotoAdd(editingTrainingWeek.eventId, editingTrainingWeek.week.id, editingTrainingWeek.week.photos || [], file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
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
                    photos: week.photos,
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

      {/* Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery(''); } }}
        >
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
            {/* Search input */}
            <div className="border-b border-white/10 p-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks, lists, ideas, social, habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white transition p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap px-3 py-2.5 border-b border-white/10">
              {[
                { key: 'tasks', label: 'Tasks', emoji: '✅' },
                { key: 'lists', label: 'Lists', emoji: '📝' },
                { key: 'ideas', label: 'Ideas', emoji: '💡' },
                { key: 'social', label: 'Social', emoji: '👥' },
                { key: 'habits', label: 'Habits', emoji: '🔄' },
                { key: 'travel', label: 'Travel', emoji: '✈️' },
                { key: 'events', label: 'Events', emoji: '🎉' },
                { key: 'fitness', label: 'Fitness', emoji: '🏃' },
                { key: 'memories', label: 'Memories', emoji: '💝' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSearchFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    searchFilters[f.key]
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center text-white/40 text-sm">Type to search across all your data</div>
              ) : totalSearchResults === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">No results for "{searchQuery}"</div>
              ) : (
                <div className="p-3 space-y-4">
                  {/* Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Tasks ({searchResults.tasks.length})</h4>
                      <div className="space-y-1">
                        {searchResults.tasks.map(t => (
                          <button key={t.id} onClick={() => handleSearchResultClick('tasks', t.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">✅</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{t.title}</p>
                              {t.description && <p className="text-xs text-white/40 truncate mt-0.5">{t.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lists */}
                  {searchResults.lists.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Lists ({searchResults.lists.length})</h4>
                      <div className="space-y-1">
                        {searchResults.lists.map(l => (
                          <button key={l.id} onClick={() => handleSearchResultClick('lists', l.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{l.emoji || '📝'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{l.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{l.items?.length || 0} items{l.items?.some(i => i.text?.toLowerCase().includes(searchQuery.toLowerCase())) ? ' · match in items' : ''}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ideas */}
                  {searchResults.ideas.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Ideas ({searchResults.ideas.length})</h4>
                      <div className="space-y-1">
                        {searchResults.ideas.map(i => (
                          <button key={i.id} onClick={() => handleSearchResultClick('ideas', i.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">💡</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{i.title}</p>
                              {i.description && <p className="text-xs text-white/40 truncate mt-0.5">{i.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social */}
                  {searchResults.social.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Social ({searchResults.social.length})</h4>
                      <div className="space-y-1">
                        {searchResults.social.map(s => (
                          <button key={s.id} onClick={() => handleSearchResultClick('social', s.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">👥</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{s.person}{s.title ? ` · ${s.title}` : ''}</p>
                              {s.description && <p className="text-xs text-white/40 truncate mt-0.5">{s.description}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habits */}
                  {searchResults.habits.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Habits ({searchResults.habits.length})</h4>
                      <div className="space-y-1">
                        {searchResults.habits.map(h => (
                          <button key={h.id} onClick={() => handleSearchResultClick('habits', h.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">🔄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{h.name}</p>
                              {h.identity && <p className="text-xs text-white/40 truncate mt-0.5">{h.identity}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel */}
                  {searchResults.travel.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Travel ({searchResults.travel.length})</h4>
                      <div className="space-y-1">
                        {searchResults.travel.map(t => (
                          <button key={t.id} onClick={() => handleSearchResultClick('travel', t.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{t.emoji || '✈️'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{t.destination}</p>
                              <p className="text-xs text-white/40 mt-0.5">{t.dates?.start ? new Date(t.dates.start + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : t.isWishlist ? 'Wishlist' : ''}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {searchResults.events.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Events ({searchResults.events.length})</h4>
                      <div className="space-y-1">
                        {searchResults.events.map(e => (
                          <button key={e.id} onClick={() => handleSearchResultClick('events', e.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{e.emoji || '🎉'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{e.name}</p>
                              {e.location && <p className="text-xs text-white/40 truncate mt-0.5">{e.location}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fitness */}
                  {searchResults.fitness.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Fitness ({searchResults.fitness.length})</h4>
                      <div className="space-y-1">
                        {searchResults.fitness.map(f => (
                          <button key={f.id} onClick={() => handleSearchResultClick('fitness', f.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{f.emoji || '🏃'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{f.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{f.date ? new Date(f.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : f.type}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Memories */}
                  {searchResults.memories.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 px-1">Memories ({searchResults.memories.length})</h4>
                      <div className="space-y-1">
                        {searchResults.memories.map(m => (
                          <button key={m.id} onClick={() => handleSearchResultClick('memories', m.id)}
                            className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-base">{m.icon || '💝'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{m.title}</p>
                              {m.location && <p className="text-xs text-white/40 truncate mt-0.5">{m.location}</p>}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Partnership Quote Modal - Enhanced with Pride content */}
      {showPartnershipQuote && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPartnershipQuote(false)}
        >
          <div
            className="relative max-w-lg w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating hearts animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${1.5 + Math.random()}s`
                  }}
                >
                  {['💕', '💖', '💗', '💝', '🌈', '✨', '💜', '💙'][i % 8]}
                </div>
              ))}
            </div>

            {/* Quote card */}
            <div className="relative bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Rainbow top border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 rounded-t-3xl" />

              {/* Close button */}
              <button
                onClick={() => setShowPartnershipQuote(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Embracing Who We Are Section */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🏳️‍🌈</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Embracing Who We Are
                </h3>
                <p className="text-white/70 text-sm mt-2 max-w-sm mx-auto">
                  Living authentically, celebrating our love, and building a life filled with pride, joy, and adventure.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-white/40 text-xs uppercase tracking-wider">Our Promise</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Quote */}
              <div className="relative">
                <span className="absolute -top-4 -left-2 text-5xl text-pink-500/30">"</span>
                <p className="text-white/90 text-base leading-relaxed pl-6 pr-4 italic">
                  We should create a partnership. We should lift each other up when we are down, encourage each other to grow and learn. We should support each other through successes and failures. We should treat each other with respect, even when we fight (which we will.) We should make up and make out when that does happen. We should create something special just for the two of us and celebrate it.
                </p>
                <span className="absolute -bottom-6 right-0 text-5xl text-purple-500/30">"</span>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex gap-2 text-2xl">
                    {['🏳️‍🌈', '💜', '💙', '💖', '🦄'].map((emoji, i) => (
                      <span
                        key={i}
                        className="hover:scale-125 transition cursor-default"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-purple-300/60 text-sm mt-3 font-medium">
                  Love is love 💕
                </p>
                <p className="text-white/40 text-xs mt-2 text-center">Click anywhere to close</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{editingTrip.emoji}</span>
                  Edit Trip
                </h2>
                <button onClick={() => setEditingTrip(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Destination</label>
                <input type="text" value={editingTrip.destination || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, destination: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Start Date</label>
                  <input type="date" value={editingTrip.dates?.start || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, dates: { ...prev.dates, start: e.target.value } }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
                  <input type="date" value={editingTrip.dates?.end || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, dates: { ...prev.dates, end: e.target.value } }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
              </div>
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cover Image URL</label>
                <input type="text" value={editingTrip.coverImage || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, coverImage: e.target.value }))} placeholder="Paste image URL..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
                {editingTrip.coverImage && (
                  <img src={editingTrip.coverImage} alt="Cover preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              {/* Special Note */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Special Note</label>
                <input type="text" value={editingTrip.special || ''} onChange={(e) => setEditingTrip(prev => ({ ...prev, special: e.target.value }))} placeholder="e.g., Harry Styles Concert!" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-white/10 space-y-3">
              <button onClick={() => { setSelectedTrip(editingTrip); setEditingTrip(null); }} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
                View Full Details <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const updatedTrips = trips.map(t => t.id === editingTrip.id ? editingTrip : t);
                setTrips(updatedTrips);
                setEditingTrip(null);
                showToast('Trip updated!');
              }} className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPartyEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{editingPartyEvent.emoji}</span>
                  Edit Event
                </h2>
                <button onClick={() => setEditingPartyEvent(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Name</label>
                <input type="text" value={editingPartyEvent.name || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
                  <input type="date" value={editingPartyEvent.date || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Time</label>
                  <input type="time" value={editingPartyEvent.time || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input type="text" value={editingPartyEvent.location || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, location: e.target.value }))} placeholder="Where is it?" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea value={editingPartyEvent.description || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Event details..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cover Image URL</label>
                <input type="text" value={editingPartyEvent.coverImage || ''} onChange={(e) => setEditingPartyEvent(prev => ({ ...prev, coverImage: e.target.value }))} placeholder="Paste image URL..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40" />
                {editingPartyEvent.coverImage && (
                  <img src={editingPartyEvent.coverImage} alt="Cover preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              {/* Hub Tasks linked to this event */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-400" />
                  Hub Tasks
                </label>
                {(() => {
                  const linked = getLinkedHubItems('events', editingPartyEvent.id);
                  return linked.linkedTasks.length > 0 ? (
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {linked.linkedTasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${task.status === 'done' ? 'bg-green-500/10' : 'bg-white/5'}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                            task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'
                          }`}>
                            {task.status === 'done' && <Check className="w-3 h-3" />}
                          </div>
                          <span className={`flex-1 text-sm text-white ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                          {task.assignedTo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.assignedTo === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                              task.assignedTo === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                              'bg-amber-500/30 text-amber-300'
                            }`}>{task.assignedTo}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm mb-3">No tasks linked yet</p>
                  );
                })()}
                <button
                  onClick={() => {
                    setEditingPartyEvent(null);
                    setShowAddTaskModal({
                      _prefill: true,
                      linkedTo: { section: 'partyEvents', itemId: editingPartyEvent.id },
                    });
                  }}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Task in Hub
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 space-y-3">
              <button onClick={() => { setSelectedPartyEvent(editingPartyEvent); setEditingPartyEvent(null); }} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
                View Full Details <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const updatedEvents = partyEvents.map(e => e.id === editingPartyEvent.id ? editingPartyEvent : e);
                setPartyEvents(updatedEvents);
                setEditingPartyEvent(null);
                showToast('Event updated!');
              }} className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMemory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
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

              {/* Photos & Videos */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Photos ({getMemoryImages(editingMemory).length}) & Videos ({(editingMemory.videos || []).length})
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-orange-500 bg-orange-500/10' : 'border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, true)}
                >
                  {/* Existing videos grid */}
                  {(editingMemory.videos || []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-white/50 mb-2">🎬 Videos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(editingMemory.videos || []).map((video, idx) => (
                          <div key={idx} className="relative group aspect-video">
                            <video
                              src={video}
                              className="w-full h-full object-cover rounded-lg"
                              muted
                              playsInline
                              onMouseEnter={(e) => e.target.play()}
                              onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center group-hover:opacity-0 transition">
                                <span className="text-white text-lg ml-1">▶</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newVideos = (editingMemory.videos || []).filter((_, i) => i !== idx);
                                setEditingMemory(prev => ({ ...prev, videos: newVideos }));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              title="Remove video"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing images grid */}
                  {getMemoryImages(editingMemory).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(editingMemory.videos || []).length > 0 && <p className="text-xs text-white/50 mb-2 col-span-3">📷 Photos</p>}
                      {getMemoryImages(editingMemory).map((img, idx) => {
                        const imgSettings = editingMemory.imageSettings?.[idx] || { x: 50, y: 50, zoom: 100 };
                        return (
                          <div key={idx} className="relative group aspect-square">
                            <div
                              className={`w-full h-full overflow-hidden rounded-lg cursor-pointer ${
                                editingPhotoIndex === idx ? 'ring-2 ring-orange-500' : ''
                              }`}
                              onClick={() => {
                                setEditingPhotoIndex(editingPhotoIndex === idx ? null : idx);
                                setPhotoPosition(imgSettings);
                              }}
                            >
                              <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover transition-transform"
                                style={{
                                  objectPosition: `${imgSettings.x}% ${imgSettings.y}%`,
                                  transform: `scale(${imgSettings.zoom / 100})`
                                }}
                              />
                            </div>
                            {/* Adjust button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPhotoIndex(editingPhotoIndex === idx ? null : idx);
                                setPhotoPosition(imgSettings);
                              }}
                              className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded-full transition ${
                                editingPhotoIndex === idx
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/70'
                              }`}
                            >
                              {editingPhotoIndex === idx ? '✓ Editing' : '📐 Adjust'}
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const allImages = getMemoryImages(editingMemory);
                                const newImages = allImages.filter((_, i) => i !== idx);
                                const newSettings = { ...(editingMemory.imageSettings || {}) };
                                delete newSettings[idx];
                                setEditingMemory(prev => ({ ...prev, images: newImages, image: '', imageSettings: newSettings }));
                                if (editingPhotoIndex === idx) setEditingPhotoIndex(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hint to adjust photos */}
                  {getMemoryImages(editingMemory).length > 0 && editingPhotoIndex === null && (
                    <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-center">
                      <p className="text-orange-300 text-sm">
                        💡 Click "Adjust" on any photo to position and zoom it for the card
                      </p>
                    </div>
                  )}

                  {/* Photo Position/Zoom Controls */}
                  {editingPhotoIndex !== null && getMemoryImages(editingMemory)[editingPhotoIndex] && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/70">📐 Adjust Photo Position</span>
                        <button
                          onClick={() => setEditingPhotoIndex(null)}
                          className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 rounded transition"
                        >
                          Done
                        </button>
                      </div>

                      {/* Horizontal Position */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>← Left</span>
                          <span>Horizontal: {photoPosition.x}%</span>
                          <span>Right →</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photoPosition.x}
                          onChange={(e) => {
                            const newX = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, x: newX }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, x: newX }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Vertical Position */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>↑ Top</span>
                          <span>Vertical: {photoPosition.y}%</span>
                          <span>Bottom ↓</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photoPosition.y}
                          onChange={(e) => {
                            const newY = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, y: newY }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, y: newY }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Zoom */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                          <span>🔍 Zoom Out</span>
                          <span>Zoom: {photoPosition.zoom}%</span>
                          <span>Zoom In 🔍</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          value={photoPosition.zoom}
                          onChange={(e) => {
                            const newZoom = parseInt(e.target.value);
                            setPhotoPosition(prev => ({ ...prev, zoom: newZoom }));
                            setEditingMemory(prev => ({
                              ...prev,
                              imageSettings: {
                                ...(prev.imageSettings || {}),
                                [editingPhotoIndex]: { ...photoPosition, zoom: newZoom }
                              }
                            }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          const defaultPos = { x: 50, y: 50, zoom: 100 };
                          setPhotoPosition(defaultPos);
                          setEditingMemory(prev => ({
                            ...prev,
                            imageSettings: {
                              ...(prev.imageSettings || {}),
                              [editingPhotoIndex]: defaultPos
                            }
                          }));
                        }}
                        className="mt-3 w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-lg transition"
                      >
                        Reset to Center
                      </button>
                    </div>
                  )}

                  {/* Upload area */}
                  <div className="flex gap-2">
                    <label className={`flex-1 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition border-2 border-dashed ${
                      uploadingPhoto ? 'bg-white/5 text-white/40 border-white/10' : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/20 hover:border-orange-500'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo/Video'}</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,video/*,.mp4,.mov,.m4v"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryMedia(e.target.files[0], true)}
                      />
                    </label>
                  </div>
                  <p className="text-center text-white/40 text-xs mt-2">
                    📱 Drag photos/videos from Apple Photos • HEIC auto-converts • Videos up to 50MB
                  </p>
                  {dragOver && (
                    <div className="text-center text-orange-400 mt-2 text-sm font-medium">Drop media here to add</div>
                  )}
                </div>
              </div>

              {/* Card Preview */}
              {getMemoryImages(editingMemory).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Card Preview</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10">
                      {/* Preview Image */}
                      <div className="relative h-32 overflow-hidden">
                        {(() => {
                          const previewIdx = editingPhotoIndex !== null ? editingPhotoIndex : 0;
                          const img = getMemoryImages(editingMemory)[previewIdx];
                          const settings = editingMemory.imageSettings?.[previewIdx] || { x: 50, y: 50, zoom: 100 };
                          return img ? (
                            <img
                              src={img}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              style={{
                                objectPosition: `${settings.x}% ${settings.y}%`,
                                transform: `scale(${settings.zoom / 100})`,
                                transformOrigin: `${settings.x}% ${settings.y}%`
                              }}
                            />
                          ) : null;
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <div className="text-white font-semibold text-sm truncate">
                            {editingMemory.title || 'Memory Title'}
                          </div>
                          <div className="text-white/70 text-xs">
                            {editingMemory.location || 'Location'}
                          </div>
                        </div>
                      </div>
                      {/* Preview Info */}
                      <div className="p-3">
                        <p className="text-white/60 text-xs line-clamp-2">
                          {editingMemory.description || 'Description will appear here...'}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-white/30 text-xs mt-2">
                      This is how your memory card will look in the timeline
                    </p>
                  </div>
                </div>
              )}

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
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85dvh] overflow-y-auto">
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
                  className={`border border-dashed rounded-xl p-4 transition ${
                    dragOver ? 'border-rose-500 bg-rose-500/10' : 'border-white/20'
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
                  {/* Camera and Upload buttons */}
                  <div className="flex gap-3">
                    {/* Camera capture button */}
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition ${
                      uploadingPhoto ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/30 hover:border-rose-400 hover:bg-white/5 text-white/50'
                    }`}>
                      {uploadingPhoto ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      <span className="text-xs">{uploadingPhoto ? 'Uploading...' : 'Take Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => e.target.files?.[0] && uploadMemoryPhoto(e.target.files[0], false)}
                      />
                    </label>
                    {/* Gallery upload button */}
                    <label className={`flex-1 flex flex-col items-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition ${
                      uploadingPhoto ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/30 hover:border-rose-400 hover:bg-white/5 text-white/50'
                    }`}>
                      <Image className="w-5 h-5" />
                      <span className="text-xs">Choose Photo</span>
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
                    <div className="text-center text-rose-400 mt-2 text-sm">Drop image here to add</div>
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
                    showToast('Title and Date are required', 'error');
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
                  showToast('Memory added!', 'success');
                }}
                disabled={!newMemoryData.title || !newMemoryData.date}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouncing emoji removed for cleaner UI */}

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

      {/* Add/Edit Event Modal - rendered at root level for use from any section */}
      {(showAddEventModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl max-h-[85dvh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                    setEventCoverImagePreview(null);
                    setNewEventData({
                      name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                      location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: []
                    });
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Name & Emoji */}
              <div className="flex gap-3">
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
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Date</label>
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Start Time</label>
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">End Time</label>
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-white/50 mb-1">Location</label>
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/50 mb-1">Description</label>
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
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Theme Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'from-purple-400 to-pink-500',
                    'from-blue-400 to-cyan-500',
                    'from-green-400 to-emerald-500',
                    'from-amber-400 to-orange-500',
                    'from-red-400 to-pink-500',
                    'from-indigo-400 to-purple-500',
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
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} border-2 transition ${
                        (editingEvent ? editingEvent.color : newEventData.color) === color
                          ? 'border-white scale-110'
                          : 'border-transparent hover:border-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Cover Photo (optional)</label>
                {(editingEvent?.coverImage || newEventData.coverImage || eventCoverImagePreview) ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={eventCoverImagePreview || (editingEvent ? editingEvent.coverImage : newEventData.coverImage)}
                      alt="Cover preview"
                      className="w-full h-32 object-cover"
                    />
                    {uploadingEventCoverImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeEventCoverImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => eventCoverCameraRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-amber-400 hover:bg-white/5 transition"
                    >
                      <Camera className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Take Photo</span>
                    </button>
                    <input
                      ref={eventCoverCameraRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleEventCoverImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => eventCoverFileRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-amber-400 hover:bg-white/5 transition"
                    >
                      <Image className="w-5 h-5 text-white/50" />
                      <span className="text-xs text-white/50">Choose Photo</span>
                    </button>
                    <input
                      ref={eventCoverFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEventCoverImageSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Hub Tasks linked to this event */}
              {editingEvent && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400" />
                    Hub Tasks
                  </label>
                  {(() => {
                    const linked = getLinkedHubItems('events', editingEvent.id);
                    return linked.linkedTasks.length > 0 ? (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {linked.linkedTasks.map(task => (
                          <div key={task.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${task.status === 'done' ? 'bg-green-500/10' : 'bg-white/5'}`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                              task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'
                            }`}>
                              {task.status === 'done' && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`flex-1 text-sm text-white ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</span>
                            {task.assignedTo && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.assignedTo === 'Mike' ? 'bg-purple-500/30 text-purple-300' :
                                task.assignedTo === 'Adam' ? 'bg-blue-500/30 text-blue-300' :
                                'bg-amber-500/30 text-amber-300'
                              }`}>{task.assignedTo}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm mb-3">No tasks linked yet</p>
                    );
                  })()}
                  <button
                    onClick={() => {
                      const eventId = editingEvent.id;
                      setEditingEvent(null);
                      setShowAddEventModal(false);
                      setShowAddTaskModal({
                        _prefill: true,
                        linkedTo: { section: 'partyEvents', itemId: eventId },
                      });
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task in Hub
                  </button>
                </div>
              )}

              {/* Invite Guests - Coming Soon */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Invite Guests</label>
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center">
                  <UserPlus className="w-6 h-6 text-white/30 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Guest invitations coming soon!</p>
                  <p className="text-white/30 text-xs mt-1">You'll be able to invite friends to your event</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              {editingEvent && (
                <button
                  onClick={() => {
                    if (confirm('Delete this event?')) {
                      const newEvents = partyEvents.filter(e => e.id !== editingEvent.id);
                      setPartyEvents(newEvents);
                      savePartyEventsToFirestore(newEvents);
                      setEditingEvent(null);
                      setSelectedPartyEvent(null);
                      showToast('Event deleted', 'success');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                >
                  Delete Event
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    setEditingEvent(null);
                    setEventCoverImagePreview(null);
                    setNewEventData({
                      name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                      location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: []
                    });
                  }}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingEvent) {
                      const newEvents = partyEvents.map(e =>
                        e.id === editingEvent.id ? { ...editingEvent, updatedAt: new Date().toISOString() } : e
                      );
                      setPartyEvents(newEvents);
                      setSelectedPartyEvent(newEvents.find(e => e.id === editingEvent.id));
                      savePartyEventsToFirestore(newEvents);
                      setEditingEvent(null);
                      setEventCoverImagePreview(null);
                      showToast('Event updated!', 'success');
                    } else {
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
                      setEventCoverImagePreview(null);
                      setNewEventData({
                        name: '', emoji: '🎉', date: '', time: '18:00', endTime: '22:00',
                        location: '', entryCode: '', description: '', color: 'from-amber-400 to-orange-500', tasks: []
                      });
                      showToast('Event created!', 'success');
                    }
                  }}
                  disabled={!(editingEvent ? editingEvent.name && editingEvent.date : newEventData.name && newEventData.date)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Picker Modal */}
      {showCalendarPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Calendar</h2>
                <button
                  onClick={() => setShowCalendarPicker(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-2">Choose which calendar to sync</p>
            </div>

            <div className="p-4 space-y-2">
              {availableCalendars.map(calendar => (
                <button
                  key={calendar.id}
                  onClick={() => selectCalendar(calendar.id)}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedCalendarId === calendar.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                  />
                  <div className="text-left flex-1">
                    <div className="text-white font-medium">{calendar.summary}</div>
                    {calendar.description && (
                      <div className="text-slate-400 text-sm truncate">{calendar.description}</div>
                    )}
                  </div>
                  {calendar.primary && (
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">Primary</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Import Event</h2>
                <button
                  onClick={() => setShowImportModal(null)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Event Name - Editable */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-2 block">Event name:</label>
                <input
                  type="text"
                  value={importSettings.customName || showImportModal.title}
                  onChange={(e) => setImportSettings(prev => ({ ...prev, customName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  placeholder="Event name"
                />
              </div>

              {/* Event Details */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <div className="text-slate-400 text-sm space-y-1">
                  <p>📅 {(() => {
                    const startDate = parseLocalDate(showImportModal.start.split('T')[0]);
                    // For all-day events, Google uses exclusive end dates, so subtract 1 day
                    const endDateRaw = showImportModal.end.split('T')[0];
                    let endDate = parseLocalDate(endDateRaw);
                    if (showImportModal.allDay && endDate > startDate) {
                      endDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day
                    }
                    const isSameDay = startDate.toDateString() === endDate.toDateString();
                    if (isSameDay) {
                      return startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    } else {
                      return `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
                    }
                  })()}</p>
                  {showImportModal.location && <p>📍 {showImportModal.location}</p>}
                  {showImportModal.description && <p className="text-slate-500 truncate">📝 {showImportModal.description}</p>}
                </div>
              </div>

              {/* Import Type Selection */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-3 block">Import as:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'travel', emoji: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { type: 'event', emoji: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { type: 'memory', emoji: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                  ].map(option => (
                    <button
                      key={option.type}
                      onClick={() => setImportSettings(prev => ({ ...prev, type: option.type, color: option.gradient }))}
                      className={`p-3 rounded-xl border-2 transition ${
                        importSettings.type === option.type
                          ? `border-white bg-gradient-to-r ${option.gradient} text-white`
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="text-white/70 text-sm font-medium mb-3 block">Color theme:</label>
                <div className="flex flex-wrap gap-2">
                  {tripColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImportSettings(prev => ({ ...prev, color: color.gradient }))}
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${color.gradient} border-2 transition ${
                        importSettings.color === color.gradient ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(null)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => importGoogleEvent(showImportModal, importSettings)}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r ${importSettings.color} text-white font-semibold rounded-xl hover:opacity-90 transition`}
                >
                  Import as {importSettings.type === 'travel' ? 'Trip' : importSettings.type === 'event' ? 'Event' : 'Memory'}
                </button>
              </div>
            </div>
          </div>
        </div>
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

      {/* Desktop FAB - Top left, only on desktop */}
      {isOwner && !initialAppMode && !showAddMemoryModal && !editingMemory && !editingTrip && !editingPartyEvent && !showOpenDateModal && !showCompanionsModal && !showAddModal && !showNewTripModal && !showLinkModal && !showImportModal && !showGuestModal && !showMyProfileModal && !showAddFitnessEventModal && !editingFitnessEvent && !showAddEventModal && !editingEvent && !editingTrainingWeek && !showAddTaskModal && !showSharedListModal && !showAddIdeaModal && !showAddSocialModal && !showAddHabitModal && (
        <div className="hidden md:block fixed top-24 left-6 z-[90]">
          {showAddNewMenu && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[89]" onClick={() => setShowAddNewMenu(false)} />
              <div className="absolute top-16 left-0 z-[91] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl w-[240px]"
                style={{ animation: 'fabGridIn 0.15s ease-out both' }}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: () => setShowAddTaskModal('create'), icon: '✅', label: 'Task', gradient: 'from-blue-400 to-indigo-500' },
                    { action: () => setShowSharedListModal('create'), icon: '🛒', label: 'List', gradient: 'from-emerald-400 to-teal-500' },
                    { action: () => setShowAddSocialModal('create'), icon: '👥', label: 'Social', gradient: 'from-purple-400 to-violet-500' },
                    { action: () => setShowAddHabitModal('create'), icon: '🔄', label: 'Habit', gradient: 'from-green-400 to-emerald-500' },
                    { action: () => setShowAddIdeaModal('create'), icon: '💡', label: 'Idea', gradient: 'from-yellow-400 to-amber-500' },
                    { action: () => setShowNewTripModal('adventure'), icon: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { action: () => setShowAddEventModal(true), icon: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { action: () => setShowAddMemoryModal('milestone'), icon: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                    { action: () => setShowAddFitnessEventModal(true), icon: '🏃', label: 'Fitness', gradient: 'from-orange-400 to-red-500' },
                  ].map((item, idx) => (
                    <button key={item.label} onClick={() => { setShowAddNewMenu(false); item.action(); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-white/10 transition active:scale-95" style={{ animation: `fabItemIn 0.12s ease-out ${idx * 0.02}s both` }}>
                      <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl shadow-md`}>{item.icon}</span>
                      <span className="text-[11px] text-white/70 font-medium leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes fabGridIn { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes fabItemIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
              `}</style>
            </>
          )}
          <button onClick={() => setShowAddNewMenu(!showAddNewMenu)} className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${showAddNewMenu ? 'bg-gradient-to-r from-pink-500 to-rose-500 rotate-45' : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:shadow-purple-500/30'}`} style={{ boxShadow: showAddNewMenu ? '0 8px 32px rgba(236, 72, 153, 0.4)' : '0 8px 32px rgba(139, 92, 246, 0.4)' }}>
            <Plus className="w-6 h-6 text-white transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation with integrated FAB */}
      {!initialAppMode && !showAddMemoryModal && !editingMemory && !editingTrip && !editingPartyEvent && !showOpenDateModal && !showCompanionsModal && !showAddModal && !showNewTripModal && !showLinkModal && !showImportModal && !showGuestModal && !showMyProfileModal && !showAddFitnessEventModal && !editingFitnessEvent && !showAddEventModal && !editingEvent && !editingTrainingWeek && !showAddTaskModal && !showSharedListModal && !showAddIdeaModal && !showAddSocialModal && !showAddHabitModal && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100]" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
          {/* FAB Menu Popup - anchored to center of nav */}
          {showAddNewMenu && isOwner && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" onClick={() => setShowAddNewMenu(false)} />
              <div className="absolute bottom-full left-1/2 mb-[68px] z-[101] bg-slate-800/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl w-[240px]"
                style={{ animation: 'fabGridUp 0.2s cubic-bezier(0.16,1,0.3,1) both', transformOrigin: 'bottom center' }}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: () => setShowAddTaskModal('create'), icon: '✅', label: 'Task', gradient: 'from-blue-400 to-indigo-500' },
                    { action: () => setShowSharedListModal('create'), icon: '🛒', label: 'List', gradient: 'from-emerald-400 to-teal-500' },
                    { action: () => setShowAddSocialModal('create'), icon: '👥', label: 'Social', gradient: 'from-purple-400 to-violet-500' },
                    { action: () => setShowAddHabitModal('create'), icon: '🔄', label: 'Habit', gradient: 'from-green-400 to-emerald-500' },
                    { action: () => setShowAddIdeaModal('create'), icon: '💡', label: 'Idea', gradient: 'from-yellow-400 to-amber-500' },
                    { action: () => setShowNewTripModal('adventure'), icon: '✈️', label: 'Trip', gradient: 'from-teal-400 to-cyan-500' },
                    { action: () => setShowAddEventModal(true), icon: '🎉', label: 'Event', gradient: 'from-amber-400 to-orange-500' },
                    { action: () => setShowAddMemoryModal('milestone'), icon: '💝', label: 'Memory', gradient: 'from-rose-400 to-pink-500' },
                    { action: () => setShowAddFitnessEventModal(true), icon: '🏃', label: 'Fitness', gradient: 'from-orange-400 to-red-500' },
                  ].map((item, idx) => {
                    // Bottom row (6,7,8) appears first, then middle (3,4,5), then top (0,1,2)
                    const row = Math.floor(idx / 3);
                    const delay = (2 - row) * 0.04 + (idx % 3) * 0.015;
                    return (
                      <button key={item.label} onClick={() => { setShowAddNewMenu(false); item.action(); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-white/10 transition active:scale-95" style={{ animation: `fabItemUp 0.25s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
                        <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl shadow-md`}>{item.icon}</span>
                        <span className="text-[11px] text-white/70 font-medium leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <style>{`
                @keyframes fabGridUp { from { opacity: 0; transform: translateX(-50%) scaleY(0.3) scaleX(0.8) translateY(20px); } to { opacity: 1; transform: translateX(-50%) scaleY(1) scaleX(1) translateY(0); } }
                @keyframes fabItemUp { from { opacity: 0; transform: translateY(12px) scale(0.7); } to { opacity: 1; transform: translateY(0) scale(1); } }
              `}</style>
            </>
          )}
          {/* Nav bar background */}
          <div className="relative bg-slate-900 border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Atlas is the visual bridge between FAB and nav — no splash needed */}
            {/* Raised FAB button - centered, overlapping top of nav */}
            {isOwner && (
              <button
                onClick={() => setShowAddNewMenu(!showAddNewMenu)}
                className={`absolute left-1/2 -translate-x-1/2 -top-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 z-[101] ${
                  showAddNewMenu
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 rotate-45'
                    : 'bg-gradient-to-r from-purple-500 to-violet-600'
                }`}
                style={{
                  width: '3.75rem', height: '3.75rem',
                  boxShadow: showAddNewMenu
                    ? '0 4px 30px rgba(236, 72, 153, 0.7), 0 0 0 4px rgba(236, 72, 153, 0.12), 0 8px 16px rgba(0,0,0,0.4)'
                    : '0 4px 30px rgba(139, 92, 246, 0.7), 0 0 0 4px rgba(139, 92, 246, 0.12), 0 8px 16px rgba(0,0,0,0.4)',
                }}
              >
                <Plus className="w-7 h-7 text-white transition-transform duration-200" />
              </button>
            )}
            {/* Tab buttons */}
            <div className="flex items-end justify-around px-1 pt-1 pb-1">
              {[
                { id: 'home', label: 'Hub', emoji: '⚛️', gradient: 'from-pink-500 to-purple-500' },
                { id: 'travel', label: 'Travel', emoji: '✈️', gradient: 'from-teal-400 to-cyan-500' },
                { id: 'fitness', label: 'Fitness', emoji: null, gradient: 'from-orange-400 to-red-500' },
                { id: 'events', label: 'Events', emoji: '🎉', gradient: 'from-amber-400 to-orange-500' },
                { id: 'memories', label: 'Memories', emoji: '💝', gradient: 'from-rose-400 to-pink-500' },
              ].map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (section.id === 'travel') setTravelViewMode('main');
                    if (section.id === 'home') setHubSubView('home');
                    setShowComingSoonMenu(false);
                  }}
                  className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-95 ${idx === 2 ? 'min-w-[56px] -mt-8' : 'min-w-[52px]'} ${
                    activeSection === section.id ? '' : ''
                  }`}
                >
                  {idx === 2 ? (
                    /* Atlas figure holding up the FAB — nono banana artwork */
                    <img
                      src="/atlas-fitness.png"
                      alt="Fitness"
                      className={`transition-all duration-200 ${activeSection === section.id ? 'scale-110' : ''}`}
                      style={{
                        width: '38px',
                        height: '46px',
                        objectFit: 'contain',
                        filter: activeSection === section.id
                          ? 'brightness(1.6) saturate(1.3) drop-shadow(0 0 8px rgba(249,115,22,0.7)) drop-shadow(0 0 16px rgba(249,115,22,0.3))'
                          : 'brightness(0.85) saturate(0.8) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                      }}
                    />
                  ) : (
                    <span className={`text-lg mb-0.5 transition-transform ${activeSection === section.id ? 'scale-110' : ''}`}>
                      {section.emoji}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium transition-colors ${activeSection === section.id ? 'text-white' : 'text-white/40'}`}>
                    {section.label}
                  </span>
                  {activeSection === section.id && idx !== 2 && (
                    <div className={`absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r ${section.gradient}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Bottom rainbow bar - hidden on mobile when bottom nav is showing */}
      <div className={`h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 ${!initialAppMode ? 'hidden md:block' : ''}`} />
    </div>
  );
}
