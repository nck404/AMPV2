const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf8');

// 1. Add SOSButton import
if (!code.includes('SOSButton.svelte')) {
  code = code.replace(
    'import SignLanguageQuiz from "$lib/components/SignLanguageQuiz.svelte";',
    'import SignLanguageQuiz from "$lib/components/SignLanguageQuiz.svelte";\n  import SOSButton from "$lib/components/SOSButton.svelte";'
  );
}

// 2. Add State and Logic
const logicInjection = `
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
`;

if (!code.includes('let globalFontSize')) {
  code = code.replace('// Load voices & initialize Web APIs', logicInjection + '\n\n  // Load voices & initialize Web APIs');
}

// 3. Add Settings Tab Replacement
const newSettingsHTML = `          <!-- 4. SETTINGS & APP INFO TAB -->
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
`;

const oldSettingsContentRegex = /<!-- 4\. SETTINGS & APP INFO TAB -->[\s\S]*?(?=<\/div>\n\n  <!-- BOTTOM DYNAMIC NAVIGATION BAR -->)/;
code = code.replace(oldSettingsContentRegex, newSettingsHTML);

// 4. Inject Environment Warning UI and SOS Button right before </main>
const warningAndSOS = `
  {#if environmentWarning}
    <div class="fixed inset-0 bg-red-600/30 z-[9999] pointer-events-none animate-[pulse_0.5s_infinite] flex flex-col items-center justify-center backdrop-blur-sm">
      <div class="bg-red-600 text-white px-6 py-4 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,1)] flex items-center gap-3 font-bold text-xl border-4 border-red-400">
        <i class="bx bxs-error-circle text-5xl animate-bounce"></i> 
        <span>CẢNH BÁO ÂM THANH LỚN!</span>
      </div>
    </div>
  {/if}

  <SOSButton />
`;
if (!code.includes('<SOSButton />')) {
  code = code.replace('</main>', warningAndSOS + '\n</main>');
}

fs.writeFileSync('src/routes/+page.svelte', code);
console.log('Features injected successfully.');
