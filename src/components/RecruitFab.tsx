type Props = {
  label: string;
  onClick?: () => void;
};

export default function RecruitFab({ label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "fixed right-5 bottom-6 md:right-8 md:bottom-8 z-50",
        "rounded-full px-5 py-4 shadow-lg",
        "bg-[#813eb6] text-white font-black",
        "hover:brightness-110 active:brightness-95 transition-all",
        "flex items-center gap-2",
      ].join(" ")}
      aria-label={label}
    >
      <span className="text-lg leading-none">＋</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
