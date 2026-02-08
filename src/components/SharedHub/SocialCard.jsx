import React, { useState, useRef } from 'react';
import { Check, Pencil, Trash2, ExternalLink, Users, MoreVertical, Star } from 'lucide-react';
import { getDomainFromUrl } from '../../utils';
import PortalMenu from './PortalMenu';
import { useSharedHub } from '../../contexts/SharedHubContext';

const SocialCard = React.memo(({ social, onNavigateToEvent, getEventLabel }) => {
  const { completeSocial, deleteSocial, highlightSocial, setShowAddSocialModal } = useSharedHub();
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const touchStartRef = useRef(null);
  const menuRef = useRef(null);

  const isDone = social.status === 'done';
  const isOpen = !isDone; // non-done social items

  const typeEmojis = {
    text: '💬', call: '📞', meetup: '☕', gathering: '🎉',
    invite: '✉️', dinner: '🍽️', activity: '🎳', other: '👋',
  };
  const emoji = typeEmojis[social.type] || '👋';

  const assigneeLower = (social.assignedTo || '').toLowerCase();
  const assigneeLabel = assigneeLower === 'both' ? 'M & A' : assigneeLower === 'mike' ? 'M' : 'A';

  const domain = social.url ? getDomainFromUrl(social.url) : null;
  const eventLabel = social.linkedEvent && getEventLabel ? getEventLabel(social.linkedEvent) : null;

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setSwiping(false);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setSwiping(true);
      setSwipeX(Math.max(-100, Math.min(0, dx)));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -80) {
      deleteSocial(social.id);
    }
    setSwipeX(0);
    setSwiping(false);
    touchStartRef.current = null;
  };

  return (
    <div className={`relative rounded-2xl ${social.highlighted ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-500/20' : isOpen ? 'ring-1 ring-yellow-400/50 shadow-lg shadow-yellow-500/15' : ''}`}>
      {swipeX < 0 && (
        <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center rounded-2xl">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`relative flex items-center gap-3 p-3 bg-white/[0.05] backdrop-blur-md border border-white/[0.08] rounded-2xl transition-all ${isDone ? 'opacity-40' : 'hover:bg-white/[0.08]'}`}
        style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Checkbox */}
        <button
          onClick={() => completeSocial(social.id)}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isDone
              ? 'bg-gradient-to-br from-purple-400 to-violet-500 border-purple-400'
              : 'border-slate-500 hover:border-purple-400'
          }`}
        >
          {isDone && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium flex items-center gap-1.5 ${isDone ? 'line-through text-white/40' : 'text-white'}`}>
            {social.highlighted && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
            {emoji} {social.person || social.title}
          </div>
          {social.person && social.title && social.title !== social.person && (
            <div className="text-xs text-white/40 mt-0.5 truncate">{social.title}</div>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Assignee */}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              {assigneeLabel}
            </span>
            {/* Date */}
            {social.date && (
              <span className="text-[10px] text-white/40">
                {new Date(social.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {/* URL */}
            {domain && (
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1 hover:bg-blue-500/30 transition"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {domain}
              </a>
            )}
            {/* Linked event */}
            {eventLabel && (
              <button
                onClick={(e) => { e.stopPropagation(); onNavigateToEvent && onNavigateToEvent(social.linkedEvent); }}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1 hover:bg-amber-500/30 transition"
              >
                🎉 {eventLabel}
              </button>
            )}
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <PortalMenu anchorRef={menuRef} show={showMenu} onClose={() => setShowMenu(false)}>
            <button
              onClick={() => { setShowMenu(false); setShowAddSocialModal(social); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => { setShowMenu(false); highlightSocial(social.id); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
            >
              <Star className={`w-3.5 h-3.5 ${social.highlighted ? 'text-amber-400 fill-amber-400' : ''}`} />
              {social.highlighted ? 'Unhighlight' : 'Highlight'}
            </button>
            <button
              onClick={() => { setShowMenu(false); deleteSocial(social.id); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </PortalMenu>
        </div>
      </div>
    </div>
  );
});

SocialCard.displayName = 'SocialCard';
export default SocialCard;
