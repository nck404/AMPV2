<script>
  import { onMount } from "svelte";

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
  const signWords = [
    { id: "hello", word: "Xin chào", description: "Bàn tay khép, ngón tay cái hướng lên, đưa từ trán ra ngoài và cúi đầu nhẹ.", category: "Giao tiếp" },
    { id: "thanks", word: "Cảm ơn", description: "Đặt lòng bàn tay phải lên ngực trái, nghiêng đầu cười thân thiện.", category: "Giao tiếp" },
    { id: "bye", word: "Tạm biệt", description: "Giơ tay ngang vai, vẫy các ngón tay nhẹ nhàng ra hiệu chào tạm biệt.", category: "Giao tiếp" },
    { id: "love", word: "Yêu thương", description: "Hai tay đan chéo trước ngực, chạm nhẹ vào vai đối diện.", category: "Cảm xúc" },
    { id: "help", word: "Hỗ trợ", description: "Tay trái nắm lại, tay phải xòe ra đỡ dưới khuỷu tay trái đẩy nhẹ lên.", category: "Hành động" }
  ];

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
        <i class="bx {activeTab === 'reader' ? 'bx-volume-full' : activeTab === 'money' ? 'bx-camera' : activeTab === 'sign' ? 'bx-hand' : 'bx-cog'} text-xl"></i>
      </div>
      <div>
        <h1 class="text-lg font-bold text-[#575279] tracking-tight">{tabInfo[activeTab].title}</h1>
        <p class="text-xs text-[#797593]">{tabInfo[activeTab].desc}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      {#if activeTab === 'sign'}
        <div class="px-3 py-1.5 rounded-full bg-[#f2e9e1] text-xs font-bold text-[#575279] flex items-center gap-1.5 border border-dashed border-[#907aa9]">
          <i class="bx bxs-trophy text-[#ea9d34]"></i> Score: {currentScore}
        </div>
      {:else}
        <button onclick={() => speak(tabInfo[activeTab].title + ". " + tabInfo[activeTab].desc)} class="w-9 h-9 rounded-xl bg-[#f2e9e1] text-[#575279] flex items-center justify-center hover:bg-[#907aa9]/10 transition-colors" aria-label="Đọc thông tin màn hình">
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
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#9893a5] flex items-center gap-2">
            <i class="bx bx-text"></i> Văn bản đọc thành tiếng
          </h2>
          <textarea
            bind:value={textToRead}
            rows="4"
            class="w-full p-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-[#575279] font-medium resize-none transition-all placeholder:text-[#9893a5]"
            placeholder="Nhập nội dung cần đọc tại đây..."
          ></textarea>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-[#797593] mb-1 font-bold">Giọng đọc:</label>
              <select bind:value={selectedVoice} class="w-full p-2.5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none text-[#575279]">
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
              <label class="block text-[#797593] mb-1 font-bold">Tốc độ ({rate}x):</label>
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
            <button onclick={toggleDictation} class="px-4 bg-[#f2e9e1] text-[#575279] rounded-2xl flex items-center justify-center hover:bg-[#907aa9]/10 transition-colors" aria-label="Nói để nhập liệu">
              <i class="bx {isListening ? 'bx-microphone animate-pulse text-[#b4637a]' : 'bx-microphone'} text-xl"></i>
            </button>
          </div>
        </section>

        <!-- OCR Scanning Simulation -->
        <section class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-3">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#9893a5] flex items-center gap-2">
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
                <p class="text-xs text-[#575279] bg-[#f2e9e1] p-2 rounded-xl border border-[#9893a5]/20 text-left">{ocrResult}</p>
              {/if}
            {:else}
              <i class="bx bx-image-add text-3xl text-[#9893a5] mb-1"></i>
              <p class="text-xs text-[#797593]">Chọn hoặc chụp ảnh văn bản để quét chữ</p>
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
                  <i class="bx bx-camera-off text-4xl text-[#9893a5]"></i>
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
            <h3 class="text-xs font-bold text-[#9893a5] uppercase tracking-wider flex items-center gap-1.5">
              <i class="bx bx-devices"></i> Chế độ giả lập (Không cần Camera)
            </h3>
            <p class="text-xs text-[#797593]">Bấm vào các mệnh giá tiền dưới đây để thử tính năng đọc giọng nói:</p>
            <div class="grid grid-cols-3 gap-2">
              {#each ["10.000", "20.000", "50.000", "100.000", "200.000", "500.000"] as bill}
                <button onclick={() => selectDemoBillType(bill)} class="py-2.5 rounded-xl border border-[#f2e9e1] bg-[#fffaf3] text-[#575279] text-xs font-extrabold hover:border-[#56949f] hover:bg-[#56949f]/10 transition-colors">
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
            <!-- Gesture display card -->
            <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
              <div class="flex items-center justify-between border-b border-[#f2e9e1] pb-3">
                <span class="text-xs font-bold text-[#ea9d34] bg-[#ea9d34]/10 px-3 py-1 rounded-full">Từ điển Ký Hiệu</span>
                <span class="text-xs text-[#797593]">Ngôn ngữ ký hiệu Việt Nam (VSL)</span>
              </div>

              <!-- Interactive Carousel / Selector of Words -->
              <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {#each signWords as item}
                  <button onclick={() => speak(item.word + ": " + item.description)} class="px-4 py-2 rounded-2xl bg-[#fffaf3] border border-[#f2e9e1] text-xs font-bold whitespace-nowrap text-[#575279] hover:bg-[#ea9d34]/10 hover:border-[#ea9d34] transition-all">
                    {item.word}
                  </button>
                {/each}
              </div>

              <!-- Selected Word detail -->
              <div class="bg-[#fffaf3] border border-[#f2e9e1] rounded-2xl p-4 space-y-2 relative overflow-hidden">
                <h3 class="text-lg font-black text-[#575279] flex items-center gap-2">
                  <i class="bx bx-hand text-[#ea9d34]"></i> Minh họa ngôn ngữ
                </h3>
                <p class="text-xs text-[#797593]">Bấm vào chữ để học mô tả chi tiết cử chỉ.</p>
                <div class="grid grid-cols-2 gap-3 mt-3">
                  <div class="p-3 bg-[#faf4ed] rounded-xl flex flex-col justify-center items-center text-center border border-[#f2e9e1]">
                    <span class="text-3xl">👋🤟🖖</span>
                    <span class="text-xxs font-bold text-[#9893a5] mt-1">Cử chỉ bàn tay</span>
                  </div>
                  <div class="text-xs space-y-1">
                    <p class="font-bold text-[#575279]">Cách thực hiện:</p>
                    <p class="text-[#797593] leading-relaxed">Chọn các từ vựng phía trên hoặc tham gia trắc nghiệm để rèn luyện trí nhớ cử chỉ.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quiz game section -->
            {#if quizQuestion}
              <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
                <div class="flex items-center gap-2 text-sm font-bold text-[#ea9d34]">
                  <i class="bx bx-question-mark rounded-full bg-[#ea9d34]/10 p-1"></i> Câu hỏi trắc nghiệm cử chỉ
                </div>
                <div class="bg-[#fffaf3] border border-[#f2e9e1] rounded-2xl p-4 text-center space-y-2">
                  <p class="text-xs text-[#9893a5] font-bold uppercase tracking-wider">Cử chỉ sau đây là của từ nào?</p>
                  <p class="text-sm text-[#575279] italic font-medium leading-relaxed">"{quizQuestion.description}"</p>
                </div>

                <div class="space-y-2">
                  {#each quizOptions as option}
                    <button
                      onclick={() => answerQuiz(option)}
                      disabled={selectedQuizAnswer !== null}
                      class="w-full p-4 rounded-2xl text-left border font-bold text-sm transition-all flex items-center justify-between
                        {selectedQuizAnswer === option 
                          ? option === quizQuestion.word 
                            ? 'bg-green-500/10 border-green-500 text-green-700' 
                            : 'bg-red-500/10 border-red-500 text-red-700'
                          : 'bg-[#fffaf3] border-[#f2e9e1] text-[#575279] hover:bg-[#ea9d34]/10 hover:border-[#ea9d34]'
                        }"
                    >
                      <span>{option}</span>
                      {#if selectedQuizAnswer === option}
                        {#if option === quizQuestion.word}
                          <i class="bx bx-check-circle text-lg text-green-600"></i>
                        {:else}
                          <i class="bx bx-x-circle text-lg text-red-600"></i>
                        {/if}
                      {/if}
                    </button>
                  {/each}
                </div>

                {#if selectedQuizAnswer}
                  <div class="flex items-center justify-between pt-2">
                    <p class="text-xs font-semibold {quizFeedback === 'correct' ? 'text-green-600' : 'text-red-500'}">
                      {quizFeedback === 'correct' ? 'Chính xác! Làm tốt lắm.' : `Sai rồi. Đáp án đúng là: ${quizQuestion.word}`}
                    </p>
                    <button onclick={generateNewQuiz} class="px-4 py-2 bg-[#ea9d34] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all">
                      Tiếp tục <i class="bx bx-arrow-to-right"></i>
                    </button>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {:else}
          <!-- 4. SETTINGS & APP INFO TAB -->
          <div class="space-y-4">
            <div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-[#9893a5] flex items-center gap-2 border-b border-[#f2e9e1] pb-2">
                <i class="bx bx-accessibility text-[#7287fd]"></i> Thiết lập trợ năng
              </h3>
              
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div>
                    <p class="font-bold text-[#575279]">Chế độ tương phản cao</p>
                    <p class="text-xxs text-[#797593]">Tối ưu hóa màu sắc cho người giảm thị lực</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" />
                    <div class="w-11 h-6 bg-[#f2e9e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#7287fd]"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div>
                    <p class="font-bold text-[#575279]">Rung khi nhận dạng xong</p>
                    <p class="text-xxs text-[#797593]">Phản hồi xúc giác cho người khiếm thính</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[#f2e9e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#7287fd]"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                  <div>
                    <p class="font-bold text-[#575279]">Phát âm giọng nói tự động</p>
                    <p class="text-xxs text-[#797593]">Tự động đọc mệnh giá khi quét</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" />
                    <div class="w-11 h-6 bg-[#f2e9e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#7287fd]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div class="glass rounded-3xl p-5 border border-[#f2e9e1] text-center space-y-2">
              <p class="text-xs text-[#797593]">AMP Mobile 2.0 • Được thiết kế vì cộng đồng</p>
              <div class="flex justify-center gap-4 text-xs font-bold text-[#7287fd]">
                <a href="#tutorial" class="hover:underline">Hướng dẫn sử dụng</a>
                <span>•</span>
                <a href="#about" class="hover:underline">Điều khoản dịch vụ</a>
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
          {activeTab === 'reader' ? 'text-[#b4637a] scale-110 font-bold' : 'text-[#797593] hover:text-[#575279]'}"
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
          {activeTab === 'money' ? 'text-[#286983] scale-110 font-bold' : 'text-[#797593] hover:text-[#575279]'}"
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
          {activeTab === 'sign' ? 'text-[#ea9d34] scale-110 font-bold' : 'text-[#797593] hover:text-[#575279]'}"
      >
        <i class="bx {activeTab === 'sign' ? 'bxs-hand' : 'bx-hand'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Học ký hiệu</span>
        {#if activeTab === 'sign'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#ea9d34]"></span>
        {/if}
      </button>

      <!-- Tab: Settings/Info -->
      <button 
        onclick={() => { activeTab = "settings"; speak("Cài đặt"); }} 
        class="flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl relative transition-all duration-300 z-10 
          {activeTab === 'settings' ? 'text-[#7287fd] scale-110 font-bold' : 'text-[#797593] hover:text-[#575279]'}"
      >
        <i class="bx {activeTab === 'settings' ? 'bxs-cog' : 'bx-cog'} text-2xl"></i>
        <span class="text-[10px] mt-0.5 tracking-tight transition-all duration-300">Cài đặt</span>
        {#if activeTab === 'settings'}
          <span class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#7287fd]"></span>
        {/if}
      </button>

    </div>
  </nav>
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
