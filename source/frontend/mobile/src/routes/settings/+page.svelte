<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { currentUser, updateUser, clearSession, isLoggedIn } from "$lib/stores/auth.js";
    import { accessSettings, updateAccessSettings, haptic } from "$lib/stores/access.js";
    import { speak } from "$lib/speech.js";

    let email = $state("");
    let oldPassword = $state("");
    let newPassword = $state("");
    let confirmPassword = $state("");
    let message = $state({ text: "", type: "" });
    let loading = $state(false);

    let audioContext = null;
    let audioStream = null;
    let isListeningEnvironment = $state(false);
    let environmentWarning = $state(false);

    onMount(() => {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        email = $currentUser?.email || "";
    });

    async function updateEmail() {
        loading = true;
        message = { text: "", type: "" };
        try {
            const res = await api.put("/me/email", { email });
            if (res.msg) {
                message = { text: "Cập nhật email thành công!", type: "success" };
                updateUser({ email });
                speak(message.text);
            }
        } catch {
            message = { text: "Lỗi cập nhật email", type: "error" };
            speak(message.text, { force: true });
        } finally {
            loading = false;
        }
    }

    async function updatePassword() {
        if (newPassword !== confirmPassword) {
            message = { text: "Mật khẩu mới không khớp!", type: "error" };
            speak(message.text, { force: true });
            return;
        }
        loading = true;
        message = { text: "", type: "" };
        try {
            const res = await api.put("/me/password", { old_password: oldPassword, new_password: newPassword });
            if (res.msg) {
                message = { text: "Đổi mật khẩu thành công!", type: "success" };
                oldPassword = newPassword = confirmPassword = "";
                speak(message.text);
            }
        } catch {
            message = { text: "Sai mật khẩu hiện tại hoặc lỗi máy chủ", type: "error" };
            speak(message.text, { force: true });
        } finally {
            loading = false;
        }
    }

    async function toggleEnvironmentListening() {
        if (isListeningEnvironment) {
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(audioStream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const check = () => {
                    if (!isListeningEnvironment) return;
                    analyser.getByteFrequencyData(dataArray);
                    if (Math.max(...dataArray) > 220 && !environmentWarning) {
                        environmentWarning = true;
                        haptic([300, 100, 300, 100, 300]);
                        speak("Cảnh báo, phát hiện âm thanh khẩn cấp.", { force: true });
                        setTimeout(() => (environmentWarning = false), 4000);
                    }
                    requestAnimationFrame(check);
                };
                check();
            } catch {
                isListeningEnvironment = false;
                speak("Không thể truy cập Microphone.", { force: true });
            }
        } else {
            if (audioStream) audioStream.getTracks().forEach((t) => t.stop());
            if (audioContext) audioContext.close();
        }
    }

    function logout() {
        clearSession();
        goto("/login");
    }
</script>

