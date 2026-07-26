<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { currentUser } from "$lib/stores/auth.js";

    let posts = $state([]);
    let loading = $state(true);

    onMount(loadPosts);

    async function loadPosts() {
        loading = true;
        try {
            const data = await api.get("/forum/posts");
            if (Array.isArray(data)) posts = data;
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    function getSnippet(content) {
        if (!content) return "";
        return content.replace(/[#*`_~]/g, "").substring(0, 110) + "...";
    }

    function goCreate() {
        if (!$currentUser) {
            goto("/login");
            return;
        }
        goto("/forum/create");
    }
</script>

<div class="space-y-4 pb-4">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-black text-[#2c293e]">Cộng đồng AMP</h1>
            <p class="text-xs text-[#575279] mt-0.5">Thảo luận & kết nối không rào cản</p>
        </div>
        <button onclick={goCreate} class="w-12 h-12 rounded-2xl bg-[#907aa9] text-white flex items-center justify-center shadow-lg flex-shrink-0" aria-label="Viết bài mới">
            <i class="bx bx-plus text-2xl"></i>
        </button>
    </div>

    {#if loading}
        <div class="py-16 text-center opacity-40">
            <i class="bx bx-loader-alt animate-spin text-4xl text-[#907aa9]"></i>
        </div>
    {:else if posts.length === 0}
        <div class="py-16 text-center space-y-4 bg-[#f2e9e1]/30 rounded-3xl border-2 border-dashed border-[#f2e9e1]">
            <i class="bx bx-message-square-dots text-6xl text-[#907aa9]/30"></i>
            <p class="text-[#575279] font-bold px-6">Diễn đàn còn trống. Hãy là người đầu tiên chia sẻ!</p>
            <button onclick={goCreate} class="px-8 py-3 bg-[#907aa9] text-white font-bold rounded-2xl min-h-[48px]">Bắt đầu ngay</button>
        </div>
    {:else}
        <div class="space-y-3">
            {#each posts as post, i}
                <button
                    in:fly={{ y: 15, delay: i * 40 }}
                    onclick={() => goto(`/forum/${post.id}`)}
                    class="w-full text-left glass p-4 rounded-3xl border border-[#f2e9e1] space-y-2"
                >
                    <div class="flex items-center gap-2 text-xs font-bold">
                        <div class="w-7 h-7 rounded-full bg-[#907aa9]/10 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                            {#if post.author.avatar_url}
                                <img src={post.author.avatar_url.startsWith("http") ? post.author.avatar_url : `${STATIC_BASE}${post.author.avatar_url}`} alt="" class="w-full h-full object-cover" />
                            {:else}
                                {post.author.username[0].toUpperCase()}
                            {/if}
                        </div>
                        <span class="text-[#907aa9]">@{post.author.public_id}</span>
                    </div>
                    <h2 class="text-lg font-black text-[#2c293e] leading-tight">{post.title}</h2>
                    <p class="text-sm text-[#575279] line-clamp-2">{getSnippet(post.content)}</p>
                    <div class="flex items-center gap-4 text-xs font-bold text-[#797593] pt-1">
                        <span class="flex items-center gap-1"><i class="bx bx-comment-detail"></i> {post.comments_count || 0}</span>
                        <span class="flex items-center gap-1"><i class="bx bx-heart"></i> {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}</span>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
