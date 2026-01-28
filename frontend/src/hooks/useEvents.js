import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/events.api';

// Hook for Events

export const useEvents = (filters) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => getEvents(filters),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};
