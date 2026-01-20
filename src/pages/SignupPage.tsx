import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../api/httpClient";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: 약관, 2: 정보입력, 3: 이메일인증

  // 약관 동의
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  // 회원 정보 입력
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [generation, setGeneration] = useState("");
  const [gender, setGender] = useState(""); // "남" 또는 "여"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 이메일 인증
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(180); // 3분 타이머
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 기타
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 타이머 로직 (Step 3에서 작동)
  useEffect(() => {
    let interval: number | undefined;
    if (step === 3 && timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  // Step2 → 이메일 인증 코드 발송만 (회원가입 X)
  const handleInfoSubmit = async () => {
    setErrorMsg(null);

    if (!name || !department || !generation || !gender || !email || !password) {
      setErrorMsg("모든 필수 정보를 입력해 주세요.");
      return;
    }

    if (Number.isNaN(Number(generation))) {
      setErrorMsg("기수는 숫자로 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      // 이메일 인증 코드 발송
      await httpClient.post("/email/code", {
        email,
      });

      // Step 3 (이메일 인증 화면)으로 이동 + 타이머 리셋
      setStep(3);
      setTimer(180);
      setIsEmailVerified(false);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg("인증 메일 전송에 실패했습니다. 이메일을 다시 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 다시 보내기
  const handleResendCode = async () => {
    setErrorMsg(null);
    try {
      setLoading(true);
      await httpClient.post("/email/code", { email });
      setTimer(180);
      setErrorMsg("인증 번호를 다시 전송했습니다. 메일함을 확인해 주세요.");
    } catch (err) {
      setErrorMsg("인증 번호 재전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // Step3 → 코드 검증 + 최종 회원가입
  const handleCompleteSignup = async () => {
    setErrorMsg(null);

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMsg("6자리 인증 번호를 정확히 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      // 1) 이메일 인증 코드 검증
      const verifyRes = await httpClient.post("/email/verify", {
        email,
        code: verificationCode,
      });

      if (!verifyRes.data?.success) {
        setIsEmailVerified(false);
        setErrorMsg(verifyRes.data?.message ?? "이메일 인증에 실패했습니다.");
        return;
      }

      setIsEmailVerified(true);

      // 2) 실제 회원가입 요청
      const signupRes = await httpClient.post("/members/signup", {
        name,
        department,
        email,
        password,
        gender, // "남" / "여"
        generation: Number(generation),
      });

      if (signupRes.status === 200) {
        alert("회원가입이 완료되었습니다. 로그인해 주세요.");
        navigate("/login");
      } else {
        setErrorMsg("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err: any) {
      setErrorMsg("이메일 인증 또는 회원가입 과정에서 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFM] flex items-center justify-center px-6 py-28 font-noto">
      <div className="max-w-2xl w-full bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(129,62,182,0.08)] p-12 md:p-16 relative overflow-hidden transition-all duration-500">
        {/* Decorative Background Blob */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* [Header] */}
        <div className="relative z-10 text-center mb-12">
          <span className="text-[#813eb6] font-black text-[10px] tracking-[0.4em] uppercase mb-3 block">
            Step 0{step} / 03
          </span>
          <h2 className="text-4xl font-black text-gray-900 font-montserrat italic uppercase tracking-tighter">
            {step === 1 ? "Agreement" : step === 2 ? "Your Profile" : "Verify"}
          </h2>
        </div>

        {step === 1 && (
          /* [STEP 1] 약관 동의 */
          <div className="animate-fade-in space-y-8 relative z-10">
            <div className="space-y-4">
              {/* 이용약관 박스 (전문) */}
              <div
                className={`p-8 rounded-[2.5rem] border-2 transition-all ${
                  agreedTerms
                    ? "border-[#813eb6] bg-purple-50/30"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-gray-800 tracking-tight text-lg">
                    이용약관{" "}
                    <span className="text-[#813eb6] ml-1 text-xs">(필수)</span>
                  </h3>
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={() => setAgreedTerms(!agreedTerms)}
                    className="w-6 h-6 accent-[#813eb6] cursor-pointer"
                  />
                </div>
                <div className="h-48 overflow-y-auto pr-2 text-[12px] leading-[1.8] text-gray-500 scrollbar-hide">
                  <p className="font-bold text-gray-700 mb-2">[제1장 총칙]</p>
                  <strong>제1조(목적)</strong> 이 약관은 애드피아가 운영하는 애드피아 사이트
                  (이하 “사이트”라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라
                  한다)를 이용함에 있어 홈페이지와 이용자의 권리・의무 및 책임사항을
                  규정함을 목적으로 합니다.
                  <br />
                  <br />
                  <strong>제2조(정의)</strong> 1. “사이트”란 애드피아가 서비스를 이용자에게
                  제공하기 위하여 정보통신설비를 이용하여 회원 간 교류를 할 수 있도록 설정한
                  가상의 영업장을 말합니다. 2. “이용자”란 사이트에 접속하여 이 약관에 따라
                  서비스를 제공받는 회원 및 비회원을 말합니다.
                  <br />
                  <br />
                  <strong>제6조(회원의 의무)</strong> 회원은 허위 내용 등록, 타인 정보 도용,
                  지식재산권 침해 등의 행위를 하여서는 안 됩니다.
                  <br />
                  <br />
                  <strong>제15조(저작권의 귀속)</strong> 애드피아가 작성한 저작물에 대한
                  저작권은 애드피아에 귀속됩니다. 사전 승낙 없이 복제, 배포할 수 없습니다.
                  <br />
                  <br />
                  <strong>제16조(회원의 게시물)</strong> 게시물 책임은 회원에게 있으며 탈퇴 전
                  직접 삭제해야 합니다.
                  <br />
                  <br />
                  <p className="text-[#813eb6] font-bold">
                    ※ 위 약관은 사이트 개설일로부터 유효합니다.
                  </p>
                </div>
              </div>

              {/* 개인정보 수집 박스 (전문) */}
              <div
                className={`p-8 rounded-[2.5rem] border-2 transition-all ${
                  agreedPrivacy
                    ? "border-[#813eb6] bg-purple-50/30"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-gray-800 tracking-tight text-lg">
                    개인정보 수집 및 이용{" "}
                    <span className="text-[#813eb6] ml-1 text-xs">(필수)</span>
                  </h3>
                  <input
                    type="checkbox"
                    checked={agreedPrivacy}
                    onChange={() => setAgreedPrivacy(!agreedPrivacy)}
                    className="w-6 h-6 accent-[#813eb6] cursor-pointer"
                  />
                </div>
                <div className="h-40 overflow-y-auto pr-2 text-[12px] leading-[1.8] text-gray-500 scrollbar-hide">
                  <strong>1. 수집하는 개인정보 항목</strong>
                  <br />
                  회원 가입 시 ‘이름, 부서, 기수, 성별, 비밀번호, 이메일’을 필수항목으로
                  수집합니다.
                  <br />
                  <br />
                  <strong>2. 수집 및 이용목적</strong>
                  <br />
                  - 회원 가입 의사 확인, 애드피아 소속 여부 확인, 이용자 식별, 서비스 보안
                  강화
                  <br />
                  <br />
                  <strong>3. 보유 및 이용 기간</strong>
                  <br />
                  이용자의 개인정보는 <strong>회원 탈퇴 요청 시 바로 파기</strong>됩니다.
                  <br />
                  <br />
                  <p className="text-[#813eb6] font-bold">
                    ※ 위 약관은 사이트 개설일로부터 유효합니다.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!agreedTerms || !agreedPrivacy}
              className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-[#813eb6] to-[#3d1d56] text-white font-black text-lg shadow-[0_20px_40px_rgba(129,62,182,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
            >
              모든 약관에 동의하고 계속하기
            </button>
          </div>
        )}

        {step === 2 && (
          /* [STEP 2] 정보 입력 */
          <div className="animate-fade-in-right space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
                <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                  Real Name
                </span>
                <input
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg placeholder:text-gray-200"
                />
              </div>
              <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
                <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                  Department
                </span>
                <input
                  type="text"
                  placeholder="부서 (기획부 등)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg placeholder:text-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
                <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                  Adpia Batch
                </span>
                <input
                  type="text"
                  placeholder="기수 (예: 34)"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg placeholder:text-gray-200"
                />
              </div>

              {/* 성별 드롭다운 */}
              <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
                <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                  Gender
                </span>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      선택
                    </option>
                    <option value="남">남자</option>
                    <option value="여">여자</option>
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
              <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                Email Address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                }}
                placeholder="example@email.com"
                className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg placeholder:text-gray-200"
              />
            </div>

            <div className="group border-b-2 border-gray-100 focus-within:border-[#813eb6] transition-all py-2">
              <span className="text-[10px] font-black text-gray-400 group-focus-within:text-[#813eb6] uppercase tracking-tighter">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 영문/숫자 조합"
                className="w-full bg-transparent border-none outline-none font-bold text-gray-800 pt-1 text-lg placeholder:text-gray-200"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
            )}

            <div className="flex space-x-6 pt-8">
              <button
                onClick={() => setStep(1)}
                className="px-10 py-5 rounded-[1.8rem] bg-gray-50 text-gray-400 font-black text-sm hover:bg-gray-100 transition-all"
              >
                이전으로
              </button>
              <button
                onClick={handleInfoSubmit}
                disabled={loading}
                className="flex-1 py-5 rounded-[1.8rem] bg-[#1a1a1a] text-white font-black text-lg shadow-xl hover:bg-[#813eb6] transition-all disabled:opacity-40"
              >
                {loading ? "전송 중..." : "인증 메일 전송하기"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          /* [STEP 3] 이메일 인증 */
          <div className="animate-fade-in text-center space-y-12 relative z-10 py-4">
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-gray-900">{email}</h3>
              <p className="text-sm text-gray-400 font-medium">
                전송된 6자리 번호를 입력해 주세요.
              </p>
            </div>

            <div className="relative max-w-sm mx-auto">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full bg-gray-50 rounded-[3rem] py-12 text-center text-6xl font-black tracking-[0.3em] text-[#813eb6] outline-none border-4 border-transparent focus:border-purple-100 focus:bg-white transition-all shadow-inner"
                placeholder="000000"
              />
              <div className="absolute -top-3 right-6 bg-red-500 text-white px-4 py-1 rounded-full font-black text-xs">
                {formatTime(timer)}
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
            )}
            {isEmailVerified && (
              <p className="text-emerald-600 text-sm font-medium">
                ✅ 이메일 인증이 완료되었습니다. 가입을 마무리해 주세요.
              </p>
            )}

            <div className="space-y-4">
              <button
                onClick={handleCompleteSignup}
                disabled={loading}
                className="w-full py-6 rounded-[2.5rem] bg-[#813eb6] text-white font-black text-xl shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-40"
              >
                {loading ? "처리 중..." : "가입 완료하기"}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-gray-400 text-sm font-bold hover:text-[#813eb6] transition-all underline underline-offset-4"
              >
                인증번호 다시 보내기
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default SignupPage;
