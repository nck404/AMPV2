<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { page } from "$app/state";

    let mounted = $state(false);
    onMount(() => (mounted = true));

    const path = page.url.searchParams.get("from") || "Trang này";
</script>

<div class="min-h-[70vh] flex items-center justify-center px-6">
    {#if mounted}
        <div 
            in:fly={{ y: 30, duration: 800 }}
            class="max-w-2xl w-full glass p-12 rounded-[3rem] border border-white/10 text-center space-y-8 relative overflow-hidden"
        >
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-iris/10 blur-3xl rounded-full"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-text/5 blur-3xl rounded-full"></div>

            <div class="relative">
                <div class="text-8xl mb-6">🛠️</div>
                <h1 class="text-5xl font-black text-rose-text mb-4">Đang bảo trì</h1>
                <p class="text-xl text-subtle leading-relaxed">
                    Rất tiếc, <span class="text-iris font-bold">{path}</span> hiện đang được bảo trì để nâng cấp tính năng tốt hơn. Vui lòng quay lại sau nhé!
                </p>
            </div>

            <div class="pt-8">
                <a 
                    href="/" 
                    class="inline-block px-10 py-4 bg-iris text-white font-bold rounded-2xl shadow-lg shadow-iris/20 hover:scale-105 transition-all"
                >
                    Quay về Trang chủ
                </a>
            </div>
        </div>
    {/if}
</div>
