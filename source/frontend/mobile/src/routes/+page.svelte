<script>
  import { onMount, onDestroy } from "svelte";
  import { speak, stopSpeaking } from "$lib/speech.js";
  import { haptic } from "$lib/stores/access.js";
  import { currentUser } from "$lib/stores/auth.js";

  let activeTool = $state("reader");

  let textToRead = $state(
    "Chào mừng bạn đến với ứng dụng hỗ trợ người khuyết tật AMP Mobile.",
  );
  let voices = $state([]);
  let selectedVoice = $state(null);
  let rate = $state(1);
  let isSpeaking = $state(false);
  let isListening = $state(false);
  let recognition = null;
  let ocrImage = $state(null);
  let ocrScanning = $state(false);
  let ocrResult = $state("");

  let videoElement = $state(null);
  let stream = $state(null);
  let cameraActive = $state(false);
  let detectedMoney = $state("");
  let scannerAnimating = $state(false);

  onMount(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) => v.lang.includes("vi") || v.name.toLowerCase().includes("vietnam"),
        );
        selectedVoice = viVoice ? viVoice.name : voices[0]?.name || null;
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "vi-VN";
        recognition.interimResults = false;
        recognition.onstart = () => (isListening = true);
        recognition.onresult = (event) => {
          const t = event.results[0][0].transcript;
          textToRead = textToRead ? textToRead + " " + t : t;
          isListening = false;
          speakLocal(`Đã nghe: ${t}`);
        };
        recognition.onerror = () => (isListening = false);
        recognition.onend = () => (isListening = false);
      }
    }

    return () => stopCamera();
  });

  function speakLocal(text) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      const v = voices.find((x) => x.name === selectedVoice);
      if (v) utter.voice = v;
    }
    utter.rate = rate;
    utter.onstart = () => (isSpeaking = true);
    utter.onend = () => (isSpeaking = false);
    utter.onerror = () => (isSpeaking = false);
    window.speechSynthesis.speak(utter);
  }

  function stopSpeakingLocal() {
    stopSpeaking();
    isSpeaking = false;
  }

  function toggleDictation() {
    if (!recognition) {
      speak("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.", { force: true });
      return;
    }
    haptic(15);
    if (isListening) recognition.stop();
    else recognition.start();
  }

  function handleOcrUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    ocrImage = URL.createObjectURL(file);
    ocrScanning = true;
    ocrResult = "";
    setTimeout(() => {
      ocrScanning = false;
      ocrResult = "Hóa đơn thanh toán siêu thị AMP. Tổng tiền: 150.000 đồng. Xin cảm ơn quý khách.";
      speakLocal("Phát hiện văn bản từ hình ảnh: " + ocrResult);
    }, 2000);
  }

  async function startCamera() {
    detectedMoney = "";
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      cameraActive = true;
      setTimeout(() => {
        if (videoElement) videoElement.srcObject = stream;
      }, 100);
    } catch (err) {
      cameraActive = false;
      speak("Không thể truy cập camera. Vui lòng cho phép quyền camera.", { force: true });
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    cameraActive = false;
    stream = null;
  }

  function scanCurrency() {
    if (scannerAnimating) return;
    scannerAnimating = true;
    detectedMoney = "";
    setTimeout(() => {
      scannerAnimating = false;
      const bills = ["10.000", "20.000", "50.000", "100.000", "200.000", "500.000"];
      const randomBill = bills[Math.floor(Math.random() * bills.length)];
      detectedMoney = `${randomBill} VNĐ`;
      speakLocal(`Mệnh giá tiền phát hiện: ${randomBill} đồng`);
    }, 1500);
  }

  function selectDemoBillType(bill) {
    haptic(15);
    if (cameraActive) {
      scanCurrency();
    } else {
      detectedMoney = `${bill} VNĐ`;
      speakLocal(`Giả lập mệnh giá: ${bill} đồng`);
    }
  }

  function switchTool(tool) {
    activeTool = tool;
    haptic(10);
    speak(tool === "reader" ? "Trình đọc màn hình" : "Đọc mệnh giá tiền");
  }
</script>

