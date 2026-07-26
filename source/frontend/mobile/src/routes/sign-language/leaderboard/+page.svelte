<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { currentUser } from "$lib/stores/auth.js";
    import { goto } from "$app/navigation";

    let leaderboard = $state([]);
    let myStats = $state(null);
    let loading = $state(true);
    let error = $state(null);

    async function fetchLeaderboard() {
        try {
            loading = true;
            leaderboard = await api.get("/sign-language/leaderboard?limit=50&offset=0");
            error = null;
        } catch (err) {
            error = "Không thể tải bảng xếp hạng.";
        } finally {
            loading = false;
        }
    }

    async function fetchMyStats() {
        if (!$currentUser) return;
        try {
            myStats = await api.get("/sign-language/leaderboard/me");
        } catch {}
    }

    onMount(() => {
        fetchLeaderboard();
        fetchMyStats();
    });

    const medalColor = (rank) =>
        rank === 1 ? "#ea9d34" : rank === 2 ? "#797593" : rank === 3 ? "#b4637a" : "#907aa9";
</script>

<div class="space-y-4 pb-4">
    <div class="flex items-center gap-3">
        <button onclick={() => goto("/sign-language")} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
            <i class="bx bx-left-arrow-alt text-2xl"></i>
        </button>
        <h1 class="text-xl font-black text-[#2c293e]">Bảng xếp hạng</h1>
    </div>

    {#if myStats}
        <div in:fade class="glass rounded-3xl p-5 border-2 border-[#ea9d34]/30 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-[#ea9d34] text-white flex items-center justify-center text-xl font-black flex-shrink-0">
                #{myStats.rank}
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-black text-[#2c293e] truncate">{myStats.username}</p>
                <p class="text-xs text-[#575279]">{myStats.total_score} điểm • {myStats.total_lessons_completed} bài</p>
            </div>
        </div>
    {/if}

    {#if loading}
        <div class="py-16 text-center opacity-40">
            <i class="bx bx-loader-alt animate-spin text-4xl text-[#907aa9]"></i>
        </div>
    {:else if error}
        <div class="py-16 text-center text-[#b4637a] font-bold">{error}</div>
    {:else if leaderboard.length === 0}
        <div class="py-16 text-center space-y-3 opacity-50">
            <i class="bx bx-trophy text-5xl"></i>
            <p>Chưa có ai trên bảng xếp hạng.</p>
        </div>
    {:else}
        <div class="space-y-2">
            {#each leaderboard as entry, i}
                <div in:fly={{ y: 10, delay: i * 20 }} class="glass rounded-2xl p-4 border border-[#f2e9e1] flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0" style="background:{medalColor(entry.rank)}">
                        {entry.rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-[#2c293e] text-sm truncate">{entry.username}</p>
                        <p class="text-[10px] text-[#797593]">{entry.total_lessons_completed} bài • {entry.current_streak} streak</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <div class="font-black text-[#ea9d34]">{entry.total_score}</div>
                        <div class="text-[9px] text-[#797593] uppercase">điểm</div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
