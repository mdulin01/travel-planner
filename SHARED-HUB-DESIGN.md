# Shared Hub: Collaborative Life Planning System

## Design Document — February 2026

---

## The Problem

Mike and Adam currently coordinate across Apple Notes, shared Google Calendar, texts, and email. Ideas get lost in text threads. Shopping lists live in Notes with no connection to trips or meals. Life decisions (moving in together, career changes) have no structured place to live. There's no way to see "what do we need to do together this week?" across all the different areas of life.

## The Vision

A **Shared Hub** that replaces Apple Notes and becomes the couple's single coordination layer across all sections of the app. It combines three proven frameworks:

1. **Real-time collaborative lists** (replace Apple Notes)
2. **Designing Your Life** (direction and meaning for big decisions)
3. **Atomic Habits** (execution and daily progress)

The hub is not a separate section — it's a **connective layer** that surfaces in every section and aggregates on a redesigned Home page.

---

## Architecture Overview

### Core Concept: Everything Links

Every task, list, idea, and habit can optionally link to any section (trip, fitness event, party, memory, life goal). This means:

- "Buy gifts for nieces/nephew" is a task linked to the New York trip
- "Grocery shop for chicken tikka ingredients" is a list item linked to next week's meal plan
- "That restaurant Adam texted about" is a saved idea that can become a date night event
- "Research neighborhoods in [city]" is a task linked to the "Moving In Together" life goal

### Data Model (Firestore)

```
db/tripData/sharedHub {

  lists: [
    {
      id: string,
      title: string,
      emoji: string,
      category: 'shopping' | 'packing' | 'todo' | 'groceries' | 'custom',
      items: [{
        id: string,
        text: string,
        checked: boolean,
        addedBy: 'mike' | 'adam',
        checkedBy: string | null,
        quantity: string | null,
        notes: string | null,
        addedAt: ISO8601
      }],
      linkedTo: { section: string, itemId: string } | null,
      dueDate: string | null,
      recurring: { frequency: string, templateItems: [] } | null,
      assignedTo: 'mike' | 'adam' | 'both',
      status: 'active' | 'completed' | 'archived',
      createdBy: string,
      createdAt: ISO8601
    }
  ],

  tasks: [
    {
      id: string,
      title: string,
      description: string | null,
      timeHorizon: 'today' | 'this-week' | 'this-month' |
                   'this-quarter' | 'this-year' | 'someday',
      dueDate: string | null,
      assignedTo: 'mike' | 'adam' | 'both',
      linkedTo: { section: string, itemId: string } | null,
      status: 'pending' | 'in-progress' | 'completed',
      priority: 'low' | 'medium' | 'high' | 'urgent',
      tags: string[],
      createdBy: string,
      completedBy: string | null,
      createdAt: ISO8601,
      completedAt: ISO8601 | null
    }
  ],

  ideas: [
    {
      id: string,
      url: string | null,
      title: string,
      description: string | null,
      category: 'trip' | 'recipe' | 'date' | 'home' | 'gift' |
                'activity' | 'career' | 'other',
      tags: string[],
      addedBy: 'mike' | 'adam',
      status: 'inbox' | 'saved' | 'planned' | 'done' | 'rejected',
      linkedTo: { section: string, itemId: string } | null,
      notes: string | null,
      createdAt: ISO8601
    }
  ],

  habits: [
    {
      id: string,
      title: string,
      identityStatement: string,     // "We are becoming..."
      owner: 'mike' | 'adam' | 'both',
      frequency: 'daily' | 'weekly' | 'monthly',
      cue: string,                   // "After dinner..."
      routine: string,               // "Walk for 20 min"
      reward: string | null,         // "Watch an episode together"
      streak: number,
      bestStreak: number,
      completions: [{ date: string, completedBy: string }],
      linkedGoal: string | null,     // ties to life design goal
      active: boolean,
      createdAt: ISO8601
    }
  ],

  lifeDesign: {
    dashboard: {
      mike: { health: number, work: number, play: number,
              love: number, lastUpdated: ISO8601 },
      adam: { health: number, work: number, play: number,
              love: number, lastUpdated: ISO8601 }
    },
    odysseyPlans: [
      {
        id: string,
        title: string,
        description: string,
        author: 'mike' | 'adam' | 'shared',
        milestones: [{ year: number, description: string }],
        confidence: number,    // 0-100
        likeability: number,   // 0-100
        coherence: number,     // 0-100
        status: 'draft' | 'active' | 'archived'
      }
    ],
    gravityProblems: [
      {
        id: string,
        description: string,
        reframe: string,       // "Given this constraint, what becomes possible?"
        addedBy: string,
        acknowledged: boolean  // both partners accept this is a gravity problem
      }
    ],
    prototypes: [
      {
        id: string,
        title: string,
        hypothesis: string,    // "If we try X, we'll learn Y"
        linkedDecision: string,
        status: 'planned' | 'in-progress' | 'completed',
        outcome: string | null,
        nextStep: string | null
      }
    ],
    sharedIdentity: string[],  // "We are a couple that..."
    decisions: [
      {
        id: string,
        title: string,
        options: [{ label: string, pros: string[], cons: string[],
                    mikeVote: number | null, adamVote: number | null }],
        status: 'open' | 'decided' | 'archived',
        outcome: string | null,
        decidedAt: ISO8601 | null
      }
    ]
  }
}
```

