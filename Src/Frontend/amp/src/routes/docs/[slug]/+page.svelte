<script>
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { fade, fly } from "svelte/transition";

    let doc = $state(null);
    let loading = $state(true);
    let error = $state(null);

    onMount(async () => {
        try {
            const slug = page.params.slug;
            doc = await api.get(`/docs/${slug}`);
        } catch (err) {
            error = "Không tìm thấy nội dung yêu cầu.";
            console.error(err);
        } finally {
            loading = false;
        }
    });

    function renderMarkdown(content) {
        if (typeof marked !== "undefined") {
            return marked.parse(content);
        }
        return content;
    }
</script>

<svelte:head>
    <title>{doc ? doc.title : "Loading..."} | AMP Docs</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-4xl mx-auto">
        <a
            href="/docs"
            class="inline-flex items-center gap-2 text-iris font-bold mb-8 hover:translate-x-1 transition-transform"
        >
            <i class="bx bx-left-arrow-alt text-2xl"></i>
            Quay lại danh sách
        </a>

        {#if loading}
            <div class="space-y-6">
                <div
                    class="h-12 w-3/4 bg-surface animate-pulse rounded-2xl border border-overlay"
                ></div>
                <div
                    class="h-96 w-full bg-surface animate-pulse rounded-[3rem] border border-overlay"
                ></div>
            </div>
        {:else if error}
            <div
                class="text-center py-20 bg-surface rounded-[3rem] border border-overlay"
            >
                <i class="bx bx-error-circle text-6xl text-love mb-4"></i>
                <p class="text-xl text-subtle">{error}</p>
            </div>
        {:else if doc}
            <article in:fade>
                <header class="mb-10">
                    <div class="flex items-center gap-3 mb-4">
                        <span
                            class="px-4 py-1.5 bg-iris/10 text-iris text-sm font-bold rounded-full border border-iris/20 uppercase tracking-wider"
                        >
                            {doc.category}
                        </span>
                        <span class="text-muted text-sm italic">
                            Cập nhật: {new Date(
                                doc.last_updated,
                            ).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                    <h1 class="text-4xl md:text-5xl font-black text-rose-text">
                        {doc.title}
                    </h1>
                </header>

                <div
                    class="glass p-8 md:p-12 rounded-[3.5rem] border border-overlay bg-surface prose prose-iris max-w-none prose-headings:font-black prose-headings:text-rose-text prose-p:text-subtle prose-strong:text-rose-text"
                >
                    {@html renderMarkdown(doc.content)}
                </div>
            </article>
        {/if}
    </div>
</div>

<style>
    :global(.prose img) {
        border-radius: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.05);
    }

    :global(.prose pre) {
        background: #2a2c33 !important;
        border-radius: 1.5rem;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :global(.prose code) {
        color: var(--color-love);
        background: var(--color-overlay);
        padding: 0.2em 0.4em;
        border-radius: 0.4em;
        font-weight: 500;
    }
</style>
