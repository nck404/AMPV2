<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { isLoggedIn } from "$lib/stores/auth.js";
    import { speak } from "$lib/speech.js";

    let title = $state("");
    let content = $state("");
    let tags = $state("");
    let submitting = $state(false);

    onMount(() => {
        if (!isLoggedIn()) goto("/login");
    });

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            speak("Vui lòng điền đầy đủ tiêu đề và nội dung.", { force: true });
            return;
        }
        submitting = true;
        try {
            const res = await api.post("/forum/posts", { title, content, tags });
            if (res.id) {
                speak("Đăng bài thành công");
                goto("/forum");
            } else {
                speak(res.msg || "Có lỗi xảy ra khi đăng bài.", { force: true });
            }
        } catch {
            speak("Lỗi kết nối máy chủ.", { force: true });
        } finally {
            submitting = false;
        }
    }
</script>

<div in:fly={{ y: 15 }} class="space-y-4 pb-4">
    <div class="flex items-center gap-3">
        <button onclick={() => goto("/forum")} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
            <i class="bx bx-left-arrow-alt text-2xl"></i>
        </button>
        <h1 class="text-xl font-black text-[#2c293e]">Viết bài mới</h1>
    </div>

    <div class="space-y-1.5">
        <label for="title" class="text-xs font-black text-[#797593] uppercase">Tiêu đề</label>
        <input id="title" bind:value={title} placeholder="Tiêu đề bài viết..." class="w-full h-14 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl px-5 text-base focus:border-[#907aa9] outline-none" />
    </div>

    <div class="space-y-1.5">
        <label for="content" class="text-xs font-black text-[#797593] uppercase">Nội dung</label>
        <textarea id="content" bind:value={content} rows="10" placeholder="Nội dung bài viết..." class="w-full bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl p-5 text-base focus:border-[#907aa9] outline-none resize-none"></textarea>
    </div>

    <div class="space-y-1.5">
        <label for="tags" class="text-xs font-black text-[#797593] uppercase">Tags (cách nhau bằng dấu phẩy)</label>
        <input id="tags" bind:value={tags} placeholder="Học tập, Kinh nghiệm..." class="w-full h-12 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl px-4 text-sm focus:border-[#907aa9] outline-none" />
    </div>

    <button onclick={handleSubmit} disabled={submitting} class="w-full h-16 bg-[#907aa9] text-white font-black rounded-2xl shadow-lg text-lg active:scale-[0.98] transition-all disabled:opacity-60">
        {submitting ? "Đang gửi..." : "Đăng bài ngay"}
    </button>
</div>
