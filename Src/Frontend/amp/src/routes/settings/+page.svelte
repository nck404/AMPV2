<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let activeSection = $state("appearance");
    let loading = $state(false);
    let message = $state({ text: "", type: "" });

    // Appearance Settings
    let selectedFont = $state("Inter");
    const fonts = ["Inter", "Roboto", "Outfit", "Playfair Display"];

    // Account Settings
    let email = $state("");
    let oldPassword = $state("");
    let newPassword = $state("");
    let confirmPassword = $state("");

    onMount(async () => {
        mounted = true;
        const storedFont = localStorage.getItem("preferred-font");
        if (storedFont) {
            selectedFont = storedFont;
            applyFont(storedFont);
        }

        const userData = localStorage.getItem("user");
        if (userData) {
            email = JSON.parse(userData).email;
        } else {
            goto("/login");
        }
    });

    function applyFont(font) {
        document.documentElement.style.setProperty(
            "--font-main",
            `'${font}', sans-serif`,
        );
        localStorage.setItem("preferred-font", font);
    }

    async function updateEmail() {
        loading = true;
        message = { text: "", type: "" };
        try {
            const res = await api.put("/me/email", { email });
            if (res.msg) {
                message = {
                    text: "Cập nhật email thành công!",
                    type: "success",
                };
                const user = JSON.parse(localStorage.getItem("user"));
                user.email = email;
                localStorage.setItem("user", JSON.stringify(user));
            }
        } catch (err) {
            message = { text: err.msg || "Lỗi cập nhật email", type: "error" };
        } finally {
            loading = false;
        }
    }

    async function updatePassword() {
        if (newPassword !== confirmPassword) {
            message = { text: "Mật khẩu mới không khớp!", type: "error" };
            return;
        }

        loading = true;
        message = { text: "", type: "" };
        try {
            const res = await api.put("/me/password", {
                old_password: oldPassword,
                new_password: newPassword,
            });
            if (res.msg) {
                message = { text: "Đổi mật khẩu thành công!", type: "success" };
                oldPassword = "";
                newPassword = "";
                confirmPassword = "";
            } else {
                message = {
                    text: res.msg || "Lỗi đổi mật khẩu",
                    type: "error",
                };
            }
        } catch (err) {
            message = {
                text: "Sai mật khẩu hiện tại hoặc lỗi server",
                type: "error",
            };
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    {#if mounted}
        <div in:fly={{ y: 20 }} class="flex flex-col lg:flex-row gap-12">
            <!-- Sidebar -->
            <aside class="w-full lg:w-64 space-y-2">
                <h1 class="text-3xl font-black text-rose-text mb-8 px-4">
                    Cài đặt
                </h1>

                <button
                    onclick={() => (activeSection = "appearance")}
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all {activeSection ===
                    'appearance'
                        ? 'bg-iris text-white shadow-xl shadow-iris/20'
                        : 'text-subtle hover:bg-overlay/50'}"
                >
                    <i class="bx bx-palette text-xl"></i> Giao diện
                </button>

                <button
                    onclick={() => (activeSection = "account")}
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all {activeSection ===
                    'account'
                        ? 'bg-iris text-white shadow-xl shadow-iris/20'
                        : 'text-subtle hover:bg-overlay/50'}"
                >
                    <i class="bx bx-user-circle text-xl"></i> Tài khoản
                </button>

                <button
                    onclick={() => (activeSection = "notifications")}
                    class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all {activeSection ===
                    'notifications'
                        ? 'bg-iris text-white shadow-xl shadow-iris/20'
                        : 'text-subtle hover:bg-overlay/50'}"
                >
                    <i class="bx bx-bell text-xl"></i> Thông báo
                </button>
            </aside>

            <!-- Content Area -->
            <main class="flex-1 space-y-8">
                {#if message.text}
                    <div
                        in:fade
                        class="p-4 rounded-2xl font-bold text-sm text-center {message.type ===
                        'success'
                            ? 'bg-cat-green/10 text-cat-green border border-cat-green/20'
                            : 'bg-love/10 text-love border border-love/20'}"
                    >
                        {message.text}
                    </div>
                {/if}

                {#if activeSection === "appearance"}
                    <div
                        in:fade
                        class="glass p-10 rounded-[3rem] border border-white/60 space-y-8"
                    >
                        <div>
                            <h2 class="text-2xl font-black text-rose-text mb-2">
                                Kiểu chữ (Typography)
                            </h2>
                            <p class="text-subtle text-sm">
                                Chọn font chữ phù hợp với sở thích của bạn trên
                                toàn hệ thống.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {#each fonts as font}
                                <button
                                    onclick={() => {
                                        selectedFont = font;
                                        applyFont(font);
                                    }}
                                    class="p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group {selectedFont ===
                                    font
                                        ? 'border-iris bg-iris/5'
                                        : 'border-overlay hover:border-iris/30 bg-white/50'}"
                                >
                                    <div>
                                        <div
                                            class="text-lg font-bold text-rose-text"
                                            style="font-family: '{font}'"
                                        >
                                            {font}
                                        </div>
                                        <div
                                            class="text-[10px] text-muted uppercase tracking-widest mt-1"
                                        >
                                            Font hệ thống
                                        </div>
                                    </div>
                                    {#if selectedFont === font}
                                        <div
                                            class="w-6 h-6 bg-iris text-white rounded-full flex items-center justify-center"
                                        >
                                            <i class="bx bx-check"></i>
                                        </div>
                                    {/if}
                                </button>
                            {/each}
                        </div>

                        <div
                            class="p-6 bg-overlay/20 rounded-2xl border border-dashed border-muted/30"
                        >
                            <p
                                class="text-sm italic text-muted"
                                style="font-family: '{selectedFont}'"
                            >
                                "The quick brown fox jumps over the lazy dog.
                                Đây là văn bản mẫu để bạn kiểm tra độ hiển thị
                                của font chữ {selectedFont}."
                            </p>
                        </div>
                    </div>
                {/if}

                {#if activeSection === "account"}
                    <div in:fade class="space-y-8">
                        <!-- Email Section -->
                        <div
                            class="glass p-10 rounded-[3rem] border border-white/60 space-y-6"
                        >
                            <h2 class="text-2xl font-black text-rose-text">
                                Địa chỉ Email
                            </h2>
                            <div class="flex flex-col md:flex-row gap-4">
                                <input
                                    type="email"
                                    bind:value={email}
                                    placeholder="your-email@example.com"
                                    class="flex-1 h-14 bg-white border border-overlay rounded-2xl px-6 outline-none focus:border-iris transition-all font-bold"
                                />
                                <button
                                    onclick={updateEmail}
                                    disabled={loading}
                                    class="button px-10 h-14"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>

                        <!-- Password Section -->
                        <div
                            class="glass p-10 rounded-[3rem] border border-white/60 space-y-6"
                        >
                            <h2 class="text-2xl font-black text-rose-text">
                                Đổi mật khẩu
                            </h2>
                            <div class="space-y-4">
                                <div class="space-y-1">
                                    <label
                                        for="oldPassword"
                                        class="text-[10px] font-black text-muted uppercase tracking-widest px-1"
                                        >Mật khẩu hiện tại</label
                                    >
                                    <input
                                        id="oldPassword"
                                        type="password"
                                        bind:value={oldPassword}
                                        class="w-full h-14 bg-white border border-overlay rounded-2xl px-6 outline-none focus:border-iris transition-all font-bold"
                                    />
                                </div>
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div class="space-y-1">
                                        <label
                                            for="newPassword"
                                            class="text-[10px] font-black text-muted uppercase tracking-widest px-1"
                                            >Mật khẩu mới</label
                                        >
                                        <input
                                            id="newPassword"
                                            type="password"
                                            bind:value={newPassword}
                                            class="w-full h-14 bg-white border border-overlay rounded-2xl px-6 outline-none focus:border-iris transition-all font-bold"
                                        />
                                    </div>
                                    <div class="space-y-1">
                                        <label
                                            for="confirmPassword"
                                            class="text-[10px] font-black text-muted uppercase tracking-widest px-1"
                                            >Xác nhận mật khẩu</label
                                        >
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            bind:value={confirmPassword}
                                            class="w-full h-14 bg-white border border-overlay rounded-2xl px-6 outline-none focus:border-iris transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div class="flex justify-end pt-4">
                                    <button
                                        onclick={updatePassword}
                                        disabled={loading}
                                        class="button px-10 h-14"
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}

                {#if activeSection === "notifications"}
                    <div
                        in:fade
                        class="glass p-10 rounded-[3rem] border border-white/60 text-center space-y-4 py-20"
                    >
                        <div class="text-6xl opacity-20">
                            <i class="bx bx-bell-off"></i>
                        </div>
                        <h2 class="text-2xl font-black text-rose-text">
                            Tính năng đang phát triển
                        </h2>
                        <p class="text-muted max-w-xs mx-auto text-sm">
                            Hệ thống thông báo đẩy (Push Notifications) sẽ sớm
                            ra mắt trong các bản cập nhật tiếp theo.
                        </p>
                    </div>
                {/if}
            </main>
        </div>
    {/if}
</div>

<style>
    input {
        background: rgba(255, 255, 255, 0.5) !important;
        padding-left: 1.5rem !important;
    }
</style>
