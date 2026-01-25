<script>
    import { onMount, onDestroy } from "svelte";
    import { fade, scale, fly } from "svelte/transition";
    import { api } from "$lib/api";

    let { onClose } = $props();

    let mouseX = $state(0);
    let mouseY = $state(0);
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

    onMount(() => {
        const handleMouseMove = (e) => {
            if (!isHovered && !isExpanded) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        let raf;
        const animate = () => {
            if (!isHovered && !isExpanded) {
                // Smoothly follow the mouse with a bit of offset
                assistantX += (mouseX + 25 - assistantX) * 0.1;
                assistantY += (mouseY + 25 - assistantY) * 0.1;
            }
            raf = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(raf);
        };
    });

    async function sendMessage() {
        if (!messageInput.trim() || loading) return;

        const userMsg = messageInput;
        messageInput = "";
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];

        loading = true;
        try {
            // Placeholder for AI API call
            // const res = await api.post("/ai/chat", { message: userMsg });
            // For now, mock response
            setTimeout(() => {
                chatHistory = [
                    ...chatHistory,
                    {
                        role: "assistant",
                        content:
                            "Đây là phản hồi giả lập từ trợ lý AI. Tính năng này đang được phát triển nâng cao hơn!",
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
    class="assistant-container {isExpanded ? 'expanded' : ''}"
    style="left: {assistantX}px; top: {assistantY}px;"
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    in:scale={{ duration: 300 }}
>
    {#if !isExpanded}
        <button
            class="assistant-bubble shadow-2xl"
            onclick={() => (isExpanded = true)}
            aria-label="Mở trợ lý"
        >
            <div class="glow"></div>
            <i class="bx bx-bot text-3xl"></i>
            <span class="ping"></span>
        </button>
    {:else}
        <div
            class="assistant-window flex flex-col bg-white shadow-2xl border border-overlay rounded-[2.5rem] overflow-hidden"
            in:fly={{ y: 20, duration: 400 }}
        >
            <header
                class="p-4 bg-iris text-white flex items-center justify-between"
            >
                <div class="flex items-center gap-2">
                    <i class="bx bx-bot text-xl"></i>
                    <span class="font-bold text-sm">Trợ lý AI</span>
                </div>
                <div class="flex items-center gap-1">
                    <button
                        onclick={() => (isExpanded = false)}
                        class="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <i class="bx bx-minus"></i>
                    </button>
                    <button
                        onclick={onClose}
                        class="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <i class="bx bx-x"></i>
                    </button>
                </div>
            </header>

            <div
                class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] bg-surface/30"
            >
                {#each chatHistory as msg}
                    <div
                        class="flex {msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'}"
                    >
                        <div
                            class="max-w-[85%] px-4 py-2 rounded-2xl text-sm {msg.role ===
                            'user'
                                ? 'bg-iris text-white rounded-br-none'
                                : 'bg-white border border-overlay text-rose-text rounded-bl-none'}"
                        >
                            {msg.content}
                        </div>
                    </div>
                {/each}
                {#if loading}
                    <div class="flex justify-start">
                        <div
                            class="bg-white border border-overlay px-4 py-2 rounded-2xl rounded-bl-none"
                        >
                            <i
                                class="bx bx-dots-horizontal-rounded animate-pulse text-iris"
                            ></i>
                        </div>
                    </div>
                {/if}
            </div>

            <footer class="p-4 border-t border-overlay bg-white">
                <div
                    class="flex items-center gap-2 bg-overlay/30 p-1 rounded-xl"
                >
                    <input
                        type="text"
                        bind:value={messageInput}
                        onkeydown={handleKeydown}
                        placeholder="Hỏi gì đó..."
                        class="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none px-3 py-2"
                    />
                    <button
                        onclick={sendMessage}
                        class="w-10 h-10 bg-iris text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
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
        transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .assistant-container.expanded {
        /* When expanded, maybe snap to a fixed position or stay near where it was */
        transform: translate(-50%, -50%); /* Center on the point */
    }

    .assistant-bubble {
        width: 60px;
        height: 60px;
        background: var(--color-iris);
        color: white;
        border: none;
        border-radius: 50%;
        display: flex;
        items-center: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: all 0.3s;
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
        width: 12px;
        height: 12px;
        background: var(--color-love);
        border: 2px solid white;
        border-radius: 50%;
    }

    .assistant-window {
        width: 320px;
        max-width: 90vw;
    }

    input {
        background: transparent !important;
        border: none !important;
        padding-left: 0.75rem !important;
    }
</style>
