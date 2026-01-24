<script>
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";

    let mounted = $state(false);
    onMount(() => (mounted = true));
</script>

<div class="max-w-4xl mx-auto px-6 py-20">
    {#if mounted}
        <div
            in:fly={{ y: 20 }}
            class="glass p-10 md:p-16 rounded-[4rem] border border-white/60 shadow-2xl"
        >
            <h1
                class="text-5xl font-black text-rose-text mb-10 text-center tracking-tight"
            >
                Chính sách bảo mật
            </h1>

            <div class="space-y-8 text-rose-text/80 leading-relaxed text-lg">
                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-lock-alt text-love"></i> 1. Thu thập thông
                        tin
                    </h2>
                    <p>
                        Chúng tôi thu thập thông tin cơ bản như Họ tên, Email để
                        tạo tài khoản. Đối với tính năng máy ảnh (Học ngôn ngữ
                        kí hiệu), hình ảnh chỉ được xử lý tạm thời để nhận diện
                        cử chỉ và không được lưu trữ vĩnh viễn trên máy chủ nếu
                        không có sự đồng ý của bạn.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-data text-love"></i> 2. Sử dụng dữ liệu
                    </h2>
                    <p>
                        Dữ liệu của bạn được sử dụng để cá nhân hóa trải nghiệm
                        học tập, cải thiện độ chính xác của mô hình AI và đảm
                        bảo an toàn cho cộng đồng AMP.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-share-alt text-love"></i> 3. Chia sẻ với
                        bên thứ ba
                    </h2>
                    <p>
                        AMP cam kết **KHÔNG BÁN** dữ liệu cá nhân của bạn cho
                        bất kỳ bên thứ ba nào. Dữ liệu chỉ được chia sẻ khi có
                        yêu cầu pháp lý hoặc để ngăn chặn các hành vi gian lận.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-key text-love"></i> 4. Bảo mật JWT
                    </h2>
                    <p>
                        Chúng tôi sử dụng mã hóa JWT để bảo vệ phiên đăng nhập
                        của bạn. Hãy đảm bảo đăng xuất khi sử dụng máy tính công
                        cộng.
                    </p>
                </section>
            </div>

            <div class="mt-12 pt-8 border-t border-overlay/50 text-center">
                <a
                    href="/register"
                    class="button px-8 py-3 bg-love hover:bg-love/80"
                    >Quay lại Đăng ký</a
                >
            </div>
        </div>
    {/if}
</div>
