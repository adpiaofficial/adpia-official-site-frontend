import type { HistoryItem } from "../api/historyApi";
import { groupByYear } from "../lib/historyUtils";

type Props = {
  items: HistoryItem[];
  isAdmin?: boolean;
  onEdit?: (item: HistoryItem) => void;
};

export default function HistoryTimeline({ items, isAdmin, onEdit }: Props) {
  const { years, map } = groupByYear(items);

  if (years.length === 0) {
    return (
      <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-6 font-paperlogy">
        연혁이 없습니다.
      </div>
    );
  }

  return (
    <div className="relative font-paperlogy">
      <div className="space-y-24 md:space-y-28">
        {years.map((year) => {
          const list = map.get(year) ?? [];

          return (
            <section key={year} className="relative">
              {/* Year Header */}
              <div className="relative text-center mb-12 md:mb-14 z-20">
                <div className="inline-block bg-white px-10 py-2 rounded-full border border-gray-100 shadow-sm">
                  <div className="text-[56px] md:text-[110px] font-black leading-none text-[#813eb6]">
                    {year}
                  </div>
                </div>
              </div>

              {/* Left timeline + Right cards */}
              <div className="relative pl-10 md:pl-14">
                {/* Left vertical line */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-[2px] bg-gray-200" />

                <div className="space-y-10 md:space-y-14">
                  {list.map((item) => (
                    <div key={item.id} className="relative">
                      {/* Dot */}
                      <div className="absolute left-4 md:left-6 top-7 -translate-x-1/2 w-4 h-4 rounded-full bg-[#813eb6] z-10" />

                      {/* Connector (dot -> card) */}
                      <div className="absolute left-4 md:left-6 top-8 w-8 md:w-10 h-[2px] bg-gray-200" />

                      {/* Card */}
                      <div
                        className={[
                          "ml-8 md:ml-10", // space after connector
                          "bg-white border border-gray-100 shadow-sm",
                          "rounded-2xl p-5 md:p-6",
                          "relative z-10",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-[#813eb6] font-black text-sm md:text-base">
                              {item.month}월
                            </div>

                            {/* ✅ 한 줄 입력이면 한 줄 유지 (줄바꿈 X) + hover/title로 전체 보기 */}
                            <div
                              title={item.content}
                              className="mt-2 text-gray-800 text-sm md:text-[15px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                              {item.content}
                            </div>
                          </div>

                          {isAdmin && onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200"
                            >
                              수정
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}