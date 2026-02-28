import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import HistoryTimeline from "../components/HistoryTimeline";
import HistoryUpsertModal from "../components/HistoryUpsertModal";
import { createHistory, getHistories, type HistoryItem, updateHistory } from "../api/historyApi";
import { currentDecade, decadeLabel } from "../lib/historyUtils";

function isAdmin(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN";
}

export default function AdminHistoryPage() {
  const { user, loading: authLoading } = useAuth();

  const [decade, setDecade] = useState<number>(currentDecade());
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<HistoryItem | null>(null);

  const canEdit = isAdmin(user?.role);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getHistories(decade);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [decade]);

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: HistoryItem) => {
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
    await fetchList();
  };

  const pageLoading = loading || authLoading;

  return (
    <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
            Admin
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">연혁 관리</h1>
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <select
          value={decade}
          onChange={(e) => setDecade(Number(e.target.value))}
          className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700 w-full md:w-[220px]"
        >
          <option value={1990}>{decadeLabel(1990)}</option>
          <option value={2000}>{decadeLabel(2000)}</option>
          <option value={2010}>{decadeLabel(2010)}</option>
          <option value={2020}>{decadeLabel(2020)}</option>
          <option value={2030}>{decadeLabel(2030)}</option>
        </select>

        <button
          onClick={openCreate}
          disabled={!canEdit}
          className="px-5 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black hover:opacity-90 disabled:opacity-50"
        >
          + 연혁 추가
        </button>
      </div>

      <div className="mt-10">
        {pageLoading ? (
          <div className="space-y-3">
            <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
            <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
            <div className="h-28 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
          </div>
        ) : (
          <HistoryTimeline items={items} isAdmin={canEdit} onEdit={openEdit} />
        )}
      </div>

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