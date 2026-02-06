// src/pages/AboutPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import mainLogo from "../assets/logo.png";
import HomeDeptTeamShowcase from "../components/HomeDeptTeamShowcase";
import { getExecutivesPublic, type ExecutiveGroup, type AdminExecutiveMemberRequest } from "../api/executiveApi";
import { useAuth } from "../contexts/AuthContext";

type MemberVM = AdminExecutiveMemberRequest;

function formatMemberLine(m: MemberVM) {
  return `${m.generation} ${m.department} ${m.name}`.trim();
}

export default function AboutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "ROLE_SUPER_ADMIN";

  const [headerTitle] = useState("애드피아 임원진"); // 그룹 없앴으니 고정
  const [members, setMembers] = useState<MemberVM[]>([]);
  const [loaded, setLoaded] = useState(false);

  const flatMembers = useMemo(() => {
    return (members ?? [])
      .filter((m) => m.active !== false)
      .slice()
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [members]);

  useEffect(() => {
    (async () => {
      try {
        const groups: ExecutiveGroup[] = await getExecutivesPublic();
        const flat = groups.flatMap((g) => g.members ?? []);
        setMembers(flat);
      } catch (e) {
        console.warn("임원진 공개 데이터 로딩 실패", e);
        setMembers([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen font-noto bg-white overflow-x-hidden">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#813eb6] via-[#9d5ce5] to-[#f3ebff] pt-36 pb-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-20">
            <div className="w-full lg:w-2/3">
              <h1 className="text-4xl md:text-5xl font-black mb-10 leading-[1.3] drop-shadow-md">
                여럿이 하나, <span className="text-[#3d1d56]">애드피아</span>
              </h1>

              <div className="max-w-2xl space-y-6 text-lg font-medium leading-relaxed opacity-95">
                <p>
                  애드피아는 광고에 대한 열정으로 함께 이상세계를 펼쳐 나가자는 목표 아래, 1992년에 설립된 대학생 연합 광고 동아리입니다.
                </p>
                <div className="text-base font-light opacity-80 border-l-2 border-white/30 pl-6 space-y-2">
                  <p>기획·카피·미디어 디자인을 아우르는 경쟁 PT, 사회 공헌 프로젝트를 진행하며</p>
                  <p>매주 토요일 정기 세미나를 통해 광고를 직접 만듭니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 -right-24 opacity-[0.18] pointer-events-none hidden lg:block select-none transform rotate-12">
            <img src={mainLogo} alt="" className="w-[850px] h-auto grayscale contrast-125 brightness-110" />
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 border border-white/20 shadow-2xl relative z-20 overflow-hidden">
            <span className="text-[#3d1d56] font-black text-xs tracking-[0.5em] uppercase mb-4 block">Our Spirit</span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-6">
              우리는 광고를 통해 세상을 보고, <br />
              서로의 아이디어를 통해 함께 성장합니다.
            </h2>
            <p className="text-white/80 font-light text-base md:text-lg max-w-3xl leading-relaxed">
              단순한 친목을 넘어 실질적인 광고 역량을 키우고, 우리의 아이디어로 세상을 조금 더 흥미롭게 만드는 것. 그것이 애드피아가 30년 넘게 지켜온 가치입니다.
            </p>
          </div>
        </div>
      </section>

      {/* EXECUTIVES */}
      <section className="py-28 bg-[#F8F5FF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="text-center w-full">
              <span className="text-[#813eb6] font-black text-xs tracking-[0.4em] uppercase mb-4 block italic">
                Leaders
              </span>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">{headerTitle}</h2>
            </div>

            {/* ✅ 관리자만 버튼 보임 */}
            {isSuperAdmin && (
              <button
                onClick={() => navigate("/admin/executives")}
                className="shrink-0 px-5 py-3 rounded-2xl bg-[#813eb6] text-white font-black hover:brightness-110 shadow-lg shadow-purple-200"
              >
                운영진 편집
              </button>
            )}
          </div>

          {!loaded ? (
            <div className="text-center text-gray-400 font-bold">불러오는 중...</div>
          ) : flatMembers.length === 0 ? (
            <div className="text-center text-gray-400 font-bold">등록된 임원진이 없습니다.</div>
          ) : (
            <div className="grid gap-x-12 gap-y-16 w-full max-w-6xl mx-auto grid-cols-1 sm:grid-cols-3">
              {flatMembers.map((m, idx) => (
                <div key={`${m.id ?? "m"}-${idx}`} className="flex flex-col items-center group text-center">
                  <div className="w-full aspect-[3/4] bg-white rounded-2xl mb-6 shadow-xl shadow-purple-200/50 overflow-hidden border border-white transition-all duration-500 group-hover:-translate-y-2">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <img src={mainLogo} alt="" className="w-20 opacity-30" />
                      </div>
                    )}
                  </div>
                  <p className="text-[#813eb6] font-black text-sm mb-1 uppercase tracking-tighter italic">{m.role}</p>
                  <p className="text-gray-400 text-[11px] font-bold tracking-tight uppercase leading-none">
                    {formatMemberLine(m)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-20 h-20 bg-gradient-to-b from-[#F8F5FF] to-transparent" />
        <HomeDeptTeamShowcase />
      </section>
    </div>
  );
}
