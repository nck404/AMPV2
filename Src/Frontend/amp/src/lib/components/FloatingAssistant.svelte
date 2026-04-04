<script>
    import { onMount, onDestroy } from "svelte";
    import { fade, scale, fly } from "svelte/transition";
    import { api } from "$lib/api";

    let { onClose } = $props();

    let assistantX = $state(0);
    let assistantY = $state(0);
    let isHovered = $state(false);
    let isExpanded = $state(false);
    let messageInput = $state("");
    let chatHistory = $state([
        {
            role: "assistant",
            content: "Chào bạn! Tôi là trợ lý AMP. Tôi có thể giúp gì cho bạn?",
        },
    ]);
    let loading = $state(false);
    let isDragging = $state(false);
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartCursorX = 0;
    let dragStartCursorY = 0;
    let hasDragged = false;

    // Approximate dimensions for clamping
    const BUBBLE_SIZE = 60;
    const CHAT_WIDTH = 320;
    const CHAT_HEIGHT = 400;

    function clampPosition(x, y, expanded) {
        const w = expanded ? CHAT_WIDTH : BUBBLE_SIZE;
        const h = expanded ? CHAT_HEIGHT : BUBBLE_SIZE;

        // Ensure it doesn't go off-screen, adding a small padding of 10px
        const padding = 10;
        const maxX = window.innerWidth - w - padding;
        const maxY = window.innerHeight - h - padding;

        return {
            x: Math.max(padding, Math.min(x, maxX)),
            y: Math.max(padding, Math.min(y, maxY)),
        };
    }

    $effect(() => {
        if (typeof window !== "undefined") {
            // Re-clamp when expanded state changes to prevent clipping
            const clamped = clampPosition(assistantX, assistantY, isExpanded);
            assistantX = clamped.x;
            assistantY = clamped.y;
        }
    });

    onMount(() => {
        // Initial placement
        const initialClamped = clampPosition(
            window.innerWidth - BUBBLE_SIZE - 20,
            window.innerHeight - BUBBLE_SIZE - 80,
            false,
        );
        assistantX = initialClamped.x;
        assistantY = initialClamped.y;

        const handleMouseMove = (e) => {
            if (!isDragging) return;

            if (
                Math.abs(e.clientX - dragStartCursorX) > 5 ||
                Math.abs(e.clientY - dragStartCursorY) > 5
            ) {
                hasDragged = true;
            }

            const newX = e.clientX - dragStartX;
            const newY = e.clientY - dragStartY;

            const clamped = clampPosition(newX, newY, isExpanded);
            assistantX = clamped.x;
            assistantY = clamped.y;
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.body.style.userSelect = "";
        };

        const handleResize = () => {
            const clamped = clampPosition(assistantX, assistantY, isExpanded);
            assistantX = clamped.x;
            assistantY = clamped.y;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("resize", handleResize);
        };
    });

    function handleDragStart(e) {
        if (
            e.target.closest(
                "button:not(.assistant-bubble), input, .overflow-y-auto",
            )
        ) {
            return;
        }
        isDragging = true;
        hasDragged = false;
        dragStartCursorX = e.clientX;
        dragStartCursorY = e.clientY;
        dragStartX = e.clientX - assistantX;
        dragStartY = e.clientY - assistantY;
        document.body.style.userSelect = "none";
    }

    function toggleExpand() {
        if (!hasDragged) {
            isExpanded = !isExpanded;
        }
    }

    async function sendMessage() {
        if (!messageInput.trim() || loading) return;

        const userMsg = messageInput;
        messageInput = "";
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];

        loading = true;
        try {
            // Placeholder for AI API call
            setTimeout(() => {
                chatHistory = [
                    ...chatHistory,
                    {
                        role: "assistant",
                        content:
                            "Đây là phản hồi giả lập từ trợ lý AI. Tính năng này đang được phát triển!",
                    },
                ];
                loading = false;
            }, 1000);
        } catch (err) {
            console.error(err);
            loading = false;
        }
    }

    function handleKeydown(e) {
        if (e.key === "Enter") sendMessage();
    }
</script>

<div
    class="assistant-container {isExpanded ? 'expanded' : ''} {isDragging
        ? 'dragging'
        : ''}"
    style="left: {assistantX}px; top: {assistantY}px;"
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    onmousedown={handleDragStart}
    role="presentation"
    in:scale={{ duration: 300 }}
