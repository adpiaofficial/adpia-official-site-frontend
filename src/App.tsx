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
          <Route path="*" element={<div className="pt-40 text-center">존재하지 않는 페이지입니다.</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
