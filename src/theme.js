/**
 * Centralized theme configuration for the Travel Planner app
 * Eliminates hardcoded colors and spacing throughout components
 */

export const colors = {
  // Primary colors by section
  travel: { border: 'border-teal-500/20', bg: 'from-teal-950/30', shadow: 'shadow-[0_0_30px_rgba(20,184,166,0.06)]', text: 'text-teal-400', lightText: 'text-teal-300' },
  fitness: { border: 'border-blue-500/20', bg: 'from-blue-950/30', shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.06)]', text: 'text-blue-400', lightText: 'text-blue-300' },
  events: { border: 'border-orange-500/20', bg: 'from-orange-950/30', shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.06)]', text: 'text-orange-400', lightText: 'text-orange-300' },
  memories: { border: 'border-pink-500/20', bg: 'from-pink-950/30', shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.06)]', text: 'text-pink-400', lightText: 'text-pink-300' },
  hub: { border: 'border-purple-500/20', bg: 'from-purple-950/30', shadow: 'shadow-[0_0_30px_rgba(139,92,246,0.06)]', text: 'text-purple-400', lightText: 'text-purple-300' },

  // Hub subsections
  tasks: { border: 'border-teal-500/20', bg: 'from-teal-950/30', text: 'text-teal-400', lightText: 'text-teal-300', badge: 'bg-teal-500/20' },
  lists: { border: 'border-emerald-500/20', bg: 'from-emerald-950/30', text: 'text-emerald-400', lightText: 'text-emerald-300', badge: 'bg-emerald-500/20' },
  ideas: { border: 'border-amber-500/20', bg: 'from-amber-950/30', text: 'text-amber-400', lightText: 'text-amber-300', badge: 'bg-amber-500/20' },
  social: { border: 'border-purple-500/20', bg: 'from-purple-950/30', text: 'text-purple-400', lightText: 'text-purple-300', badge: 'bg-purple-500/20' },
  habits: { border: 'border-rose-500/20', bg: 'from-rose-950/30', text: 'text-rose-400', lightText: 'text-rose-300', badge: 'bg-rose-500/20' },

  // Status indicators for cards
  priority: {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/60', shadow: 'shadow-red-500/20' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-400/40', shadow: 'shadow-amber-500/10' },
    low: { bg: 'bg-slate-500/20', text: 'text-slate-400', ring: 'ring-slate-500/20', shadow: 'shadow-slate-500/10' },
  },

  status: {
    highlight: { ring: 'ring-amber-400/70', shadow: 'shadow-amber-500/20' },
    unstarted: { ring: 'ring-yellow-400/50', border: 'border-yellow-500/40', shadow: 'shadow-yellow-500/15' },
    open: { ring: 'ring-yellow-400/50', shadow: 'shadow-yellow-500/15' },
    inbox: { ring: 'ring-cyan-400/40', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/10' },
    lowConsistency: { ring: 'ring-red-400/40', border: 'border-red-500/30', shadow: 'shadow-red-500/15' },
  },

  // Gradients
  gradients: {
    teal: 'from-teal-400 to-cyan-500',
    emerald: 'from-emerald-400 to-teal-500',
    purple: 'from-purple-400 to-violet-500',
    amber: 'from-amber-400 to-orange-500',
    blue: 'from-blue-400 to-cyan-500',
    rose: 'from-rose-400 to-pink-500',
    primary: 'from-teal-400 to-cyan-500',
    secondary: 'from-emerald-400 to-teal-500',
  },

  // Utility colors
  background: { light: 'bg-white/[0.05]', lighter: 'bg-white/[0.08]', card: 'bg-white/[0.05]' },
  border: { light: 'border-white/[0.08]', lighter: 'border-white/[0.12]' },
  text: { primary: 'text-white', secondary: 'text-white/70', tertiary: 'text-white/40', muted: 'text-white/25' },
};

export const spacing = {
  // Gaps between items
  cardGap: 'gap-3',
  itemGap: 'gap-2',
  sectionGap: 'gap-6',
  tightGap: 'gap-1.5',

  // Padding for cards and sections
  cardPadding: 'p-4',
  sectionPadding: 'p-4',
  compactPadding: 'p-3',
  largePadding: 'p-6',

  // Padding for inner content
  contentPaddingX: 'px-4',
  contentPaddingY: 'py-2',

  // Margin spacing
  sectionMargin: 'mb-6',
  cardMargin: 'mb-3',
};

export const sizing = {
  // Border radius
  cardRadius: 'rounded-2xl',
  smallRadius: 'rounded-xl',
  tinyRadius: 'rounded-lg',

  // Icon sizes
  iconSmall: 'w-3 h-3',
  iconBase: 'w-4 h-4',
  iconLarge: 'w-5 h-5',
  iconXL: 'w-6 h-6',

  // Button sizes
  buttonSmall: 'px-2 py-1 text-xs',
  buttonBase: 'px-3 py-2 text-sm',
  buttonLarge: 'px-4 py-3 text-base',
};

// Helper function to get theme colors for a section
export const getSectionTheme = (section) => {
  const themes = {
    travel: colors.travel,
    fitness: colors.fitness,
    events: colors.events,
    memories: colors.memories,
    hub: colors.hub,
    tasks: colors.tasks,
    lists: colors.lists,
    ideas: colors.ideas,
    social: colors.social,
    habits: colors.habits,
  };
  return themes[section] || colors.hub;
};

// Helper to build section container className
export const getSectionContainerClass = (section) => {
  const theme = getSectionTheme(section);
  return `rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} via-slate-900/50 to-slate-950/40 backdrop-blur-xl ${theme.shadow}`;
};

// Helper to build card className
export const getCardClass = (highlighted, statusOverride) => {
  const baseClass = `${colors.background.card} backdrop-blur-md border ${colors.border.light} ${sizing.cardRadius} transition-all hover:${colors.background.lighter}`;

  if (highlighted) {
    return `${baseClass} ring-2 ${colors.status.highlight.ring} shadow-lg ${colors.status.highlight.shadow}`;
  }

  if (statusOverride) {
    return `${baseClass} ring-1 ${statusOverride.ring} shadow-lg ${statusOverride.shadow}`;
  }

  return baseClass;
};

export default {
  colors,
  spacing,
  sizing,
  getSectionTheme,
  getSectionContainerClass,
  getCardClass,
};
