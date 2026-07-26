<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";
    import { currentUser, isLoggedIn } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";
    import { haptic } from "$lib/stores/access.js";

    let selectedChatId = $state(null);
    let messageInput = $state("");
    let socket;
    let messageContainer = $state();

    let convos = $state([
        { id: "global", name: "Phòng chat chung", lastMessage: "Chào mừng bạn đến với AMP!", icon: "bx-globe", isGlobal: true },
    ]);
    let messages = $state([]);

    let searchOpen = $state(false);
    let searchQuery = $state("");
    let searchResults = $state([]);
    let searching = $state(false);

    onMount(async () => {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        await loadFriends();

        if (typeof window !== "undefined") {
            const { io } = await import("socket.io-client");
            socket = io({ path: "/socket.io" });

            socket.on("message", (data) => {
                const isGlobalMsg = !data.receiver_id && selectedChatId === "global";
                const isPrivateMsg =
                    (data.sender_id === selectedChatId && data.receiver_id === $currentUser.id) ||
                    (data.sender_id === $currentUser.id && data.receiver_id === selectedChatId);

                if ((isGlobalMsg || isPrivateMsg) && data.sender_id !== $currentUser.id) {
                    messages = [
                        ...messages,
                        {
                            id: Date.now(),
                            sender: "other",
                            sender_name: data.sender_name || "Người dùng",
                            text: data.content || data.text,
                            time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        },
                    ];
                    if (selectedChatId === data.sender_id) {
                        api.post("/chat/mark-read", { sender_id: data.sender_id });
                    }
                }
            });
        }
    });

    onDestroy(() => {
        if (socket) socket.disconnect();
    });

    async function loadFriends() {
        try {
            const friends = await api.get("/social/friends");
            if (Array.isArray(friends)) {
                convos = [
                    { id: "global", name: "Phòng chat chung", lastMessage: "Chào mừng bạn đến với AMP!", icon: "bx-globe", isGlobal: true },
                    ...friends.map((f) => ({
                        id: f.id,
                        name: f.username,
                        public_id: f.public_id,
                        avatar_url: f.avatar_url,
                        icon: "bx-user",
                        isGlobal: false,
                        unread_count: f.unread_count || 0,
                    })),
                ];
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function selectChat(id) {
        haptic(10);
        selectedChatId = id;
        if (id !== "global") {
            try {
                await api.post("/chat/mark-read", { sender_id: id });
                const idx = convos.findIndex((c) => c.id === id);
                if (idx !== -1) convos[idx].unread_count = 0;
            } catch {}
        }
        messages = [];
        try {
            const endpoint = id === "global" ? "/chat/history" : `/chat/history?receiver_id=${id}`;
            const history = await api.get(endpoint);
            if (Array.isArray(history)) {
                messages = history.map((m) => ({
                    id: m.id,
                    sender: m.sender_id === $currentUser.id ? "me" : "other",
                    sender_name: m.sender_name,
                    text: m.content,
                    time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
                }));
            }
        } catch (err) {
            console.error(err);
        }
    }

    function sendMessage() {
        if (!messageInput.trim()) return;
        const now = new Date();
        const msgData = {
            sender_id: $currentUser.id,
            sender_name: $currentUser.username,
            content: messageInput,
            timestamp: now.toISOString(),
            receiver_id: selectedChatId === "global" ? null : selectedChatId,
        };
        messages = [...messages, { id: Date.now(), sender: "me", text: messageInput, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
        if (socket) socket.emit("message", msgData);
        messageInput = "";
        haptic(8);
    }

    $effect(() => {
        if (messages.length && messageContainer) {
            messageContainer.scrollTo({ top: messageContainer.scrollHeight, behavior: "smooth" });
        }
    });

    async function runSearch() {
        if (!searchQuery.trim()) {
            searchResults = [];
            return;
        }
        searching = true;
        try {
            searchResults = await api.get(`/social/users/search?q=${encodeURIComponent(searchQuery)}`);
        } catch {
            searchResults = [];
        } finally {
            searching = false;
        }
    }

    async function sendFriendRequest(friendId) {
        try {
            await api.post("/social/friends/request", { friend_id: friendId });
            searchResults = searchResults.map((u) => (u.id === friendId ? { ...u, friend_status: "pending" } : u));
        } catch (err) {
            console.error(err);
        }
    }

    let currentChat = $derived(convos.find((c) => c.id === selectedChatId));
</script>

{#if !selectedChatId}
    <div in:fade class="space-y-4 pb-4">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-black text-[#2c293e]">Tin nhắn</h1>
            <button onclick={() => (searchOpen = true)} class="w-12 h-12 rounded-2xl bg-[#907aa9]/10 text-[#907aa9] flex items-center justify-center" aria-label="Tìm bạn bè">
                <i class="bx bx-user-plus text-2xl"></i>
            </button>
        </div>

        <div class="space-y-2">
            {#each convos as chat}
                <button onclick={() => selectChat(chat.id)} class="w-full p-4 rounded-3xl flex items-center gap-4 bg-[#fffaf3] border border-[#f2e9e1] min-h-[72px]">
                    <div class="w-12 h-12 bg-[#907aa9]/10 rounded-2xl flex items-center justify-center text-xl text-[#907aa9] overflow-hidden relative flex-shrink-0">
                        {#if chat.avatar_url}
                            <img src={chat.avatar_url.startsWith("http") ? chat.avatar_url : `${STATIC_BASE}${chat.avatar_url}`} alt="" class="w-full h-full object-cover" />
                        {:else}
                            <i class="bx {chat.icon}"></i>
                        {/if}
                        {#if chat.unread_count > 0}
                            <span class="absolute -top-1 -right-1 w-5 h-5 bg-[#b4637a] text-white text-[10px] font-black rounded-full flex items-center justify-center">{chat.unread_count > 9 ? "9+" : chat.unread_count}</span>
                        {/if}
                    </div>
                    <div class="flex-1 text-left min-w-0">
                        <span class="font-bold text-sm text-[#2c293e] truncate block">{chat.name}</span>
                        <p class="text-xs text-[#797593] truncate">{chat.lastMessage || "Nhấn để trò chuyện"}</p>
                    </div>
                </button>
            {/each}
        </div>
    </div>
{:else}
    <div in:fly={{ x: 20 }} class="fixed inset-0 z-40 bg-[#faf4ed] flex flex-col">
        <header class="flex items-center gap-3 p-4 border-b-2 border-[#f2e9e1] bg-[#faf4ed]">
            <button onclick={() => (selectedChatId = null)} class="w-10 h-10 flex items-center justify-center" aria-label="Quay lại">
                <i class="bx bx-chevron-left text-3xl"></i>
            </button>
            <div class="w-10 h-10 rounded-xl bg-[#f2e9e1] flex items-center justify-center text-lg text-[#907aa9] overflow-hidden">
                {#if currentChat?.avatar_url}
                    <img src={currentChat.avatar_url.startsWith("http") ? currentChat.avatar_url : `${STATIC_BASE}${currentChat.avatar_url}`} alt="" class="w-full h-full object-cover" />
                {:else}
                    <i class="bx {currentChat?.icon || 'bx-chat'}"></i>
                {/if}
            </div>
            <h3 class="font-bold text-[#2c293e] flex-1 truncate">{currentChat?.name}</h3>
        </header>

        <div bind:this={messageContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
            {#if messages.length === 0}
                <div class="h-full flex items-center justify-center text-center opacity-40">
                    <p class="text-sm">Chưa có tin nhắn nào. Bắt đầu ngay!</p>
                </div>
            {/if}
            {#each messages as msg}
                <div class="flex {msg.sender === 'me' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[80%] space-y-1">
                        {#if msg.sender !== "me" && currentChat?.isGlobal}
                            <span class="text-[10px] font-bold text-[#907aa9] px-1">{msg.sender_name}</span>
                        {/if}
                        <div class="px-4 py-2.5 rounded-2xl text-sm {msg.sender === 'me' ? 'bg-[#907aa9] text-white rounded-br-sm' : 'bg-[#fffaf3] border border-[#f2e9e1] text-[#2c293e] rounded-bl-sm'}">
                            {msg.text}
                        </div>
                        <div class="text-[9px] text-[#797593] px-1 {msg.sender === 'me' ? 'text-right' : ''}">{msg.time}</div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="p-3 border-t-2 border-[#f2e9e1] bg-[#faf4ed] pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <div class="flex items-center gap-2 bg-[#f2e9e1]/50 p-2 rounded-2xl">
                <input
                    type="text"
                    bind:value={messageInput}
                    onkeydown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    class="flex-1 bg-transparent border-none outline-none px-2 text-base h-11"
                />
                <button onclick={sendMessage} class="w-11 h-11 bg-[#907aa9] text-white rounded-xl flex items-center justify-center flex-shrink-0" aria-label="Gửi">
                    <i class="bx bx-send text-xl"></i>
                </button>
            </div>
        </div>
    </div>
{/if}

{#if searchOpen}
    <div class="fixed inset-0 z-50 flex items-end" in:fade>
        <div class="absolute inset-0 bg-[#2c293e]/50" onclick={() => (searchOpen = false)} onkeydown={(e) => e.key === "Escape" && (searchOpen = false)} role="button" tabindex="-1" aria-label="Đóng"></div>
        <div in:fly={{ y: 200 }} class="relative w-full bg-[#faf4ed] rounded-t-[2rem] p-5 space-y-4 max-h-[75vh] flex flex-col">
            <div class="flex items-center justify-between">
                <h3 class="font-black text-lg text-[#2c293e]">Tìm bạn bè</h3>
                <button onclick={() => (searchOpen = false)} class="w-9 h-9 flex items-center justify-center" aria-label="Đóng"><i class="bx bx-x text-2xl"></i></button>
            </div>
            <div class="flex gap-2">
                <input
                    bind:value={searchQuery}
                    onkeydown={(e) => e.key === "Enter" && runSearch()}
                    placeholder="Tên hoặc @id..."
                    class="flex-1 h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#907aa9]"
                />
                <button onclick={runSearch} class="px-5 bg-[#907aa9] text-white rounded-2xl font-bold min-h-[48px]">Tìm</button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
                {#if searching}
                    <div class="py-6 text-center opacity-40"><i class="bx bx-loader-alt animate-spin text-2xl"></i></div>
                {:else}
                    {#each searchResults as u}
                        <div class="flex items-center gap-3 p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
                            <div class="w-10 h-10 rounded-xl bg-[#907aa9]/10 flex items-center justify-center text-[#907aa9] font-bold overflow-hidden flex-shrink-0">
                                {#if u.avatar_url}
                                    <img src={u.avatar_url.startsWith("http") ? u.avatar_url : `${STATIC_BASE}${u.avatar_url}`} alt="" class="w-full h-full object-cover" />
                                {:else}
                                    {u.username[0].toUpperCase()}
                                {/if}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-sm text-[#2c293e] truncate">{u.username}</p>
                                <p class="text-[10px] text-[#797593]">@{u.public_id}</p>
                            </div>
                            {#if u.friend_status === "none"}
                                <button onclick={() => sendFriendRequest(u.id)} class="px-4 py-2 bg-[#907aa9] text-white text-xs font-bold rounded-xl min-h-[40px]">Kết bạn</button>
                            {:else}
                                <span class="text-[10px] text-[#797593] font-bold px-2">{u.friend_status === "pending" ? "Đã gửi" : "Bạn bè"}</span>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
{/if}
