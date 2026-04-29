<script>
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";

    let showPassword = $state(false);
    let name = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let loading = $state(false);
    let mounted = $state(false);
    let errorMsg = $state("");
    let agree = $state(false);
    let recaptchaChecked = $state(false);

    onMount(() => {
        mounted = true;
    });

    async function handleRegister(e) {
        e.preventDefault();
        errorMsg = "";

        if (!agree) {
            errorMsg = "Bạn cần đồng ý với các điều khoản dịch vụ!";
            return;
        }

        if (!recaptchaChecked) {
            errorMsg = "Vui lòng xác nhận bạn không phải là người máy!";
            return;
        }

        if (password !== confirmPassword) {
            errorMsg = "Mật khẩu xác nhận không khớp!";
            return;
        }

        loading = true;
        try {
            const res = await api.post("/register", {
                username: name,
                email,
                password,
                recaptcha_token: "test-token",
            });

            if (res.msg === "User created successfully") {
                goto("/login?registered=true");
            } else {
                errorMsg = res.msg || "Có lỗi xảy ra, vui lòng thử lại.";
            }
        } catch (err) {
            errorMsg = "Không thể kết nối với máy chủ.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[85vh] flex items-center justify-center px-4 py-20">
    {#if mounted}
        <div in:fly={{ y: 20, duration: 800 }} class="w-full max-w-md">
            <div
                class="glass p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-rose-text/5 border border-white/60"
            >
                <div class="text-center mb-10">
                    <div
                        class="w-20 h-20 bg-love/10 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 text-love shadow-inner"
                    >
                        <i class="bx bx-user-plus"></i>
                    </div>
                    <h2
                        class="text-4xl font-black text-rose-text mb-2 tracking-tight"
                    >
                        Đăng ký
                    </h2>
                    <p class="text-muted text-lg">Khám phá AMP ngay hôm nay</p>
                </div>

                {#if errorMsg}
                    <div
                        in:fade
                        class="mb-8 p-4 bg-love/10 border border-love/20 rounded-2xl text-love text-sm font-bold flex items-center gap-3"
                    >
                        <i class="bx bx-error-circle text-2xl"></i>
                        {errorMsg}
                    </div>
                {/if}

                <form onsubmit={handleRegister} class="space-y-6">
                    <div class="space-y-2">
                        <label
                            for="name"
                            class="text-sm font-black text-rose-text/70 ml-1 uppercase tracking-wider"
                            >Username</label
                        >
                        <div class="relative group">
                            <span
                                class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-iris transition-all z-10"
                            >
                                <i class="bx bx-user"></i>
                            </span>
                            <input
                                type="text"
                                id="name"
                                bind:value={name}
                                placeholder="Nguyễn Văn A"
                                required
                                class="w-full h-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base input-icon"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label
                            for="email"
                            class="text-sm font-black text-rose-text/70 ml-1 uppercase tracking-wider"
                            >Email</label
                        >
                        <div class="relative group">
                            <span
                                class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-iris transition-all z-10"
                            >
                                <i class="bx bx-envelope"></i>
                            </span>
                            <input
                                type="email"
                                id="email"
                                bind:value={email}
                                placeholder="your@email.com"
                                required
                                class="w-full h-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base input-icon"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label
                            for="password"
                            class="text-sm font-black text-rose-text/70 ml-1 uppercase tracking-wider"
                            >Mật khẩu</label
                        >
                        <div class="relative group">
                            <span
                                class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-iris transition-all z-10"
                            >
                                <i class="bx bx-lock-alt"></i>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                bind:value={password}
                                placeholder="••••••••"
                                required
                                class="w-full pr-14 h-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base input-icon"
                            />
                            <button
                                type="button"
                                onclick={() => (showPassword = !showPassword)}
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-rose-text transition-colors z-10"
                                aria-label="Hiện mật khẩu"
                            >
                                <i
                                    class="bx {showPassword
                                        ? 'bx-hide'
                                        : 'bx-show'} text-2xl"
                                ></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label
                            for="confirm"
                            class="text-sm font-black text-rose-text/70 ml-1 uppercase tracking-wider"
                            >Xác nhận mật khẩu</label
                        >
                        <div class="relative group">
                            <span
                                class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-iris transition-all z-10"
                            >
                                <i class="bx bx-lock-alt"></i>
                            </span>
                            <input
                                type="password"
                                id="confirm"
                                bind:value={confirmPassword}
                                placeholder="••••••••"
                                required
                                class="w-full h-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base input-icon"
                            />
                        </div>
                    </div>

                    <div class="py-2">
                        <button
                            type="button"
                            onclick={() => (recaptchaChecked = true)}
                            class="w-full bg-surface/50 border border-overlay/50 rounded-2xl p-4 flex items-center justify-between group hover:border-iris/30 transition-all cursor-pointer"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-6 h-6 border-2 {recaptchaChecked
                                        ? 'border-cat-green bg-cat-green text-white'
                                        : 'border-overlay/50 bg-white text-iris'} rounded flex items-center justify-center transition-all"
                                >
                                    <i
                                        class="bx bx-check text-xl {recaptchaChecked
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-50'} transition-opacity"
                                    ></i>
                                </div>
                                <span
                                    class="text-sm font-bold text-rose-text/70"
                                    >Tôi không phải là người máy</span
                                >
                            </div>
                            <div class="flex flex-col items-center">
                                <i class="bx bxl-google text-2xl text-blue-500"
                                ></i>
                                <span
                                    class="text-[8px] font-bold opacity-40 uppercase"
                                    >reCAPTCHA</span
                                >
                            </div>
                        </button>
                    </div>

                    <div class="flex items-center gap-3 py-2 px-1">
                        <label
                            class="relative flex items-center cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                bind:checked={agree}
                                required
                                class="peer sr-only"
                            />
                            <div
                                class="w-7 h-7 flex-shrink-0 bg-surface border-2 border-overlay rounded-lg peer-checked:bg-iris peer-checked:border-iris transition-all group-hover:border-iris flex items-center justify-center text-white shadow-sm"
                            >
                                <i
                                    class="bx bx-check text-2xl scale-0 peer-checked:scale-100 transition-transform"
                                ></i>
                            </div>
                            <span
                                class="ml-3 text-muted leading-tight font-medium group-hover:text-rose-text transition-colors text-sm"
                            >
                                Tôi đồng ý với <a
                                    href="/terms"
                                    class="text-iris font-black hover:underline"
                                    >Điều khoản</a
                                >
                                và
                                <a
                                    href="/privacy"
                                    class="text-iris font-black hover:underline"
                                    >Chính sách</a
                                >.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        class="button w-full py-5 text-xl mt-4 group relative overflow-hidden active:scale-[0.98]"
                        disabled={loading}
                    >
                        {#if loading}
                            <span class="flex items-center gap-2">
                                <i class="bx bx-loader-alt animate-spin"></i>
                                Đang xử lý...
                            </span>
                        {:else}
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <i
                                    class="bx bx-rocket mr-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                ></i>
                                Đăng ký ngay
                            </span>
                        {/if}
                    </button>
                </form>

                <div class="mt-8 text-center text-muted font-bold">
                    Đã có tài khoản?
                    <a
                        href="/login"
                        class="text-iris font-black hover:underline ml-1"
                        >Đăng nhập ngay</a
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(input[type="checkbox"]) {
        appearance: none;
        -webkit-appearance: none;
    }
</style>
