import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function useRequireLoginRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  return { user, authLoading: loading };
}