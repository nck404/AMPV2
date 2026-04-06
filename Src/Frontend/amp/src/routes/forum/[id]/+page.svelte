<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import CommentSection from "$lib/components/CommentSection.svelte";

    let mounted = $state(false);
    let post = $state(null);
    let loading = $state(true);
    let error = $state(null);

    onMount(async () => {
        mounted = true;
        const postId = page.params.id;
        await loadPost(postId);
    });

    async function loadPost(id) {
        loading = true;
        try {
            const data = await api.get(`/forum/posts/${id}`);
            if (data.id) {
                post = data;
            } else {
                error = "Không tìm thấy bài viết.";
            }
        } catch (err) {
            error = "Lỗi khi tải bài viết.";
        } finally {
            loading = false;
        }
    }

    let renderedContent = $derived(
        post && typeof marked !== "undefined"
            ? marked.parse(post.content)
            : post?.content || "",
    );
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    {#if mounted}
        {#if loading}
            <div class="py-40 text-center opacity-40">
                <i class="bx bx-loader-alt animate-spin text-5xl text-iris"></i>
                <p class="mt-4 font-black uppercase tracking-widest text-sm">
                    Đang tải nội dung bài viết...
                </p>
            </div>
        {:else if error}
            <div class="py-40 text-center space-y-6">
                <div class="text-8xl">
                    <i class="bx bx-error-circle text-love"></i>
                </div>
                <h2 class="text-3xl font-black text-rose-text">{error}</h2>
                <button onclick={() => goto("/forum")} class="button px-8"
                    >Quay lại diễn đàn</button
                >
            </div>
        {:else if post}
            <div in:fade class="space-y-10">
                <!-- Back Button & Tools -->
                <div class="flex items-center justify-between">
                    <button
                        onclick={() => goto("/forum")}
                        class="flex items-center gap-2 group text-muted hover:text-iris transition-colors font-bold"
                    >
                        <i
                            class="bx bx-arrow-back text-xl group-hover:-translate-x-1 transition-transform"
                        ></i>
                        Quay lại cộng đồng
                    </button>
                    <div class="flex items-center gap-3">
                        <button
                            class="w-10 h-10 rounded-xl bg-surface border border-overlay flex items-center justify-center hover:text-love transition-colors"
                            aria-label="Lưu"
                            ><i class="bx bx-bookmark"></i></button
                        >
                        <button
                            class="w-10 h-10 rounded-xl bg-surface border border-overlay flex items-center justify-center hover:text-iris transition-colors"
                            aria-label="Chia sẻ"
                            ><i class="bx bx-share-alt"></i></button
                        >
                    </div>
                </div>

                <!-- Post Header -->
                <header class="space-y-6">
                    <div
                        class="flex flex-wrap gap-2 text-[10px] uppercase font-black tracking-widest text-iris"
                    >
                        {#each post.tags as tag}
                            <span class="px-3 py-1 bg-iris/10 rounded-full"
                                >#{tag.trim()}</span
                            >
                        {/each}
                    </div>
                    <h1
                        class="text-5xl font-black text-rose-text leading-tight"
                    >
                        {post.title}
                    </h1>

                    <div
                        class="flex items-center gap-4 py-6 border-y border-overlay"
                    >
                        <div
                            class="w-14 h-14 rounded-2xl bg-white shadow-lg border border-overlay overflow-hidden"
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
                                <div
                                    class="w-full h-full flex items-center justify-center text-2xl font-black text-iris bg-iris/10"
                                >
                                    {post.author.username[0].toUpperCase()}
                                </div>
                            {/if}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <div class="font-black text-rose-text text-lg">
                                    @{post.author.public_id}
                                </div>
                                {#if post.author.is_admin}
                                    <span
                                        class="px-3 py-1 bg-gold text-white text-[10px] font-black rounded-full shadow-lg shadow-gold/20 flex items-center gap-1 uppercase"
                                    >
                                        <i class="bx bxs-shield-check"></i> Quản
                                        trị viên
                                    </span>
                                {/if}
                            </div>
                            <div
                                class="text-xs font-bold text-muted uppercase tracking-widest"
                            >
                                Đăng vào {post.time}
                            </div>
                        </div>
                        <button
                            class="px-6 py-2 bg-iris/10 text-iris rounded-xl font-bold text-sm hover:bg-iris hover:text-white transition-all"
                        >
                            Theo dõi
                        </button>
                    </div>
                </header>

                <!-- Post Content (Rendered Markdown) -->
                <article class="prose prose-rose max-w-none text-lg">
                    {@html renderedContent}
                </article>

                <CommentSection {post} />
            </div>
        {/if}
    {/if}
</div>

<style>
    :global(.prose h1) {
        font-size: 2.5rem;
        font-weight: 900;
        margin-bottom: 2rem;
        color: #575279;
        line-height: 1.2;
    }
    :global(.prose h2) {
        font-size: 2rem;
        font-weight: 800;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
        color: #575279;
    }
    :global(.prose h3) {
        font-size: 1.5rem;
        font-weight: 800;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #575279;
    }
    :global(.prose p) {
        margin-bottom: 1.5rem;
        line-height: 1.8;
        color: #6e6a86;
    }
    :global(.prose code) {
        background: #f2e9e1;
        padding: 0.2rem 0.5rem;
        border-radius: 0.5rem;
        font-family: "Fira Code", monospace;
        color: #eb6f92;
        font-size: 0.9em;
    }
    :global(.prose pre) {
        background: #1f1d2e;
        color: #e0def4;
        padding: 2rem;
        border-radius: 1.5rem;
        overflow-x: auto;
        margin: 2rem 0;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
    }
    :global(.prose ul, .prose ol) {
        padding-left: 1.5rem;
        margin-bottom: 2rem;
    }
    :global(.prose li) {
        margin-bottom: 0.75rem;
        color: #6e6a86;
    }
    :global(.prose blockquote) {
        border-left: 4px solid #907aa9;
        padding-left: 1.5rem;
        font-style: italic;
        color: #907aa9;
        margin: 2rem 0;
    }
    :global(.prose img) {
        border-radius: 1.5rem;
        margin: 2rem 0;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
    }
</style>
