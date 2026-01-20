import React, { useEffect, useState } from "react";
// 💡 로고 파일 경로를 다시 한번 확인해주세요!
import mainLogo from "../assets/logowhite.png";

// 1. 인터페이스 정의
interface Member {
  id: number;
  role: string;
  generation: string;
  department: string;
  name: string;
  imageUrl: string | null;
}

interface ExecutiveGroup {
  title: string;
  members: Member[];
}

// 2. 초기 데이터 (백엔드 연동 전 화면을 채워줄 데이터)
const INITIAL_DATA: ExecutiveGroup[] = [
  {
    title: "68대 회장단",
    members: [
      { id: 1, role: "회장", generation: "68기", department: "기획부", name: "홍길동", imageUrl: null },
      { id: 2, role: "부회장", generation: "68기", department: "카피부", name: "김철수", imageUrl: null },
      { id: 3, role: "총무", generation: "68기", department: "미디부", name: "이영희", imageUrl: null },
    ]
  },
  {
    title: "운영진",
    members: [
      { id: 4, role: "학술국장", generation: "69기", department: "기획부", name: "박지민", imageUrl: null },
      { id: 5, role: "서기", generation: "70기", department: "카피부", name: "최유나", imageUrl: null },
    ]
  },
  {
    title: "부서 및 팀장단",
    members: [
      { id: 6, role: "기획부장", generation: "68기", department: "기획부", name: "정우성", imageUrl: null },
      { id: 7, role: "카피부장", generation: "68기", department: "카피부", name: "한지민", imageUrl: null },
      { id: 8, role: "미디부장", generation: "68기", department: "미디부", name: "이정재", imageUrl: null },
    ]
  }
];