---

## Feature Design

### 1. Shared Lists (Replaces Apple Notes)

**The CVS Example Flow:**
1. Mike creates "CVS Run" list (or taps a recurring template)
2. Adam gets a notification: "Mike's heading to CVS — add items now"
3. Adam adds "face wash" and "vitamins" from his phone
4. Mike sees items appear in real-time at the store
5. Mike checks items off as he shops — Adam sees live progress
6. When done, list auto-archives but stays searchable

**List Types:**
- **Shopping lists** — store-specific (CVS, grocery, Target) or general
- **Grocery lists** — linked to meal plan, auto-generated from recipes
- **Packing lists** — linked to trips (already exists, extend it)
- **To-do lists** — general shared checklists
- **Custom lists** — anything else (gift ideas, house stuff, etc.)

**Key UX Patterns:**
- Items show who added them (small avatar/initial)
- Checked items gray out but stay visible until list is archived
- "Add item" input always visible at top (no modal needed for single items)
- Swipe to check/uncheck on mobile
- Template system: save a list as template, regenerate from it (weekly groceries)

**Recurring Lists (Atomic Habits: Make It Easy):**
- Weekly grocery list regenerates every Sunday with saved template items
- Mike and Adam edit the running template over time
- Reduces decision fatigue — don't re-think the grocery list every week

### 2. Cross-Section Tasks

**Time Horizon Views:**

| View | What it shows | Use case |
|------|--------------|----------|
| Today | Tasks due today + overdue | Daily planning |
| This Week | Next 7 days | Weekly coordination |
| This Month | Next 30 days | Medium-term planning |
| This Quarter | Next 90 days | Goal milestones |
| This Year | Full year | Annual objectives |
| Someday | No due date | Backlog / ideas to revisit |

**Assignment Model:**
- **Mike's tasks** — only Mike sees in "My Tasks" view
- **Adam's tasks** — only Adam sees
- **Both** — appears for both, either can complete
- **Unassigned** — in shared backlog, either can claim

**Cross-Section Linking Examples:**

| Task | Linked Section | Context |
|------|---------------|---------|
| "Buy gifts for nieces/nephew" | Travel → NY Trip | Shows in trip detail AND task list |
| "Grocery shop: chicken tikka" | Nutrition → Meal Plan | Shows in meal plan AND shopping |
| "Research Astoria apartments" | Life Planning → Moving In | Shows in life goals AND tasks |
| "Book restaurant for V-Day" | Events → Valentine's | Shows in event AND tasks |
| "Pack resistance bands" | Fitness → Triathlon | Shows in training plan AND packing |

