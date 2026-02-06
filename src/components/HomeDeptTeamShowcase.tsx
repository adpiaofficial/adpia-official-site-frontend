
type Item = {
  key: string;
  name: string;
  desc: string;
  href: string;
};

const ACADEMIC: Item[] = [
  {
    key: "planning",
    name: "기획부",
    href: "https://www.instagram.com/adpia_planning",
    desc:
      "기획부는 논리적인 사고를 바탕으로 광고의 방향성과 전략을 수립하는 부서입니다.\n" +
      "단순히 아이디어를 내는 것에 그치지 않고, 시장 분석과 타겟 인사이트 도출을 통해 탄탄한 광고 기획서를 작성합니다.\n" +
      "매주 진행되는 세미나를 통해 광고 기획자로서 갖춰야 할 실무 역량을 종합적으로 체득할 수 있습니다.",
  },
  {
    key: "copy",
    name: "카피부",
    href: "https://www.instagram.com/adpia_copy",
    desc:
      "카피부는 브랜드의 핵심 메시지를 매력적인 언어로 구체화하고 전달하는 부서입니다.\n" +
      "기획서의 본질을 관통하는 컨셉을 구성하고 소비자의 마음을 움직이는 카피를 다듬습니다.\n" +
      "매주 진행되는 세미나를 통해 카피라이터로서 갖춰야 할 실무 감각을 함께 키워갑니다.",
  },
  {
    key: "media",
    name: "미디부",
    href: "https://www.instagram.com/adpia_mediadesign",
    desc:
      "미디어디자인부는 광고의 메시지를 시각적으로 구현하는 부서입니다.\n" +
      "광고 시안부터 포스터, 굿즈, 각종 목업 제작을 통해 브랜드 경험을 디자인합니다.\n" +
      "디자인 툴의 기초부터 심화 활용, 레이아웃 감각까지 크리에이티브를 현실로 만듭니다.",
  },
];

const OPERATIONS: Item[] = [
  {
    key: "partner",
    name: "대외협력팀",
    href: "#",
    desc:
      "대외협력팀은 외부 기업과의 협찬 및 협업 프로젝트 전반을 담당하는 운영팀입니다.\n\n" +
      "신입 모집, MT, 체육대회, 경쟁 PT, 광고제 등 주요 활동에 필요한 기업 컨택을 진행하고,\n" +
      "미팅을 통해 협업 방향을 조율하며, 협찬사 홍보를 위한 카드 뉴스 제작과 결과 보고서 작성을 담당합니다.",
  },
  {
    key: "video",
    name: "영상제작팀",
    href: "#",
    desc:
      "영상제작팀은 애드피아의 다양한 활동과 행사를 기록하고, 외부 바이럴 주제를 활용해 영상 콘텐츠를 기획·제작하는 운영팀입니다.\n\n" +
      "시청 트렌드에 맞춰 협찬사 홍보 영상과 활동 현장 영상을 제작하며,\n" +
      "영상 콘텐츠를 통해 애드피아의 활동을 기록하고 확산합니다.",
  },
  {
    key: "contents",
    name: "콘텐츠팀",
    href: "#",
    desc:
      "콘텐츠팀은 각종 카드 뉴스를 직접 기획·제작하며, 매년 발간하는 회지 제작을 담당하는 운영팀입니다.\n\n" +
      "정기 콘텐츠 제작을 통해 대외적인 이미지를 구축하고,\n" +
      "진행된 각종 행사 및 프로젝트의 후기 콘텐츠를 제작하여 전반적인 활동을 아카이빙합니다.",
  },
];

const hand = "font-inklipquid";
const body = "font-pretendard";

/** 반짝이는 별 효과 컴포넌트 */
function StarGlow({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {/* 바깥쪽 퍼지는 빛 */}
      <div className="absolute inset-0 bg-white rounded-full blur-[4px] opacity-40 animate-pulse" />
      {/* 중심점 */}
      <div className="relative w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
    </div>
  );
}

function WaveUnderline() {
  return (
    <span className="block mt-2 text-center text-white/80 leading-none select-none">
      <span className={`inline-block ${hand} tracking-[0.35em]`}>~~~~~~~</span>
    </span>
  );
}

function PillButton({ href }: { href: string }) {
  const disabled = href === "#";
  return (
    <a
      href={href}
      target={disabled ? undefined : "_blank"}
      rel={disabled ? undefined : "noreferrer"}
      className={[
        "inline-flex items-center justify-center",
        "h-9 px-5 rounded-full",
        "border border-white/30 bg-white/10 backdrop-blur-md",
        "text-white font-medium text-xs",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20 transition-all active:scale-95",
      ].join(" ")}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
    >
      바로가기 &gt;
    </a>
  );
}

