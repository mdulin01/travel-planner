import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Camera,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Plus,
  Share2,
  X,
  Loader,
  Heart,
  PartyPopper,
  Upload,
} from 'lucide-react';
import {
  initializeApp,
  getApps,
} from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { firebaseConfig } from '../firebase-config';
import heic2any from 'heic2any';

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function GuestEventPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get('t');

  // State
  const [event, setEvent] = useState(null);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [newListItem, setNewListItem] = useState({});
  const fileInputRef = useRef(null);

  // Fetch event data
  useEffect(() => {
    if (!eventId || !guestToken) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'events', eventId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("This event doesn't exist or has been removed");
          setLoading(false);
          return;
        }

        const eventData = snapshot.data();
        setEvent(eventData);

        // Find current guest
        const guest = eventData.guests?.find((g) => g.token === guestToken);
        if (!guest) {
          setError('This invitation link is invalid. Ask the host for a new one.');
          setLoading(false);
          return;
        }

        setCurrentGuest(guest);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching event:', err);
        setError('Failed to load event. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId, guestToken]);

  // Update guest RSVP
  const handleRSVP = async (rsvpStatus, plusOne = currentGuest?.plusOne || 0) => {
    if (!event || !currentGuest) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedGuests = event.guests.map((g) =>
        g.token === guestToken
          ? {
              ...g,
              rsvp: rsvpStatus,
              rsvpAt: new Date().toISOString(),
              plusOne,
            }
          : g
      );
      await setDoc(eventRef, { guests: updatedGuests }, { merge: true });

      // Trigger confetti if going
      if (rsvpStatus === 'going') {
        triggerConfetti();
      }
    } catch (err) {
      console.error('Error updating RSVP:', err);
    }
  };

  // Update guest note
  const handleUpdateNote = async (note) => {
    if (!event || !currentGuest) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedGuests = event.guests.map((g) =>
        g.token === guestToken ? { ...g, note } : g
      );
      await setDoc(eventRef, { guests: updatedGuests }, { merge: true });
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  // Update plus one count
  const handleUpdatePlusOne = async (newCount) => {
    if (!event || !currentGuest) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedGuests = event.guests.map((g) =>
        g.token === guestToken
          ? { ...g, plusOne: Math.max(0, Math.min(2, newCount)) }
          : g
      );
      await setDoc(eventRef, { guests: updatedGuests }, { merge: true });
    } catch (err) {
      console.error('Error updating plus one:', err);
    }
  };

  // Claim list item
  const handleClaimItem = async (listId, itemId) => {
    if (!event) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedLists = event.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      claimedBy: currentGuest.email,
                      claimedByName: currentGuest.name,
                    }
                  : item
              ),
            }
          : list
      );
      await setDoc(eventRef, { lists: updatedLists }, { merge: true });
    } catch (err) {
      console.error('Error claiming item:', err);
    }
  };

  // Unclaim list item
  const handleUnclaimItem = async (listId, itemId) => {
    if (!event) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedLists = event.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      claimedBy: null,
                      claimedByName: null,
                    }
                  : item
              ),
            }
          : list
      );
      await setDoc(eventRef, { lists: updatedLists }, { merge: true });
    } catch (err) {
      console.error('Error unclaiming item:', err);
    }
  };

  // Add list item
  const handleAddListItem = async (listId, text) => {
    if (!event || !text.trim()) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const updatedLists = event.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                {
                  id: Math.max(...list.items.map((i) => i.id), 0) + 1,
                  text,
                  claimedBy: null,
                  claimedByName: null,
                },
              ],
            }
          : list
      );
      await setDoc(eventRef, { lists: updatedLists }, { merge: true });
      setNewListItem({ ...newListItem, [listId]: '' });
    } catch (err) {
      console.error('Error adding list item:', err);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    const newImageUrls = [];

    for (const file of files) {
      try {
        let fileToUpload = file;

        // Convert HEIC if needed
        if (file.type === 'image/heic' || file.type === 'image/heif') {
          try {
            const converted = await heic2any({ blob: file });
            fileToUpload = new File([converted], file.name.replace(/\.heic?$/i, '.jpg'), {
              type: 'image/jpeg',
            });
          } catch (err) {
            console.warn('HEIC conversion failed, using original:', err);
          }
        }

        // Validate size (max 10MB)
        if (fileToUpload.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        const timestamp = Date.now();
        const safeName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `events/${eventId}/${timestamp}_${safeName}`);

        setUploadProgress((prev) => ({ ...prev, [timestamp]: 0 }));

        const snapshot = await uploadBytes(storageRef, fileToUpload);
        const url = await getDownloadURL(snapshot.ref);

        newImageUrls.push(url);
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[timestamp];
          return updated;
        });
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }

    // Add new images to event
    if (newImageUrls.length > 0) {
      try {
        const eventRef = doc(db, 'events', eventId);
        const snap = await getDoc(eventRef);
        const data = snap.data();
        await setDoc(
          eventRef,
          { images: [...(data.images || []), ...newImageUrls] },
          { merge: true }
        );
      } catch (err) {
        console.error('Error updating event images:', err);
      }
    }

    setUploadingPhotos(false);
  };

  // Confetti animation (CSS-based, no external library)
  const [showConfetti, setShowConfetti] = useState(false);
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Generate Google Calendar link
  const generateCalendarLink = () => {
    if (!event) return '';

    const start = new Date(`${event.date}T${event.time}`);
    const end = new Date(`${event.date}T${event.endTime}`);

    const startISO = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endISO = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      dates: `${startISO}/${endISO}`,
      location: event.location,
      details: event.description,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          </div>
          <p className="text-white/70">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <p className="text-white/50 text-sm">
            If you think this is a mistake, reach out to the host for a new invitation link.
          </p>
        </div>
      </div>
    );
  }

  if (!event || !currentGuest) {
    return null;
  }

  const goingCount = event.guests?.filter((g) => g.rsvp === 'going').length || 0;
  const maybeCount = event.guests?.filter((g) => g.rsvp === 'maybe').length || 0;
  const awaitingCount =
    event.guests?.filter((g) => g.rsvp === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Rainbow accent bar */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 w-full" />

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${12 + Math.random() * 16}px`,
                opacity: 0.8,
              }}
            >
              {['🎉', '🌈', '✨', '🏳️‍🌈', '💕', '🎊', '⭐'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        {event.coverImage ? (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={event.coverImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
          </div>
        ) : (
          <div
            className={`h-64 md:h-80 bg-gradient-to-br ${
              event.color || 'from-purple-500 to-pink-500'
            } relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
          </div>
        )}

        {/* Event emoji and name overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-6xl md:text-8xl mb-4">{event.emoji || '🎉'}</div>
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">
            {event.name}
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Hosted by Mike & Adam 💕
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-0 md:max-w-2xl md:mx-auto pb-12">
        {/* RSVP Section */}
        <div className="mt-8 mb-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Hey {currentGuest.name}! 👋
          </h2>
          <p className="text-white/70 mb-6">Are you coming to the party?</p>

          {/* RSVP buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleRSVP('going', currentGuest.plusOne || 0)}
              className={`py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                currentGuest.rsvp === 'going'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/50 scale-105'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <PartyPopper className="w-5 h-5" />
              <span>Going</span>
            </button>
            <button
              onClick={() => handleRSVP('maybe', currentGuest.plusOne || 0)}
              className={`py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                currentGuest.rsvp === 'maybe'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-105'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <span>🤔</span>
              <span>Maybe</span>
            </button>
            <button
              onClick={() => handleRSVP('not-going', currentGuest.plusOne || 0)}
              className={`py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                currentGuest.rsvp === 'not-going'
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/50 scale-105'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <span>😢</span>
              <span>Can't Make It</span>
            </button>
          </div>

          {/* Plus one counter */}
          {currentGuest.rsvp === 'going' && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70 mb-3">Bringing anyone with you?</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdatePlusOne((currentGuest.plusOne || 0) - 1)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold min-w-12 text-center">
                  {currentGuest.plusOne || 0}
                </span>
                <button
                  onClick={() => handleUpdatePlusOne((currentGuest.plusOne || 0) + 1)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Note field */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Add a note or dietary info
            </label>
            <textarea
              value={currentGuest.note || ''}
              onChange={(e) => handleUpdateNote(e.target.value)}
              placeholder="e.g., I'm vegetarian, I have a shellfish allergy..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
            />
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-8">
          {/* Date & Time */}
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 md:p-6 flex gap-4">
            <Calendar className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/70 text-sm mb-1">Date & Time</p>
              <p className="text-white font-semibold">
                {formatDate(event.date)}
              </p>
              <p className="text-white/80">
                {formatTime(event.time)} — {formatTime(event.endTime)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 md:p-6 flex gap-4">
            <MapPin className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white/70 text-sm mb-1">Location</p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  event.location
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:text-purple-400 transition-colors"
              >
                {event.location}
              </a>
            </div>
          </div>

          {/* Entry Code */}
          {event.entryCode && (
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 md:p-6">
              <p className="text-white/70 text-sm mb-2">Entry Code</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(event.entryCode);
                  alert('Entry code copied!');
                }}
                className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all cursor-pointer"
              >
                {event.entryCode}
              </button>
              <p className="text-white/50 text-xs mt-2">Tap to copy</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 md:p-6">
              <p className="text-white/70 text-sm mb-2">About This Event</p>
              <p className="text-white/90 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Add to Calendar */}
          <a
            href={generateCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transition-all p-4 text-center font-semibold text-white shadow-lg"
          >
            + Add to Calendar
          </a>
        </div>

        {/* Guest List */}
        <div className="mb-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Who's Coming
          </h2>

          {/* Going */}
          {goingCount > 0 && (
            <div className="mb-6">
              <p className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Going ({goingCount})
              </p>
              <div className="space-y-2">
                {event.guests
                  ?.filter((g) => g.rsvp === 'going')
                  .map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        guest.token === guestToken
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-sm font-bold">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium flex-1">
                        {guest.name}
                        {guest.plusOne > 0 && (
                          <span className="text-white/70 text-sm ml-2">
                            +{guest.plusOne}
                          </span>
                        )}
                      </span>
                      {guest.token === guestToken && (
                        <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                          That's you!
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Maybe */}
          {maybeCount > 0 && (
            <div className="mb-6">
              <p className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🤔</span> Maybe ({maybeCount})
              </p>
              <div className="space-y-2">
                {event.guests
                  ?.filter((g) => g.rsvp === 'maybe')
                  .map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        guest.token === guestToken
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold text-slate-900">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium flex-1">
                        {guest.name}
                      </span>
                      {guest.token === guestToken && (
                        <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                          That's you!
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Awaiting Reply */}
          {awaitingCount > 0 && (
            <div>
              <p className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                <span>⏳</span> Awaiting Reply ({awaitingCount})
              </p>
              <div className="space-y-2">
                {event.guests
                  ?.filter((g) => g.rsvp === 'pending')
                  .map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white/70 font-medium">{guest.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Collaborative Lists */}
        {event.lists && event.lists.length > 0 && (
          <div className="mb-8 space-y-6">
            {event.lists.map((list) => (
              <div
                key={list.id}
                className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">{list.emoji || '📝'}</span>
                  {list.name}
                </h2>

                <div className="space-y-2 mb-6">
                  {list.items?.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        item.claimedBy
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/5'
                      }`}
                    >
                      {item.claimedBy ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0" />
                      )}

                      <div className="flex-1">
                        <p
                          className={`${
                            item.claimedBy
                              ? 'text-white/70 line-through'
                              : 'text-white'
                          }`}
                        >
                          {item.text}
                        </p>
                        {item.claimedByName && (
                          <p className="text-xs text-white/50 mt-1">
                            {item.claimedByName} is bringing this
                          </p>
                        )}
                      </div>

                      {item.claimedBy === currentGuest.email ? (
                        <button
                          onClick={() => handleUnclaimItem(list.id, item.id)}
                          className="px-3 py-1 text-xs rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white/80"
                        >
                          Unclaim
                        </button>
                      ) : !item.claimedBy ? (
                        <button
                          onClick={() => handleClaimItem(list.id, item.id)}
                          className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transition-colors text-white font-semibold"
                        >
                          I'll bring this!
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Add item input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newListItem[list.id] || ''}
                    onChange={(e) =>
                      setNewListItem({ ...newListItem, [list.id]: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddListItem(list.id, newListItem[list.id]);
                      }
                    }}
                    placeholder="Add an item..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleAddListItem(list.id, newListItem[list.id])}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-400 hover:to-pink-400 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Gallery */}
        <div className="mb-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Camera className="w-6 h-6 text-orange-400" />
            Photos
          </h2>

          {/* Photo grid */}
          {event.images && event.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {event.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image}
                    alt={`Event photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Upload section */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-white/30 hover:border-white/50 rounded-lg p-8 text-center cursor-pointer transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
            />

            {uploadingPhotos ? (
              <div>
                <Loader className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                <p className="text-white/70">Uploading photos...</p>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:text-purple-300 transition-colors" />
                <p className="text-white font-semibold">
                  Add photos from the party
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Tap to upload or drag and drop
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhotoIndex !== null && event.images && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <img
              src={event.images[selectedPhotoIndex]}
              alt="Full size"
              className="w-full h-full object-contain"
            />

            {/* Navigation */}
            {event.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {event.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedPhotoIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 md:px-0 md:max-w-2xl md:mx-auto text-center text-white/50 text-sm">
        <p className="mb-2">Made with ❤️ by Mike & Adam</p>
        <div className="h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 w-full max-w-xs mx-auto rounded-full" />
      </footer>
    </div>
  );
}
