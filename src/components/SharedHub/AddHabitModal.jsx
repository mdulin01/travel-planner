import React, { useState } from 'react';
import { X, Check, Zap, Target, Gift, Sparkles } from 'lucide-react';
import { habitCategories, habitFrequencies, weekDays } from '../../constants';

const AddHabitModal = React.memo(({ onClose, onSave, editHabit, currentUser }) => {
  const isEditing = !!editHabit;

  const [formData, setFormData] = useState(editHabit ? {
    name: editHabit.name || '',
    category: editHabit.category || 'health',
    cue: editHabit.cue || '',
    routine: editHabit.routine || '',
    reward: editHabit.reward || '',
    identity: editHabit.identity || '',
    frequency: editHabit.frequency || 'daily',
    customDays: editHabit.customDays || [],
    assignedTo: editHabit.assignedTo || 'Both',
    emoji: editHabit.emoji || '✨',
  } : {
    name: '',
    category: 'health',
    cue: '',
    routine: '',
    reward: '',
    identity: '',
    frequency: 'daily',
    customDays: [],
    assignedTo: 'Both',
    emoji: '✨',
  });

  const [validationError, setValidationError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const toggleCustomDay = (day) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setValidationError('Habit name is required');
      return;
    }
    const habit = {
      id: editHabit?.id || Date.now(),
      ...formData,
      name: formData.name.trim(),
      cue: formData.cue.trim(),
      routine: formData.routine.trim(),
      reward: formData.reward.trim(),
      identity: formData.identity.trim(),
      log: editHabit?.log || {},
      status: editHabit?.status || 'active',
      createdBy: editHabit?.createdBy || currentUser,
      createdAt: editHabit?.createdAt || new Date().toISOString(),
    };
    onSave(habit);
  };

  const saveAndClose = () => {
    if (formData.name.trim()) {
      handleSave();
    } else {
      onClose();
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) saveAndClose();
  };

  const catEmoji = habitCategories.find(c => c.value === formData.category)?.emoji || '✨';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg mx-auto w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              {isEditing ? 'Edit Habit' : 'New Habit'}
            </h3>
            <button onClick={saveAndClose} className="p-2 hover:bg-slate-700 rounded-full transition text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Habit Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Habit Name *</label>
            <input
              type="text"
              placeholder="e.g., Morning walk together"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
              autoFocus
            />
            {validationError && <p className="text-red-400 text-sm mt-1">{validationError}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {habitCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { updateField('category', cat.value); updateField('emoji', cat.emoji); }}
                  className={`px-2 py-2 rounded-xl font-medium transition text-xs text-center ${
                    formData.category === cat.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Atomic Habits: Cue → Routine → Reward */}
          <div className="bg-slate-700/50 rounded-2xl p-4 space-y-4 border border-slate-600/50">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Habit Loop
            </div>

            {/* Cue */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Cue (trigger)
              </label>
              <input
                type="text"
                placeholder="e.g., After morning coffee..."
                value={formData.cue}
                onChange={(e) => updateField('cue', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
              />
            </div>

            {/* Routine */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Routine (action)
              </label>
              <input
                type="text"
                placeholder="e.g., Walk around the block for 15 min"
                value={formData.routine}
                onChange={(e) => updateField('routine', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
              />
            </div>

            {/* Reward */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 flex items-center gap-1">
                <Gift className="w-3 h-3" /> Reward
              </label>
              <input
                type="text"
                placeholder="e.g., Fresh air + connection time"
                value={formData.reward}
                onChange={(e) => updateField('reward', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Identity Statement */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Identity Statement
            </label>
            <input
              type="text"
              placeholder='e.g., "We are a couple that prioritizes morning movement"'
              value={formData.identity}
              onChange={(e) => updateField('identity', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none transition italic"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Frequency</label>
            <div className="flex flex-wrap gap-2">
              {habitFrequencies.map(f => (
                <button
                  key={f.value}
                  onClick={() => updateField('frequency', f.value)}
                  className={`px-3 py-2 rounded-xl font-medium transition text-sm ${
                    formData.frequency === f.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {formData.frequency === 'custom' && (
              <div className="flex gap-1.5 mt-3">
                {weekDays.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleCustomDay(day)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      formData.customDays.includes(day)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-white/40 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Who</label>
            <div className="flex gap-2">
              {['Mike', 'Adam', 'Both'].map(person => (
                <button
                  key={person}
                  onClick={() => updateField('assignedTo', person)}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
                    formData.assignedTo === person
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {person}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 shrink-0" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-5 h-5" />
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
});

AddHabitModal.displayName = 'AddHabitModal';
export default AddHabitModal;
