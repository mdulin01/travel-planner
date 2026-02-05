import React, { useState } from 'react';
import { Calendar, X, Pencil, Trash2 } from 'lucide-react';

const OpenDateModal = ({ onClose, openDates, setOpenDates, companions = [] }) => {
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

export default OpenDateModal;
