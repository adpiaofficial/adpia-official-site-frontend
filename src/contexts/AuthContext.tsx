import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import httpClient from "../api/httpClient";

interface MemberMe {
  id: number;
  name: string;
  department: string;
  generation: number;
  email: string;
  gender?: string | null;
  grade?: string | null;
  role: string; // "ROLE_USER", "ROLE_SUPER_ADMIN" ...
}

interface AuthContextValue {
  user: MemberMe | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<MemberMe | null>(null);
  const [loading, setLoading] = useState(true);

  // 앱 처음 켜질 때 토큰 있으면 me 조회
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await httpClient.get<MemberMe>("/members/me");
        setUser(res.data);
      } catch (e) {
        // 토큰 문제 있으면 그냥 로그아웃 처리
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await httpClient.post<{ token: string }>("/members/login", {
      email,
      password,
    });

    localStorage.setItem("accessToken", res.data.token);

    const meRes = await httpClient.get<MemberMe>("/members/me");
    setUser(meRes.data);
  };

  const logout = async () => {
  try {
    await httpClient.post("/members/logout");
  } catch (e) {
    console.error("logout error", e);
  } finally {
    localStorage.removeItem("accessToken");
    setUser(null);
  }
};

  const refreshMe = async () => {
    const res = await httpClient.get<MemberMe>("/members/me");
    setUser(res.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  }
  return ctx;
};