function GlassCard({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={[
        "relative",
        "rounded-[2rem]",
        "bg-white/12 backdrop-blur-2xl",
        "border border-white/20",
        "text-white/90 shadow-2xl",
        "px-10 py-10",
        "leading-relaxed",
        "whitespace-pre-line",
        body,
        className,
      ].join(" ")}
    >
      {/* 카드 자체 뽀샤시한 광택 (살짝) */}
      <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-white/10 blur-[40px] opacity-30" />
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/10 via-white/0 to-white/0 opacity-60" />
      <div className="relative">{text}</div>
    </div>
  );
}

/** 학술국 전용 라벨 (별 효과 포함) */
function AcademicLabel({
  title,
  href,
  align = "left",
}: {
  title: string;
  href: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`relative flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      {/* 라벨 주변 뽀샤시 블러(앵커) */}
      <div
        className={[
          "pointer-events-none absolute -top-10",
          align === "right" ? "-right-12" : "-left-12",
          "w-44 h-44 rounded-full bg-white/18 blur-[70px] opacity-80",
        ].join(" ")}
      />
      <div
        className={[
          "pointer-events-none absolute top-10",
          align === "right" ? "-left-12" : "-right-12",
          "w-28 h-28 rounded-full bg-white/12 blur-[60px] opacity-60",
        ].join(" ")}
      />

      {/* 장식용 별들 */}
      <StarGlow className={align === "right" ? "-top-2 -left-4" : "-top-2 -right-4"} />
      <StarGlow className={align === "right" ? "top-6 -right-6 scale-125" : "top-6 -left-6 scale-125"} />
      <StarGlow className={align === "right" ? "bottom-0 -left-8 opacity-50" : "bottom-0 -right-8 opacity-50"} />

      <div className={`${hand} text-6xl mb-4 drop-shadow-md`}>{title}</div>
      <PillButton href={href} />
    </div>
  );
}

/** 아이콘 컴포넌트 */
function IconHandshake() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="opacity-80">
      <path
        d="M8.5 12.5 6 10.2a2.2 2.2 0 0 1 0-3.1l.4-.4a2.2 2.2 0 0 1 3.1 0l1.5 1.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 11.5 18 9.2a2.2 2.2 0 0 0 0-3.1l-.4-.4a2.2 2.2 0 0 0-3.1 0L12 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.7 12.7 10 14c1 1 2.5 1 3.5 0l1.7-1.7M10 14l1 1a2.5 2.5 0 0 0 3.5 0l1-1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 14.5 7 17.5M20 14.5 17 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
function IconFilm() {
  return (
    <svg width="54" height="44" viewBox="0 0 28 24" fill="none" className="opacity-80">
      <rect x="3" y="5" width="22" height="14" rx="2.5" stroke="white" strokeWidth="1.5" />
      <path d="M8 5v14M20 5v14" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <path d="M3 9h5M3 13h5M20 9h5M20 13h5" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="54" height="44" viewBox="0 0 28 24" fill="none" className="opacity-80">
      <path
        d="M3.5 7.2A2.2 2.2 0 0 1 5.7 5h5l2 2h9.6A2.2 2.2 0 0 1 24.5 9.2V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V7.2Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path d="M3.5 10h21" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export default function HomeDeptTeamShowcase() {
  return (
    <section className="relative text-white overflow-hidden">
      {/* 전체 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#9d5ce5] via-[#8e49d3] to-[#7b36c4]" />

      {/* ===== 뽀샤시한 “블러셔” 레이어 (추가 핵심) ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 큰 빛 번짐 */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-white/10 blur-[160px]" />
        <div className="absolute top-[280px] -left-40 w-[720px] h-[720px] rounded-full bg-white/10 blur-[170px]" />
        <div className="absolute bottom-0 -right-56 w-[780px] h-[780px] rounded-full bg-white/12 blur-[190px]" />
        {/* 살짝 핑크톤 섞인 번짐 */}
        <div className="absolute top-[520px] right-[18%] w-[560px] h-[560px] rounded-full bg-fuchsia-200/10 blur-[160px]" />
        {/* 은은한 ‘안개’ 레이어 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/10 opacity-30" />
      </div>

      {/* 기존 배경 장식 블러들 (유지) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-400/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 px-6">
        {/* ===== 학술국 소개 섹션 ===== */}
        <div className="max-w-7xl mx-auto pt-24 pb-16">
          <h2 className={`text-center ${hand} text-6xl md:text-7xl drop-shadow-md`}>학술국 소개</h2>
          <WaveUnderline />
        </div>

        {/* 학술국 - 모바일 레이아웃 */}
        <div className="md:hidden max-w-xl mx-auto space-y-12 pb-20">
          {ACADEMIC.map((item) => (
            <div key={item.key} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <span className={`${hand} text-4xl`}>{item.name}</span>
                <PillButton href={item.href} />
              </div>
              <GlassCard text={item.desc} className="!px-7 !py-8 text-[15px]" />
            </div>
          ))}
        </div>

        {/* 학술국 - 데스크탑 레이아웃 (지그재그 및 연결선) */}
        <div className="hidden md:block max-w-6xl mx-auto relative pb-40">
          {/* 중앙 연결선 SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1250">
            {/* 수직 중앙선 */}
            <line x1="500" y1="0" x2="500" y2="1250" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" />

            {/* 기획부 수평 연결선 */}
            <line x1="180" y1="210" x2="500" y2="210" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
            <circle cx="500" cy="210" r="4.5" fill="white" fillOpacity="0.9" />

            {/* 카피부 수평 연결선 */}
            <line x1="820" y1="585" x2="500" y2="585" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
            <circle cx="500" cy="585" r="4.5" fill="white" fillOpacity="0.9" />

            {/* 미디부 수평 연결선 */}
            <line x1="180" y1="960" x2="500" y2="960" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
            <circle cx="500" cy="960" r="4.5" fill="white" fillOpacity="0.9" />
          </svg>

          <div className="space-y-32">
            {/* 1. 기획부 (라벨 좌측 / 카드 우측) */}
            <div className="flex items-center gap-16 lg:gap-24">
              <div className="w-[220px] shrink-0">
                <AcademicLabel title="기획부" href={ACADEMIC[0].href} align="left" />
              </div>
              <div className="flex-1">
                <GlassCard text={ACADEMIC[0].desc} />
              </div>
            </div>

            {/* 2. 카피부 (라벨 우측 / 카드 좌측) */}
            <div className="flex flex-row-reverse items-center gap-16 lg:gap-24">
              <div className="w-[220px] shrink-0">
                <AcademicLabel title="카피부" href={ACADEMIC[1].href} align="right" />
              </div>
              <div className="flex-1">
                <GlassCard text={ACADEMIC[1].desc} />
              </div>
            </div>

            {/* 3. 미디부 (라벨 좌측 / 카드 우측) */}
            <div className="flex items-center gap-16 lg:gap-24">
              <div className="w-[220px] shrink-0">
                <AcademicLabel title="미디부" href={ACADEMIC[2].href} align="left" />
              </div>
              <div className="flex-1">
                <GlassCard text={ACADEMIC[2].desc} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== 운영팀 소개 섹션 (기존 유지) ===== */}
        <div className="relative z-10 max-w-7xl mx-auto pt-32 pb-32">
          <h2 className={`text-center ${hand} text-6xl md:text-7xl drop-shadow-sm`}>운영팀 소개</h2>
          <WaveUnderline />

          {/* 운영팀 - 데스크탑 */}
          <div className="relative mt-24 hidden md:block">
            <div className="relative min-h-[1000px]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1.5px] h-full bg-white/20" />

              {/* 대외협력팀 */}
              <div className="absolute left-0 top-12 w-[44%] text-right">
                <div className="flex items-center justify-end gap-4 mb-5">
                  <span className={`${hand} text-6xl`}>대외협력팀</span>
                  <IconHandshake />
                </div>
                <PillButton href={OPERATIONS[0].href} />
                <p className={`mt-8 text-white/85 leading-relaxed text-lg ${body}`}>{OPERATIONS[0].desc}</p>
              </div>
              <div className="absolute left-1/2 top-24 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg" />

              {/* 영상제작팀 */}
              <div className="absolute right-0 top-[380px] w-[44%] text-left">
                <div className="flex items-center gap-4 mb-5">
                  <span className={`${hand} text-6xl`}>영상제작팀</span>
                  <IconFilm />
                </div>
                <PillButton href={OPERATIONS[1].href} />
                <p className={`mt-8 text-white/85 leading-relaxed text-lg ${body}`}>{OPERATIONS[1].desc}</p>
              </div>
              <div className="absolute left-1/2 top-[410px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg" />

              {/* 콘텐츠팀 */}
              <div className="absolute left-0 top-[750px] w-[44%] text-right">
                <div className="flex items-center justify-end gap-4 mb-5">
                  <span className={`${hand} text-6xl`}>콘텐츠팀</span>
                  <IconFolder />
                </div>
                <PillButton href={OPERATIONS[2].href} />
                <p className={`mt-8 text-white/85 leading-relaxed text-lg ${body}`}>{OPERATIONS[2].desc}</p>
              </div>
              <div className="absolute left-1/2 top-[800px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg" />
            </div>
          </div>

          {/* 운영팀 - 모바일 */}
          <div className="md:hidden mt-16 space-y-16">
            {OPERATIONS.map((t) => (
              <div key={t.key} className="relative bg-white/5 rounded-3xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <span className={`${hand} text-4xl`}>{t.name}</span>
                  <PillButton href={t.href} />
                </div>
                <p className={`text-white/80 text-[15px] leading-relaxed ${body}`}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
