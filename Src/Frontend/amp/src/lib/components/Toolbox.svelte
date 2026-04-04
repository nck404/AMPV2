<script>
    import { fly, fade, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import FloatingAssistant from "./FloatingAssistant.svelte";
    import { PUBLIC_API_DOMAIN } from "$env/static/public";
    import VirtualKeyboard from "./VirtualKeyboard.svelte";

    let showAssistant = $state(false);
    let { isCustomCursorActive = $bindable(true) } = $props();
    let showKeyboard = $state(false);
    let isVisible = $state(false);
    let isScreenReaderActive = $state(false);
    let showActivationModal = $state(false);
    let audioUnlocked = $state(false);

    let lastReadText = "";
    let highlightRect = $state({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        opacity: 0,
    });
    let audioPlayer;

    function toggleAssistant() {
        showAssistant = !showAssistant;
    }

    function toggleKeyboard() {
        showKeyboard = !showKeyboard;
    }

    function toggleToolbox() {
        isVisible = !isVisible;
    }

    function toggleCustomCursor() {
        isCustomCursorActive = !isCustomCursorActive;
    }

    function toggleScreenReader() {
        if (!isScreenReaderActive) {
            if (!audioUnlocked) {
                showActivationModal = true;
                return;
            }
            isScreenReaderActive = true;
            localStorage.setItem("screen-reader-active", "true");
            speak("Chế độ đọc màn hình đã bật");
        } else {
            isScreenReaderActive = false;
            localStorage.setItem("screen-reader-active", "false");
            if (audioPlayer) audioPlayer.pause();
            speak("Chế độ đọc màn hình đã tắt");
            highlightRect.opacity = 0;
        }
    }

    function activateAudio() {
        audioUnlocked = true;
        showActivationModal = false;
        isScreenReaderActive = true;
        localStorage.setItem("screen-reader-active", "true");

        // Play a silent sound to unlock audio context
        if (audioPlayer) {
            audioPlayer.src =
                "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ";
            audioPlayer
                .play()
                .then(() => {
                    speak(
                        "Đã kích hoạt hỗ trợ âm thanh. Di chuyển chuột để đọc nội dung.",
                    );
                })
                .catch((e) => console.log("Still blocked"));
        }
    }

    function speak(text) {
        if (!text || text === lastReadText || !audioUnlocked) return;

        const url = `${PUBLIC_API_DOMAIN}/tts/speak?text=${encodeURIComponent(text)}`;

        if (audioPlayer) {
            audioPlayer.src = url;
            audioPlayer.play().catch((e) => {
                console.log("Audio play blocked", e);
            });
        }

        lastReadText = text;
    }

    onMount(() => {
        audioPlayer = new Audio();

        if (localStorage.getItem("screen-reader-active") === "true") {
            showActivationModal = true;
        }

        const handleOpenToolbox = () => {
            isVisible = true;
        };
        window.addEventListener("amp-open-toolbox", handleOpenToolbox);

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === "i") {
                e.preventDefault();
                toggleToolbox();
            }
            if (e.ctrlKey && e.key.toLowerCase() === "j") {
                e.preventDefault();
                isVisible = true;
                toggleScreenReader();
            }
        };

        const handleClickOutside = (e) => {
            const wrapper = document.getElementById("dock-wrapper");
            if (
                e.target.closest(".onboarding-overlay") ||
                e.target.closest(".tooltip-box")
            ) {
                return;
            }
            if (isVisible && wrapper && !wrapper.contains(e.target)) {
                isVisible = false;
            }
        };

        let readingTimeout;
        const handleMouseMove = (e) => {
            if (!isScreenReaderActive) return;

            clearTimeout(readingTimeout);
            readingTimeout = setTimeout(() => {
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (
                    !element ||
                    element.closest("#dock-wrapper") ||
                    element.closest(".activation-modal")
                ) {
                    highlightRect.opacity = 0;
                    return;
                }

                let text =
                    element.innerText ||
                    element.getAttribute("aria-label") ||
                    element.getAttribute("placeholder");
                text = text?.trim();

                if (text && text.length > 0 && text.length < 500) {
                    const rect = element.getBoundingClientRect();

                    highlightRect = {
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height,
                        opacity: 1,
                    };

                    speak(text);
                } else {
                    highlightRect.opacity = 0;
                }
            }, 150);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", handleClickOutside);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("amp-open-toolbox", handleOpenToolbox);
        };
    });
