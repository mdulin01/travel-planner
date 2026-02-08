import { useState, useCallback, useRef } from 'react';

/**
 * useFitness Hook
 * Manages all fitness-related state and operations
 * Handles events, training plans, and workouts
 */

export const useFitness = (saveFitnessToFirestore, showToast, generateTrainingWeeks, triathlonTrainingPlan, indyHalfTrainingPlan) => {
  // Keep refs so callbacks always use the latest functions/data
  const saveRef = useRef(saveFitnessToFirestore);
  saveRef.current = saveFitnessToFirestore;
  const genRef = useRef(generateTrainingWeeks);
  genRef.current = generateTrainingWeeks;
  const triPlanRef = useRef(triathlonTrainingPlan);
  triPlanRef.current = triathlonTrainingPlan;
  const indyPlanRef = useRef(indyHalfTrainingPlan);
  indyPlanRef.current = indyHalfTrainingPlan;
  // ========== INITIAL DATA ==========
  const defaultFitnessEvents = [
    {
      id: 'triathlon-2026',
      name: 'Triathlon 2026',
      emoji: '🏊',
      type: 'triathlon',
      date: '2026-06-15',
      location: 'Greensboro, NC',
      trainingWeeks: 16,
      participants: ['Mike', 'Adam'],
      url: 'https://www.ironman.com',
      description: 'Full Ironman triathlon',
      color: '#3b82f6',
    },
  ];

  // ========== STATE ==========
  const [fitnessEvents, setFitnessEvents] = useState(defaultFitnessEvents);
  const [fitnessTrainingPlans, setFitnessTrainingPlans] = useState({});
  const [selectedFitnessEvent, setSelectedFitnessEvent] = useState(null);
  const [fitnessViewMode, setFitnessViewMode] = useState('events'); // 'events' | 'training' | 'stats'

  // Fitness modals and editing
  const [showAddFitnessEventModal, setShowAddFitnessEventModal] = useState(false);
  const [editingFitnessEvent, setEditingFitnessEvent] = useState(null);

  // ========== FITNESS EVENT CRUD ==========
  const updateFitnessEvent = useCallback((updatedEvent) => {
    const newEvents = fitnessEvents.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setFitnessEvents(newEvents);
    saveRef.current(newEvents, fitnessTrainingPlans);
  }, [fitnessEvents, fitnessTrainingPlans]);

  const deleteFitnessEvent = useCallback((eventId) => {
    const newEvents = fitnessEvents.filter(event => event.id !== eventId);
    const newPlans = { ...fitnessTrainingPlans };
    delete newPlans[eventId];
    setFitnessEvents(newEvents);
    setFitnessTrainingPlans(newPlans);
    saveRef.current(newEvents, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans]);

  // ========== TRAINING PLAN OPERATIONS ==========
  const updateTrainingWeek = useCallback(async (eventId, weekId, updates) => {
    const newPlans = { ...fitnessTrainingPlans };

    // Initialize plan if it doesn't exist
    if (!newPlans[eventId]) {
      if (eventId === 'triathlon-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(triPlanRef.current));
      } else if (eventId === 'indy-half-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(indyPlanRef.current));
      } else {
        // Generate training weeks for other events
        const event = fitnessEvents.find(e => e.id === eventId);
        if (event) {
          const today = new Date().toISOString().split('T')[0];
          newPlans[eventId] = genRef.current(today, event.date, eventId);
        }
      }
    }

    if (!newPlans[eventId]) return;

    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdNum = weekId.includes('week-') ? parseInt(weekId.split('week-')[1]) : null;
    newPlans[eventId] = newPlans[eventId].map(week => {
      const matches = week.id === weekId || (weekIdNum && week.weekNumber === weekIdNum);
      if (matches) {
        return { ...week, ...updates, id: weekId };
      }
      return week;
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans]);

  const updateWorkout = useCallback(async (eventId, weekId, workoutType, workoutId, updates) => {
    const newPlans = { ...fitnessTrainingPlans };

    // Initialize plan if it doesn't exist
    if (!newPlans[eventId]) {
      if (eventId === 'triathlon-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(triPlanRef.current));
      } else if (eventId === 'indy-half-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(indyPlanRef.current));
      } else {
        return; // Can't update non-existent plan
      }
    }

    // Find week by id OR weekNumber (for backwards compatibility)
    const weekIdNum = weekId.includes('week-') ? parseInt(weekId.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = week[workoutType].map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );

      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessTrainingPlans]);

  const addWorkout = useCallback(async (eventId, weekId, workoutType, workoutData) => {
    const newPlans = { ...fitnessTrainingPlans };

    // Initialize plan if it doesn't exist
    if (!newPlans[eventId]) {
      if (eventId === 'triathlon-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(triPlanRef.current));
      } else if (eventId === 'indy-half-2026') {
        newPlans[eventId] = JSON.parse(JSON.stringify(indyPlanRef.current));
      } else {
        const event = fitnessEvents.find(e => e.id === eventId);
        if (event) {
          const today = new Date().toISOString().split('T')[0];
          newPlans[eventId] = genRef.current(today, event.date, eventId);
        }
      }
    }

    if (!newPlans[eventId]) return;

    // Find week and add workout
    const weekIdNum = weekId.includes('week-') ? parseInt(weekId.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const newWorkout = { id: Date.now(), ...workoutData };
      const updatedWorkouts = [...(week[workoutType] || []), newWorkout];

      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessEvents, fitnessTrainingPlans]);

  const deleteWorkout = useCallback(async (eventId, weekId, workoutType, workoutId) => {
    const newPlans = { ...fitnessTrainingPlans };

    if (!newPlans[eventId]) return;

    const weekIdNum = weekId.includes('week-') ? parseInt(weekId.split('week-')[1]) : null;
    const findWeek = (w) => w.id === weekId || (weekIdNum && w.weekNumber === weekIdNum);

    newPlans[eventId] = newPlans[eventId].map(week => {
      if (!findWeek(week)) return week;

      const updatedWorkouts = (week[workoutType] || []).filter(w => w.id !== workoutId);
      return { ...week, [workoutType]: updatedWorkouts, id: weekId };
    });

    setFitnessTrainingPlans(newPlans);
    await saveRef.current(null, newPlans);
  }, [fitnessTrainingPlans]);

  // ========== RETURN CONTEXT VALUE ==========
  return {
    // Data
    fitnessEvents,
    fitnessTrainingPlans,
    selectedFitnessEvent,
    fitnessViewMode,

    // Event operations
    updateFitnessEvent,
    deleteFitnessEvent,

    // Training operations
    updateTrainingWeek,
    updateWorkout,
    addWorkout,
    deleteWorkout,

    // Setters
    setFitnessEvents,
    setFitnessTrainingPlans,
    setSelectedFitnessEvent,
    setFitnessViewMode,

    // Modal states
    showAddFitnessEventModal,
    setShowAddFitnessEventModal,
    editingFitnessEvent,
    setEditingFitnessEvent,
  };
};

export default useFitness;
