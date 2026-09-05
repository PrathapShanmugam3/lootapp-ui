import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/**
 * Auto-dismissing corner toast, replacing the old pattern of a `message`
 * state + an inline banner rendered in JSX that never got cleared on its
 * own (it only reset right before the next submit, so it stayed on screen
 * indefinitely after any single success/error).
 */
export function showToast(type, text) {
  Toast.fire({ icon: type === "error" ? "error" : "success", title: text });
}

export function showSuccess(text) {
  showToast("success", text);
}

export function showError(text) {
  showToast("error", text);
}
