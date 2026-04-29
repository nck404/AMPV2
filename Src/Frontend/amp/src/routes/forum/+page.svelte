<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let activeTab = $state("Mới nhất");
    let posts = $state([]);
    let loading = $state(true);

    onMount(async () => {
        mounted = true;
        await loadPosts();
    });

    async function loadPosts() {
        loading = true;
        try {
            const data = await api.get("/forum/posts");
            if (Array.isArray(data)) {
                posts = data;
            }
        } catch (err) {
            console.error("Failed to load posts", err);
        } finally {
            loading = false;
        }
    }

    function getSnippet(content) {
        if (!content) return "";
        return (
            content
                .replace(/[#*`_~]/g, "")
                .replace(/\[(.*?)\]\(.*?\)/g, "$1")
                .substring(0, 150) + "..."
        );
    }
</script>

<div class="max-w-5xl mx-auto px-6 py-12">
    {#if mounted}
        <div class="space-y-8">
            <div
                class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-overlay"
            >
                <div>
                    <h1 class="text-5xl font-black text-rose-text">
                        Cộng đồng <span class="text-iris">AMP</span>
                    </h1>
                    <p class="text-muted mt-2 text-lg">
                        Chia sẻ kiến thức, thảo luận và kết nối không rào cản.
                    </p>
                </div>
                <button
                    onclick={() => goto("/forum/create")}
                    class="button px-8 h-12 flex items-center gap-2 group"
                >
                    <i
                        class="bx bx-plus-circle text-xl group-hover:rotate-90 transition-transform"
                    ></i> Viết bài mới
                </button>
            </div>

            <div
                class="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none"
            >
                {#each ["Mới nhất", "Xu hướng", "Giải đáp", "Truyền cảm hứng"] as tab}
                    <button
                        onclick={() => (activeTab = tab)}
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap {activeTab ===
                        tab
                            ? 'bg-iris text-white shadow-lg'
                            : 'bg-surface text-subtle border border-overlay hover:bg-overlay/50'}"
                    >
                        {tab}
                    </button>
                {/each}
            </div>

            <div class="space-y-6">
                {#if loading}
                    <div class="py-20 text-center opacity-40">
                        <i
                            class="bx bx-loader-alt animate-spin text-4xl text-iris"
                        ></i>
                        <p
                            class="mt-2 font-bold uppercase tracking-widest text-xs"
                        >
                            Đang tải thảo luận...
                        </p>
                    </div>
                {:else if posts.length === 0}
                    <div
                        class="py-20 text-center space-y-6 p-12 bg-overlay/10 rounded-[3rem] border-2 border-dashed border-overlay"
                    >
                        <div class="text-8xl opacity-20">
                            <i class="bx bx-message-square-dots"></i>
                        </div>
                        <div class="space-y-2">
                            <h2 class="text-2xl font-black text-rose-text">
                                Diễn đàn còn trống...
                            </h2>
                            <p class="text-muted max-w-sm mx-auto">
                                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ
                                kiến thức bổ ích cho cộng đồng!
                            </p>
                        </div>
                        <button
                            onclick={() => goto("/forum/create")}
                            class="button px-10">Bắt đầu ngay</button
                        >
                    </div>
                {:else}
                    {#each posts as post, i}
                        <button
                            onclick={() => goto(`/forum/${post.id}`)}
                            in:fly={{ y: 20, delay: i * 100 }}
                            class="w-full text-left glass p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/60 hover:bg-white/95 transition-all duration-500 group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-rose-text/5 relative"
                        >
                            <div class="flex items-start gap-6">
                                <div
                                    class="hidden sm:flex flex-col items-center gap-2 px-3 py-4 bg-overlay/30 rounded-2xl h-fit"
                                >
                                    <div class="text-2xl text-rose-text">
                                        <i class="bx bx-upvote"></i>
                                    </div>
                                    <span
                                        class="font-bold text-rose-text text-sm"
                                        >{post.upvotes}</span
                                    >
                                    <div
                                        class="text-2xl opacity-30 text-rose-text"
                                    >
                                        <i class="bx bx-downvote"></i>
                                    </div>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div
                                        class="flex items-center gap-3 mb-4 text-xs font-bold"
                                    >
                                        <div
                                            class="w-8 h-8 rounded-full bg-iris/10 flex items-center justify-center text-lg overflow-hidden border border-iris/20"
                                        >
                                            {#if post.author.avatar_url}
                                                <img
                                                    src={post.author.avatar_url.startsWith(
                                                        "http",
                                                    )
                                                        ? post.author.avatar_url
                                                        : `${STATIC_BASE}${post.author.avatar_url}`}
                                                    alt="Avatar"
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                {post.author.username[0].toUpperCase()}
                                            {/if}
                                        </div>
                                        <span class="text-rose-text"
                                            >@{post.author.public_id}</span
                                        >
                                        <span class="text-muted opacity-40"
                                            >•</span
                                        >
                                        <span
                                            class="text-muted font-medium uppercase tracking-tighter text-[10px]"
                                            >{post.time}</span
                                        >
                                    </div>

                                    <h2
                                        class="text-2xl font-black text-rose-text mb-3 group-hover:text-iris transition-colors leading-tight truncate"
                                    >
                                        {post.title}
                                    </h2>

                                    <p
                                        class="text-subtle mb-6 line-clamp-2 leading-relaxed text-sm"
                                    >
                                        {getSnippet(post.content)}
                                    </p>

                                    <div
                                        class="flex flex-wrap items-center justify-between gap-4"
                                    >
                                        <div class="flex items-center gap-2">
                                            {#each post.tags as tag}
                                                <span
                                                    class="px-3 py-1 bg-overlay/40 rounded-full text-[9px] uppercase font-black text-muted tracking-wide"
                                                    >#{tag.trim()}</span
                                                >
                                            {/each}
                                        </div>

                                        <div
                                            class="flex items-center gap-6 opacity-60 group-hover:opacity-100 transition-opacity"
                                        >
                                            <div
                                                class="flex items-center gap-1.5 text-xs font-bold text-muted"
                                            >
                                                <i
                                                    class="bx bx-comment-detail text-lg"
                                                ></i>
                                                {post.comments_count || 0}
                                            </div>
                                            <div
                                                class="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-love transition-colors"
                                            >
                                                <i class="bx bx-heart text-lg"
                                                ></i>
                                                {Object.values(
                                                    post.reactions || {},
                                                ).reduce((a, b) => a + b, 0)}
                                            </div>
                                            <div
                                                class="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-iris transition-colors"
                                            >
                                                <i
                                                    class="bx bx-share-alt text-lg"
                                                ></i> Share
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    :global(.scrollbar-none::-webkit-scrollbar) {
        display: none;
    }
</style>
