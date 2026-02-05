import React, { useState } from 'react';
import { Users, X, ChevronRight, Pencil, Trash2, UserPlus } from 'lucide-react';

const CompanionsModal = ({
  onClose,
  companions,
  setCompanions,
  setOpenDates,
}) => {
  const [companionData, setCompanionData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'Friend',
  });
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
        setCompanions((prev) =>
          prev.map((c) =>
            c.id === editingId ? { ...c, ...companionData } : c
          )
        );
        setEditingId(null);
      } else {
        // Add new companion
        const newCompanion = {
          id:
            companionData.firstName.toLowerCase().replace(/\s+/g, '-') +
            '-' +
            Date.now(),
          firstName: companionData.firstName,
          lastName: companionData.lastName,
          email: companionData.email,
          phone: companionData.phone,
          relationship: companionData.relationship,
          color: colors[companions.length % colors.length],
        };
        setCompanions((prev) => [...prev, newCompanion]);
      }
      setCompanionData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'Friend',
      });
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
    setCompanions((prev) => prev.filter((c) => c.id !== id));
    // Also remove from any open dates visibility
    setOpenDates((prev) =>
      prev.map((d) => ({
        ...d,
        visibleTo: d.visibleTo.filter((v) => v !== id),
      }))
    );
    if (editingId === id) {
      setEditingId(null);
      setCompanionData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'Friend',
      });
    }
  };

  const relationshipOptions = [
    'Friend',
    'Brother',
    'Sister',
    'Cousin',
    'Son',
    'Daughter',
    'Parent',
    'Partner',
    'Colleague',
  ];

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
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 mb-6">
          These are people you regularly travel with. They can see your
          calendar and available dates you share with them. Click on a
          companion to view or edit their details.
        </p>

        {/* Current Companions */}
        {companions?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              👥 Your Travel Circle ({companions.length})
            </h4>
            <div className="space-y-2">
              {(companions || []).map((companion) => (
                <div key={companion.id} className="bg-slate-50 rounded-xl overflow-hidden">
                  {/* Companion Header - Always Visible */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() =>
                      setExpandedId(
                        expandedId === companion.id ? null : companion.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${companion.color} rounded-full flex items-center justify-center text-white font-bold`}
                      >
                        {(companion.firstName || companion.name || '?').charAt(
                          0
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {getDisplayName(companion)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {companion.relationship}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedId === companion.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === companion.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-20">Email:</span>
                          <span className="text-slate-700">
                            {companion.email || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-20">Phone:</span>
                          <span className="text-slate-700">
                            {companion.phone || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-20">
                            Last Name:
                          </span>
                          <span className="text-slate-700">
                            {companion.lastName || '—'}
                          </span>
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
                onChange={(e) =>
                  setCompanionData({
                    ...companionData,
                    firstName: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                value={companionData.lastName}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) =>
                  setCompanionData({
                    ...companionData,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
            <input
              type="email"
              placeholder="Email *"
              value={companionData.email}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) =>
                setCompanionData({ ...companionData, email: e.target.value })
              }
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={companionData.phone}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) =>
                setCompanionData({ ...companionData, phone: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Relationship
              </label>
              <div className="flex flex-wrap gap-2">
                {relationshipOptions.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() =>
                      setCompanionData({
                        ...companionData,
                        relationship: rel,
                      })
                    }
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
                  setCompanionData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    relationship: 'Friend',
                  });
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

export default CompanionsModal;
