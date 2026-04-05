<script>
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { fly, fade } from "svelte/transition";

    let users = $state([]);
    let loading = $state(true);
    let searchTerm = $state("");

    onMount(async () => {
        await loadUsers();
    });

    async function loadUsers() {
        loading = true;
        try {
            users = await api.get("/admin/users");
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function toggleAdmin(user) {
        if (!confirm(`Bạn có muốn thay đổi quyền Admin của ${user.username}?`))
            return;

        try {
            const res = await api.post(`/admin/users/${user.id}/toggle-admin`);
            if (res.msg) {
                user.is_admin = res.is_admin;
            }
        } catch (err) {
            alert("Lỗi khi cập nhật quyền.");
        }
    }

    async function deleteUser(id) {
        if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?"))
            return;

        try {
            await api.delete(`/admin/users/${id}`);
            users = users.filter((u) => u.id !== id);
        } catch (err) {
            alert("Lỗi khi xóa người dùng.");
        }
    }

    let filteredUsers = $derived(
        users.filter(
            (u) =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.public_id.includes(searchTerm),
        ),
    );
</script>

<svelte:head>
    <title>Quản lý Người dùng | Admin</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-6xl mx-auto space-y-10">
        <header
            class="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
            <div class="flex items-center gap-4">
                <a
                    href="/admin"
                    class="w-12 h-12 flex items-center justify-center bg-surface border border-overlay rounded-2xl text-muted hover:text-iris transition-all"
                >
                    <i class="bx bx-left-arrow-alt text-2xl"></i>
                </a>
                <div>
                    <h1 class="text-4xl font-black text-rose-text">
                        Người dùng
                    </h1>
                    <p class="text-subtle text-sm">
                        Tổng cộng {users.length} tài khoản trong hệ thống.
                    </p>
                </div>
            </div>

            <div class="relative w-full md:w-80">
                <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-xl"
                >
                    <i class="bx bx-search"></i>
                </span>
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Tìm kiếm username, email..."
                    class="w-full pl-12 pr-4 py-3.5 bg-surface border border-overlay rounded-2xl outline-none focus:border-iris transition-all shadow-sm text-sm input-icon"
                />
            </div>
        </header>

        {#if loading}
            <div class="space-y-4">
                {#each Array(5) as _}
                    <div
                        class="h-20 bg-surface animate-pulse rounded-2xl border border-overlay"
                    ></div>
                {/each}
            </div>
        {:else}
            <div
                class="bg-surface border border-overlay rounded-[3rem] overflow-hidden shadow-sm"
            >
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-overlay/20 border-b border-overlay">
                            <tr>
                                <th
                                    class="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest"
                                    >Tài khoản</th
                                >
                                <th
                                    class="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest"
                                    >Thông tin liên lạc</th
                                >
                                <th
                                    class="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-center"
                                    >Vai trò</th
                                >
                                <th
                                    class="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right"
                                    >Thao tác</th
                                >
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-overlay">
                            {#each filteredUsers as user}
                                <tr
                                    class="hover:bg-overlay/10 transition-colors"
                                >
                                    <td class="px-8 py-5">
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 bg-iris/10 text-iris rounded-xl flex items-center justify-center font-black"
                                            >
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div
                                                    class="font-bold text-rose-text"
                                                >
                                                    {user.username}
                                                </div>
                                                <div
                                                    class="text-[10px] font-black text-muted uppercase tracking-tighter"
                                                >
                                                    @{user.public_id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-8 py-5">
                                        <div class="text-sm text-subtle">
                                            {user.email}
                                        </div>
                                        <div
                                            class="text-[10px] text-muted italic"
                                        >
                                            Tham gia: {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td class="px-8 py-5 text-center">
                                        {#if user.is_admin}
                                            <span
                                                class="px-3 py-1 bg-gold text-white text-[9px] font-black rounded-full shadow-lg shadow-gold/20"
                                                >ADMIN</span
                                            >
                                        {:else}
                                            <span
                                                class="px-3 py-1 bg-overlay text-rose-text text-[9px] font-black rounded-full border border-white/50"
                                                >USER</span
                                            >
                                        {/if}
                                    </td>
                                    <td class="px-8 py-5">
                                        <div
                                            class="flex items-center justify-end gap-2"
                                        >
                                            <button
                                                onclick={() =>
                                                    toggleAdmin(user)}
                                                class="px-4 py-2 bg-white border border-overlay rounded-xl text-xs font-black hover:border-iris hover:text-iris transition-all"
                                                title="Đổi vai trò"
                                            >
                                                {user.is_admin
                                                    ? "Gỡ Admin"
                                                    : "Cấp Admin"}
                                            </button>
                                            <button
                                                onclick={() =>
                                                    deleteUser(user.id)}
                                                class="w-10 h-10 flex items-center justify-center bg-white border border-overlay text-love rounded-xl hover:bg-love hover:text-white transition-all"
                                                title="Xóa tài khoản"
                                            >
                                                <i class="bx bx-trash text-lg"
                                                ></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                {#if filteredUsers.length === 0}
                    <div class="py-20 text-center space-y-4">
                        <i
                            class="bx bx-search-alt text-6xl text-muted opacity-30"
                        ></i>
                        <p class="text-subtle">
                            Không tìm thấy người dùng phù hợp.
                        </p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
