import React, { useState, useRef } from 'react';
import { Check, Pencil, Trash2, MoreVertical, Star, Zap, Target, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import PortalMenu from './PortalMenu';
import { useSharedHub } from '../../contexts/SharedHubContext';

const HabitCard = React.memo(({ habit, currentUser }) => {
  const { toggleHabitDay, deleteHabit, highlightHabit, setShowAddHabitModal } = useSharedHub();
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];
  const isDoneToday = habit.log?.[todayKey] === true;

  // Compute consistency percentage
  const computeConsistency = () => {
    const log = habit.log || {};
    const createdAt = new Date(habit.createdAt);
    createdAt.setHours(0, 0, 0, 0);

    // Count applicable days and completed days in last 30 days (or since creation)
    const startDate = new Date(Math.max(createdAt.getTime(), today.getTime() - 30 * 24 * 60 * 60 * 1000));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let applicable = 0;
    let completed = 0;

    const d = new Date(startDate);
    while (d <= today) {
      const dayName = dayNames[d.getDay()];
      const dateKey = d.toISOString().split('T')[0];
      let isApplicable = false;

      if (habit.frequency === 'daily') {
        isApplicable = true;
      } else if (habit.frequency === 'weekdays') {
        isApplicable = d.getDay() >= 1 && d.getDay() <= 5;
      } else if (habit.frequency === 'weekends') {
        isApplicable = d.getDay() === 0 || d.getDay() === 6;
      } else if (habit.frequency === 'weekly') {
        // Applicable once per week — on the day it was created
        isApplicable = d.getDay() === createdAt.getDay();
      } else if (habit.frequency === 'custom' && habit.customDays) {
        isApplicable = habit.customDays.includes(dayName);
      }

      if (isApplicable) {
        applicable++;
        if (log[dateKey]) completed++;
      }

      d.setDate(d.getDate() + 1);
    }

    return applicable > 0 ? Math.round((completed / applicable) * 100) : 0;
  };

  const consistency = computeConsistency();
  const isLowConsistency = consistency < 50 && consistency > 0;

  // Build last 7 days for mini-heatmap
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    last7Days.push({ key, label: dayLabel, done: habit.log?.[key] === true, isToday: i === 0 });
  }

  const assigneeLower = (habit.assignedTo || '').toLowerCase();
  const assigneeLabel = assigneeLower === 'both' ? 'M & A' : assigneeLower === 'mike' ? 'M' : 'A';

  // Consistency color
  const getConsistencyColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRingColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-white/[0.05] backdrop-blur-md border rounded-2xl transition-all hover:bg-white/[0.08] ${habit.highlighted ? 'border-amber-400/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/60' : isLowConsistency ? 'border-red-500/30 shadow-lg shadow-red-500/15 ring-1 ring-red-400/40' : 'border-white/[0.08]'}`}>
      <div className="flex items-center">
        {/* Today's check-in button */}
        <button
          onClick={() => toggleHabitDay(habit.id, todayKey)}
          className={`shrink-0 ml-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            isDoneToday
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400'
              : 'border-slate-500 hover:border-emerald-400'
          }`}
        >
          {isDoneToday && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Main content — tap to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 p-4 text-left hover:bg-white/5 transition min-w-0"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              {habit.highlighted && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
              <span className="mr-1">{habit.emoji}</span>
              <span className="truncate">{habit.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{assigneeLabel}</span>
              <span className={`text-xs font-bold ${getConsistencyColor(consistency)}`}>{consistency}%</span>
            </div>
          </div>

          {/* Mini consistency ring */}
          <div className="shrink-0 w-10 h-10 relative">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
              <circle
                cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                strokeDasharray={`${(consistency / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className={getRingColor(consistency)}
              />
            </svg>
          </div>

          <div className="shrink-0 text-white/30">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* 3-dot menu */}
        <div className="relative pr-2" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <PortalMenu anchorRef={menuRef} show={showMenu} onClose={() => setShowMenu(false)}>
            <button
              onClick={() => { setShowMenu(false); setShowAddHabitModal(habit); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => { setShowMenu(false); highlightHabit(habit.id); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-slate-600 transition text-left"
            >
              <Star className={`w-3.5 h-3.5 ${habit.highlighted ? 'text-amber-400 fill-amber-400' : ''}`} />
              {habit.highlighted ? 'Unhighlight' : 'Highlight'}
            </button>
            <button
              onClick={() => { setShowMenu(false); deleteHabit(habit.id); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </PortalMenu>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {/* 7-day heatmap */}
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Last 7 Days</div>
            <div className="flex gap-1.5">
              {last7Days.map(day => (
                <button
                  key={day.key}
                  onClick={() => toggleHabitDay(habit.id, day.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${
                    day.isToday ? 'ring-1 ring-white/20' : ''
                  }`}
                >
                  <span className="text-[9px] text-white/30">{day.label}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                    day.done
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}>
                    {day.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Habit loop details */}
          {(habit.cue || habit.routine || habit.reward) && (
            <div className="bg-slate-700/30 rounded-xl p-3 space-y-2">
              {habit.cue && (
                <div className="flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/30 uppercase">Cue</span>
                    <p className="text-xs text-white/70">{habit.cue}</p>
                  </div>
                </div>
              )}
              {habit.routine && (
                <div className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/30 uppercase">Routine</span>
                    <p className="text-xs text-white/70">{habit.routine}</p>
                  </div>
                </div>
              )}
              {habit.reward && (
                <div className="flex items-start gap-2">
                  <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/30 uppercase">Reward</span>
                    <p className="text-xs text-white/70">{habit.reward}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Identity statement */}
          {habit.identity && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <p className="text-xs text-amber-300/80 italic">"{habit.identity}"</p>
            </div>
          )}

          {/* Frequency info */}
          <div className="text-[10px] text-white/30">
            {habit.frequency === 'custom' && habit.customDays?.length > 0
              ? `Custom: ${habit.customDays.join(', ')}`
              : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)
            }
          </div>
        </div>
      )}
    </div>
  );
});

HabitCard.displayName = 'HabitCard';
export default HabitCard;
