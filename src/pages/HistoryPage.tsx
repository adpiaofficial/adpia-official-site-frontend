import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HistoryTimeline from "../components/HistoryTimeline";
import HistoryUpsertModal from "../components/HistoryUpsertModal";
import {
  createHistory,
  getHistories,
  getHistoryDecades,
  type HistoryItem,
  updateHistory,
} from "../api/historyApi";
import { decadeLabel } from "../lib/historyUtils";
import { useAuth } from "../contexts/AuthContext";

function isAdmin(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const canEdit = isAdmin(user?.role);

  const [decades, setDecades] = useState<number[]>([]);
  const [decade, setDecade] = useState<number | null>(null);

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<HistoryItem | null>(null);

  const pageLoading = loading || authLoading;

  const sortedDecades = useMemo(() => [...decades].sort((a, b) => b - a), [decades]);

  useEffect(() => {
    (async () => {
      try {
        const ds = await getHistoryDecades();
        setDecades(ds);

        const latest = [...ds].sort((a, b) => b - a)[0] ?? null;
        setDecade((prev) => prev ?? latest); 
      } catch (e) {
        console.warn("history decades 로딩 실패", e);
        setDecades([]);
        setDecade(null);
      }
    })();
  }, []);

  const fetchList = async (d: number) => {
    setLoading(true);
    try {
      const data = await getHistories(d);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decade == null) return;
    fetchList(decade);
  }, [decade]);

  const openCreate = () => {
    if (!canEdit) return alert("권한이 없습니다.");
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: HistoryItem) => {
    if (!canEdit) return;
    setMode("edit");
    setEditing(item);
    setModalOpen(true);
  };

  const submit = async (req: { year: number; month: number; content: string; sortOrder: number }) => {
    if (!canEdit) {
      alert("권한이 없습니다.");
      return;
    }
    if (mode === "create") {
      await createHistory(req);
    } else if (editing) {
      await updateHistory(editing.id, req);
    }

    const ds = await getHistoryDecades();
    setDecades(ds);

    if (decade != null) {
      await fetchList(decade);
    }
  };

  return (
    <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="text-center mb-16">
        <p className="tracking-[0.3em] text-[#813eb6] text-sm font-black">HISTORY</p>
        <h1 className="text-3xl md:text-5xl font-black mt-4 text-gray-900">애드피아 연혁</h1>
        <p className="text-gray-400 font-bold mt-3">Since 1992</p>
        <div className="w-16 h-[2px] bg-[#813eb6] mx-auto mt-6" />

        {canEdit && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={openCreate}
              className="px-5 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black hover:opacity-90"
            >
              + 연혁 추가
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-16">
        <select
          value={decade ?? ""}
          onChange={(e) => setDecade(Number(e.target.value))}
          className="px-6 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
          disabled={sortedDecades.length === 0}
        >
          {sortedDecades.length === 0 ? (
            <option value="">연혁 없음</option>
          ) : (
            sortedDecades.map((d) => (
              <option key={d} value={d}>
                {decadeLabel(d)}
              </option>
            ))
          )}
        </select>
      </div>

      {sortedDecades.length === 0 ? (
        <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-6">
          연혁이 없습니다.
        </div>
      ) : pageLoading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
          <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
          <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
        </div>
      ) : (
        <HistoryTimeline items={items} isAdmin={canEdit} onEdit={openEdit} />
      )}

      <HistoryUpsertModal
        open={modalOpen}
        mode={mode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}