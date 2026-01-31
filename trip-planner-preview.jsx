import React, { useState } from 'react';
import { Calendar, Plane, Hotel, Music, MapPin, Plus, X, ChevronLeft, ChevronRight, Heart, Anchor, Sun, Star, Clock, Users, ExternalLink, Sparkles, Pencil, Check, MoreVertical, Trash2, Palette, Image, Link, Globe, Loader, LogIn, LogOut, User } from 'lucide-react';

// Rainbow gradient for pride flair
const RainbowBar = () => (
  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
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
      { id: 1, addedBy: 'Mike', url: 'https://www.standardhotels.com', title: 'The Standard High Line', description: 'Iconic hotel in the Meatpacking District', category: 'hotel' },
      { id: 2, addedBy: 'Adam', url: 'https://hadestown.com', title: 'Hadestown on Broadway', description: 'Tony Award-winning musical', category: 'event' }
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

// Starburst SVG component
const Starburst = ({ className, animated = false }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <g>
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="50"
          x2={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
          y2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
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

export default function TripPlannerPreview() {
  const [trips, setTrips] = useState(defaultTrips);
  const [wishlist, setWishlist] = useState(defaultWishlist);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(initialTripDetails);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [currentUser, setCurrentUser] = useState('Mike');
  const [showTripMenu, setShowTripMenu] = useState(null);

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

  const closeMenus = () => {
    setShowTripMenu(null);
  };

  // Trip Detail View
  const TripDetail = ({ trip }) => {
    const details = tripDetails[trip.id] || { flights: [], hotels: [], events: [], links: [] };

    return (
      <div className="fixed inset-0 bg-slate-900/80 z-40 overflow-auto">
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${trip.color} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-6`}>
              <AtomicDots />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-6xl mb-4">{trip.emoji}</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>
              <p className="text-xl opacity-90">
                {new Date(trip.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
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
                  <button className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}>
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
                <button className={`p-2 rounded-full ${trip.accent} text-white hover:opacity-80 transition`}>
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {(!details.links || details.links.length === 0) ? (
                <p className="text-slate-400 italic">No links added yet. Add hotel bookings, event tickets, and more!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.links.map(link => (
                    <div key={link.id} className="flex bg-slate-50 rounded-2xl overflow-hidden group hover:shadow-md transition p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full capitalize">
                            {link.category}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800 truncate">{link.title}</div>
                        {link.description && (
                          <div className="text-sm text-slate-500 truncate">{link.description}</div>
                        )}
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Added by {link.addedBy}
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden" onClick={closeMenus}>
      {/* Rainbow top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <Starburst className="absolute top-10 right-20 w-24 h-24 text-cyan-400/30" />
        <span className="absolute top-32 left-1/4 text-4xl opacity-10">🦄</span>
        <span className="absolute bottom-48 right-1/3 text-3xl opacity-10">🌈</span>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg">
              <Plus className="w-5 h-5" />
              New Adventure
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 text-white font-semibold rounded-full hover:opacity-90 transition shadow-lg">
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
                  onClick={() => setSelectedTrip(trip)}
                  className={`bg-gradient-to-br ${trip.color} rounded-3xl text-white text-left relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl cursor-pointer`}
                >
                  {/* Cover Image */}
                  {trip.coverImage && (
                    <div className="h-28 w-full overflow-hidden">
                      <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className={`p-6 ${trip.coverImage ? 'pt-4' : ''}`}>
                    <AtomicDots />
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
                      <button className="px-3 py-1.5 bg-gradient-to-r from-teal-400 to-purple-400 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition">
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

      {/* Bottom rainbow bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
    </div>
  );
}
