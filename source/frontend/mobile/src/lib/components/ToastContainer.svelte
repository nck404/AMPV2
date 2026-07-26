<script>
  import { toasts, dismissToast } from "$lib/stores/toast.js";
  import { fly, fade } from "svelte/transition";

  const colors = {
    info: "bg-[#907aa9] text-white",
    success: "bg-[#286983] text-white",
    error: "bg-[#b4637a] text-white",
  };
</script>

<div
  class="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-sm space-y-2"
  aria-live="polite"
  role="status"
>
  {#each $toasts as t (t.id)}
    <div
      in:fly={{ y: -20 }}
      out:fade
      class="px-5 py-3.5 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 {colors[t.type] || colors.info}"
    >
      <i
        class="bx {t.type === 'success'
          ? 'bx-check-circle'
          : t.type === 'error'
            ? 'bx-error-circle'
            : 'bx-info-circle'} text-xl flex-shrink-0"
      ></i>
      <span class="flex-1">{t.message}</span>
      <button
        onclick={() => dismissToast(t.id)}
        class="text-lg opacity-80 hover:opacity-100"
        aria-label="Đóng thông báo"
      >
        <i class="bx bx-x"></i>
      </button>
    </div>
  {/each}
</div>
