<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let activeSection = $state("appearance");
    let loading = $state(false);
    let message = $state({ text: "", type: "" });

    let selectedFont = $state("Inter");
    let selectedFontSize = $state("16px");
    const fonts = [
        "Inter",
        "Roboto",
        "Outfit",
        "Poppins",
        "Quicksand",
        "Playfair Display",
    ];
    const fontSizes = [
        { label: "Nhỏ", value: "14px" },
        { label: "Mặc định", value: "16px" },
        { label: "Lớn", value: "18px" },
        { label: "Rất lớn", value: "20px" },
    ];

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

        const storedFontSize = localStorage.getItem("preferred-font-size");
        if (storedFontSize) {
            selectedFontSize = storedFontSize;
            applyFontSize(storedFontSize);
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

    function applyFontSize(size) {
        document.documentElement.style.fontSize = size;
        localStorage.setItem("preferred-font-size", size);
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

<div class="max-w-5xl mx-auto p-4 md:p-8 py-12">
    {#if mounted}
        <div
            in:fly={{ y: 10, duration: 200 }}
            class="flex flex-col md:flex-row bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-2xl shadow-rose-text/5 overflow-hidden min-h-[600px]"
        >
            <aside
                class="w-full md:w-64 bg-white/30 border-r border-white/50 p-6 space-y-2"
            >
                <div class="mb-4 px-4">
                    <span
                        class="text-[10px] font-black text-muted uppercase tracking-widest"
                    >
                        Cài đặt hệ thống
                    </span>
                </div>

                <button
                    onclick={() => (activeSection = "appearance")}
                    class={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "appearance" ? "bg-iris text-white shadow-md shadow-iris/20 scale-[1.02]" : "text-subtle hover:text-rose-text hover:bg-white/50"}`}
                >
                    <i class="bx bx-palette text-xl"></i> Giao diện
                </button>

                <button
                    onclick={() => (activeSection = "account")}
                    class={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "account" ? "bg-iris text-white shadow-md shadow-iris/20 scale-[1.02]" : "text-subtle hover:text-rose-text hover:bg-white/50"}`}
                >
                    <i class="bx bx-user-circle text-xl"></i> Tài khoản
                </button>

                <button
                    onclick={() => (activeSection = "notifications")}
                    class={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "notifications" ? "bg-iris text-white shadow-md shadow-iris/20 scale-[1.02]" : "text-subtle hover:text-rose-text hover:bg-white/50"}`}
                >
                    <i class="bx bx-bell text-xl"></i> Thông báo
                </button>
            </aside>

            <main class="flex-1 p-8 md:p-10 overflow-y-auto bg-white/20">
                {#if message.text}
                    <div
                        in:fade={{ duration: 150 }}
                        class={`px-4 py-2 mb-6 rounded-lg font-medium text-sm ${message.type === "success" ? "bg-cat-green/10 text-cat-green border border-cat-green/20" : "bg-love/10 text-love border border-love/20"}`}
                    >
                        {message.text}
                    </div>
                {/if}

                {#if activeSection === "appearance"}
                    <div in:fade={{ duration: 150 }} class="space-y-8">
                        <div class="space-y-4">
                            <div>
                                <h2
                                    class="text-lg font-bold text-rose-text mb-1"
                                >
                                    Kiểu chữ
                                </h2>
                                <p class="text-subtle text-xs">
                                    Chọn font chữ hiển thị trên toàn hệ thống.
                                </p>
                            </div>

                            <div class="grid grid-cols-2 gap-3 max-w-lg">
                                {#each fonts as font}
                                    <button
                                        onclick={() => {
                                            selectedFont = font;
                                            applyFont(font);
                                        }}
                                        class={`p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${selectedFont === font ? "border-iris bg-iris/5 shadow-md shadow-iris/10 scale-[1.02]" : "border-transparent hover:border-iris/30 bg-white/50"}`}
                                    >
                                        <div>
                                            <div
                                                class="text-sm font-semibold text-rose-text"
                                                style="font-family: '{font}'"
                                            >
                                                {font}
                                            </div>
                                        </div>
                                        {#if selectedFont === font}
                                            <div
                                                class="text-iris flex items-center justify-center"
                                            >
                                                <i class="bx bx-check text-xl"
                                                ></i>
                                            </div>
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <h2
                                    class="text-lg font-bold text-rose-text mb-1"
                                >
                                    Cỡ chữ
                                </h2>
                                <p class="text-subtle text-xs">
                                    Điều chỉnh kích thước chữ trên toàn hệ
                                    thống.
                                </p>
                            </div>

                            <div class="flex flex-wrap gap-3 max-w-lg">
                                {#each fontSizes as size}
                                    <button
                                        onclick={() => {
                                            selectedFontSize = size.value;
                                            applyFontSize(size.value);
                                        }}
                                        class={`px-4 py-2 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-sm ${selectedFontSize === size.value ? "border-iris bg-iris text-white shadow-md shadow-iris/20 scale-[1.02]" : "border-transparent bg-white/50 text-subtle hover:text-rose-text hover:border-iris/30 hover:bg-white"}`}
                                    >
                                        {size.label}
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <div
                            class="p-4 bg-black/5 rounded-lg border border-dashed border-black/10 max-w-lg"
                        >
                            <p
                                class="text-muted leading-relaxed transition-all"
                                style="font-family: '{selectedFont}'; font-size: {selectedFontSize ===
                                '14px'
                                    ? '0.875rem'
                                    : selectedFontSize === '16px'
                                      ? '1rem'
                                      : selectedFontSize === '18px'
                                        ? '1.125rem'
                                        : '1.25rem'};"
                            >
                                Văn bản mẫu để kiểm tra hiển thị font {selectedFont}.
                                The quick brown fox jumps over the lazy dog.
                            </p>
                        </div>
                    </div>
                {/if}

                {#if activeSection === "account"}
                    <div in:fade={{ duration: 150 }} class="space-y-8 max-w-md">
                        <div class="space-y-4">
                            <h2
                                class="text-lg font-bold text-rose-text border-b border-black/5 pb-2"
                            >
                                Địa chỉ Email
                            </h2>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    bind:value={email}
                                    placeholder="your-email@example.com"
                                    class="flex-1 h-12 bg-white/50 border-2 border-transparent rounded-2xl px-4 text-sm outline-none focus:border-iris focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    onclick={updateEmail}
                                    disabled={loading}
                                    class="h-12 px-6 bg-iris text-white text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-iris/20 disabled:opacity-50"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h2
                                class="text-lg font-bold text-rose-text border-b border-black/5 pb-2"
                            >
                                Đổi mật khẩu
                            </h2>
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <label
                                        for="oldPassword"
                                        class="text-xs font-medium text-muted"
                                        >Mật khẩu hiện tại</label
                                    >
                                    <input
                                        id="oldPassword"
                                        type="password"
                                        bind:value={oldPassword}
                                        class="w-full h-12 bg-white/50 border-2 border-transparent rounded-2xl px-4 text-sm outline-none focus:border-iris focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="newPassword"
                                        class="text-xs font-medium text-muted"
                                        >Mật khẩu mới</label
                                    >
                                    <input
                                        id="newPassword"
                                        type="password"
                                        bind:value={newPassword}
                                        class="w-full h-12 bg-white/50 border-2 border-transparent rounded-2xl px-4 text-sm outline-none focus:border-iris focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="confirmPassword"
                                        class="text-xs font-medium text-muted"
                                        >Xác nhận mật khẩu</label
                                    >
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        bind:value={confirmPassword}
                                        class="w-full h-12 bg-white/50 border-2 border-transparent rounded-2xl px-4 text-sm outline-none focus:border-iris focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div class="pt-4">
                                    <button
                                        onclick={updatePassword}
                                        disabled={loading}
                                        class="h-12 px-6 bg-iris text-white text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-iris/20 disabled:opacity-50"
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
                        in:fade={{ duration: 150 }}
                        class="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 mt-10"
                    >
                        <i class="bx bx-bell-off text-4xl"></i>
                        <h2 class="text-base font-bold text-rose-text">
                            Tính năng đang phát triển
                        </h2>
                        <p class="text-xs text-muted max-w-xs">
                            Hệ thống thông báo đẩy sẽ sớm ra mắt.
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
