import { useState } from "react";

type ColorItem = { name: string; hex: string };
type LogoItem = { label: string; src: string; filename: string };
type CharacterItem = { dept: string; name: string; src: string; filename: string };

const COLORS: ColorItem[] = [
  { name: "Black", hex: "#0B0B0B" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Purple", hex: "#813EB6" },
];

const LOGOS: LogoItem[] = [
  { label: "Typography", src: "/brand/Typography.png", filename: "Typography.png" },
  { label: "Symbol", src: "/brand/Symbol.png", filename: "Symbol.png" },
];

const CHARACTERS: CharacterItem[] = [
  { dept: "기획부", name: "플리", src: "/brand/기획부_플리.png", filename: "기획부_플리.png" },
  { dept: "카피부", name: "키피", src: "/brand/카피부_키피.png", filename: "카피부_키피.png" },
  { dept: "미디부", name: "미니", src: "/brand/미디부_미니.png", filename: "미디부_미니.png" },
];

const ZIP_LOGOS = { href: "/brand/Adpia_Logos.zip", filename: "Adpia_Logos.zip" };
const ZIP_CHARACTERS = { href: "/brand/Adpia_Characters.zip", filename: "Adpia_Characters.zip" };

async function downloadAs(url: string, filename: string) {
  // public 정적 파일도 filename 고정하려면 blob 방식이 가장 안전
  const res = await fetch(url);
  if (!res.ok) throw new Error(`다운로드 실패 (${res.status})`);

  const blob = await res.blob();
  const a = document.createElement("a");
  const blobUrl = URL.createObjectURL(blob);

  a.href = blobUrl;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export default function BrandPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // http/권한 문제 fallback
      const ta = document.createElement("textarea");
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(hex);
    window.setTimeout(() => setCopied((p) => (p === hex ? null : p)), 900);
  };

  const card =
    "rounded-[2.5rem] bg-white/70 backdrop-blur border border-black/10 shadow-[0_18px_45px_rgba(0,0,0,0.07)]";
  const sectionLabel = "text-sm font-paperlogy tracking-wide text-black/60";

  return (
    <div className="min-h-screen bg-[#faf8ff] pt-24 md:pt-28">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-paperlogy font-semibold text-black">애드피아 CI</h1>

          <div className="mt-8">
            <div className={sectionLabel}>Solgan</div>
            <div className="mt-2 text-2xl md:text-3xl font-paperlogy font-semibold text-black">
              여럿이 하나 | All for One, One for All
            </div>

            <div className="mt-4 space-y-2 text-black/60 text-sm md:text-base leading-relaxed max-w-3xl">
              <p>
                광고에 대한 열정을 가진 대학생들이 모여 함께 꿈꾸는 이상세계를 현실로 만들어 나가겠다는 의지를 담은
                슬로건입니다.
              </p>
              <p>
                서로 다른 ‘여럿’이 광고라는 하나의 목표 아래 모여 ‘하나’의 공동체를 이룬다는 의미를 담고 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Color */}
        <section className="mb-14 md:mb-16">
          <div className={sectionLabel}>Color</div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => copyHex(c.hex)}
                className={`${card} p-5 text-left hover:shadow-[0_22px_55px_rgba(0,0,0,0.10)] transition-shadow`}
              >
                <div className="h-12 rounded-xl border border-black/10" style={{ backgroundColor: c.hex }} />
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-paperlogy font-medium text-black">{c.name}</div>
                    <div className="text-xs text-black/60">{c.hex}</div>
                  </div>
                  <div className="text-xs text-black/60">{copied === c.hex ? "Copied" : "Copy"}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Logotype */}
        <section className="mb-14 md:mb-16">
          <div className={sectionLabel}>Logotype</div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOGOS.map((a) => (
              <div key={a.label} className={`${card} p-7 md:p-10`}>
                <div className="text-xs text-black/60">{a.label}</div>

                <div className="mt-6 flex items-center justify-center min-h-[140px]">
                  <img src={a.src} alt={a.label} className="max-h-28 md:max-h-32 object-contain" />
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => downloadAs(a.src, a.filename)}
                    className="px-7 py-3 rounded-full bg-black/5 hover:bg-black/10 transition font-paperlogy text-sm"
                  >
                    Download ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ 로고 전체 ZIP */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => downloadAs(ZIP_LOGOS.href, ZIP_LOGOS.filename)}
              className="px-10 py-3 rounded-full bg-[#813EB6] text-white hover:opacity-90 transition font-paperlogy text-sm shadow-[0_18px_45px_rgba(129,62,182,0.25)]"
            >
              Adpia_Logos Download ↓
            </button>
          </div>
        </section>

        {/* Character */}
        <section className="pb-10 md:pb-14">
          <div className={sectionLabel}>Character</div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CHARACTERS.map((ch) => (
              <div key={ch.name} className={`${card} p-7 text-center`}>
                <div className="text-sm font-paperlogy font-semibold text-black">{ch.dept}</div>

                <div className="mt-5 flex items-center justify-center">
                  <img src={ch.src} alt={ch.name} className="h-36 md:h-40 object-contain" />
                </div>

                <div className="mt-4 text-sm font-paperlogy text-black/70">{ch.name}</div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => downloadAs(ch.src, ch.filename)}
                    className="px-7 py-3 rounded-full bg-black/5 hover:bg-black/10 transition font-paperlogy text-sm"
                  >
                    Download ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ 캐릭터 전체 ZIP */}
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => downloadAs(ZIP_CHARACTERS.href, ZIP_CHARACTERS.filename)}
              className="px-10 py-3 rounded-full bg-[#813EB6] text-white hover:opacity-90 transition font-paperlogy text-sm shadow-[0_18px_45px_rgba(129,62,182,0.25)]"
            >
              Adpia_Characters Download ↓
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}