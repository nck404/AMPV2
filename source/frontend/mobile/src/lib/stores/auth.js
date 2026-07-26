import { writable } from "svelte/store";

function loadUser() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const currentUser = writable(loadUser());

export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  currentUser.set(user);
}

export function updateUser(patch) {
  currentUser.update((u) => {
    const next = { ...u, ...patch };
    localStorage.setItem("user", JSON.stringify(next));
    return next;
  });
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  currentUser.set(null);
}

export function isLoggedIn() {
  return typeof localStorage !== "undefined" && !!localStorage.getItem("token");
}
