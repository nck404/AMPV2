<script>
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";
    import { fly, fade } from "svelte/transition";

    let docs = $state([]);
    let loading = $state(true);
    let user = $state(null);

    onMount(async () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            user = JSON.parse(storedUser);
            if (!user.is_admin) {
                goto("/");
                return;
            }
        } else {
            goto("/login");
            return;
        }

        try {
            docs = await api.get("/docs/");
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    });

    async function deleteDoc(id) {
        if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

        try {
            await api.delete(`/docs/${id}`);
            docs = docs.filter((d) => d.id !== id);
        } catch (err) {
            alert("Lỗi khi xóa tài liệu.");
        }
    }
</script>

<svelte:head>
    <title>Quản lý Tài liệu | Admin Panel</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-6xl mx-auto">
        <header
            class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
            <div>
                <h1 class="text-4xl font-black text-rose-text mb-2">
                    Admin Panel
                </h1>
                <p class="text-subtle">
                    Quản lý hệ thống tài liệu và hướng dẫn sử dụng.
                </p>
            </div>

            <a
                href="/admin/docs/editor"
                class="px-8 py-4 bg-iris text-white font-bold rounded-2xl shadow-xl shadow-iris/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 justify-center"
            >
                <i class="bx bx-plus text-2xl"></i>
                Thêm tài liệu mới
            </a>
        </header>

        {#if loading}
            <div class="space-y-4">
                {#each Array(4) as _}
                    <div
                        class="h-20 bg-surface animate-pulse rounded-2xl border border-overlay"
                    ></div>
                {/each}
            </div>
        {:else}
            <div
                class="bg-surface border border-overlay rounded-[3rem] overflow-hidden shadow-sm"
            >
                <table class="w-full text-left">
                    <thead class="bg-overlay/30 border-b border-overlay">
                        <tr>
                            <th
                                class="px-8 py-4 text-xs font-bold text-muted uppercase tracking-widest"
                                >Tiêu đề</th
                            >
                            <th
                                class="px-8 py-4 text-xs font-bold text-muted uppercase tracking-widest"
                                >Danh mục</th
                            >
                            <th
                                class="px-8 py-4 text-xs font-bold text-muted uppercase tracking-widest text-center"
                                >Thứ tự</th
                            >
                            <th
                                class="px-8 py-4 text-xs font-bold text-muted uppercase tracking-widest text-right"
                                >Hành động</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-overlay">
                        {#each docs as doc}
                            <tr class="hover:bg-overlay/10 transition-colors">
                                <td class="px-8 py-4">
                                    <div class="font-bold text-rose-text">
                                        {doc.title}
                                    </div>
                                    <div class="text-xs text-muted">
                                        /{doc.slug}
                                    </div>
                                </td>
                                <td class="px-8 py-4">
                                    <span
                                        class="px-3 py-1 bg-iris/10 text-iris text-xs font-bold rounded-full border border-iris/10"
                                    >
                                        {doc.category}
                                    </span>
                                </td>
                                <td
                                    class="px-8 py-4 text-center font-bold text-muted"
                                >
                                    {doc.order}
                                </td>
                                <td class="px-8 py-4 text-right">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <a
                                            href="/docs/{doc.slug}"
                                            target="_blank"
                                            class="w-10 h-10 flex items-center justify-center bg-white border border-overlay text-subtle rounded-xl hover:text-iris transition-colors"
                                            title="Xem trước"
                                        >
                                            <i class="bx bx-show text-xl"></i>
                                        </a>
                                        <a
                                            href="/admin/docs/editor?id={doc.id}"
                                            class="w-10 h-10 flex items-center justify-center bg-white border border-overlay text-subtle rounded-xl hover:text-iris transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <i class="bx bx-edit text-xl"></i>
                                        </a>
                                        <button
                                            onclick={() => deleteDoc(doc.id)}
                                            class="w-10 h-10 flex items-center justify-center bg-white border border-overlay text-subtle rounded-xl hover:text-love transition-colors"
                                            title="Xóa"
                                        >
                                            <i class="bx bx-trash text-xl"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                {#if docs.length === 0}
                    <div class="py-20 text-center space-y-4">
                        <i class="bx bx-layer-minus text-6xl text-muted"></i>
                        <p class="text-subtle">Danh sách trống.</p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
