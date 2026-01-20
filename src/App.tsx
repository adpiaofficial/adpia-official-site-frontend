import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// AuthContext 추가
import { AuthProvider } from "./contexts/AuthContext";

// 페이지 컴포넌트
import MainPage from "./pages/MainPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// 아직 제작 전인 페이지들을 위한 임시 컴포넌트
const CommunityPage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">
    Community Page
  </div>
);
const ArchivePage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">
    Archive Page
  </div>
);
const SeminarPage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">
    Seminar Page
  </div>
);
const RecruitPage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">
    Recruit Page
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen font-noto">
        {/* 고정 네브바 */}
        <Navbar />

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-grow">
          <Routes>
            {/* 1. 홈 및 기본 카테고리 */}
            <Route path="/" element={<MainPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* 2. 네브바 이미지 요구사항에 맞춘 경로 설정 */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/seminar" element={<SeminarPage />} />
            <Route path="/recruit" element={<RecruitPage />} />

            {/* 3. 인증 관련 페이지 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* 4. 잘못된 경로 */}
            <Route
              path="*"
              element={<div className="pt-40 text-center">존재하지 않는 페이지입니다.</div>}
            />
          </Routes>
        </main>

        {/* 공통 푸터 */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
