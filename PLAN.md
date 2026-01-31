# Mike & Adam's Life Planner - Expansion Plan

## Overview
Expand the existing Travel Planner into a comprehensive life planning app with 4 main sections:
1. **Travel** (existing)
2. **Fitness** (new)
3. **Nutrition** (new)
4. **Life Planning** (new)

---

## Architecture Changes

### 1. Add Top-Level Navigation
- Add `activeSection` state to switch between sections
- Create a nav bar with 4 tabs: Travel, Fitness, Nutrition, Life Planning
- Each section renders conditionally based on active tab

### 2. Firebase Data Structure
Extend the existing `tripData/shared` document:
```javascript
{
  // Existing
  trips: [...],
  wishlist: [...],
  tripDetails: {...},

  // New - Fitness
  fitness: {
    events: [
      { id, name, date, emoji, type: 'half-marathon'|'triathlon'|'other' }
    ],
    trainingPlans: [
      {
        id,
        eventId,
        weeks: [
          {
            weekNumber,
            startDate,
            runs: [{ day, distance, type, completed, notes }],
            crossTraining: [{ day, type, duration, completed, notes }],
            weekNotes: ''
          }
        ]
      }
    ]
  },

  // New - Nutrition
  nutrition: {
    recipes: [
      { id, name, ingredients: [], instructions, prepTime, cookTime, servings, tags: [], addedBy }
    ],
    mealPlan: {
      // Keyed by date (YYYY-MM-DD)
      '2026-03-15': {
        breakfast: { recipeId?, name, chef: 'Mike'|'Adam' },
        lunch: { recipeId?, name, chef },
        dinner: { recipeId?, name, chef }
      }
    },
    groceryLists: [
      { id, weekOf, items: [{ name, quantity, checked, category }] }
    ]
  },

  // New - Life Planning
  lifePlanning: {
    goals: [
      { id, title, category: 'living'|'retirement'|'career'|'other', targetDate?, milestones: [], status }
    ],
    decisions: [
      { id, title, options: [{ name, pros: [], cons: [], score? }], status: 'open'|'decided', decidedOption? }
    ],
    notes: '' // Shared notes for discussions
  }
}
```

---

## Section Details

### Fitness Section

**Features:**
1. **Event Cards** - Upcoming fitness events with countdown (like trip cards)
   - Indy Half Marathon: May 2, 2026
   - Triathlon: Sept 26, 2026

2. **Training Plan View**
   - Weekly tracker from now until event
   - Each week shows:
     - 3 run slots (with distance/type)
     - 2 cross-training slots
     - Checkbox to mark complete
     - Notes field for the week
   - 2-week recovery period after events
   - Auto-generate weeks based on event date

3. **Progress Stats**
   - Total miles logged
   - Workouts completed this week
   - Streak tracking

**UI Pattern:** Similar to trip cards + calendar view

---

### Nutrition Section

**Features:**
1. **Recipe Collection**
   - Add/edit recipes with ingredients & instructions
   - Tag recipes (breakfast, dinner, quick, etc.)
   - Search/filter recipes

2. **Weekly Meal Planner**
   - Calendar view for the week
   - Assign recipes or custom meals to breakfast/lunch/dinner
   - **Who's cooking**: Mike or Adam toggle for each meal
   - Visual indicator of cooking balance

3. **Grocery List**
   - Auto-generate from meal plan
   - Add custom items
   - Check off items while shopping
   - Organize by category (produce, dairy, etc.)

**UI Pattern:** Cards for recipes, calendar for meal plan

---

### Life Planning Section

**Features:**
1. **Life Goals**
   - Add big goals (where to live, retirement plans, etc.)
   - Set target dates and milestones
   - Track progress

2. **Decision Tracker**
   - Create decisions with multiple options
   - Add pros/cons for each option
   - Score options
   - Mark as decided

3. **Shared Notes**
   - Rich text area for ongoing discussions
   - Both can edit

**UI Pattern:** Cards for goals, comparison table for decisions

---

## Implementation Order

### Phase 1: Navigation & Structure
1. Add `activeSection` state
2. Create top-level navigation tabs
3. Wrap existing content in "Travel" section
4. Create placeholder components for other sections

### Phase 2: Fitness Section
1. Add fitness data to Firebase
2. Create event cards with countdown
3. Build weekly training tracker
4. Add Indy Half Marathon (May 2) and Triathlon (Sept 26)
5. Generate training weeks automatically

### Phase 3: Nutrition Section
1. Add nutrition data to Firebase
2. Create recipe cards and add/edit modal
3. Build weekly meal planner with chef toggle
4. Create grocery list with auto-generation

### Phase 4: Life Planning Section
1. Add life planning data to Firebase
2. Create goals with milestones
3. Build decision comparison tool
4. Add shared notes

---

## Visual Design
- Maintain existing gradient/rainbow theme
- Each section gets its own accent color:
  - Travel: Teal/Cyan (existing)
  - Fitness: Orange/Red (energetic)
  - Nutrition: Green/Lime (fresh)
  - Life Planning: Purple/Indigo (thoughtful)
- Same card-based UI patterns throughout
- Same modal patterns for add/edit
