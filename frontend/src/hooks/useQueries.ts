import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type Category, type User, type Review, type Message } from '../backend';
import { Principal } from '@dfinity/principal';

// ---- User Profile ----

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getUserProfile(Principal.fromText(userId));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 60_000,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fullName: string;
      phoneNumber: string;
      location: string;
      profession: string;
      isProvider: boolean;
      category: Category | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerUser(
        params.fullName,
        params.phoneNumber,
        params.location,
        params.profession,
        params.isProvider,
        params.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allProviders'] });
    },
  });
}

// ---- Providers ----

export function useGetAllProviders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['allProviders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProviders();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useSearchProvidersByCategory(category: Category | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['providersByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.searchProvidersByCategory(category);
    },
    enabled: !!actor && !actorFetching && !!category,
    staleTime: 30_000,
  });
}

export function useGetUser(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getUser(Principal.fromText(userId));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 60_000,
  });
}

// ---- Reviews ----

export function useGetReviews(providerId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', providerId],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      return actor.getReviews(Principal.fromText(providerId));
    },
    enabled: !!actor && !actorFetching && !!providerId,
    staleTime: 30_000,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { provider: string; stars: number; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitReview(Principal.fromText(params.provider), BigInt(params.stars), params.comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.provider] });
    },
  });
}

// ---- Messages ----

export function useGetMessageThreads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['messageThreads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessageThreads();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10_000,
  });
}

export function useGetMessages(threadId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      if (!actor || !threadId) return [];
      try {
        return await actor.getMessages(threadId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!threadId,
    refetchInterval: 8_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { receiverId: string; content: string; threadId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(Principal.fromText(params.receiverId), params.content, params.threadId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}

export function useDeleteMessageThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteMessageThread(threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}
