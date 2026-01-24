<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let title = $state("");
    let content = $state("");
    let tags = $state("");
    let submitting = $state(false);
    let previewMode = $state(false);

    onMount(() => {
        mounted = true;
        const token = localStorage.getItem("token");
        if (!token) {
            goto("/login?error=unauthorized");
        }
    });

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Vui lòng điền đầy đủ tiêu đề và nội dung.");
            return;
        }

        submitting = true;
        try {
            const res = await api.post("/forum/posts", {
                title,
                content,
                tags,
            });

            if (res.id) {
                goto("/forum");
            } else {
                alert(res.msg || "Có lỗi xảy ra khi đăng bài.");
            }
        } catch (err) {
            alert("Lỗi kết nối máy chủ.");
        } finally {
            submitting = false;
        }
    }

    let renderedMarkdown = $derived(
        mounted && typeof marked !== "undefined"
            ? marked.parse(content || "")
            : content,
    );
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    {#if mounted}
        <div in:fly={{ y: 20 }} class="space-y-8">
            <!-- Header -->
            <div
                class="flex items-center justify-between border-b border-overlay pb-8"
            >
                <div class="flex items-center gap-4">
                    <button
                        onclick={() => goto("/forum")}
                        class="w-12 h-12 rounded-2xl bg-surface border border-overlay flex items-center justify-center hover:bg-iris/10 transition-colors"
                        aria-label="Quay lại"
                    >
                        <i class="bx bx-chevron-left text-2xl"></i>
                    </button>
                    <div>
                        <h1 class="text-4xl font-black text-rose-text">
                            Viết bài mới
                        </h1>
                        <p
                            class="text-muted text-sm uppercase tracking-widest font-bold"
                        >
                            Chia sẻ kiến thức & thảo luận
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        onclick={() => (previewMode = !previewMode)}
                        class="px-6 py-3 rounded-xl border border-overlay font-bold text-sm transition-all {previewMode
                            ? 'bg-iris text-white shadow-lg'
                            : 'bg-white text-rose-text hover:bg-overlay/50'}"
                    >
                        <i
                            class="bx {previewMode
                                ? 'bx-edit-alt'
                                : 'bx-show'} mr-2"
                        ></i>
                        {previewMode ? "Quay lại sửa" : "Xem trước (MD)"}
                    </button>
                    <button
                        onclick={handleSubmit}
                        disabled={submitting}
                        class="button px-10 py-3 text-sm h-auto"
                    >
                        {submitting ? "Đang gửi..." : "Đăng bài ngay"}
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <!-- Editor Area -->
                <div class="space-y-6">
                    <div class="space-y-2">
                        <label
                            for="title"
                            class="text-xs font-black text-muted uppercase tracking-widest px-1"
                            >Tiêu đề bài viết</label
                        >
                        <input
                            id="title"
                            bind:value={title}
                            placeholder="Nhập tiêu đề ấn tượng giúp bài viết nổi bật..."
                            class="w-full h-16 bg-white border-2 border-overlay rounded-[1.5rem] px-8 text-xl font-bold focus:border-iris outline-none transition-all shadow-sm"
                        />
                    </div>

                    {#if previewMode}
                        <div in:fade class="space-y-2">
                            <span
                                class="text-xs font-black text-iris uppercase tracking-widest px-1"
                                >Bản xem trước</span
                            >
                            <div
                                class="w-full min-h-[500px] bg-white border-2 border-iris/20 rounded-[2rem] p-10 prose prose-rose max-w-none shadow-xl shadow-rose-text/5 overflow-y-auto"
                            >
                                {@html renderedMarkdown}
                            </div>
                        </div>
                    {:else}
                        <div class="space-y-2">
                            <label
                                for="content"
                                class="text-xs font-black text-muted uppercase tracking-widest px-1"
                                >Nội dung (Hỗ trợ Markdown)</label
                            >
                            <div class="relative group">
                                <textarea
                                    id="content"
                                    bind:value={content}
                                    placeholder="Nội dung bài viết... Bạn có thể dùng Markdown để định dạng văn bản, thêm code, bảng biểu, v.v."
                                    class="w-full min-h-[500px] bg-white border-2 border-overlay rounded-[2rem] p-10 text-lg focus:border-iris outline-none transition-all shadow-sm resize-none font-medium"
                                ></textarea>
                                <!-- MD Help Mini Bar -->
                                <div
                                    class="absolute bottom-6 left-6 right-6 flex items-center justify-between border-t border-overlay pt-4 opacity-40 group-focus-within:opacity-100 transition-opacity"
                                >
                                    <div
                                        class="flex items-center gap-4 text-xs font-bold text-muted"
                                    >
                                        <span># H1</span>
                                        <span>**Bold**</span>
                                        <span>*Italic*</span>
                                        <span>[Link]()</span>
                                        <span>```code```</span>
                                    </div>
                                    <span class="text-[10px] text-muted"
                                        >Markdown được hỗ trợ</span
                                    >
                                </div>
                            </div>
                        </div>
                    {/if}

                    <div class="space-y-2">
                        <label
                            for="tags"
                            class="text-xs font-black text-muted uppercase tracking-widest px-1"
                            >Tags (cách nhau bằng dấu phẩy)</label
                        >
                        <input
                            id="tags"
                            bind:value={tags}
                            placeholder="ví dụ: Học tập, Kinh nghiệm, BAS, 3D..."
                            class="w-full h-12 bg-white border-2 border-overlay rounded-xl px-6 text-sm focus:border-iris outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Styling for the markdown content */
    :global(.prose h1) {
        font-size: 2.25rem;
        font-weight: 900;
        margin-bottom: 2rem;
        color: #575279;
    }
    :global(.prose h2) {
        font-size: 1.875rem;
        font-weight: 800;
        margin-top: 2rem;
        margin-bottom: 1.5rem;
        color: #575279;
    }
    :global(.prose p) {
        margin-bottom: 1.25rem;
        line-height: 1.75;
        color: #6e6a86;
    }
    :global(.prose code) {
        background: #f2e9e1;
        padding: 0.2rem 0.4rem;
        border-radius: 0.4rem;
        font-family: monospace;
        color: #eb6f92;
    }
    :global(.prose pre) {
        background: #575279;
        color: #faf4ed;
        padding: 1.5rem;
        border-radius: 1rem;
        overflow-x: auto;
        margin: 1.5rem 0;
    }
    :global(.prose ul, .prose ol) {
        padding-left: 1.5rem;
        margin-bottom: 1.5rem;
    }
    :global(.prose li) {
        margin-bottom: 0.5rem;
    }
</style>
