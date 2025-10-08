import { useState, useCallback } from 'react';
import { useGetContextsQuery, useCreateContextMutation, useUpdateContextMutation, useDeleteContextMutation } from '../services/api';
import { Context, CreateContextRequest } from '../types';

export const useContexts = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    platform_id: 0
  });

  // RTK Query hooks
  const {
    data: contexts = [],
    isLoading,
    error,
    refetch
  } = useGetContextsQuery({});

  const [createContext] = useCreateContextMutation();
  const [updateContext] = useUpdateContextMutation();
  const [deleteContext] = useDeleteContextMutation();

  // Filter contexts based on current filters
  const filteredContexts = contexts.filter(context => {
    if (filters.search && !context.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && context.type !== filters.type) {
      return false;
    }
    if (filters.platform_id && context.platform_id !== filters.platform_id) {
      return false;
    }
    return true;
  });

  // Create a new context
  const createNewContext = useCallback(async (contextData: CreateContextRequest) => {
    try {
      const result = await createContext(contextData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create context'
      };
    }
  }, [createContext]);

  // Update an existing context
  const updateExistingContext = useCallback(async (id: number, updates: Partial<Context>) => {
    try {
      const result = await updateContext({ id, ...updates }).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update context'
      };
    }
  }, [updateContext]);

  // Delete a context
  const deleteExistingContext = useCallback(async (id: number) => {
    try {
      await deleteContext(id).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Error deleting context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete context'
      };
    }
  }, [deleteContext]);

  return {
    // State
    contexts: filteredContexts,
    isLoading,
    error,
    filters,

    // Actions
    setFilters,
    createContext: createNewContext,
    updateContext: updateExistingContext,
    deleteContext: deleteExistingContext,
    refreshContexts: refetch,
  };
};

export default useContexts;