**Notification Philosophy (designed for couples, not teams):**
- Default: Daily digest at chosen time ("Here's what's on tap today")
- Urgent only: real-time push for items marked urgent
- No nagging: if a task is overdue, show it visually but don't send repeated notifications
- Encouragement > accountability: "You knocked out 4 tasks this week" not "3 tasks overdue"

### 3. Ideas Inbox (Replaces Texting Links)

**The Problem It Solves:**
Mike and Adam share ideas via text — a restaurant link, a travel article, a recipe. These get buried in the text thread and never become plans.

**How It Works:**

**Adding Ideas:**
- Paste a URL → app extracts title and description (use URL metadata/unfurl)
- Quick-add with no URL: just a title + category ("Try that Thai place on 5th")
- From any section: "Save as idea" button on things found while browsing

**Categorization:**
- Auto-suggest category based on URL domain (allrecipes.com → recipe, airbnb.com → trip)
- Manual override with quick-tap categories: Trip, Recipe, Date, Home, Gift, Activity, Career
- Optional tags for finer filtering

**The Promotion Flow (idea → action):**
- Tap an idea → "Plan This" button
- "Plan This" creates a task, list, or event linked to the idea
- Example: saved restaurant link → "Plan This" → creates a date night event with the restaurant info pre-filled
- Example: saved Airbnb listing → "Plan This" → creates a wishlist trip entry

**Views:**
- **Inbox**: newly added, unsorted
- **By Category**: trip ideas, recipe ideas, date ideas, etc.
- **By Person**: what Mike saved vs what Adam saved
- **Planned**: ideas that have been promoted to real plans

### 4. Life Design Section (Designing Your Life Framework)

This replaces the current "Coming Soon" placeholder with structured tools for big decisions.

**4a. Life Dashboard (DYL Core Tool)**

Each partner rates four areas quarterly (or whenever they want):
- **Health** — physical, mental, emotional wellbeing
- **Work** — career satisfaction, meaning, growth
- **Play** — fun, creativity, adventure
- **Love** — relationship, friendships, community

Displayed as four gauge meters per person, side by side. Shows trend over time (are things improving?). Misalignment becomes visible — if Mike's "Play" is at 30% and Adam's is at 80%, that's worth discussing.

**4b. Odyssey Plans (DYL Core Tool)**

Each partner creates up to 3 five-year scenarios:
- **Plan A**: Current trajectory — what happens if we keep going as-is?
- **Plan B**: Pivot — what if our current path disappears or we choose differently?
- **Plan C**: Wild card — what if money and expectations were no object?

Then together, create 1-2 **Shared Odyssey Plans** that blend both partners' visions.

Each plan is rated on:
- Confidence (can we pull this off?)
- Likeability (how excited are we?)
- Coherence (does this align with our values?)

**4c. Decisions Board**

For active decisions (moving in together, career change, where to live):
- Create a decision with 2-4 options
- Each option has pros/cons that either partner can add
- Both partners vote/rate each option (1-10)
- Linked to relevant prototypes and tasks
- Decision history: "We decided X because Y" — prevents re-litigating

**4d. Prototypes (DYL: Try Before You Commit)**

Small experiments that inform big decisions:
- "Spend a weekend in [neighborhood] before committing to move there"
- "Take a class in [new career field] before quitting current job"
- "Trial run living together for a month — what worked? What didn't?"

Each prototype has a hypothesis, a plan, and an outcome log.

**4e. Gravity Problems**

Things to accept rather than fight:
- "Adam's job requires travel 2 weeks/month" → reframe: "How do we make solo time productive and reunion time special?"
- "Our families live in different states" → reframe: "How do we create equitable visit schedules?"

Listing these explicitly prevents resentment from unspoken expectations.

### 5. Habits & Routines (Atomic Habits Framework)

