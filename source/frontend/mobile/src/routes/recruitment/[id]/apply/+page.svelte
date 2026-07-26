<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { isLoggedIn } from "$lib/stores/auth.js";
    import { speak } from "$lib/speech.js";

    const jobId = page.params.id;
    let job = $state(null);
    let formData = $state({ name: "", email: "", phone: "", cv_url: "", cover_letter: "" });
    let loading = $state(false);
    let uploading = $state(false);
    let error = $state("");
    let success = $state(false);

    onMount(async () => {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        try {
            job = await api.get(`/recruitment/jobs/${jobId}`);
        } catch {
            error = "Không tìm thấy thông tin công việc.";
        }
    });

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        uploading = true;
        const uploadData = new FormData();
        uploadData.append("cv", file);
        try {
            const res = await api.upload("/recruitment/upload", uploadData);
            if (res.cv_url) {
                formData.cv_url = res.cv_url;
                speak("Tải CV thành công");
            } else {
                error = res.msg || "Lỗi khi tải lên CV.";
            }
        } catch {
            error = "Lỗi khi tải lên CV.";
        } finally {
            uploading = false;
        }
    }

    async function handleSubmit() {
        if (!formData.cv_url) {
            error = "Vui lòng tải lên CV của bạn.";
            speak(error, { force: true });
            return;
        }
        loading = true;
        error = "";
        try {
            const res = await api.post(`/recruitment/jobs/${jobId}/apply`, formData);
            success = true;
            speak("Nộp đơn thành công");
            setTimeout(() => goto("/recruitment"), 2500);
        } catch (err) {
            error = "Đã xảy ra lỗi khi nộp đơn.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="space-y-4 pb-4">
    {#if job}
        <div in:fly={{ y: -10 }} class="space-y-3">
            <div class="flex items-center gap-3">
                <div class="w-14 h-14 bg-[#fffaf3] border border-[#f2e9e1] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    <i class="bx bx-briefcase text-[#286983]"></i>
                </div>
                <div class="min-w-0">
                    <h1 class="text-xl font-black text-[#2c293e] truncate">{job.title}</h1>
                    <p class="text-[#286983] font-bold text-xs uppercase">{job.company} • {job.location}</p>
                </div>
            </div>
            <div class="p-4 bg-[#286983]/5 rounded-2xl border border-[#286983]/10">
                <p class="text-sm text-[#575279] whitespace-pre-line">{job.description}</p>
            </div>
        </div>

        {#if success}
            <div in:fade class="bg-[#286983]/10 border border-[#286983]/20 p-8 rounded-3xl text-center space-y-4">
                <div class="w-16 h-16 bg-[#286983] text-white rounded-full flex items-center justify-center text-3xl mx-auto"><i class="bx bx-check"></i></div>
                <h2 class="text-lg font-black text-[#286983]">Ứng tuyển thành công!</h2>
                <p class="text-sm text-[#575279]">Đơn của bạn đã được gửi. Chúc bạn may mắn!</p>
            </div>
        {:else}
            <div class="space-y-4">
                {#if error}
                    <div class="p-4 bg-[#b4637a]/10 border border-[#b4637a]/20 rounded-2xl text-[#b4637a] text-sm font-bold">{error}</div>
                {/if}
                <input bind:value={formData.name} placeholder="Họ và tên" required class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
                <input bind:value={formData.email} type="email" placeholder="Email liên lạc" required class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />
                <input bind:value={formData.phone} type="tel" placeholder="Số điện thoại" class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983]" />

                <div class="relative">
                    <input type="file" accept=".pdf,.doc,.docx" onchange={handleFileUpload} class="absolute inset-0 opacity-0" aria-label="Tải lên CV" />
                    <div class="w-full h-14 px-5 rounded-2xl border-2 border-dashed border-[#286983]/30 bg-[#286983]/5 font-black text-[#286983] flex items-center justify-center gap-2 text-sm">
                        {#if uploading}
                            <i class="bx bx-loader-alt animate-spin"></i> Đang tải lên...
                        {:else if formData.cv_url}
                            <i class="bx bx-check-double"></i> Đã tải lên CV
                        {:else}
                            <i class="bx bx-cloud-upload"></i> Tải lên tệp CV (PDF/DOCX)
                        {/if}
                    </div>
                </div>

                <textarea bind:value={formData.cover_letter} rows="5" placeholder="Thư giới thiệu (tùy chọn)..." class="w-full p-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl outline-none focus:border-[#286983] resize-none"></textarea>

                <button onclick={handleSubmit} disabled={loading || uploading} class="w-full h-16 bg-[#286983] text-white font-black rounded-2xl shadow-lg text-lg active:scale-[0.98] transition-all disabled:opacity-60">
                    {loading ? "Đang gửi..." : "Nộp hồ sơ ngay"}
                </button>
            </div>
        {/if}
    {:else if !error}
        <div class="py-24 text-center"><i class="bx bx-loader-alt animate-spin text-5xl text-[#286983] opacity-30"></i></div>
    {:else}
        <div class="py-24 text-center space-y-4">
            <i class="bx bx-error text-6xl text-[#b4637a]/50"></i>
            <p class="text-[#575279] font-bold">{error}</p>
            <a href="/recruitment" class="inline-block px-8 py-3 bg-[#286983] text-white font-bold rounded-2xl">Quay lại danh sách</a>
        </div>
    {/if}
</div>
