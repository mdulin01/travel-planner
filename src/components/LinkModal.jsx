// LinkModal Component - extracted to fix React hooks error
import React, { useState } from 'react';
import { X, Link, Globe, Loader, Hotel, Plane, Music, MapPin, Star } from 'lucide-react';

const LinkModal = ({ tripId, onClose, addLink }) => {
  const [linkData, setLinkData] = useState({ url: '', title: '', description: '', image: '', category: 'other' });
  const [isLoading, setIsLoading] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const categories = [
    { value: 'hotel', label: '🏨 Hotel', icon: Hotel },
    { value: 'flight', label: '✈️ Flight', icon: Plane },
    { value: 'event', label: '🎭 Event', icon: Music },
    { value: 'restaurant', label: '🍽️ Restaurant', icon: MapPin },
    { value: 'attraction', label: '🎡 Attraction', icon: Star },
    { value: 'other', label: '🔗 Other', icon: Link }
  ];

  const fetchPreview = async () => {
    if (!linkData.url) return;
    setIsLoading(true);
    setTimeout(() => {
      const url = linkData.url.toLowerCase();
      let category = 'other';
      if (url.includes('hotel') || url.includes('booking') || url.includes('airbnb') || url.includes('marriott') || url.includes('hilton')) {
        category = 'hotel';
      } else if (url.includes('airline') || url.includes('delta') || url.includes('united') || url.includes('flight')) {
        category = 'flight';
      } else if (url.includes('ticketmaster') || url.includes('broadway') || url.includes('concert') || url.includes('event')) {
        category = 'event';
      } else if (url.includes('yelp') || url.includes('opentable') || url.includes('restaurant')) {
        category = 'restaurant';
      }
      setLinkData(prev => ({ ...prev, category }));
      setIsLoading(false);
      setPreviewLoaded(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Link className="w-6 h-6 text-purple-500" />
            Add Link
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={linkData.url}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
                onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
              />
              <button
                onClick={fetchPreview}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition flex items-center gap-1"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Fetch
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setLinkData({ ...linkData, category: cat.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    linkData.category === cat.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g., The Standard Hotel"
              value={linkData.title}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Description (optional)</label>
            <input
              type="text"
              placeholder="Brief description..."
              value={linkData.description}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://... (paste image URL)"
              value={linkData.image}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none"
              onChange={(e) => setLinkData({ ...linkData, image: e.target.value })}
            />
            {linkData.image && (
              <div className="mt-2 relative">
                <img src={linkData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Tip: Right-click an image on website → "Copy image address"</p>
          </div>

          <button
            onClick={() => {
              if (linkData.url && linkData.title) {
                addLink(tripId, linkData);
                onClose();
              }
            }}
            disabled={!linkData.url || !linkData.title}
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Link className="w-5 h-5" />
            Add Link to Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