**Three Habit Tracks:**

1. **Couple Habits** — both participate, tracked together
   - Weekly date night
   - Daily 10-minute check-in
   - Monthly financial review
   - Weekly meal planning session

2. **Individual Habits with Shared Visibility** — one person's habit, partner can see progress (optional)
   - Mike's training plan
   - Adam's meditation practice
   - Reading goals

3. **Private Habits** — tracked individually, not visible to partner
   - Personal wellness goals
   - Individual therapy/journaling

**Atomic Habits Integration:**

Each habit captures the four laws:

| Law | Field | Example |
|-----|-------|---------|
| Make It Obvious | Cue | "After we pour morning coffee..." |
| Make It Attractive | Identity | "We are becoming a couple that starts each day connected" |
| Make It Easy | Routine | "Share one thing we're looking forward to today (2 min)" |
| Make It Satisfying | Reward/Streak | Visual streak counter + monthly milestone celebrations |

**Streak Philosophy (no guilt):**
- Show consistency percentage (23/30 days = 77%) rather than just streak count
- When a streak breaks: "Life happens. You've been consistent 77% this month. Resume when ready."
- No partner-shaming: Adam doesn't get notified when Mike misses a habit
- Monthly reflection prompt: "Which habits are serving you? Which need redesigning?"

**Habit Stacking (Atomic Habits core concept):**
- App suggests stacking new habits onto existing routines
- Example: "You already have 'morning coffee' as a cue. Stack 'daily check-in' right after it."
- Visual chain showing habit stacks throughout the day

### 6. Redesigned Home Page

The home page becomes the **daily command center** — the first thing both partners see.

**Layout (top to bottom on mobile):**

```
┌─────────────────────────────┐
│  Good morning, Mike ☀️       │
│  Saturday, February 7       │
│  Adam was last active 2m ago │
├─────────────────────────────┤
│  TODAY'S FOCUS               │
│  ┌─────────┐ ┌─────────┐   │
│  │🏃 Long  │ │🎁 Buy   │   │
│  │  Run    │ │  gifts  │   │
│  │  8 mi   │ │  for NY │   │
│  └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐   │
│  │🛒 CVS   │ │💪 Habit │   │
│  │  Run    │ │  Check  │   │
│  │  4 items│ │  2/3 ✓  │   │
│  └─────────┘ └─────────┘   │
├─────────────────────────────┤
│  ACTIVE LISTS         See all│
│  🛒 CVS (4 items)     → You │
│  🥑 Groceries (12)    → Both│
│  🧳 NY Packing (8/15) → Both│
├─────────────────────────────┤
│  THIS WEEK                   │
│  Mon: Meal prep              │
│  Wed: Date night 🍷          │
│  Fri: ✈️ Fly to New York     │
│  Sat: Triathlon training     │
├─────────────────────────────┤
│  RECENT IDEAS          See all│
│  🍝 "Best pasta in Brooklyn" │
│  🏖️ "Tulum all-inclusive"    │
│  📍 "Astoria apartment tour" │
├─────────────────────────────┤
│  HABITS TODAY          3/5    │
│  ✅ Morning check-in          │
│  ✅ Workout                    │
│  ⬜ Evening walk               │
│  ✅ Read 20 min                │
│  ⬜ Gratitude journal          │
├─────────────────────────────┤
│  LIFE DASHBOARD PULSE        │
│  Health ████████░░ 80%       │
│  Work   ██████░░░░ 60%       │
│  Play   ███████░░░ 70%       │
│  Love   █████████░ 90%       │
│  Last updated: Jan 15        │
└─────────────────────────────┘
```

**Key Design Decisions:**
- Partner activity indicator: know Adam is active without surveillance
- Tasks show assignment (You / Adam / Both)
- Habits show today's progress, not lifetime stats
- Life Dashboard shows personal pulse, tap to see Adam's + comparison
- "This Week" merges calendar events, tasks, trips, and fitness into one timeline
- Quick-add FAB at bottom right: Task, List, Idea, Memory