</script>

<!-- Visual Highlight Overlay -->
<div
    class="reading-highlight"
    style="
        top: {highlightRect.top}px;
        left: {highlightRect.left}px;
        width: {highlightRect.width}px;
        height: {highlightRect.height}px;
        opacity: {highlightRect.opacity};
    "
></div>

<!-- Accessibility Activation Modal -->
{#if showActivationModal}
    <div
        class="modal-overlay fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm"
        transition:fade
    >
        <div
            class="activation-modal bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white max-w-sm w-full text-center space-y-6"
            transition:scale={{ duration: 400, start: 0.95 }}
        >
            <div
                class="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4"
            >
                <i class="bx bx-volume-full text-5xl"></i>
            </div>
            <div class="space-y-2">
                <h3 class="text-xl font-bold text-rose-text">
                    Bật trợ lý âm thanh?
                </h3>
                <p class="text-sm text-subtle leading-relaxed">
                    Trình duyệt cần bạn xác nhận để bắt đầu phát giọng nói hỗ
                    trợ đọc màn hình.
                </p>
            </div>
            <div class="flex gap-3 pt-2">
                <button
                    onclick={() => (showActivationModal = false)}
                    class="flex-1 px-6 py-3 rounded-2xl bg-overlay/50 text-rose-text font-bold hover:bg-overlay transition-all"
                >
                    Hủy
                </button>
                <button
                    onclick={activateAudio}
                    class="flex-1 px-6 py-3 rounded-2xl bg-gold text-white font-bold hover:scale-105 shadow-lg shadow-gold/30 active:scale-95 transition-all"
                >
                    Bật ngay
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- macOS Style Dock Toolbox -->
<div
    id="dock-wrapper"
    class="dock-wrapper fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
>
    <!-- Dock Container -->
    <div
        class="dock-container pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
        class:active={isVisible}
        role="toolbar"
        aria-label="Accessibility Tools"
    >
        <div class="dock-content flex items-center gap-4 px-4 py-2">
            <!-- Assistant Button -->
            <button
                id="tour-assistant-btn"
                onclick={toggleAssistant}
                class="dock-item group"
                title="AI Assistant"
            >
                <div
                    class="icon-box bg-iris {showAssistant
                        ? 'active shadow-iris'
                        : ''}"
                >
                    <i class="bx bx-bot"></i>
                </div>
                <span class="label text-iris">AI</span>
            </button>

            <div class="dock-divider"></div>

            <!-- Keyboard Button -->
            <button
                id="tour-keyboard-btn"
                onclick={toggleKeyboard}
                class="dock-item group"
                title="Virtual Keyboard"
            >
                <div
                    class="icon-box bg-love {showKeyboard
                        ? 'active shadow-love'
                        : ''}"
                >
                    <i class="bx bx-keyboard"></i>
                </div>
                <span class="label text-love">Phím</span>
            </button>

            <div class="dock-divider"></div>

            <!-- Screen Reader Toggle -->
            <button
                id="tour-reader-btn"
                onclick={toggleScreenReader}
                class="dock-item group"
                title="Audio Reader (Ctrl + J)"
            >
                <div
                    class="icon-box bg-gold {isScreenReaderActive
                        ? 'active shadow-gold'
                        : ''}"
                >
                    <i
                        class="bx {isScreenReaderActive
                            ? 'bx-volume-full'
                            : 'bx-volume-mute'}"
                    ></i>
                </div>
                <span class="label text-gold">Đọc</span>
            </button>

            <div class="dock-divider"></div>

            <!-- Custom Cursor Toggle -->
            <button
                id="tour-cursor-btn"
                onclick={toggleCustomCursor}
                class="dock-item group"
                title="Custom Cursor"
            >
                <div
                    class="icon-box bg-pine {isCustomCursorActive
                        ? 'active shadow-pine'
                        : ''}"
                >
                    <i
                        class="bx {isCustomCursorActive
                            ? 'bx-mouse'
                            : 'bx-block'}"
                    ></i>
                </div>
                <span class="label text-pine">Chuột</span>
            </button>
        </div>
    </div>

    <!-- Clickable Handle Indicator -->
    <button
        id="tour-dock-trigger"
        class="dock-trigger mt-1"
        class:active-trigger={isVisible}
        onclick={(e) => {
            e.stopPropagation();
            toggleToolbox();
        }}
        aria-label="Toggle Toolbox"
        title="Toggle Toolbox (Ctrl + I)"
    ></button>
