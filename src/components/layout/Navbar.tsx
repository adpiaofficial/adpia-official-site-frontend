import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../contexts/AuthContext";

type NavItem = {
  name: string;
  path: string;
  subMenus: { name: string; path: string }[];
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const [activeMenu, setActiveMenu] = useState<string | null>(null); // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "ADPIA",
        path: "/about",
        subMenus: [
          { name: "연혁", path: "/about/history" },
          { name: "회칙", path: "/about/rules" },
          { name: "보도자료", path: "/about/news" },
          { name: "CI", path: "/about/ci" },
        ],
      },
      {
        name: "COMMUNITY",
        path: "/community",
        subMenus: [
          { name: "공지사항", path: "/community/notice" },
          { name: "애드찬스", path: "/community/chance" },
          { name: "활동 사진", path: "/community/gallery" },
          { name: "OB 게시판", path: "/community/ob" },
        ],
      },
      {
        name: "ARCHIVE",
        path: "/archive",
        subMenus: [
          { name: "경쟁 PT", path: "/archive/pt" },
          { name: "사회공헌프로젝트", path: "/archive/social" },
          { name: "광고제", path: "/archive/festival" },
          { name: "백문백답", path: "/archive/qna" },
          { name: "3분 스피치", path: "/archive/speech" },
          { name: "광고학개론", path: "/archive/intro" },
        ],
      },
      {
        name: "SEMMINAR",
        path: "/seminar",
        subMenus: [
          { name: "전체", path: "/seminar/all" },
          { name: "학술국", path: "/seminar/academic" },
          { name: "운영팀", path: "/seminar/operation" },
        ],
      },
      {
        name: "RECRUIT",
        path: "/recruit",
        subMenus: [
          { name: "공지사항", path: "/recruit/notice" },
          // ✅ App 라우트랑 맞춤 (/recruit/qa)
          { name: "Q&A", path: "/recruit/qa" },
        ],
      },
    ],
    []
  );

  const isSuperAdmin = user?.role === "ROLE_SUPER_ADMIN";

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileAccordion(null);
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[100] bg-white shadow-sm border-b border-gray-100 font-noto"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" onClick={closeMobile}>
            <img src={logo} alt="ADPIA" className="h-8 md:h-9 w-auto" />
          </Link>
        </div>

        {/* Center: Desktop menu */}
        <div className="hidden md:flex items-center justify-center gap-10 h-full">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const isRecruit = item.name === "RECRUIT";

            return (
              <div
                key={item.name}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu(item.name)}
              >
                {/* ✅ RECRUIT는 클릭해도 이동 X (드롭다운 토글만) */}
                {isRecruit ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMenu((cur) => (cur === item.name ? null : item.name));
                    }}
                    className={`font-black tracking-widest transition-all h-full flex items-center ${
                      isActive || activeMenu === item.name
                        ? "text-[#813eb6] text-[16px]"
                        : "text-gray-600 text-[14px]"
                    }`}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`font-black tracking-widest transition-all h-full flex items-center ${
                      isActive || activeMenu === item.name
                        ? "text-[#813eb6] text-[16px]"
                        : "text-gray-600 text-[14px]"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}

                {/* dropdown */}
                <div
                  className={`absolute top-20 left-1/2 -translate-x-1/2 w-44 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-5 border border-gray-50 transition-all duration-300 transform origin-top ${
                    activeMenu === item.name
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible"
                  }`}
                >
                  <div className="flex flex-col space-y-1">
                    {item.subMenus.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => setActiveMenu(null)} // ✅ 클릭하면 드롭다운 닫기
                        className="px-4 py-2.5 text-[13px] font-bold text-gray-400 hover:text-[#813eb6] hover:bg-purple-50 rounded-2xl transition-all whitespace-nowrap"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Desktop auth */}
        <div className="hidden md:flex items-center gap-6">
          {loading ? (
            <span className="text-xs text-gray-400 font-bold">로딩중...</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* ✅ 관리자일 때만 회원관리 버튼 */}
              {isSuperAdmin && (
                <button
                  onClick={() => navigate("/admin/members")}
                  className="text-[12px] font-black text-[#813eb6] bg-purple-50 px-4 py-2 rounded-full border border-purple-100 hover:bg-purple-100 transition-all"
                >
                  회원관리
                </button>
              )}

              <span className="text-[12px] font-black text-gray-800 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                {user.generation}기 {user.department} {user.name}
              </span>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-[12px] font-black text-gray-400 hover:text-red-500 transition-all uppercase"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/login")}
                className="text-[12px] font-black text-gray-400 hover:text-[#813eb6] transition-all"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2.5 bg-[#813eb6] text-white rounded-full text-[12px] font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transition-all transform hover:-translate-y-0.5"
              >
                JOIN
              </button>
            </div>
          )}
        </div>

        {/* Mobile: hamburger + simple auth */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => navigate("/")}
              className="text-xs font-black text-gray-700 bg-gray-50 px-3 py-2 rounded-full border border-gray-100"
            >
              {user.name}
            </button>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-xl border border-gray-200 bg-white"
            aria-label="메뉴"
          >
            <div className="w-5 h-[2px] bg-gray-700 mb-1.5" />
            <div className="w-5 h-[2px] bg-gray-700 mb-1.5" />
            <div className="w-5 h-[2px] bg-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-2">
            {/* auth area */}
            {loading ? (
              <div className="text-sm text-gray-400 font-bold py-2">로딩중...</div>
            ) : user ? (
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-black text-gray-800">
                  {user.generation}기 {user.department} {user.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMobile();
                    navigate("/login");
                  }}
                  className="text-sm font-black text-red-500"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    closeMobile();
                    navigate("/login");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => {
                    closeMobile();
                    navigate("/signup");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#813eb6] text-white text-sm font-black"
                >
                  JOIN
                </button>
              </div>
            )}

            {/* admin */}
            {user && isSuperAdmin && (
              <button
                onClick={() => {
                  closeMobile();
                  navigate("/admin/members");
                }}
                className="w-full px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-sm font-black text-[#813eb6]"
              >
                회원관리
              </button>
            )}

            {/* nav accordion */}
            <div className="pt-2">
              {navItems.map((item) => {
                const open = mobileAccordion === item.name;
                return (
                  <div
                    key={item.name}
                    className="border border-gray-100 rounded-2xl mb-2 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setMobileAccordion((cur) => (cur === item.name ? null : item.name))
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-gray-800 bg-white"
                    >
                      {item.name}
                      <span className="text-gray-400">{open ? "−" : "+"}</span>
                    </button>

                    {open && (
                      <div className="px-3 pb-3">
                        {item.subMenus.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={closeMobile}
                            className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-[#813eb6]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
