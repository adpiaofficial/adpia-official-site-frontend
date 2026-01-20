import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ★ 여기! 컴포넌트 안에서 훅 호출

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password); // ★ 전역 로그인 처리
      navigate("/"); // 로그인 후 메인으로 이동

    } catch (err: any) {
      setErrorMsg("로그인 실패. 이메일 또는 비밀번호를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7FF] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 md:p-12">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 font-montserrat italic uppercase tracking-tighter">
            Login
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            여럿이 하나, 애드피아에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 폼 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
              Email
            </label>
            <input
              type="email"
              placeholder="example@adpia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-[11px] font-bold text-gray-400 hover:text-[#813eb6]"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-xs font-medium">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#813eb6] text-white rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transform hover:-translate-y-1 transition-all disabled:opacity-40"
          >
            {loading ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 font-medium">
            아직 계정이 없으신가요?
            <button
              onClick={() => navigate("/signup")}
              className="ml-2 text-[#813eb6] font-black border-b-2 border-[#813eb6]"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
