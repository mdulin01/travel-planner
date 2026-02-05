import React from 'react';
import {
  Calendar, Plane, Hotel, Music, MapPin, Plus, X, Users, ExternalLink, Pencil, Check, Link
} from 'lucide-react';
import { formatDate } from '../utils';
import LinkModal from './LinkModal';
import GuestModal from './GuestModal';

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

const TripDetail = ({
  trip,
  editingTripDates,
  setEditingTripDates,
  setSelectedTrip,
  tripDetails,
  setTripDetails,
  canEditTrip,
  removeItem,
  removeLink,
  addLink,
  setShowAddModal,
  setShowLinkModal,
  setShowGuestModal,
  showLinkModal,
  showGuestModal,
  isOwner,
  isGuest,
  guestPermissions,
  currentUser,
  updateTripDates,
  showToast,
  saveToFirestore,
  setTrips,
  guestEmail,
  setGuestEmail,
  guestPermission,
  setGuestPermission,
}) => {
  const details = tripDetails[trip.id] || { flights: [], hotels: [], events: [], links: [] };
  const userCanEdit = canEditTrip(trip.id);
  const userPermission = isGuest ? (guestPermissions[trip.id] || 'view') : (isOwner ? 'owner' : 'companion');

  // Add trip to Google Calendar
  const addTripToCalendar = () => {
    if (!trip.dates?.start || !trip.dates?.end) return;

    const startDate = trip.dates.start.replace(/-/g, '');
    const endDate = trip.dates.end.replace(/-/g, '');
    const title = encodeURIComponent(`${trip.emoji} ${trip.destination}`);
    const description = encodeURIComponent(
      `Trip to ${trip.destination}${trip.special ? `\n${trip.special}` : ''}\n\nAdded from Mike & Adam's Adventures 🦄`
    );

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}`;
    window.open(calendarUrl, '_blank');
    showToast('Opening Google Calendar...', 'info');
  };

  // Use parent-level state for editing to prevent reset on re-renders
  const isEditing = editingTripDates?.tripId === trip.id;
  const editedStart = editingTripDates?.start || trip.dates.start;
  const editedEnd = editingTripDates?.end || trip.dates.end;
  const editedName = editingTripDates?.name ?? trip.destination;
  const editedCoverImage = editingTripDates?.coverImage ?? (trip.coverImage || '');

  const handleStartEdit = () => {
    setEditingTripDates({
      tripId: trip.id,
      start: trip.dates.start,
      end: trip.dates.end,
      name: trip.destination,
      coverImage: trip.coverImage || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingTripDates(null);
  };

  const handleSave = async () => {
    const updatedTrip = {
      ...trip,
      destination: editedName,
      coverImage: editedCoverImage,
      dates: { start: editedStart, end: editedEnd }
    };

    // Update trips state and save to Firestore
    setTrips(prev => {
      const newTrips = prev.map(t => t.id === trip.id ? updatedTrip : t);
      saveToFirestore(newTrips, null, null);
      return newTrips;
    });

    // Update selected trip to show changes immediately
    setSelectedTrip(updatedTrip);

    showToast('Trip updated!', 'success');
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
              <button
                onClick={addTripToCalendar}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                title="Add to Google Calendar"
              >
                <Calendar className="w-5 h-5" />
              </button>
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
                    onClick={() => isEditing ? handleCancelEdit() : handleStartEdit()}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                    title="Edit trip"
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
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditingTripDates(prev => ({ ...prev, name: e.target.value }))}
                className="text-4xl md:text-5xl font-bold mb-2 bg-white/20 border border-white/30 rounded-xl px-4 py-2 w-full text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                placeholder="Trip destination"
              />
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>
            )}

            {/* Guest Avatars */}
            {trip.guests && trip.guests.length > 0 && (
              <div className="flex items-center gap-2 mt-3 mb-2">
                <span className="text-white/80 text-sm">Traveling with:</span>
                <div className="flex -space-x-2">
                  {trip.guests.slice(0, 5).map((guest, idx) => (
                    <div
                      key={guest.id}
                      className="w-8 h-8 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/50"
                      title={guest.name || guest.email || 'Guest'}
                    >
                      {(guest.name || guest.email || '?').charAt(0)}
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

            {isEditing ? (
              <div className="space-y-4 mt-4">
                {/* Dates */}
                <div className="flex flex-wrap items-center gap-3">
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
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-white/80 text-sm mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={editedCoverImage}
                    onChange={(e) => setEditingTripDates(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="Paste image URL (e.g., from Unsplash)"
                    className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60 placeholder-white/40"
                  />
                  {editedCoverImage && (
                    <div className="mt-2 relative rounded-lg overflow-hidden h-24">
                      <img
                        src={editedCoverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-lg font-medium transition"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
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

          {/* Guest Info Banner */}
          {isGuest && (
            <div className={`mb-6 p-4 rounded-xl border ${userCanEdit ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className={`text-sm ${userCanEdit ? 'text-green-800' : 'text-blue-800'}`}>
                    <strong>You're invited!</strong> {userCanEdit
                      ? 'You can view and edit trip details (flights, hotels, events).'
                      : 'You can view trip details. Contact the trip owner to request edit access.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addTripToCalendar}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Calendar className="w-4 h-4" />
                    Add to Calendar
                  </button>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${userCanEdit ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'}`}>
                    {userCanEdit ? '✏️ Can Edit' : '👁️ View Only'}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                {canEditTrip(trip.id) && (
                  <button
                    onClick={() => setShowAddModal({ type, tripId: trip.id })}
                    className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
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
                      {canEditTrip(trip.id) && (
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
                      )}
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
      {showLinkModal === trip.id && <LinkModal tripId={trip.id} onClose={() => setShowLinkModal(null)} addLink={addLink} />}
      {showGuestModal === trip.id && (
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
      )}
    </div>
  );
};

export default TripDetail;