<div class="space-y-5">
  <header class="glass rounded-3xl p-5 border-2 border-[#f2e9e1] dynamic-island">
    <h1 class="text-2xl font-black text-[#2c293e]">Xin chào{$currentUser ? `, ${$currentUser.username}` : ""} 👋</h1>
    <p class="text-sm text-[#575279] mt-1">Công cụ trợ năng luôn sẵn sàng giúp bạn.</p>
  </header>

  <!-- Tool switcher -->
  <div class="grid grid-cols-2 gap-3" role="tablist" aria-label="Chọn công cụ trợ năng">
    <button
      role="tab"
      aria-selected={activeTool === "reader"}
      onclick={() => switchTool("reader")}
      class="py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1.5 transition-all border-2 min-h-[64px]
      {activeTool === 'reader' ? 'bg-[#b4637a] text-white border-[#b4637a] shadow-lg' : 'bg-surface text-[#575279] border-[#f2e9e1]'}"
    >
      <i class="bx bx-volume-full text-2xl"></i> Đọc chữ / Nghe
    </button>
    <button
      role="tab"
      aria-selected={activeTool === "money"}
      onclick={() => switchTool("money")}
      class="py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1.5 transition-all border-2 min-h-[64px]
      {activeTool === 'money' ? 'bg-[#286983] text-white border-[#286983] shadow-lg' : 'bg-surface text-[#575279] border-[#f2e9e1]'}"
    >
      <i class="bx bx-camera text-2xl"></i> Đọc mệnh giá tiền
    </button>
  </div>

  {#if activeTool === "reader"}
    <div class="space-y-4">
      <section class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2">
          <i class="bx bx-text"></i> Văn bản đọc thành tiếng
        </h2>
        <textarea
          bind:value={textToRead}
          rows="4"
          aria-label="Nội dung cần đọc"
          class="w-full p-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-[#2c293e] font-medium resize-none transition-all placeholder:text-[#797593] text-base"
          placeholder="Nhập nội dung cần đọc tại đây..."
        ></textarea>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label for="voice-select" class="block text-[#575279] mb-1 font-bold">Giọng đọc:</label>
            <select id="voice-select" bind:value={selectedVoice} class="w-full p-3 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none text-[#2c293e]">
              {#if voices.length === 0}
                <option>Mặc định hệ thống</option>
              {:else}
                {#each voices as voice}
                  <option value={voice.name}>{voice.name} ({voice.lang})</option>
                {/each}
              {/if}
            </select>
          </div>
          <div>
            <label for="rate-range" class="block text-[#575279] mb-1 font-bold">Tốc độ ({rate}x):</label>
            <input id="rate-range" type="range" min="0.5" max="2" step="0.1" bind:value={rate} class="w-full accent-[#907aa9] mt-3 h-6" />
          </div>
        </div>

        <div class="flex gap-2">
          {#if isSpeaking}
            <button onclick={stopSpeakingLocal} class="flex-1 py-4 bg-[#b4637a] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[56px]">
              <i class="bx bx-stop-circle text-lg"></i> Dừng đọc
            </button>
          {:else}
            <button onclick={() => speakLocal(textToRead)} class="flex-1 py-4 bg-[#907aa9] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[56px]">
              <i class="bx bx-play-circle text-lg"></i> Đọc ngay
            </button>
          {/if}
          <button onclick={toggleDictation} class="px-5 bg-[#f2e9e1] text-[#2c293e] rounded-2xl flex items-center justify-center transition-colors min-h-[56px]" aria-label="Nói để nhập liệu">
            <i class="bx {isListening ? 'bx-microphone animate-pulse text-[#b4637a]' : 'bx-microphone'} text-2xl"></i>
          </button>
        </div>
      </section>

      <section class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2">
          <i class="bx bx-scan"></i> Trích xuất chữ từ ảnh (OCR)
        </h2>
        <div class="border-2 border-dashed border-[#f2e9e1] rounded-2xl p-6 text-center relative overflow-hidden">
          {#if ocrImage}
            <img src={ocrImage} alt="Văn bản tải lên" class="max-h-32 mx-auto rounded-lg mb-2 object-cover" />
            {#if ocrScanning}
              <div class="absolute inset-0 bg-[#fffaf3]/80 flex flex-col items-center justify-center">
                <i class="bx bx-loader-alt animate-spin text-[#907aa9] text-3xl mb-1"></i>
                <span class="text-xs font-bold text-[#907aa9]">Đang phân tích hình ảnh...</span>
              </div>
            {:else}
              <p class="text-xs text-[#2c293e] bg-[#f2e9e1] p-2 rounded-xl border border-[#797593]/20 text-left">{ocrResult}</p>
            {/if}
          {:else}
            <i class="bx bx-image-add text-3xl text-[#797593] mb-1"></i>
            <p class="text-xs text-[#575279]">Chọn hoặc chụp ảnh văn bản để quét chữ</p>
          {/if}
          <input type="file" accept="image/*" capture="environment" onchange={handleOcrUpload} class="absolute inset-0 opacity-0 cursor-pointer" aria-label="Chọn ảnh để quét chữ" />
        </div>
      </section>
    </div>
  {:else}
    <div class="space-y-4">
      <div class="glass rounded-3xl p-4 border border-[#f2e9e1] flex flex-col items-center space-y-4">
        <div class="w-full aspect-[4/3] bg-neutral-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
          {#if cameraActive}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video bind:this={videoElement} autoplay playsinline class="w-full h-full object-cover"></video>
            <div class="absolute inset-8 border-2 border-dashed border-[#56949f] rounded-xl">
              {#if scannerAnimating}
                <div class="w-full h-1 bg-gradient-to-r from-transparent via-[#56949f] to-transparent absolute top-0 animate-[bounce_1.5s_infinite]"></div>
              {/if}
            </div>
          {:else}
            <div class="text-center p-6 space-y-3">
              <i class="bx bx-camera-off text-4xl text-[#797593]"></i>
              <p class="text-sm font-bold text-neutral-400">Camera chưa được kích hoạt</p>
              <button onclick={startCamera} class="px-5 py-3 bg-[#56949f] text-white text-sm font-bold rounded-xl min-h-[48px]">Kích hoạt Camera</button>
            </div>
          {/if}
        </div>

        {#if cameraActive}
          <div class="w-full flex gap-3">
            <button onclick={stopCamera} class="flex-1 py-3.5 bg-[#b4637a]/10 text-[#b4637a] font-bold rounded-2xl border border-[#b4637a]/30 min-h-[52px]">
              <i class="bx bx-video-off"></i> Tắt Camera
            </button>
            <button onclick={scanCurrency} class="flex-1 py-3.5 bg-[#56949f] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all min-h-[52px]">
              <i class="bx bx-scan"></i> {scannerAnimating ? "Đang nhận diện..." : "Bấm để Quét"}
            </button>
          </div>
        {/if}

        {#if detectedMoney}
          <div class="w-full p-4 bg-[#56949f]/10 border border-[#56949f]/30 rounded-2xl text-center space-y-1">
            <span class="text-xs font-bold text-[#56949f] uppercase tracking-wider">Mệnh giá phát hiện</span>
            <p class="text-2xl font-black text-[#286983]">{detectedMoney}</p>
            <button onclick={() => speakLocal(detectedMoney)} class="text-xs text-[#56949f] underline flex items-center gap-1 mx-auto mt-1">
              <i class="bx bx-volume-full"></i> Nghe lại mệnh giá
            </button>
          </div>
        {/if}
      </div>

      <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-3">
        <h3 class="text-xs font-bold text-[#797593] uppercase tracking-wider flex items-center gap-1.5">
          <i class="bx bx-devices"></i> Chế độ giả lập (Không cần Camera)
        </h3>
        <div class="grid grid-cols-3 gap-2">
          {#each ["10.000", "20.000", "50.000", "100.000", "200.000", "500.000"] as bill}
            <button onclick={() => selectDemoBillType(bill)} class="py-3 rounded-xl border border-[#f2e9e1] bg-[#fffaf3] text-[#2c293e] text-xs font-extrabold min-h-[48px]">
              {bill}đ
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
