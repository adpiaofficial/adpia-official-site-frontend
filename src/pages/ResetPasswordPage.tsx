import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "../api/passwordResetApi";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendCode = async () => {
    setErrorMsg(null);
    setMsg(null);

    if (!email) {
      setErrorMsg("이메일을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetCode(email);
      setCodeSent(true);
      setMsg("인증 코드를 전송했습니다.");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "인증 코드 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setErrorMsg(null);
    setMsg(null);

    if (!email || !code) {
      setErrorMsg("이메일과 인증 코드를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      await verifyPasswordResetCode(email, code);
      setVerified(true);
      setMsg("인증이 완료되었습니다.");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMsg(null);

    if (!verified) {
      setErrorMsg("먼저 이메일 인증을 완료해 주세요.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMsg("새 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(email, code, newPassword, confirmPassword);
      alert("비밀번호가 재설정되었습니다. 다시 로그인해 주세요.");
      navigate("/login", { replace: true });
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "비밀번호 재설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7FF] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 font-montserrat uppercase tracking-tighter">
            Reset Password
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            이메일 인증 후 새 비밀번호를 설정할 수 있습니다.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="example@adpia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="px-4 rounded-2xl bg-[#813eb6] text-white text-sm font-black disabled:opacity-40"
              >
                발송
              </button>
            </div>
          </div>

          {codeSent && (
            <div>
              <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
                Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="인증 코드 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || verified}
                  className="px-4 rounded-2xl bg-gray-900 text-white text-sm font-black disabled:opacity-40"
                >
                  {verified ? "완료" : "확인"}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
              New Password
            </label>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!verified}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[12px] font-black text-[#813eb6] mb-2 ml-1 uppercase tracking-widest">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!verified}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#813eb6] focus:bg-white transition-all text-sm disabled:opacity-50"
            />
          </div>

          {msg && <p className="text-green-600 text-xs font-medium">{msg}</p>}
          {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading || !verified}
            className="w-full py-4 bg-[#813eb6] text-white rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transform hover:-translate-y-1 transition-all disabled:opacity-40"
          >
            {loading ? "처리 중..." : "비밀번호 재설정"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 font-medium hover:text-[#813eb6]"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;