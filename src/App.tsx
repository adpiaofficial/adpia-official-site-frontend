import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import MainPage from "./pages/MainPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import AdminMembersPage from "./pages/AdminMembersPage";
import AdminPopupEditPage from "./pages/AdminPopupEditPage";
import AdminExecutivesPage from "./pages/AdminExecutivesPage";
import AdminRoute from "./components/AdminRoute";

import NoticeListPage from "./pages/NoticeListPage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import NoticeUpsertPage from "./pages/NoticeUpsertPage";

import QaListPage from "./pages/QaListPage";
import QaDetailPage from "./pages/QaDetailPage";
import QaUpsertPage from "./pages/QaUpsertPage";

import HistoryPage from "./pages/HistoryPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";

import RulesPage from "./pages/RulesPage";
import NewsListPage from "./pages/NewsListPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import NewsUpsertPage from "./pages/NewsUpsertPage";
import BrandPage from "./pages/BrandPage";

import HundredQnaListPage from "./pages/HundredQnaListPage";
import HundredQnaDetailPage from "./pages/HundredQnaDetailPage";
import HundredQnaUpsertPage from "./pages/HundredQnaUpsertPage";
import ThreeMinuteSpeechListPage from "./pages/ThreeMinuteSpeechListPage";
import ThreeMinuteSpeechDetailPage from "./pages/ThreeMinuteSpeechDetailPage";
import ThreeMinuteSpeechUpsertPage from "./pages/ThreeMinuteSpeechUpsertPage";

const CommunityPage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">Community Page</div>
);
const ArchivePage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">Archive Page</div>
);
const SeminarPage = () => (
  <div className="pt-40 text-center font-black text-3xl text-gray-200 uppercase">Seminar Page</div>
);

function App() {
  return (
    <div className="flex flex-col min-h-screen font-noto">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/history" element={<HistoryPage />} />


          <Route path="/community" element={<CommunityPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/seminar" element={<SeminarPage />} />

          <Route path="/recruit" element={<Navigate to="/recruit/notice" replace />} />

          {/* ✅ NOTICE */}
          <Route path="/recruit/notice" element={<NoticeListPage />} />
          <Route path="/recruit/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/recruit/notice/new" element={<NoticeUpsertPage mode="create" />} />
          <Route path="/recruit/notice/:id/edit" element={<NoticeUpsertPage mode="edit" />} />

          {/* ✅ QA */}
          <Route path="/recruit/qa" element={<QaListPage />} />
          <Route path="/recruit/qa/:id" element={<QaDetailPage />} />
          <Route path="/recruit/qa/new" element={<QaUpsertPage mode="create" />} />
          <Route path="/recruit/qa/:id/edit" element={<QaUpsertPage mode="edit" />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/archive/hundred-qna" element={<HundredQnaListPage />} />
          <Route path="/archive/hundred-qna/:id" element={<HundredQnaDetailPage />} />
          <Route path="/archive/hundred-qna/new" element={<AdminRoute><HundredQnaUpsertPage /></AdminRoute>} />
          <Route path="/archive/hundred-qna/:id/edit" element={<AdminRoute><HundredQnaUpsertPage /></AdminRoute>} />

          <Route path="/archive/three-minute-speech" element={<ThreeMinuteSpeechListPage />} />
          <Route path="/archive/three-minute-speech/:id" element={<ThreeMinuteSpeechDetailPage />} />
          <Route path="/archive/three-minute-speech/new" element={<AdminRoute><ThreeMinuteSpeechUpsertPage /></AdminRoute>} />
          <Route path="/archive/three-minute-speech/:id/edit" element={<AdminRoute><ThreeMinuteSpeechUpsertPage /></AdminRoute>} />

          {/* ✅ ADMIN */}
          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <AdminMembersPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/popup"
            element={
              <AdminRoute>
                <AdminPopupEditPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/history"
            element={
              <AdminRoute>
                <AdminHistoryPage />
              </AdminRoute>
  }
/>

          {/* ✅ 임원진 관리 */}
          <Route
            path="/admin/executives"
            element={
              <AdminRoute>
                <AdminExecutivesPage />
              </AdminRoute>
            }
          />

          <Route path="/about/rules" element={<RulesPage />} />
          <Route path="/about/news" element={<NewsListPage />} />
          <Route path="/about/news/new" element={<NewsUpsertPage mode="create" />} />
          <Route path="/about/news/:id" element={<NewsDetailPage />} />
          <Route path="/about/news/:id/edit" element={<NewsUpsertPage mode="edit" />} />
          <Route path="/about/ci" element={<BrandPage />} />
          <Route path="*" element={<div className="pt-40 text-center">존재하지 않는 페이지입니다.</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
