# App Nomenclature & Coding Guide

Use these terms when describing changes to the app. They map directly to code concepts.

## Sections (top-level navigation)

| Term | Code value | Description |
|------|-----------|-------------|
| **Hub** | `activeSection === 'home'` | Home section: Tasks, Lists, Ideas, Social, Habits |
| **Travel** | `activeSection === 'travel'` | Trip planning with flights, hotels, packing, etc. |
| **Fitness** | `activeSection === 'fitness'` | Fitness events and training plans |
| **Events** | `activeSection === 'events'` | Party/social events (`partyEvents` array) |
| **Memories** | `activeSection === 'memories'` | Timeline of past experiences |

## Hub Sub-Views

| Term | Code value | Description |
|------|-----------|-------------|
| **Hub Home** | `hubSubView === 'home'` | Dashboard with today's tasks, active lists, stats |
| **Tasks view** | `hubSubView === 'tasks'` | Full task list with filters |
| **Lists view** | `hubSubView === 'lists'` | All lists (shopping, groceries, packing, etc.) |
| **Ideas view** | `hubSubView === 'ideas'` | Idea board |
| **Social view** | `hubSubView === 'social'` | Social connections |
| **Habits view** | `hubSubView === 'habits'` | Habit tracker with streaks |

## Hub Items

| Term | State array | Create modal | Key fields |
|------|------------|-------------|------------|
| **Task** | `sharedTasks` | `AddTaskModal` | title, timeHorizon, priority, assignedTo, linkedTo |
| **List** | `sharedLists` | `SharedListModal` | name, emoji, category, items[], linkedTo |
| **Idea** | `sharedIdeas` | `AddIdeaModal` | title, description, category |
| **Social** | `sharedSocial` | `AddSocialModal` | name, relationship |
| **Habit** | `sharedHabits` | `AddHabitModal` | name, category, frequency, cue/routine/reward |

## UI Components

| Term | Description | Example |
|------|------------|---------|
| **Card** | Visual tile in a grid | A trip card, event card, or memory card |
| **Detail View** | Full-screen panel for one item | `TripDetail` for a trip, `selectedPartyEvent` for an event |
| **Modal / Dialog** | Overlay form | `AddTaskModal`, `editingTrip` modal, `editingMemory` modal |
| **Edit Modal** | Quick-edit overlay (click card to open) | `editingTrip`, `editingPartyEvent`, `editingMemory` |
| **Badge** | Small pill/chip on a card | Linked task icon, priority indicator, status tag |
| **FAB** | Floating Action Button | The purple `+` button for creating items |
| **Toast** | Brief notification | "Trip updated!" message |
| **Bottom Nav** | Mobile tab bar | Hub / Travel / Fitness / Events / Memories tabs |
| **Section Nav** | Tabs within a detail view | Flights / Hotels / Packing tabs inside TripDetail |

## Cross-Linking

| Term | Description |
|------|------------|
| **linkedTo** | Field on a Task or List that connects it to a Section card |
| **Section names in linkedTo** | `'trips'` / `'fitnessEvents'` / `'partyEvents'` (from create modals) |
| **Reverse display** | Linked Hub items showing as badges on Travel/Event cards |
| **getLinkedHubItems(section, itemId)** | Helper that returns linked tasks and lists for a card |

## Data Flow

| Term | Description |
|------|------------|
| **State** | React useState hooks in `trip-planner.jsx` |
| **Firebase save** | `saveData()` / `saveSharedHub()` persists to Firestore |
| **Hook** | Custom React hook for logic (`useSharedHub`, `useTravel`, `useFitness`) |
| **Context** | `SharedHubContext` provides hub operations to child components |

## Key State Variables

```
selectedTrip        → which trip's TripDetail is open
editingTrip         → which trip's quick-edit modal is open
selectedPartyEvent  → which event's detail view is open
editingPartyEvent   → which event's quick-edit modal is open
editingMemory       → which memory's edit modal is open
showAddTaskModal    → task creation modal open
showSharedListModal → list creation modal open
showAddHabitModal   → habit creation modal open
```

## File Map

| File | What it contains |
|------|-----------------|
| `trip-planner.jsx` | Main component, all section rendering, inline modals |
| `components/TripDetail.jsx` | Full trip detail view (flights, hotels, packing, etc.) |
| `components/SharedHub/*.jsx` | Hub item modals (AddTaskModal, SharedListModal, etc.) |
| `components/SharedHub/TaskCard.jsx` | Individual task display component |
| `hooks/useSharedHub.js` | Task/list/idea/social/habit CRUD operations |
| `hooks/useTravel.js` | Trip CRUD operations |
| `hooks/useFitness.js` | Fitness event/training operations |
| `theme.js` | Centralized colors, gradients, section themes |
| `constants.js` | Emojis, color palettes, priority definitions |
| `utils.js` | Date formatting, URL parsing, helpers |

## Tips for Working with Claude on This App

1. **Reference items by their term** — "the Trip edit modal" is clearer than "the popup that shows when I click a trip"
2. **Specify the section** — "the Events card grid" vs "the Travel card grid"
3. **Name the file** — if you know which component, say "in TripDetail.jsx" or "in AddTaskModal"
4. **Describe the data** — "the linkedTo field on tasks" rather than "the linking thing"
5. **Be specific about state** — "when editingTrip is set" vs "when the thing opens"
6. **Screenshot + description combo** works well — attach a screenshot and say what's wrong
