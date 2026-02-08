// utils.js - Utility functions extracted from trip-planner.jsx

import { emojiSuggestions, experienceDatabase, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './constants';

// Helper to parse date strings without timezone issues
// "2026-03-23" -> Date object for March 23, 2026 in local time
export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();

  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();

  const [year, month, day] = parts.map(Number);

  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date();
  if (year < 1900 || year > 2100) return new Date();
  if (month < 1 || month > 12) return new Date();
  if (day < 1 || day > 31) return new Date();

  const date = new Date(year, month - 1, day);

  // Check if Date constructor produced a valid date
  if (isNaN(date.getTime())) return new Date();

  return date;
};

// Format a date string for display
export const formatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', options);
};

// Validate file size - returns error message or null
export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
};

// Get emoji suggestion based on destination
export const getEmojiSuggestion = (destination) => {
  if (!destination) return '✈️';
  const lower = destination.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiSuggestions)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✈️';
};

// Get random experience from database
export const getRandomExperience = (type, vibes, bougieLevel) => {
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

// Get days in month for calendar
export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
};

// Calculate days until a date
export const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Check if a date is within a trip's date range
export const isDateInRange = (checkDate, startStr, endStr) => {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  return checkDate >= start && checkDate <= end;
};

// Format countdown text
export const formatCountdown = (days) => {
  if (days < 0) return 'Past';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
};

// Check if file is HEIC/HEIF format
export const isHeicFile = (file) => {
  return file.type === 'image/heic' ||
         file.type === 'image/heif' ||
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif');
};

// Generate safe filename for storage
export const getSafeFileName = (fileName) => {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${safeName}`;
};

// Get display name for companion
export const getCompanionDisplayName = (companion) => {
  if (!companion) return 'Guest';
  if (companion.firstName && companion.lastName) {
    return `${companion.firstName} ${companion.lastName}`;
  }
  return companion.firstName || companion.name || 'Unknown';
};

// Check if user is an owner
export const checkIsOwner = (email, ownerEmails) => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return ownerEmails.some(ownerEmail =>
    lowerEmail.includes(ownerEmail.split('@')[0])
  );
};

// ========== SHARED HUB UTILITIES ==========

// Get display label for a time horizon
export const getTimeHorizonLabel = (horizon) => {
  const labels = {
    'today': 'Today',
    'this-week': 'This Week',
    'this-month': 'This Month',
    'this-quarter': 'This Quarter',
    'this-year': 'This Year',
    'someday': 'Someday',
  };
  return labels[horizon] || horizon;
};

// Check if a task is due today
export const isTaskDueToday = (task) => {
  if (task.timeHorizon === 'today') return true;
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseLocalDate(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
};

// Check if a task is due this week
export const isTaskDueThisWeek = (task) => {
  if (task.timeHorizon === 'today' || task.timeHorizon === 'this-week') return true;
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const due = parseLocalDate(task.dueDate);
  return due >= today && due <= weekEnd;
};

// Check if task matches a given time horizon filter
export const taskMatchesHorizon = (task, horizon) => {
  // Cumulative: "this-week" includes today tasks, "this-month" includes this-week, etc.
  const horizonOrder = ['today', 'this-week', 'this-month', 'this-quarter', 'this-year', 'someday'];
  const selectedIdx = horizonOrder.indexOf(horizon);
  const taskIdx = horizonOrder.indexOf(task.timeHorizon);

  // If task has an explicit timeHorizon that falls within the selected range, include it
  if (taskIdx !== -1 && selectedIdx !== -1 && taskIdx <= selectedIdx) return true;
  // 'someday' selected shows everything
  if (horizon === 'someday') return true;

  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseLocalDate(task.dueDate);
  switch (horizon) {
    case 'today': return due.getTime() === today.getTime();
    case 'this-week': {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return due >= today && due <= weekEnd;
    }
    case 'this-month': {
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return due >= today && due <= monthEnd;
    }
    case 'this-quarter': {
      const quarterEnd = new Date(today);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);
      return due >= today && due <= quarterEnd;
    }
    case 'this-year': {
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      return due >= today && due <= yearEnd;
    }
    default: return false;
  }
};

// Extract domain from URL for display
export const getDomainFromUrl = (url) => {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url.substring(0, 30);
  }
};

// Fetch URL metadata (Open Graph) for link previews
// Uses Microlink API (free, no key, CORS-friendly)
export const fetchUrlMetadata = async (url) => {
  if (!url || !url.trim()) return null;
  try {
    const encoded = encodeURIComponent(url.trim());
    const res = await fetch(`https://api.microlink.io/?url=${encoded}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 'success' || !json.data) return null;
    const { title, description, image, logo } = json.data;
    return {
      title: title || '',
      description: description || '',
      image: image?.url || logo?.url || '',
    };
  } catch {
    return null;
  }
};

// Auto-suggest idea category from URL domain
export const suggestIdeaCategoryFromUrl = (url) => {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('airbnb') || lower.includes('booking.com') || lower.includes('hotels') || lower.includes('tripadvisor') || lower.includes('expedia')) return 'trip';
  if (lower.includes('allrecipes') || lower.includes('recipe') || lower.includes('cooking') || lower.includes('food') || lower.includes('epicurious') || lower.includes('bonappetit')) return 'recipe';
  if (lower.includes('yelp') || lower.includes('opentable') || lower.includes('resy') || lower.includes('restaurant')) return 'date';
  if (lower.includes('zillow') || lower.includes('redfin') || lower.includes('apartments') || lower.includes('ikea') || lower.includes('wayfair')) return 'home';
  if (lower.includes('amazon') || lower.includes('etsy') || lower.includes('gift')) return 'gift';
  if (lower.includes('eventbrite') || lower.includes('meetup') || lower.includes('ticketmaster')) return 'activity';
  if (lower.includes('linkedin') || lower.includes('indeed') || lower.includes('glassdoor')) return 'career';
  return 'other';
};

// ========== FILE CONVERSION UTILITIES ==========

// Convert HEIC/HEIF image to JPEG
// Returns converted File object or original file if not HEIC
export const convertHeicToJpeg = async (file) => {
  // Check if heic2any is available (dynamically imported)
  if (!window.heic2any) {
    console.warn('heic2any not available, returning original file');
    return file;
  }

  if (!isHeicFile(file)) {
    return file; // Not a HEIC file, return as-is
  }

  try {
    const convertedBlob = await window.heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    // Generate new filename with .jpg extension
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const newFileName = `${originalName}.jpg`;

    return new File([convertedBlob], newFileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error('Failed to convert HEIC image. Please try a different format.');
  }
};
