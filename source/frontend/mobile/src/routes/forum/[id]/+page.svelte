<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { isLoggedIn } from "$lib/stores/auth.js";
    import { speak } from "$lib/speech.js";
    import { haptic } from "$lib/stores/access.js";

    let post = $state(null);
    let loading = $state(true);
    let error = $state(null);

    let comments = $state([]);
    let commentsLoading = $state(true);
    let newComment = $state("");
    let submitting = $state(false);
    let replyTo = $state(null);

    onMount(async () => {
        const postId = page.params.id;
        await Promise.all([loadPost(postId), loadComments(postId)]);
    });

    async function loadPost(id) {
        loading = true;
        try {
            const data = await api.get(`/forum/posts/${id}`);
            if (data.id) post = data;
            else error = "Không tìm thấy bài viết.";
        } catch {
            error = "Lỗi khi tải bài viết.";
        } finally {
            loading = false;
        }
    }

    async function loadComments(id) {
        commentsLoading = true;
        try {
            const data = await api.get(`/forum/posts/${id}/comments`);
            if (Array.isArray(data)) comments = data;
        } catch (err) {
            console.error(err);
        } finally {
            commentsLoading = false;
        }
    }

    function requireLogin() {
        if (!isLoggedIn()) {
            goto("/login");
            return false;
        }
        return true;
    }

    async function toggleLike() {
        if (!requireLogin()) return;
        haptic(10);
        try {
            await api.post("/forum/react", { target_type: "post", target_id: post.id, type: post.user_reaction ? null : "like" });
            await loadPost(post.id);
        } catch (err) {
            console.error(err);
        }
    }

    async function toggleCommentLike(comment) {
        if (!requireLogin()) return;
        haptic(10);
        try {
            await api.post("/forum/react", { target_type: "comment", target_id: comment.id, type: comment.user_reaction ? null : "like" });
            await loadComments(post.id);
        } catch (err) {
            console.error(err);
        }
    }

    async function submitComment(parentId = null) {
        if (!requireLogin()) return;
        if (!newComment.trim()) return;
        submitting = true;
        try {
            const res = await api.post(`/forum/posts/${post.id}/comments`, { content: newComment, parent_id: parentId });
            if (res.id) {
                newComment = "";
                replyTo = null;
                speak("Đã gửi bình luận");
                await loadComments(post.id);
            }
        } catch {
            speak("Lỗi khi gửi bình luận", { force: true });
        } finally {
            submitting = false;
        }
    }

    function totalReactions(obj) {
        if (!obj) return 0;
        return Object.values(obj).reduce((a, b) => a + b, 0);
    }
</script>

