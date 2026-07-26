<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade, scale } from "svelte/transition";
    import { Hands } from "@mediapipe/hands";
    import { Camera } from "@mediapipe/camera_utils";
    import { GestureEstimator } from "fingerpose";
    import { allGestureList } from "$lib/gestures.js";
    import confetti from "canvas-confetti";
    import { api } from "$lib/api.js";
    import { currentUser } from "$lib/stores/auth.js";
    import { addToast } from "$lib/stores/toast.js";
    import { speak } from "$lib/speech.js";
    import { haptic } from "$lib/stores/access.js";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let selectedCategory = $state("Bảng chữ cái");
    let activeLesson = $state(null);
    let activeLessonIdx = $state(0);
    let mode = $state("learn");
    let lessonStartTime = $state(null);

    let videoElement, canvasElement;
    let camera, hands, gestureEstimator;
    let isCameraRunning = $state(false);
    let handDetected = $state(false);
    let cameraError = $state(false);

    let detectedLetter = $state(null);
    let stableBuffer = [];
    const STABLE_FRAMES = 8;
    let cooldown = false;
    let autoSkipTimer = null;
    const AUTO_SKIP_DELAY = 1800;

    let totalScore = $state(0);
    let streak = $state(0);
    let lastPoints = $state(0);
    let completedSet = $state(new Set());
    let showCorrect = $state(false);
    let showComplete = $state(false);

    let lockedLessons = $state(new Set());
    let lockedCategories = $state(new Set());

    const categories = [
        { name: "Bảng chữ cái", icon: "bx-font", count: 26 },
        { name: "Số đếm", icon: "bx-hash", count: 10 },
        { name: "Chào hỏi", icon: "bx-hand", count: 3 },
    ];

    const signSvgMap = {};
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((l) => {
        signSvgMap[`Chữ ${l}`] = `/handsigns/${l}hand.svg`;
    });
    for (let n = 0; n <= 9; n++) {
        signSvgMap[`Số ${n}`] = `/handsigns/So${n}hand.svg`;
    }

    const aslDesc = {
        A: "Nắm bàn tay, ngón cái sát cạnh ngón trỏ.",
        B: "Giơ thẳng 4 ngón, gập ngón cái vào lòng bàn tay.",
        C: "Cong các ngón tạo hình chữ C.",
        D: "Chỉ ngón trỏ lên, các ngón còn lại chạm ngón cái.",
        E: "Gập tất cả ngón vào trong, ngón cái gập dưới.",
        F: "Ngón cái chạm ngón trỏ thành vòng, 3 ngón còn lại giơ thẳng.",
        G: "Ngón trỏ và ngón cái song song chỉ ngang.",
        H: "Ngón trỏ và ngón giữa song song chỉ ngang.",
        I: "Chỉ ngón út lên, các ngón còn lại nắm lại.",
        J: "Vẽ chữ J bằng ngón út.",
        K: "Ngón trỏ lên, ngón giữa chéo ra, ngón cái ở giữa.",
        L: "Ngón cái và ngón trỏ tạo góc vuông hình L.",
        M: "Gập 3 ngón trên ngón cái.",
        N: "Gập 2 ngón trước lên ngón cái.",
        O: "Tất cả ngón cong tròn chạm ngón cái.",
        P: "Giống K nhưng chỉ xuống.",
        Q: "Giống G nhưng chỉ xuống.",
        R: "Ngón trỏ và giữa chéo nhau.",
        S: "Nắm tay, ngón cái nằm trên.",
        T: "Ngón cái ở giữa ngón trỏ và giữa.",
        U: "Ngón trỏ và giữa giơ thẳng sát nhau.",
        V: "Ngón trỏ và giữa xòe ra hình V.",
        W: "Ngón trỏ, giữa, áp xòe ra hình W.",
        X: "Ngón trỏ móc còng lại.",
        Y: "Ngón cái và ngón út giơ ra.",
        Z: "Vẽ chữ Z bằng ngón trỏ.",
    };
    const numDesc = {
        0: "Cong các ngón tạo hình tròn, không chạm ngón cái.",
        1: "Chỉ ngón trỏ thẳng lên, các ngón khác nắm lại.",
        2: "Ngón trỏ và giữa xòe thẳng lên hình chữ V.",
        3: "Ngón cái, trỏ và giữa giơ thẳng lên.",
        4: "Bốn ngón (trừ ngón cái) giơ thẳng và xòe đều.",
        5: "Xòe cả bàn tay, năm ngón thẳng và tách rời.",
        6: "Ngón cái chạm ngón út, ba ngón còn lại giơ thẳng.",
        7: "Ngón cái chạm ngón áp út, các ngón còn lại giơ thẳng.",
        8: "Ngón cái chạm ngón giữa, các ngón còn lại giơ thẳng.",
        9: "Ngón cái chạm ngón trỏ, các ngón còn lại giơ thẳng.",
    };

    const allLessons = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        .split("")
        .map((l, i) => ({
            id: i + 1,
            title: `Chữ ${l}`,
            targetLetter: l,
            difficulty: "Cơ bản",
            category: "Bảng chữ cái",
            description: aslDesc[l] ?? `Ký hiệu ASL cho chữ ${l}.`,
        }))
        .concat(
            Array.from({ length: 10 }, (_, n) => ({
                id: 100 + n,
                title: `Số ${n}`,
                targetLetter: String(n),
                difficulty: "Cơ bản",
                category: "Số đếm",
                description: numDesc[n] ?? `Ký hiệu số ${n}.`,
            })),
        )
        .concat([
            { id: 27, title: "Xin chào", targetLetter: null, difficulty: "Trung bình", category: "Chào hỏi", description: "Đưa tay lên trán và vẫy nhẹ ra ngoài." },
            { id: 28, title: "Cảm ơn", targetLetter: null, difficulty: "Cơ bản", category: "Chào hỏi", description: "Đưa bàn tay từ miệng ra phía trước." },
            { id: 29, title: "Xin lỗi", targetLetter: null, difficulty: "Cơ bản", category: "Chào hỏi", description: "Nắm tay, xoay tròn trước ngực." },
        ]);

    let filteredLessons = $derived(allLessons.filter((l) => l.category === selectedCategory));

    function isLocked(title) {
        return lockedLessons.has(title);
    }
    function isCatLocked(name) {
        return lockedCategories.has(name);
    }

    async function fetchProgress() {
        if (!$currentUser) return;
        try {
            const data = await api.get("/sign-language/progress");
            if (Array.isArray(data)) completedSet = new Set(data.map((p) => p.lesson_title));
        } catch (e) {
            console.error("Fetch progress failed", e);
        }
    }

    async function saveProgress(lesson, scoreVal) {
        if (!$currentUser) return;
        const timeSpent = lessonStartTime ? Math.floor((Date.now() - lessonStartTime) / 1000) : 0;
        try {
            await api.post("/sign-language/progress", {
                lesson_title: lesson.title,
                category: lesson.category,
                score: scoreVal,
                time_spent: timeSpent,
                accuracy: Math.min(100, scoreVal),
            });
        } catch (e) {
            console.error("Save progress failed", e);
        }
    }

    async function fetchLocks() {
        try {
            const data = await api.get("/sign-language/locks");
            const newLockedLessons = new Set();
            const newLockedCats = new Set();
            data.forEach((l) => {
                if (l.target_type === "lesson") newLockedLessons.add(l.target_name);
                else newLockedCats.add(l.target_name);
            });
            lockedLessons = newLockedLessons;
            lockedCategories = newLockedCats;
        } catch (e) {
            console.error("Fetch locks failed", e);
        }
    }

    onMount(() => {
        mounted = true;
        gestureEstimator = new GestureEstimator(allGestureList);
        initMediaPipe();
        fetchProgress();
        fetchLocks();
    });

    onDestroy(() => {
        if (camera) camera.stop();
    });

    function initMediaPipe() {
        hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
        hands.onResults(onResults);
    }

    function onResults(results) {
        if (!canvasElement) return;
        const ctx = canvasElement.getContext("2d");
        ctx.save();
        ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        ctx.fillStyle = "rgba(25,23,36,0.82)";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks?.length > 0) {
            handDetected = true;
            drawHand(ctx, results.multiHandLandmarks[0]);
            const keypoints = results.multiHandLandmarks[0].map((lm) => [lm.x * canvasElement.width, lm.y * canvasElement.height, lm.z * canvasElement.width]);
            try {
                const est = gestureEstimator.estimate(keypoints, 8);
                if (est.gestures.length > 0) {
                    const best = est.gestures.reduce((a, b) => (a.score > b.score ? a : b));
                    processDetection(best.name.toUpperCase());
                } else {
                    stableBuffer = [];
                    detectedLetter = null;
                }
            } catch {}
        } else {
            handDetected = false;
            stableBuffer = [];
            detectedLetter = null;
        }
        ctx.restore();
    }

    function processDetection(letter) {
        if (cooldown) return;
        stableBuffer.push(letter);
        if (stableBuffer.length > STABLE_FRAMES) stableBuffer.shift();
        const stable = stableBuffer.length === STABLE_FRAMES && stableBuffer.every((l) => l === stableBuffer[0]);
        if (!stable) {
            if (autoSkipTimer) { clearTimeout(autoSkipTimer); autoSkipTimer = null; }
            return;
        }
        detectedLetter = letter;

        if (mode === "learn" && activeLesson?.targetLetter) {
            if (letter === activeLesson.targetLetter && !completedSet.has(activeLesson.title)) {
                if (!autoSkipTimer) autoSkipTimer = setTimeout(() => onCorrectSign(), AUTO_SKIP_DELAY);
            } else if (autoSkipTimer) {
                clearTimeout(autoSkipTimer);
                autoSkipTimer = null;
            }
        }
    }

    function onCorrectSign() {
        if (autoSkipTimer) { clearTimeout(autoSkipTimer); autoSkipTimer = null; }
        cooldown = true;
        stableBuffer = [];
        const pts = 100 + streak * 25;
        totalScore += pts;
        lastPoints = pts;
        streak++;
        completedSet = new Set([...completedSet, activeLesson.title]);
        showCorrect = true;
        haptic([20, 40, 20]);
        speak(`Chính xác! Cộng ${pts} điểm.`);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.55 }, colors: ["#eb6f92", "#f6c177", "#9ccfd8", "#c4a7e7"] });
        saveProgress(activeLesson, pts);

        setTimeout(() => {
            showCorrect = false;
            const avail = filteredLessons.filter((l) => !isLocked(l.title));
            const nextIdx = activeLessonIdx + 1;
            if (nextIdx < avail.length) {
                activeLessonIdx = nextIdx;
                activeLesson = avail[nextIdx];
                cooldown = false;
                detectedLetter = null;
            } else {
                cooldown = false;
                showComplete = true;
                speak(`Bạn đã hoàn thành danh mục ${selectedCategory}!`);
            }
        }, 800);
    }

    function confirmWordSign() {
        if (cooldown || !activeLesson || activeLesson.targetLetter || completedSet.has(activeLesson.title)) return;
        onCorrectSign();
    }

    async function startCamera() {
        if (!videoElement) return;
        cameraError = false;
        try {
            camera = new Camera(videoElement, {
                onFrame: async () => await hands.send({ image: videoElement }),
                width: 480,
                height: 480,
            });
            await camera.start();
            isCameraRunning = true;
        } catch {
            cameraError = true;
            addToast({ type: "error", message: "Không thể truy cập Camera. Vui lòng cấp quyền camera." });
        }
    }

    function stopCamera() {
        camera?.stop();
        isCameraRunning = false;
        handDetected = false;
        detectedLetter = null;
    }

    function selectLesson(lesson, idx) {
        if (isLocked(lesson.title)) {
            addToast({ type: "info", message: "Bài học này đang được cập nhật." });
            return;
        }
        activeLesson = lesson;
        activeLessonIdx = idx;
        mode = "learn";
        showComplete = false;
        lessonStartTime = Date.now();
        haptic(10);
        speak(`${lesson.title}. ${lesson.description}`);
        setTimeout(startCamera, 100);
    }

    function closeActive() {
        if (autoSkipTimer) { clearTimeout(autoSkipTimer); autoSkipTimer = null; }
        stopCamera();
        activeLesson = null;
        showComplete = false;
    }

    function toPixel(lm, w, h) {
        return { x: lm.x * w, y: lm.y * h };
    }

    function drawHand(ctx, landmarks) {
        const w = ctx.canvas.width, h = ctx.canvas.height;
        [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]].forEach((idxs, fi) => {
            const base = fi === 0 ? 20 : 16;
            for (let i = 0; i < idxs.length - 1; i++) {
                const s = toPixel(landmarks[idxs[i]], w, h), e = toPixel(landmarks[idxs[i + 1]], w, h);
                ctx.strokeStyle = "#eb6f92";
                ctx.lineWidth = Math.max(base - i * 4, 5);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(e.x, e.y);
                ctx.stroke();
            }
            idxs.forEach((idx, ji) => {
                const p = toPixel(landmarks[idx], w, h);
                ctx.fillStyle = "#31748f";
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max((base - ji * 2) / 2, 3), 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }
</script>

{#if showComplete}
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-6" in:fade>
        <div class="absolute inset-0 bg-[#2c293e]/60 backdrop-blur-md"></div>
        <div class="relative bg-[#faf4ed] rounded-[2.5rem] p-8 shadow-2xl text-center space-y-5 w-full max-w-sm" in:scale={{ start: 0.85 }}>
            <div class="text-7xl animate-bounce">🎉</div>
            <h2 class="text-3xl font-black text-[#b4637a]">Xuất sắc!</h2>
            <p class="text-[#575279]">Bạn đã hoàn thành danh mục <span class="font-black text-[#907aa9]">{selectedCategory}</span>!</p>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-[#ea9d34]/10 rounded-2xl p-4">
                    <div class="text-2xl font-black text-[#ea9d34]">{totalScore}</div>
                    <div class="text-[10px] font-bold text-[#797593] uppercase">Tổng điểm</div>
                </div>
                <div class="bg-[#907aa9]/10 rounded-2xl p-4">
                    <div class="text-2xl font-black text-[#907aa9]">{streak}x</div>
                    <div class="text-[10px] font-bold text-[#797593] uppercase">Streak</div>
                </div>
            </div>
            <button onclick={closeActive} class="w-full h-14 bg-[#907aa9] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                Tiếp tục học →
            </button>
        </div>
    </div>
{/if}

<div class="space-y-4 pb-4">
    {#if mounted}
        {#if activeLesson}
            <div in:fly={{ y: 20, duration: 400 }} class="space-y-4">
                <div class="flex items-center gap-3">
                    <button onclick={closeActive} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
                        <i class="bx bx-left-arrow-alt text-2xl"></i>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-xl font-black text-[#2c293e] truncate">{activeLesson.title}</h1>
                        <span class="text-[10px] text-[#797593] font-bold uppercase">{activeLessonIdx + 1} / {filteredLessons.filter((l) => !isLocked(l.title)).length}</span>
                    </div>
                    {#if showCorrect}
                        <div in:scale class="px-3 py-1.5 bg-[#286983] text-white text-xs font-black rounded-full flex-shrink-0">✓ +{lastPoints}đ</div>
                    {/if}
                </div>

                <div class="w-full h-2 bg-[#f2e9e1] rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-[#907aa9] to-[#ea9d34] transition-all duration-500" style="width:{(activeLessonIdx / Math.max(filteredLessons.filter((l) => !isLocked(l.title)).length, 1)) * 100}%"></div>
                </div>

                <div class="bg-[#fffaf3] rounded-[2rem] border-2 {showCorrect ? 'border-[#286983]' : 'border-[#f2e9e1]'} p-5 space-y-3 transition-colors">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-[#2c293e] text-sm flex items-center gap-2"><i class="bx bx-image text-[#907aa9]"></i> Minh họa</h3>
                        <button onclick={() => speak(activeLesson.description, { force: true })} class="w-9 h-9 rounded-xl bg-[#907aa9]/10 text-[#907aa9] flex items-center justify-center" aria-label="Nghe mô tả">
                            <i class="bx bx-volume-full text-lg"></i>
                        </button>
                    </div>
                    <div class="flex items-center justify-center h-40">
                        {#if signSvgMap[activeLesson.title]}
                            {#key activeLesson.title}
                                <img in:fly={{ y: 10 }} src={signSvgMap[activeLesson.title]} alt={activeLesson.title} class="h-full object-contain" />
                            {/key}
                        {:else}
                            <i class="bx bx-hand text-7xl text-[#907aa9]/30"></i>
                        {/if}
                    </div>
                    <p class="text-sm text-[#575279] bg-[#f2e9e1]/50 p-3 rounded-xl">{activeLesson.description}</p>
                </div>

                <div class="bg-[#2c293e] rounded-[2rem] overflow-hidden relative aspect-square shadow-xl">
                    <div class="absolute top-4 left-4 z-20 bg-[#2c293e]/60 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-bold text-white flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full {handDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}"></div>
                        {handDetected ? "Đang nhận diện" : "Đưa tay vào khung"}
                    </div>
                    {#if detectedLetter}
                        <div class="absolute top-4 right-4 z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white {detectedLetter === activeLesson.targetLetter ? 'bg-green-500' : 'bg-[#907aa9]/80'}">
                            {detectedLetter}
                        </div>
                    {/if}
                    <video bind:this={videoElement} class="absolute inset-0 opacity-0 w-full h-full object-cover -scale-x-100" playsinline></video>
                    <canvas bind:this={canvasElement} width="480" height="480" class="w-full h-full object-cover -scale-x-100"></canvas>

                    {#if !isCameraRunning}
                        <div class="absolute inset-0 flex items-center justify-center bg-neutral-900 z-30">
                            {#if cameraError}
                                <div class="text-center space-y-3 px-6">
                                    <i class="bx bx-camera-off text-4xl text-[#b4637a]"></i>
                                    <p class="text-white text-sm">Không thể truy cập Camera.</p>
                                    <button onclick={startCamera} class="px-5 py-2.5 bg-[#907aa9] text-white text-xs font-black rounded-xl min-h-[44px]">Thử lại</button>
                                </div>
                            {:else}
                                <div class="text-center space-y-2">
                                    <i class="bx bx-loader-alt animate-spin text-3xl text-[#907aa9]"></i>
                                    <p class="text-white text-xs">Đang khởi động Camera AI...</p>
                                </div>
                            {/if}
                        </div>
                    {/if}

                    {#if activeLesson.targetLetter}
                        <div class="absolute bottom-4 left-4 right-4 z-20 bg-[#2c293e]/60 backdrop-blur text-white text-xs text-center py-2 px-3 rounded-xl">
                            Thực hiện ký hiệu <span class="font-black text-[#ea9d34]">"{activeLesson.title.split(" ").pop()}"</span>
                        </div>
                    {:else}
                        <div class="absolute bottom-4 left-4 right-4 z-20 space-y-2">
                            <p class="bg-[#2c293e]/60 backdrop-blur text-white text-[11px] text-center py-2 px-3 rounded-xl">
                                Ký hiệu chuyển động — tự đánh giá sau khi làm đúng
                            </p>
                            <button onclick={confirmWordSign} disabled={cooldown} class="w-full h-12 bg-[#ea9d34] text-white font-black rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 min-h-[48px]">
                                <i class="bx bx-check mr-1"></i> Tôi đã làm đúng
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="space-y-4">
                <header class="glass rounded-3xl p-5 border-2 border-[#f2e9e1] space-y-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-xl font-black text-[#2c293e]">Học Ký Hiệu</h1>
                            <p class="text-xs text-[#575279] mt-0.5">Camera AI tự nhận diện</p>
                        </div>
                        <a href="/sign-language/leaderboard" class="px-3 py-2 bg-[#ea9d34]/10 text-[#ea9d34] rounded-xl text-xs font-bold border border-[#ea9d34]/20 flex items-center gap-1.5 min-h-[44px]">
                            <i class="bx bx-trophy"></i> Xếp hạng
                        </a>
                    </div>
                    <div class="flex gap-3">
                        <div class="flex-1 bg-[#fffaf3] rounded-2xl p-3 text-center border border-[#f2e9e1]">
                            <div class="text-xl font-black text-[#ea9d34]">{totalScore}</div>
                            <div class="text-[9px] text-[#797593] uppercase font-bold">Điểm</div>
                        </div>
                        <div class="flex-1 bg-[#fffaf3] rounded-2xl p-3 text-center border border-[#f2e9e1]">
                            <div class="text-xl font-black text-[#907aa9]">{streak}</div>
                            <div class="text-[9px] text-[#797593] uppercase font-bold">Streak</div>
                        </div>
                        <div class="flex-1 bg-[#fffaf3] rounded-2xl p-3 text-center border border-[#f2e9e1]">
                            <div class="text-xl font-black text-[#286983]">{completedSet.size}</div>
                            <div class="text-[9px] text-[#797593] uppercase font-bold">Hoàn thành</div>
                        </div>
                    </div>
                </header>

                <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Danh mục bài học">
                    {#each categories as cat}
                        {@const catLocked = isCatLocked(cat.name)}
                        <button
                            role="tab"
                            aria-selected={selectedCategory === cat.name}
                            onclick={() => { if (catLocked) { addToast({ type: "info", message: "Danh mục đang được cập nhật." }); return; } selectedCategory = cat.name; }}
                            class="flex-shrink-0 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 min-h-[52px] transition-all border-2
                            {selectedCategory === cat.name ? 'bg-[#907aa9] text-white border-[#907aa9]' : catLocked ? 'bg-[#fffaf3] text-[#797593] border-dashed border-[#f2e9e1]' : 'bg-[#fffaf3] text-[#575279] border-[#f2e9e1]'}"
                        >
                            <i class="bx {catLocked ? 'bx-lock' : cat.icon}"></i> {cat.name}
                        </button>
                    {/each}
                </div>

                {#if isCatLocked(selectedCategory)}
                    <div class="py-16 text-center space-y-4 glass rounded-3xl border border-[#f2e9e1]">
                        <i class="bx bx-wrench text-5xl text-[#b4637a]/50"></i>
                        <p class="text-[#575279] font-bold">Danh mục đang được cập nhật</p>
                    </div>
                {:else}
                    <div class="grid grid-cols-2 gap-3">
                        {#each filteredLessons as lesson, i}
                            {@const locked = isLocked(lesson.title)}
                            {@const done = completedSet.has(lesson.title)}
                            <button
                                in:fly={{ y: 15, delay: i * 25 }}
                                onclick={() => selectLesson(lesson, i)}
                                class="relative bg-[#fffaf3] rounded-2xl border-2 p-4 text-left min-h-[110px] flex flex-col justify-between transition-all
                                {locked ? 'opacity-50 border-[#f2e9e1]' : done ? 'border-[#286983]/50' : 'border-[#f2e9e1]'}"
                            >
                                <div class="h-9 w-9 rounded-xl flex items-center justify-center text-base font-black border {done ? 'bg-[#286983]/10 text-[#286983] border-[#286983]/30' : 'bg-[#f2e9e1] text-[#907aa9] border-[#f2e9e1]'}">
                                    {done ? "✓" : lesson.title.split(" ").pop()}
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold {locked ? 'text-[#797593]' : done ? 'text-[#286983]' : 'text-[#2c293e]'} truncate">{lesson.title}</h3>
                                    {#if locked}<span class="text-[9px] text-[#797593]">Đã khóa</span>{/if}
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