</div>

{#if showAssistant}
    <FloatingAssistant onClose={() => (showAssistant = false)} />
{/if}

{#if showKeyboard}
    <VirtualKeyboard onClose={() => (showKeyboard = false)} />
{/if}

<style>
    .reading-highlight {
        position: absolute;
        pointer-events: none;
        background: rgba(144, 122, 169, 0.1);
        border: 2px solid var(--color-iris);
        border-radius: 8px;
        z-index: 9998;
        transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        box-shadow: 0 0 15px rgba(144, 122, 169, 0.3);
    }

    .dock-wrapper {
        perspective: 1000px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* Minimal handle like iPhone gesture bar */
    .dock-trigger {
        all: unset;
        width: 60px;
        height: 6px;
        background: var(--color-iris);
        opacity: 0.4;
        border-radius: 99px;
        pointer-events: auto;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        cursor: pointer;
    }

    .dock-trigger:hover {
        opacity: 0.8;
        width: 100px;
        background: var(--color-love);
    }

    .active-trigger {
        background: var(--color-love);
        opacity: 0.6;
        width: 40px;
        transform: translateY(2px);
    }

    .dock-container {
        opacity: 0;
        visibility: hidden;
        transform: translateY(30px) scale(0.95);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 1.5rem;
        box-shadow:
            0 20px 40px -10px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.6) inset;
    }

    .dock-container.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
    }

    .dock-content {
        position: relative;
    }

    .dock-item {
        all: unset;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .dock-item:hover {
        transform: translateY(-5px);
    }

    .icon-box {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        transition: all 0.3s;
    }

    /* Color variations */
    .bg-iris {
        background: var(--color-iris);
    }
    .bg-love {
        background: var(--color-love);
    }
    .bg-gold {
        background: var(--color-gold);
    }
    .bg-pine {
        background: var(--color-pine, #31748f);
    }

    .icon-box.active {
        transform: scale(1.1);
        box-shadow: 0 8px 16px -4px currentColor;
    }

    /* shadow variant for gold/active reader */
    .shadow-gold {
        box-shadow: 0 8px 16px -4px var(--color-gold);
    }
    .shadow-iris {
        box-shadow: 0 8px 16px -4px var(--color-iris);
    }
    .shadow-love {
        box-shadow: 0 8px 16px -4px var(--color-love);
    }
    .shadow-pine {
        box-shadow: 0 8px 16px -4px var(--color-pine, #31748f);
    }

    .label {
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.6;
    }

    .text-iris {
        color: var(--color-iris);
    }
    .text-love {
        color: var(--color-love);
    }
    .text-gold {
        color: var(--color-gold);
    }
    .text-pine {
        color: var(--color-pine, #31748f);
    }

    .dock-divider {
        width: 1px;
        height: 20px;
        background: rgba(0, 0, 0, 0.08);
        align-self: center;
    }

    /* Boxicons centering fix */
    i.bx {
        display: block;
        line-height: 1;
    }
</style>
