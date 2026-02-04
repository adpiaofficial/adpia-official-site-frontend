import { useEffect, useState } from "react";
import { getActivePopup, type PopupResponse } from "../api/popupApi";
import { isDismissedToday } from "../lib/popupDismiss";
import HomePopupModal from "./HomePopupModal";

export default function PopupHost() {
  const [popup, setPopup] = useState<PopupResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await getActivePopup();
        if (!alive) return;
        if (!p) return;

        if (isDismissedToday(p.id)) return;

        setPopup(p);
        setOpen(true);
      } catch {
        // ignore (메인 페이지는 살아야 함)
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!popup || !open) return null;

  return (
    <HomePopupModal
      popup={popup}
      onClose={() => {
        setOpen(false);
      }}
    />
  );
}
