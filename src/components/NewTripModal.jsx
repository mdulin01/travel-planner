// NewTripModal Component - extracted to fix React hooks error
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
        <div className="flex justify-between items-center mb-6 mt-2">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {isWishlist ? '🦄 Dream Destination' : isConvert ? '✨ Make It Real!' : '🌈 New Adventure'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Destination"
            value={formData.destination || ''}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
            onChange={(e) => handleDestinationChange(e.target.value)}
          />

          {/* Emoji Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Trip Icon</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 text-3xl bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition border-2 border-slate-200"
              >
                {currentEmoji}
              </button>
              <div className="text-sm text-slate-500">
                {formData.destination && !formData.emoji && (
                  <span className="text-purple-500">✨ Auto-suggested based on destination</span>
                )}
                {!formData.destination && <span>Click to choose an icon</span>}
              </div>
            </div>

            {/* Emoji Picker Grid */}
            {showEmojiPicker && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-10 gap-1">
                  {travelEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, emoji });
                        setShowEmojiPicker(false);
                      }}
                      className={`w-8 h-8 text-xl rounded-lg hover:bg-purple-100 transition flex items-center justify-center ${
                        currentEmoji === emoji ? 'bg-purple-200 ring-2 ring-purple-400' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">Or type any emoji in the box below</p>
                <input
                  type="text"
                  placeholder="Type or paste emoji..."
                  value={formData.emoji || ''}
                  className="w-full mt-2 px-3 py-2 text-center border border-slate-200 rounded-lg focus:border-purple-400 outline-none"
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                />
              </div>
            )}
          </div>
          {!isWishlist && (
            <>
              <input
                type="date"
                placeholder="Start Date"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <input
                type="date"
                placeholder="End Date"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </>
          )}
          {!isWishlist && (
            <input
              type="text"
              placeholder="Special occasion? (optional)"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setFormData({ ...formData, special: e.target.value })}
            />
          )}
          {isWishlist && (
            <input
              type="text"
              placeholder="Notes / Dreams (optional)"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          )}
          <button
            onClick={() => {
              if (isConvert) {
                // Remove from wishlist and add as trip
                const newWishlist = wishlist.filter(w => w.id !== type.item.id);
                setWishlist(newWishlist);
                saveToFirestore(null, newWishlist, null);
              }
              // Use currentEmoji which includes auto-suggested emoji
              addNewTrip({ ...formData, emoji: currentEmoji }, isWishlist);
            }}
            className="w-full py-3 bg-gradient-to-r from-teal-400 via-purple-400 to-indigo-400 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isWishlist ? 'Add to Wishlist' : isConvert ? 'Book This Dream!' : 'Add Adventure'}
          </button>
          <p className="text-xs text-slate-400 text-center">
            💡 Tip: Type a destination and we'll suggest an icon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewTripModal;
