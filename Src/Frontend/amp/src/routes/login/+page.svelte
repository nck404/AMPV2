<script>
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    let showPassword = $state(false);
    let email = $state("");
    let password = $state("");
    let loading = $state(false);
    let mounted = $state(false);
    let errorMsg = $state("");
    let successMsg = $state("");

    onMount(() => {
        mounted = true;
        if (page.url.searchParams.get("registered") === "true") {
            successMsg = "Đăng ký thành công! Hãy đăng nhập ngay.";
        }
    });

    async function handleLogin(e) {
        e.preventDefault();
        errorMsg = "";
        successMsg = "";
        loading = true;

        try {
            const res = await api.post("/login", { email, password });

            if (res.access_token) {
                localStorage.setItem("token", res.access_token);
                localStorage.setItem("user", JSON.stringify(res.user));
                goto("/profile");
            } else {
                errorMsg = res.msg || "Email hoặc mật khẩu không chính xác.";
            }
        } catch (err) {
            errorMsg = "Không thể kết nối với máy chủ.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-20">
    {#if mounted}
        <div in:fly={{ y: 20, duration: 800 }} class="w-full max-w-md">
            <div
                class="glass p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-rose-text/5 border border-white/40"
            >
                <div class="text-center mb-6">
                    <div
                        class="w-20 h-20 bg-iris/10 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 text-iris shadow-inner"
                    >
                        <i class="bx bx-lock-open-alt"></i>
                    </div>
                    <h2
                        class="text-4xl font-black text-rose-text mb-2 tracking-tight"
                    >
                        Đăng nhập
                    </h2>
                    <p class="text-muted text-lg">Chào mừng bạn trở lại</p>
                </div>

                <div class="min-h-[64px] mb-4 flex flex-col justify-end">
                    {#if errorMsg}
                        <div
                            in:fade
                            class="p-4 bg-love/10 border border-love/20 rounded-2xl text-love text-sm font-bold flex items-center gap-3 w-full"
                        >
                            <i class="bx bx-error-circle text-2xl"></i>
                            {errorMsg}
                        </div>
                    {/if}

                    {#if successMsg}
                        <div
                            in:fade
                            class="p-4 bg-cat-green/10 border border-cat-green/20 rounded-2xl text-cat-green text-sm font-bold flex items-center gap-3 w-full"
                        >
                            <i class="bx bx-check-circle text-2xl"></i>
                            {successMsg}
                        </div>
                    {/if}
                </div>

                <form onsubmit={handleLogin} class="space-y-6">
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
                                class="w-full h-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base"
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
                                <i class="bx bx-key"></i>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                bind:value={password}
                                placeholder="••••••••"
                                required
                                class="w-full h-14 pr-14 bg-surface/50 border-overlay focus:bg-white focus:border-iris focus:ring-4 focus:ring-iris/5 transition-all text-base"
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

                    <div class="flex items-center justify-between text-sm px-1">
                        <label
                            class="relative flex items-center cursor-pointer group"
                        >
                            <input type="checkbox" class="peer sr-only" />
                            <div
                                class="w-7 h-7 flex-shrink-0 bg-surface border-2 border-overlay rounded-lg peer-checked:bg-iris peer-checked:border-iris transition-all group-hover:border-iris flex items-center justify-center text-white shadow-sm"
                            >
                                <i
                                    class="bx bx-check text-2xl scale-0 peer-checked:scale-100 transition-transform"
                                ></i>
                            </div>
                            <span
                                class="ml-3 text-muted leading-tight font-medium group-hover:text-rose-text transition-colors"
                            >
                                Ghi nhớ tôi
                            </span>
                        </label>
                        <a
                            href="/forgot-password"
                            class="text-iris font-black hover:underline"
                            >Quên mật khẩu?</a
                        >
                    </div>

                    <div
                        class="text-center text-xs text-muted font-medium pb-2"
                    >
                        Bằng cách đăng nhập, bạn đồng ý với
                        <a
                            href="/terms"
                            class="text-iris font-bold hover:underline whitespace-nowrap"
                            >Điều khoản</a
                        >
                        và
                        <a
                            href="/privacy"
                            class="text-iris font-bold hover:underline whitespace-nowrap"
                            >Chính sách</a
                        >.
                    </div>

                    <button
                        type="submit"
                        class="button w-full py-5 text-xl mt-4 group relative overflow-hidden active:scale-[0.98]"
                        disabled={loading}
                    >
                        {#if loading}
                            <span class="flex items-center gap-2">
                                <i class="bx bx-loader-alt animate-spin"></i>
                                Đang kết nối...
                            </span>
                        {:else}
                            <span
                                class="flex items-center justify-center gap-2"
                            >
                                <i
                                    class="bx bx-log-in-circle mr-1 group-hover:translate-x-1 transition-transform"
                                ></i>
                                Đăng nhập ngay
                            </span>
                        {/if}
                    </button>
                </form>

                <div class="mt-8 text-center text-muted font-bold">
                    Chưa có tài khoản?
                    <a
                        href="/register"
                        class="text-iris font-black hover:underline ml-1"
                        >Tham gia ngay</a
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
