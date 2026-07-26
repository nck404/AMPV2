<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api.js";
    import { goto } from "$app/navigation";
    import { currentUser, updateUser, clearSession, isLoggedIn } from "$lib/stores/auth.js";
    import { speak } from "$lib/speech.js";

    let isEditing = $state(false);
    let errorMsg = $state("");
    let uploadLoading = $state(false);
    let fileInput = $state();

    let editFormData = $state({ public_id: "", bio: "" });

    onMount(async () => {
        if (!isLoggedIn()) {
            goto("/login");
            return;
        }
        try {
            const userData = await api.get("/me");
            if (userData.id) updateUser(userData);
            else {
                clearSession();
                goto("/login");
            }
        } catch (err) {
            console.error(err);
        }
    });

    function startEditing() {
        editFormData = { public_id: $currentUser.public_id, bio: $currentUser.bio || "" };
        isEditing = true;
        errorMsg = "";
    }

    async function saveProfile() {
        errorMsg = "";
        if (editFormData.public_id && !/^[a-zA-Z0-9]+$/.test(editFormData.public_id)) {
            errorMsg = "ID chỉ được chứa chữ cái và số!";
            speak(errorMsg, { force: true });
            return;
        }
        try {
            await api.put("/me/public_id", { public_id: editFormData.public_id });
            await api.put("/me/bio", { bio: editFormData.bio });
            updateUser({ public_id: editFormData.public_id, bio: editFormData.bio });
            isEditing = false;
            speak("Đã lưu hồ sơ");
        } catch (err) {
            errorMsg = err.msg || "Lỗi khi lưu hồ sơ.";
            speak(errorMsg, { force: true });
        }
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        uploadLoading = true;
        try {
            const res = await api.upload("/me/avatar/upload", formData);
            if (res.avatar_url) {
                updateUser({ avatar_url: res.avatar_url });
                speak("Đã cập nhật ảnh đại diện");
            }
        } catch {
            speak("Lỗi tải ảnh lên", { force: true });
        } finally {
            uploadLoading = false;
            e.target.value = "";
        }
    }

    function logout() {
        clearSession();
        speak("Đã đăng xuất");
        goto("/login");
    }
</script>

{#if $currentUser}
    <div in:fly={{ y: 15 }} class="space-y-4 pb-4">
        <div class="glass p-6 rounded-[2rem] border-2 border-[#f2e9e1] space-y-5">
            {#if isEditing}
                <div in:fade class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-black text-[#2c293e]">Chỉnh sửa hồ sơ</h2>
                        <button onclick={() => (isEditing = false)} aria-label="Đóng" class="w-9 h-9 flex items-center justify-center"><i class="bx bx-x text-2xl"></i></button>
                    </div>
                    <div class="space-y-1.5">
                        <label for="public_id" class="text-xs font-black text-[#797593] uppercase">ID công khai</label>
                        <input id="public_id" bind:value={editFormData.public_id} class="w-full h-12 px-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9]" />
                    </div>
                    <div class="space-y-1.5">
                        <label for="bio" class="text-xs font-black text-[#797593] uppercase">Giới thiệu</label>
                        <textarea id="bio" bind:value={editFormData.bio} rows="3" class="w-full p-4 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-xl outline-none focus:border-[#907aa9] resize-none"></textarea>
                    </div>
                    {#if errorMsg}<p class="text-sm text-[#b4637a] font-bold">{errorMsg}</p>{/if}
                    <button onclick={saveProfile} class="w-full h-14 bg-[#907aa9] text-white font-black rounded-2xl min-h-[52px]">Lưu thông tin</button>
                </div>
            {:else}
                <div class="flex flex-col items-center text-center space-y-4">
                    <div class="relative">
                        <div class="w-28 h-28 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-[2rem] flex items-center justify-center text-6xl text-[#907aa9] overflow-hidden">
                            {#if uploadLoading}
                                <div class="absolute inset-0 bg-[#907aa9]/20 flex items-center justify-center text-2xl text-[#907aa9]"><i class="bx bx-loader-alt animate-spin"></i></div>
                            {/if}
                            {#if $currentUser.avatar_url}
                                <img src={$currentUser.avatar_url.startsWith("http") ? $currentUser.avatar_url : `${STATIC_BASE}${$currentUser.avatar_url}`} alt="Avatar" class="w-full h-full object-cover" />
                            {:else}
                                <i class="bx bx-user-circle"></i>
                            {/if}
                        </div>
                        <input type="file" bind:this={fileInput} onchange={handleAvatarUpload} accept="image/*" capture="user" class="hidden" />
                        <button onclick={() => fileInput.click()} class="absolute bottom-1 right-1 w-9 h-9 bg-[#907aa9] text-white rounded-xl flex items-center justify-center active:scale-95" aria-label="Đổi ảnh đại diện">
                            <i class="bx bx-camera text-lg"></i>
                        </button>
                    </div>
                    <div>
                        <h1 class="text-xl font-black text-[#2c293e]">{$currentUser.username}</h1>
                        <span class="text-xs text-[#797593] font-bold">@{$currentUser.public_id}</span>
                        <p class="text-sm text-[#575279] mt-2 max-w-xs">{$currentUser.bio || "Chưa có thông tin gì về bạn."}</p>
                    </div>
                    <div class="flex gap-3 w-full">
                        <button onclick={startEditing} class="flex-1 py-3 bg-[#fffaf3] border-2 border-[#f2e9e1] text-[#2c293e] font-bold rounded-2xl text-sm min-h-[48px]">
                            <i class="bx bx-edit-alt mr-1"></i> Chỉnh sửa
                        </button>
                        <button onclick={logout} class="flex-1 py-3 bg-[#b4637a]/10 text-[#b4637a] font-bold rounded-2xl border-2 border-[#b4637a]/20 text-sm min-h-[48px]">
                            <i class="bx bx-log-out-circle mr-1"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-2 gap-3">
            <a href="/sign-language/leaderboard" class="glass p-5 rounded-2xl border border-[#f2e9e1] text-center space-y-1">
                <i class="bx bx-trophy text-2xl text-[#ea9d34]"></i>
                <p class="text-xs font-bold text-[#575279]">Bảng xếp hạng</p>
            </a>
            <a href="/settings" class="glass p-5 rounded-2xl border border-[#f2e9e1] text-center space-y-1">
                <i class="bx bx-cog text-2xl text-[#7287fd]"></i>
                <p class="text-xs font-bold text-[#575279]">Cài đặt</p>
            </a>
        </div>
    </div>
{/if}
