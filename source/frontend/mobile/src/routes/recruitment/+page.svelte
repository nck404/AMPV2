<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { currentUser, isLoggedIn } from "$lib/stores/auth.js";

    let jobs = $state([]);
    let loading = $state(true);
    let searchTerm = $state("");

    onMount(async () => {
        try {
            const res = await api.get("/recruitment/jobs");
            jobs = res?.jobs || [];
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    });

    let filteredJobs = $derived(
        jobs.filter(
            (j) =>
                j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.company.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    function goPost() {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        goto("/recruitment/post");
    }
</script>

<div class="space-y-4 pb-4">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-black text-[#2c293e]">Việc làm</h1>
            <p class="text-xs text-[#575279] mt-0.5">Cơ hội hòa nhập cho người khuyết tật</p>
        </div>
        <button onclick={goPost} class="w-12 h-12 rounded-2xl bg-[#286983] text-white flex items-center justify-center shadow-lg flex-shrink-0" aria-label="Đăng tin tuyển dụng">
            <i class="bx bx-plus text-2xl"></i>
        </button>
    </div>

    {#if $currentUser?.role === "business"}
        <a href="/recruitment/manage" class="block w-full text-center py-3 bg-[#286983]/10 text-[#286983] font-bold rounded-2xl border border-[#286983]/20 min-h-[48px]">
            <i class="bx bx-list-check mr-1"></i> Quản lý ứng tuyển
        </a>
    {/if}

    <div class="relative">
        <i class="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-[#797593] text-lg"></i>
        <input bind:value={searchTerm} placeholder="Tìm việc làm, công ty..." class="w-full h-12 pl-11 pr-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
    </div>

    {#if loading}
        <div class="py-16 text-center opacity-40"><i class="bx bx-loader-alt animate-spin text-4xl"></i></div>
    {:else if filteredJobs.length === 0}
        <div class="py-16 text-center space-y-3 opacity-50">
            <i class="bx bx-briefcase text-6xl"></i>
            <p>Chưa có việc làm phù hợp.</p>
        </div>
    {:else}
        <div class="space-y-3">
            {#each filteredJobs as job, i}
                <button in:fly={{ y: 15, delay: i * 40 }} onclick={() => goto(`/recruitment/${job.id}/apply`)} class="w-full text-left glass p-4 rounded-3xl border border-[#f2e9e1] space-y-2">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-xl bg-[#286983]/10 text-[#286983] flex items-center justify-center font-black text-lg flex-shrink-0">{job.logo}</div>
                        <div class="flex-1 min-w-0">
                            <h2 class="font-black text-[#2c293e] text-base truncate">{job.title}</h2>
                            <p class="text-xs text-[#797593] truncate">{job.company} • {job.location}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs font-bold">
                        <span class="text-[#286983]">{job.salary}</span>
                        <span class="text-[#797593]">{job.date}</span>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