const AboutPage = () => {
  const [executiveGroups, setExecutiveGroups] = useState<ExecutiveGroup[]>(INITIAL_DATA);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const response = await fetch('https://your-api-server.com/api/executives');
        if (response.ok) {
          const serverData = await response.json();
          if (serverData && serverData.length > 0) setExecutiveGroups(serverData);
        }
      } catch (error) {
        console.warn("백엔드 연동 전: 초기 데이터를 사용합니다.");
      }
    };
    fetchExecutives();
  }, []);

  return (
    <div className="min-h-screen font-noto bg-white overflow-hidden">
      
      {/* [SECTION 1] HERO & SPIRIT - 상단 로고 제거 및 배경 로고 강화 */}
      <section className="bg-gradient-to-br from-[#813eb6] via-[#9d5ce5] to-[#f3ebff] pt-44 pb-24 text-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-start mb-20">
            <div className="w-full lg:w-2/3">
              {/* 상단 흰색 로고 영역 삭제 (요청 반영) */}
              
              <h1 className="text-4xl md:text-5xl font-black mb-10 leading-[1.3] drop-shadow-md">
                여럿이 하나, <span className="text-[#3d1d56]">애드피아</span>
              </h1>
              
              <div className="max-w-2xl space-y-6 text-lg font-medium leading-relaxed opacity-95">
                <p>애드피아는 광고에 대한 열정으로 함께 이상세계를 펼쳐 나가자는 목표 아래, 1992년에 설립된 대학생 연합 광고 동아리입니다.</p>
                <div className="text-base font-light opacity-80 border-l-2 border-white/30 pl-6 space-y-2">
                  <p>기획·카피·미디어 디자인을 아우르는 경쟁 PT, 사회 공헌 프로젝트를 진행하며</p>
                  <p>매주 토요일 정기 세미나를 통해 광고를 직접 만듭니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 배경 로고 워터마크: 선명도와 대비 상향 */}
          <div className="absolute -bottom-16 -right-24 opacity-[0.18] pointer-events-none hidden lg:block select-none transform rotate-12">
            <img 
              src={mainLogo} 
              alt="" 
              className="w-[850px] h-auto grayscale contrast-125 brightness-110" 
            />
          </div>

          {/* Our Spirit 카드 (Glassmorphism 적용) */}
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

      {/* [SECTION 2] EXECUTIVES - 임원진 */}
      <section className="py-32 bg-[#F8F5FF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-[#813eb6] font-black text-xs tracking-[0.4em] uppercase mb-4 block italic">Leaders</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">애드피아 68대 임원진</h2>
          </div>

          <div className="space-y-40">
            {executiveGroups.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col items-center">
                <h4 className="text-[#813eb6] font-bold mb-12 text-sm uppercase tracking-widest italic">{group.title}</h4>
                <div className={`grid gap-x-12 gap-y-16 w-full ${
                  group.members.length === 2 ? "max-w-2xl grid-cols-2" : "max-w-6xl grid-cols-1 sm:grid-cols-3"
                }`}>
                  {group.members.map((member) => (
                    <div key={member.id} className="flex flex-col items-center group text-center">
                      <div className="w-full aspect-[3/4] bg-white rounded-2xl mb-6 shadow-xl shadow-purple-200/50 overflow-hidden border border-white transition-all duration-500 group-hover:-translate-y-2">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 font-black text-6xl italic uppercase">AD</div>
                        )}
                      </div>
                      <p className="text-[#813eb6] font-black text-sm mb-1 uppercase tracking-tighter italic">{member.role}</p>
                      <p className="text-gray-400 text-[11px] font-bold tracking-tight uppercase leading-none">
                        {member.generation} {member.department} {member.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [SECTION 3] ACADEMIC - 학술국 상세 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-16 border-l-8 border-[#813eb6] pl-6 tracking-tight uppercase">| ADPIA Academic Units</h2>
          <div className="space-y-20">
            {[
              { name: "기획부", link: "https://www.instagram.com/adpia_planning", desc: "기획부는 논리적인 사고를 바탕으로 광고의 방향성과 전략을 수립하는 부서입니다. 단순히 아이디어를 내는 것에 그치지 않고, 시장 분석과 타겟 인사이트 도출을 통해 탄탄한 광고 기획서를 작성합니다." },
              { name: "카피부", link: "https://www.instagram.com/adpia_copy", desc: "카피부는 브랜드의 핵심 메시지를 매력적인 언어로 구체화하고 전달하는 부서입니다. 기획서의 본질을 관통하는 컨셉을 구성하고 소비자의 마음을 움직이는 카피를 다듬습니다." },
              { name: "미디어 디자인부", link: "https://www.instagram.com/adpia_mediadesign", desc: "미디어디자인부는 광고의 메시지를 시각적으로 구현하는 부서입니다. 영상, 그래픽 등 다양한 미디어를 통해 브랜드 경험을 디자인하고 아이디어를 현실로 만듭니다." }
            ].map((dept, i) => (
              <div key={i} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group">
                <div className="lg:w-3/4">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{dept.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-base font-light">{dept.desc}</p>
                </div>
                <a href={dept.link} target="_blank" rel="noreferrer" className="whitespace-nowrap px-10 py-3 border-2 border-[#813eb6] text-[#813eb6] font-bold rounded-full hover:bg-[#813eb6] hover:text-white transition-all text-sm uppercase tracking-widest">
                  {dept.name} 바로가기
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [SECTION 4] OPERATIONS - 운영팀 상세 */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-16 border-l-8 border-gray-300 pl-6 tracking-tight uppercase">| ADPIA Operation Teams</h2>
          <div className="space-y-20">
            {[
              { name: "대외협력팀", link: "#", desc: "외부 기업과의 협찬 및 협업 프로젝트 전반을 담당합니다. 신입 모집, 경쟁 PT 등 주요 행사의 기업 연락 및 파트너십을 관리합니다." },
              { name: "영상제작팀", link: "#", desc: "애드피아의 다양한 활동과 브랜딩을 위한 영상 콘텐츠를 기획 및 제작합니다. 시청 트렌드에 맞춘 영상으로 동아리의 활동을 기록합니다." },
              { name: "콘텐츠팀", link: "#", desc: "각종 SNS 콘텐츠 제작과 매년 발간되는 회지 제작을 담당합니다. 정기적인 아카이빙을 통해 애드피아의 브랜드 이미지를 구축합니다." }
            ].map((team, i) => (
              <div key={i} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="lg:w-3/4">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{team.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-base font-light">{team.desc}</p>
                </div>
                <a href={team.link} className={`whitespace-nowrap px-10 py-3 border-2 font-bold rounded-full transition-all text-sm uppercase tracking-widest ${team.link === "#" ? "border-gray-200 text-gray-400 cursor-not-allowed" : "border-[#3d1d56] text-[#3d1d56] hover:bg-[#3d1d56] hover:text-white"}`}>
                  {team.name} 바로가기
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;