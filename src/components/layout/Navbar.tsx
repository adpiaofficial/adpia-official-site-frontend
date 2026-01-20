import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  
  // 현재 마우스가 올라간 메뉴 상태 관리
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 이미지 기반 카테고리 구조 설정 (ADPIA 소개/회장단 제외)
  const navItems = [
    { 
      name: "ADPIA", 
      path: "/about",
      subMenus: [
        { name: "연혁", path: "/about/history" },
        { name: "회칙", path: "/about/rules" },
        { name: "보도자료", path: "/about/news" },
        { name: "CI", path: "/about/ci" }
      ]
    },
    { 
      name: "COMMUNITY", 
      path: "/community",
      subMenus: [
        { name: "공지사항", path: "/community/notice" },
        { name: "애드찬스", path: "/community/chance" },
        { name: "활동 사진", path: "/community/gallery" },
        { name: "OB 게시판", path: "/community/ob" }
      ]
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
        { name: "광고학개론", path: "/archive/intro" }
      ]
    },
    { 
      name: "SEMMINAR", 
      path: "/seminar",
      subMenus: [
        { name: "전체", path: "/seminar/all" },
        { name: "학술국", path: "/seminar/academic" },
        { name: "운영팀", path: "/seminar/operation" }
      ]
    },
    { 
      name: "RECRUIT", 
      path: "/recruit",
      subMenus: [
        { name: "공지사항", path: "/recruit/notice" },
        { name: "Q&A", path: "/recruit/faq" }
      ]
    },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 w-full z-[100] bg-white shadow-sm border-b border-gray-100 font-noto"
      onMouseLeave={() => setActiveMenu(null)} // 네브바 영역 벗어나면 드롭다운 닫기
    >
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center">

        {/* 왼쪽: 로고 */}
        <div className="w-1/3 flex items-center">
          <Link to="/">
            <img src={logo} alt="ADPIA" className="h-9 w-auto" />
          </Link>
        </div>

        {/* 가운데: 메뉴 (정중앙 고정 및 드롭다운 기능) */}
        <div className="w-1/3 flex justify-center space-x-10 transform -translate-x-16 h-full">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <div 
                key={item.name} 
                className="relative h-full flex items-center group"
                onMouseEnter={() => setActiveMenu(item.name)}
              >
                <Link
                  to={item.path}
                  className={`font-black tracking-widest transition-all h-full flex items-center ${
                    isActive || activeMenu === item.name ? "text-[#813eb6] text-[16px]" : "text-gray-600 text-[14px]"
                  }`}
                >
                  {item.name}
                </Link>

                {/* 하위 메뉴 드롭다운 박스 */}
                <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-44 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-5 border border-gray-50 transition-all duration-300 transform origin-top ${
                  activeMenu === item.name ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                }`}>
                  <div className="flex flex-col space-y-1">
                    {item.subMenus.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
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

        {/* 오른쪽: 로그인/유저정보 */}
        <div className="w-1/3 flex justify-end items-center space-x-6">
          {loading ? (
            <span className="text-xs text-gray-400 font-bold">로딩중...</span>
          ) : user ? (
            <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-5">
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
      </div>
    </nav>
  );
};

export default Navbar;
