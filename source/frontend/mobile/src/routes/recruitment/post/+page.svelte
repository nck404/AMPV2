<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { isLoggedIn } from "$lib/stores/auth.js";
    import { speak } from "$lib/speech.js";

    let jobData = $state({ title: "", company: "", location: "", salary: "", type: "Full-time", description: "" });
    let loading = $state(false);
    let error = $state("");
    let success = $state(false);

    onMount(() => {
        if (!isLoggedIn()) goto("/login");
    });

    async function handleSubmit() {
        loading = true;
        error = "";
        try {
            const res = await api.post("/recruitment/jobs", jobData);
            if (res.job_id) {
                success = true;
                speak("Đăng tin thành công");
                setTimeout(() => goto("/recruitment"), 2000);
            } else {
                error = res.msg || "Đã xảy ra lỗi khi đăng bài.";
            }
        } catch {
            error = "Không thể kết nối máy chủ.";
        } finally {
            loading = false;
        }
    }
</script>

<div in:fly={{ y: 15 }} class="space-y-4 pb-4">
    <div class="flex items-center gap-3">
        <button onclick={() => goto("/recruitment")} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
            <i class="bx bx-left-arrow-alt text-2xl"></i>
        </button>
        <h1 class="text-xl font-black text-[#2c293e]">Đăng tin tuyển dụng</h1>
    </div>

    {#if success}
        <div class="py-16 text-center space-y-4">
            <i class="bx bx-check-circle text-6xl text-[#286983]"></i>
            <p class="font-bold text-[#2c293e]">Đăng tin thành công! Đang chờ admin duyệt.</p>
        </div>
    {:else}
        <div class="space-y-4">
            {#if error}
                <div class="p-4 bg-[#b4637a]/10 border border-[#b4637a]/20 rounded-2xl text-[#b4637a] text-sm font-bold">{error}</div>
            {/if}
            <input bind:value={jobData.title} placeholder="Chức danh công việc" class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
            <input bind:value={jobData.company} placeholder="Tên công ty" class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
            <input bind:value={jobData.location} placeholder="Địa điểm làm việc" class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
            <input bind:value={jobData.salary} placeholder="Mức lương (vd: 10 - 15 triệu)" class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
            <select bind:value={jobData.type} class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Remote</option>
            </select>
            <textarea bind:value={jobData.description} rows="6" placeholder="Mô tả công việc..." class="w-full p-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983] resize-none"></textarea>

            <button onclick={handleSubmit} disabled={loading} class="w-full h-16 bg-[#286983] text-white font-black rounded-2xl shadow-lg text-lg active:scale-[0.98] transition-all disabled:opacity-60">
                {loading ? "Đang đăng..." : "Đăng tin ngay"}
            </button>
        </div>
    {/if}
</div>
