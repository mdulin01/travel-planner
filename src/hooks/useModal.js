import { useState } from 'react';

/**
 * Custom hook for standardized modal state management
 * Provides consistent open/close/edit patterns across all modals
 *
 * Usage:
 *   const modal = useModal();
 *   modal.isOpen()           // boolean
 *   modal.isCreateMode()     // boolean
 *   modal.isEditMode()       // boolean
 *   modal.data               // null | object
 *   modal.open()             // open in create mode
 *   modal.openEdit(data)     // open in edit mode with data
 *   modal.close()            // close modal
 */
export const useModal = (initialData = null) => {
  const [state, setState] = useState(initialData);

  return {
    state,
    data: state && typeof state === 'object' ? state : null,
    isOpen: () => state !== null && state !== undefined,
    isCreateMode: () => state === 'create',
    isEditMode: () => state !== null && state !== 'create',
    open: () => setState('create'),
    openEdit: (data) => setState(data),
    close: () => setState(null),
    setState, // For advanced use cases
  };
};

export default useModal;
