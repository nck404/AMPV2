<script>
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";
    import { fly, fade } from "svelte/transition";

    let docId = $state(null);
    let title = $state("");
    let slug = $state("");
    let category = $state("Hướng dẫn");
    let content = $state("");
    let order = $state(0);
    let loading = $state(false);
    let preview = $state(false);

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        if (id) {
            docId = id;
            try {
                const allDocs = await api.get("/docs/");
                const currentDoc = allDocs.find((d) => d.id == id);
                if (currentDoc) {
                    const detail = await api.get(`/docs/${currentDoc.slug}`);
                    title = detail.title;
                    slug = detail.slug;
                    category = detail.category;
                    content = detail.content;
                    order = detail.order;
                }
            } catch (err) {
                console.error(err);
            }
        }
    });

    async function saveDoc() {
        if (!title || !slug || !content) {
            alert("Vui lòng điền đủ Tiêu đề, Slug và Nội dung!");
            return;
        }

        loading = true;
        const payload = {
            title,
            slug,
            category,
            content,
            order: parseInt(order),
        };

        try {
            if (docId) {
                await api.put(`/docs/${docId}`, payload);
            } else {
                await api.post("/docs/", payload);
            }
            goto("/admin/docs");
        } catch (err) {
            alert(err.msg || "Lỗi khi lưu tài liệu.");
        } finally {
            loading = false;
        }
    }

    function renderPreview(text) {
        if (typeof marked !== "undefined") return marked.parse(text);
        return text;
    }

    function autoSlug() {
        if (!docId && title) {
            slug = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
    }
</script>

<svelte:head>
    <title>{docId ? "Chỉnh sửa" : "Thêm mới"} Tài liệu | Admin</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-6xl mx-auto">
        <header class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
                <a
                    href="/admin/docs"
                    class="w-12 h-12 flex items-center justify-center bg-surface border border-overlay rounded-2xl text-muted hover:text-iris transition-all"
                >
                    <i class="bx bx-left-arrow-alt text-2xl"></i>
                </a>
                <h1 class="text-3xl font-black text-rose-text">
                    {docId ? "Chỉnh sửa tài liệu" : "Tạo tài liệu mới"}
                </h1>
            </div>

            <div class="flex items-center gap-3">
                <button
                    onclick={() => (preview = !preview)}
                    class="px-6 py-3 bg-surface border border-overlay text-rose-text font-bold rounded-xl hover:bg-overlay transition-all flex items-center gap-2"
                >
                    <i class="bx {preview ? 'bx-edit' : 'bx-show'} text-xl"></i>
                    {preview ? "Sửa" : "Xem trước"}
                </button>
                <button
                    onclick={saveDoc}
                    disabled={loading}
                    class="px-8 py-3 bg-iris text-white font-bold rounded-xl shadow-lg shadow-iris/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {#if loading}
                        <i class="bx bx-loader-alt animate-spin text-xl"></i>
                    {:else}
                        <i class="bx bx-save text-xl"></i>
                    {/if}
                    Lưu tài liệu
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside class="lg:col-span-1 space-y-6">
                <div
                    class="glass p-6 rounded-[2rem] border border-overlay space-y-4"
                >
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-muted uppercase ml-2"
                            >Tiêu đề</label
                        >
                        <input
                            type="text"
                            bind:value={title}
                            onblur={autoSlug}
                            placeholder="Vd: Cách sử dụng Chat AI"
                            class="w-full px-4 py-3 rounded-xl bg-white border border-overlay outline-none focus:border-iris transition-all"
                        />
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-muted uppercase ml-2"
                            >Slug (URL)</label
                        >
                        <input
                            type="text"
                            bind:value={slug}
                            placeholder="vd-cach-dung-chat-ai"
                            class="w-full px-4 py-3 rounded-xl bg-white border border-overlay outline-none focus:border-iris transition-all"
                        />
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-muted uppercase ml-2"
                            >Danh mục</label
                        >
                        <input
                            type="text"
                            bind:value={category}
                            class="w-full px-4 py-3 rounded-xl bg-white border border-overlay outline-none focus:border-iris transition-all"
                        />
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-muted uppercase ml-2"
                            >Thứ tự hiển thị</label
                        >
                        <input
                            type="number"
                            bind:value={order}
                            class="w-full px-4 py-3 rounded-xl bg-white border border-overlay outline-none focus:border-iris transition-all"
                        />
                    </div>
                </div>
            </aside>

            <main class="lg:col-span-3">
                {#if preview}
                    <div
                        in:fade
                        class="glass p-10 rounded-[3rem] border border-overlay bg-white min-h-[600px] prose prose-iris max-w-none"
                    >
                        {@html renderPreview(content)}
                    </div>
                {:else}
                    <div in:fade class="relative">
                        <textarea
                            bind:value={content}
                            placeholder="Nhập nội dung tài liệu bằng Markdown tại đây..."
                            class="w-full h-[600px] p-8 rounded-[3rem] bg-surface border border-overlay outline-none focus:border-iris shadow-inner font-mono text-sm leading-relaxed"
                        ></textarea>
                        <div
                            class="absolute bottom-6 right-8 text-xs text-muted font-bold tracking-widest opacity-40"
                        >
                            HỖ TRỢ MARKDOWN
                        </div>
                    </div>
                {/if}
            </main>
        </div>
    </div>
</div>

<style>
    .glass {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
    }
    textarea {
        resize: none;
    }
    :global(.prose img) {
        border-radius: 1.5rem;
    }
</style>
