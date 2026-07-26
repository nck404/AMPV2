import { get } from "svelte/store";
import { accessSettings } from "./stores/access.js";

let voices = [];
let selectedVoiceName = null;

export function initVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const load = () => {
    voices = window.speechSynthesis.getVoices();
    const vi = voices.find(
      (v) =>
        v.lang.includes("vi") ||
        v.name.toLowerCase().includes("vietnam"),
    );
    selectedVoiceName = vi ? vi.name : voices[0]?.name || null;
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

export function speak(text, { force = false } = {}) {
  if (!text) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!force && !get(accessSettings).speechFeedback) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = voices.find((v) => v.name === selectedVoiceName);
  if (voice) utter.voice = voice;
  utter.lang = "vi-VN";
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
