import { useState, useCallback, useRef } from 'react';

/**
 * useTravel Hook
 * Manages all travel-related state and operations
 * Handles trips, trip details (flights, hotels, events, links, budget, packing), and wishlist
 */

export const useTravel = (user, currentUser, saveToFirestore, showToast, getEmojiSuggestion, tripColors) => {
  // Keep a ref so callbacks always use the latest saveToFirestore
  const saveRef = useRef(saveToFirestore);
  saveRef.current = saveToFirestore;
  // ========== INITIAL DATA ==========
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
      guests: []
    },
  ];

  const initialTripDetails = {
    1: {
      flights: [],
      hotels: [],
      events: [],
      links: [],
      packingList: [],
      budget: { total: 0, expenses: [] },
      photos: [],
      notes: [],
    },
  };

  // ========== STATE ==========
  const [trips, setTrips] = useState(defaultTrips);
  const [tripDetails, setTripDetails] = useState(initialTripDetails);
  const [wishlist, setWishlist] = useState([]);

  // Travel modals
  const [showNewTripModal, setShowNewTripModal] = useState(null); // 'adventure' | 'wishlist' | null
  const [showAddModal, setShowAddModal] = useState(null); // { type, tripId } | null

  // ========== PERMISSION HELPERS ==========
  const canEditTrip = useCallback((tripId) => {
    if (!user) return false;
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;
    // Simplified: current user can always edit
    return true;
  }, [user, trips]);

  const canDeleteTrip = useCallback((tripId) => {
    return canEditTrip(tripId);
  }, [canEditTrip]);

  // ========== TRIP CRUD ==========
  const addNewTrip = useCallback((tripData, isWishlist) => {
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
      special: tripData.special || '',
      guests: []
    };

    if (isWishlist) {
      const newWishlist = [...wishlist, newTrip];
      setWishlist(newWishlist);
      saveRef.current(null, newWishlist, null);
    } else {
      const newTrips = [...trips, newTrip];
      const newTripDetails = {
        ...tripDetails,
        [newTrip.id]: { flights: [], hotels: [], events: [], links: [], packingList: [], budget: { total: 0, expenses: [] }, photos: [], notes: [] }
      };
      setTrips(newTrips);
      setTripDetails(newTripDetails);
      saveRef.current(newTrips, null, newTripDetails);
    }
    setShowNewTripModal(null);
  }, [trips, wishlist, tripDetails, tripColors, getEmojiSuggestion]);

  const updateTripDates = useCallback(async (tripId, newStart, newEnd) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, dates: { start: newStart, end: newEnd } }
        : trip
    );
    setTrips(newTrips);
    await saveRef.current(newTrips, null, null);
    return newTrips.find(t => t.id === tripId);
  }, [trips]);

  const deleteTrip = useCallback((tripId) => {
    if (!canDeleteTrip(tripId)) {
      showToast('You don\'t have permission to delete this trip', 'error');
      return;
    }
    const newTrips = trips.filter(trip => trip.id !== tripId);
    const newTripDetails = { ...tripDetails };
    delete newTripDetails[tripId];
    setTrips(newTrips);
    setTripDetails(newTripDetails);
    saveRef.current(newTrips, null, newTripDetails);
  }, [trips, tripDetails, canDeleteTrip, saveToFirestore, showToast]);

  const updateTripColor = useCallback((tripId, colorSet) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId ? { ...trip, ...colorSet } : trip
    );
    setTrips(newTrips);
    saveRef.current(newTrips, null, null);
  }, [trips]);

  const updateTripEmoji = useCallback((tripId, emoji) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId ? { ...trip, emoji } : trip
    );
    setTrips(newTrips);
    saveRef.current(newTrips, null, null);
  }, [trips]);

  const updateTripCoverImage = useCallback((tripId, imageUrl) => {
    const newTrips = trips.map(trip =>
      trip.id === tripId ? { ...trip, coverImage: imageUrl } : trip
    );
    setTrips(newTrips);
    saveRef.current(newTrips, null, null);
  }, [trips]);

  const convertToAdventure = useCallback((wishlistItem) => {
    setShowNewTripModal({ type: 'convert', item: wishlistItem });
  }, []);

  // ========== TRIP DETAILS CRUD ==========
  const addItem = useCallback((tripId, type, item) => {
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
    saveRef.current(null, null, newTripDetails);
    setShowAddModal(null);
  }, [tripDetails, currentUser, canEditTrip, saveToFirestore, showToast]);

  const removeItem = useCallback((tripId, type, itemId) => {
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
    saveRef.current(null, null, newTripDetails);
  }, [tripDetails, canEditTrip, saveToFirestore, showToast]);

  const updateItem = useCallback((tripId, type, itemId, updatedData) => {
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
    saveRef.current(null, null, newTripDetails);
  }, [tripDetails, canEditTrip, saveToFirestore, showToast]);

  // ========== RETURN CONTEXT VALUE ==========
  return {
    // Data
    trips,
    tripDetails,
    wishlist,

    // Trip operations
    addNewTrip,
    updateTripDates,
    deleteTrip,
    updateTripColor,
    updateTripEmoji,
    updateTripCoverImage,
    convertToAdventure,

    // Trip detail operations (flights, hotels, events, links, etc.)
    addItem,
    removeItem,
    updateItem,

    // Permission helpers
    canEditTrip,
    canDeleteTrip,

    // Setters for loading from Firebase
    setTrips,
    setTripDetails,
    setWishlist,

    // Modal states
    showNewTripModal,
    setShowNewTripModal,
    showAddModal,
    setShowAddModal,
  };
};

export default useTravel;
