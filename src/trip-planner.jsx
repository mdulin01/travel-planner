import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, Link, Globe, Loader, LogIn, LogOut, User, UserPlus, Share2 } from 'lucide-react';

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

// Import your Firebase config
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Helper to parse date strings without timezone issues
// "2026-03-23" -> Date object for March 23, 2026 in local time
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Format a date string for display
const formatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', options);
};

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

// Helper to get display name from companion
const getCompanionDisplayName = (companion) => {
  if (companion.firstName && companion.lastName) {
    return `${companion.firstName} ${companion.lastName}`;
  }
  return companion.firstName || companion.name || 'Unknown';
};

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

// Bougie levels
const bougieLabels = [
  { level: 1, label: 'Kinda Bougie', emoji: '✨', description: 'Nice but budget-friendly' },
  { level: 2, label: 'Bougie', emoji: '💅', description: 'Treat yourself vibes' },
  { level: 3, label: 'Pretty Bougie', emoji: '🥂', description: 'Splurge-worthy' },
  { level: 4, label: 'Very Bougie', emoji: '💎', description: 'Luxury experience' },
  { level: 5, label: 'Super Bougie', emoji: '👑', description: 'Ultimate indulgence' },
];

// Random Experience Database
const experienceDatabase = {
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
    { destination: 'New York City', emoji: '🗽', description: 'The city that never sleeps', duration: '9 hrs via Amtrak', vibes: ['artsy', 'gay', 'glutenFree'], bougie: 3, highlights: ['Broadway', 'Hell\'s Kitchen', 'Chelsea'] },
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
    { destination: 'Virgin Voyages', emoji: '🔥', description: 'Adults-only boutique cruising', duration: '5-7 days', vibes: ['gay', 'glutenFree'], bougie: 4, highlights: ['No kids', 'Tattoo parlor', 'Richard\'s Rooftop'] },
    { destination: 'Regent Seven Seas', emoji: '👑', description: 'Ultra-luxury all-inclusive', duration: '10 days', vibes: ['glutenFree'], bougie: 5, highlights: ['All-suite ships', 'Unlimited shore excursions', 'Butler service'] },
    { destination: 'Silversea Mediterranean', emoji: '🏆', description: 'Intimate luxury expedition', duration: '12 days', vibes: ['artsy', 'glutenFree'], bougie: 5, highlights: ['300 guests max', 'Michelin-level dining', 'All-inclusive'] },
  ],
  flights: [
    { destination: 'Key West, FL', emoji: '🌺', description: 'America\'s most gay-friendly town', vibes: ['gay'], bougie: 2, highlights: ['Duval Street', 'Sunset Pier', 'Historic tours'] },
    { destination: 'Wilton Manors, FL', emoji: '🏳️‍🌈', description: 'Gay village paradise near Fort Lauderdale', vibes: ['gay'], bougie: 2, highlights: ['Wilton Drive', 'Beach days', 'Nightlife'] },
    { destination: 'San Diego, CA', emoji: '🌴', description: 'Perfect weather & Hillcrest gayborhood', vibes: ['gay', 'glutenFree'], bougie: 2, highlights: ['Hillcrest', 'Balboa Park', 'Gaslamp Quarter'] },
    { destination: 'Palm Springs, CA', emoji: '🌵', description: 'Desert oasis & gay resort town', vibes: ['gay', 'glutenFree'], bougie: 3, highlights: ['Pool parties', 'Mid-century architecture', 'Joshua Tree nearby'] },
    { destination: 'Provincetown, MA', emoji: '🏖️', description: 'Ultimate East Coast gay destination', vibes: ['gay', 'artsy'], bougie: 2, highlights: ['Commercial Street', 'Beach time', 'Whale watching'] },
    { destination: 'Fire Island, NY', emoji: '🔥', description: 'Iconic gay beach community', vibes: ['gay'], bougie: 3, highlights: ['Cherry Grove', 'The Pines', 'Beach parties'] },
    { destination: 'Rehoboth Beach, DE', emoji: '🏖️', description: 'Mid-Atlantic gay beach town', vibes: ['gay'], bougie: 1, highlights: ['Beach days', 'Poodle Beach', 'Downtown shops'] },
    { destination: 'Puerto Vallarta, MX', emoji: '🇲🇽', description: 'Mexico\'s gay paradise', vibes: ['gay', 'glutenFree'], bougie: 2, highlights: ['Zona Romántica', 'Beach clubs', 'Malecón'] },
    { destination: 'Santa Fe, NM', emoji: '🎨', description: 'Art galleries & Southwestern culture', vibes: ['artsy', 'glutenFree'], bougie: 3, highlights: ['Canyon Road', 'Georgia O\'Keeffe Museum', 'Plaza'] },
    { destination: 'Portland, OR', emoji: '🌲', description: 'Weird, wonderful & super GF-friendly', vibes: ['artsy', 'glutenFree', 'gay'], bougie: 2, highlights: ['Food carts', 'Powell\'s Books', 'Alberta Arts District'] },
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
    { destination: 'St. Barts', emoji: '🏝️', description: 'Caribbean\'s chicest island', vibes: ['gay'], bougie: 5, highlights: ['Shell Beach', 'Designer shopping', 'Yacht culture'] },
    { destination: 'Bora Bora', emoji: '🏝️', description: 'Overwater bungalow paradise', vibes: [], bougie: 5, highlights: ['Overwater villas', 'Crystal lagoon', 'Private beaches'] },
    { destination: 'Tokyo, Japan', emoji: '🗼', description: 'Culture, food & Ni-chōme nightlife', vibes: ['gay', 'artsy', 'glutenFree'], bougie: 4, highlights: ['Shinjuku Ni-chōme', 'Shibuya', 'Harajuku'] },
    { destination: 'Paris, France', emoji: '🗼', description: 'City of lights & Le Marais', vibes: ['gay', 'artsy', 'glutenFree'], bougie: 4, highlights: ['Le Marais', 'Louvre', 'Montmartre'] },
    { destination: 'Tulum, Mexico', emoji: '🌴', description: 'Bohemian beach luxury', vibes: ['artsy', 'glutenFree', 'gay'], bougie: 4, highlights: ['Beach clubs', 'Cenotes', 'Wellness retreats'] },
  ]
};

