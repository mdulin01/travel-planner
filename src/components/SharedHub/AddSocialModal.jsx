import React, { useState } from 'react';
import { X, Check, Calendar, Users, Link2, ExternalLink, User } from 'lucide-react';
import { socialTypes } from '../../constants';
import { getDomainFromUrl } from '../../utils';

const AddSocialModal = React.memo(({
  onClose,
  onSave,
  editSocial,
  currentUser,
  partyEvents,
  onLinkToEvent,
}) => {
  const [formData, setFormData] = useState(editSocial ? {
    type: editSocial.type || 'text',
    person: editSocial.person || '',
    title: editSocial.title || '',
    description: editSocial.description || '',
    url: editSocial.url || '',
    date: editSocial.date || '',
    assignedTo: editSocial.assignedTo || 'Both',
    linkedEvent: editSocial.linkedEvent || null,
  } : {
    type: 'text',
    person: '',
    title: '',
    description: '',
    url: '',
    date: '',
    assignedTo: 'Both',
    linkedEvent: null,
  });

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isEditing = !!editSocial;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      const hasData = formData.person.trim() || formData.title.trim();
      if (hasData) {
        setShowConfirmClose(true);
      } else {
        onClose();
      }
    }
  };

  const handleClose = () => {
    const hasData = formData.person.trim() || formData.title.trim();
    if (hasData) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!formData.person.trim() && !formData.title.trim()) {
      setValidationError('Add a person or title');
      return;
    }

    const social = {
      id: editSocial?.id || Date.now(),
      type: formData.type,
      person: formData.person.trim(),
      title: formData.title.trim() || `${socialTypes.find(t => t.value === formData.type)?.emoji || '👋'} ${formData.person.trim()}`,
      description: formData.description.trim(),
      url: formData.url.trim(),
      date: formData.date,
      assignedTo: formData.assignedTo,
      linkedEvent: formData.linkedEvent,
      status: editSocial?.status || 'planned',
      addedBy: currentUser,
      createdAt: editSocial?.createdAt || new Date().toISOString(),
    };

    onSave(social);
  };

  const selectedType = socialTypes.find(t => t.value === formData.type);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-lg mx-auto w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Gradient header bar */}
        <div className="h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-violet-500" />

        {/* Confirm close overlay */}
        {showConfirmClose && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-3xl">
            <div className="bg-slate-800 rounded-2xl p-6 m-4 shadow-xl border border-slate-700">
              <p className="text-white font-medium mb-4">Discard your changes?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition"
                >
                  Keep Editing
                </button>
                <button
                  onClick={() => { setFormData({}); onClose(); }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              {isEditing ? 'Edit Social' : 'Plan Social'}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700 rounded-full transition text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {socialTypes.map(st => (
                <button
                  key={st.value}
                  onClick={() => updateField('type', st.value)}
                  className={`py-2 px-2 rounded-xl font-medium transition flex flex-col items-center gap-1 text-xs ${
                    formData.type === st.value
                      ? 'bg-gradient-to-r from-purple-400 to-violet-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{st.emoji}</span>
                  <span className="hidden sm:block">{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Person / Group */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Who *
            </label>
            <input
              type="text"
              placeholder="Person or group name"
              value={formData.person}
              onChange={(e) => updateField('person', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition"
            />
            {validationError && (
              <p className="text-red-400 text-sm mt-1">{validationError}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder={`e.g. "${selectedType?.emoji || ''} Catch up with..."`}
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition"
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Notes
            </label>
            <textarea
              placeholder="Reminder notes, talking points..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition resize-none"
            />
          </div>

          {/* URL / Link */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link
            </label>
            <input
              type="url"
              placeholder="Restaurant, venue, or meeting link..."
              value={formData.url}
              onChange={(e) => updateField('url', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition"
            />
            {formData.url && getDomainFromUrl(formData.url) && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-600 rounded-lg text-sm text-teal-400 mt-2">
                <span>{getDomainFromUrl(formData.url)}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              When
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition"
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Who's Reaching Out
            </label>
            <div className="flex gap-2">
              {['Mike', 'Adam', 'Both'].map(person => (
                <button
                  key={person}
                  onClick={() => updateField('assignedTo', person)}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
                    formData.assignedTo === person
                      ? 'bg-gradient-to-r from-purple-400 to-violet-500 text-white'
                      : 'bg-slate-700 text-white/60 hover:text-white'
                  }`}
                >
                  {person}
                </button>
              ))}
            </div>
          </div>

          {/* Link to Event */}
          {partyEvents && partyEvents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                🎉 Link to Event
              </label>
              <select
                value={formData.linkedEvent || ''}
                onChange={(e) => updateField('linkedEvent', e.target.value || null)}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-purple-400 focus:outline-none transition"
              >
                <option value="">None</option>
                {partyEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 shrink-0" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-pink-400 via-purple-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Check className="w-5 h-5" />
            {isEditing ? 'Save Changes' : 'Plan It'}
          </button>
        </div>
      </div>
    </div>
  );
});

AddSocialModal.displayName = 'AddSocialModal';
export default AddSocialModal;
