<script>
    import { onMount } from "svelte";
    import { fade, fly, scale } from "svelte/transition";

    let { onClose } = $props();

    let isVisible = $state(true);
    let x = $state(window.innerWidth / 2 - 400);
    let y = $state(window.innerHeight - 350);
    let isDragging = $state(false);
    let isPinned = $state(false);
    let dragStartX = 0;
    let dragStartY = 0;

    const keys = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", "Enter"],
        ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
        ["Space"],
    ];

    function handleMouseDown(e) {
        if (isPinned) return;
        isDragging = true;
        dragStartX = e.clientX - x;
        dragStartY = e.clientY - y;

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        x = e.clientX - dragStartX;
        y = e.clientY - dragStartY;
    }

    function handleMouseUp() {
        isDragging = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    function typeKey(key) {
        const activeElement = document.activeElement;
        if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA")
        ) {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
            const text = activeElement.value;

            if (key === "⌫") {
                activeElement.value =
                    text.slice(0, start - 1) + text.slice(end);
                activeElement.selectionStart = activeElement.selectionEnd =
                    start - 1;
            } else if (key === "Enter") {
                const event = new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                });
                activeElement.dispatchEvent(event);
            } else if (key === "Space") {
                activeElement.value =
                    text.slice(0, start) + " " + text.slice(end);
                activeElement.selectionStart = activeElement.selectionEnd =
                    start + 1;
            } else {
                activeElement.value =
                    text.slice(0, start) + key + text.slice(end);
                activeElement.selectionStart = activeElement.selectionEnd =
                    start + key.length;
            }

            // Trigger input event for Svelte/React etc
            activeElement.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function togglePin() {
        isPinned = !isPinned;
    }
</script>

<div
    class="keyboard-wrapper {isPinned ? 'pinned' : ''}"
    style="left: {x}px; top: {y}px;"
    in:fly={{ y: 50, duration: 500 }}
>
    <div
        class="keyboard-container bg-white/90 backdrop-blur-2xl shadow-2xl border border-overlay rounded-[2.5rem] overflow-hidden"
    >
        <!-- Drag Handle -->
        <div
            class="h-10 bg-overlay/20 flex items-center justify-between px-6 cursor-move select-none"
            role="presentation"
            onmousedown={handleMouseDown}
        >
            <div class="flex items-center gap-2">
                <i class="bx bx-move text-muted"></i>
                <span
                    class="text-[10px] font-black uppercase tracking-widest text-muted"
                    >Bàn phím ảo</span
                >
            </div>
            <div class="flex items-center gap-3">
                <button
                    onclick={togglePin}
                    class="p-1 hover:bg-iris/10 rounded transition-colors {isPinned
                        ? 'text-iris'
                        : 'text-muted'}"
                    title={isPinned ? "Bỏ ghim" : "Ghim"}
                >
                    <i class="bx {isPinned ? 'bx-pin' : 'bx-pushpin'}"></i>
                </button>
                <button
                    onclick={onClose}
                    class="p-1 hover:bg-love/10 text-love rounded transition-colors"
                    aria-label="Đóng bàn phím"
                >
                    <i class="bx bx-x text-lg"></i>
                </button>
            </div>
        </div>

        <div class="p-4 space-y-2">
            {#each keys as row}
                <div class="flex justify-center gap-1.5">
                    {#each row as key}
                        <button
                            onclick={() => typeKey(key)}
                            class="key-btn {key === 'Space'
                                ? 'w-64'
                                : key === 'Enter' || key === '⌫'
                                  ? 'w-24 bg-overlay/40'
                                  : 'w-12'} h-12 rounded-xl flex items-center justify-center font-bold text-rose-text hover:bg-iris hover:text-white transition-all active:scale-90 shadow-sm border border-overlay/20 bg-white"
                        >
                            {key === "Space" ? "DẤU CÁCH" : key}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .keyboard-wrapper {
        position: fixed;
        z-index: 9999;
        user-select: none;
    }

    .keyboard-wrapper.pinned {
        border: 2px solid var(--color-iris);
        border-radius: 2.7rem;
    }

    .key-btn {
        font-family: var(--font-main);
        text-transform: uppercase;
        font-size: 14px;
        cursor: pointer;
    }

    .keyboard-container {
        padding-bottom: 1rem;
    }
</style>
