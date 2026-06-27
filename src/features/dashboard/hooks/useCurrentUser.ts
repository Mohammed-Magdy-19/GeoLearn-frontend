import { useAuthStore } from "../../../store/useAuthStore";

/**
 * Adapter hook to abstract away the auth store implementation from pages.
 * This supports DIP: higher-level components depend on this abstraction
 * instead of directly coupling to the concrete `useAuthStore` implementation.
 */
export const useCurrentUser = () => {
  const { user } = useAuthStore();
  return { user };
};

export default useCurrentUser;
