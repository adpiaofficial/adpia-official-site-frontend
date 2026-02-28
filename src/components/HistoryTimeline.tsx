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
      <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-6">
        연혁이 없습니다.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-200 z-0" />

      <div className="space-y-28">
        {years.map((year) => {
          const list = map.get(year)!;

          return (
            <section key={year} className="relative">
              <div className="relative text-center mb-14 z-20">
                <div className="inline-block bg-white px-10 py-2 rounded-full">
                  <div className="text-[64px] md:text-[110px] font-black leading-none text-[#813eb6]">
                    {year}
                  </div>
                </div>
              </div>

              <div className="space-y-10 md:space-y-14">
                {list.map((item, idx) => {
                  const isLeft = idx % 2 === 0;

                  return (
                    <div key={item.id} className="relative">
                      {/* ✅ 중앙 점도 선 위로 */}
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-7 w-4 h-4 rounded-full bg-[#813eb6] z-10" />

                      <div
                        className={[
                          "flex",
                          "md:items-start",
                          "items-stretch",
                          "md:min-h-[1px]",
                          isLeft ? "md:justify-start" : "md:justify-end",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "w-full md:w-[44%]",
                            "bg-white border border-gray-100 shadow-sm",
                            "rounded-2xl p-5 md:p-6",
                            "relative z-10", // ✅ 카드도 선 위
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[#813eb6] font-black text-sm md:text-base">
                                {item.month}월
                              </div>
                              <div className="mt-2 text-gray-800 text-sm md:text-[15px] leading-relaxed font-semibold">
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

                          {/* 카드에서 중앙선으로 연결되는 짧은 선 */}
                          <div
                            className={[
                              "hidden md:block",
                              "absolute top-6",
                              isLeft ? "-right-3" : "-left-3",
                              "w-6 h-[2px] bg-gray-200",
                            ].join(" ")}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}