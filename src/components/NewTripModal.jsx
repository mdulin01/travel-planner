// NewTripModal Component - Comprehensive trip planning modal
import React, { useState, useRef } from 'react';
import { X, Sparkles, UserPlus, Plane, Car, Train, Hotel, Calendar, MapPin, Clock, Plus, Trash2, ChevronDown, ChevronUp, Camera, Image, Loader } from 'lucide-react';
import { travelEmojis } from '../constants';
import { getEmojiSuggestion } from '../utils';

const NewTripModal = ({
  type,
  onClose,
  wishlist,
  setWishlist,
  saveToFirestore,
  addNewTrip
}) => {
  const [formData, setFormData] = useState(
    type.item ? { destination: type.item.destination, emoji: type.item.emoji } : {}
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [transportMode, setTransportMode] = useState('air');
  const [expandedSections, setExpandedSections] = useState({
    transport: true,
    flights: false,
    hotels: false,
    events: false
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Flight state
  const [flights, setFlights] = useState([{
    id: 1,
    type: 'outbound',
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    confirmationNumber: ''
  }]);

  // Hotel state
  const [hotels, setHotels] = useState([{
    id: 1,
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    confirmationNumber: '',
    notes: ''
  }]);

  // Events state
  const [events, setEvents] = useState([{
    id: 1,
    name: '',
    date: '',
    time: '',
    location: '',
    confirmationNumber: '',
    notes: ''
  }]);

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Add/remove flight
  const addFlight = () => {
    setFlights([...flights, {
      id: Date.now(),
      type: flights.length === 0 ? 'outbound' : 'return',
      airline: '',
      flightNumber: '',
      departureAirport: '',
      arrivalAirport: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      confirmationNumber: ''
    }]);
  };

  const removeFlight = (id) => {
    if (flights.length > 1) {
      setFlights(flights.filter(f => f.id !== id));
    }
  };

  const updateFlight = (id, field, value) => {
    setFlights(flights.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Add/remove hotel
  const addHotel = () => {
    setHotels([...hotels, {
      id: Date.now(),
      name: '',
      address: '',
      checkIn: '',
      checkOut: '',
      confirmationNumber: '',
      notes: ''
    }]);
  };

  const removeHotel = (id) => {
    if (hotels.length > 1) {
      setHotels(hotels.filter(h => h.id !== id));
    }
  };

  const updateHotel = (id, field, value) => {
    setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  // Add/remove event
  const addEvent = () => {
    setEvents([...events, {
      id: Date.now(),
      name: '',
      date: '',
      time: '',
      location: '',
      confirmationNumber: '',
      notes: ''
    }]);
  };

  const removeEvent = (id) => {
    if (events.length > 1) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const updateEvent = (id, field, value) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Handle image selection - convert to data URL for immediate use
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);
    setUploadingImage(true);

    try {
      // Convert to data URL for storage (works offline, persists in Firestore)
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        setCoverImage(previewUrl);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setCoverImage(previewUrl);
      setUploadingImage(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (isConvert) {
      const newWishlist = wishlist.filter(w => w.id !== type.item.id);
      setWishlist(newWishlist);
      saveToFirestore(null, newWishlist, null);
    }

    // Include all the detailed information
    const tripData = {
      ...formData,
      emoji: currentEmoji,
      transportMode,
      coverImage: coverImage || null,
      flights: transportMode === 'air' ? flights.filter(f => f.airline || f.flightNumber) : [],
      hotels: hotels.filter(h => h.name),
      events: events.filter(e => e.name)
    };

    addNewTrip(tripData, isWishlist);
  };

  const transportOptions = [
    { id: 'air', label: 'Air', icon: Plane, emoji: '✈️' },
    { id: 'car', label: 'Car', icon: Car, emoji: '🚗' },
    { id: 'train', label: 'Train', icon: Train, emoji: '🚂' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[85dvh] overflow-y-auto border border-white/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              {isWishlist ? '🦄 Dream Destination' : isConvert ? '✨ Make It Real!' : '🌈 New Adventure'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-1">Destination *</label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={formData.destination || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-teal-400 outline-none"
                onChange={(e) => handleDestinationChange(e.target.value)}
              />
            </div>
          </div>

          {/* Emoji Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Trip Icon</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 text-3xl bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition border border-white/20"
              >
                {currentEmoji}
              </button>
              <div className="text-sm text-white/50">
                {formData.destination && !formData.emoji && (
                  <span className="text-teal-400">✨ Auto-suggested based on destination</span>
                )}
                {!formData.destination && <span>Click to choose an icon</span>}
              </div>
            </div>

            {showEmojiPicker && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/20">
                <div className="grid grid-cols-10 gap-1">
                  {travelEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, emoji });
                        setShowEmojiPicker(false);
                      }}
                      className={`w-8 h-8 text-xl rounded-lg hover:bg-teal-500/30 transition flex items-center justify-center ${
                        currentEmoji === emoji ? 'bg-teal-500/40 ring-2 ring-teal-400' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Cover Photo (optional)</label>
            {coverImagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                {/* Camera capture button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-teal-400 hover:bg-white/5 transition"
                >
                  <Camera className="w-5 h-5 text-white/50" />
                  <span className="text-xs text-white/50">Take Photo</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Gallery upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-2 p-3 border border-dashed border-white/30 rounded-xl hover:border-teal-400 hover:bg-white/5 transition"
                >
                  <Image className="w-5 h-5 text-white/50" />
                  <span className="text-xs text-white/50">Choose Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          {!isWishlist && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-teal-400 outline-none"
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-teal-400 outline-none"
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Special Occasion */}
          {!isWishlist && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Special Occasion (optional)</label>
              <input
                type="text"
                placeholder="Anniversary, birthday, etc."
                value={formData.special || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-teal-400 outline-none"
                onChange={(e) => setFormData({ ...formData, special: e.target.value })}
              />
            </div>
          )}

          {/* Wishlist Notes */}
          {isWishlist && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Notes / Dreams (optional)</label>
              <input
                type="text"
                placeholder="Why do you want to go here?"
                value={formData.notes || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-teal-400 outline-none"
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          )}

          {/* Transportation Mode */}
          {!isWishlist && (
            <div className="border border-white/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('transport')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-teal-400" />
                  <span className="font-medium text-white">Transportation</span>
                  <span className="text-sm text-white/50">({transportOptions.find(t => t.id === transportMode)?.label})</span>
                </div>
                {expandedSections.transport ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>

              {expandedSections.transport && (
                <div className="p-4 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-2">
                    {transportOptions.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTransportMode(option.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                          transportMode === option.id
                            ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                            : 'border-white/20 hover:border-white/40 text-white/70'
                        }`}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flights Section */}
          {!isWishlist && transportMode === 'air' && (
            <div className="border border-white/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('flights')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-teal-400" />
                  <span className="font-medium text-white">Flights</span>
                  {flights.some(f => f.airline || f.flightNumber) && (
                    <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">{flights.filter(f => f.airline || f.flightNumber).length} added</span>
                  )}
                </div>
                {expandedSections.flights ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>

              {expandedSections.flights && (
                <div className="p-4 border-t border-white/10 space-y-4">
                  {flights.map((flight, idx) => (
                    <div key={flight.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${flight.type === 'outbound' ? 'bg-teal-500/30 text-teal-300' : 'bg-purple-500/30 text-purple-300'}`}>
                            {flight.type === 'outbound' ? '→ Outbound' : '← Return'}
                          </span>
                        </span>
                        {flights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFlight(flight.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Airline</label>
                          <input
                            type="text"
                            placeholder="e.g. Delta"
                            value={flight.airline}
                            onChange={(e) => updateFlight(flight.id, 'airline', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Flight #</label>
                          <input
                            type="text"
                            placeholder="e.g. DL123"
                            value={flight.flightNumber}
                            onChange={(e) => updateFlight(flight.id, 'flightNumber', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">From (Airport)</label>
                          <input
                            type="text"
                            placeholder="e.g. GSO"
                            value={flight.departureAirport}
                            onChange={(e) => updateFlight(flight.id, 'departureAirport', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">To (Airport)</label>
                          <input
                            type="text"
                            placeholder="e.g. JFK"
                            value={flight.arrivalAirport}
                            onChange={(e) => updateFlight(flight.id, 'arrivalAirport', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Departure Date</label>
                          <input
                            type="date"
                            value={flight.departureDate}
                            onChange={(e) => updateFlight(flight.id, 'departureDate', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Departure Time</label>
                          <input
                            type="time"
                            value={flight.departureTime}
                            onChange={(e) => updateFlight(flight.id, 'departureTime', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Confirmation #</label>
                        <input
                          type="text"
                          placeholder="Booking reference"
                          value={flight.confirmationNumber}
                          onChange={(e) => updateFlight(flight.id, 'confirmationNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      {/* Flight type toggle */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateFlight(flight.id, 'type', 'outbound')}
                          className={`flex-1 py-2 text-sm rounded-lg transition ${flight.type === 'outbound' ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60'}`}
                        >
                          Outbound
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFlight(flight.id, 'type', 'return')}
                          className={`flex-1 py-2 text-sm rounded-lg transition ${flight.type === 'return' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFlight}
                    className="w-full py-2 border border-dashed border-white/30 rounded-xl text-white/50 hover:border-teal-400 hover:text-teal-400 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Flight
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hotels Section */}
          {!isWishlist && (
            <div className="border border-white/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('hotels')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-teal-400" />
                  <span className="font-medium text-white">Hotels / Accommodations</span>
                  {hotels.some(h => h.name) && (
                    <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">{hotels.filter(h => h.name).length} added</span>
                  )}
                </div>
                {expandedSections.hotels ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>

              {expandedSections.hotels && (
                <div className="p-4 border-t border-white/10 space-y-4">
                  {hotels.map((hotel, idx) => (
                    <div key={hotel.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Hotel {idx + 1}</span>
                        {hotels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHotel(hotel.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Hotel Name</label>
                        <input
                          type="text"
                          placeholder="e.g. The Ritz-Carlton"
                          value={hotel.name}
                          onChange={(e) => updateHotel(hotel.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Address</label>
                        <input
                          type="text"
                          placeholder="Hotel address"
                          value={hotel.address}
                          onChange={(e) => updateHotel(hotel.id, 'address', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Check-in</label>
                          <input
                            type="date"
                            value={hotel.checkIn}
                            onChange={(e) => updateHotel(hotel.id, 'checkIn', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Check-out</label>
                          <input
                            type="date"
                            value={hotel.checkOut}
                            onChange={(e) => updateHotel(hotel.id, 'checkOut', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Confirmation #</label>
                        <input
                          type="text"
                          placeholder="Booking reference"
                          value={hotel.confirmationNumber}
                          onChange={(e) => updateHotel(hotel.id, 'confirmationNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Notes</label>
                        <input
                          type="text"
                          placeholder="Room type, special requests, etc."
                          value={hotel.notes}
                          onChange={(e) => updateHotel(hotel.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addHotel}
                    className="w-full py-2 border border-dashed border-white/30 rounded-xl text-white/50 hover:border-teal-400 hover:text-teal-400 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Hotel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Events/Activities Section */}
          {!isWishlist && (
            <div className="border border-white/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('events')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <span className="font-medium text-white">Events & Activities</span>
                  {events.some(e => e.name) && (
                    <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">{events.filter(e => e.name).length} added</span>
                  )}
                </div>
                {expandedSections.events ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>

              {expandedSections.events && (
                <div className="p-4 border-t border-white/10 space-y-4">
                  {events.map((event, idx) => (
                    <div key={event.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Activity {idx + 1}</span>
                        {events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEvent(event.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Event/Activity Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Broadway Show, Museum Visit"
                          value={event.name}
                          onChange={(e) => updateEvent(event.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Date</label>
                          <input
                            type="date"
                            value={event.date}
                            onChange={(e) => updateEvent(event.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Time</label>
                          <input
                            type="time"
                            value={event.time}
                            onChange={(e) => updateEvent(event.id, 'time', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-teal-400 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="Venue or address"
                          value={event.location}
                          onChange={(e) => updateEvent(event.id, 'location', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Confirmation # (optional)</label>
                        <input
                          type="text"
                          placeholder="Ticket or booking reference"
                          value={event.confirmationNumber}
                          onChange={(e) => updateEvent(event.id, 'confirmationNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Notes</label>
                        <input
                          type="text"
                          placeholder="Any additional details"
                          value={event.notes}
                          onChange={(e) => updateEvent(event.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addEvent}
                    className="w-full py-2 border border-dashed border-white/30 rounded-xl text-white/50 hover:border-teal-400 hover:text-teal-400 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Activity
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Invite Guests - Coming Soon */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Invite Guests</label>
            <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center">
              <UserPlus className="w-6 h-6 text-white/30 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Guest invitations coming soon!</p>
              <p className="text-white/30 text-xs mt-1">You'll be able to invite friends to join your adventure</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!formData.destination}
            className="w-full py-3 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {isWishlist ? 'Add to Wishlist' : isConvert ? 'Book This Dream!' : 'Create Adventure'}
          </button>
          <p className="text-xs text-white/40 text-center">
            💡 Tip: You can add more details later by clicking on the trip card
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewTripModal;
