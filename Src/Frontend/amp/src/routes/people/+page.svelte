<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let searchResults = $state([]);
    let pendingRequests = $state([]);
    let searchQuery = $state("");
    let loading = $state(false);

    onMount(async () => {
        mounted = true;
        await loadPendingRequests();
    });

    async function handleSearch() {
        if (!searchQuery.trim()) {
            searchResults = [];
            return;
        }
        loading = true;
        try {
            const data = await api.get(`/social/users/search?q=${searchQuery}`);
            if (Array.isArray(data)) {
                searchResults = data;
            }
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function loadPendingRequests() {
        try {
            const data = await api.get("/social/friends/pending");
            if (Array.isArray(data)) {
                pendingRequests = data;
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function sendRequest(friendId) {
        try {
            const res = await api.post("/social/friends/request", {
                friend_id: friendId,
            });
            if (res.msg) {
                alert("Đã gửi lời mời kết bạn!");
                handleSearch();
            }
        } catch (err) {
            alert(err.msg || "Lỗi gửi yêu cầu");
        }
    }

    async function acceptRequest(requestId) {
        try {
            const res = await api.post("/social/friends/accept", {
                request_id: requestId,
            });
            if (res.msg) {
                alert("Đã chấp nhận kết bạn!");
                await loadPendingRequests();
            }
        } catch (err) {
            alert("Lỗi khi chấp nhận");
        }
    }

    let timeout;
    function onInput() {
        clearTimeout(timeout);
        timeout = setTimeout(handleSearch, 300);
    }
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    {#if mounted}
        <div in:fly={{ y: 20 }} class="space-y-12">
            <div
                class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-overlay pb-8"
            >
                <div>
                    <h1 class="text-5xl font-black text-rose-text">
                        Tìm <span class="text-iris">Bạn bè</span>
                    </h1>
                    <p class="text-muted mt-2 text-lg">
                        Kết nối với cộng đồng AMP ngay hôm nay.
                    </p>
                </div>
            </div>

            <div class="relative group">
                <span
                    class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-muted opacity-40 group-focus-within:opacity-100 transition-opacity"
                >
                    <i class="bx bx-search"></i>
                </span>
                <input
                    type="text"
                    bind:value={searchQuery}
                    oninput={onInput}
                    placeholder="Tìm kiếm theo tên hoặc @public_id..."
                    class="w-full h-16 bg-white border-2 border-overlay rounded-[2rem] pl-12 pr-8 text-lg font-bold outline-none focus:border-iris focus:shadow-xl focus:shadow-iris/5 transition-all"
                />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-1 gap-12">
                {#if pendingRequests.length > 0}
                    <div class="space-y-6">
                        <h2
                            class="text-xl font-black text-rose-text flex items-center gap-3"
                        >
                            <span
                                class="w-8 h-8 rounded-full bg-love/10 text-love flex items-center justify-center text-sm"
                                >{pendingRequests.length}</span
                            >
                            Lời mời kết bạn
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {#each pendingRequests as req}
                                <div
                                    class="glass p-6 rounded-[2.5rem] flex items-center gap-4 border border-white/60"
                                >
                                    <div
                                        class="w-14 h-14 rounded-2xl bg-white border border-overlay overflow-hidden shadow-sm"
                                    >
                                        {#if req.avatar_url}
                                            <img
                                                src={req.avatar_url.startsWith(
                                                    "http",
                                                )
                                                    ? req.avatar_url
                                                    : `${STATIC_BASE}${req.avatar_url}`}
                                                alt="Avatar"
                                                class="w-full h-full object-cover"
                                            />
                                        {:else}
                                            <div
                                                class="w-full h-full flex items-center justify-center font-black text-iris bg-iris/5"
                                            >
                                                {req.username[0]}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="font-black text-rose-text truncate"
                                        >
                                            {req.username}
                                        </div>
                                        <div
                                            class="text-[10px] font-bold text-muted uppercase tracking-widest"
                                        >
                                            @{req.public_id}
                                        </div>
                                    </div>
                                    <button
                                        onclick={() =>
                                            acceptRequest(req.request_id)}
                                        class="bg-iris text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-iris/20"
                                        >Đồng ý</button
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <div class="space-y-6">
                    <h2 class="text-xl font-black text-rose-text">
                        Kết quả tìm kiếm
                    </h2>

                    {#if loading}
                        <div class="py-10 text-center opacity-40">
                            <i class="bx bx-loader-alt animate-spin text-3xl"
                            ></i>
                        </div>
                    {:else if searchResults.length === 0}
                        <div
                            class="py-20 text-center space-y-4 bg-overlay/20 rounded-[3rem] border border-dashed border-overlay/50"
                        >
                            <div class="text-6xl text-muted/30">
                                <i class="bx bx-user-plus"></i>
                            </div>
                            <p class="text-muted font-bold tracking-tight">
                                Nhập tên hoặc ID để tìm kiếm người dùng
                            </p>
                        </div>
                    {:else}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {#each searchResults as user}
                                <div
                                    class="glass p-8 rounded-[3rem] border border-white/60 hover:bg-white transition-all group relative overflow-hidden"
                                >
                                    <div
                                        class="flex items-center gap-6 relative z-10"
                                    >
                                        <div
                                            class="w-20 h-20 rounded-[1.5rem] bg-white border border-overlay overflow-hidden shadow-xl group-hover:scale-105 transition-transform"
                                        >
                                            {#if user.avatar_url}
                                                <img
                                                    src={user.avatar_url.startsWith(
                                                        "http",
                                                    )
                                                        ? user.avatar_url
                                                        : `${STATIC_BASE}${user.avatar_url}`}
                                                    alt="Avatar"
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                <div
                                                    class="w-full h-full flex items-center justify-center text-3xl font-black text-iris bg-iris/5"
                                                >
                                                    {user.username[0]}
                                                </div>
                                            {/if}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h3
                                                class="text-xl font-black text-rose-text truncate"
                                            >
                                                {user.username}
                                            </h3>
                                            <p
                                                class="text-[10px] font-bold text-muted uppercase tracking-widest mb-4"
                                            >
                                                @{user.public_id}
                                            </p>

                                            <div class="flex gap-2">
                                                {#if user.friend_status === "none"}
                                                    <button
                                                        onclick={() =>
                                                            sendRequest(
                                                                user.id,
                                                            )}
                                                        class="flex-1 bg-iris text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-iris/20 hover:bg-iris-dark transition-all"
                                                    >
                                                        Kết bạn
                                                    </button>
                                                {:else if user.friend_status === "pending"}
                                                    <button
                                                        class="flex-1 bg-overlay text-muted px-4 py-2 rounded-xl text-xs font-bold cursor-default"
                                                        disabled
                                                    >
                                                        Đã gửi yêu cầu
                                                    </button>
                                                {:else if user.friend_status === "accepted"}
                                                    <button
                                                        onclick={() =>
                                                            goto(
                                                                `/chat?id=${user.id}`,
                                                            )}
                                                        class="flex-1 bg-white border border-iris text-iris px-4 py-2 rounded-xl text-xs font-bold hover:bg-iris/5 transition-all"
                                                    >
                                                        Nhắn tin
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="absolute -right-4 -bottom-4 w-24 h-24 bg-iris/5 rounded-full blur-2xl group-hover:bg-iris/10 transition-colors"
                                    ></div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    input {
        background: white !important;
        padding-left: 3rem !important;
    }
</style>
