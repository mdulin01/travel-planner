import { useState, useCallback } from 'react';

/**
 * useSharedHub Hook
 * Manages all SharedHub data and operations in one place
 * Returns an object with state and callbacks ready to pass to SharedHubProvider
 */

export const useSharedHub = (currentUser, saveSharedHub, showToast) => {
  // ========== STATE ==========
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [sharedIdeas, setSharedIdeas] = useState([]);
  const [sharedSocial, setSharedSocial] = useState([]);
  const [sharedHabits, setSharedHabits] = useState([]);

  // Hub UI state
  const [hubSubView, setHubSubView] = useState('home');
  const [hubTaskFilter, setHubTaskFilter] = useState('today');
  const [hubTaskSort, setHubTaskSort] = useState('date');
  const [hubListFilter, setHubListFilter] = useState('all');
  const [hubIdeaFilter, setHubIdeaFilter] = useState('all');
  const [hubIdeaStatusFilter, setHubIdeaStatusFilter] = useState('all');
  const [hubSocialFilter, setHubSocialFilter] = useState('all');
  const [hubHabitFilter, setHubHabitFilter] = useState('all');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Hub modal states (for card editing/creation)
  const [showAddTaskModal, setShowAddTaskModal] = useState(null); // null | 'create' | task object (edit)
  const [showSharedListModal, setShowSharedListModal] = useState(null); // null | 'create' | list object (edit)
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(null); // null | 'create' | idea object (edit)
  const [showAddSocialModal, setShowAddSocialModal] = useState(null); // null | 'create' | social object (edit)
  const [showAddHabitModal, setShowAddHabitModal] = useState(null); // null | 'create' | habit object (edit)

  // ========== TASK CRUD ==========
  const addTask = useCallback((task) => {
    const newTasks = [...sharedTasks, task];
    setSharedTasks(newTasks);
    saveSharedHub(null, newTasks, null);
    showToast('Task added', 'success');
  }, [sharedTasks, showToast]);

  const updateTask = useCallback((taskId, updates) => {
    const newTasks = sharedTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    setSharedTasks(newTasks);
    saveSharedHub(null, newTasks, null);
  }, [sharedTasks]);

  const deleteTask = useCallback((taskId) => {
    const newTasks = sharedTasks.filter(t => t.id !== taskId);
    setSharedTasks(newTasks);
    saveSharedHub(null, newTasks, null);
    showToast('Task removed', 'info');
  }, [sharedTasks, showToast]);

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
  }, [sharedTasks, currentUser]);

  const highlightTask = useCallback((taskId) => {
    const newTasks = sharedTasks.map(t => t.id === taskId ? { ...t, highlighted: !t.highlighted } : t);
    setSharedTasks(newTasks);
    saveSharedHub(null, newTasks, null);
  }, [sharedTasks]);

  // ========== LIST CRUD ==========
  const addList = useCallback((list) => {
    const newLists = [...sharedLists, list];
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
    showToast('List created', 'success');
  }, [sharedLists, showToast]);

  const updateList = useCallback((listId, updates) => {
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, ...updates } : l);
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
  }, [sharedLists]);

  const deleteList = useCallback((listId) => {
    const newLists = sharedLists.filter(l => l.id !== listId);
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
    showToast('List removed', 'info');
  }, [sharedLists, showToast]);

  const addListItem = useCallback((listId, item) => {
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, items: [...(l.items || []), item] } : l);
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
  }, [sharedLists]);

  const toggleListItem = useCallback((listId, itemId) => {
    const newLists = sharedLists.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        items: l.items.map(i => i.id === itemId ? {
          ...i,
          checked: !i.checked,
          checkedBy: !i.checked ? currentUser : null,
          checkedAt: !i.checked ? new Date().toISOString() : null,
        } : i)
      };
    });
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
  }, [sharedLists, currentUser]);

  const deleteListItem = useCallback((listId, itemId) => {
    const newLists = sharedLists.map(l => {
      if (l.id !== listId) return l;
      return { ...l, items: l.items.filter(i => i.id !== itemId) };
    });
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
  }, [sharedLists]);

  const highlightList = useCallback((listId) => {
    const newLists = sharedLists.map(l => l.id === listId ? { ...l, highlighted: !l.highlighted } : l);
    setSharedLists(newLists);
    saveSharedHub(newLists, null, null);
  }, [sharedLists]);

  // ========== IDEA CRUD ==========
  const addIdea = useCallback((idea) => {
    const newIdeas = [...sharedIdeas, idea];
    setSharedIdeas(newIdeas);
    saveSharedHub(null, null, newIdeas);
    showToast('Idea saved', 'success');
  }, [sharedIdeas, showToast]);

  const updateIdea = useCallback((ideaId, updates) => {
    const newIdeas = sharedIdeas.map(i => i.id === ideaId ? { ...i, ...updates } : i);
    setSharedIdeas(newIdeas);
    saveSharedHub(null, null, newIdeas);
  }, [sharedIdeas]);

  const deleteIdea = useCallback((ideaId) => {
    const newIdeas = sharedIdeas.filter(i => i.id !== ideaId);
    setSharedIdeas(newIdeas);
    saveSharedHub(null, null, newIdeas);
    showToast('Idea removed', 'info');
  }, [sharedIdeas, showToast]);

  const highlightIdea = useCallback((ideaId) => {
    const newIdeas = sharedIdeas.map(i => i.id === ideaId ? { ...i, highlighted: !i.highlighted } : i);
    setSharedIdeas(newIdeas);
    saveSharedHub(null, null, newIdeas);
  }, [sharedIdeas]);

  // ========== SOCIAL CRUD ==========
  const addSocial = useCallback((social) => {
    const newSocial = [...sharedSocial, social];
    setSharedSocial(newSocial);
    saveSharedHub(null, null, null, newSocial);
    showToast('Social planned', 'success');
  }, [sharedSocial, showToast]);

  const updateSocial = useCallback((socialId, updates) => {
    const newSocial = sharedSocial.map(s => s.id === socialId ? { ...s, ...updates } : s);
    setSharedSocial(newSocial);
    saveSharedHub(null, null, null, newSocial);
  }, [sharedSocial]);

  const deleteSocial = useCallback((socialId) => {
    const newSocial = sharedSocial.filter(s => s.id !== socialId);
    setSharedSocial(newSocial);
    saveSharedHub(null, null, null, newSocial);
    showToast('Social removed', 'info');
  }, [sharedSocial, showToast]);

  const completeSocial = useCallback((socialId) => {
    const item = sharedSocial.find(s => s.id === socialId);
    if (!item) return;
    const newStatus = item.status === 'done' ? 'planned' : 'done';
    updateSocial(socialId, { status: newStatus });
    if (newStatus === 'done') showToast('Nice! Social done', 'success');
  }, [sharedSocial, updateSocial, showToast]);

  const highlightSocial = useCallback((socialId) => {
    const newSocial = sharedSocial.map(s => s.id === socialId ? { ...s, highlighted: !s.highlighted } : s);
    setSharedSocial(newSocial);
    saveSharedHub(null, null, null, newSocial);
  }, [sharedSocial]);

  // ========== HABIT CRUD ==========
  const addHabit = useCallback((habit) => {
    const newHabits = [...sharedHabits, habit];
    setSharedHabits(newHabits);
    saveSharedHub(null, null, null, null, newHabits);
    showToast('Habit created', 'success');
  }, [sharedHabits, showToast]);

  const updateHabit = useCallback((habitId, updates) => {
    const newHabits = sharedHabits.map(h => h.id === habitId ? { ...h, ...updates } : h);
    setSharedHabits(newHabits);
    saveSharedHub(null, null, null, null, newHabits);
  }, [sharedHabits]);

  const deleteHabit = useCallback((habitId) => {
    const newHabits = sharedHabits.filter(h => h.id !== habitId);
    setSharedHabits(newHabits);
    saveSharedHub(null, null, null, null, newHabits);
    showToast('Habit removed', 'info');
  }, [sharedHabits, showToast]);

  const toggleHabitDay = useCallback((habitId, dateKey) => {
    const newHabits = sharedHabits.map(h => {
      if (h.id !== habitId) return h;
      const newLog = { ...(h.log || {}) };
      newLog[dateKey] = !newLog[dateKey];
      return { ...h, log: newLog };
    });
    setSharedHabits(newHabits);
    saveSharedHub(null, null, null, null, newHabits);
  }, [sharedHabits]);

  const highlightHabit = useCallback((habitId) => {
    const newHabits = sharedHabits.map(h => h.id === habitId ? { ...h, highlighted: !h.highlighted } : h);
    setSharedHabits(newHabits);
    saveSharedHub(null, null, null, null, newHabits);
  }, [sharedHabits]);

  // ========== UI HELPERS ==========
  const toggleDashSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // ========== RETURN CONTEXT VALUE ==========
  return {
    // Data
    sharedTasks,
    sharedLists,
    sharedIdeas,
    sharedSocial,
    sharedHabits,

    // Task operations
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    highlightTask,

    // List operations
    addList,
    updateList,
    deleteList,
    addListItem,
    toggleListItem,
    deleteListItem,
    highlightList,

    // Idea operations
    addIdea,
    updateIdea,
    deleteIdea,
    highlightIdea,

    // Social operations
    addSocial,
    updateSocial,
    deleteSocial,
    completeSocial,
    highlightSocial,

    // Habit operations
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    highlightHabit,

    // UI state
    hubSubView,
    setHubSubView,
    hubTaskFilter,
    setHubTaskFilter,
    hubTaskSort,
    setHubTaskSort,
    hubListFilter,
    setHubListFilter,
    hubIdeaFilter,
    setHubIdeaFilter,
    hubIdeaStatusFilter,
    setHubIdeaStatusFilter,
    hubSocialFilter,
    setHubSocialFilter,
    hubHabitFilter,
    setHubHabitFilter,
    collapsedSections,
    toggleDashSection,

    // Setters for loading data from Firebase
    setSharedTasks,
    setSharedLists,
    setSharedIdeas,
    setSharedSocial,
    setSharedHabits,

    // Modal states
    showAddTaskModal,
    setShowAddTaskModal,
    showSharedListModal,
    setShowSharedListModal,
    showAddIdeaModal,
    setShowAddIdeaModal,
    showAddSocialModal,
    setShowAddSocialModal,
    showAddHabitModal,
    setShowAddHabitModal,
  };
};

export default useSharedHub;
