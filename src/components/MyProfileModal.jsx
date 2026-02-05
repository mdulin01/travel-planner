import React, { useState } from 'react';
import { User, X, Check } from 'lucide-react';

const MyProfileModal = ({
  onClose,
  currentCompanion,
  setCompanions,
  setCurrentCompanion
}) => {
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

export default MyProfileModal;
