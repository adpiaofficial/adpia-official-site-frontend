import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import logoWhite from "../assets/logowhite.png";

import { getRecruitPosts, type RecruitPost, type PageResponse } from "../api/recruitApi";
import { getActivePopup, type PopupResponse } from "../api/popupApi";
import { getMainActivityFeed, type MainActivityFeedResponse } from "../api/mainApi";
import HomePopupModal from "../components/HomePopupModal";
import { isDismissedToday } from "../lib/popupDismiss";
import { useAuth } from "../contexts/AuthContext";

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

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = isAdminRole(user?.role);

  const [notices, setNotices] = useState<NoticeCardVM[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(true);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popup, setPopup] = useState<PopupResponse | null>(null);

  const [activityFeed, setActivityFeed] = useState<MainActivityFeedResponse | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

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

  useEffect(() => {
    let alive = true;

    const loadActivityFeed = async () => {
      setActivityLoading(true);
      try {
        const data = await getMainActivityFeed();
        if (!alive) return;
        setActivityFeed(data);
      } catch {
        if (!alive) return;
        setActivityFeed(null);
      } finally {
        if (!alive) return;
        setActivityLoading(false);
      }
    };

    void loadActivityFeed();

    return () => {
      alive = false;
    };
  }, []);

  const noticeCards = useMemo(() => notices.slice(0, 2), [notices]);

  const mainActivity = activityFeed?.main ?? null;
  const sideActivities = (activityFeed?.side ?? []).filter(
    (item) => item.id !== mainActivity?.id
  );
  const sideActivity1 = sideActivities[0] ?? null;
  const sideActivity2 = sideActivities[1] ?? null;

  return (
    <div className="bg-white pt-20 overflow-hidden">
      {popupOpen && popup && <HomePopupModal popup={popup} onClose={() => setPopupOpen(false)} />}

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f3ebff] via-[#d6bcfa] to-[#813eb6]">
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center relative z-10 text-white">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black mb-7 leading-[1.02] font-montserrat tracking-tighter">
              ALL for ONE
              <br />
              <span className="text-[#3d1d56]">ONE for ALL</span>
            </h1>

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

          <div className="flex justify-center lg:justify-end animate-fade-in lg:translate-x-5 xl:translate-x-10">
            <img
              src={logoWhite}
              alt="ADPIA Logo"
              className="object-contain drop-shadow-2xl w-[700px] md:w-[800px] transition-transform duration-500 hover:scale-[1.16]"
            />
          </div>
        </div>
      </section>

      {/* NOTICE */}
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
                  <span className="font-bold text-[10px] tracking-widest uppercase">
                    {sourceLabel(news.source)}
                  </span>
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

      {/* ACTIVITY FEED */}
      <section className="py-24 bg-[#F9F7FF]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 flex items-end justify-between gap-4">
            <div>
              <span className="text-[#813eb6] font-black text-sm tracking-[0.4em] uppercase mb-3 block font-montserrat">
                Live Feed
              </span>
              <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
                애드피아의 <span className="text-[#813eb6]">활동 사진</span>
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={() => navigate("/community/activity")}
                className="shrink-0 px-5 py-3 rounded-2xl border border-purple-200 bg-white text-sm font-black text-[#813eb6] hover:bg-purple-50 transition-all"
              >
                대표 사진 설정
              </button>
            )}
          </div>

          {activityLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 rounded-[3.5rem] bg-gray-200 animate-pulse min-h-[400px]" />
              <div className="md:col-span-4 flex flex-col gap-8">
                <div className="rounded-[3rem] bg-gray-200 animate-pulse min-h-[190px]" />
                <div className="rounded-[3rem] bg-gray-200 animate-pulse min-h-[190px]" />
              </div>
            </div>
          ) : mainActivity ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* 메인 이미지 */}
              <div
                onClick={() => navigate(`/community/activity/${mainActivity.id}`)}
                className="md:col-span-8 relative group overflow-hidden rounded-[3.5rem] shadow-2xl bg-[#f3f0fa] cursor-pointer min-h-[400px] md:min-h-[600px]"
              >
                {mainActivity.thumbnailUrl ? (
                  <img
                    src={mainActivity.thumbnailUrl}
                    alt={mainActivity.title}
                    className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-500 absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-2xl tracking-widest uppercase font-montserrat">
                    Latest Activity Image
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <div className="absolute left-8 right-8 bottom-8 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-[11px] font-black text-[#813eb6] mb-3">
                    COMMUNITY · 활동 사진
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white break-keep drop-shadow">
                    {mainActivity.title}
                  </h4>
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/community/activity");
                    }}
                    className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur text-sm font-black text-[#813eb6] hover:bg-white transition-all"
                  >
                    대표 사진 바꾸기
                  </button>
                )}
              </div>

              {/* 사이드 이미지 */}
              <div className="md:col-span-4 flex flex-col gap-8">
                {sideActivity1 ? (
                  <div
                    onClick={() => navigate(`/community/activity/${sideActivity1.id}`)}
                    className="relative overflow-hidden rounded-[3rem] shadow-xl group cursor-pointer bg-[#f3f0fa] min-h-[280px] md:min-h-0 md:flex-1"
                  >
                    {sideActivity1.thumbnailUrl ? (
                      <img
                        src={sideActivity1.thumbnailUrl}
                        alt={sideActivity1.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                    <div className="absolute left-6 right-6 bottom-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="font-black text-2xl tracking-tighter text-white break-keep leading-snug">
                        {sideActivity1.title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 rounded-[3rem] bg-white border border-gray-100 min-h-[280px] md:min-h-0" />
                )}

                {sideActivity2 ? (
                  <div
                    onClick={() => navigate(`/community/activity/${sideActivity2.id}`)}
                    className="relative overflow-hidden rounded-[3rem] shadow-lg border border-purple-50 group cursor-pointer bg-[#f3f0fa] min-h-[280px] md:min-h-0 md:flex-1"
                  >
                    {sideActivity2.thumbnailUrl ? (
                      <img
                        src={sideActivity2.thumbnailUrl}
                        alt={sideActivity2.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                    <div className="absolute left-6 right-6 bottom-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-black text-xl tracking-tighter mb-1 break-keep leading-snug">
                        {sideActivity2.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 rounded-[3rem] bg-white border border-gray-100 min-h-[280px] md:min-h-0" />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[3rem] bg-white border border-gray-100 p-10 text-gray-400 font-bold">
              표시할 활동 사진이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MainPage;