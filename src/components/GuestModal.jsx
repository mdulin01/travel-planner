import React from 'react';
import { Users, X, UserPlus } from 'lucide-react';

const GuestModal = ({
  trip,
  onClose,
  setTrips,
  guestEmail,
  setGuestEmail,
  guestPermission,
  setGuestPermission,
  currentUser
}) => {
  const tripGuests = trip.guests || [];

  const handleAddGuest = () => {
    if (guestEmail && guestEmail.includes('@')) {
      const newGuest = {
        id: Date.now(),
        email: guestEmail,
        permission: guestPermission,
        addedBy: currentUser,
        addedAt: new Date().toISOString()
      };

      // Update the trip with new guest
      setTrips(prevTrips => prevTrips.map(t =>
        t.id === trip.id
          ? { ...t, guests: [...(t.guests || []), newGuest] }
          : t
      ));

      setGuestEmail('');
      setGuestPermission('edit');
    }
  };

  const handleRemoveGuest = (guestId) => {
    setTrips(prevTrips => prevTrips.map(t =>
      t.id === trip.id
        ? { ...t, guests: (t.guests || []).filter(g => g.id !== guestId) }
        : t
    ));
  };

  const handleTogglePermission = (guestId) => {
    setTrips(prevTrips => prevTrips.map(t =>
      t.id === trip.id
        ? { ...t, guests: (t.guests || []).map(g =>
            g.id === guestId
              ? { ...g, permission: g.permission === 'edit' ? 'view' : 'edit' }
              : g
          )}
        : t
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[85dvh] overflow-y-auto">
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
          <div className="flex gap-3 flex-wrap">
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
                      {(guest.email || guest.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{guest.email || guest.name}</div>
                      <div className="text-sm text-slate-500">Added by {guest.addedBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePermission(guest.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        (guest.permission || 'edit') === 'edit'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Click to toggle permission"
                    >
                      {(guest.permission || 'edit') === 'edit' ? '✏️ Can Edit' : '👁️ View Only'}
                    </button>
                    <button
                      onClick={() => handleRemoveGuest(guest.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      title="Remove guest"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
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
              type="email"
              placeholder="Email address"
              value={guestEmail}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setGuestEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
            />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Permission Level</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGuestPermission('edit')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    guestPermission === 'edit'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✏️ Can Edit
                </button>
                <button
                  type="button"
                  onClick={() => setGuestPermission('view')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    guestPermission === 'view'
                      ? 'bg-slate-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👁️ View Only
                </button>
              </div>
            </div>
            <button
              onClick={handleAddGuest}
              disabled={!guestEmail || !guestEmail.includes('@')}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Edit:</strong> Can add flights, reservations, links, and notes.
            <br />
            <strong>View:</strong> Can see trip details but not make changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestModal;
