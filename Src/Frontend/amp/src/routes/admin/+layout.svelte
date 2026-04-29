<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let { children } = $props();

    let isAuthorized = $state(false);
    let accessDenied = $state(false);
    let isLoading = $state(true);

    onMount(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            goto("/login?error=unauthorized");
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.is_admin === true || user.role === "admin") {
                isAuthorized = true;
                isLoading = false;
            } else {
                accessDenied = true;
                isLoading = false;
            }
        } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            goto("/login?error=unauthorized");
        }
    });
</script>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center">
        <div class="flex flex-col items-center gap-4 opacity-50">
            <i class="bx bx-loader-alt animate-spin text-5xl text-iris"></i>
            <p class="text-rose-text font-bold">
                Đang xác thực quyền truy cập...
            </p>
        </div>
    </div>
{:else if accessDenied}
    <div class="min-h-[85vh] flex items-center justify-center p-4">
        <div
            class="max-w-md w-full glass rounded-[3rem] shadow-2xl shadow-rose-text/5 p-10 flex flex-col items-center text-center gap-4 border border-white/60"
        >
            <div
                class="w-24 h-24 rounded-full bg-love/10 flex items-center justify-center mb-2 shadow-inner"
            >
                <i class="bx bxs-lock-alt text-6xl text-love"></i>
            </div>

            <h1 class="text-3xl font-black text-rose-text tracking-tight">
                Không thể truy cập
            </h1>

            <p class="text-subtle text-lg leading-relaxed mb-4">
                Tính năng đang cập nhật hoặc bạn không có quyền truy cập vào khu
                vực này.
            </p>

            <a
                href="/"
                class="button w-full py-4 text-lg font-bold group relative overflow-hidden active:scale-[0.98]"
            >
                <span class="flex items-center justify-center gap-2">
                    <i
                        class="bx bx-home-alt text-xl group-hover:-translate-y-1 transition-transform"
                    ></i>
                    Quay lại trang chủ
                </span>
            </a>
        </div>
    </div>
{:else if isAuthorized}
    {@render children()}
{/if}
