<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    const jobId = $page.params.id;
    let job = $state(null);
    let formData = $state({
        name: "",
        email: "",
        phone: "",
        cv_url: "",
        cover_letter: ""
    });

    let loading = $state(false);
    let uploading = $state(false);
    let error = $state("");
    let success = $state(false);
    let fileInput;

    async function fetchJob() {
        try {
            const res = await api.get(`/recruitment/jobs/${jobId}`);
            job = res;
        } catch (err) {
            error = "Không tìm thấy thông tin công việc.";
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        uploading = true;
        const uploadData = new FormData();
        uploadData.append("cv", file);

        try {
            const res = await api.post("/recruitment/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            formData.cv_url = res.cv_url;
        } catch (err) {
            error = err.response?.data?.message || "Lỗi khi tải lên CV.";
        } finally {
            uploading = false;
        }
    }

    async function handleSubmit() {
        if (!formData.cv_url) {
            error = "Vui lòng tải lên CV của bạn.";
            return;
        }

        loading = true;
        error = "";
        try {
            await api.post(`/recruitment/jobs/${jobId}/apply`, formData);
            success = true;
            setTimeout(() => {
                goto("/recruitment");
            }, 3000);
        } catch (err) {
            error = err.response?.data?.message || "Đã xảy ra lỗi khi nộp đơn.";
        } finally {
            loading = false;
        }
    }

    onMount(fetchJob);
</script>

<div class="min-h-screen py-20 px-6">
    <div class="max-w-4xl mx-auto">
        {#if job}
            <div class="mb-12" in:fly={{ y: -20 }}>
                <div class="flex items-center gap-6 mb-6">
                    <div class="w-20 h-20 bg-white border border-overlay rounded-[2rem] flex items-center justify-center text-4xl shadow-sm">
                        <i class="bx bx-briefcase text-gold"></i>
                    </div>
                    <div>
                        <h1 class="text-4xl font-black text-rose-text">{job.title}</h1>
                        <p class="text-gold font-bold uppercase tracking-widest text-sm">{job.company} • {job.location}</p>
                    </div>
                </div>
                <div class="p-8 bg-gold/5 rounded-[2.5rem] border border-gold/10">
                    <p class="text-subtle leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
            </div>

            {#if success}
                <div in:fade class="bg-emerald-50 border border-emerald-100 p-12 rounded-[3.5rem] text-center space-y-6 shadow-xl shadow-emerald-500/5">
                    <div class="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-emerald-500/20">
                        <i class="bx bx-party"></i>
                    </div>
                    <h2 class="text-3xl font-black text-emerald-900">Ứng tuyển thành công!</h2>
                    <p class="text-emerald-700 text-lg font-medium">Đơn ứng tuyển của bạn đã được gửi đến nhà tuyển dụng. Chúc bạn may mắn!</p>
                </div>
            {:else}
                <form on:submit|preventDefault={handleSubmit} class="bg-surface border border-overlay p-12 rounded-[4rem] shadow-2xl shadow-rose-text/5 space-y-10" in:fly={{ y: 20 }}>
                    <div class="space-y-2">
                        <h2 class="text-2xl font-black text-rose-text">Thông tin ứng tuyển</h2>
                        <p class="text-subtle">Điền đầy đủ thông tin để nhà tuyển dụng có thể liên lạc với bạn.</p>
                    </div>

                    {#if error}
                        <div class="p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-3">
                            <i class="bx bx-error-circle text-xl"></i> {error}
                        </div>
                    {/if}

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                            <label for="name" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Họ và tên</label>
                            <input 
                                id="name"
                                type="text" 
                                bind:value={formData.name}
                                placeholder="Nguyễn Văn A"
                                required
                                class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium"
                            />
                        </div>

                        <div class="space-y-3">
                            <label for="email" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Email liên lạc</label>
                            <input 
                                id="email" 
                                type="email" 
                                bind:value={formData.email}
                                placeholder="user@example.com"
                                required
                                class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium"
                            />
                        </div>

                        <div class="space-y-3">
                            <label for="phone" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Số điện thoại</label>
                            <input 
                                id="phone" 
                                type="tel" 
                                bind:value={formData.phone}
                                placeholder="0901 xxx xxx"
                                class="w-full h-16 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium"
                            />
                        </div>

                        <div class="space-y-3">
                            <label class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">CV (PDF/DOCX)</label>
                            <div class="relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    class="hidden"
                                    bind:this={fileInput}
                                    on:change={handleFileUpload}
                                />
                                <button 
                                    type="button"
                                    on:click={() => fileInput.click()}
                                    disabled={uploading}
                                    class="w-full h-16 px-6 rounded-2xl border-2 border-dashed border-gold/30 bg-gold/5 font-black text-gold flex items-center justify-center gap-3 hover:bg-gold/10 transition-all disabled:opacity-50"
                                >
                                    {#if uploading}
                                        <i class="bx bx-loader-alt animate-spin"></i> Đang tải lên...
                                    {:else if formData.cv_url}
                                        <i class="bx bx-check-double text-xl"></i> Đã tải lên CV
                                    {:else}
                                        <i class="bx bx-cloud-upload text-xl"></i> Tải lên tệp CV
                                    {/if}
                                </button>
                                {#if formData.cv_url}
                                    <p class="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                                        <i class="bx bx-link"></i> CV Link: {formData.cv_url.split('/').pop()}
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <div class="space-y-3 col-span-full">
                            <label for="cover_letter" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Thư giới thiệu (tùy chọn)</label>
                            <textarea 
                                id="cover_letter" 
                                bind:value={formData.cover_letter}
                                placeholder="Tóm tắt ngắn gọn lý do tại sao bạn phù hợp với công việc này..."
                                rows="5"
                                class="w-full p-6 rounded-[2rem] bg-white border border-overlay focus:border-gold/50 transition-all font-medium shadow-sm"
                            ></textarea>
                        </div>
                    </div>

                    <div class="pt-10 border-t border-overlay flex items-center justify-between gap-6">
                        <a href="/recruitment" class="text-rose-text font-black text-xs uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
                            <i class="bx bx-left-arrow-alt text-xl"></i> Bỏ qua
                        </a>
                        <button 
                            type="submit" 
                            disabled={loading || uploading}
                            class="px-14 h-16 bg-gold text-white font-black rounded-2xl shadow-xl shadow-gold/20 hover:bg-gold/80 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {#if loading}
                                <i class="bx bx-loader-alt animate-spin"></i> Đang gửi...
                            {:else}
                                Nộp hồ sơ ngay
                            {/if}
                        </button>
                    </div>
                </form>
            {/if}
        {:else if !error}
            <div class="py-20 text-center">
                <i class="bx bx-loader-alt animate-spin text-5xl text-gold opacity-30"></i>
            </div>
        {:else}
            <div class="py-20 text-center space-y-4">
                <i class="bx bx-error text-6xl text-rose-300"></i>
                <p class="text-subtle font-bold">{error}</p>
                <a href="/recruitment" class="button inline-block px-10 bg-gold text-white">Quay lại danh sách</a>
            </div>
        {/if}
    </div>
</div>
