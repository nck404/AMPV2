<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
    import { Camera } from "@mediapipe/camera_utils";
    import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

    let mounted = $state(false);
    let selectedCategory = $state("Bảng chữ cái");
    let activeLesson = $state(null);
    let videoElement;
    let canvasElement;
    let illustrationCanvas; // Canvas for the "Teacher"
    let camera;
    let hands;
    let isCameraRunning = $state(false);
    let handDetected = $state(false);

    // Custom Theme configuration
    const theme = {
        connectorColor: "#eb6f92", // Rose
        landmarkColor: "#31748f", // Foam
        connectorWidth: 4,
        landmarkRadius: 2,
    };

    const categories = [
        { name: "Bảng chữ cái", icon: "bx-font", count: 26 },
        { name: "Số đếm", icon: "bx-hash", count: 10 },
        { name: "Chào hỏi", icon: "bx-hand", count: 15 },
        { name: "Ẩm thực", icon: "bx-fridge", count: 20 },
        { name: "Cảm xúc", icon: "bx-laugh", count: 12 },
    ];

    // Pre-defined landmarks for illustrations (normalized 0-1)
    // In a real app, you'd capture these from MediaPipe and save them to a JSON file.
    // Here, I'm simulating "A" and "B" broadly.
    const handShapes = {
        "Letter A": [
            { x: 0.5, y: 0.8 },
            { x: 0.4, y: 0.75 },
            { x: 0.35, y: 0.65 },
            { x: 0.38, y: 0.55 },
            { x: 0.42, y: 0.5 }, // Thumb
            { x: 0.5, y: 0.8 },
            { x: 0.55, y: 0.65 },
            { x: 0.52, y: 0.55 },
            { x: 0.5, y: 0.6 }, // Index (curled)
            { x: 0.5, y: 0.8 },
            { x: 0.6, y: 0.65 },
            { x: 0.58, y: 0.55 },
            { x: 0.56, y: 0.62 }, // Middle (curled)
            { x: 0.5, y: 0.8 },
            { x: 0.65, y: 0.66 },
            { x: 0.63, y: 0.56 },
            { x: 0.61, y: 0.63 }, // Ring (curled)
            { x: 0.5, y: 0.8 },
            { x: 0.7, y: 0.68 },
            { x: 0.68, y: 0.6 },
            { x: 0.66, y: 0.65 }, // Pinky (curled)
            // Note: This is a very rough approximation for demo purposes.
            // Real MediaPipe has 21 points. I'm just triggering a generic hand draw for now.
        ],
    };

    const lessons = [
        {
            id: 1,
            title: "Chữ A",
            difficulty: "Cơ bản",
            duration: "2 phút",
            category: "Bảng chữ cái",
            description:
                "Nắm bàn tay lại, để ngón cái sát vào cạnh của ngón trỏ.",
        },
        {
            id: 2,
            title: "Chữ B",
            difficulty: "Cơ bản",
            duration: "3 phút",
            category: "Bảng chữ cái",
            description: "Giơ thẳng 4 ngón tay, gập ngón cái vào lòng bàn tay.",
        },
        {
            id: 3,
            title: "Chữ C",
            difficulty: "Cơ bản",
            duration: "2 phút",
            category: "Bảng chữ cái",
            description: "Cong các ngón tay lại tạo thành hình chữ C.",
        },
        {
            id: 4,
            title: "Xin chào",
            difficulty: "Trung bình",
            duration: "5 phút",
            category: "Chào hỏi",
            description: "Đưa tay lên trán và vẫy nhẹ ra ngoài.",
        },
    ];

    onMount(() => {
        mounted = true;
        initMediaPipe();
    });

    onDestroy(() => {
        if (camera) {
            camera.stop();
        }
    });

    function initMediaPipe() {
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        hands.onResults(onResults);
    }

    function onResults(results) {
        if (!canvasElement) return;

        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();

        // 1. Draw the video frame but dimmed (Overlay effect)
        // Draw the raw image first
        canvasCtx.globalCompositeOperation = "source-over";
        canvasCtx.drawImage(
            results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height,
        );

        // Apply a dark semi-transparent overlay
        canvasCtx.fillStyle = "rgba(25, 23, 36, 0.85)"; // Deep dark overlay (85% opacity)
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        // 2. Draw "Realistic" Hand
        if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
        ) {
            handDetected = true;
            for (const landmarks of results.multiHandLandmarks) {
                drawRealisticHand(canvasCtx, landmarks);
            }
        } else {
            handDetected = false;
        }
        canvasCtx.restore();
    }

    // Helper to map normalized coordinates to canvas pixel coordinates
    function toPixel(landmark, width, height) {
        return { x: landmark.x * width, y: landmark.y * height };
    }

    function drawRealisticHand(ctx, landmarks) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const palmBase = toPixel(landmarks[0], width, height); // Wrist
        const thumbCMC = toPixel(landmarks[1], width, height);
        const indexMCP = toPixel(landmarks[5], width, height);
        const pinkyMCP = toPixel(landmarks[17], width, height);

        // Draw Palm (Polygon)
        ctx.fillStyle = "rgba(235, 111, 146, 0.6)"; // Rose color with opacity
        ctx.beginPath();
        ctx.moveTo(palmBase.x, palmBase.y);
        ctx.lineTo(thumbCMC.x, thumbCMC.y);
        ctx.lineTo(indexMCP.x, indexMCP.y);
        ctx.lineTo(pinkyMCP.x, pinkyMCP.y);
        ctx.closePath();
        ctx.fill();

        // Helper to draw fingers
        const fingers = [
            [1, 2, 3, 4], // Thumb
            [5, 6, 7, 8], // Index
            [9, 10, 11, 12], // Middle
            [13, 14, 15, 16], // Ring
            [17, 18, 19, 20], // Pinky
        ];

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        fingers.forEach((indices, fIndex) => {
            // Base thickness depends on finger (Thumb is thicker)
            let baseThickness = fIndex === 0 ? 25 : 20;

            // Draw segments with tapering thickness
            for (let i = 0; i < indices.length - 1; i++) {
                const start = toPixel(landmarks[indices[i]], width, height);
                const end = toPixel(landmarks[indices[i + 1]], width, height);

                ctx.strokeStyle = theme.connectorColor;
                // Taper thickness: gets thinner towards the tip
                ctx.lineWidth = baseThickness - i * 4;

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }

            // Draw Joints (Knuckles) for smoother look
            indices.forEach((idx, jIndex) => {
                const p = toPixel(landmarks[idx], width, height);
                ctx.fillStyle = theme.landmarkColor;
                ctx.beginPath();
                // Joint size matches segment thickness roughly
                let radius = (baseThickness - jIndex * 3) / 2;
                if (radius < 4) radius = 4;
                ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }

    async function startCamera() {
        if (activeLesson && videoElement) {
            try {
                camera = new Camera(videoElement, {
                    onFrame: async () => {
                        await hands.send({ image: videoElement });
                    },
                    width: 640,
                    height: 480,
                });
                await camera.start();
                isCameraRunning = true;

                // Also draw the illustration static hand
                drawIllustration(activeLesson.title);
            } catch (e) {
                console.error("Camera error:", e);
                alert(
                    "Không thể truy cập Camera. Vui lòng kiểm tra quyền truy cập.",
                );
            }
        }
    }

    // This function simulates drawing a perfect hand pose for the lesson
    function drawIllustration(lessonTitle) {
        if (!illustrationCanvas) return;
        const ctx = illustrationCanvas.getContext("2d");
        ctx.fillStyle = "#faf4ed"; // Surface color
        ctx.fillRect(0, 0, illustrationCanvas.width, illustrationCanvas.height);

        // In a real app, you would define 21 points for each letter.
        // For this demo, I'll draw a generic "Hand" placeholder using logic,
        // because hardcoding 21 points * 26 letters is too much code for this step.
        // I will draw a visual representation of a hand skeleton to match the style.

        const centerX = illustrationCanvas.width / 2;
        const centerY = illustrationCanvas.height / 2 + 50;

        // Draw a simulated "Skeleton" hand standing upright
        ctx.strokeStyle = theme.connectorColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";

        // Wrist to Middle Finger (Base)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 80);
        ctx.lineTo(centerX, centerY - 50);
        ctx.stroke();

        // Thumb
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 50);
        ctx.lineTo(centerX - 60, centerY - 10);
        ctx.stroke();

        // Index
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - 30, centerY - 80);
        ctx.stroke();

        // Ring
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 30, centerY - 80);
        ctx.stroke();

        // Pinky
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 20);
        ctx.lineTo(centerX + 50, centerY - 40);
        ctx.stroke();

        // Draw Joints
        ctx.fillStyle = theme.landmarkColor;
        [
            { x: centerX, y: centerY + 80 },
            { x: centerX, y: centerY },
            { x: centerX, y: centerY - 50 },
        ].forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function selectLesson(lesson) {
        activeLesson = lesson;
        // Wait for DOM update then start camera
        setTimeout(() => {
            startCamera();
        }, 100);
    }

    function closeLesson() {
        if (camera) camera.stop();
        isCameraRunning = false;
        activeLesson = null;
        handDetected = false;
    }
