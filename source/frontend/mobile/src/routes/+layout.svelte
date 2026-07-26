<script>
  import "./layout.css";
  import { onMount } from "svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ToastContainer from "$lib/components/ToastContainer.svelte";
  import SOSButton from "$lib/components/SOSButton.svelte";
  import { accessSettings, applyAccessSettings } from "$lib/stores/access.js";
  import { initVoices } from "$lib/speech.js";

  let { children } = $props();

  onMount(() => {
    initVoices();
    applyAccessSettings($accessSettings);
  });
</script>

<div class="min-h-screen bg-[#faf4ed] text-[#575279] selection:bg-[#907aa9]/20 font-sans pb-24">
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:bg-iris focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
  >
    Bỏ qua đến nội dung chính
  </a>
  <main id="main-content" class="max-w-md mx-auto px-4 pt-6">
    {@render children()}
  </main>
  <ToastContainer />
  <SOSButton />
  <BottomNav />
</div>
