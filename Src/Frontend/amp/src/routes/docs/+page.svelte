<script>
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { fly, fade } from "svelte/transition";

    let docs = $state([]);
    let loading = $state(true);

    onMount(async () => {
        try {
            docs = await api.get("/docs/");
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    });

    // Group docs by category
    let groupedDocs = $derived(
        docs.reduce((acc, doc) => {
            if (!acc[doc.category]) acc[doc.category] = [];
            acc[doc.category].push(doc);
            return acc;
        }, {}),
    );
</script>

<svelte:head>
    <title>Tài liệu & Hướng dẫn | AMP</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-5xl mx-auto">
        <header class="mb-12 text-center" in:fade>
            <h1 class="text-4xl md:text-5xl font-black mb-4">
                Tài liệu hướng dẫn
            </h1>
            <p class="text-subtle text-lg">
                Tìm hiểu cách sử dụng các tính năng và công cụ trên hệ thống
                AMP.
            </p>
        </header>

        {#if loading}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each Array(6) as _}
                    <div
                        class="h-40 bg-surface animate-pulse rounded-3xl border border-overlay"
                    ></div>
                {/each}
            </div>
        {:else if docs.length === 0}
            <div
                class="text-center py-20 bg-surface rounded-[3rem] border border-overlay"
            >
                <i class="bx bx-book-content text-6xl text-muted mb-4"></i>
                <p class="text-xl text-subtle">
                    Chưa có tài liệu nào được đăng tải.
                </p>
            </div>
        {:else}
            <div class="space-y-16">
                {#each Object.entries(groupedDocs) as [category, items]}
                    <section class="space-y-6">
                        <div class="flex items-center gap-4">
                            <h2
                                class="text-2xl font-bold text-rose-text px-6 py-2 bg-iris/10 rounded-full border border-iris/20"
                            >
                                {category}
                            </h2>
                            <div class="flex-1 h-px bg-overlay"></div>
                        </div>

                        <div
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {#each items as doc, i}
                                <a
                                    href="/docs/{doc.slug}"
                                    class="group p-6 bg-surface border border-overlay rounded-[2.5rem] hover:border-iris hover:shadow-xl hover:shadow-iris/5 transition-all duration-300"
                                    in:fly={{ y: 20, delay: i * 50 }}
                                >
                                    <div
                                        class="flex items-start justify-between mb-4"
                                    >
                                        <div
                                            class="w-12 h-12 bg-iris/10 text-iris rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                        >
                                            <i class="bx bx-file-blank text-2xl"
                                            ></i>
                                        </div>
                                        <i
                                            class="bx bx-chevron-right text-2xl text-muted group-hover:translate-x-1 transition-transform"
                                        ></i>
                                    </div>
                                    <h3
                                        class="text-xl font-bold text-rose-text mb-2 line-clamp-2"
                                    >
                                        {doc.title}
                                    </h3>
                                    <p
                                        class="text-xs text-muted uppercase font-bold tracking-widest"
                                    >
                                        Xem chi tiết
                                    </p>
                                </a>
                            {/each}
                        </div>
                    </section>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    section {
        animation: fadeUp 0.6s ease-out forwards;
    }

    @keyframes fadeUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
