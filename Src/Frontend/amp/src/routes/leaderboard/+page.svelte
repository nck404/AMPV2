<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api.js";

    let mounted = false;
    let currentUser = null;
    let activeTab = "global";
    let leaderboard = [];
    let myStats = null;
    let loading = true;
    let error = null;

    let limit = 50;
    let offset = 0;
    let hasMore = true;

    async function fetchLeaderboard() {
        try {
            loading = true;
            const res = await api.get(
                `/sign-language/leaderboard?limit=${limit}&offset=${offset}`,
            );
            leaderboard = res;
            hasMore = res.length === limit;
            error = null;
        } catch (err) {
            if (err.status === 401) {
                error = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setTimeout(() => (window.location.href = "/login"), 2000);
            } else {
                error = "Không thể tải bảng xếp hạng. Vui lòng thử lại.";
            }
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function fetchMyStats() {
        if (!currentUser) return;
        try {
            const res = await api.get("/sign-language/leaderboard/me");
            myStats = res;
        } catch (err) {
            if (err.response?.status === 401) {
                console.warn("Auth expired while fetching stats");
            } else {
                console.error("Failed to load personal stats", err);
            }
        }
    }

    function loadMore() {
        if (!hasMore || loading) return;
        offset += limit;
        fetchLeaderboard();
    }

    function getRankIcon(rank) {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    }

    function formatAccuracy(acc) {
        return acc ? acc.toFixed(1) + "%" : "0%";
    }

    onMount(() => {
        mounted = true;
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData && token) {
            try {
                currentUser = JSON.parse(userData);
                fetchMyStats();
            } catch (e) {
                console.error("Invalid user data in localStorage", e);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                currentUser = null;
            }
        }

        fetchLeaderboard();
    });
</script>

<svelte:head>
    <title>Bảng xếp hạng - AMP</title>
    <meta
        name="description"
        content="Xem bảng xếp hạng học tập và thống kê cá nhân của bạn"
    />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-12">
    {#if mounted}
        <div class="space-y-8">
            <div class="text-center space-y-4">
                <h1 class="text-4xl md:text-5xl font-black text-rose-text">
                    🏆 Bảng xếp hạng
                </h1>
                <p class="text-subtle text-lg max-w-2xl mx-auto">
                    Theo dõi tiến độ học tập và so sánh với cộng đồng AMP
                </p>
            </div>

            <div class="flex justify-center">
                <div class="glass p-1 rounded-2xl flex">
                    <button
                        class="px-6 py-3 rounded-xl font-bold transition-all {activeTab ===
                        'global'
                            ? 'bg-iris text-white shadow-lg'
                            : 'text-subtle hover:text-iris'}"
                        onclick={() => (activeTab = "global")}
                    >
                        Bảng xếp hạng chung
                    </button>
                    {#if currentUser}
                        <button
                            class="px-6 py-3 rounded-xl font-bold transition-all {activeTab ===
                            'personal'
                                ? 'bg-iris text-white shadow-lg'
                                : 'text-subtle hover:text-iris'}"
                            onclick={() => (activeTab = "personal")}
                        >
                            Thống kê của tôi
                        </button>
                    {/if}
                </div>
            </div>

            {#if activeTab === "global"}
                <div in:fly={{ y: 20, duration: 500 }}>
                    {#if loading && leaderboard.length === 0}
                        <div class="text-center py-20">
                            <div
                                class="animate-spin w-12 h-12 border-4 border-iris border-t-transparent rounded-full mx-auto mb-4"
                            ></div>
                            <p class="text-subtle">Đang tải bảng xếp hạng...</p>
                        </div>
                    {:else if error}
                        <div class="text-center py-20">
                            <i class="bx bx-error text-6xl text-love mb-4"></i>
                            <p class="text-subtle">{error}</p>
                        </div>
                    {:else}
                        <div class="space-y-4">
                            {#each leaderboard as user, i}
                                <div
                                    class="glass p-6 rounded-2xl hover:bg-white/50 transition-all"
                                    in:fly={{
                                        y: 20,
                                        delay: i * 50,
                                        duration: 400,
                                    }}
                                >
                                    <div class="flex items-center gap-6">
                                        <div
                                            class="text-3xl font-black text-rose-text min-w-[60px] text-center"
                                        >
                                            {getRankIcon(user.rank)}
                                        </div>

                                        <div
                                            class="w-12 h-12 rounded-full bg-iris/20 flex items-center justify-center overflow-hidden"
                                        >
                                            {#if user.avatar_url}
                                                <img
                                                    src={user.avatar_url.startsWith(
                                                        "http",
                                                    )
                                                        ? user.avatar_url
                                                        : `/static/${user.avatar_url}`}
                                                    alt={user.username}
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                <span
                                                    class="text-iris font-bold text-lg"
                                                >
                                                    {user.username[0].toUpperCase()}
                                                </span>
                                            {/if}
                                        </div>

                                        <div class="flex-1">
                                            <h3
                                                class="font-bold text-rose-text text-lg"
                                            >
                                                {user.username}
                                            </h3>
                                            <p class="text-subtle text-sm">
                                                {user.total_lessons_completed} bài
                                                học hoàn thành
                                            </p>
                                        </div>

                                        <div class="text-right space-y-1">
                                            <div
                                                class="text-2xl font-black text-gold"
                                            >
                                                {user.total_score.toLocaleString()}
                                            </div>
                                            <div class="text-sm text-subtle">
                                                Độ chính xác: {formatAccuracy(
                                                    user.average_accuracy,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}

                            {#if hasMore}
                                <div class="text-center pt-8">
                                    <button
                                        class="glass px-8 py-4 rounded-2xl font-bold text-iris hover:bg-iris/10 transition-all {loading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''}"
                                        onclick={loadMore}
                                        disabled={loading}
                                    >
                                        {#if loading}
                                            <div
                                                class="animate-spin w-5 h-5 border-2 border-iris border-t-transparent rounded-full inline-block mr-2"
                                            ></div>
                                            Đang tải...
                                        {:else}
                                            Tải thêm
                                        {/if}
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/if}

            {#if activeTab === "personal" && currentUser}
                <div in:fly={{ y: 20, duration: 500 }}>
                    {#if myStats}
                        <div class="space-y-8">
                            <div class="text-center">
                                <div
                                    class="inline-block glass p-8 rounded-[3rem] shadow-2xl"
                                >
                                    <div class="text-8xl mb-4">
                                        {getRankIcon(myStats.rank)}
                                    </div>
                                    <h2
                                        class="text-3xl font-black text-rose-text mb-2"
                                    >
                                        Hạng {myStats.rank}
                                    </h2>
                                    <p class="text-subtle">
                                        trong cộng đồng AMP
                                    </p>
                                </div>
                            </div>

                            <div
                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                <div class="glass p-6 rounded-2xl text-center">
                                    <div
                                        class="text-4xl font-black text-gold mb-2"
                                    >
                                        {myStats.total_score.toLocaleString()}
                                    </div>
                                    <p class="text-subtle font-medium">
                                        Tổng điểm
                                    </p>
                                </div>

                                <div class="glass p-6 rounded-2xl text-center">
                                    <div
                                        class="text-4xl font-black text-iris mb-2"
                                    >
                                        {myStats.total_lessons_completed}
                                    </div>
                                    <p class="text-subtle font-medium">
                                        Bài học hoàn thành
                                    </p>
                                </div>

                                <div class="glass p-6 rounded-2xl text-center">
                                    <div
                                        class="text-4xl font-black text-love mb-2"
                                    >
                                        {myStats.highest_streak}
                                    </div>
                                    <p class="text-subtle font-medium">
                                        Chuỗi cao nhất
                                    </p>
                                </div>

                                <div class="glass p-6 rounded-2xl text-center">
                                    <div
                                        class="text-4xl font-black text-green-500 mb-2"
                                    >
                                        {formatAccuracy(
                                            myStats.average_accuracy,
                                        )}
                                    </div>
                                    <p class="text-subtle font-medium">
                                        Độ chính xác trung bình
                                    </p>
                                </div>
                            </div>

                            <div class="text-center">
                                <a
                                    href="/sign-language"
                                    class="inline-flex items-center gap-3 glass px-8 py-4 rounded-2xl font-bold text-iris hover:bg-iris/10 transition-all"
                                >
                                    <i class="bx bx-book-open text-2xl"></i>
                                    Tiếp tục học tập
                                    <i class="bx bx-right-arrow-alt text-xl"
                                    ></i>
                                </a>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center py-20">
                            <i class="bx bx-bar-chart text-6xl text-subtle mb-4"
                            ></i>
                            <h3 class="text-xl font-bold text-rose-text mb-2">
                                Chưa có dữ liệu thống kê
                            </h3>
                            <p class="text-subtle mb-6">
                                Bắt đầu học tập để xem thống kê của bạn!
                            </p>
                            <a
                                href="/sign-language"
                                class="inline-flex items-center gap-3 glass px-8 py-4 rounded-2xl font-bold text-iris hover:bg-iris/10 transition-all"
                            >
                                <i class="bx bx-book-open text-2xl"></i>
                                Bắt đầu học
                            </a>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .glass {
        background: rgba(255, 250, 243, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(215, 130, 126, 0.2);
    }
</style>