<div class="space-y-4 pb-8">
    <button onclick={() => goto("/forum")} class="flex items-center gap-2 text-[#575279] font-bold">
        <i class="bx bx-arrow-back text-xl"></i> Quay lại cộng đồng
    </button>

    {#if loading}
        <div class="py-24 text-center opacity-40"><i class="bx bx-loader-alt animate-spin text-4xl"></i></div>
    {:else if error}
        <div class="py-24 text-center space-y-4">
            <i class="bx bx-error-circle text-6xl text-[#b4637a]"></i>
            <h2 class="text-xl font-black text-[#2c293e]">{error}</h2>
        </div>
    {:else if post}
        <article in:fade class="space-y-4">
            <div class="flex flex-wrap gap-2">
                {#each post.tags as tag}
                    <span class="px-3 py-1 bg-[#907aa9]/10 text-[#907aa9] rounded-full text-[10px] font-black uppercase">#{tag.trim()}</span>
                {/each}
            </div>
            <h1 class="text-2xl font-black text-[#2c293e] leading-tight">{post.title}</h1>

            <div class="flex items-center gap-3 py-4 border-y border-[#f2e9e1]">
                <div class="w-11 h-11 rounded-xl bg-[#fffaf3] border border-[#f2e9e1] overflow-hidden flex-shrink-0">
                    {#if post.author.avatar_url}
                        <img src={post.author.avatar_url.startsWith("http") ? post.author.avatar_url : `${STATIC_BASE}${post.author.avatar_url}`} alt="" class="w-full h-full object-cover" />
                    {:else}
                        <div class="w-full h-full flex items-center justify-center font-black text-[#907aa9] bg-[#907aa9]/10">{post.author.username[0].toUpperCase()}</div>
                    {/if}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-black text-[#2c293e] text-sm truncate">@{post.author.public_id}</div>
                    <div class="text-[10px] text-[#797593] font-bold">{post.time}</div>
                </div>
            </div>

            <p class="text-base text-[#575279] leading-relaxed whitespace-pre-wrap">{post.content}</p>

            <div class="flex items-center gap-3 pt-2">
                <button
                    onclick={toggleLike}
                    class="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm min-h-[48px] transition-all {post.user_reaction ? 'bg-[#907aa9] text-white' : 'bg-[#f2e9e1] text-[#575279]'}"
                >
                    <i class="bx {post.user_reaction ? 'bxs-like' : 'bx-like'} text-lg"></i>
                    {totalReactions(post.reactions)} Thích
                </button>
                <span class="text-sm font-bold text-[#797593]">{comments.length} bình luận</span>
            </div>
        </article>

        <div class="space-y-4 pt-4 border-t border-[#f2e9e1]">
            <h2 class="font-black text-[#2c293e]">Bình luận</h2>
            <div class="flex gap-2 items-end">
                <textarea
                    bind:value={newComment}
                    placeholder="Viết bình luận..."
                    rows="2"
                    class="flex-1 px-4 py-3 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#907aa9] resize-none text-sm"
                ></textarea>
                <button
                    onclick={() => submitComment()}
                    disabled={submitting || !newComment.trim()}
                    class="w-12 h-12 rounded-2xl bg-[#907aa9] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                    aria-label="Gửi bình luận"
                >
                    <i class="bx {submitting ? 'bx-loader-alt animate-spin' : 'bxs-send'} text-xl"></i>
                </button>
            </div>

            {#if commentsLoading}
                <div class="py-8 text-center opacity-40"><i class="bx bx-loader-alt animate-spin text-2xl"></i></div>
            {:else}
                <div class="space-y-4">
                    {#each comments as comment}
                        <div class="flex gap-2">
                            <div class="w-8 h-8 rounded-full bg-[#fffaf3] border border-[#f2e9e1] overflow-hidden flex-shrink-0">
                                {#if comment.author.avatar_url}
                                    <img src={comment.author.avatar_url.startsWith("http") ? comment.author.avatar_url : `${STATIC_BASE}${comment.author.avatar_url}`} alt="" class="w-full h-full object-cover" />
                                {:else}
                                    <div class="w-full h-full flex items-center justify-center font-bold text-[#907aa9] text-xs">{comment.author.username[0]}</div>
                                {/if}
                            </div>
                            <div class="flex-1 space-y-1 min-w-0">
                                <div class="bg-[#fffaf3] px-3 py-2 rounded-2xl rounded-tl-none border border-[#f2e9e1]">
                                    <span class="font-black text-xs text-[#2c293e]">@{comment.author.public_id}</span>
                                    <p class="text-sm mt-0.5 text-[#575279]">{comment.content}</p>
                                </div>
                                <div class="flex items-center gap-3 px-1 text-xs font-bold text-[#797593]">
                                    <button onclick={() => toggleCommentLike(comment)} class="{comment.user_reaction ? 'text-[#907aa9]' : ''}">
                                        Thích {totalReactions(comment.reactions) > 0 ? `(${totalReactions(comment.reactions)})` : ""}
                                    </button>
                                    <button onclick={() => (replyTo = replyTo === comment.id ? null : comment.id)}>Trả lời</button>
                                    <span class="opacity-50 font-normal">{comment.time}</span>
                                </div>

                                {#if comment.replies?.length > 0}
                                    <div class="mt-1 space-y-2 border-l-2 border-[#f2e9e1] ml-2 pl-3">
                                        {#each comment.replies as reply}
                                            <div class="bg-[#fffaf3] px-3 py-1.5 rounded-xl border border-[#f2e9e1]/60">
                                                <span class="font-bold text-[10px] text-[#2c293e]">@{reply.author.public_id}</span>
                                                <p class="text-xs text-[#575279]">{reply.content}</p>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                {#if replyTo === comment.id}
                                    <div class="mt-2 flex gap-2">
                                        <input bind:value={newComment} placeholder="Phản hồi..." class="flex-1 h-10 px-3 bg-[#fffaf3] border border-[#f2e9e1] rounded-full text-xs outline-none focus:border-[#907aa9]" />
                                        <button onclick={() => submitComment(comment.id)} disabled={submitting || !newComment.trim()} class="bg-[#907aa9] text-white px-4 rounded-full text-xs font-bold disabled:opacity-40">Gửi</button>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
