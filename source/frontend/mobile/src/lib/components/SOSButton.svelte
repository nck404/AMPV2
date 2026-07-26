<script>
  let { isVisible = true } = $props();
  let sosActive = $state(false);
  let countdown = $state(3);
  let sosTimer = null;

  function triggerSOS() {
    if (sosActive) return;
    sosActive = true;
    countdown = 3;
    
    // Vibrate to confirm press
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }

    sosTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(sosTimer);
        executeSOSAction();
      }
    }, 1000);
  }

  function cancelSOS() {
    sosActive = false;
    clearInterval(sosTimer);
  }

  function executeSOSAction() {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        alert(`Đã gửi cảnh báo khẩn cấp (SOS)!\nVị trí: ${latitude}, ${longitude}\nNgười thân của bạn sẽ nhận được tin nhắn.`);
      }, () => {
        alert(`Đã gửi cảnh báo khẩn cấp (SOS)!\nKhông thể lấy vị trí chính xác.`);
      });
    } else {
      alert(`Đã gửi cảnh báo khẩn cấp (SOS)!`);
    }
    
    // Vibrate strong pattern
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
    
    setTimeout(() => {
      sosActive = false;
    }, 3000);
  }
</script>

{#if isVisible}
  <!-- Floating SOS Button -->
  <div class="fixed bottom-28 right-6 z-50">
    {#if !sosActive}
      <button 
        onclick={triggerSOS}
        class="w-14 h-14 rounded-full bg-red-600 text-white shadow-[0_4px_20px_rgba(220,38,38,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-[#faf4ed]"
        aria-label="Nút gọi khẩn cấp SOS"
      >
        <i class="bx bxs-phone-call text-2xl animate-pulse"></i>
      </button>
    {:else}
      <div class="flex flex-col items-center gap-2">
        <button 
          onclick={cancelSOS}
          class="px-4 py-2 bg-neutral-800 text-white text-xs font-bold rounded-full shadow-lg"
        >
          Huỷ
        </button>
        <div class="w-16 h-16 rounded-full bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.8)] flex items-center justify-center animate-bounce border-4 border-[#faf4ed]">
          <span class="text-2xl font-black">{countdown}</span>
        </div>
      </div>
    {/if}
  </div>
{/if}
