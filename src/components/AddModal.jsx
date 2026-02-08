// AddModal Component - uses local state to prevent focus loss, syncs with parent only on submit
import React, { useState } from 'react';
import { Plane, Hotel, Music, X, Check } from 'lucide-react';
import { airlines } from '../constants';

const AddModal = React.memo(({ type, tripId, onClose, addItem, updateItem, editItem }) => {
  // Local state - initialize with editItem data if editing
  const [formData, setFormData] = useState(editItem || {});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const isEditing = !!editItem;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      const hasData = Object.values(formData).some(v => v && v.toString().trim());
      if (hasData) {
        setShowConfirmClose(true);
      } else {
        onClose();
      }
    }
  };

  const handleClose = () => {
    const hasData = Object.values(formData).some(v => v && v.toString().trim());
    if (hasData) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const renderFlightForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Airline</label>
        <select
          value={formData.airline || ''}
          onChange={(e) => updateField('airline', e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none bg-white"
        >
          <option value="">Select airline...</option>
          {airlines.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Flight Number</label>
        <input
          type="text"
          placeholder="e.g., AA1234"
          value={formData.flightNo || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('flightNo', e.target.value.toUpperCase())}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
        <input
          type="date"
          value={formData.date || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('date', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Departure Time</label>
          <input
            type="time"
            value={formData.departTime || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('departTime', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Arrival Time</label>
          <input
            type="time"
            value={formData.arriveTime || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('arriveTime', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">From (Airport)</label>
          <input
            type="text"
            placeholder="e.g., GSO or JFK"
            value={formData.depart || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('depart', e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">To (Airport)</label>
          <input
            type="text"
            placeholder="e.g., LHR or LAX"
            value={formData.arrive || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('arrive', e.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Booking confirmation code"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value.toUpperCase())}
        />
      </div>
    </div>
  );

  const renderHotelForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Hotel Name</label>
        <input
          type="text"
          placeholder="e.g., The Standard, Marriott..."
          value={formData.name || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Address (optional)</label>
        <input
          type="text"
          placeholder="Hotel address"
          value={formData.address || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Check-in Date</label>
          <input
            type="date"
            value={formData.checkIn || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('checkIn', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Check-out Date</label>
          <input
            type="date"
            value={formData.checkOut || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('checkOut', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Booking confirmation code"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value.toUpperCase())}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Notes (optional)</label>
        <textarea
          placeholder="Room type, special requests..."
          value={formData.notes || ''}
          rows={2}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none resize-none"
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEventForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Event Name</label>
        <input
          type="text"
          placeholder="e.g., Harry Styles Concert, Broadway Show..."
          value={formData.name || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Venue (optional)</label>
        <input
          type="text"
          placeholder="e.g., Madison Square Garden"
          value={formData.venue || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('venue', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
          <input
            type="date"
            value={formData.date || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
          <input
            type="time"
            value={formData.time || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
            onChange={(e) => updateField('time', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Tickets/Confirmation # (optional)</label>
        <input
          type="text"
          placeholder="Ticket confirmation or order number"
          value={formData.confirmation || ''}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none"
          onChange={(e) => updateField('confirmation', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Notes (optional)</label>
        <textarea
          placeholder="Seat numbers, dress code, etc..."
          value={formData.notes || ''}
          rows={2}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 outline-none resize-none"
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const getFormContent = () => {
    switch(type) {
      case 'flights': return renderFlightForm();
      case 'hotels': return renderHotelForm();
      case 'events': return renderEventForm();
      default: return null;
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'flights': return <Plane className="w-6 h-6 text-teal-500" />;
      case 'hotels': return <Hotel className="w-6 h-6 text-purple-500" />;
      case 'events': return <Music className="w-6 h-6 text-pink-500" />;
      default: return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85dvh] overflow-y-auto">
        {showConfirmClose && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-3xl">
            <div className="bg-white rounded-2xl p-6 m-4 shadow-xl">
              <p className="text-slate-800 font-medium mb-4">Discard your changes?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                >
                  Keep Editing
                </button>
                <button
                  onClick={() => {
                    setFormData({});
                    onClose();
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {getIcon()}
            {isEditing ? 'Edit' : 'Add'} {type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {getFormContent()}

        <button
          onClick={() => {
            if (isEditing) {
              updateItem(tripId, type, editItem.id, formData);
            } else {
              addItem(tripId, type, formData);
            }
            setFormData({});
            onClose();
          }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {isEditing ? 'Save Changes' : 'Add to Trip'}
        </button>
      </div>
    </div>
  );
});

export default AddModal;
