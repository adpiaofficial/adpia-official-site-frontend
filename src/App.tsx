import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import MainPage from "./pages/MainPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import AdminMembersPage from "./pages/AdminMembersPage";
import AdminRoute from "./components/AdminRoute";

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
    <div className="flex flex-col min-h-screen font-noto">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/community" element={<CommunityPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/seminar" element={<SeminarPage />} />
          <Route path="/recruit" element={<RecruitPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <AdminMembersPage />
              </AdminRoute>
            }
          />

          <Route
            path="*"
            element={<div className="pt-40 text-center">존재하지 않는 페이지입니다.</div>}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
