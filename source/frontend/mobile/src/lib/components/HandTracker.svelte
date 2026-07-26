<script>
  import { onMount, onDestroy } from 'svelte';
  
  let videoElement;
  let canvasElement;
  let canvasCtx;
  let camera;
  let hands;
  let isActive = false;
  let isLoading = false;

  onMount(async () => {
    // Dynamic import to avoid SSR issues
    const { Hands, HAND_CONNECTIONS } = await import('@mediapipe/hands');
    const { Camera } = await import('@mediapipe/camera_utils');
    const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

    hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      if (!canvasCtx) return;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw video frame to canvas
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      
      // Draw landmarks
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ea9d34', lineWidth: 3});
          drawLandmarks(canvasCtx, landmarks, {color: '#56949f', lineWidth: 2, radius: 3});
        }
      }
      canvasCtx.restore();
    });

    // Initialize Camera wrapper but don't start yet
    camera = new Camera(videoElement, {
      onFrame: async () => {
        if (isActive) {
          await hands.send({image: videoElement});
        }
      },
      width: 640,
      height: 480
    });
  });

  onDestroy(() => {
    stopTracking();
  });

  async function startTracking() {
    isActive = true;
    isLoading = true;
    if (camera) {
      await camera.start();
      canvasCtx = canvasElement.getContext('2d');
      isLoading = false;
    }
  }

  function stopTracking() {
    isActive = false;
    if (camera) {
      camera.stop();
    }
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
  }
</script>

<div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
  <div class="flex items-center justify-between border-b border-[#f2e9e1] pb-3">
    <span class="text-xs font-bold text-[#56949f] bg-[#56949f]/10 px-3 py-1 rounded-full">Luyện tập với AI</span>
    <span class="text-xs text-[#797593]">Google MediaPipe Hand Tracking</span>
  </div>

  <p class="text-xs text-[#797593]">Kích hoạt camera để AI nhận diện cử chỉ bàn tay của bạn trong thời gian thực. Hãy thử thực hành các từ vựng phía trên nhé!</p>

  <div class="relative w-full aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={videoElement} class="hidden"></video>
    <canvas bind:this={canvasElement} width="640" height="480" class="w-full h-full object-cover {isActive ? 'block' : 'hidden'}"></canvas>
    
    {#if !isActive}
      <div class="text-center p-6 space-y-2">
        <i class="bx bx-webcam text-4xl text-[#9893a5]"></i>
        <p class="text-sm font-bold text-neutral-400">Camera đang tắt</p>
      </div>
    {/if}
    
    {#if isLoading}
      <div class="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center text-white">
        <i class="bx bx-loader-alt animate-spin text-3xl text-[#56949f] mb-2"></i>
        <p class="text-xs font-bold tracking-wider">Đang nạp mô hình AI...</p>
      </div>
    {/if}
  </div>

  <div class="flex gap-3">
    {#if isActive}
      <button onclick={stopTracking} class="flex-1 py-3 bg-[#b4637a]/10 text-[#b4637a] font-bold rounded-2xl border border-[#b4637a]/30 active:scale-95 transition-all">
        <i class="bx bx-stop-circle"></i> Tắt Camera
      </button>
    {:else}
      <button onclick={startTracking} class="flex-1 py-3 bg-[#56949f] text-white font-bold rounded-2xl shadow-lg shadow-[#56949f]/20 active:scale-95 transition-all">
        <i class="bx bx-play-circle"></i> Bật Camera AI
      </button>
    {/if}
  </div>
</div>