<div in:fly={{ y: 15 }} class="space-y-4 pb-4">
    <div class="flex items-center gap-3">
        <button onclick={() => goto("/profile")} class="w-11 h-11 rounded-2xl bg-[#fffaf3] border-2 border-[#f2e9e1] flex items-center justify-center" aria-label="Quay lại">
            <i class="bx bx-left-arrow-alt text-2xl"></i>
        </button>
        <h1 class="text-xl font-black text-[#2c293e]">Cài đặt</h1>
    </div>

    {#if message.text}
        <div class="px-4 py-3 rounded-2xl font-bold text-sm {message.type === 'success' ? 'bg-[#286983]/10 text-[#286983]' : 'bg-[#b4637a]/10 text-[#b4637a]'}">{message.text}</div>
    {/if}

    <section class="glass rounded-3xl p-5 border-2 border-[#f2e9e1] space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2 border-b border-[#f2e9e1] pb-2">
            <i class="bx bx-accessibility text-[#7287fd]"></i> Trợ năng
        </h2>

        <div class="p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
            <div class="flex justify-between mb-2">
                <p class="font-bold text-[#2c293e] text-sm">Cỡ chữ</p>
                <span class="text-xs font-bold bg-[#7287fd]/10 text-[#7287fd] px-2 py-0.5 rounded-full">{Math.round($accessSettings.fontScale * 100)}%</span>
            </div>
            <input
                type="range"
                min="1"
                max="1.6"
                step="0.1"
                value={$accessSettings.fontScale}
                oninput={(e) => updateAccessSettings({ fontScale: parseFloat(e.target.value) })}
                class="w-full accent-[#7287fd] h-6"
                aria-label="Điều chỉnh cỡ chữ"
            />
        </div>

        <label class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
            <div>
                <p class="font-bold text-[#2c293e] text-sm">Chế độ tương phản cao</p>
                <p class="text-[10px] text-[#797593]">Chữ đen nền trắng, dễ đọc hơn cho người khiếm thị</p>
            </div>
            <input type="checkbox" checked={$accessSettings.highContrast} onchange={(e) => updateAccessSettings({ highContrast: e.target.checked })} class="w-7 h-7 accent-[#7287fd] flex-shrink-0" />
        </label>

        <label class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
            <div>
                <p class="font-bold text-[#2c293e] text-sm">Phản hồi giọng nói</p>
                <p class="text-[10px] text-[#797593]">Đọc to tên nút khi bạn thao tác</p>
            </div>
            <input type="checkbox" checked={$accessSettings.speechFeedback} onchange={(e) => updateAccessSettings({ speechFeedback: e.target.checked })} class="w-7 h-7 accent-[#7287fd] flex-shrink-0" />
        </label>

        <label class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
            <div>
                <p class="font-bold text-[#2c293e] text-sm">Phản hồi xúc giác</p>
                <p class="text-[10px] text-[#797593]">Rung điện thoại khi tương tác</p>
            </div>
            <input type="checkbox" checked={$accessSettings.hapticFeedback} onchange={(e) => updateAccessSettings({ hapticFeedback: e.target.checked })} class="w-7 h-7 accent-[#7287fd] flex-shrink-0" />
        </label>

        <label class="flex items-center justify-between p-3 bg-[#fffaf3] rounded-2xl border border-[#f2e9e1]">
            <div>
                <p class="font-bold text-[#2c293e] text-sm">Cảnh báo âm thanh lớn</p>
                <p class="text-[10px] text-[#797593]">Rung & cảnh báo khi có còi xe, cháy</p>
            </div>
            <input type="checkbox" bind:checked={isListeningEnvironment} onchange={toggleEnvironmentListening} class="w-7 h-7 accent-[#7287fd] flex-shrink-0" />
        </label>
    </section>

    <section class="glass rounded-3xl p-5 border-2 border-[#f2e9e1] space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2 border-b border-[#f2e9e1] pb-2">
            <i class="bx bx-user-circle text-[#907aa9]"></i> Tài khoản
        </h2>
        <div class="space-y-2">
            <label for="email" class="text-xs font-bold text-[#797593]">Địa chỉ email</label>
            <div class="flex gap-2">
                <input id="email" type="email" bind:value={email} class="flex-1 h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9]" />
                <button onclick={updateEmail} disabled={loading} class="px-5 bg-[#907aa9] text-white font-bold rounded-xl text-sm min-h-[48px]">Lưu</button>
            </div>
        </div>

        <div class="space-y-2">
            <p class="text-xs font-bold text-[#797593]">Đổi mật khẩu</p>
            <input type="password" bind:value={oldPassword} placeholder="Mật khẩu hiện tại" class="w-full h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9]" />
            <input type="password" bind:value={newPassword} placeholder="Mật khẩu mới" class="w-full h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9]" />
            <input type="password" bind:value={confirmPassword} placeholder="Xác nhận mật khẩu mới" class="w-full h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9]" />
            <button onclick={updatePassword} disabled={loading} class="w-full h-12 bg-[#907aa9] text-white font-bold rounded-xl text-sm min-h-[48px]">Lưu mật khẩu mới</button>
        </div>
    </section>

    <button onclick={logout} class="w-full py-4 bg-[#b4637a]/10 text-[#b4637a] font-bold rounded-2xl border-2 border-[#b4637a]/20 min-h-[52px]">
        <i class="bx bx-log-out-circle mr-1"></i> Đăng xuất
    </button>
</div>

{#if environmentWarning}
    <div class="fixed inset-0 bg-red-600/30 z-[9999] pointer-events-none flex flex-col items-center justify-center backdrop-blur-sm">
        <div class="bg-red-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold text-lg border-4 border-red-400">
            <i class="bx bxs-error-circle text-4xl animate-bounce"></i>
            <span>CẢNH BÁO ÂM THANH LỚN!</span>
        </div>
    </div>
{/if}
