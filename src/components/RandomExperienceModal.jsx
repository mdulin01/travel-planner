// RandomExperienceModal Component - extracted to fix React hooks error
import React, { useState } from 'react';
import { X, Sparkles, Heart, Calendar } from 'lucide-react';
import { tripColors, bougieLabels } from '../constants';
import { getRandomExperience } from '../utils';

// Starburst decoration
const Starburst = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <g transform="translate(50,50)">
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2="45"
          stroke="currentColor"
          strokeWidth="2"
          transform={`rotate(${i * 30})`}
        />
      ))}
      <circle cx="0" cy="0" r="8" fill="currentColor" />
    </g>
  </svg>
);

const RandomExperienceModal = ({
  onClose,
  wishlist,
  setWishlist,
  saveToFirestore,
  setShowNewTripModal
}) => {
  const [filters, setFilters] = useState({ type: 'any', vibes: [], bougie: 0 });
  const [experience, setExperience] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const toggleVibe = (vibe) => {
    setFilters(prev => ({
      ...prev,
      vibes: prev.vibes.includes(vibe)
        ? prev.vibes.filter(v => v !== vibe)
        : [...prev.vibes, vibe]
    }));
  };

  const generateExperience = () => {
    setIsSpinning(true);
    setExperience(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomExp = getRandomExperience(filters.type, filters.vibes, filters.bougie);
      setExperience(randomExp);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 150);
  };

  const addToWishlist = () => {
    if (!experience) return;
    const colorSet = tripColors[Math.floor(Math.random() * tripColors.length)];
    const newWishlistItem = {
      id: Date.now(),
      destination: experience.destination,
      emoji: experience.emoji,
      ...colorSet,
      isWishlist: true,
      notes: `${experience.typeLabel} • ${experience.description}`
    };
    const newWishlist = [...wishlist, newWishlistItem];
    setWishlist(newWishlist);
    saveToFirestore(null, newWishlist, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <div className="flex justify-between items-center mb-6 mt-2">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🎲 Random Adventure Generator
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">Adventure Type</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { value: 'any', label: '🎲', title: 'Any' },
              { value: 'dayTrip', label: '🚗', title: 'Day Trip' },
              { value: 'train', label: '🚂', title: 'Train' },
              { value: 'cruise', label: '🚢', title: 'Cruise' },
              { value: 'flight', label: '✈️', title: 'Flight' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                className={`p-3 rounded-xl text-center transition ${
                  filters.type === type.value
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="text-2xl">{type.label}</div>
                <div className="text-xs mt-1">{type.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">Vibes (select any)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleVibe('gay')}
              className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                filters.vibes.includes('gay')
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🏳️‍🌈 Gay-Friendly
            </button>
            <button
              onClick={() => toggleVibe('artsy')}
              className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                filters.vibes.includes('artsy')
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🎨 Artsy
            </button>
            <button
              onClick={() => toggleVibe('glutenFree')}
              className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                filters.vibes.includes('glutenFree')
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🌾 Gluten-Free Friendly
            </button>
          </div>
        </div>

        {/* Bougie Level Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Bougie Level {filters.bougie > 0 && <span className="text-purple-500">({bougieLabels[filters.bougie - 1]?.label})</span>}
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, bougie: 0 }))}
              className={`flex-1 py-2 px-2 rounded-l-xl text-center transition text-sm ${
                filters.bougie === 0
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Any
            </button>
            {bougieLabels.map((b) => (
              <button
                key={b.level}
                onClick={() => setFilters(prev => ({ ...prev, bougie: b.level }))}
                className={`flex-1 py-2 px-1 text-center transition ${
                  b.level === bougieLabels.length ? 'rounded-r-xl' : ''
                } ${
                  filters.bougie === b.level
                    ? b.level <= 2 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
                      : b.level === 3 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                      : b.level === 4 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
                title={b.description}
              >
                <div className="text-lg">{b.emoji}</div>
                <div className="text-xs hidden md:block">{b.level}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
            <span>Budget-friendly</span>
            <span>Ultra-luxury</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateExperience}
          disabled={isSpinning}
          className={`w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 ${isSpinning ? 'animate-pulse' : ''}`}
        >
          {isSpinning ? (
            <>
              <span className="animate-spin">🎲</span>
              Finding your adventure...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {experience ? 'Spin Again!' : 'Generate Adventure!'}
            </>
          )}
        </button>

        {/* Result */}
        {experience && !isSpinning && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl p-5 text-white relative overflow-hidden">
              <Starburst className="absolute -right-8 -bottom-8 w-32 h-32 text-white/10" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{experience.typeLabel}</span>
                      {experience.bougie && (
                        <span className="text-xs bg-gradient-to-r from-yellow-400/30 to-amber-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                          {bougieLabels[experience.bougie - 1]?.emoji} {bougieLabels[experience.bougie - 1]?.label}
                        </span>
                      )}
                    </div>
                    <h4 className="text-2xl font-bold mt-2 flex items-center gap-2">
                      <span className="text-3xl">{experience.emoji}</span>
                      {experience.destination}
                    </h4>
                  </div>
                </div>
                <p className="opacity-90 mb-3">{experience.description}</p>
                {experience.distance && (
                  <p className="text-sm opacity-80">📍 {experience.distance} from Greensboro</p>
                )}
                {experience.duration && (
                  <p className="text-sm opacity-80">⏱️ {experience.duration}</p>
                )}
                {experience.highlights && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Highlights:</p>
                    <div className="flex flex-wrap gap-1">
                      {experience.highlights.map((h, i) => (
                        <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded-full">{h}</span>
                      ))}
                    </div>
                  </div>
                )}
                {experience.ports && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Ports of Call:</p>
                    <p className="text-sm opacity-80">{experience.ports.join(' → ')}</p>
                  </div>
                )}
                {experience.vibes && (
                  <div className="mt-3 flex gap-1">
                    {experience.vibes.includes('gay') && <span className="text-lg">🏳️‍🌈</span>}
                    {experience.vibes.includes('artsy') && <span className="text-lg">🎨</span>}
                    {experience.vibes.includes('glutenFree') && <span className="text-lg">🌾</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={addToWishlist}
                className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>
              <button
                onClick={() => {
                  setShowNewTripModal('adventure');
                  onClose();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book It Now!
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-4">
          ✨ {filters.vibes.length === 0 && filters.bougie === 0
            ? 'Select vibes or bougie level to narrow options!'
            : `Filtering: ${[
                ...filters.vibes,
                filters.bougie > 0 ? bougieLabels[filters.bougie - 1]?.label : ''
              ].filter(Boolean).join(', ')}`
          }
        </p>
      </div>
    </div>
  );
};

export default RandomExperienceModal;
