<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { isLoggedIn } from "$lib/stores/auth.js";

    let applications = $state([]);
    let loading = $state(true);

    onMount(async () => {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        try {
            const res = await api.get("/recruitment/applications");
            applications = res.applications || [];
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    });

    async function updateStatus(appId, status) {
        try {
            await api.put(`/recruitment/applications/${appId}/status`, { status });
            applications = applications.map((a) => (a.id === appId ? { ...a, status } : a));
        } catch {
            alert("Lỗi khi cập nhật trạng thái");
        }
    }

    const statusLabel = { pending: "Chờ", reviewed: "Đã xem", accepted: "Nhận", rejected: "Từ chối" };
</script>

<div class="space-y-4 pb-4">
    <div class="flex items-center gap-3">
        <button onclick={() => goto("/recruitment")} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
            <i class="bx bx-left-arrow-alt text-2xl"></i>
        </button>
        <h1 class="text-xl font-black text-[#2c293e]">Quản lý Ứng tuyển</h1>
    </div>

    {#if loading}
        <div class="py-16 text-center opacity-40"><i class="bx bx-loader-alt animate-spin text-4xl"></i></div>
    {:else if applications.length === 0}
        <div class="py-16 text-center space-y-3 opacity-50">
            <i class="bx bx-folder-open text-6xl"></i>
            <p>Chưa có ứng viên nào ứng tuyển.</p>
        </div>
    {:else}
        <div class="space-y-3">
            {#each applications as app, i}
                <div in:fly={{ y: 15, delay: i * 30 }} class="glass p-4 rounded-3xl border border-[#f2e9e1] space-y-3">
                    <div>
                        <span class="text-[10px] font-black text-[#286983] uppercase">{app.job_title}</span>
                        <h3 class="text-lg font-black text-[#2c293e]">{app.name}</h3>
                        <p class="text-xs text-[#797593]">{app.email} • {app.phone || "N/A"}</p>
                    </div>
                    {#if app.cv_url}
                        <a href={app.cv_url.startsWith("http") ? app.cv_url : `${STATIC_BASE}${app.cv_url}`} target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-[#907aa9]/10 text-[#907aa9] rounded-xl text-xs font-bold">
                            <i class="bx bx-file-blank"></i> Xem CV
                        </a>
                    {/if}
                    <div class="grid grid-cols-4 gap-1.5">
                        {#each ["pending", "reviewed", "accepted", "rejected"] as status}
                            <button
                                onclick={() => updateStatus(app.id, status)}
                                class="py-2.5 rounded-xl text-[10px] font-black uppercase transition-all min-h-[40px]
                                {app.status === status
                                    ? status === 'accepted' ? 'bg-emerald-500 text-white' : status === 'rejected' ? 'bg-[#b4637a] text-white' : 'bg-[#286983] text-white'
                                    : 'bg-[#f2e9e1]/50 text-[#797593]'}"
                            >
                                {statusLabel[status]}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