---

## Apple Ecosystem Integration

### What's Possible (PWA on iOS 16.4+)

| Feature | Status | Notes |
|---------|--------|-------|
| Push notifications | Works | Must be installed to home screen. Delivery can be unreliable. |
| Home screen install | Works | Manual "Add to Home Screen" from Safari share sheet |
| Share TO app | Not possible | PWAs can't register as share targets on iOS without App Store wrapper |
| Share FROM app | Works | navigator.share() opens native share sheet |
| Apple Watch | Not possible | No PWA support for complications or watchOS |
| Siri Shortcuts | Limited | Can create shortcuts that open specific PWA URLs |
| Offline use | Works | Service worker caching (currently commented out in your app) |

### Practical Workarounds

**Replacing Apple Notes:**
- The Shared Lists feature directly replaces shared Notes lists
- Real-time sync via Firestore matches iCloud sync speed
- Add-to-home-screen gives it an app-like experience
- Key gap: no share sheet integration, so you can't "share to app" from Safari. Workaround: paste URLs directly into the Ideas Inbox

**Sharing Links (replacing text/email):**
- Since PWA can't be a share target on iOS, the flow is: copy link → open app → paste into Ideas Inbox
- This is 2 more taps than sharing to Apple Notes, but the link then lives in a structured system with categorization and promotion to plans
- Alternative: build a simple iOS Shortcut that opens the PWA with the URL as a query parameter (`?addIdea=https://...`)

**Google Calendar Integration:**
- Already built in the app (read-only)
- Upgrade path: request calendar.events write scope to push tasks with due dates to shared Google Calendar
- This way tasks with dates show up on Apple Watch via Google Calendar → Apple Calendar sync

**Notifications:**
- Enable web push (iOS 16.4+) via Firebase Cloud Messaging
- Daily digest: "Here's your day" at a set time
- Urgent: real-time push for items marked urgent or when partner adds to active shopping list
- The existing Firebase Cloud Functions code (currently undeployed) can be extended for this

---

## Connecting to Existing Sections

### Travel
- Trip tasks auto-appear in shared task list (packing, booking, gifts)
- Trip ideas from Ideas Inbox can promote to wishlist destinations
- Packing lists already exist; extend them to be collaborative shared lists

### Fitness
- Training tasks surface on home ("Today: 8 mile long run")
- Fitness goals can link to habits ("Run 3x/week" as a tracked habit)
- Race-related tasks (register, book travel, buy gear) flow through task system

### Events
- Event prep tasks link to events ("Buy decorations for birthday party")
- Date ideas from Ideas Inbox promote to events
- Guest coordination tasks (RSVP follow-ups) auto-generate

### Memories
- "Memory quick capture" habit: prompt to log one memory per week
- Ideas that become experiences become memories (full lifecycle)

### Nutrition (when built)
- Meal plan generates grocery list automatically
- Recipe ideas from Ideas Inbox populate recipe collection
- "Whose turn to cook" tracking via habits/tasks

### Calendar
- Tasks with due dates show in calendar view
- Calendar events can spawn tasks ("Dinner party Saturday" → create shopping/prep list)
- Shared Google Calendar events import as coordinated tasks

---

## Designing Your Life + Atomic Habits: The Flow

### How They Work Together

```
DESIGNING YOUR LIFE (Direction)          ATOMIC HABITS (Execution)
─────────────────────────                ─────────────────────────
Life Dashboard assessment    ──────►     Identify areas needing change
         │
Odyssey Plans (3 futures)    ──────►     Choose which future to build toward
         │
Prototypes (small tests)     ──────►     2-minute rule: start tiny
         │
Decisions (choose path)      ──────►     Implementation intentions: when/where
         │
Gravity problems (accept)    ──────►     Environment design around constraints
         │
Shared identity statements   ──────►     Identity-based habits
("We are a couple that...")              ("People like us do X")
```

