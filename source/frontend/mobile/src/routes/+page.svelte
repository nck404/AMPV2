<script>
  import { onMount, onDestroy } from "svelte";
  import { signDatabase, signTopics } from "$lib/data/signDatabase";
  import HandTracker from "$lib/components/HandTracker.svelte";
  import SignLanguageQuiz from "$lib/components/SignLanguageQuiz.svelte";
  import SOSButton from "$lib/components/SOSButton.svelte";

  // Tab State
  let activeTab = $state("reader"); // 'reader', 'money', 'sign', 'settings'

  // Speech Synthesis & Recognition state
  let textToRead = $state("Chào mừng bạn đến với ứng dụng hỗ trợ người khuyết tật AMP Mobile.");
  let voices = $state([]);
  let selectedVoice = $state(null);
  let rate = $state(1);
  let pitch = $state(1);
  let isSpeaking = $state(false);
  let isListening = $state(false);
  let recognition = null;
  let ocrImage = $state(null);
  let ocrScanning = $state(false);
  let ocrResult = $state("");

  // Money Scanner state
  let videoElement = $state(null);
  let stream = $state(null);
  let cameraActive = $state(false);
  let detectedMoney = $state("");
  let scannerAnimating = $state(false);
  let selectedDemoBill = $state(null);

  // Sign Language State
  let currentScore = $state(0);
  let quizQuestion = $state(null);
  let quizOptions = $state([]);
  let selectedQuizAnswer = $state(null);
  let quizFeedback = $state(""); // 'correct', 'incorrect', ''
  let confettiModule = null;

  // Sign Language database
  let selectedSignWord = $state(null);
  let activeTopicId = $state(null);
  let activeLessonView = $state(null); // Stores the currently active topic object for the full page view
  let signWords = $state(signDatabase);
  let signTopicsList = $state(signTopics);

  
  // Accessibility State
  let globalFontSize = $state(16);
  let audioContext = null;
  let audioStream = null;
  let isListeningEnvironment = $state(false);
  let environmentWarning = $state(false);

  async function toggleEnvironmentListening() {
    if (isListeningEnvironment) {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!isListeningEnvironment) return;
          analyser.getByteFrequencyData(dataArray);
          const maxVolume = Math.max(...dataArray);
          if (maxVolume > 220 && !environmentWarning) { // Loud noise threshold
            environmentWarning = true;
            if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
            speak("Cảnh báo, phát hiện âm thanh khẩn cấp.");
            setTimeout(() => environmentWarning = false, 4000);
          }
          requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (e) {
        console.error(e);
        isListeningEnvironment = false;
        alert("Không thể truy cập Microphone để cảnh báo âm thanh.");
      }
    } else {
      if (audioStream) audioStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
    }
  }


  // Load voices & initialize Web APIs
  onMount(() => {
    // TTS Voice loading
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        // Prefer Vietnamese voices
        const viVoice = voices.find(v => v.lang.includes("vi") || v.name.toLowerCase().includes("vietnam") || v.name.toLowerCase().includes("vietnamese"));
        selectedVoice = viVoice ? viVoice.name : (voices[0]?.name || null);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Speech Recognition setup
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "vi-VN";
        recognition.interimResults = false;

        recognition.onstart = () => {
          isListening = true;
        };

        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          textToRead = textToRead ? textToRead + " " + speechToText : speechToText;
          isListening = false;
          speak(`Đã nghe: ${speechToText}`);
        };

        recognition.onerror = () => {
          isListening = false;
        };

        recognition.onend = () => {
          isListening = false;
        };
      }
    }

    // Dynamic Island Pop
    const island = document.querySelector('.dynamic-island');
    if (island) {
      island.classList.add('animate-[island-pop_0.6s_cubic-bezier(0.34,1.56,0.64,1)]');
    }

    // Import confetti dynamic
    import("canvas-confetti").then((module) => {
      confettiModule = module.default;
    });

    generateNewQuiz();

    return () => {
      stopCamera();
    };
  });

  // SPEAK TEXT (TTS)
  function speak(textToSpeak) {
    if (!textToSpeak) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (selectedVoice) {
        const voiceObj = voices.find(v => v.name === selectedVoice);
        if (voiceObj) utterance.voice = voiceObj;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.onstart = () => { isSpeaking = true; };
      utterance.onend = () => { isSpeaking = false; };
      utterance.onerror = () => { isSpeaking = false; };
      window.speechSynthesis.speak(utterance);
    }
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
    }
  }

  // DICTATION (STT)
  function toggleDictation() {
    if (!recognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }

  // OCR IMAGE SIMULATION
  function handleOcrUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    ocrImage = URL.createObjectURL(file);
    ocrScanning = true;
    ocrResult = "";

    setTimeout(() => {
      ocrScanning = false;
      ocrResult = "Hóa đơn thanh toán siêu thị AMP. Tổng tiền: 150.000 đồng. Xin cảm ơn quý khách.";
      speak("Phát hiện văn bản từ hình ảnh: " + ocrResult);
    }, 2000);
  }

  // CAMERA LOGIC FOR CURRENCY SCANNER
  async function startCamera() {
    detectedMoney = "";
    selectedDemoBill = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      cameraActive = true;
      // Wait for DOM update
      setTimeout(() => {
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Lỗi truy cập camera: ", err);
      cameraActive = false;
      alert("Không thể truy cập camera. Vui lòng cho phép quyền camera hoặc sử dụng chế độ giả lập bên dưới.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cameraActive = false;
    stream = null;
  }

  // CURRENCY DETECTION SIMULATION
  function scanCurrency() {
    if (scannerAnimating) return;
    scannerAnimating = true;
    detectedMoney = "";

    // 1.5s scan animation
    setTimeout(() => {
      scannerAnimating = false;
      const bills = ["10.000", "20.000", "50.000", "100.000", "200.000", "500.000"];
      const randomBill = selectedDemoBill || bills[Math.floor(Math.random() * bills.length)];
      detectedMoney = `${randomBill} VNĐ`;
      speak(`Mệnh giá tiền phát hiện: ${randomBill} đồng`);
    }, 1500);
  }

  function selectDemoBillType(bill) {
    selectedDemoBill = bill;
    if (cameraActive) {
      scanCurrency();
    } else {
      detectedMoney = `${bill} VNĐ`;
      speak(`Giả lập mệnh giá: ${bill} đồng`);
    }
  }

  // SIGN LANGUAGE QUIZ GENERATOR
  function generateNewQuiz() {
    selectedQuizAnswer = null;
    quizFeedback = "";
    const randomIndex = Math.floor(Math.random() * signWords.length);
    quizQuestion = signWords[randomIndex];

    // Generate 3 options (1 correct, 2 incorrect)
    let options = [quizQuestion.word];
    while (options.length < 3) {
      const randomWord = signWords[Math.floor(Math.random() * signWords.length)].word;
      if (!options.includes(randomWord)) {
        options.push(randomWord);
      }
    }
    // Shuffle options
    quizOptions = options.sort(() => Math.random() - 0.5);
  }

  function answerQuiz(option) {
    if (selectedQuizAnswer) return; // Answered already
    selectedQuizAnswer = option;

    if (option === quizQuestion.word) {
      quizFeedback = "correct";
      currentScore += 10;
      speak("Chính xác! Bạn được cộng mười điểm.");
      if (confettiModule) {
        confettiModule({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      quizFeedback = "incorrect";
      speak(`Chưa đúng rồi! Hãy thử lại câu tiếp theo.`);
    }
  }

  // Helper styles based on active tabs
  const tabInfo = {
    reader: { title: "Trình Đọc Màn Hình", desc: "Chuyển giọng nói thành văn bản & ngược lại", color: "from-[#b4637a] to-[#907aa9]" },
    money: { title: "Đọc Mệnh Giá Tiền", desc: "Nhận dạng tiền tệ bằng Camera thông minh", color: "from-[#286983] to-[#56949f]" },
    sign: { title: "Học Ký Hiệu", desc: "Cộng đồng học ngôn ngữ ký hiệu tương tác", color: "from-[#ea9d34] to-[#d7827e]" },
    settings: { title: "Cài Đặt", desc: "Cá nhân hóa trải nghiệm trợ năng của bạn", color: "from-[#7287fd] to-[#8839ef]" }
  };
</script>

<main class="max-w-md mx-auto min-h-screen flex flex-col justify-between relative px-4 pt-6 pb-28">
  <!-- Header Bar -->
  <header class="glass rounded-3xl p-4 mb-4 flex items-center justify-between border-2 border-[#f2e9e1] dynamic-island">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr {tabInfo[activeTab].color} flex items-center justify-center text-white shadow-md">
        <i class="bx {activeTab === 'reader' ? 'bx-volume-full' : activeTab === 'money' ? 'bx-camera' : activeTab === 'sign' ? 'bx-book' : 'bx-cog'} text-xl"></i>
      </div>
      <div>
        <h1 class="text-lg font-bold text-[#2c293e] tracking-tight">{tabInfo[activeTab].title}</h1>
        <p class="text-xs text-[#575279]">{tabInfo[activeTab].desc}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      {#if activeTab === 'sign'}
        <div class="px-3 py-1.5 rounded-full bg-[#f2e9e1] text-xs font-bold text-[#2c293e] flex items-center gap-1.5 border border-dashed border-[#907aa9]">
          <i class="bx bxs-trophy text-[#ea9d34]"></i> Score: {currentScore}
        </div>
      {:else}
        <button onclick={() => speak(tabInfo[activeTab].title + ". " + tabInfo[activeTab].desc)} class="w-9 h-9 rounded-xl bg-[#f2e9e1] text-[#2c293e] flex items-center justify-center hover:bg-[#907aa9]/10 transition-colors" aria-label="Đọc thông tin màn hình">
          <i class="bx bx-info-circle text-lg"></i>
        </button>
      {/if}
    </div>
  </header>

  <!-- SCREEN CONTENT -->
  <div class="flex-grow flex flex-col justify-start">
    
    <!-- 1. SCREEN READER TAB -->
    {#if activeTab === 'reader'}
      <div class="space-y-4">
        <!-- Text To Speech Section -->
        <section class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2">
            <i class="bx bx-text"></i> Văn bản đọc thành tiếng
          </h2>
          <textarea
            bind:value={textToRead}
            rows="4"
            class="w-full p-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-[#2c293e] font-medium resize-none transition-all placeholder:text-[#797593]"
            placeholder="Nhập nội dung cần đọc tại đây..."
          ></textarea>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-[#575279] mb-1 font-bold">Giọng đọc:</label>
              <select bind:value={selectedVoice} class="w-full p-2.5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none text-[#2c293e]">
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
              <label class="block text-[#575279] mb-1 font-bold">Tốc độ ({rate}x):</label>
              <input type="range" min="0.5" max="2" step="0.1" bind:value={rate} class="w-full accent-[#907aa9] mt-2" />
            </div>
          </div>

          <div class="flex gap-2">
            {#if isSpeaking}
              <button onclick={stopSpeaking} class="flex-1 py-3 bg-[#b4637a] text-white font-bold rounded-2xl shadow-lg shadow-[#b4637a]/20 flex items-center justify-center gap-2 hover:bg-[#b4637a]/90 active:scale-95 transition-all">
                <i class="bx bx-stop-circle text-lg"></i> Dừng đọc
              </button>
            {:else}
              <button onclick={() => speak(textToRead)} class="flex-1 py-3 bg-[#907aa9] text-white font-bold rounded-2xl shadow-lg shadow-[#907aa9]/20 flex items-center justify-center gap-2 hover:bg-[#907aa9]/90 active:scale-95 transition-all">
                <i class="bx bx-play-circle text-lg"></i> Đọc ngay
              </button>
            {/if}
            <button onclick={toggleDictation} class="px-4 bg-[#f2e9e1] text-[#2c293e] rounded-2xl flex items-center justify-center hover:bg-[#907aa9]/10 transition-colors" aria-label="Nói để nhập liệu">
              <i class="bx {isListening ? 'bx-microphone animate-pulse text-[#b4637a]' : 'bx-microphone'} text-xl"></i>
            </button>
          </div>
        </section>

        <!-- OCR Scanning Simulation -->
        <section class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-3">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2">
            <i class="bx bx-scan"></i> Trích xuất chữ từ ảnh (OCR)
          </h2>
          <div class="border-2 border-dashed border-[#f2e9e1] rounded-2xl p-6 text-center hover:bg-[#fffaf3] transition-all relative overflow-hidden">
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
            <input type="file" accept="image/*" onchange={handleOcrUpload} class="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </section>
      </div>

    <!-- 2. MONEY SCANNER TAB -->
    {:else}
      {#if activeTab === 'money'}
        <div class="space-y-4">
          <!-- Camera Feed & Scan Container -->
          <div class="glass rounded-3xl p-4 border border-[#f2e9e1] flex flex-col items-center space-y-4 relative overflow-hidden">
            <div class="w-full aspect-[4/3] bg-neutral-900 rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center">
              {#if cameraActive}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video bind:this={videoElement} autoplay playsinline class="w-full h-full object-cover"></video>
                <!-- Target scanning frame overlay -->
                <div class="absolute inset-8 border-2 border-dashed border-[#56949f] rounded-xl flex items-center justify-center">
                  <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#56949f] -translate-x-1.5 -translate-y-1.5"></div>
                  <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#56949f] translate-x-1.5 -translate-y-1.5"></div>
                  <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#56949f] -translate-x-1.5 translate-y-1.5"></div>
                  <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#56949f] translate-x-1.5 translate-y-1.5"></div>

                  {#if scannerAnimating}
                    <div class="w-full h-1 bg-gradient-to-r from-transparent via-[#56949f] to-transparent shadow-[0_0_8px_#56949f] absolute top-0 animate-[bounce_1.5s_infinite]"></div>
                  {/if}
                </div>
              {:else}
                <div class="text-center p-6 space-y-2">
                  <i class="bx bx-camera-off text-4xl text-[#797593]"></i>
                  <p class="text-sm font-bold text-neutral-400">Camera chưa được kích hoạt</p>
                  <button onclick={startCamera} class="px-4 py-2 bg-[#56949f] text-white text-xs font-bold rounded-xl shadow-md">Kích hoạt Camera</button>
                </div>
              {/if}
            </div>

            <!-- Action buttons -->
            <div class="w-full flex gap-3">
              {#if cameraActive}
                <button onclick={stopCamera} class="flex-1 py-3 bg-[#b4637a]/10 text-[#b4637a] font-bold rounded-2xl flex items-center justify-center gap-2 border border-[#b4637a]/30">
                  <i class="bx bx-video-off"></i> Tắt Camera
                </button>
                <button onclick={scanCurrency} class="flex-1 py-3 bg-[#56949f] text-white font-bold rounded-2xl shadow-lg shadow-[#56949f]/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <i class="bx bx-scan"></i> {scannerAnimating ? 'Đang nhận diện...' : 'Bấm để Quét'}
                </button>
              {/if}
            </div>

            {#if detectedMoney}
              <div class="w-full p-4 bg-[#56949f]/10 border border-[#56949f]/30 rounded-2xl text-center space-y-1">
                <span class="text-xs font-bold text-[#56949f] uppercase tracking-wider">Mệnh giá phát hiện</span>
                <p class="text-2xl font-black text-[#286983] tracking-tight">{detectedMoney}</p>
                <button onclick={() => speak(detectedMoney)} class="text-xs text-[#56949f] underline flex items-center gap-1 mx-auto mt-1">
                  <i class="bx bx-volume-full"></i> Nghe lại mệnh giá
                </button>
              </div>
            {/if}
          </div>

          <!-- Simulation Quick Buttons -->
          <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-3">
            <h3 class="text-xs font-bold text-[#797593] uppercase tracking-wider flex items-center gap-1.5">
              <i class="bx bx-devices"></i> Chế độ giả lập (Không cần Camera)
            </h3>
            <p class="text-xs text-[#575279]">Bấm vào các mệnh giá tiền dưới đây để thử tính năng đọc giọng nói:</p>
            <div class="grid grid-cols-3 gap-2">
              {#each ["10.000", "20.000", "50.000", "100.000", "200.000", "500.000"] as bill}
                <button onclick={() => selectDemoBillType(bill)} class="py-2.5 rounded-xl border border-[#f2e9e1] bg-[#fffaf3] text-[#2c293e] text-xs font-extrabold hover:border-[#56949f] hover:bg-[#56949f]/10 transition-colors">
                  {bill}đ
                </button>
              {/each}
            </div>
          </div>
        </div>

      <!-- 3. LEARN SIGN LANGUAGE TAB -->
      {:else}
        {#if activeTab === 'sign'}
          <div class="space-y-4">
            
            {#if !activeLessonView}
              <!-- MASTER VIEW: Topic List -->
              <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
                <div class="flex items-center justify-between border-b border-[#f2e9e1] pb-3">
                  <span class="text-xs font-bold text-[#ea9d34] bg-[#ea9d34]/10 px-3 py-1 rounded-full">Giáo trình Ngôn ngữ Ký hiệu</span>
                  <span class="text-xs text-[#575279]">VSL</span>
                </div>

                <div class="flex flex-col gap-3">
                  {#each signTopicsList as topic}
                    <button 
                      onclick={() => { 
                        activeLessonView = topic; 
                        selectedSignWord = topic.lessons[0]; 
                        speak("Đã vào bài học: " + topic.title); 
                      }} 
                      class="border border-[#f2e9e1] rounded-2xl overflow-hidden bg-[#fffaf3] flex items-center justify-between p-4 hover:bg-[#f2e9e1] hover:border-[#ea9d34] transition-all text-left shadow-sm hover:shadow-md"
                    >
                      <div class="flex items-center gap-3 text-[#2c293e]">
                        <div class="w-12 h-12 rounded-full bg-[#ea9d34]/10 flex items-center justify-center">
                          <i class="bx {topic.icon} text-2xl text-[#ea9d34]"></i>
                        </div>
                        <div>
                          <p class="text-base font-black">{topic.title}</p>
                          <p class="text-[11px] text-[#575279] mt-0.5">{topic.description}</p>
                          <p class="text-[10px] text-[#ea9d34] font-bold mt-1">{topic.lessons.length} ký hiệu</p>
                        </div>
                      </div>
                      <i class="bx bx-chevron-right text-[#797593] text-2xl"></i>
                    </button>
                  {/each}
                </div>
              </div>
            {:else}
              <!-- DETAIL VIEW: Inside a Lesson -->
              
              <!-- Back button & Header -->
              <div class="flex items-center gap-3">
                <button 
                  onclick={() => { activeLessonView = null; selectedSignWord = null; }} 
                  class="w-10 h-10 rounded-2xl bg-white border-2 border-[#f2e9e1] flex items-center justify-center text-[#2c293e] shadow-sm hover:bg-[#ea9d34] hover:text-white hover:border-[#ea9d34] transition-all active:scale-90"
                >
                  <i class="bx bx-arrow-back text-xl"></i>
                </button>
                <div class="flex-1">
                  <h2 class="text-lg font-black text-[#2c293e] truncate">{activeLessonView.title}</h2>
                  <p class="text-xs text-[#575279] truncate">{activeLessonView.description}</p>
                </div>
              </div>

              <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
                <div class="flex items-center justify-between border-b border-[#f2e9e1] pb-3">
                  <span class="text-xs font-bold text-[#ea9d34] bg-[#ea9d34]/10 px-3 py-1 rounded-full"><i class="bx bx-list-ul"></i> Danh sách ký hiệu</span>
                  <span class="text-xs font-bold text-[#797593]">{activeLessonView.lessons.length} mục</span>
                </div>

                <!-- Interactive Carousel of Words in this lesson -->
                <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {#each activeLessonView.lessons as item}
                    <button 
                      onclick={() => { selectedSignWord = item; speak(item.word + ": " + item.description); }} 
                      class="px-4 py-2.5 rounded-2xl border text-sm font-bold whitespace-nowrap transition-all {selectedSignWord === item ? 'bg-[#ea9d34] text-white border-[#ea9d34] shadow-md shadow-[#ea9d34]/20' : 'bg-white text-[#2c293e] border-[#f2e9e1] hover:bg-[#ea9d34]/10 hover:border-[#ea9d34]'}"
                    >
                      {item.word}
                    </button>
                  {/each}
                </div>

                <!-- Selected Word detail -->
                <div class="bg-[#fffaf3] border border-[#f2e9e1] rounded-2xl p-4 space-y-2 relative overflow-hidden mt-2">
                  <h3 class="text-lg font-black text-[#2c293e] flex items-center gap-2">
                    <i class="bx bx-book text-[#ea9d34]"></i> Minh họa ngôn ngữ
                  </h3>
                  <div class="grid grid-cols-2 gap-3 mt-3">
                    <div class="p-3 bg-[#faf4ed] rounded-xl flex flex-col justify-center items-center text-center border border-[#f2e9e1] overflow-hidden min-h-[120px]">
                      {#if selectedSignWord?.image}
                        <img src={selectedSignWord.image} alt={selectedSignWord.word} class="w-full h-auto rounded-lg object-contain" />
                      {:else}
                        <span class="text-4xl">👋🤟🖖</span>
                        <span class="text-xxs font-bold text-[#797593] mt-2">Cử chỉ bàn tay</span>
                      {/if}
                    </div>
                    <div class="text-xs space-y-1 flex flex-col justify-center">
                      <p class="font-bold text-[#2c293e] text-sm mb-1">{selectedSignWord?.word || ''}</p>
                      <p class="text-[#575279] leading-relaxed">
                        {#if selectedSignWord}
                          {selectedSignWord.description}
                        {:else}
                          Chọn từ vựng để xem hướng dẫn.
                        {/if}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hand Tracking with AI -->
              <HandTracker />
            {/if}

            <!-- Quiz game section (only show if not in a specific lesson or if you want it always available) -->
            {#if !activeLessonView && quizQuestion}
              <SignLanguageQuiz
                {quizQuestion}
                {quizOptions}
                {selectedQuizAnswer}
                {quizFeedback}
                {answerQuiz}
                {generateNewQuiz}
              />
            {/if}
          </div>
        {:else}
                    <!-- 4. SETTINGS & APP INFO TAB -->
          <div class="space-y-4">
            <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2 border-b border-[#f2e9e1] pb-2">
                <i class="bx bx-accessibility text-[#7287fd]"></i> Thiết lập trợ năng nâng cao
              </h3>
              
              <div class="space-y-4 text-sm">
                <!-- Font size slider -->
                <div class="p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div class="flex justify-between mb-2">
                    <p class="font-bold text-[#2c293e]">Kích thước chữ hệ thống</p>
                    <span class="text-xs font-bold bg-[#7287fd]/10 text-[#7287fd] px-2 py-0.5 rounded-full">{globalFontSize}px</span>
                  </div>
                  <input type="range" min="14" max="24" step="1" bind:value={globalFontSize} onchange={() => document.documentElement.style.fontSize = globalFontSize + 'px'} class="w-full accent-[#7287fd]" />
                  <p class="text-xxs text-[#575279] mt-1">Phóng to chữ trên toàn bộ màn hình.</p>
                </div>

                <!-- Environment Sound Alert -->
                <div class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div>
                    <p class="font-bold text-[#2c293e]">Cảnh báo âm thanh lớn</p>
                    <p class="text-xxs text-[#575279]">Báo rung & cảnh báo khi có còi xe, cháy</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={isListeningEnvironment} onchange={toggleEnvironmentListening} class="sr-only peer" />
                    <div class="w-11 h-6 bg-[#f2e9e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#7287fd]"></div>
                  </label>
                </div>

                <!-- Haptic feedback -->
                <div class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div>
                    <p class="font-bold text-[#2c293e]">Phản hồi xúc giác</p>
                    <p class="text-xxs text-[#575279]">Rung điện thoại khi tương tác UI</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[#f2e9e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#7287fd]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div class="glass rounded-3xl p-5 border border-[#f2e9e1] text-center space-y-2">
              <p class="text-xs text-[#575279]">AMP Mobile 2.0 • Dự án vì cộng đồng</p>
              <div class="flex justify-center gap-4 text-xs font-bold text-[#7287fd]">
                <a href="#tutorial" class="hover:underline">Hướng dẫn</a>
                <span>•</span>
                <a href="#about" class="hover:underline">Điều khoản</a>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  </div>

  <!-- BOTTOM DYNAMIC NAVIGATION BAR -->
  <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[32px] p-2 flex items-center justify-between border-2 border-[#f2e9e1] shadow-xl z-50">
    <!-- Active state morphing slider container -->
    <div class="flex justify-around items-center w-full relative">
      
      <!-- Tab: Reader -->
      <button 
        onclick={() => { activeTab = "reader"; speak("Trình đọc màn hình"); }} 
        class="flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl relative transition-all duration-300 z-10 
          {activeTab === 'reader' ? 'text-[#b4637a] scale-110 font-bold' : 'text-[#575279] hover:text-[#2c293e]'}"
      >
        <i class="bx {activeTab === 'reader' ? 'bxs-volume-full' : 'bx-volume-full'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Đọc chữ</span>
        {#if activeTab === 'reader'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#b4637a]"></span>
        {/if}
      </button>

      <!-- Tab: Money Scanner -->
      <button 
        onclick={() => { activeTab = "money"; speak("Đọc mệnh giá tiền"); }} 
        class="flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl relative transition-all duration-300 z-10 
          {activeTab === 'money' ? 'text-[#286983] scale-110 font-bold' : 'text-[#575279] hover:text-[#2c293e]'}"
      >
        <i class="bx {activeTab === 'money' ? 'bxs-camera' : 'bx-camera'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Đọc tiền</span>
        {#if activeTab === 'money'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#286983]"></span>
        {/if}
      </button>

      <!-- Tab: Sign Language -->
      <button 
        onclick={() => { activeTab = "sign"; speak("Học ký hiệu"); }} 
        class="flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl relative transition-all duration-300 z-10 
          {activeTab === 'sign' ? 'text-[#ea9d34] scale-110 font-bold' : 'text-[#575279] hover:text-[#2c293e]'}"
      >
        <i class="bx {activeTab === 'sign' ? 'bxs-book' : 'bx-book'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Học ký hiệu</span>
        {#if activeTab === 'sign'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#ea9d34]"></span>
        {/if}
      </button>

      <!-- Tab: Settings/Info -->
      <button 
        onclick={() => { activeTab = "settings"; speak("Cài đặt"); }} 
        class="flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl relative transition-all duration-300 z-10 
          {activeTab === 'settings' ? 'text-[#7287fd] scale-110 font-bold' : 'text-[#575279] hover:text-[#2c293e]'}"
      >
        <i class="bx {activeTab === 'settings' ? 'bxs-cog' : 'bx-cog'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Cài đặt</span>
        {#if activeTab === 'settings'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#7287fd]"></span>
        {/if}
      </button>

    </div>
  </nav>

  {#if environmentWarning}
    <div class="fixed inset-0 bg-red-600/30 z-[9999] pointer-events-none animate-[pulse_0.5s_infinite] flex flex-col items-center justify-center backdrop-blur-sm">
      <div class="bg-red-600 text-white px-6 py-4 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,1)] flex items-center gap-3 font-bold text-xl border-4 border-red-400">
        <i class="bx bxs-error-circle text-5xl animate-bounce"></i> 
        <span>CẢNH BÁO ÂM THANH LỚN!</span>
      </div>
    </div>
  {/if}

  <SOSButton />

</main>

<style>
  /* Custom scrollbar suppression */
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
