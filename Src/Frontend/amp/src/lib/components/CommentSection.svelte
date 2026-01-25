<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";

    let { post } = $props();
    let mounted = $state(false);
    let comments = $state([]);
    let loading = $state(true);
    let newComment = $state("");
    let submitting = $state(false);
    let replyTo = $state(null);
    let activePicker = $state(null); // { type: 'post'|'comment', id: null|commentId }

    const reactions = [
        { type: "like", icon: "👍", label: "Thích", color: "text-blue-500" },
        { type: "love", icon: "❤️", label: "Yêu thích", color: "text-red-500" },
        { type: "haha", icon: "😆", label: "Haha", color: "text-yellow-500" },
        { type: "wow", icon: "😮", label: "Wow", color: "text-yellow-500" },
        { type: "sad", icon: "😢", label: "Buồn", color: "text-yellow-500" },
        {
            type: "angry",
            icon: "😡",
            label: "Phẫn nộ",
            color: "text-orange-600",
        },
    ];

    onMount(async () => {
        mounted = true;
        await loadComments();
    });

    async function loadComments() {
        loading = true;
        try {
            const data = await api.get(`/forum/posts/${post.id}/comments`);
            if (Array.isArray(data)) {
                comments = data;
            }
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function handlePostComment(parentId = null) {
        if (!newComment.trim()) return;
        submitting = true;
        try {
            const res = await api.post(`/forum/posts/${post.id}/comments`, {
                content: newComment,
                parent_id: parentId,
            });
            if (res.id) {
                newComment = "";
                replyTo = null;
                await loadComments();
            }
        } catch (err) {
            alert("Lỗi khi gửi bình luận");
        } finally {
            submitting = false;
        }
    }

    async function handleReact(type, targetType = "post", targetId = null) {
        try {
            await api.post("/forum/react", {
                target_type: targetType,
                target_id: targetId || post.id,
                type: type,
            });
            activePicker = null;
            // Update local state instead of reload for better UX
            if (targetType === "post") {
                window.location.reload();
            } else {
                await loadComments();
            }
        } catch (err) {
            console.error(err);
        }
    }

    function getReactionIcon(type) {
        return reactions.find((r) => r.type === type)?.icon || "👍";
    }

    function getTotalReactions(reactionObj) {
        if (!reactionObj) return 0;
        return Object.values(reactionObj).reduce((a, b) => a + b, 0);
    }
</script>

<div class="space-y-10 pt-10 border-t border-overlay">
    <!-- Post Actions Bar -->
    <div
        class="flex items-center justify-between border-y border-overlay py-2 px-4 relative"
    >
        <div class="flex items-center gap-1 group/btn">
            <!-- Reaction Picker Post -->
            {#if activePicker?.type === "post"}
                <div
                    in:fly={{ y: 10 }}
                    class="absolute bottom-full mb-2 left-0 bg-white shadow-2xl border border-overlay rounded-full px-4 py-2 flex items-center gap-2 z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200"
                    onmouseleave={() => (activePicker = null)}
                >
                    {#each reactions as r}
                        <button
                            onclick={() => handleReact(r.type, "post")}
                            class="text-3xl hover:scale-150 transition-transform duration-200 p-1"
                            title={r.label}
                        >
                            {r.icon}
                        </button>
                    {/each}
                </div>
            {/if}

            <button
                onmouseenter={() => (activePicker = { type: "post" })}
                onclick={() =>
                    handleReact(post.user_reaction ? null : "like", "post")}
                class="flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-overlay/40 transition-all font-black text-sm {post.user_reaction
                    ? 'text-iris'
                    : 'text-muted'}"
            >
                {#if post.user_reaction}
                    <span class="text-xl"
                        >{getReactionIcon(post.user_reaction)}</span
                    >
                    {reactions.find((r) => r.type === post.user_reaction)
                        ?.label}
                {:else}
                    <i class="bx bx-like text-2xl"></i> Thích
                {/if}
            </button>
        </div>

        <button
            class="flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-overlay/40 transition-all font-black text-sm text-muted"
        >
            <i class="bx bx-comment text-2xl"></i> Bình luận
        </button>

        <button
            class="flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-overlay/40 transition-all font-black text-sm text-muted"
        >
            <i class="bx bx-share-alt text-2xl"></i> Chia sẻ
        </button>
    </div>

    <!-- Post Stats Summary -->
    <div class="flex items-center justify-between px-4 -mt-6">
        <div class="flex items-center gap-2">
            {#if getTotalReactions(post.reactions) > 0}
                <div class="flex -space-x-1">
                    {#each Object.keys(post.reactions) as type}
                        <span
                            class="text-xs bg-white border border-overlay rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-10"
                            >{getReactionIcon(type)}</span
                        >
                    {/each}
                </div>
                <span class="text-xs font-bold text-muted ml-1"
                    >{getTotalReactions(post.reactions)} người đã bày tỏ cảm xúc</span
                >
            {/if}
        </div>
        <span class="text-xs font-bold text-muted"
            >{comments.length} bình luận</span
        >
    </div>

    <!-- Comment Section -->
    <div class="space-y-8 bg-overlay/10 p-8 rounded-[3rem]">
        <!-- New Comment Input -->
        <div class="flex gap-4">
            <div
                class="w-10 h-10 rounded-full bg-iris/20 border-2 border-white flex-shrink-0 flex items-center justify-center font-black text-iris"
            >
                {#if post.user_avatar}
                    <img
                        src={post.user_avatar}
                        alt="Me"
                        class="w-full h-full object-cover rounded-full"
                    />
                {:else}
                    ?
                {/if}
            </div>
            <div class="flex-1 space-y-3">
                <textarea
                    bind:value={newComment}
                    placeholder="Viết bình luận công khai..."
                    class="w-full p-4 bg-white border border-overlay rounded-2xl outline-none focus:border-iris transition-all min-h-[80px] text-sm shadow-sm"
                ></textarea>
                <div
                    class="flex justify-end {newComment
                        ? 'opacity-100'
                        : 'opacity-0'} transition-opacity"
                >
                    <button
                        onclick={() => handlePostComment()}
                        disabled={submitting}
                        class="bg-iris text-white px-8 py-2 rounded-full text-sm font-black shadow-lg shadow-iris/20"
                    >
                        {submitting ? "Đang đăng..." : "Đăng bình luận"}
                    </button>
                </div>
            </div>
        </div>

        {#if loading}
            <div class="text-center py-10 opacity-40">
                <i class="bx bx-loader-alt animate-spin text-2xl"></i>
            </div>
        {:else}
            <div class="space-y-6">
                {#each comments as comment}
                    <div class="flex gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-white border border-overlay flex-shrink-0 overflow-hidden shadow-sm"
                        >
                            {#if comment.author.avatar_url}
                                <img
                                    src={comment.author.avatar_url.startsWith(
                                        "http",
                                    )
                                        ? comment.author.avatar_url
                                        : `http://localhost:5000${comment.author.avatar_url}`}
                                    alt="Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center font-black text-iris bg-iris/5"
                                >
                                    {comment.author.username[0]}
                                </div>
                            {/if}
                        </div>
                        <div class="flex-1 space-y-1">
                            <div
                                class="inline-block bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm relative pr-12"
                            >
                                <div class="flex items-center gap-2">
                                    <span
                                        class="font-black text-xs text-rose-text group-hover:text-iris transition-colors cursor-pointer"
                                    >
                                        @{comment.author.public_id}
                                    </span>
                                    {#if comment.author.is_admin}
                                        <span
                                            class="px-2 py-0.5 bg-gold/10 text-gold text-[8px] font-black rounded-full border border-gold/20 flex items-center gap-0.5 uppercase tracking-tighter"
                                        >
                                            <i class="bx bxs-shield-check"></i> Admin
                                        </span>
                                    {/if}
                                </div>
                                <p
                                    class="text-sm mt-1 leading-relaxed text-subtle"
                                >
                                    {comment.content}
                                </p>

                                <!-- Comment Reaction Count Badge -->
                                {#if getTotalReactions(comment.reactions) > 0}
                                    <div
                                        class="absolute -bottom-2 -right-4 bg-white border border-overlay rounded-full px-2 py-0.5 shadow-sm flex items-center gap-1"
                                    >
                                        {#each Object.keys(comment.reactions).slice(0, 3) as type}
                                            <span class="text-[10px]"
                                                >{getReactionIcon(type)}</span
                                            >
                                        {/each}
                                        <span
                                            class="text-[10px] font-black text-muted"
                                            >{getTotalReactions(
                                                comment.reactions,
                                            )}</span
                                        >
                                    </div>
                                {/if}
                            </div>

                            <div
                                class="flex items-center gap-4 px-1 text-[11px] font-black text-muted relative"
                            >
                                <div class="relative group/cbtn">
                                    <button
                                        onmouseenter={() =>
                                            (activePicker = {
                                                type: "comment",
                                                id: comment.id,
                                            })}
                                        onclick={() =>
                                            handleReact(
                                                comment.user_reaction
                                                    ? null
                                                    : "like",
                                                "comment",
                                                comment.id,
                                            )}
                                        class="hover:underline {comment.user_reaction
                                            ? reactions.find(
                                                  (r) =>
                                                      r.type ===
                                                      comment.user_reaction,
                                              )?.color
                                            : ''}"
                                    >
                                        {comment.user_reaction
                                            ? reactions.find(
                                                  (r) =>
                                                      r.type ===
                                                      comment.user_reaction,
                                              )?.label
                                            : "Thích"}
                                    </button>

                                    {#if activePicker?.type === "comment" && activePicker?.id === comment.id}
                                        <div
                                            in:fly={{ y: 10 }}
                                            class="absolute bottom-full mb-2 left-0 bg-white shadow-2xl border border-overlay rounded-full px-3 py-1.5 flex items-center gap-1.5 z-50"
                                            onmouseleave={() =>
                                                (activePicker = null)}
                                        >
                                            {#each reactions as r}
                                                <button
                                                    onclick={() =>
                                                        handleReact(
                                                            r.type,
                                                            "comment",
                                                            comment.id,
                                                        )}
                                                    class="text-2xl hover:scale-150 transition-transform duration-200"
                                                    title={r.label}
                                                >
                                                    {r.icon}
                                                </button>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                                <button
                                    onclick={() => (replyTo = comment.id)}
                                    class="hover:underline">Trả lời</button
                                >
                                <span class="font-normal opacity-50"
                                    >{comment.time}</span
                                >
                            </div>

                            <!-- Replies Area -->
                            {#if comment.replies && comment.replies.length > 0}
                                <div
                                    class="mt-3 space-y-4 border-l-2 border-overlay/50 ml-2 pl-6"
                                >
                                    {#each comment.replies as reply}
                                        <div class="flex gap-2">
                                            <div
                                                class="w-7 h-7 rounded-full bg-white border border-overlay flex-shrink-0 overflow-hidden shadow-xs"
                                            >
                                                {#if reply.author.avatar_url}
                                                    <img
                                                        src={reply.author.avatar_url.startsWith(
                                                            "http",
                                                        )
                                                            ? reply.author
                                                                  .avatar_url
                                                            : `http://localhost:5000${reply.author.avatar_url}`}
                                                        alt="Avatar"
                                                        class="w-full h-full object-cover"
                                                    />
                                                {:else}
                                                    <div
                                                        class="w-full h-full flex items-center justify-center font-bold text-iris bg-iris/5 text-[9px] uppercase"
                                                    >
                                                        {reply.author
                                                            .username[0]}
                                                    </div>
                                                {/if}
                                            </div>
                                            <div
                                                class="inline-block bg-white px-3 py-2 rounded-xl rounded-tl-none shadow-xs border border-overlay/30"
                                            >
                                                <div
                                                    class="font-black text-[10px] text-rose-text"
                                                >
                                                    @{reply.author.public_id}
                                                </div>
                                                <p
                                                    class="text-xs mt-0.5 text-subtle"
                                                >
                                                    {reply.content}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {/if}

                            {#if replyTo === comment.id}
                                <div class="ml-8 mt-3 flex gap-2">
                                    <input
                                        bind:value={newComment}
                                        placeholder="Để lại phản hồi..."
                                        class="flex-1 h-10 px-4 bg-white border border-overlay rounded-full text-xs outline-none focus:border-iris transition-all shadow-sm"
                                    />
                                    <button
                                        onclick={() =>
                                            handlePostComment(comment.id)}
                                        class="bg-iris text-white px-4 rounded-full text-[10px] font-black h-10 shadow-sm"
                                        >Gửi</button
                                    >
                                    <button
                                        onclick={() => (replyTo = null)}
                                        class="text-muted text-[10px] font-bold"
                                        >Hủy</button
                                    >
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    textarea,
    input {
        background: white !important;
        padding-left: 1.25rem !important;
    }
</style>
