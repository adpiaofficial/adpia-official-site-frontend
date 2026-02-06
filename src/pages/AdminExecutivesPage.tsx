// src/pages/AdminExecutivesPage.tsx
import { useEffect, useState } from "react";
import mainLogo from "../assets/logo.png";
import ImagePickerUploader from "../components/ImagePickerUploader";
import {
  getExecutivesAdmin,
  upsertExecutives,
  deleteExecutive,
  type AdminExecutiveMemberRequest,
} from "../api/executiveApi";

const FIXED_GROUP_TITLE = "애드피아 임원진";

// ImagePickerUploader가 boardCode/postId 요구하면 더미로 고정
const UPLOAD_BOARD_CODE = "EXECUTIVE" as any;
const UPLOAD_POST_ID = 1;

function normalizeMember(m: any, idx: number): AdminExecutiveMemberRequest {
  return {
    id: m.id,
    role: m.role ?? "",
    generation: m.generation ?? "",
    department: m.department ?? "",
    name: m.name ?? "",
    imageUrl: m.imageUrl ?? null,
    orderIndex: Number.isFinite(m.orderIndex) ? m.orderIndex : idx,
    active: m.active ?? true,
  };
}

export default function AdminExecutivesPage() {
  const [members, setMembers] = useState<AdminExecutiveMemberRequest[]>([]);
  const [saving, setSaving] = useState(false);

  const patch = (idx: number, patchObj: Partial<AdminExecutiveMemberRequest>) => {
    setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patchObj } : x)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setMembers((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((m, i) => ({ ...m, orderIndex: i }));
    });
  };

  const addRow = () => {
    setMembers((prev) => [
      ...prev,
      {
        role: "",
        generation: "",
        department: "",
        name: "",
        imageUrl: null,
        orderIndex: prev.length,
        active: true,
      },
    ]);
  };

  const reload = async () => {
    const groups = await getExecutivesAdmin(); // List<ExecutiveGroupResponse>
    const g = groups.find((x) => x.title === FIXED_GROUP_TITLE) ?? groups[0];
    const list = (g?.members ?? [])
      .map(normalizeMember)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    setMembers(list);
  };

  const removeOne = async (idx: number) => {
    const target = members[idx];
    if (!target) return;

    // 신규 row
    if (!target.id) {
      setMembers((prev) => prev.filter((_, i) => i !== idx).map((m, i) => ({ ...m, orderIndex: i })));
      return;
    }

    if (!confirm("삭제할까요?")) return;

    try {
      await deleteExecutive(target.id);
      await reload();
    } catch (e) {
      console.error(e);
      alert("삭제 실패(콘솔 확인)");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await upsertExecutives({
        groupTitle: FIXED_GROUP_TITLE,
        members: members.map((m, i) => ({
          ...m,
          orderIndex: i,
          role: (m.role ?? "").trim(),
          generation: (m.generation ?? "").trim(),
          department: (m.department ?? "").trim(),
          name: (m.name ?? "").trim(),
          imageUrl: m.imageUrl ? String(m.imageUrl).trim() : null,
          active: m.active ?? true,
        })),
      });

      await reload();
      alert("저장 완료!");
    } catch (e) {
      console.error(e);
      alert("저장 실패(콘솔 확인)");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } catch (e) {
        console.error(e);
        alert("임원진 데이터를 불러오지 못했습니다.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 px-6 pt-32 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">임원진 관리</h1>
            <p className="text-gray-500 mt-2 font-medium">
              이미지를 선택하면 S3 업로드 후 URL이 저장됩니다.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addRow}
              className="px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 font-bold shadow-sm active:scale-95"
            >
              + 멤버 추가
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-[#813eb6] text-white hover:brightness-110 disabled:opacity-60 font-bold shadow-lg shadow-purple-200 active:scale-95"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {members.map((m, idx) => (
            <div
              key={`${m.id ?? "new"}-${idx}`}
              className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                <div className="shrink-0">
                  <ImagePickerUploader
                    boardCode={UPLOAD_BOARD_CODE}
                    postId={UPLOAD_POST_ID}
                    value={m.imageUrl ?? null}
                    fallbackImg={mainLogo}
                    onChange={(url) => patch(idx, { imageUrl: url })}
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      placeholder="직책(회장/부장)"
                      value={m.role}
                      onChange={(e) => patch(idx, { role: e.target.value })}
                    />
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      placeholder="기수(68기)"
                      value={m.generation}
                      onChange={(e) => patch(idx, { generation: e.target.value })}
                    />
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      placeholder="부서(기획부)"
                      value={m.department}
                      onChange={(e) => patch(idx, { department: e.target.value })}
                    />
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      placeholder="이름"
                      value={m.name}
                      onChange={(e) => patch(idx, { name: e.target.value })}
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.active ?? true}
                        onChange={(e) => patch(idx, { active: e.target.checked })}
                        className="w-5 h-5 rounded-md border-gray-300 text-[#813eb6] focus:ring-[#813eb6]"
                      />
                      <span className="font-bold text-sm text-gray-600">페이지에 노출</span>
                    </label>
                    <span className="text-[10px] font-black text-gray-300">INDEX: {idx}</span>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                  <div className="flex gap-2 flex-1 lg:flex-none">
                    <button
                      onClick={() => move(idx, -1)}
                      className="flex-1 lg:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-black"
                      title="위로"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      className="flex-1 lg:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-black"
                      title="아래로"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => void removeOne(idx)}
                    className="flex-1 lg:px-4 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="rounded-[2.5rem] border-4 border-dashed border-gray-100 py-20 text-center">
              <div className="text-gray-300 font-black text-2xl mb-2">텅 비어있어요</div>
              <p className="text-gray-400 font-bold">+ 멤버 추가로 등록하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
