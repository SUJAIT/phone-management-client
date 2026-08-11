import Swal from "sweetalert2";

function isDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

const baseSwal = () =>
  Swal.mixin({
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#f1f5f9" : "#0f172a",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
    customClass: { popup: "rounded-2xl" },
  });

export async function confirmAction(opts: {
  title: string;
  text?: string;
  confirmText?: string;
  danger?: boolean;
}) {
  const res = await baseSwal().fire({
    title: opts.title,
    text: opts.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: opts.confirmText || "Yes, continue",
    cancelButtonText: "Cancel",
    confirmButtonColor: opts.danger ? "#dc2626" : "#2563eb",
  });
  return res.isConfirmed;
}

export function successToast(title: string) {
  baseSwal().fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}

export function errorToast(title: string) {
  baseSwal().fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

export function errorAlert(title: string, text?: string) {
  baseSwal().fire({ icon: "error", title, text });
}
