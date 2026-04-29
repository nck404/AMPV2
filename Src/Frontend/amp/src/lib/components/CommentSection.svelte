<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api";

    let { post } = $props();
    let mounted = $state(false);
    let comments = $state([]);
    let loading = $state(true);
    let newComment = $state("");
    let submitting = $state(false);
    let replyTo = $state(null);
    let activePicker = $state(null);

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

<div class="space-y-4 pt-4 border-t border-overlay">
    <div
        class="flex items-center justify-between border-y border-overlay py-1.5 px-2 relative"
    >
        <div class="flex items-center gap-1 group/btn">
            {#if activePicker?.type === "post"}
                <div
                    in:fly={{ y: 5 }}
                    class="absolute bottom-full mb-1 left-0 bg-white shadow-xl border border-overlay rounded-full px-3 py-1.5 flex items-center gap-1 z-50 animate-in fade-in zoom-in duration-200"
                    onmouseleave={() => (activePicker = null)}
                >
                    {#each reactions as r}
                        <button
                            onclick={() => handleReact(r.type, "post")}
                            class="text-2xl hover:scale-125 transition-transform duration-200 p-1"
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
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-overlay/40 transition-all font-bold text-[13px] {post.user_reaction
                    ? 'text-iris'
                    : 'text-muted'}"
            >
                {#if post.user_reaction}
                    <span class="text-lg"
                        >{getReactionIcon(post.user_reaction)}</span
                    >
                    {reactions.find((r) => r.type === post.user_reaction)
                        ?.label}
                {:else}
                    <i class="bx bx-like text-xl"></i> Thích
                {/if}
            </button>
        </div>

        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-overlay/40 transition-all font-bold text-[13px] text-muted"
        >
            <i class="bx bx-comment text-xl"></i> Bình luận
        </button>

        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-overlay/40 transition-all font-bold text-[13px] text-muted"
        >
            <i class="bx bx-share-alt text-xl"></i> Chia sẻ
        </button>
    </div>

    <div class="flex items-center justify-between px-2 text-[13px]">
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

    <div class="space-y-4 bg-overlay/5 p-4 rounded-2xl">
        <div class="flex gap-2 items-start">
            <div
                class="w-8 h-8 mt-1 rounded-full bg-iris/20 border border-white flex-shrink-0 flex items-center justify-center font-bold text-iris text-xs"
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
            <div class="flex-1 flex items-end gap-2">
                <textarea
                    bind:value={newComment}
                    placeholder="Viết bình luận công khai..."
                    class="flex-1 px-4 py-2.5 bg-white border border-overlay rounded-2xl outline-none focus:border-iris transition-all min-h-[40px] max-h-[120px] text-[13px] shadow-sm resize-none overflow-hidden"
                    rows="1"
                    oninput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                    }}
                ></textarea>
                <button
                    onclick={() => handlePostComment()}
                    disabled={submitting || !newComment?.trim()}
                    class="w-10 h-10 rounded-full bg-iris text-white disabled:bg-surface disabled:text-muted hover:bg-iris/90 transition-all flex flex-shrink-0 items-center justify-center shadow-sm"
                >
                    {#if submitting}
                        <i class="bx bx-loader-alt animate-spin text-xl"></i>
                    {:else}
                        <i class="bx bxs-send text-xl ml-0.5"></i>
                    {/if}
                </button>
            </div>
        </div>

        {#if loading}
            <div class="text-center py-10 opacity-40">
                <i class="bx bx-loader-alt animate-spin text-2xl"></i>
            </div>
        {:else}
            <div class="space-y-6">
                {#each comments as comment}
                    <div class="flex gap-2">
                        <div
                            class="w-8 h-8 rounded-full bg-white border border-overlay flex-shrink-0 overflow-hidden shadow-sm mt-0.5"
                        >
                            {#if comment.author.avatar_url}
                                <img
                                    src={comment.author.avatar_url.startsWith(
                                        "http",
                                    )
                                        ? comment.author.avatar_url
                                        : `${STATIC_BASE}${comment.author.avatar_url}`}
                                    alt="Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center font-bold text-iris bg-iris/5 text-sm"
                                >
                                    {comment.author.username[0]}
                                </div>
                            {/if}
                        </div>
                        <div class="flex-1 space-y-0.5">
                            <div
                                class="inline-block bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm relative pr-10"
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
                                    class="text-[13px] mt-0.5 leading-relaxed text-subtle"
                                >
                                    {comment.content}
                                </p>

                                {#if getTotalReactions(comment.reactions) > 0}
                                    <div
                                        class="absolute -bottom-2 right-0 translate-x-1/4 bg-white border border-overlay rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 z-10"
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
                                class="flex items-center gap-3 px-1 text-[11px] font-bold text-muted relative pt-0.5"
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
                                            in:fly={{ y: 5 }}
                                            class="absolute bottom-full mb-1 left-0 bg-white shadow-xl border border-overlay rounded-full px-2 py-1 flex items-center gap-1 z-50"
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
                                                    class="text-xl hover:scale-125 transition-transform duration-200"
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

                            {#if comment.replies && comment.replies.length > 0}
                                <div
                                    class="mt-2 space-y-3 border-l-2 border-overlay/50 ml-2 pl-4"
                                >
                                    {#each comment.replies as reply}
                                        <div class="flex gap-2">
                                            <div
                                                class="w-6 h-6 rounded-full bg-white border border-overlay flex-shrink-0 overflow-hidden shadow-xs mt-0.5"
                                            >
                                                {#if reply.author.avatar_url}
                                                    <img
                                                        src={reply.author.avatar_url.startsWith(
                                                            "http",
                                                        )
                                                            ? reply.author
                                                                  .avatar_url
                                                            : `${STATIC_BASE}${reply.author.avatar_url}`}
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
                                                class="inline-block bg-white px-2.5 py-1.5 rounded-xl rounded-tl-none shadow-xs border border-overlay/30"
                                            >
                                                <div
                                                    class="font-bold text-[10px] text-rose-text"
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
                                <div class="ml-6 mt-2 flex gap-2">
                                    <input
                                        bind:value={newComment}
                                        placeholder="Để lại phản hồi..."
                                        class="flex-1 h-8 px-3 bg-white border border-overlay rounded-full text-[13px] outline-none focus:border-iris transition-all shadow-sm"
                                    />
                                    <button
                                        onclick={() =>
                                            handlePostComment(comment.id)}
                                        disabled={submitting ||
                                            !newComment?.trim()}
                                        class="bg-iris text-white px-3 rounded-full text-[11px] font-bold h-8 shadow-sm disabled:opacity-50"
                                        >Gửi</button
                                    >
                                    <button
                                        onclick={() => (replyTo = null)}
                                        class="text-muted text-[11px] font-bold hover:underline"
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
