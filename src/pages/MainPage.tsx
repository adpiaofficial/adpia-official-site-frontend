import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import logoWhite from "../assets/logowhite.png";

import { getRecruitPosts, type RecruitPost, type PageResponse } from "../api/recruitApi";
import { getActivePopup, type PopupResponse } from "../api/popupApi";
import HomePopupModal from "../components/HomePopupModal";
import { isDismissedToday } from "../lib/popupDismiss";

type NoticeSource = "RECRUIT_NOTICE" | "COMMUNITY_NOTICE";

type NoticeCardVM = {
  id: number;
  title: string;
  date: string;
  source: NoticeSource;
  href: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function sourceLabel(source: NoticeSource) {
  switch (source) {
    case "RECRUIT_NOTICE":
      return "Recruit 공지사항";
    case "COMMUNITY_NOTICE":
      return "Community 공지사항";
    default:
      return "NOTICE";
  }
}

function sourceColor(source: NoticeSource) {
  switch (source) {
    case "RECRUIT_NOTICE":
      return "bg-[#813eb6]";
    case "COMMUNITY_NOTICE":
      return "bg-gray-800";
    default:
      return "bg-gray-800";
  }
}

const ACTIVITY_PHOTOS = {
  main: { title: "정기 세미나 현장", desc: "COMMUNITY > 활동 사진의 최신 게시물을 가져옵니다." },
  sub1: { title: "애드찬스", desc: "COMMUNITY > 애드찬스" },
  sub2: { title: "경쟁 PT", desc: "ARCHIVE > 경쟁 PT" },
};

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState<NoticeCardVM[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(true);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popup, setPopup] = useState<PopupResponse | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await getActivePopup();
        if (!alive) return;

        if (!p) return;
        if (isDismissedToday(p.id)) return;

        setPopup(p);
        setPopupOpen(true);
      } catch {
        // noop
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadNotices = async () => {
      setNoticeLoading(true);
      try {
        const data: PageResponse<RecruitPost> = await getRecruitPosts("NOTICE", 0, 2);

        const recruitNotices: NoticeCardVM[] = (data.content ?? []).map((p) => ({
          id: p.id,
          title: p.title,
          date: formatDate(p.createdAt),
          source: "RECRUIT_NOTICE",
          href: `/recruit/notice/${p.id}`,
        }));

        if (!alive) return;
        setNotices(recruitNotices);
      } catch {
        if (!alive) return;
        setNotices([]);
      } finally {
        if (!alive) return;
        setNoticeLoading(false);
      }
    };

    void loadNotices();

    return () => {
      alive = false;
    };
  }, []);

  const noticeCards = useMemo(() => notices.slice(0, 2), [notices]);

  return (
    <div className="bg-white pt-20 overflow-hidden">
      {popupOpen && popup && <HomePopupModal popup={popup} onClose={() => setPopupOpen(false)} />}

      {/* =========================
          HERO (로고박스 제거 / italic 제거 / 줄간격 조정 / 로고 오른쪽)
         ========================= */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f3ebff] via-[#d6bcfa] to-[#813eb6]">
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center relative z-10 text-white">
          {/* LEFT */}
          <div className="animate-fade-in-up">
            {/* ✅ 폰트 그대로(font-montserrat) + italic만 제거 */}
            <h1 className="text-6xl md:text-8xl font-black mb-7 leading-[1.02] font-montserrat tracking-tighter">
              ALL for ONE
              <br />
              {/* ✅ ONE for ALL 색상: 기존 느낌(#3d1d56) */}
              <span className="text-[#3d1d56]">ONE for ALL</span>
            </h1>

            {/* ✅ 첫 줄을 "목표 아래,"까지 고정 */}
            <p className="font-paperlogy font-normal text-[18px] md:text-[19px] leading-[1.95] text-white/95">
              애드피아는 광고에 대한 열정으로 함께 이상세계를 펼쳐 나가자는 목표 아래,
              <br />
              1992년에 설립된 대학생 연합 광고 동아리입니다.
            </p>

            <div className="mt-12">
              <button
                onClick={() => window.open("https://www.instagram.com/adpiaofficial/", "_blank")}
                className="inline-flex items-center justify-center h-12 md:h-14 px-9 md:px-11 rounded-full bg-white text-[#813eb6] shadow-2xl transition-all transform hover:-translate-y-1 hover:bg-[#3d1d56] hover:text-white font-black text-[16px] md:text-[20px]"
              >
                @adpiaofficial
              </button>
            </div>
          </div>

          {/* RIGHT (✅ 로고박스 제거 + 로고를 더 오른쪽으로) */}
          <div className="flex justify-center lg:justify-end animate-fade-in lg:translate-x-5 xl:translate-x-10">
            <img
              src={logoWhite}
              alt="ADPIA Logo"
              className="object-contain drop-shadow-2xl w-[700px] md:w-[800px] transition-transform duration-500 hover:scale-[1.16]"
            />
          </div>
        </div>
      </section>

      {/* =========================
          NOTICE
         ========================= */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter font-montserrat border-l-8 border-[#813eb6] pl-6">
              NOTICE
            </h2>
          </div>

          <button
            onClick={() => navigate("/recruit/notice")}
            className="text-gray-400 font-bold text-sm hover:text-[#813eb6] transition-colors border-b-2 border-transparent hover:border-[#813eb6] pb-1"
          >
            공지사항 전체보기 +
          </button>
        </div>

        {noticeLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : noticeCards.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 text-gray-400 font-bold">
            표시할 공지사항이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {noticeCards.map((news, idx) => (
              <div
                key={`${news.source}-${news.id}`}
                onClick={() => navigate(news.href)}
                className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
              >
                <div className={`${sourceColor(news.source)} p-5 flex justify-between items-center text-white`}>
                  <span className="font-bold text-[10px] tracking-widest uppercase">{sourceLabel(news.source)}</span>
                  <span className="text-2xl font-black opacity-20">#{String(idx + 1).padStart(2, "0")}</span>
                </div>

                <div className="p-8 flex flex-col flex-grow justify-between bg-white">
                  <h3 className="font-bold text-gray-800 text-lg leading-snug h-14 line-clamp-2 group-hover:text-[#813eb6] transition-colors">
                    {news.title}
                  </h3>

                  <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-gray-50 pt-6 font-medium">
                    <span>📅 {news.date}</span>
                    <span className="font-black text-[#813eb6] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter">
                      Read +
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================
          Live Feed
         ========================= */}
      <section className="py-24 bg-[#F9F7FF]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <span className="text-[#813eb6] font-black text-sm tracking-[0.4em] uppercase mb-3 block font-montserrat">
              Live Feed
            </span>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              애드피아의 <span className="text-[#813eb6]">활동 사진</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[650px]">
            <div
              onClick={() => navigate("/community")}
              className="md:col-span-8 relative group overflow-hidden rounded-[3.5rem] shadow-2xl bg-gray-200 cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-2xl tracking-widest uppercase font-montserrat">
                Latest Activity Image
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d1d56]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 p-12 flex flex-col justify-end text-white">
                <h4 className="text-4xl font-black mb-4 uppercase font-montserrat">{ACTIVITY_PHOTOS.main.title}</h4>
                <p className="text-white/80 text-lg font-light leading-relaxed max-w-lg">{ACTIVITY_PHOTOS.main.desc}</p>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-8">
              <div
                onClick={() => navigate("/community")}
                className="flex-1 bg-[#813eb6] rounded-[3rem] flex flex-col items-center justify-center text-white p-10 shadow-xl group cursor-pointer hover:bg-[#3d1d56] transition-all duration-500"
              >
                <span className="text-white/40 font-black text-[10px] tracking-[0.6em] mb-4 uppercase">Experience</span>
                <div className="font-black text-3xl uppercase tracking-tighter font-montserrat group-hover:scale-110 transition-transform">
                  {ACTIVITY_PHOTOS.sub1.title}
                </div>
              </div>

              <div
                onClick={() => navigate("/archive")}
                className="flex-1 bg-white rounded-[3rem] flex flex-col items-center justify-center p-8 text-center shadow-lg border border-purple-50 group hover:border-[#813eb6] transition-all cursor-pointer"
              >
                <span className="text-[#813eb6] font-black text-5xl mb-4 font-montserrat group-hover:animate-bounce">A+</span>
                <p className="text-gray-900 font-black text-xl uppercase tracking-tighter mb-1">{ACTIVITY_PHOTOS.sub2.title}</p>
                <p className="text-gray-400 text-xs font-medium opacity-60 uppercase tracking-widest">Archive records</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
