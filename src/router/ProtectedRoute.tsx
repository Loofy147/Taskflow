import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { authService } from "@/services/api/authService";

export function ProtectedRoute() {
  const { session, setSession, setUser } = useAuthStore();

  useEffect(() => {
    const subscription = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [setSession, setUser]);

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