>
    {#if !isExpanded}
        <button
            class="assistant-bubble shadow-2xl"
            onclick={toggleExpand}
            aria-label="Mở trợ lý"
        >
            <div class="glow"></div>
            <i class="bx bx-bot text-3xl"></i>
            <span class="ping"></span>
        </button>
    {:else}
        <div
            class="assistant-window flex flex-col bg-white shadow-2xl border border-overlay rounded-2xl overflow-hidden cursor-default w-[320px]"
            in:fly={{ y: 20, duration: 300 }}
        >
            <!-- Compact Header -->
            <header
                class="px-3 py-2 bg-iris text-white flex items-center justify-between cursor-grab active:cursor-grabbing"
            >
                <div class="flex items-center gap-1.5">
                    <i class="bx bx-bot text-xl"></i>
                    <span class="font-bold text-sm">Trợ lý AI</span>
                </div>
                <div class="flex items-center gap-0.5">
                    <button
                        onclick={() => (isExpanded = false)}
                        class="p-1 hover:bg-white/20 rounded-md transition-colors flex items-center justify-center"
                        title="Thu nhỏ"
                    >
                        <i class="bx bx-minus text-lg"></i>
                    </button>
                    <button
                        onclick={onClose}
                        class="p-1 hover:bg-white/20 rounded-md transition-colors flex items-center justify-center"
                        title="Đóng"
                    >
                        <i class="bx bx-x text-lg"></i>
                    </button>
                </div>
            </header>

            <!-- Compact Chat Area -->
            <div
                class="flex-1 overflow-y-auto p-2.5 space-y-3 min-h-[250px] max-h-[300px] bg-surface/40"
            >
                {#each chatHistory as msg}
                    <div
                        class="flex {msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'}"
                    >
                        <div
                            class="max-w-[85%] px-3 py-1.5 rounded-2xl text-sm leading-relaxed {msg.role ===
                            'user'
                                ? 'bg-iris text-white rounded-br-sm'
                                : 'bg-white border border-overlay text-rose-text rounded-bl-sm shadow-sm'}"
                        >
                            {msg.content}
                        </div>
                    </div>
                {/each}
                {#if loading}
                    <div class="flex justify-start">
                        <div
                            class="bg-white border border-overlay px-3 py-1.5 rounded-2xl rounded-bl-sm shadow-sm"
                        >
                            <i
                                class="bx bx-dots-horizontal-rounded animate-pulse text-iris text-lg"
                            ></i>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Compact Footer -->
            <footer class="p-2 border-t border-overlay bg-white">
                <div
                    class="flex items-center gap-1.5 bg-overlay/30 p-1 rounded-xl"
                >
                    <input
                        type="text"
                        bind:value={messageInput}
                        onkeydown={handleKeydown}
                        placeholder="Hỏi gì đó..."
                        class="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none px-2 py-1.5"
                    />
                    <button
                        onclick={sendMessage}
                        class="w-8 h-8 bg-iris text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                        <i class="bx bx-send"></i>
                    </button>
                </div>
            </footer>
        </div>
    {/if}
</div>

<style>
    .assistant-container {
        position: fixed;
        z-index: 10000;
        pointer-events: auto;
        transition:
            left 0.3s cubic-bezier(0.23, 1, 0.32, 1),
            top 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        /* Add minor shadow to container if needed */
    }

    .assistant-container.dragging {
        transition: none;
    }

    .assistant-bubble {
        width: 60px;
        height: 60px;
        background: var(--color-iris);
        color: white;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: all 0.3s;
        padding: 0;
    }

    .assistant-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(144, 122, 169, 0.4);
    }

    .glow {
        position: absolute;
        inset: -5px;
        background: linear-gradient(
            45deg,
            var(--color-iris),
            var(--color-love)
        );
        filter: blur(10px);
        opacity: 0.3;
        border-radius: 50%;
        z-index: -1;
    }

    .ping {
        position: absolute;
        top: 0;
        right: 0;
        width: 14px;
        height: 14px;
        background: var(--color-love);
        border: 2px solid white;
        border-radius: 50%;
    }

    .assistant-window {
        /* Fixed size applied via Tailwind width utility and inline styles */
        box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
    }

    input {
        background: transparent !important;
        border: none !important;
        padding-left: 0.75rem !important;
    }

    /* Custom scrollbar for chat area */
    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: var(--color-overlay);
        border-radius: 4px;
    }
</style>