### Practical Example: Moving In Together

**DYL Phase:**
1. Both complete Life Dashboards — identify that "Love" is high but "Play" needs work (need shared space for hobbies)
2. Create Odyssey Plans — Plan A: move to Adam's current neighborhood. Plan B: find new neighborhood together. Plan C: move to a different city entirely.
3. Identify gravity problems — budget ceiling, both need reasonable commutes, lease timing
4. Set up prototypes — spend weekends in 3 different neighborhoods, visit open houses
5. Decision board — compare neighborhoods with pros/cons, both vote

**Atomic Habits Phase:**
1. Identity statement: "We are becoming a couple that builds a home together intentionally"
2. Create habits: weekly apartment browsing session (Saturdays after brunch), monthly budget review
3. Tasks generated: research movers, compare renter's insurance, declutter current spaces
4. Cue stacking: "After Saturday brunch, we spend 30 min browsing apartments together"

### Practical Example: Career Change

**DYL Phase:**
1. Update Work gauge on Life Dashboard — Mike at 50%, wants change
2. Odyssey Plans — Plan A: stay and push for promotion. Plan B: pivot to adjacent field. Plan C: start a business.
3. Prototypes — take an online course in Plan B field, attend a meetup, do informational interviews
4. Gravity problem — need health insurance, can't have zero income during transition

**Atomic Habits Phase:**
1. Identity: "I am someone who invests in professional growth"
2. Habit: 30 min/day on career development (course, networking, portfolio)
3. Tasks: update resume, schedule 3 informational interviews, research health insurance options
4. Adam's supporting habit: weekly career check-in conversation (be a sounding board)

---

## Implementation Priority

### Phase 1: Foundation (replace Apple Notes immediately)
1. **Shared Lists** — shopping, grocery, packing, custom
2. **Home page: Today's Focus** with tasks + lists + habits
3. **Cross-section Tasks** with time horizons and assignment
4. **Firestore sharedHub document** with real-time sync

### Phase 2: Ideas & Intelligence
5. **Ideas Inbox** — paste links, categorize, promote to plans
6. **Recurring list templates** — weekly groceries, etc.
7. **Push notifications** — daily digest + urgent alerts
8. **Calendar integration** — tasks ↔ Google Calendar events

### Phase 3: Life Design
9. **Life Dashboard** — Health/Work/Play/Love gauges
10. **Decisions Board** — options with pros/cons and voting
11. **Odyssey Plans** — 5-year scenario planning
12. **Prototypes** — experiment tracking

### Phase 4: Habits & Growth
13. **Habit Tracker** — daily/weekly with 4 Laws structure
14. **Streaks & Progress** — consistency percentage, narrative
15. **Identity Statements** — shared "We are..." affirmations
16. **Monthly Reflection** — guided review of habits, dashboard, goals

### Phase 5: Polish & Ecosystem
17. **Offline support** — service worker for subway/flight use
18. **iOS Shortcuts** — quick-add idea via URL scheme
19. **Notification refinement** — smart timing, digest customization
20. **Template library** — pre-built lists, habits, decision frameworks

---

## Key Design Principles

1. **Couples, not teams.** Awareness without surveillance. Encouragement without nagging. Transparency without pressure.

2. **Everything connects.** A task isn't just a task — it's part of a trip, a life goal, a shared identity. Links create meaning.

3. **Identity over outcomes.** "We are becoming a couple that..." is more durable than "Complete 30 tasks this month."

4. **Multiple time horizons.** Today's CVS run and this year's move-in plan coexist in one system, viewed at the right zoom level.

5. **Low friction capture, structured review.** Adding something should take 2 seconds. Organizing and planning happens during intentional review time.

6. **Graceful degradation.** Missed habits, overdue tasks, and abandoned ideas are normal. The system adapts without guilt.

7. **Replace, don't add.** This should eliminate Apple Notes, reduce text coordination, and consolidate scattered planning — not become yet another app to check.
