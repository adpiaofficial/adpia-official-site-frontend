import React from "react";
import { useNavigate } from "react-router-dom";
import logoWhite from "../assets/logoWhite.png";

/**
 * 💡 데이터 관리 포인트 (전체 공지사항 더미 데이터)
 */
const ALL_NOTICES = [
  { id: 1, tag: '전체공지', title: '애드피아 웹사이트 리뉴얼 안내 및 이용 가이드', date: '2026.01.19', color: 'bg-gray-800' },
  { id: 2, tag: '신입모집', title: '제 34기 신입 부원 선발 모집 요강 (RECRUIT)', date: '2026.01.12', color: 'bg-[#813eb6]' },
  { id: 3, tag: '학술국', title: '이번 주 정기 세미나 발제 자료 업로드 안내', date: '2026.01.10', color: 'bg-blue-500' },
  { id: 4, tag: '이벤트', title: 'OB와 함께하는 광고인의 밤 행사 참여 신청', date: '2026.01.05', color: 'bg-orange-500' },
];

const ACTIVITY_PHOTOS = {
  main: { title: "정기 세미나 현장", desc: "COMMUNITY > 활동 사진의 최신 게시물을 가져옵니다." },
  sub1: { title: "애드찬스", desc: "COMMUNITY > 애드찬스" },
  sub2: { title: "경쟁 PT", desc: "ARCHIVE > 경쟁 PT" },
};

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-noto bg-white pt-20 overflow-hidden">
      
      {/* [SECTION 1] HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f3ebff] via-[#d6bcfa] to-[#813eb6]">
        <div className="absolute top-[-5%] right-[-5%] w-[700px] h-[700px] opacity-10 pointer-events-none select-none">
          <img src={logoWhite} alt="" className="w-full h-full object-contain rotate-12 grayscale brightness-200" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 text-white">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight font-montserrat italic tracking-tighter">
              Advertising <br /> has the <span className="text-[#3d1d56]">power</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-10 drop-shadow-md">여럿이 하나, 애드피아</p>
            <button 
              onClick={() => navigate("/about")} 
              className="px-10 py-4 bg-white text-[#813eb6] rounded-full font-black shadow-2xl hover:bg-[#3d1d56] hover:text-white transition-all transform hover:-translate-y-1"
            >
              ADPIA 소개 보기
            </button>
          </div>

          <div className="flex justify-center lg:justify-end animate-fade-in">
            <div className="w-80 h-80 md:w-[500px] md:h-[500px] bg-white/10 backdrop-blur-2xl rounded-[4rem] border border-white/20 flex flex-col items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.15)] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src={logoWhite} 
                alt="ADPIA Main Logo" 
                className="w-40 md:w-60 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500 relative z-10" 
              />
              <div className="mt-8 text-4xl md:text-6xl font-black tracking-[0.4em] font-montserrat italic uppercase text-white opacity-80 relative z-10">
                ADPIA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* [SECTION 2] NOTICE - 전체 공지사항 반영 */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            {/* 상단 Recruit 문구 제거 및 NOTICE로 타이틀 통일 */}
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic font-montserrat border-l-8 border-[#813eb6] pl-6">
              NOTICE
            </h2>
          </div>
          <button 
            onClick={() => navigate("/community")} // 전체 공지는 커뮤니티 > 공지사항으로 연결
            className="text-gray-400 font-bold text-sm hover:text-[#813eb6] transition-colors border-b-2 border-transparent hover:border-[#813eb6] pb-1"
          >
            공지사항 전체보기 +
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ALL_NOTICES.map((news) => (
            <div 
              key={news.id} 
              onClick={() => navigate("/community")} // 클릭 시 공지사항 게시판으로 이동
              className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
            >
              <div className={`${news.color} p-5 flex justify-between items-center text-white`}>
                <span className="font-bold text-[10px] tracking-widest uppercase">{news.tag}</span>
                <span className="text-2xl font-black opacity-20 italic">#0{news.id}</span>
              </div>
              <div className="p-8 flex flex-col flex-grow justify-between bg-white">
                <h3 className="font-bold text-gray-800 text-lg leading-snug h-14 line-clamp-2 group-hover:text-[#813eb6] transition-colors">
                  {news.title}
                </h3>
                <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-gray-50 pt-6 italic font-medium">
                  <span>📅 {news.date}</span>
                  <span className="font-black text-[#813eb6] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter">Read +</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* [SECTION 3] ACTIVITY PHOTOS */}
      <section className="py-24 bg-[#F9F7FF]"> 
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <span className="text-[#813eb6] font-black text-sm tracking-[0.4em] uppercase mb-3 block font-montserrat">Live Feed</span>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              애드피아의 <span className="text-[#813eb6] italic">활동 사진</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[650px]">
            <div 
              onClick={() => navigate("/community")} 
              className="md:col-span-8 relative group overflow-hidden rounded-[3.5rem] shadow-2xl bg-gray-200 cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-2xl italic tracking-widest uppercase font-montserrat">
                Latest Activity Image
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d1d56]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 p-12 flex flex-col justify-end text-white">
                <h4 className="text-4xl font-black mb-4 italic uppercase font-montserrat">{ACTIVITY_PHOTOS.main.title}</h4>
                <p className="text-white/80 text-lg font-light leading-relaxed max-w-lg">{ACTIVITY_PHOTOS.main.desc}</p>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-8">
              <div 
                onClick={() => navigate("/community")} 
                className="flex-1 bg-[#813eb6] rounded-[3rem] flex flex-col items-center justify-center text-white p-10 shadow-xl group cursor-pointer hover:bg-[#3d1d56] transition-all duration-500"
              >
                <span className="text-white/40 font-black text-[10px] tracking-[0.6em] mb-4 uppercase">Experience</span>
                <div className="font-black text-3xl uppercase tracking-tighter italic font-montserrat group-hover:scale-110 transition-transform">
                  {ACTIVITY_PHOTOS.sub1.title}
                </div>
              </div>

              <div 
                onClick={() => navigate("/archive")} 
                className="flex-1 bg-white rounded-[3rem] flex flex-col items-center justify-center p-8 text-center shadow-lg border border-purple-50 group hover:border-[#813eb6] transition-all cursor-pointer"
              >
                <span className="text-[#813eb6] font-black text-5xl mb-4 italic font-montserrat group-hover:animate-bounce">A+</span>
                <p className="text-gray-900 font-black text-xl uppercase tracking-tighter italic mb-1">{ACTIVITY_PHOTOS.sub2.title}</p>
                <p className="text-gray-400 text-xs font-medium italic opacity-60 uppercase tracking-widest">Archive records</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MainPage;