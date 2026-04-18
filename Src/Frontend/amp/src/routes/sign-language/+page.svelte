<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade, scale } from "svelte/transition";
    import { Hands } from "@mediapipe/hands";
    import { Camera } from "@mediapipe/camera_utils";
    import { GestureEstimator } from "fingerpose";
    import { gestureList } from "$lib/gestures.js";
    import confetti from "canvas-confetti";

    const API_BASE = "http://localhost:6333/api/sign-language";

    function getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    // ── Core state ─────────────────────────────────────────────────────────────
    let mounted = $state(false);
    let selectedCategory = $state("Bảng chữ cái");
    let activeLesson = $state(null);
    let activeLessonIdx = $state(0);
    let mode = $state("learn");
    let currentUser = $state(null);
    let lessonStartTime = $state(null);

    let videoElement, canvasElement;
    let camera, hands, gestureEstimator;
    let isCameraRunning = $state(false);
    let handDetected = $state(false);

    // ── Recognition ────────────────────────────────────────────────────────────
    let detectedLetter = $state(null);
    let stableBuffer = [];
    const STABLE_FRAMES = 8;
    let cooldown = false;
    let autoSkipTimer = null;
    const AUTO_SKIP_DELAY = 2000; // 2 seconds

    // ── Scoring ────────────────────────────────────────────────────────────────
    let totalScore = $state(0);
    let streak = $state(0);
    let lastPoints = $state(0);
    let completedSet = $state(new Set());
    let showCorrect = $state(false);
    let showComplete = $state(false);

    // ── Practice mode ─────────────────────────────────────────────────────────
    const WORDS = [
        "HOA",
        "CAY",
        "NHA",
        "CON",
        "BAN",
        "ANH",
        "HOC",
        "CAM",
        "TAY",
        "MAT",
        "SACH",
        "LOP",
        "VIET",
        "DOC",
        "BIEN",
    ];
    let practiceWord = $state("");
    let currentIdx = $state(0);
    let typedLetters = $state([]);
    let practiceScore = $state(0);
    let practiceCombo = $state(0);
    let practiceFeedback = $state(null);

    // ── Database & API ────────────────────────────────────────────────────────
    async function fetchProgress() {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE}/progress`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                completedSet = new Set(data.map((p) => p.lesson_title));
                // Add scores if needed
            }
        } catch (e) {
            console.error("Fetch progress failed", e);
        }
    }

    async function saveProgress(lesson, scoreVal) {
        if (!currentUser) return;
        const timeSpent = lessonStartTime
            ? Math.floor((Date.now() - lessonStartTime) / 1000)
            : 0;
        const accuracy = Math.min(100, scoreVal); // Assuming score is out of 100

        try {
            await fetch(`${API_BASE}/progress`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    lesson_title: lesson.title,
                    category: lesson.category,
                    score: scoreVal,
                    time_spent: timeSpent,
                    accuracy: accuracy,
                }),
            });
        } catch (e) {
            console.error("Save progress failed", e);
        }
    }

    async function fetchLocks() {
        try {
            const res = await fetch(`${API_BASE}/locks`);
            if (res.ok) {
                const data = await res.json();
                const newLockedLessons = new Set();
                const newLockedCats = new Set();
                data.forEach((l) => {
                    if (l.target_type === "lesson")
                        newLockedLessons.add(l.target_name);
                    else newLockedCats.add(l.target_name);
                });
                lockedLessons = newLockedLessons;
                lockedCategories = newLockedCats;
            }
        } catch (e) {
            console.error("Fetch locks failed", e);
        }
    }

    async function toggleRemoteLock(type, name) {
        if (currentUser?.role !== "admin") return;
        try {
            const res = await fetch(`${API_BASE}/locks/toggle`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ target_type: type, target_name: name }),
            });
            if (res.ok) fetchLocks();
        } catch (e) {
            console.error("Toggle lock failed", e);
        }
    }

    function isLocked(title) {
        return lockedLessons.has(title);
    }

    function toggleLock(title, e) {
        e.stopPropagation();
        toggleRemoteLock("lesson", title);
    }

    let lockedLessons = $state(new Set());
    let lockedCategories = $state(new Set());

    function isCatLocked(name) {
        return lockedCategories.has(name);
    }

    function toggleCatLock(name, e) {
        e.stopPropagation();
        toggleRemoteLock("category", name);
    }

    // ── Data ───────────────────────────────────────────────────────────────────
    const categories = [
        { name: "Bảng chữ cái", icon: "bx-font", count: 26 },
        { name: "Số đếm", icon: "bx-hash", count: 10 },
        { name: "Chào hỏi", icon: "bx-hand", count: 3 },
        { name: "Luyện tập", icon: "bx-dumbbell", count: 0 },
    ];

    const CATEGORY_NAMES = categories.map((c) => c.name);

    const signSvgMap = {
        "Chữ A": "/handsigns/Ahand.svg",
        "Chữ B": "/handsigns/Bhand.svg",
        "Chữ C": "/handsigns/Chand.svg",
        "Chữ D": "/handsigns/Dhand.svg",
        "Chữ E": "/handsigns/Ehand.svg",
        "Chữ F": "/handsigns/Fhand.svg",
        "Chữ G": "/handsigns/Ghand.svg",
        "Chữ H": "/handsigns/Hhand.svg",
        "Chữ I": "/handsigns/Ihand.svg",
        "Chữ J": "/handsigns/Jhand.svg",
        "Chữ K": "/handsigns/Khand.svg",
        "Chữ L": "/handsigns/Lhand.svg",
        "Chữ M": "/handsigns/Mhand.svg",
        "Chữ N": "/handsigns/Nhand.svg",
        "Chữ O": "/handsigns/Ohand.svg",
        "Chữ P": "/handsigns/Phand.svg",
        "Chữ Q": "/handsigns/Qhand.svg",
        "Chữ R": "/handsigns/Rhand.svg",
        "Chữ S": "/handsigns/Shand.svg",
        "Chữ T": "/handsigns/Thand.svg",
        "Chữ U": "/handsigns/Uhand.svg",
        "Chữ V": "/handsigns/Vhand.svg",
        "Chữ W": "/handsigns/Whand.svg",
        "Chữ X": "/handsigns/Xhand.svg",
        "Chữ Y": "/handsigns/Yhand.svg",
        "Chữ Z": "/handsigns/Zhand.svg",
    };

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

    const allLessons = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        .split("")
        .map((l, i) => ({
            id: i + 1,
            title: `Chữ ${l}`,
            targetLetter: l,
            difficulty: "Cơ bản",
            duration: "2 phút",
            category: "Bảng chữ cái",
            description: aslDesc[l] ?? `Ký hiệu ASL cho chữ ${l}.`,
        }))
        .concat([
            {
                id: 27,
                title: "Xin chào",
                targetLetter: null,
                difficulty: "Trung bình",
                duration: "5 phút",
                category: "Chào hỏi",
                description: "Đưa tay lên trán và vẫy nhẹ ra ngoài.",
            },
            {
                id: 28,
                title: "Cảm ơn",
                targetLetter: null,
                difficulty: "Cơ bản",
                duration: "2 phút",
                category: "Chào hỏi",
                description: "Đưa bàn tay từ miệng ra phía trước.",
            },
            {
                id: 29,
                title: "Xin lỗi",
                targetLetter: null,
                difficulty: "Cơ bản",
                duration: "2 phút",
                category: "Chào hỏi",
                description: "Nắm tay, xoay tròn trước ngực.",
            },
        ]);

    let filteredLessons = $derived(
        allLessons.filter((l) => l.category === selectedCategory),
    );

    // ── MediaPipe ──────────────────────────────────────────────────────────────
    onMount(() => {
        mounted = true;
        try {
            currentUser = JSON.parse(localStorage.getItem("user"));
        } catch {}
        gestureEstimator = new GestureEstimator(gestureList);
        initMediaPipe();
        fetchProgress();
        fetchLocks();
    });

    onDestroy(() => {
        if (camera) camera.stop();
    });

    function initMediaPipe() {
        hands = new Hands({
            locateFile: (f) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
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
        const ctx = canvasElement.getContext("2d");
        ctx.save();
        ctx.drawImage(
            results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height,
        );
        ctx.fillStyle = "rgba(25,23,36,0.82)";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks?.length > 0) {
            handDetected = true;
            drawRealisticHand(ctx, results.multiHandLandmarks[0]);

            // Scale z same as x/y for correct fingerpose angle computation
            const keypoints = results.multiHandLandmarks[0].map((lm) => [
                lm.x * canvasElement.width,
                lm.y * canvasElement.height,
                lm.z * canvasElement.width,
            ]);
            try {
                const est = gestureEstimator.estimate(keypoints, 8);
                if (est.gestures.length > 0) {
                    const best = est.gestures.reduce((a, b) =>
                        a.score > b.score ? a : b,
                    );
                    processDetection(best.name.toUpperCase(), best.score);
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
        const stable =
            stableBuffer.length === STABLE_FRAMES &&
            stableBuffer.every((l) => l === stableBuffer[0]);
        if (!stable) {
            // Clear auto-skip timer if gesture becomes unstable
            if (autoSkipTimer) {
                clearTimeout(autoSkipTimer);
                autoSkipTimer = null;
            }
            return;
        }
        detectedLetter = letter;

        if (mode === "learn" && activeLesson?.targetLetter) {
            if (
                letter === activeLesson.targetLetter &&
                !completedSet.has(activeLesson.title)
            ) {
                // Start auto-skip timer if not already running
                if (!autoSkipTimer) {
                    autoSkipTimer = setTimeout(() => {
                        onCorrectSign();
                    }, AUTO_SKIP_DELAY);
                }
            } else {
                // Clear timer if gesture is not correct
                if (autoSkipTimer) {
                    clearTimeout(autoSkipTimer);
                    autoSkipTimer = null;
                }
            }
        }
        if (mode === "practice" && practiceWord) {
            if (letter === practiceWord[currentIdx]) onPracticeCorrect();
        }
    }

    // ── Correct sign in learn mode ─────────────────────────────────────────────
    function onCorrectSign() {
        // Clear auto-skip timer
        if (autoSkipTimer) {
            clearTimeout(autoSkipTimer);
            autoSkipTimer = null;
        }

        cooldown = true;
        stableBuffer = [];
        const pts = 100 + streak * 25;
        totalScore += pts;
        lastPoints = pts;
        streak++;
        completedSet = new Set([...completedSet, activeLesson.title]);
        showCorrect = true;
        fireSmallConfetti();
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
                fireCompletionFireworks();
                showComplete = true;
            }
        }, 800);
    }

    // ── Practice mode ──────────────────────────────────────────────────────────
    function onPracticeCorrect() {
        cooldown = true;
        stableBuffer = [];
        typedLetters = [...typedLetters, practiceWord[currentIdx]];
        practiceScore += 10 + practiceCombo * 2;
        practiceCombo++;
        practiceFeedback = "correct";
        setTimeout(() => {
            practiceFeedback = null;
        }, 700);
        currentIdx++;
        if (currentIdx >= practiceWord.length) {
            fireSmallConfetti();
            setTimeout(() => {
                practiceWord = WORDS[Math.floor(Math.random() * WORDS.length)];
                currentIdx = 0;
                typedLetters = [];
                practiceCombo = 0;
                cooldown = false;
            }, 800);
        } else {
            cooldown = false;
        }
    }

    // ── Camera ─────────────────────────────────────────────────────────────────
    async function startCamera() {
        if (!videoElement) return;
        try {
            camera = new Camera(videoElement, {
                onFrame: async () => await hands.send({ image: videoElement }),
                width: 640,
                height: 480,
            });
            await camera.start();
            isCameraRunning = true;
        } catch {
            alert("Không thể truy cập Camera.");
        }
    }

    function stopCamera() {
        camera?.stop();
        isCameraRunning = false;
        handDetected = false;
        detectedLetter = null;
    }

    function selectLesson(lesson, idx) {
        if (isLocked(lesson.title)) return;
        activeLesson = lesson;
        activeLessonIdx = idx;
        mode = "learn";
        showComplete = false;
        lessonStartTime = Date.now();
        setTimeout(startCamera, 100);
    }

    function enterPractice() {
        closeActive();
        mode = "practice";
        practiceScore = 0;
        practiceCombo = 0;
        currentIdx = 0;
        typedLetters = [];
        practiceWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTimeout(startCamera, 100);
    }

    function closeActive() {
        // Clear auto-skip timer
        if (autoSkipTimer) {
            clearTimeout(autoSkipTimer);
            autoSkipTimer = null;
        }

        stopCamera();
        activeLesson = null;
        mode = "learn";
        practiceWord = "";
        showComplete = false;
    }

    // ── Confetti/Fireworks ─────────────────────────────────────────────────────
    function fireSmallConfetti() {
        confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.55 },
            colors: ["#eb6f92", "#f6c177", "#9ccfd8", "#c4a7e7"],
        });
    }

    function fireCompletionFireworks() {
        const end = Date.now() + 4500;
        const colors = [
            "#eb6f92",
            "#f6c177",
            "#9ccfd8",
            "#c4a7e7",
            "#ebbcba",
            "#31748f",
        ];
        (function frame() {
            confetti({
                particleCount: 7,
                angle: 60,
                spread: 60,
                origin: { x: 0, y: 0.6 },
                colors,
            });
            confetti({
                particleCount: 7,
                angle: 120,
                spread: 60,
                origin: { x: 1, y: 0.6 },
                colors,
            });
            confetti({
                particleCount: 4,
                angle: 90,
                spread: 100,
                origin: { x: 0.5, y: 0 },
                colors,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    }

    // ── Hand renderer ──────────────────────────────────────────────────────────
    function toPixel(lm, w, h) {
        return { x: lm.x * w, y: lm.y * h };
    }

    function drawRealisticHand(ctx, landmarks) {
        const w = ctx.canvas.width,
            h = ctx.canvas.height;
        const [pb, ti, im, pm] = [0, 1, 5, 17].map((i) =>
            toPixel(landmarks[i], w, h),
        );
        ctx.fillStyle = "rgba(235,111,146,0.45)";
        ctx.beginPath();
        ctx.moveTo(pb.x, pb.y);
        ctx.lineTo(ti.x, ti.y);
        ctx.lineTo(im.x, im.y);
        ctx.lineTo(pm.x, pm.y);
        ctx.closePath();
        ctx.fill();

        [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ].forEach((idxs, fi) => {
            const base = fi === 0 ? 26 : 21;
            for (let i = 0; i < idxs.length - 1; i++) {
                const s = toPixel(landmarks[idxs[i]], w, h),
                    e = toPixel(landmarks[idxs[i + 1]], w, h);
                ctx.strokeStyle = "#eb6f92";
                ctx.lineWidth = Math.max(base - i * 5, 6);
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
                ctx.arc(
                    p.x,
                    p.y,
                    Math.max((base - ji * 3) / 2, 4),
                    0,
                    2 * Math.PI,
                );
                ctx.fill();
            });
        });
    }
</script>

<!-- ── Completion Modal ─────────────────────────────────────────────────────── -->
{#if showComplete}
    <div class="fixed inset-0 z-[200] flex items-center justify-center" in:fade>
        <div class="absolute inset-0 bg-rose-text/50 backdrop-blur-md"></div>
        <div
            class="relative bg-white rounded-[4rem] p-14 shadow-2xl text-center space-y-6 max-w-md w-full mx-6"
            in:scale={{ start: 0.8 }}
        >
            <div class="text-8xl animate-bounce">🎉</div>
            <h2 class="text-4xl font-black text-rose-text">Xuất sắc!</h2>
            <p class="text-subtle text-lg">
                Bạn đã hoàn thành toàn bộ danh mục <span
                    class="font-black text-iris">{selectedCategory}</span
                >!
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gold/10 rounded-2xl p-4">
                    <div class="text-3xl font-black text-gold">
                        {totalScore}
                    </div>
                    <div
                        class="text-xs font-bold text-muted uppercase tracking-widest mt-1"
                    >
                        Tổng điểm
                    </div>
                </div>
                <div class="bg-iris/10 rounded-2xl p-4">
                    <div class="text-3xl font-black text-iris">{streak}x</div>
                    <div
                        class="text-xs font-bold text-muted uppercase tracking-widest mt-1"
                    >
                        Streak cao nhất
                    </div>
                </div>
            </div>
            <button
                onclick={closeActive}
                class="w-full h-14 bg-iris text-white font-black rounded-2xl shadow-xl shadow-iris/25 hover:bg-iris/80 active:scale-95 transition-all"
            >
                Tiếp tục học →
            </button>
        </div>
    </div>
{/if}

<div class="max-w-7xl mx-auto px-6 py-12">
    {#if mounted}
        <div
            in:fade={{ duration: 500 }}
            class="flex flex-col lg:flex-row gap-10"
        >
            <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
            <aside
                class="w-full lg:w-72 lg:sticky lg:top-24 lg:h-[calc(100vh-100px)] space-y-5 flex flex-col"
            >
                <div class="space-y-3">
                    <h2 class="text-2xl font-bold text-rose-text">
                        <i class="bx bx-book-reader mr-2"></i>Học tập
                    </h2>
                    <div
                        class="space-y-2 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar"
                    >
                        {#each categories as cat}
                            {@const catLocked =
                                isCatLocked(cat.name) &&
                                cat.name !== "Luyện tập"}
                            <div class="relative">
                                <button
                                    onclick={() => {
                                        if (
                                            catLocked &&
                                            currentUser?.role !== "admin"
                                        )
                                            return;
                                        if (cat.name === "Luyện tập") {
                                            enterPractice();
                                            return;
                                        }
                                        selectedCategory = cat.name;
                                        closeActive();
                                    }}
                                    class="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300
                                    {(selectedCategory === cat.name &&
                                        mode !== 'practice') ||
                                    (cat.name === 'Luyện tập' &&
                                        mode === 'practice')
                                        ? 'bg-iris text-white shadow-lg shadow-iris/20'
                                        : catLocked
                                          ? 'bg-surface text-muted border border-dashed border-overlay cursor-not-allowed opacity-60'
                                          : 'bg-surface text-muted hover:bg-overlay/60 hover:text-rose-text border border-overlay'}"
                                >
                                    <div class="flex items-center gap-3">
                                        <span class="text-2xl"
                                            ><i
                                                class="bx {catLocked
                                                    ? 'bx-lock'
                                                    : cat.icon}"
                                            ></i></span
                                        >
                                        <div class="text-left">
                                            <span class="font-medium block"
                                                >{cat.name}</span
                                            >
                                            {#if catLocked}<span
                                                    class="text-[10px] text-rose-text font-bold"
                                                    >Đang cập nhật...</span
                                                >{/if}
                                        </div>
                                    </div>
                                    {#if cat.count > 0 && !catLocked}<span
                                            class="text-xs opacity-60 font-bold"
                                            >{cat.count}</span
                                        >{/if}
                                </button>
                                <!-- Admin lock toggle for category -->
                                {#if currentUser?.role === "admin" && cat.name !== "Luyện tập"}
                                    <button
                                        onclick={(e) =>
                                            toggleCatLock(cat.name, e)}
                                        class="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all
                                        {catLocked
                                            ? 'bg-rose-text text-white'
                                            : 'bg-overlay/80 text-muted hover:bg-rose-text/20 hover:text-rose-text'}"
                                        title={catLocked
                                            ? "Mở khóa danh mục"
                                            : "Khóa danh mục"}
                                    >
                                        <i
                                            class="bx {catLocked
                                                ? 'bx-lock'
                                                : 'bx-lock-open'}"
                                        ></i>
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Score board -->
                <div
                    class="glass p-5 rounded-3xl border border-gold/20 bg-gold/5 space-y-4"
                >
                    <h3
                        class="text-xs font-black uppercase tracking-widest text-gold"
                    >
                        Bảng điểm
                    </h3>
                    <div class="flex items-end gap-3">
                        <div class="text-5xl font-black text-gold leading-none">
                            {totalScore}
                        </div>
                        {#if lastPoints && showCorrect}
                            <div
                                in:fly={{ y: -15 }}
                                class="text-green-500 font-black text-lg pb-1"
                            >
                                +{lastPoints}
                            </div>
                        {/if}
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1 bg-white rounded-xl p-2 text-center">
                            <div class="text-xl font-black text-iris">
                                {streak}
                            </div>
                            <div
                                class="text-[9px] text-muted uppercase tracking-widest font-bold"
                            >
                                Streak
                            </div>
                        </div>
                        <div class="flex-1 bg-white rounded-xl p-2 text-center">
                            <div class="text-xl font-black text-iris">
                                {completedSet.size}
                            </div>
                            <div
                                class="text-[9px] text-muted uppercase tracking-widest font-bold"
                            >
                                Hoàn thành
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live detection -->
                {#if isCameraRunning}
                    <div
                        class="glass p-5 rounded-3xl border border-iris/20 space-y-3"
                        in:fade
                    >
                        <h3
                            class="text-xs font-black uppercase tracking-widest text-iris"
                        >
                            Nhận diện
                        </h3>
                        <div class="flex items-center gap-4">
                            <div
                                class="text-6xl font-black text-iris w-16 text-center"
                            >
                                {detectedLetter ?? "?"}
                            </div>
                            <div class="flex flex-col gap-1">
                                <div
                                    class="flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <div
                                        class="w-2 h-2 rounded-full {handDetected
                                            ? 'bg-green-500 animate-pulse'
                                            : 'bg-red-400'}"
                                    ></div>
                                    {handDetected
                                        ? "Đang nhận diện"
                                        : "Chờ bàn tay..."}
                                </div>
                                {#if showCorrect}
                                    <div
                                        in:fly={{ y: -10 }}
                                        class="text-green-500 font-black text-sm"
                                    >
                                        ✓ Chính xác!
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </aside>

            <!-- ── Main ────────────────────────────────────────────────────────── -->
            <main class="flex-1 space-y-8 min-w-0">
                <!-- PRACTICE MODE -->
                {#if mode === "practice"}
                    <div in:fly={{ y: 20, duration: 400 }} class="space-y-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-black text-rose-text">
                                    Luyện tập câu
                                </h1>
                                <p class="text-sm text-subtle mt-1">
                                    Điểm: <span class="font-black text-gold"
                                        >{practiceScore}</span
                                    >
                                    | Combo:
                                    <span class="font-black text-iris"
                                        >×{practiceCombo}</span
                                    >
                                </p>
                            </div>
                            <button
                                onclick={closeActive}
                                class="w-10 h-10 rounded-xl bg-surface border border-overlay flex items-center justify-center hover:bg-rose-text hover:text-white transition-all"
                            >
                                <i class="bx bx-x text-2xl"></i>
                            </button>
                        </div>

                        <div
                            class="bg-surface rounded-[3rem] border border-overlay p-10 space-y-8"
                        >
                            <div
                                class="flex items-center justify-center gap-3 flex-wrap"
                            >
                                {#each practiceWord.split("") as char, ci}
                                    <div
                                        class="w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black transition-all duration-300
                                        {ci < currentIdx
                                            ? 'bg-green-100 text-green-600 border-2 border-green-400 scale-95'
                                            : ci === currentIdx
                                              ? 'bg-iris text-white shadow-xl shadow-iris/30 scale-110'
                                              : 'bg-white border-2 border-overlay text-muted opacity-40'}"
                                    >
                                        {ci < currentIdx ? "✓" : char}
                                    </div>
                                {/each}
                            </div>

                            {#if currentIdx < practiceWord.length}
                                <div
                                    class="flex items-center justify-center gap-10"
                                >
                                    <div class="text-center space-y-1">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-widest text-muted"
                                        >
                                            Ký hiệu tiếp theo
                                        </p>
                                        <div
                                            class="text-7xl font-black text-iris"
                                        >
                                            {practiceWord[currentIdx]}
                                        </div>
                                    </div>
                                    {#if signSvgMap[`Chữ ${practiceWord[currentIdx]}`]}
                                        <img
                                            src={signSvgMap[
                                                `Chữ ${practiceWord[currentIdx]}`
                                            ]}
                                            alt={practiceWord[currentIdx]}
                                            class="h-28 object-contain drop-shadow-lg"
                                        />
                                    {/if}
                                </div>
                                {#if practiceFeedback === "correct"}
                                    <div
                                        in:fly={{ y: -15, duration: 300 }}
                                        class="text-center text-green-500 font-black text-2xl"
                                    >
                                        ✓ Chính xác!
                                    </div>
                                {/if}
                            {:else}
                                <div
                                    in:scale
                                    class="text-center space-y-3 py-6"
                                >
                                    <div class="text-6xl">🎊</div>
                                    <p
                                        class="text-2xl font-black text-green-600"
                                    >
                                        Hoàn thành từ "{practiceWord}"!
                                    </p>
                                </div>
                            {/if}
                        </div>

                        <!-- Camera -->
                        <div
                            class="bg-black rounded-[2.5rem] overflow-hidden relative h-[380px] shadow-xl"
                        >
                            <div
                                class="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10"
                            >
                                <div
                                    class="w-2 h-2 rounded-full {handDetected
                                        ? 'bg-green-500 animate-pulse'
                                        : 'bg-red-500'}"
                                ></div>
                                {handDetected
                                    ? "Đang nhận diện"
                                    : "Đưa tay vào khung hình"}
                            </div>
                            <div
                                class="absolute top-4 right-4 z-20 w-14 h-14 rounded-2xl bg-iris/80 flex items-center justify-center text-2xl font-black text-white"
                            >
                                {detectedLetter ?? "—"}
                            </div>
                            <video
                                bind:this={videoElement}
                                class="absolute inset-0 opacity-0 w-full h-full object-cover -scale-x-100"
                                playsinline
                            ></video>
                            <canvas
                                bind:this={canvasElement}
                                width="640"
                                height="480"
                                class="w-full h-full object-cover -scale-x-100 z-10"
                            ></canvas>
                            {#if !isCameraRunning}
                                <div
                                    class="absolute inset-0 flex items-center justify-center bg-gray-900 z-30"
                                >
                                    <div class="text-center space-y-3">
                                        <i
                                            class="bx bx-loader-alt animate-spin text-4xl text-iris"
                                        ></i>
                                        <p
                                            class="text-white text-sm opacity-70"
                                        >
                                            Đang khởi động Camera AI...
                                        </p>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- LEARN MODE – lesson active -->
                {:else if activeLesson}
                    <div in:fly={{ y: 20, duration: 500 }} class="space-y-6">
                        <div class="flex items-center gap-4">
                            <button
                                onclick={closeActive}
                                class="w-10 h-10 rounded-xl bg-surface border border-overlay flex items-center justify-center hover:bg-iris hover:text-white transition-all"
                            >
                                <i class="bx bx-left-arrow-alt text-2xl"></i>
                            </button>
                            <div class="flex-1">
                                <div class="flex items-center gap-3">
                                    <h1
                                        class="text-2xl font-black text-rose-text"
                                    >
                                        {activeLesson.title}
                                    </h1>
                                    {#if showCorrect}
                                        <div
                                            in:scale
                                            class="px-3 py-1 bg-green-500 text-white text-xs font-black rounded-full"
                                        >
                                            ✓ Đúng! +{lastPoints}đ
                                        </div>
                                    {/if}
                                </div>
                                <span
                                    class="text-xs text-muted font-bold uppercase tracking-widest"
                                    >{activeLesson.difficulty} • {activeLesson.duration}</span
                                >
                            </div>
                            <!-- Lesson progress indicator -->
                            <div class="text-sm font-black text-muted">
                                {activeLessonIdx + 1} / {filteredLessons.filter(
                                    (l) => !isLocked(l.title),
                                ).length}
                            </div>
                        </div>

                        <!-- Progress bar -->
                        <div
                            class="w-full h-2 bg-overlay rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-gradient-to-r from-iris to-gold transition-all duration-500 rounded-full"
                                style="width:{(activeLessonIdx /
                                    Math.max(
                                        filteredLessons.filter(
                                            (l) => !isLocked(l.title),
                                        ).length,
                                        1,
                                    )) *
                                    100}%"
                            ></div>
                        </div>

                        <div
                            class="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[560px]"
                        >
                            <!-- Left: Illustration -->
                            <div
                                class="bg-surface rounded-[2.5rem] border {showCorrect
                                    ? 'border-green-400'
                                    : 'border-overlay'} overflow-hidden flex flex-col shadow-sm transition-colors duration-300"
                            >
                                <div
                                    class="p-5 border-b border-overlay bg-white/50 backdrop-blur flex items-center justify-between"
                                >
                                    <h3
                                        class="font-bold text-rose-text flex items-center gap-2"
                                    >
                                        <i class="bx bx-image text-iris"
                                        ></i>Minh họa
                                    </h3>
                                    {#if showCorrect}
                                        <span
                                            in:scale
                                            class="px-3 py-1 bg-green-500 text-white text-xs font-black rounded-full"
                                            >✓ Chính xác!</span
                                        >
                                    {/if}
                                </div>
                                <div
                                    class="flex-1 relative bg-white flex items-center justify-center overflow-hidden"
                                >
                                    <div
                                        class="absolute inset-0 pattern-grid opacity-5 pointer-events-none"
                                    ></div>
                                    {#if signSvgMap[activeLesson.title]}
                                        {#key activeLesson.title}
                                            <img
                                                in:fly={{
                                                    y: 20,
                                                    duration: 350,
                                                }}
                                                src={signSvgMap[
                                                    activeLesson.title
                                                ]}
                                                alt={activeLesson.title}
                                                class="w-full h-full object-contain p-8 drop-shadow-lg relative z-10"
                                            />
                                        {/key}
                                    {:else}
                                        <div
                                            class="flex flex-col items-center gap-4 opacity-30"
                                        >
                                            <i
                                                class="bx bx-hand text-8xl text-iris"
                                            ></i>
                                        </div>
                                    {/if}
                                    <div
                                        class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl border border-overlay shadow text-sm"
                                    >
                                        <span class="font-bold text-iris"
                                            >Hướng dẫn:
                                        </span>
                                        <span class="text-subtle"
                                            >{activeLesson.description}</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Camera -->
                            <div
                                class="bg-black rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-xl"
                            >
                                <div
                                    class="absolute top-5 left-5 z-20 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10"
                                >
                                    <div
                                        class="w-2 h-2 rounded-full {handDetected
                                            ? 'bg-green-500 animate-pulse'
                                            : 'bg-red-500'}"
                                    ></div>
                                    {handDetected
                                        ? "Đang nhận diện"
                                        : "Đưa tay vào khung hình"}
                                </div>
                                <!-- Detected overlay -->
                                {#if detectedLetter}
                                    <div
                                        class="absolute top-5 right-5 z-20 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl transition-colors duration-200
                                        {detectedLetter ===
                                        activeLesson.targetLetter
                                            ? 'bg-green-500 scale-110'
                                            : 'bg-iris/80'}"
                                    >
                                        {detectedLetter}
                                    </div>
                                {/if}
                                <video
                                    bind:this={videoElement}
                                    class="absolute inset-0 opacity-0 w-full h-full object-cover -scale-x-100"
                                    playsinline
                                ></video>
                                <canvas
                                    bind:this={canvasElement}
                                    width="640"
                                    height="480"
                                    class="w-full h-full object-cover -scale-x-100 z-10"
                                ></canvas>
                                {#if !isCameraRunning}
                                    <div
                                        class="absolute inset-0 flex items-center justify-center bg-gray-900 z-30"
                                    >
                                        <div class="text-center space-y-3">
                                            <i
                                                class="bx bx-loader-alt animate-spin text-4xl text-iris"
                                            ></i>
                                            <p
                                                class="text-white text-sm opacity-70"
                                            >
                                                Đang khởi động Camera AI...
                                            </p>
                                        </div>
                                    </div>
                                {/if}
                                <!-- Instruction hint at bottom -->
                                <div
                                    class="absolute bottom-5 left-5 right-5 z-20 bg-black/60 backdrop-blur text-white text-xs text-center py-2 px-4 rounded-xl border border-white/10"
                                >
                                    Thực hiện ký hiệu <span
                                        class="font-black text-gold"
                                        >"{activeLesson.title
                                            .split(" ")
                                            .pop()}"</span
                                    > — camera sẽ tự nhận diện
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LEARN MODE – list view -->
                {:else}
                    <div>
                        <header class="mb-8 flex items-center justify-between">
                            <div>
                                <h1
                                    class="text-4xl font-black text-rose-text mb-1"
                                >
                                    Thư viện Ký hiệu
                                </h1>
                                <p class="text-subtle">
                                    Chọn bài học. Camera AI sẽ tự nhận diện và
                                    qua bài khi đúng.
                                </p>
                                {#if currentUser}
                                    <a
                                        href="/leaderboard"
                                        class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gold/10 text-gold rounded-xl text-sm font-bold border border-gold/20 hover:bg-gold/20 transition-all"
                                    >
                                        <i class="bx bx-trophy"></i>
                                        Xem bảng xếp hạng
                                    </a>
                                {/if}
                            </div>
                            {#if currentUser?.role === "admin"}
                                <div class="flex items-center gap-3">
                                    <button
                                        onclick={() =>
                                            toggleCatLock(selectedCategory)}
                                        class="px-4 py-2 bg-rose-text/10 text-rose-text rounded-xl text-xs font-black uppercase tracking-widest border border-rose-text/20 hover:bg-rose-text/20 transition-all"
                                        title="Khóa/Mở khóa danh mục hiện tại"
                                    >
                                        <i class="bx bx-lock mr-1"></i>Khóa Tab
                                    </button>
                                    <span
                                        class="px-4 py-2 bg-rose-text/10 text-rose-text rounded-xl text-xs font-black uppercase tracking-widest border border-rose-text/20"
                                    >
                                        <i class="bx bx-lock-open mr-1"></i>Chế
                                        độ Admin
                                    </span>
                                </div>
                            {/if}
                        </header>
                        {#if isCatLocked(selectedCategory) && currentUser?.role !== "admin"}
                            <!-- Category locked - under construction banner -->
                            <div class="py-20 text-center space-y-6" in:fade>
                                <div class="relative inline-block">
                                    <div
                                        class="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-rose-text/20 to-iris/10 border-2 border-dashed border-rose-text/30 flex items-center justify-center mx-auto"
                                    >
                                        <i
                                            class="bx bx-wrench text-5xl text-rose-text/60"
                                        ></i>
                                    </div>
                                    <div
                                        class="absolute -top-3 -right-3 w-10 h-10 bg-rose-text rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <i class="bx bx-lock text-white text-lg"
                                        ></i>
                                    </div>
                                </div>
                                <div>
                                    <h2
                                        class="text-2xl font-black text-rose-text mb-2"
                                    >
                                        Đang cập nhật nội dung
                                    </h2>
                                    <p class="text-subtle max-w-sm mx-auto">
                                        Danh mục <span
                                            class="font-bold text-iris"
                                            >"{selectedCategory}"</span
                                        > hiện đang được cập nhật. Vui lòng quay lại
                                        sau.
                                    </p>
                                </div>
                                <div
                                    class="flex items-center justify-center gap-2 text-xs text-muted font-bold"
                                >
                                    <span class="inline-flex gap-1">
                                        <span
                                            class="w-2 h-2 rounded-full bg-rose-text/50 animate-bounce"
                                            style="animation-delay:0ms"
                                        ></span>
                                        <span
                                            class="w-2 h-2 rounded-full bg-rose-text/50 animate-bounce"
                                            style="animation-delay:150ms"
                                        ></span>
                                        <span
                                            class="w-2 h-2 rounded-full bg-rose-text/50 animate-bounce"
                                            style="animation-delay:300ms"
                                        ></span>
                                    </span>
                                    Sắp ra mắt
                                </div>
                            </div>
                        {:else}
                            <div
                                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            >
                                {#each filteredLessons as lesson, i}
                                    {@const locked = isLocked(lesson.title)}
                                    {@const done = completedSet.has(
                                        lesson.title,
                                    )}
                                    <div
                                        in:fly={{ y: 20, delay: i * 35 }}
                                        onclick={() =>
                                            !locked && selectLesson(lesson, i)}
                                        class="group relative bg-surface rounded-[2rem] border transition-all duration-500 text-left w-full overflow-hidden
                                        {locked
                                            ? 'opacity-50 cursor-not-allowed border-overlay'
                                            : done
                                              ? 'border-green-400/50 hover:border-green-400 hover:shadow-xl hover:shadow-green-400/10 cursor-pointer'
                                              : 'border-overlay hover:border-iris/40 hover:shadow-2xl hover:shadow-iris/5 cursor-pointer'}"
                                    >
                                        <!-- SVG thumb -->
                                        {#if signSvgMap[lesson.title]}
                                            <img
                                                src={signSvgMap[lesson.title]}
                                                alt={lesson.title}
                                                class="absolute top-3 right-3 w-20 h-20 object-contain transition-opacity pointer-events-none
                                            {locked
                                                    ? 'opacity-5'
                                                    : 'opacity-10 group-hover:opacity-35'}"
                                            />
                                        {/if}

                                        <div class="relative z-10 p-6">
                                            <div
                                                class="flex items-start justify-between mb-4"
                                            >
                                                <div
                                                    class="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm border
                                                {done
                                                        ? 'bg-green-100 text-green-600 border-green-300'
                                                        : 'bg-white text-iris border-overlay'}"
                                                >
                                                    {done
                                                        ? "✓"
                                                        : lesson.title
                                                              .split(" ")
                                                              .pop()}
                                                </div>
                                                <!-- Admin lock toggle -->
                                                {#if currentUser?.role === "admin"}
                                                    <button
                                                        onclick={(e) =>
                                                            toggleLock(
                                                                lesson.title,
                                                                e,
                                                            )}
                                                        class="w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                                        {locked
                                                            ? 'bg-rose-text/10 text-rose-text'
                                                            : 'bg-overlay/50 text-muted hover:bg-rose-text/10 hover:text-rose-text'}"
                                                        title={locked
                                                            ? "Mở khóa bài này"
                                                            : "Khóa bài này"}
                                                    >
                                                        <i
                                                            class="bx {locked
                                                                ? 'bx-lock'
                                                                : 'bx-lock-open'} text-lg"
                                                        ></i>
                                                    </button>
                                                {:else if locked}
                                                    <i
                                                        class="bx bx-lock text-xl text-muted opacity-50"
                                                    ></i>
                                                {/if}
                                            </div>

                                            <h3
                                                class="text-xl font-bold mb-1 transition-colors
                                            {locked
                                                    ? 'text-muted'
                                                    : done
                                                      ? 'text-green-600'
                                                      : 'text-rose-text group-hover:text-iris'}"
                                            >
                                                {lesson.title}
                                                {#if locked}<span
                                                        class="text-xs ml-2 opacity-60"
                                                        >· Đã khóa</span
                                                    >{/if}
                                            </h3>
                                            <p
                                                class="text-xs text-muted line-clamp-2 leading-relaxed"
                                            >
                                                {lesson.description}
                                            </p>
                                            <div
                                                class="flex items-center gap-3 text-xs font-bold text-muted mt-4"
                                            >
                                                <span
                                                    class="px-2 py-1 bg-overlay rounded-lg"
                                                    >{lesson.difficulty}</span
                                                >
                                                <span
                                                    class="flex items-center gap-1"
                                                    ><i class="bx bx-time"
                                                    ></i>{lesson.duration}</span
                                                >
                                            </div>
                                        </div>

                                        {#if !locked}
                                            <div
                                                class="absolute bottom-5 right-5 w-8 h-8 rounded-full {done
                                                    ? 'bg-green-500'
                                                    : 'bg-iris'} text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                                            >
                                                <i class="bx bx-right-arrow-alt"
                                                ></i>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>

                            {#if filteredLessons.length === 0}
                                <div class="py-20 text-center opacity-50">
                                    <i
                                        class="bx bx-folder-open text-7xl text-muted mb-4"
                                    ></i>
                                    <p class="text-muted">
                                        Chưa có bài học nào.
                                    </p>
                                </div>
                            {/if}
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
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
</style>
