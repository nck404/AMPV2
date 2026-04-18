<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";

    let applications = $state([]);
    let loading = $state(true);
    let selectedApps = $state([]);
    let showEmailModal = $state(false);
    let emailData = $state({
        subject: "Thông báo kết quả ứng tuyển - AMP Recruitment",
        body: "Chào bạn,\n\nChúng tôi đã xem qua hồ sơ của bạn và rất ấn tượng..."
    });

    let sendingEmail = $state(false);

    async function fetchApplications() {
        try {
            const res = await api.get("/recruitment/applications");
            applications = res.applications || [];
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }

    async function updateStatus(appId, status) {
        try {
            await api.put(`/recruitment/applications/${appId}/status`, { status });
            applications = applications.map(a => a.id === appId ? { ...a, status } : a);
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái");
        }
    }

    function toggleSelect(appId) {
        if (selectedApps.includes(appId)) {
            selectedApps = selectedApps.filter(id => id !== appId);
        } else {
            selectedApps = [...selectedApps, appId];
        }
    }

    function exportEmails() {
        const selectedEmails = applications
            .filter(a => selectedApps.includes(a.id))
            .map(a => a.email)
            .join("\n");
        
        const blob = new Blob([selectedEmails], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ung_vien_da_chon.txt";
        a.click();
    }

    async function sendEmails() {
        sendingEmail = true;
        const targetEmails = applications
            .filter(a => selectedApps.includes(a.id))
            .map(a => a.email);
            
        try {
            await api.post("/recruitment/applications/send-email", {
                emails: targetEmails,
                ...emailData
            });
            alert("Email đã được gửi thành công!");
            showEmailModal = false;
        } catch (err) {
            alert("Lỗi khi gửi email");
        } finally {
            sendingEmail = false;
        }
    }

    onMount(fetchApplications);
</script>

<div class="min-h-screen py-20 px-6">
    <div class="max-w-6xl mx-auto space-y-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6" in:fly={{ y: -20 }}>
            <div class="space-y-4">
                <h1 class="text-5xl font-black text-rose-text">Quản Lý <span class="text-gold">Ứng Tuyển</span></h1>
                <p class="text-subtle text-lg">Theo dõi và phản hồi các ứng viên tiềm năng cho công ty của bạn.</p>
            </div>
            
            <div class="flex flex-wrap gap-4">
                <button 
                    disabled={selectedApps.length === 0}
                    onclick={exportEmails}
                    class="px-6 h-14 bg-white border border-overlay rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gold/5 hover:border-gold transition-all disabled:opacity-30"
                >
                    <i class="bx bx-export text-xl text-gold"></i> Xuất file (.txt)
                </button>
                <button 
                    disabled={selectedApps.length === 0}
                    onclick={() => showEmailModal = true}
                    class="px-8 h-14 bg-gold text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl shadow-gold/20 transition-all disabled:opacity-30"
                >
                    <i class="bx bx-envelope text-xl"></i> Gửi email hàng loạt
                </button>
            </div>
        </div>

        {#if loading}
            <div class="py-40 text-center">
                <i class="bx bx-loader-alt animate-spin text-6xl text-gold opacity-30"></i>
            </div>
        {:else if applications.length === 0}
            <div class="py-40 text-center space-y-6 bg-surface border border-overlay rounded-[4rem] opacity-50" in:fade>
                <i class="bx bx-folder-open text-8xl"></i>
                <p class="text-xl font-bold">Chưa có ứng viên nào ứng tuyển...</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 gap-6">
                {#each applications as app, i}
                    <div 
                        in:fly={{ y: 20, delay: i * 50 }}
                        class="group p-8 bg-surface border border-overlay rounded-[3rem] hover:bg-white hover:border-gold/30 transition-all duration-500 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm hover:shadow-2xl hover:shadow-gold/5"
                        class:border-gold={selectedApps.includes(app.id)}
                    >
                        <div class="flex items-center gap-8 flex-1">
                            <div class="relative">
                                <button 
                                    onclick={() => toggleSelect(app.id)}
                                    class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all
                                    {selectedApps.includes(app.id) ? 'bg-gold border-gold text-white' : 'bg-white border-overlay text-transparent hover:border-gold/50'}"
                                >
                                    <i class="bx bx-check text-2xl"></i>
                                </button>
                            </div>

                            <div class="space-y-2">
                                <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                    <span class="text-gold">{app.job_title}</span>
                                    <span class="w-1.5 h-1.5 bg-muted rounded-full opacity-20"></span>
                                    <span class="text-muted">{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 class="text-3xl font-black text-rose-text">{app.name}</h3>
                                <div class="flex flex-wrap gap-4 pt-2">
                                    <span class="flex items-center gap-1 text-xs text-subtle font-bold">
                                        <i class="bx bx-envelope text-gold"></i> {app.email}
                                    </span>
                                    <span class="flex items-center gap-1 text-xs text-subtle font-bold">
                                        <i class="bx bx-phone text-gold"></i> {app.phone || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-4">
                            {#if app.cv_url}
                                <a 
                                    href={app.cv_url.startsWith('http') ? app.cv_url : STATIC_BASE + app.cv_url} 
                                    target="_blank"
                                    class="px-6 py-3 bg-iris/10 text-iris rounded-xl font-black text-xs uppercase tracking-widest hover:bg-iris hover:text-white transition-all flex items-center gap-2"
                                >
                                    <i class="bx bx-file-blank text-lg"></i> Xem CV
                                </a>
                            {/if}

                            <div class="flex items-center bg-overlay/30 rounded-2xl p-1.5 border border-overlay">
                                {#each ['pending', 'reviewed', 'accepted', 'rejected'] as status}
                                    <button 
                                        onclick={() => updateStatus(app.id, status)}
                                        class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                        {app.status === status ? 
                                            (status === 'accepted' ? 'bg-emerald-500 text-white' : 
                                             status === 'rejected' ? 'bg-rose-500 text-white' : 
                                             'bg-gold text-white shadow-lg shadow-gold/20') : 
                                            'text-muted hover:text-rose-text'}"
                                    >
                                        {status === 'pending' ? 'Chờ' : status === 'reviewed' ? 'Đã xem' : status === 'accepted' ? 'Nhận' : 'Từ chối'}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Email Modal -->
{#if showEmailModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-6" in:fade>
        <div 
            class="absolute inset-0 bg-rose-text/40 backdrop-blur-md"
            onclick={() => showEmailModal = false}
            onkeydown={(e) => e.key === 'Escape' && (showEmailModal = false)}
            role="button"
            tabindex="-1"
            aria-label="Close modal"
        ></div>
        <div class="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col" in:fly={{ y: 50 }}>
            <div class="p-10 border-b border-overlay bg-gold/5 flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-black text-rose-text">Gửi Email Hàng Loạt</h3>
                    <p class="text-sm text-subtle font-medium mt-1">Gửi đến {selectedApps.length} ứng viên đã chọn</p>
                </div>
                <button onclick={() => showEmailModal = false} class="w-12 h-12 rounded-full border border-overlay flex items-center justify-center text-3xl text-subtle hover:text-rose-text transition-all">
                    <i class="bx bx-x"></i>
                </button>
            </div>
            
            <div class="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div class="space-y-3">
                    <label for="subject" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Tiêu đề email</label>
                    <input 
                        id="subject"
                        type="text" 
                        bind:value={emailData.subject}
                        class="w-full h-14 px-6 rounded-2xl bg-white border border-overlay focus:border-gold/50 transition-all font-medium"
                    />
                </div>

                <div class="space-y-3">
                    <label for="body" class="text-xs font-black text-rose-text uppercase tracking-widest opacity-60">Nội dung thông báo</label>
                    <textarea 
                        id="body" 
                        bind:value={emailData.body}
                        rows="10"
                        class="w-full p-6 rounded-[2rem] bg-white border border-overlay focus:border-gold/50 transition-all font-medium"
                    ></textarea>
                </div>
            </div>

            <div class="p-10 border-t border-overlay bg-overlay/10 flex items-center justify-end gap-6">
                <button onclick={() => showEmailModal = false} class="text-rose-text font-black text-xs uppercase tracking-widest hover:text-gold transition-colors">
                    Hủy bỏ
                </button>
                <button 
                    onclick={sendEmails}
                    disabled={sendingEmail}
                    class="px-10 h-14 bg-gold text-white font-black rounded-2xl shadow-xl shadow-gold/20 hover:bg-gold/80 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                >
                    {#if sendingEmail}
                        <i class="bx bx-loader-alt animate-spin"></i> Đang gửi...
                    {:else}
                        Gửi thông báo ngay
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(215, 130, 126, 0.2);
        border-radius: 99px;
    }
</style>
