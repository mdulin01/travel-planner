# Refactoring Guide: Splitting trip-planner.jsx

## Overview

The main `trip-planner.jsx` file (11,223 lines) handles too many responsibilities. This guide shows how to split it into feature-based sections while maintaining functionality.

## Architecture

```
trip-planner.jsx (orchestrator - ~500 lines)
├── contexts/
│   └── SharedHubContext.js ✓ (done)
├── sections/
│   ├── TravelSection.jsx (NEW)
│   ├── FitnessSection.jsx (NEW)
│   ├── EventsSection.jsx (NEW)
│   ├── MemoriesSection.jsx (NEW)
│   ├── SharedHubSection.jsx (NEW)
│   └── SettingsSection.jsx (NEW)
└── hooks/
    ├── useModal.js ✓ (done)
    ├── useTravelData.js (NEW)
    ├── useFitnessData.js (NEW)
    └── useSharedHub.js (NEW)
```

## Step-by-Step Migration Path

### Phase 1: Extract Hooks (Cleanest)

Create `hooks/useSharedHub.js`:
```javascript
import { useState, useCallback } from 'react';
import { useSharedHub } from '../contexts/SharedHubContext';

export const useSharedHubData = (currentUser, saveSharedHub, showToast) => {
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [sharedIdeas, setSharedIdeas] = useState([]);
  const [sharedSocial, setSharedSocial] = useState([]);
  const [sharedHabits, setSharedHabits] = useState([]);

  const completeTask = useCallback((taskId) => {
    const task = sharedTasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const newTasks = sharedTasks.map(t => t.id === taskId ? {
      ...t,
      status: newStatus,
      completedBy: newStatus === 'done' ? currentUser : null,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
    } : t);
    setSharedTasks(newTasks);
    saveSharedHub(null, newTasks, null);
  }, [sharedTasks, currentUser, saveSharedHub]);

  // ... all other callbacks ...

  return {
    sharedTasks,
    sharedLists,
    sharedIdeas,
    sharedSocial,
    sharedHabits,
    completeTask,
    deleteTask,
    addTask,
    // ... all callbacks
  };
};
```

Then in trip-planner.jsx:
```javascript
import { useSharedHubData } from './hooks/useSharedHub';

// Inside trip-planner component
const sharedHub = useSharedHubData(currentUser, saveSharedHub, showToast);

// Pass to SharedHubProvider
<SharedHubProvider value={sharedHub}>
  {/* children */}
</SharedHubProvider>
```

### Phase 2: Extract Sections

Create `sections/SharedHubSection.jsx`:
```javascript
import React from 'react';
import { useSharedHub } from '../contexts/SharedHubContext';
import TaskCard from '../components/SharedHub/TaskCard';
import ListCard from '../components/SharedHub/ListCard';
// ... imports

export const SharedHubSection = ({ isVisible }) => {
  const hub = useSharedHub();

  if (!isVisible) return null;

  return (
    <div>
      {/* Hub UI using hub.tasks, hub.completeTask(), etc. */}
    </div>
  );
};
```

Then in trip-planner.jsx:
```javascript
{activeSection === 'hub' && <SharedHubSection isVisible={activeSection === 'hub'} />}
```

## Benefits of This Refactoring

- **Maintainability**: Each section is a focused, testable module
- **Performance**: Sections can be lazy-loaded when needed
- **Reusability**: Hooks can be used in multiple places
- **Testing**: Individual sections are easier to test
- **Code Splitting**: Can enable dynamic imports for sections

## Implementation Priority

1. **High Priority** (biggest impact):
   - Extract SharedHub to section + hook + context
   - Extract Travel CRUD to hook
   - Extract Fitness CRUD to hook

2. **Medium Priority**:
   - Extract Events section
   - Extract Memories section
   - Create shared utilities for filtering/sorting

3. **Low Priority** (nice to have):
   - Extract Life Design section
   - Create reusable modal composites

## Code Patterns to Maintain

### State Updates
Always use functional setState to avoid closure issues:
```javascript
// ❌ Wrong - uses closed-over state
const deleteTask = (taskId) => {
  const newTasks = sharedTasks.filter(...); // stale closure
  setSharedTasks(newTasks);
};

// ✅ Right - uses callback with dependencies
const deleteTask = useCallback((taskId) => {
  setSharedTasks(prev => prev.filter(...));
}, [saveSharedHub]);
```

### Context Usage
```javascript
// In any component deep in tree
const { deleteTask, highlightTask } = useSharedHub();

// No prop drilling needed!
<TaskCard
  task={task}
  onDelete={() => deleteTask(task.id)}
  onHighlight={() => highlightTask(task.id)}
/>
```

## Testing Strategy

Each hook can be tested independently:
```javascript
// __tests__/hooks/useSharedHub.test.js
import { renderHook, act } from '@testing-library/react';
import { useSharedHubData } from '../useSharedHub';

test('completeTask toggles status', () => {
  const { result } = renderHook(() => useSharedHubData(mockUser, mockSave, mockToast));

  act(() => {
    result.current.completeTask(1);
  });

  expect(result.current.sharedTasks[0].status).toBe('done');
});
```

## Migration Timeline

- **Week 1**: Extract SharedHub hook + context
- **Week 2**: Extract Travel hook + section
- **Week 3**: Extract Fitness hook + section
- **Week 4**: Refactor remaining sections (Events, Memories)
- **Week 5**: Code cleanup, testing, optimization

## Notes

- Keep trip-planner.jsx as the orchestrator/router
- Use context for cross-section data (user, currentSection, etc.)
- Keep modals in top-level for overlays
- Each section should be independently testable
- Use React.lazy() for code splitting if bundle size becomes issue

## Files Already Prepared

- ✅ `src/theme.js` - Use theme colors in refactored sections
- ✅ `src/hooks/useModal.js` - Standardized modal pattern
- ✅ `src/contexts/SharedHubContext.js` - Ready for SharedHub data
- ✅ `src/utils.js` - Already has HEIC conversion extracted

Start with Phase 1 (hooks) as it requires minimal changes and gives immediate benefits.
