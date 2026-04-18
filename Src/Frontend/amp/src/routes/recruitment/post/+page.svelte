<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";

    let jobData = $state({
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "Full-time",
        description: ""
    });

    let loading = $state(false);
    let error = $state("");
    let success = $state(false);

    async function handleSubmit() {
        loading = true;
        error = "";
        try {
            await api.post("/recruitment/jobs", jobData);
            success = true;
            setTimeout(() => {
                goto("/recruitment");
            }, 3000);
        } catch (err) {
            error = err.response?.data?.message || "Đã xảy ra lỗi khi đăng bài.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen py-20 px-6">
    <div class="max-w-4xl mx-auto">
        <div class="mb-12 text-center" in:fly={{ y: -20 }}>
            <h1 class="text-5xl font-black text-rose-text mb-4">Đăng Tin <span class="text-gold">Tuyển Dụng</span></h1>
            <p class="text-subtle text-lg">Chia sẻ cơ hội nghề nghiệp đến cộng đồng tài năng của AMP.</p>
        </div>

        {#if success}
            <div in:fade class="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] text-center space-y-6">
                <div class="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-200">
                    <i class="bx bx-check"></i>
                </div>
                <h2 class="text-3xl font-black text-emerald-900">Gửi thành công!</h2>
                <p class="text-emerald-700 font-medium">Tin tuyển dụng của bạn đang được chờ quản trị viên phê duyệt. Bạn sẽ được chuyển hướng về trang chủ sau vài giây...</p>
            </div>
        {:else}
            <form on:submit|preventDefault={handleSubmit} class="bg-surface border border-overlay p-12 rounded-[4rem] shadow-2xl shadow-rose-text/5 space-y-8" in:fly={{ y: 20 }}>
                {#if error}
                    <div class="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-3">
                        <i class="bx bx-error-circle text-xl"></i> {error}
                    </div>
                {/if}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <label for="title" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-briefcase"></i> Vị trí tuyển dụng
                        </label>
                        <input 
                            id="title"
                            type="text" 
                            bind:value={jobData.title}
                            placeholder="VD: Senior Web Developer"
                            required
                            class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                        />
                    </div>

                    <div class="space-y-3">
                        <label for="company" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-buildings"></i> Tên công ty/doanh nghiệp
                        </label>
                        <input 
                            id="company" 
                            type="text" 
                            bind:value={jobData.company}
                            placeholder="VD: AMP Technology"
                            required
                            class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                        />
                    </div>

                    <div class="space-y-3">
                        <label for="salary" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-wallet"></i> Mức lương
                        </label>
                        <input 
                            id="salary" 
                            type="text" 
                            bind:value={jobData.salary}
                            placeholder="VD: 15 - 20 Triệu"
                            class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                        />
                    </div>

                    <div class="space-y-3">
                        <label for="location" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-map-pin"></i> Địa điểm
                        </label>
                        <input 
                            id="location" 
                            type="text" 
                            bind:value={jobData.location}
                            placeholder="VD: TP. Hồ Chí Minh / Remote"
                            class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                        />
                    </div>

                    <div class="space-y-3 col-span-full">
                        <label for="type" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-time-five"></i> Loại hình công việc
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {#each ['Full-time', 'Part-time', 'Contract', 'Internship'] as type}
                                <button 
                                    type="button"
                                    on:click={() => jobData.type = type}
                                    class="h-14 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest
                                    {jobData.type === type ? 'border-gold bg-gold/5 text-gold' : 'border-overlay bg-white text-muted hover:border-gold/30'}"
                                >
                                    {type}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div class="space-y-3 col-span-full">
                        <label for="description" class="text-sm font-black text-rose-text flex items-center gap-2 uppercase tracking-widest opacity-60">
                            <i class="bx bx-info-circle"></i> Mô tả công việc & yêu cầu
                        </label>
                        <textarea 
                            id="description" 
                            bind:value={jobData.description}
                            placeholder="Mô tả chi tiết vị trí, yêu cầu kỹ năng và các quyền lợi..."
                            required
                            rows="8"
                            class="w-full p-6 rounded-[2rem] bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                        ></textarea>
                    </div>
                </div>

                <div class="pt-6 border-t border-overlay flex items-center justify-between gap-6">
                    <a href="/recruitment" class="text-rose-text font-black text-sm uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
                        <i class="bx bx-left-arrow-alt text-xl"></i> Quay lại
                    </a>
                    <button 
                        type="submit" 
                        disabled={loading}
                        class="px-12 h-16 bg-gold text-white font-black rounded-2xl shadow-xl shadow-gold/20 hover:bg-gold/80 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {#if loading}
                            <i class="bx bx-loader-alt animate-spin"></i> Đang đăng...
                        {:else}
                            Đăng tin ngay
                        {/if}
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
