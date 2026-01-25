<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let selectedChatId = $state(null); // 'global' or userId
    let showMobileSidebar = $state(true);
    let messageInput = $state("");
    let socket;

    let convos = $state([
        {
            id: "global",
            name: "Phòng chat chung",
            status: "Public",
            lastMessage: "Chào mừng bạn đến với AMP!",
            time: "Hôm nay",
            icon: "bx-globe",
            isGlobal: true,
        },
    ]);

    let messages = $state([]);
    let currentUser = $state({ username: "Bạn", public_id: "000000", id: 0 });

    onMount(async () => {
        mounted = true;
        const userData = localStorage.getItem("user");
        if (userData) {
            currentUser = JSON.parse(userData);
        }

        // Load friends as conversations
        await loadFriends();

        // Check for direct chat from URL
        const targetId = page.url.searchParams.get("id");
        if (targetId) {
            selectedChatId = parseInt(targetId);
            showMobileSidebar = false;
            await loadChatHistory(selectedChatId);
        } else {
            selectedChatId = "global";
            await loadChatHistory("global");
        }

        if (typeof io !== "undefined") {
            socket = io("http://localhost:5000");

            socket.on("connect", () => {
                console.log("Connected to Chat Server");
            });

            socket.on("message", (data) => {
                const isGlobalMsg =
                    !data.receiver_id && selectedChatId === "global";
                const isPrivateMsg =
                    (data.sender_id === selectedChatId &&
                        data.receiver_id === currentUser.id) ||
                    (data.sender_id === currentUser.id &&
                        data.receiver_id === selectedChatId);

                if (isGlobalMsg || isPrivateMsg) {
                    if (data.sender_id !== currentUser.id) {
                        messages = [
                            ...messages,
                            {
                                id: Date.now(),
                                sender: "other",
                                sender_name: data.sender_name || "Người dùng",
                                text: data.content || data.text,
                                time: new Date(
                                    data.timestamp || Date.now(),
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }),
                            },
                        ];
                    }
                }
            });
        }
    });

    async function loadFriends() {
        try {
            const friends = await api.get("/social/friends");
            if (Array.isArray(friends)) {
                const friendConvos = friends.map((f) => ({
                    id: f.id,
                    name: f.username,
                    public_id: f.public_id,
                    avatar_url: f.avatar_url,
                    icon: "bx-user",
                    isGlobal: false,
                    lastMessage: "Nhấn để bắt đầu trò chuyện",
                    time: "",
                }));
                convos = [
                    {
                        id: "global",
                        name: "Phòng chat chung",
                        status: "Public",
                        lastMessage: "Chào mừng bạn đến với AMP!",
                        time: "Hôm nay",
                        icon: "bx-globe",
                        isGlobal: true,
                    },
                    ...friendConvos,
                ];
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function selectChat(id) {
        selectedChatId = id;
        showMobileSidebar = false;
        await loadChatHistory(id);
    }

    async function loadChatHistory(id) {
        messages = [];
        try {
            const endpoint =
                id === "global"
                    ? "/chat/history"
                    : `/chat/history?receiver_id=${id}`;
            const history = await api.get(endpoint);
            if (Array.isArray(history)) {
                messages = history.map((m) => ({
                    id: m.id,
                    sender: m.sender_id === currentUser.id ? "me" : "other",
                    sender_name: m.sender_name,
                    text: m.content,
                    time: m.timestamp
                        ? new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "Vừa xong",
                }));
            }
        } catch (err) {
            console.error("Failed to load chat history", err);
        }
    }

    onDestroy(() => {
        if (socket) socket.disconnect();
    });

    function sendMessage() {
        if (!messageInput.trim()) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const msgData = {
            sender_id: currentUser.id,
            sender_name: currentUser.username,
            content: messageInput,
            timestamp: now.toISOString(),
            receiver_id: selectedChatId === "global" ? null : selectedChatId,
        };

        messages = [
            ...messages,
            {
                id: Date.now(),
                sender: "me",
                text: messageInput,
                time: timeStr,
            },
        ];

        if (socket) {
            socket.emit("message", msgData);
        }

        messageInput = "";
    }

    let messageContainer = $state();

    $effect(() => {
        if (messages.length && messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    });

    function handleKeydown(e) {
        if (e.key === "Enter") sendMessage();
    }

    let currentChat = $derived(convos.find((c) => c.id === selectedChatId));
</script>

<div
    class="h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] max-w-7xl mx-auto px-0 md:px-6 mb-12"
>
    {#if mounted}
        <div
            in:fade
            class="bg-surface border-x md:border border-overlay rounded-none md:rounded-[3rem] h-full overflow-hidden flex shadow-2xl shadow-rose-text/5 relative"
        >
            <!-- Sidebar -->
            <aside
                class="w-full md:w-80 lg:w-96 border-r border-overlay bg-white/50 backdrop-blur flex flex-col {showMobileSidebar
                    ? 'flex'
                    : 'hidden md:flex'}"
            >
                <div class="p-6 md:p-8 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2
                            class="text-xl md:text-2xl font-bold text-rose-text"
                        >
                            Tin nhắn
                        </h2>
                        <button
                            onclick={() => goto("/people")}
                            class="w-10 h-10 bg-iris/10 text-iris rounded-xl flex items-center justify-center hover:bg-iris hover:text-white transition-all shadow-sm"
                            aria-label="Tìm bạn bè"
                        >
                            <i class="bx bx-plus text-2xl"></i>
                        </button>
                    </div>

                    <div class="relative">
                        <span
                            class="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-lg"
                        >
                            <i class="bx bx-search"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm hội thoại..."
                            class="w-full pl-11 py-3 bg-overlay/30 rounded-2xl border-transparent focus:bg-white focus:border-iris/30 text-sm outline-none transition-all"
                        />
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
                    {#each convos as chat}
                        <button
                            onclick={() => selectChat(chat.id)}
                            class="w-full p-4 rounded-3xl flex items-center gap-4 transition-all duration-300 {selectedChatId ===
                            chat.id
                                ? 'bg-iris text-white shadow-xl shadow-iris/20'
                                : 'hover:bg-overlay/50'}"
                        >
                            <div
                                class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl relative shadow-sm text-iris overflow-hidden"
                            >
                                {#if chat.avatar_url}
                                    <img
                                        src={chat.avatar_url.startsWith("http")
                                            ? chat.avatar_url
                                            : `http://localhost:5000${chat.avatar_url}`}
                                        alt=""
                                        class="w-full h-full object-cover"
                                    />
                                {:else}
                                    <i class="bx {chat.icon}"></i>
                                {/if}
                            </div>
                            <div class="flex-1 text-left min-w-0">
                                <div
                                    class="flex justify-between items-center mb-1"
                                >
                                    <span class="font-bold truncate text-sm"
                                        >{chat.name}</span
                                    >
                                    <span
                                        class="text-[10px] opacity-60 uppercase"
                                        >{chat.time}</span
                                    >
                                </div>
                                <p class="text-[10px] opacity-70 truncate">
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </button>
                    {/each}
                </div>

                <div class="p-6 bg-overlay/20 border-t border-overlay">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-iris rounded-xl flex items-center justify-center text-white font-bold overflow-hidden"
                        >
                            {#if currentUser.avatar_url}
                                <img
                                    src={currentUser.avatar_url.startsWith(
                                        "http",
                                    )
                                        ? currentUser.avatar_url
                                        : `http://localhost:5000${currentUser.avatar_url}`}
                                    alt="Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                {currentUser.username[0].toUpperCase()}
                            {/if}
                        </div>
                        <div class="flex-1">
                            <div class="text-xs font-bold text-rose-text">
                                {currentUser.username}
                            </div>
                            <div class="text-[10px] text-muted">
                                ID: @{currentUser.public_id}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Chat Area -->
            <main
                class="flex-1 flex flex-col bg-white {showMobileSidebar
                    ? 'hidden md:flex'
                    : 'flex'}"
            >
                {#if selectedChatId}
                    <header
                        class="p-4 md:p-6 border-b border-overlay flex items-center justify-between bg-white/50 backdrop-blur"
                    >
                        <div class="flex items-center gap-3 md:gap-4">
                            <button
                                onclick={() => (showMobileSidebar = true)}
                                class="md:hidden w-8 h-8 flex items-center justify-center text-rose-text hover:bg-overlay rounded-lg transition-all"
                                aria-label="Quay lại"
                            >
                                <i class="bx bx-chevron-left text-3xl"></i>
                            </button>
                            <div
                                class="w-10 h-10 md:w-12 md:h-12 bg-overlay rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl text-iris overflow-hidden"
                            >
                                {#if currentChat?.avatar_url}
                                    <img
                                        src={currentChat.avatar_url.startsWith(
                                            "http",
                                        )
                                            ? currentChat.avatar_url
                                            : `http://localhost:5000${currentChat.avatar_url}`}
                                        alt=""
                                        class="w-full h-full object-cover"
                                    />
                                {:else}
                                    <i
                                        class="bx {currentChat?.icon ||
                                            'bx-chat'}"
                                    ></i>
                                {/if}
                            </div>
                            <div>
                                <h3
                                    class="font-bold text-rose-text text-sm md:text-base line-clamp-1"
                                >
                                    {currentChat?.name || "Đang tải..."}
                                </h3>
                                <span
                                    class="text-[10px] md:text-xs text-cat-green font-medium"
                                    >Online</span
                                >
                            </div>
                        </div>
                        <div class="flex items-center gap-1 md:gap-2">
                            <button
                                class="w-9 h-9 md:w-10 md:h-10 hover:bg-overlay rounded-xl flex items-center justify-center transition-colors text-lg md:text-xl"
                                aria-label="Call"
                                ><i class="bx bx-phone"></i></button
                            >
                            <button
                                class="w-9 h-9 md:w-10 md:h-10 hover:bg-overlay rounded-xl flex items-center justify-center transition-colors text-lg md:text-xl"
                                aria-label="Video Call"
                                ><i class="bx bx-video"></i></button
                            >
                        </div>
                    </header>

                    <div
                        bind:this={messageContainer}
                        class="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-surface/30 flex flex-col"
                    >
                        {#if messages.length === 0}
                            <div
                                class="m-auto text-center space-y-2 opacity-40"
                            >
                                <i class="bx bx-message-rounded-dots text-6xl"
                                ></i>
                                <p class="text-sm">
                                    Chưa có tin nhắn nào. Bắt đầu ngay!
                                </p>
                            </div>
                        {/if}
                        {#each messages as msg}
                            <div
                                class="flex {msg.sender === 'me'
                                    ? 'justify-end'
                                    : 'justify-start'} items-end gap-3"
                            >
                                {#if msg.sender !== "me"}
                                    <div
                                        class="w-8 h-8 bg-overlay rounded-lg flex items-center justify-center text-[10px] font-bold mb-1 text-iris border border-iris/20 overflow-hidden"
                                    >
                                        {#if currentChat?.avatar_url && !currentChat.isGlobal}
                                            <img
                                                src={currentChat.avatar_url.startsWith(
                                                    "http",
                                                )
                                                    ? currentChat.avatar_url
                                                    : `http://localhost:5000${currentChat.avatar_url}`}
                                                alt=""
                                                class="w-full h-full object-cover"
                                            />
                                        {:else}
                                            {msg.sender_name[0].toUpperCase()}
                                        {/if}
                                    </div>
                                {/if}
                                <div
                                    class="max-w-[85%] md:max-w-[70%] space-y-1"
                                >
                                    {#if msg.sender !== "me" && currentChat?.isGlobal}
                                        <div
                                            class="text-[10px] font-bold text-iris px-1"
                                        >
                                            {msg.sender_name}
                                        </div>
                                    {/if}
                                    <div
                                        class="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-sm leading-relaxed shadow-sm {msg.sender ===
                                        'me'
                                            ? 'bg-iris text-white rounded-br-none'
                                            : 'bg-white border border-overlay text-rose-text rounded-bl-none'}"
                                    >
                                        {msg.text}
                                    </div>
                                    <div
                                        class="text-[9px] text-muted px-2 {msg.sender ===
                                        'me'
                                            ? 'text-right'
                                            : 'text-left'}"
                                    >
                                        {msg.time}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="p-4 md:p-6 border-t border-overlay bg-white">
                        <div
                            class="flex items-center gap-2 md:gap-4 bg-overlay/30 p-1.5 md:p-2 rounded-2xl"
                        >
                            <button
                                class="w-10 h-10 text-xl md:text-2xl hover:scale-110 transition-transform"
                                aria-label="Emoji"
                                ><i class="bx bx-smile"></i></button
                            >
                            <input
                                type="text"
                                bind:value={messageInput}
                                onkeydown={handleKeydown}
                                placeholder="Nhập tin nhắn..."
                                class="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                            />
                            <button
                                onclick={sendMessage}
                                class="w-10 h-10 md:w-12 md:h-12 bg-iris text-white rounded-xl shadow-lg shadow-iris/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl md:text-2xl"
                                aria-label="Send Message"
                            >
                                <i class="bx bx-send"></i>
                            </button>
                        </div>
                    </div>
                {:else}
                    <div
                        class="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4"
                    >
                        <div class="text-8xl text-iris/20">
                            <i class="bx bx-chat"></i>
                        </div>
                        <h2 class="text-2xl font-black text-rose-text">
                            Bắt đầu trò chuyện
                        </h2>
                        <p class="text-muted max-w-xs text-sm">
                            Chọn một người bạn hoặc tham gia Phòng chat chung để
                            kết nối với mọi người.
                        </p>
                        <button
                            onclick={() => selectChat("global")}
                            class="button px-10">Tham gia Chat Chung</button
                        >
                    </div>
                {/if}
            </main>
        </div>
    {/if}
</div>

<style>
    input {
        background: transparent !important;
        padding-left: 0 !important;
        border: none !important;
    }
</style>