const getRandomExperience = (type, vibes, bougieLevel) => {
  let pool = [];

  if (type === 'any' || type === 'dayTrip') {
    pool = [...pool, ...experienceDatabase.dayTrips.map(e => ({ ...e, type: 'dayTrip', typeLabel: '🚗 Day Trip' }))];
  }
  if (type === 'any' || type === 'train') {
    pool = [...pool, ...experienceDatabase.trainTrips.map(e => ({ ...e, type: 'train', typeLabel: '🚂 Train Trip' }))];
  }
  if (type === 'any' || type === 'cruise') {
    pool = [...pool, ...experienceDatabase.cruises.map(e => ({ ...e, type: 'cruise', typeLabel: '🚢 Cruise' }))];
  }
  if (type === 'any' || type === 'flight') {
    pool = [...pool, ...experienceDatabase.flights.map(e => ({ ...e, type: 'flight', typeLabel: '✈️ Flight' }))];
  }

  // Filter by vibes if any selected
  if (vibes.length > 0) {
    pool = pool.filter(exp => vibes.some(v => exp.vibes?.includes(v)));
  }

  // Filter by bougie level if selected (allow +/- 1 level flexibility)
  if (bougieLevel > 0) {
    pool = pool.filter(exp => exp.bougie && Math.abs(exp.bougie - bougieLevel) <= 1);
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

// Travel Quotes
const travelQuotes = [
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

// Achievements/Badges
const achievementDefinitions = [
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

// Default packing list items
const defaultPackingItems = [
  { category: 'Essentials', items: ['Passport/ID', 'Wallet', 'Phone & Charger', 'Medications'] },
  { category: 'Clothing', items: ['Underwear', 'Socks', 'Shirts', 'Pants/Shorts', 'Sleepwear'] },
  { category: 'Toiletries', items: ['Toothbrush', 'Toothpaste', 'Deodorant', 'Shampoo', 'Sunscreen'] },
  { category: 'Tech', items: ['Camera', 'Headphones', 'Portable charger', 'Adapters'] },
  { category: 'Extras', items: ['Snacks', 'Books/Kindle', 'Travel pillow', 'Sunglasses'] },
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

// AddModal Component - uses local state to prevent focus loss, syncs with parent only on submit
const AddModal = React.memo(({ type, tripId, onClose, addItem, updateItem, editItem }) => {
  // Local state - initialize with editItem data if editing
  const [formData, setFormData] = useState(editItem || {});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const isEditing = !!editItem;

  const airlines = [
    'American Airlines', 'Delta', 'United', 'Southwest', 'JetBlue',
    'Alaska Airlines', 'Spirit', 'Frontier', 'Hawaiian Airlines',
    'British Airways', 'Air France', 'Lufthansa', 'Emirates', 'Other'
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      const hasData = Object.values(formData).some(v => v && v.toString().trim());
      if (hasData) {
        setShowConfirmClose(true);
      } else {
        onClose();
      }
    }
  };

  const handleClose = () => {
    const hasData = Object.values(formData).some(v => v && v.toString().trim());
    if (hasData) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    addItem(tripId, type, formData);
    onClose();
  };

  const renderFlightForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Airline</label>
        <select
          value={formData.airline || ''}
          onChange={(e) => updateField('airline', e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none bg-white"
        >
          <option value="">Select airline...</option>
          {airlines.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Flight Number</label>
        <input
          type="text"
          placeholder="e.g., AA1234"
          value={formData.flightNo || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('flightNo', e.target.value.toUpperCase())}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
        <input
          type="date"
          value={formData.date || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('date', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Departure Time</label>
          <input
            type="time"
            value={formData.departTime || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('departTime', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Arrival Time</label>
          <input
            type="time"
            value={formData.arriveTime || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('arriveTime', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">From (Airport)</label>
          <input
            type="text"
            placeholder="e.g., GSO or JFK"
            value={formData.depart || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('depart', e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">To (Airport)</label>
          <input
            type="text"
            placeholder="e.g., LHR or LAX"
            value={formData.arrive || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('arrive', e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Booking confirmation code"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value.toUpperCase())}
        />
      </div>
    </div>
  );

  const renderHotelForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Hotel Name</label>
        <input
          type="text"
          placeholder="e.g., The Standard, Marriott..."
          value={formData.name || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Address (optional)</label>
        <input
          type="text"
          placeholder="Hotel address"
          value={formData.address || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Check-in Date</label>
          <input
            type="date"
            value={formData.checkIn || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('checkIn', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Check-out Date</label>
          <input
            type="date"
            value={formData.checkOut || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('checkOut', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Booking confirmation code"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value.toUpperCase())}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Notes (optional)</label>
        <textarea
          placeholder="Room type, special requests..."
          value={formData.notes || ''}
          rows={2}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none resize-none"
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEventForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Event Name</label>
        <input
          type="text"
          placeholder="e.g., Harry Styles Concert, Broadway Show..."
          value={formData.name || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Venue (optional)</label>
        <input
          type="text"
          placeholder="e.g., Madison Square Garden"
          value={formData.venue || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('venue', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
          <input
            type="date"
            value={formData.date || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
          <input
            type="time"
            value={formData.time || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('time', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Tickets/Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Ticket confirmation or order number"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Notes (optional)</label>
        <textarea
          placeholder="Seat numbers, dress code, etc..."
          value={formData.notes || ''}
          rows={2}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none resize-none"
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const getFormContent = () => {
    switch(type) {
      case 'flights': return renderFlightForm();
      case 'hotels': return renderHotelForm();
      case 'events': return renderEventForm();
      default: return null;
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'flights': return <Plane className="w-6 h-6 text-teal-500" />;
      case 'hotels': return <Hotel className="w-6 h-6 text-purple-500" />;
      case 'events': return <Music className="w-6 h-6 text-pink-500" />;
      default: return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {showConfirmClose && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-3xl">
            <div className="bg-white rounded-2xl p-6 m-4 shadow-xl">
              <p className="text-slate-800 font-medium mb-4">Discard your changes?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                >
                  Keep Editing
                </button>
                <button
                  onClick={() => {
                    setFormData({});
                    onClose();
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {getIcon()}
            {isEditing ? 'Edit' : 'Add'} {type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {getFormContent()}

        <button
          onClick={() => {
            if (isEditing) {
              updateItem(tripId, type, editItem.id, formData);
            } else {
              addItem(tripId, type, formData);
            }
            setFormData({});
            onClose();
          }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {isEditing ? 'Save Changes' : 'Add to Trip'}
        </button>
      </div>
    </div>
  );
});

export default function TripPlanner() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Main section navigation
  const [activeSection, setActiveSection] = useState('travel'); // 'travel' | 'fitness' | 'nutrition' | 'lifePlanning'

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
  const [isOwner, setIsOwner] = useState(false); // true if Mike or Adam
  const [bouncingEmoji, setBouncingEmoji] = useState(null); // { emoji, x, y, dx, dy } for bouncing animation

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

  // Generate training weeks from startDate to endDate
  const generateTrainingWeeks = (startDate, eventDate, eventId) => {
    const weeks = [];
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(eventDate);

    // Start from the Monday of the start week
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
          { id: 1, day: 'Tuesday', distance: '', type: 'easy', completed: false, notes: '' },
          { id: 2, day: 'Thursday', distance: '', type: 'tempo', completed: false, notes: '' },
          { id: 3, day: 'Saturday', distance: '', type: 'long', completed: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, day: 'Wednesday', type: 'strength', duration: '', completed: false, notes: '' },
          { id: 2, day: 'Sunday', type: 'yoga/stretch', duration: '', completed: false, notes: '' }
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
          { id: 1, day: 'Tuesday', distance: '', type: 'recovery', completed: false, notes: '' },
          { id: 2, day: 'Saturday', distance: '', type: 'easy', completed: false, notes: '' }
        ],
        crossTraining: [
          { id: 1, day: 'Thursday', type: 'light activity', duration: '', completed: false, notes: '' }
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

  // Owner emails - Mike and Adam are the owners
  const ownerEmails = ['mdulin@gmail.com', 'adamjosephbritten@gmail.com'];

  // Auth effect - listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
        } else {
          // Check if user is a companion
          const matchedCompanion = companions.find(c =>
            c.email?.toLowerCase() === userEmail
          );

          if (matchedCompanion) {
            setCurrentCompanion(matchedCompanion);
            setCurrentUser(matchedCompanion.firstName || matchedCompanion.name);
          } else {
            // Unknown user - treat as guest
            setCurrentUser(firebaseUser.displayName || 'Guest');
            setCurrentCompanion(null);
          }
        }
      } else {
        setUser(null);
        setCurrentCompanion(null);
        setIsOwner(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [companions]);

  // Rotate travel quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % travelQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Bouncing emoji animation
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
  }, [bouncingEmoji]);

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

    return () => {
      tripsUnsubscribe();
      fitnessUnsubscribe();
    };
  }, [user]);

  // Compute visible open dates based on user role
  const visibleOpenDates = isOwner
    ? openDates // Owners see all dates
    : openDates.filter(od =>
        od.visibleTo.includes('all') ||
        (currentCompanion && od.visibleTo.includes(currentCompanion.id))
      );

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

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (week.id !== weekId) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      return { ...week, [workoutType]: updatedWorkouts };
    });

    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);
  };

  // Initialize training plan for an event
  const initializeTrainingPlan = async (eventId) => {
    const event = fitnessEvents.find(e => e.id === eventId);
    if (!event) return;

    const today = new Date().toISOString().split('T')[0];
    const weeks = generateTrainingWeeks(today, event.date, eventId);

    const newPlans = { ...fitnessTrainingPlans, [eventId]: weeks };
    setFitnessTrainingPlans(newPlans);
    await saveFitnessToFirestore(null, newPlans);
  };

  // Handle redirect result on page load (for Safari/iOS compatibility)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in successfully via redirect
          console.log('Redirect sign-in successful');
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });
  }, []);

  // Auth handlers - try popup first, fall back to redirect for Safari/iOS
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      // Try popup first (works on most browsers)
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.log('Popup blocked or failed, trying redirect...', error.code);
      // If popup fails (Safari blocks it), use redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('Redirect login error:', redirectError);
          setAuthLoading(false);
        }
      } else {
        console.error('Login error:', error);
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

  // Sort trips by start date
  const sortedTrips = [...trips].sort((a, b) =>
    parseLocalDate(a.dates.start) - parseLocalDate(b.dates.start)
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
      const start = parseLocalDate(trip.dates.start);
      const end = parseLocalDate(trip.dates.end);
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

  const updateItem = (tripId, type, itemId, updatedData) => {
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
                onChange={(e) => updateField('notes', e.target.value)}
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

  // Random Experience Modal Component
  const RandomExperienceModal = ({ onClose }) => {
    const [filters, setFilters] = useState({ type: 'any', vibes: [], bougie: 0 });
    const [experience, setExperience] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const toggleVibe = (vibe) => {
      setFilters(prev => ({
        ...prev,
        vibes: prev.vibes.includes(vibe)
          ? prev.vibes.filter(v => v !== vibe)
          : [...prev.vibes, vibe]
      }));
    };

    const generateExperience = () => {
      setIsSpinning(true);
      setExperience(null);

      // Animate through a few options before landing
      let count = 0;
      const interval = setInterval(() => {
        const randomExp = getRandomExperience(filters.type, filters.vibes, filters.bougie);
        setExperience(randomExp);
        count++;
        if (count >= 8) {
          clearInterval(interval);
          setIsSpinning(false);
        }
      }, 150);
    };

    const addToWishlist = () => {
      if (!experience) return;
      const colorSet = tripColors[Math.floor(Math.random() * tripColors.length)];
      const newWishlistItem = {
        id: Date.now(),
        destination: experience.destination,
        emoji: experience.emoji,
        ...colorSet,
        isWishlist: true,
        notes: `${experience.typeLabel} • ${experience.description}`
      };
      const newWishlist = [...wishlist, newWishlistItem];
      setWishlist(newWishlist);
      saveToFirestore(null, newWishlist, null);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          <div className="flex justify-between items-center mb-6 mt-2">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              🎲 Random Adventure Generator
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trip Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">Adventure Type</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'any', label: '🎲', title: 'Any' },
                { value: 'dayTrip', label: '🚗', title: 'Day Trip' },
                { value: 'train', label: '🚂', title: 'Train' },
                { value: 'cruise', label: '🚢', title: 'Cruise' },
                { value: 'flight', label: '✈️', title: 'Flight' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 rounded-xl text-center transition ${
                    filters.type === type.value
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <div className="text-2xl">{type.label}</div>
                  <div className="text-xs mt-1">{type.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Vibe Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">Vibes (select any)</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleVibe('gay')}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  filters.vibes.includes('gay')
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                🏳️‍🌈 Gay-Friendly
              </button>
              <button
                onClick={() => toggleVibe('artsy')}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  filters.vibes.includes('artsy')
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                🎨 Artsy
              </button>
              <button
                onClick={() => toggleVibe('glutenFree')}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  filters.vibes.includes('glutenFree')
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                🌾 Gluten-Free Friendly
              </button>
            </div>
          </div>

          {/* Bougie Level Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Bougie Level {filters.bougie > 0 && <span className="text-purple-500">({bougieLabels[filters.bougie - 1]?.label})</span>}
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setFilters(prev => ({ ...prev, bougie: 0 }))}
                className={`flex-1 py-2 px-2 rounded-l-xl text-center transition text-sm ${
                  filters.bougie === 0
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Any
              </button>
              {bougieLabels.map((b) => (
                <button
                  key={b.level}
                  onClick={() => setFilters(prev => ({ ...prev, bougie: b.level }))}
                  className={`flex-1 py-2 px-1 text-center transition ${
                    b.level === bougieLabels.length ? 'rounded-r-xl' : ''
                  } ${
                    filters.bougie === b.level
                      ? b.level <= 2 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
                        : b.level === 3 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                        : b.level === 4 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={b.description}
                >
                  <div className="text-lg">{b.emoji}</div>
                  <div className="text-xs hidden md:block">{b.level}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
              <span>Budget-friendly</span>
              <span>Ultra-luxury</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateExperience}
            disabled={isSpinning}
            className={`w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 ${isSpinning ? 'animate-pulse' : ''}`}
          >
            {isSpinning ? (
              <>
                <span className="animate-spin">🎲</span>
                Finding your adventure...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {experience ? 'Spin Again!' : 'Generate Adventure!'}
              </>
            )}
          </button>

          {/* Result */}
          {experience && !isSpinning && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl p-5 text-white relative overflow-hidden">
                <Starburst className="absolute -right-8 -bottom-8 w-32 h-32 text-white/10" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{experience.typeLabel}</span>
                        {experience.bougie && (
                          <span className="text-xs bg-gradient-to-r from-yellow-400/30 to-amber-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                            {bougieLabels[experience.bougie - 1]?.emoji} {bougieLabels[experience.bougie - 1]?.label}
                          </span>
                        )}
                      </div>
                      <h4 className="text-2xl font-bold mt-2 flex items-center gap-2">
                        <span className="text-3xl">{experience.emoji}</span>
                        {experience.destination}
                      </h4>
                    </div>
                  </div>
                  <p className="opacity-90 mb-3">{experience.description}</p>
                  {experience.distance && (
                    <p className="text-sm opacity-80">📍 {experience.distance} from Greensboro</p>
                  )}
                  {experience.duration && (
                    <p className="text-sm opacity-80">⏱️ {experience.duration}</p>
                  )}
                  {experience.highlights && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Highlights:</p>
                      <div className="flex flex-wrap gap-1">
                        {experience.highlights.map((h, i) => (
                          <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded-full">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {experience.ports && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Ports of Call:</p>
                      <p className="text-sm opacity-80">{experience.ports.join(' → ')}</p>
                    </div>
                  )}
                  {experience.vibes && (
                    <div className="mt-3 flex gap-1">
                      {experience.vibes.includes('gay') && <span className="text-lg">🏳️‍🌈</span>}
                      {experience.vibes.includes('artsy') && <span className="text-lg">🎨</span>}
                      {experience.vibes.includes('glutenFree') && <span className="text-lg">🌾</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={addToWishlist}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Add to Wishlist
                </button>
                <button
                  onClick={() => {
                    setShowNewTripModal('adventure');
                    onClose();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book It Now!
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-4">
            ✨ {filters.vibes.length === 0 && filters.bougie === 0
              ? 'Select vibes or bougie level to narrow options!'
              : `Filtering: ${[
                  ...filters.vibes,
                  filters.bougie > 0 ? bougieLabels[filters.bougie - 1]?.label : ''
                ].filter(Boolean).join(', ')}`
            }
          </p>
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

  // Guest Modal Component
  const GuestModal = ({ trip, onClose }) => {
    const [guestData, setGuestData] = useState({ name: '', email: '', relationship: '' });
    const tripGuests = trip.guests || [];

    const handleAddGuest = () => {
      if (guestData.name && guestData.email) {
        const newGuest = {
          id: Date.now(),
          name: guestData.name,
          email: guestData.email,
          relationship: guestData.relationship || 'Friend',
          role: 'guest',
          addedBy: 'Mike' // In production, this would be the current user
        };

        // Update the trip with new guest
        setTrips(prevTrips => prevTrips.map(t =>
          t.id === trip.id
            ? { ...t, guests: [...(t.guests || []), newGuest] }
            : t
        ));

        setGuestData({ name: '', email: '', relationship: '' });
      }
    };

    const handleRemoveGuest = (guestId) => {
      setTrips(prevTrips => prevTrips.map(t =>
        t.id === trip.id
          ? { ...t, guests: (t.guests || []).filter(g => g.id !== guestId) }
          : t
      ));
    };

    const relationshipOptions = ['Son', 'Daughter', 'Friend', 'Family', 'Partner', 'Colleague'];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              Trip Guests
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Owners Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">✨ Trip Owners</h4>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
                <span className="font-medium text-slate-700">Mike</span>
                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
                <span className="font-medium text-slate-700">Adam</span>
                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
              </div>
            </div>
          </div>

          {/* Current Guests */}
          {tripGuests.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">👥 Invited Guests ({tripGuests.length})</h4>
              <div className="space-y-2">
                {tripGuests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{guest.name}</div>
                        <div className="text-sm text-slate-500">{guest.relationship || 'Guest'} • Added by {guest.addedBy}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveGuest(guest.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      title="Remove guest"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Guest */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">➕ Invite Someone</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={guestData.name}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={guestData.email}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Relationship</label>
                <div className="flex flex-wrap gap-2">
                  {relationshipOptions.map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setGuestData({ ...guestData, relationship: rel })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        guestData.relationship === rel
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddGuest}
                disabled={!guestData.name || !guestData.email}
                className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Guest to Trip
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Only Mike & Adam can add/remove guests. Guests can view trip details but cannot make changes.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Open Date Modal Component
  const OpenDateModal = ({ onClose }) => {
    const [dateData, setDateData] = useState({ start: '', end: '', note: '', visibleTo: ['all'] });
    const [editingId, setEditingId] = useState(null);

    const handleAddDate = () => {
      if (dateData.start && dateData.end) {
        if (editingId) {
          setOpenDates(prev => prev.map(d =>
            d.id === editingId ? { ...d, ...dateData } : d
          ));
          setEditingId(null);
        } else {
          setOpenDates(prev => [...prev, { id: Date.now(), ...dateData }]);
        }
        setDateData({ start: '', end: '', note: '', visibleTo: ['all'] });
      }
    };

    const handleEdit = (date) => {
      setEditingId(date.id);
      setDateData({ start: date.start, end: date.end, note: date.note || '', visibleTo: date.visibleTo || ['all'] });
    };

    const handleDelete = (id) => {
      setOpenDates(prev => prev.filter(d => d.id !== id));
    };

    const toggleCompanion = (companionId) => {
      if (dateData.visibleTo.includes('all')) {
        // Switching from 'all' to specific - start with just this companion
        setDateData({ ...dateData, visibleTo: [companionId] });
      } else if (dateData.visibleTo.includes(companionId)) {
        const newVisibleTo = dateData.visibleTo.filter(id => id !== companionId);
        setDateData({ ...dateData, visibleTo: newVisibleTo.length === 0 ? ['all'] : newVisibleTo });
      } else {
        setDateData({ ...dateData, visibleTo: [...dateData.visibleTo, companionId] });
      }
    };

    const setAllVisible = () => {
      setDateData({ ...dateData, visibleTo: ['all'] });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-500" />
              Open for Travel
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Open Dates */}
          {openDates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">📅 Your Available Dates</h4>
              <div className="space-y-2">
                {openDates.map(date => (
                  <div key={date.id} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
                    <div>
                      <div className="font-medium text-slate-800">
                        {new Date(date.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(date.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {date.note && <div className="text-sm text-slate-500">{date.note}</div>}
                      <div className="text-xs text-green-600 mt-1">
                        👁️ {date.visibleTo.includes('all') ? 'Everyone' : date.visibleTo.map(id => companions.find(c => c.id === id)?.firstName || companions.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(date)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(date.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Open Date */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {editingId ? '✏️ Edit Date' : '➕ Add Available Dates'}
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateData.start}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-400 outline-none"
                    onChange={(e) => setDateData({ ...dateData, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateData.end}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-400 outline-none"
                    onChange={(e) => setDateData({ ...dateData, end: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Long weekend, Holiday, etc."
                  value={dateData.note}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-400 outline-none"
                  onChange={(e) => setDateData({ ...dateData, note: e.target.value })}
                />
              </div>

              {/* Visibility Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Who can see this?</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={setAllVisible}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      dateData.visibleTo.includes('all')
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    👥 Everyone
                  </button>
                  {companions.map(companion => (
                    <button
                      key={companion.id}
                      type="button"
                      onClick={() => toggleCompanion(companion.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        !dateData.visibleTo.includes('all') && dateData.visibleTo.includes(companion.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {companion.firstName || companion.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddDate}
                disabled={!dateData.start || !dateData.end}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                {editingId ? 'Update Date' : 'Add Available Date'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setDateData({ start: '', end: '', note: '', visibleTo: ['all'] });
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Companions Modal Component
  const CompanionsModal = ({ onClose }) => {
    const [companionData, setCompanionData] = useState({ firstName: '', lastName: '', email: '', phone: '', relationship: 'Friend' });
    const [editingId, setEditingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const handleAddCompanion = () => {
      if (companionData.firstName && companionData.email) {
        const colors = [
          'from-pink-400 to-rose-500',
          'from-blue-400 to-indigo-500',
          'from-green-400 to-emerald-500',
          'from-amber-400 to-orange-500',
          'from-purple-400 to-violet-500',
          'from-cyan-400 to-teal-500',
          'from-red-400 to-pink-500',
        ];

        if (editingId) {
          // Update existing companion
          setCompanions(prev => prev.map(c =>
            c.id === editingId
              ? { ...c, ...companionData }
              : c
          ));
          setEditingId(null);
        } else {
          // Add new companion
          const newCompanion = {
            id: companionData.firstName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            firstName: companionData.firstName,
            lastName: companionData.lastName,
            email: companionData.email,
            phone: companionData.phone,
            relationship: companionData.relationship,
            color: colors[companions.length % colors.length],
          };
          setCompanions(prev => [...prev, newCompanion]);
        }
        setCompanionData({ firstName: '', lastName: '', email: '', phone: '', relationship: 'Friend' });
      }
    };

    const handleEditCompanion = (companion) => {
      setEditingId(companion.id);
      setCompanionData({
        firstName: companion.firstName || companion.name || '',
        lastName: companion.lastName || '',
        email: companion.email || '',
        phone: companion.phone || '',
        relationship: companion.relationship || 'Friend',
      });
    };

    const handleRemoveCompanion = (id) => {
      setCompanions(prev => prev.filter(c => c.id !== id));
      // Also remove from any open dates visibility
      setOpenDates(prev => prev.map(d => ({
        ...d,
        visibleTo: d.visibleTo.filter(v => v !== id)
      })));
      if (editingId === id) {
        setEditingId(null);
        setCompanionData({ firstName: '', lastName: '', email: '', phone: '', relationship: 'Friend' });
      }
    };

    const relationshipOptions = ['Friend', 'Brother', 'Sister', 'Cousin', 'Son', 'Daughter', 'Parent', 'Partner', 'Colleague'];

    const getDisplayName = (companion) => {
      if (companion.firstName && companion.lastName) {
        return `${companion.firstName} ${companion.lastName}`;
      }
      return companion.firstName || companion.name || 'Unknown';
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              Travel Companions
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-slate-600 mb-6">
            These are people you regularly travel with. They can see your calendar and available dates you share with them. Click on a companion to view or edit their details.
          </p>

          {/* Current Companions */}
          {companions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">👥 Your Travel Circle ({companions.length})</h4>
              <div className="space-y-2">
                {companions.map(companion => (
                  <div key={companion.id} className="bg-slate-50 rounded-xl overflow-hidden">
                    {/* Companion Header - Always Visible */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => setExpandedId(expandedId === companion.id ? null : companion.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${companion.color} rounded-full flex items-center justify-center text-white font-bold`}>
                          {(companion.firstName || companion.name || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{getDisplayName(companion)}</div>
                          <div className="text-sm text-slate-500">{companion.relationship}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === companion.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === companion.id && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 w-20">Email:</span>
                            <span className="text-slate-700">{companion.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 w-20">Phone:</span>
                            <span className="text-slate-700">{companion.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 w-20">Last Name:</span>
                            <span className="text-slate-700">{companion.lastName || '—'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCompanion(companion);
                            }}
                            className="flex-1 py-2 bg-purple-100 text-purple-600 rounded-lg font-medium hover:bg-purple-200 transition flex items-center justify-center gap-1"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCompanion(companion.id);
                            }}
                            className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Companion Form */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {editingId ? '✏️ Edit Companion' : '➕ Add Someone'}
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={companionData.firstName}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setCompanionData({ ...companionData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={companionData.lastName}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setCompanionData({ ...companionData, lastName: e.target.value })}
                />
              </div>
              <input
                type="email"
                placeholder="Email *"
                value={companionData.email}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setCompanionData({ ...companionData, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={companionData.phone}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setCompanionData({ ...companionData, phone: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Relationship</label>
                <div className="flex flex-wrap gap-2">
                  {relationshipOptions.map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setCompanionData({ ...companionData, relationship: rel })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        companionData.relationship === rel
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddCompanion}
                disabled={!companionData.firstName || !companionData.email}
                className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {editingId ? 'Save Changes' : 'Add to Travel Circle'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setCompanionData({ firstName: '', lastName: '', email: '', phone: '', relationship: 'Friend' });
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // My Profile Modal - For companions to edit their own details
  const MyProfileModal = ({ onClose }) => {
    const [profileData, setProfileData] = useState({
      firstName: currentCompanion?.firstName || currentCompanion?.name || '',
      lastName: currentCompanion?.lastName || '',
      email: currentCompanion?.email || '',
      phone: currentCompanion?.phone || '',
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
      if (currentCompanion) {
        setCompanions(prev => prev.map(c =>
          c.id === currentCompanion.id
            ? { ...c, ...profileData }
            : c
        ));
        // Update currentCompanion state
        setCurrentCompanion(prev => ({ ...prev, ...profileData }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-500" />
              My Profile
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 bg-gradient-to-r ${currentCompanion?.color || 'from-purple-400 to-indigo-500'} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
              {(profileData.firstName || '?').charAt(0)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed (linked to your Google account)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            {/* Relationship (read-only for companions) */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Relationship</label>
              <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-600">
                {currentCompanion?.relationship || 'Guest'}
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-3 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:opacity-90'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>

          {/* Info about what companions can see */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>As a travel companion,</strong> you can view shared trips and open travel dates. Mike & Adam control trip details and sharing permissions.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Trip Detail View
  const TripDetail = ({ trip }) => {
    const details = tripDetails[trip.id] || { flights: [], hotels: [], events: [], links: [] };

    // Use parent-level state for date editing to prevent reset on re-renders
    const isEditingDates = editingTripDates?.tripId === trip.id;
    const editedStart = editingTripDates?.start || trip.dates.start;
    const editedEnd = editingTripDates?.end || trip.dates.end;

    const handleStartEditDates = () => {
      setEditingTripDates({ tripId: trip.id, start: trip.dates.start, end: trip.dates.end });
    };

    const handleCancelEditDates = () => {
      setEditingTripDates(null);
    };

    const handleSaveDates = async () => {
      const updatedTrip = await updateTripDates(trip.id, editedStart, editedEnd);
      if (updatedTrip) {
        setSelectedTrip(updatedTrip);
      }
      setEditingTripDates(null);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 z-40 overflow-auto">
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${trip.color} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-6`}>
              <AtomicDots />
              <div className="absolute top-4 right-4 flex gap-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setShowGuestModal(trip.id)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                      title="Manage guests"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => isEditingDates ? handleCancelEditDates() : handleStartEditDates()}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                      title="Edit dates"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-6xl mb-4">{trip.emoji}</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>

              {/* Guest Avatars */}
              {trip.guests && trip.guests.length > 0 && (
                <div className="flex items-center gap-2 mt-3 mb-2">
                  <span className="text-white/80 text-sm">Traveling with:</span>
                  <div className="flex -space-x-2">
                    {trip.guests.slice(0, 5).map((guest, idx) => (
                      <div
                        key={guest.id}
                        className="w-8 h-8 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/50"
                        title={guest.name}
                      >
                        {guest.name.charAt(0)}
                      </div>
                    ))}
                    {trip.guests.length > 5 && (
                      <div className="w-8 h-8 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/50">
                        +{trip.guests.length - 5}
                      </div>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setShowGuestModal(trip.id)}
                      className="ml-2 text-white/80 hover:text-white text-sm underline"
                    >
                      Manage
                    </button>
                  )}
                </div>
              )}

              {isEditingDates ? (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <input
                    type="date"
                    value={editedStart}
                    onChange={(e) => setEditingTripDates(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  />
                  <span className="text-white/80">to</span>
                  <input
                    type="date"
                    value={editedEnd}
                    onChange={(e) => setEditingTripDates(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
                  />
                  <button
                    onClick={handleSaveDates}
                    className="flex items-center gap-1 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-lg font-medium transition"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditDates}
                    className="flex items-center gap-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-xl opacity-90">
                  {formatDate(trip.dates.start)} - {formatDate(trip.dates.end, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                    onClick={() => setShowAddModal({ type, tripId: trip.id })}
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
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800">
                            {type === 'flights' && (item.airline && item.flightNo ? `${item.airline} ${item.flightNo}` : item.flightNo || 'Flight')}
                            {type === 'hotels' && (item.name || 'Hotel')}
                            {type === 'events' && (item.name || 'Event')}
                          </div>
                          <div className="text-sm text-slate-500">
                            {type === 'flights' && (
                              <>
                                {item.date && <span>{item.date}</span>}
                                {item.date && (item.depart || item.arrive) && ' • '}
                                {(item.depart || item.arrive) && <span>{item.depart || '?'} → {item.arrive || '?'}</span>}
                                {item.departTime && <span> ({item.departTime})</span>}
                              </>
                            )}
                            {type === 'hotels' && (
                              <>
                                {(item.checkIn || item.checkOut) && <span>{item.checkIn || '?'} - {item.checkOut || '?'}</span>}
                                {item.address && <span> • {item.address}</span>}
                              </>
                            )}
                            {type === 'events' && (
                              <>
                                {item.date && <span>{item.date}</span>}
                                {item.time && <span> at {item.time}</span>}
                                {item.venue && <span> • {item.venue}</span>}
                              </>
                            )}
                          </div>
                          {item.confirmation && (
                            <div className="text-xs text-slate-400">Conf: {item.confirmation}</div>
                          )}
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Added by {item.addedBy}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setShowAddModal({ type, tripId: trip.id, editItem: item })}
                            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(trip.id, type, item.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-full transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
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

            {/* Packing List Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧳</span>
                  <h3 className="text-2xl font-bold text-slate-800">Packing List</h3>
                  {details.packingList?.length > 0 && (
                    <span className="text-sm text-slate-500">
                      ({details.packingList.filter(i => i.packed).length}/{details.packingList.length} packed)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const item = prompt('Add item to packing list:');
                    if (item) {
                      const newItem = { id: Date.now(), item, packed: false, addedBy: currentUser };
                      const newPackingList = [...(details.packingList || []), newItem];
                      const newDetails = { ...tripDetails, [trip.id]: { ...details, packingList: newPackingList } };
                      setTripDetails(newDetails);
                      saveToFirestore(null, null, newDetails);
                    }
                  }}
                  className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(!details.packingList || details.packingList.length === 0) ? (
                <p className="text-slate-400 italic">No items yet. Start your packing list!</p>
              ) : (
                <div className="space-y-2">
                  {details.packingList.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${item.packed ? 'bg-green-50' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const newPackingList = details.packingList.map(i =>
                              i.id === item.id ? { ...i, packed: !i.packed } : i
                            );
                            const newDetails = { ...tripDetails, [trip.id]: { ...details, packingList: newPackingList } };
                            setTripDetails(newDetails);
                            saveToFirestore(null, null, newDetails);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                            item.packed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-400'
                          }`}
                        >
                          {item.packed && <Check className="w-4 h-4" />}
                        </button>
                        <span className={item.packed ? 'line-through text-slate-400' : 'text-slate-700'}>{item.item}</span>
                      </div>
                      <span className="text-xs text-slate-400">{item.addedBy}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Tracker Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-2xl font-bold text-slate-800">Budget</h3>
                </div>
                <button
                  onClick={() => {
                    const desc = prompt('Expense description:');
                    if (!desc) return;
                    const amount = parseFloat(prompt('Amount ($):') || '0');
                    if (!amount) return;
                    const paidBy = prompt('Paid by (Mike/Adam):', currentUser) || currentUser;
                    const newExpense = { id: Date.now(), description: desc, amount, paidBy, category: 'other' };
                    const newBudget = {
                      ...details.budget,
                      expenses: [...(details.budget?.expenses || []), newExpense]
                    };
                    const newDetails = { ...tripDetails, [trip.id]: { ...details, budget: newBudget } };
                    setTripDetails(newDetails);
                    saveToFirestore(null, null, newDetails);
                  }}
                  className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const expenses = details.budget?.expenses || [];
                const total = expenses.reduce((sum, e) => sum + e.amount, 0);
                const mikeTotal = expenses.filter(e => e.paidBy === 'Mike').reduce((sum, e) => sum + e.amount, 0);
                const adamTotal = expenses.filter(e => e.paidBy === 'Adam').reduce((sum, e) => sum + e.amount, 0);
                const difference = mikeTotal - adamTotal;

                return (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-slate-800">${total.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                      <div className="bg-teal-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-teal-600">${mikeTotal.toFixed(0)}</div>
                        <div className="text-xs text-teal-600">Mike paid</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">${adamTotal.toFixed(0)}</div>
                        <div className="text-xs text-purple-600">Adam paid</div>
                      </div>
                    </div>
                    {difference !== 0 && (
                      <div className="bg-amber-50 rounded-xl p-3 text-center mb-4">
                        <span className="text-amber-700 font-medium">
                          {difference > 0 ? 'Adam' : 'Mike'} owes {difference > 0 ? 'Mike' : 'Adam'} ${Math.abs(difference / 2).toFixed(0)} to split evenly 💕
                        </span>
                      </div>
                    )}
                    {expenses.length > 0 && (
                      <div className="space-y-2">
                        {expenses.map(exp => (
                          <div key={exp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-700">{exp.description}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${exp.paidBy === 'Mike' ? 'text-teal-600' : 'text-purple-600'}`}>
                                ${exp.amount} ({exp.paidBy})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Places to Visit Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-rose-500" />
                  <h3 className="text-2xl font-bold text-slate-800">Places to Visit</h3>
                </div>
                <button
                  onClick={() => {
                    const name = prompt('Place name:');
                    if (!name) return;
                    const type = prompt('Type (restaurant/activity/bar/shop):', 'restaurant') || 'restaurant';
                    const newPlace = { id: Date.now(), name, type, addedBy: currentUser, visited: false };
                    const newPlaces = [...(details.places || []), newPlace];
                    const newDetails = { ...tripDetails, [trip.id]: { ...details, places: newPlaces } };
                    setTripDetails(newDetails);
                    saveToFirestore(null, null, newDetails);
                  }}
                  className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(!details.places || details.places.length === 0) ? (
                <p className="text-slate-400 italic">Save restaurants, bars, and activities you want to try!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {details.places.map(place => (
                    <div
                      key={place.id}
                      className={`p-3 rounded-xl flex items-center justify-between transition ${place.visited ? 'bg-green-50' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {place.type === 'restaurant' ? '🍽️' : place.type === 'bar' ? '🍸' : place.type === 'shop' ? '🛍️' : '🎯'}
                        </span>
                        <div>
                          <div className={`font-medium ${place.visited ? 'text-green-700 line-through' : 'text-slate-700'}`}>{place.name}</div>
                          <div className="text-xs text-slate-400">{place.addedBy}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newPlaces = details.places.map(p =>
                            p.id === place.id ? { ...p, visited: !p.visited } : p
                          );
                          const newDetails = { ...tripDetails, [trip.id]: { ...details, places: newPlaces } };
                          setTripDetails(newDetails);
                          saveToFirestore(null, null, newDetails);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          place.visited ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-600 hover:bg-green-200'
                        }`}
                      >
                        {place.visited ? '✓ Visited' : 'Mark visited'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photo Memories Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📸</span>
                  <h3 className="text-2xl font-bold text-slate-800">Photo Memories</h3>
                </div>
                <button
                  onClick={() => {
                    const url = prompt('Photo URL:');
                    if (!url) return;
                    const caption = prompt('Caption (optional):') || '';
                    const newPhoto = { id: Date.now(), url, caption, addedBy: currentUser };
                    const newPhotos = [...(details.photos || []), newPhoto];
                    const newDetails = { ...tripDetails, [trip.id]: { ...details, photos: newPhotos } };
                    setTripDetails(newDetails);
                    saveToFirestore(null, null, newDetails);
                  }}
                  className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(!details.photos || details.photos.length === 0) ? (
                <p className="text-slate-400 italic">Add photos from your trip! Paste image URLs to save memories.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {details.photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-xl" />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-xl">
                          {photo.caption}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const newPhotos = details.photos.filter(p => p.id !== photo.id);
                          const newDetails = { ...tripDetails, [trip.id]: { ...details, photos: newPhotos } };
                          setTripDetails(newDetails);
                          saveToFirestore(null, null, newDetails);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Notes Section */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-2xl font-bold text-slate-800">Shared Notes</h3>
              </div>
              <textarea
                value={details.notes || ''}
                onChange={(e) => {
                  const newDetails = { ...tripDetails, [trip.id]: { ...details, notes: e.target.value } };
                  setTripDetails(newDetails);
                }}
                onBlur={() => saveToFirestore(null, null, tripDetails)}
                placeholder="Add notes, reminders, or ideas for this trip... 💭"
                className="w-full h-32 p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-purple-300 outline-none resize-none text-slate-700"
              />
            </div>
          </div>
        </div>
                {showLinkModal === trip.id && <LinkModal tripId={trip.id} onClose={() => setShowLinkModal(null)} />}
        {showGuestModal === trip.id && <GuestModal trip={trip} onClose={() => setShowGuestModal(null)} />}
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
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5.5s' }} />

        {/* Starbursts */}
        <Starburst className="absolute top-10 right-20 w-24 h-24 text-cyan-400" animated={true} />
        <Starburst className="absolute bottom-40 left-20 w-16 h-16 text-teal-400/30" />
        <Starburst className="absolute top-2/3 right-1/3 w-20 h-20 text-purple-400/20" animated={true} />
        <Sun className="absolute bottom-20 left-40 w-16 h-16 text-purple-400/10" />

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
          .float { animation: float 6s ease-in-out infinite; }
          .float-slow { animation: floatSlow 8s ease-in-out infinite; }
          .twinkle { animation: twinkle 3s ease-in-out infinite; }
        `}</style>

        <span className="absolute top-32 left-1/4 text-4xl opacity-10 float">🦄</span>
        <span className="absolute bottom-48 right-1/3 text-3xl opacity-10 float-slow" style={{ animationDelay: '1s' }}>🌈</span>
        <span className="absolute top-1/2 right-20 text-2xl twinkle">✨</span>
        <span className="absolute top-20 left-1/2 text-2xl opacity-10 float" style={{ animationDelay: '2s' }}>✈️</span>
        <span className="absolute bottom-32 left-1/3 text-3xl opacity-10 float-slow" style={{ animationDelay: '0.5s' }}>🌴</span>
        <span className="absolute top-1/3 left-16 text-2xl twinkle" style={{ animationDelay: '1.5s' }}>⭐</span>
        <span className="absolute bottom-1/4 right-1/4 text-2xl opacity-10 float" style={{ animationDelay: '3s' }}>🗺️</span>
        <span className="absolute top-3/4 right-16 text-xl twinkle" style={{ animationDelay: '2.5s' }}>💫</span>
        <span className="absolute top-16 right-1/3 text-2xl opacity-10 float-slow" style={{ animationDelay: '1s' }}>🏖️</span>

        {/* Shooting star (occasional) */}
        <div className="absolute top-10 left-10">
          <span className="text-xl" style={{ animation: 'shooting 4s ease-out infinite', animationDelay: '5s' }}>💫</span>
        </div>

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newClicks = easterEggClicks + 1;
                  setEasterEggClicks(newClicks);
                  if (newClicks >= 7) {
                    setShowDisneyMagic(true);
                    setEasterEggClicks(0);
                    // Auto-hide after 10 seconds
                    setTimeout(() => setShowDisneyMagic(false), 10000);
                  }
                }}
                className={`w-16 h-16 bg-gradient-to-br from-teal-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg relative transition-transform hover:scale-110 ${showDisneyMagic ? 'animate-bounce' : ''}`}
                title={easterEggClicks > 2 ? `${7 - easterEggClicks} more...` : 'Trip Planner'}
              >
                <span className="text-3xl">{showDisneyMagic ? '🏰' : '🦄'}</span>
                {showDisneyMagic && (
                  <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
                )}
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {showDisneyMagic ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500">
                      ✨ Where Dreams Come True ✨
                    </span>
                  ) : (
                    <>
                      Bon Voyage! <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">✈️</span>
                    </>
                  )}
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
                  className="ml-1 p-1 text-white/50 hover:text-white transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* User Toggle - Only for owners (Mike & Adam) */}
              {isOwner && (
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
              )}

              {/* Companion badge */}
              {currentCompanion && !isOwner && (
                <div className="flex items-center bg-amber-500/20 rounded-full px-3 py-1.5">
                  <span className="text-amber-300 text-sm">👋 Welcome, {currentCompanion.firstName || currentCompanion.name}!</span>
                </div>
              )}

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

          {/* Section Navigation */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {[
              { id: 'travel', label: 'Travel', emoji: '✈️', gradient: 'from-teal-400 to-cyan-500' },
              { id: 'fitness', label: 'Fitness', emoji: '🏃', gradient: 'from-orange-400 to-red-500' },
              { id: 'nutrition', label: 'Nutrition', emoji: '🥗', gradient: 'from-green-400 to-emerald-500' },
              { id: 'lifePlanning', label: 'Life Planning', emoji: '🎯', gradient: 'from-purple-400 to-indigo-500' },
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
                  onClick={() => setShowNewTripModal('wishlist')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Add to Wishlist 🦄
                </button>
              </>
            )}
            <button
              onClick={() => setShowRandomExperience(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg animate-pulse hover:animate-none"
            >
              🎲 Random Experience
            </button>
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
                        className={`bg-gradient-to-r ${trip.color} rounded-xl p-3 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{trip.emoji}</span>
                          <div className="text-white">
                            <div className="font-bold">{trip.destination}</div>
                            <div className="text-sm opacity-80">
                              {formatDate(trip.dates.start)} - {formatDate(trip.dates.end)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white text-right">
                          {isPast ? (
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
                      <div className={`bg-gradient-to-br ${tripOnDate.color} rounded-lg p-1.5 h-[calc(100%-20px)] flex flex-col justify-between overflow-hidden shadow-md hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center gap-1">
                          <span className="text-sm md:text-base">{tripOnDate.emoji}</span>
                          <span className="text-xs font-semibold text-white truncate hidden md:block">
                            {tripOnDate.destination}
                          </span>
                        </div>
                        {tripOnDate.special && isStartDay && (
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
                        <div className={`bg-gradient-to-br ${tripOnDate.color} rounded-xl p-3 shadow-2xl min-w-[200px] text-white`}>
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
                          {tripOnDate.special && (
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
                          👁️ {od.visibleTo.map(id => companions.find(c => c.id === id)?.firstName || companions.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
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
                    const trainingPlan = fitnessTrainingPlans[event.id] || [];
                    const completedWorkouts = trainingPlan.reduce((acc, week) => {
                      const runsDone = week.runs?.filter(r => r.completed).length || 0;
                      const crossDone = week.crossTraining?.filter(c => c.completed).length || 0;
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
                          if (!fitnessTrainingPlans[event.id]) {
                            initializeTrainingPlan(event.id);
                          }
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
                          if (!fitnessTrainingPlans[event.id]) {
                            initializeTrainingPlan(event.id);
                          }
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

                  {selectedFitnessEvent && fitnessTrainingPlans[selectedFitnessEvent.id] && (
                    <div className="space-y-4">
                      {/* Current Week Highlight */}
                      {(() => {
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        const currentWeek = fitnessTrainingPlans[selectedFitnessEvent.id].find(
                          week => week.startDate <= todayStr && week.endDate >= todayStr
                        );
                        const currentWeekIndex = fitnessTrainingPlans[selectedFitnessEvent.id].findIndex(
                          week => week.startDate <= todayStr && week.endDate >= todayStr
                        );

                        if (currentWeek) {
                          return (
                            <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl p-6 border-2 border-orange-500/50 mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">📅</span>
                                <h3 className="text-xl font-bold text-white">This Week - Week {currentWeekIndex + 1}</h3>
                                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">CURRENT</span>
                              </div>

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
                                        className={`flex items-center gap-3 p-3 rounded-lg ${run.completed ? 'bg-green-500/20' : 'bg-white/5'}`}
                                      >
                                        <button
                                          onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { completed: !run.completed })}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                            run.completed ? 'bg-green-500 border-green-500' : 'border-white/40 hover:border-white'
                                          }`}
                                        >
                                          {run.completed && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">{run.day}</div>
                                          <div className="text-white/60 text-sm">{run.type} run</div>
                                        </div>
                                        <input
                                          type="text"
                                          value={run.distance}
                                          onChange={(e) => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'runs', run.id, { distance: e.target.value })}
                                          placeholder="Distance"
                                          className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                                        />
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
                                        className={`flex items-center gap-3 p-3 rounded-lg ${ct.completed ? 'bg-green-500/20' : 'bg-white/5'}`}
                                      >
                                        <button
                                          onClick={() => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { completed: !ct.completed })}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                                            ct.completed ? 'bg-green-500 border-green-500' : 'border-white/40 hover:border-white'
                                          }`}
                                        >
                                          {ct.completed && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">{ct.day}</div>
                                          <div className="text-white/60 text-sm">{ct.type}</div>
                                        </div>
                                        <input
                                          type="text"
                                          value={ct.duration}
                                          onChange={(e) => updateWorkout(selectedFitnessEvent.id, currentWeek.id, 'crossTraining', ct.id, { duration: e.target.value })}
                                          placeholder="Duration"
                                          className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm text-center"
                                        />
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
                        {fitnessTrainingPlans[selectedFitnessEvent.id].map((week, index) => {
                          const today = new Date();
                          const todayStr = today.toISOString().split('T')[0];
                          const isCurrent = week.startDate <= todayStr && week.endDate >= todayStr;
                          const isPast = week.endDate < todayStr;
                          const completedCount = (week.runs?.filter(r => r.completed).length || 0) + (week.crossTraining?.filter(c => c.completed).length || 0);
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
                                          className={`flex items-center gap-2 p-2 rounded ${run.completed ? 'bg-green-500/20' : 'bg-white/5'}`}
                                        >
                                          <button
                                            onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { completed: !run.completed })}
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                              run.completed ? 'bg-green-500 border-green-500' : 'border-white/40'
                                            }`}
                                          >
                                            {run.completed && <Check className="w-3 h-3 text-white" />}
                                          </button>
                                          <span className="text-white/80 text-sm flex-1">{run.day} - {run.type}</span>
                                          <input
                                            type="text"
                                            value={run.distance}
                                            onChange={(e) => updateWorkout(selectedFitnessEvent.id, week.id, 'runs', run.id, { distance: e.target.value })}
                                            placeholder="mi"
                                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center"
                                          />
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
                                          className={`flex items-center gap-2 p-2 rounded ${ct.completed ? 'bg-green-500/20' : 'bg-white/5'}`}
                                        >
                                          <button
                                            onClick={() => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { completed: !ct.completed })}
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                              ct.completed ? 'bg-green-500 border-green-500' : 'border-white/40'
                                            }`}
                                          >
                                            {ct.completed && <Check className="w-3 h-3 text-white" />}
                                          </button>
                                          <span className="text-white/80 text-sm flex-1">{ct.day} - {ct.type}</span>
                                          <input
                                            type="text"
                                            value={ct.duration}
                                            onChange={(e) => updateWorkout(selectedFitnessEvent.id, week.id, 'crossTraining', ct.id, { duration: e.target.value })}
                                            placeholder="min"
                                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center"
                                          />
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
                    let completedRuns = 0;
                    let totalCross = 0;
                    let completedCross = 0;
                    let totalMiles = 0;

                    Object.values(fitnessTrainingPlans).forEach(plan => {
                      plan.forEach(week => {
                        week.runs?.forEach(run => {
                          totalRuns++;
                          if (run.completed) {
                            completedRuns++;
                            const miles = parseFloat(run.distance) || 0;
                            totalMiles += miles;
                          }
                        });
                        week.crossTraining?.forEach(ct => {
                          totalCross++;
                          if (ct.completed) completedCross++;
                        });
                      });
                    });

                    return (
                      <>
                        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
                          <div className="text-4xl mb-2">🏃</div>
                          <div className="text-3xl font-bold text-white">{completedRuns}</div>
                          <div className="text-white/60">Runs Completed</div>
                          <div className="mt-2 text-sm text-orange-300">{totalRuns - completedRuns} remaining</div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-500/30">
                          <div className="text-4xl mb-2">💪</div>
                          <div className="text-3xl font-bold text-white">{completedCross}</div>
                          <div className="text-white/60">Cross Training Sessions</div>
                          <div className="mt-2 text-sm text-red-300">{totalCross - completedCross} remaining</div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                          <div className="text-4xl mb-2">📏</div>
                          <div className="text-3xl font-bold text-white">{totalMiles.toFixed(1)}</div>
                          <div className="text-white/60">Miles Logged</div>
                          <div className="mt-2 text-sm text-yellow-300">Keep going! 🔥</div>
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
                        const plan = fitnessTrainingPlans[event.id] || [];
                        return plan.slice(0, 12).map((week, i) => {
                          const completed = (week.runs?.filter(r => r.completed).length || 0) + (week.crossTraining?.filter(c => c.completed).length || 0);
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

      {/* Random Experience Modal */}
      {showRandomExperience && (
        <RandomExperienceModal
          onClose={() => setShowRandomExperience(false)}
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

      {/* Bottom rainbow bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
    </div>
  );
}