</script>

<div class="max-w-7xl mx-auto px-6 py-12">
    {#if mounted}
        <div
            in:fade={{ duration: 600 }}
            class="flex flex-col lg:flex-row gap-10"
        >
            <!-- Sidebar / Categories -->
            <aside
                class="w-full lg:w-72 lg:h-[calc(100vh-100px)] lg:sticky lg:top-24 space-y-8 flex flex-col"
            >
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-rose-text">
                        <i class="bx bx-book-reader mr-2"></i>Học tập
                    </h2>
                    <div
                        class="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar"
                    >
                        {#each categories as cat}
                            <button
                                onclick={() => (selectedCategory = cat.name)}
                                class="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 {selectedCategory ===
                                cat.name
                                    ? 'bg-iris text-white shadow-lg shadow-iris/20'
                                    : 'bg-surface text-muted hover:bg-overlay/60 hover:text-rose-text border border-overlay'}"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl"
                                        ><i class="bx {cat.icon}"></i></span
                                    >
                                    <span class="font-medium">{cat.name}</span>
                                </div>
                                <span class="text-xs opacity-60 font-bold"
                                    >{cat.count}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Stats Card -->
                <div
                    class="glass p-6 rounded-3xl border border-iris/20 space-y-4 mt-auto"
                >
                    <h3 class="font-bold text-rose-text">Tiến độ của bạn</h3>
                    <div class="space-y-2">
                        <div
                            class="flex justify-between text-xs text-muted mb-1"
                        >
                            <span>Hoàn thành 12/80 bài</span>
                            <span>15%</span>
                        </div>
                        <div
                            class="w-full h-2 bg-overlay rounded-full overflow-hidden"
                        >
                            <div class="w-[15%] h-full bg-iris"></div>
                        </div>
                    </div>
                    <button
                        class="w-full py-3 text-xs font-bold text-iris bg-iris/10 rounded-xl hover:bg-iris/20 transition-colors"
                    >
                        Xem thống kê chi tiết
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 space-y-8 min-w-0">
                {#if activeLesson}
                    <!-- Study Mode: Split Panel -->
                    <div in:fly={{ y: 20, duration: 500 }} class="space-y-6">
                        <!-- Navigation Header -->
                        <div class="flex items-center gap-4">
                            <button
                                onclick={closeLesson}
                                class="w-10 h-10 rounded-xl bg-surface border border-overlay flex items-center justify-center hover:bg-iris hover:text-white transition-all shadow-sm"
                            >
                                <i class="bx bx-left-arrow-alt text-2xl"></i>
                            </button>
                            <div>
                                <h1 class="text-2xl font-black text-rose-text">
                                    {activeLesson.title}
                                </h1>
                                <span
                                    class="text-xs text-muted font-bold uppercase tracking-widest"
                                    >{activeLesson.difficulty} • {activeLesson.duration}</span
                                >
                            </div>
                        </div>

                        <!-- Split Panels -->
                        <div
                            class="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[600px]"
                        >
                            <!-- Left Panel: Illustration (Teacher) -->
                            <div
                                class="bg-surface rounded-[2.5rem] border border-overlay overflow-hidden flex flex-col shadow-sm"
                            >
                                <div
                                    class="p-6 border-b border-overlay flex items-center justify-between bg-white/50 backdrop-blur"
                                >
                                    <h3
                                        class="font-bold text-rose-text flex items-center gap-2"
                                    >
                                        <i class="bx bx-image"></i> Minh họa
                                    </h3>
                                </div>
                                <div
                                    class="flex-1 relative bg-white p-6 flex items-center justify-center"
                                >
                                    <div
                                        class="absolute inset-0 pattern-grid opacity-5 pointer-events-none"
                                    ></div>

                                    <!-- AI Illustration Image -->
                                    <img 
                                        src="/ai_hand_sign.png" 
                                        alt="AI Hand Illustration" 
                                        class="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none"
                                    />

                                    <!-- Use Canvas to draw simulated landmarks -->
                                    <canvas
                                        bind:this={illustrationCanvas}
                                        width="400"
                                        height="400"
                                        class="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl bg-surface/50 relative z-10"
                                    ></canvas>

                                    <div
                                        class="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-overlay shadow-lg"
                                    >
                                        <p
                                            class="text-sm text-subtle leading-relaxed"
                                        >
                                            <span class="font-bold text-iris"
                                                >Hướng dẫn:</span
                                            >
                                            {activeLesson.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Panel: Camera (Student) -->
                            <div
                                class="bg-black rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-xl"
                            >
                                <div
                                    class="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10"
                                >
                                    <div
                                        class="w-2 h-2 rounded-full {handDetected
                                            ? 'bg-green-500 animate-pulse'
                                            : 'bg-red-500'}"
                                    ></div>
                                    {handDetected
                                        ? "Đã nhận diện tay"
                                        : "Đưa tay vào khung hình"}
                                </div>

                                <!-- Video can be hidden or shown. For ghost mode, we just hide it visually but keep it for input -->
                                <video
                                    bind:this={videoElement}
                                    class="absolute inset-0 opacity-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
                                    playsinline
                                ></video>
                                <canvas
                                    bind:this={canvasElement}
                                    width="640"
                                    height="480"
                                    class="w-full h-full object-cover transform -scale-x-100 z-10"
                                ></canvas>

                                {#if !isCameraRunning}
                                    <div
                                        class="absolute inset-0 flex items-center justify-center bg-gray-900 z-30"
                                    >
                                        <div class="text-center space-y-4">
                                            <i
                                                class="bx bx-loader-alt animate-spin text-4xl text-iris"
                                            ></i>
                                            <p
                                                class="text-white text-sm font-bold opacity-70"
                                            >
                                                Đang khởi động Camera AI...
                                            </p>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Feedback Panel -->
                        <div
                            class="bg-iris text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-iris/20 relative overflow-hidden"
                        >
                            <div
                                class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                            ></div>

                            <div class="relative z-10">
                                <h4 class="font-bold text-lg mb-1">
                                    Thực hành ngay!
                                </h4>
                                <p class="text-white/80 text-sm">
                                    Hãy mô phỏng động tác tay giống hình minh
                                    họa. AI sẽ tự động chấm điểm.
                                </p>
                            </div>
                            <button
                                class="relative z-10 px-6 py-3 bg-white text-iris font-black rounded-xl hover:scale-105 transition-transform shadow-lg"
                            >
                                Kiểm tra
                            </button>
                        </div>
                    </div>
                {:else}
                    <!-- List View -->
                    <div>
                        <header class="mb-8">
                            <h1 class="text-4xl font-black text-rose-text mb-2">
                                Thư viện Kí hiệu
                            </h1>
                            <p class="text-subtle">
                                Chọn bài học để bắt đầu luyện tập với AI.
                            </p>
                        </header>

                        <!-- Search & Filter not implemented for brevity, assume simple grid -->

                        <div
                            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {#each lessons.filter((l) => l.category === selectedCategory) as lesson, i}
                                <button
                                    in:fly={{ y: 20, delay: i * 50 }}
                                    class="group bg-surface p-6 rounded-[2rem] border border-overlay hover:border-iris/40 hover:shadow-2xl hover:shadow-iris/5 transition-all duration-500 cursor-pointer text-left w-full relative overflow-hidden"
                                    onclick={() => selectLesson(lesson)}
                                >
                                    <div
                                        class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500"
                                    >
                                        <i
                                            class="bx {categories.find(
                                                (c) =>
                                                    c.name === selectedCategory,
                                            )?.icon ||
                                                'bx-book'} text-8xl text-iris"
                                        ></i>
                                    </div>

                                    <div class="relative z-10">
                                        <div
                                            class="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4 text-iris border border-overlay"
                                        >
                                            {lesson.title[7] || lesson.title[0]}
                                        </div>

                                        <h3
                                            class="text-xl font-bold text-rose-text group-hover:text-iris transition-colors mb-1"
                                        >
                                            {lesson.title}
                                        </h3>

                                        <div
                                            class="flex items-center gap-3 text-xs font-bold text-muted mt-4"
                                        >
                                            <span
                                                class="px-2 py-1 bg-overlay rounded-lg"
                                                >{lesson.difficulty}</span
                                            >
                                            <span
                                                class="flex items-center gap-1"
                                                ><i class="bx bx-time"></i>
                                                {lesson.duration}</span
                                            >
                                        </div>
                                    </div>

                                    <div
                                        class="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-iris text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                                    >
                                        <i class="bx bx-right-arrow-alt"></i>
                                    </div>
                                </button>
                            {/each}
                        </div>

                        {#if lessons.filter((l) => l.category === selectedCategory).length === 0}
                            <div
                                class="py-20 text-center text-muted opacity-50"
                            >
                                <i class="bx bx-folder-open text-6xl mb-4"></i>
                                <p>Chưa có bài học nào trong danh mục này.</p>
                            </div>
                        {/if}
                    </div>
                {/if}
            </main>
        </div>
    {/if}
</div>

<style>
    .pattern-grid {
        background-image: radial-gradient(#404040 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.2);
    }
</style>
