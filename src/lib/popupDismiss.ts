const KEY_PREFIX = "adpia.popup.dismiss.today.";

export function buildDismissKey(popupId: number) {
  return `${KEY_PREFIX}${popupId}`;
}

export function isDismissedToday(popupId: number) {
  try {
    return localStorage.getItem(buildDismissKey(popupId)) === todayKey();
  } catch {
    return false;
  }
}

export function dismissToday(popupId: number) {
  try {
    localStorage.setItem(buildDismissKey(popupId), todayKey());
  } catch {
    // ignore
  }
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
