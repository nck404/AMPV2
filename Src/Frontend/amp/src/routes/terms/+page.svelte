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
                Điều khoản dịch vụ
            </h1>

            <div class="space-y-8 text-rose-text/80 leading-relaxed text-lg">
                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-check-circle text-iris"></i> 1. Chấp nhận
                        điều khoản
                    </h2>
                    <p>
                        Bằng cách truy cập và sử dụng nền tảng AMP, bạn đồng ý
                        tuân thủ các điều khoản và điều kiện được nêu tại đây.
                        Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ của
                        chúng tôi.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-user-voice text-iris"></i> 2. Quyền và trách
                        nhiệm người dùng
                    </h2>
                    <p>
                        Bạn chịu trách nhiệm về tính bảo mật của tài khoản và
                        tất cả các hoạt động xảy ra dưới tên người dùng của
                        mình. AMP cam kết hỗ trợ toàn diện cho người khiếm thị
                        và khiếm thính, tuy nhiên người dùng cần cung cấp thông
                        tin chính xác để hệ thống AI hoạt động tốt nhất.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-shield-x text-iris"></i> 3. Hành vi bị cấm
                    </h2>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>
                            Đưa ra các thông tin sai lệch, gây hận thù hoặc xúc
                            phạm người khác.
                        </li>
                        <li>
                            Cố gắng can thiệp vào hệ thống AI và mã nguồn của
                            nền tảng.
                        </li>
                        <li>
                            Sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp
                            nào.
                        </li>
                    </ul>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-2xl font-bold text-rose-text flex items-center gap-3"
                    >
                        <i class="bx bx-revision text-iris"></i> 4. Thay đổi điều
                        khoản
                    </h2>
                    <p>
                        AMP có quyền cập nhật các điều khoản này bất kỳ lúc nào.
                        Chúng tôi sẽ thông báo cho bạn thông qua email hoặc
                        thông báo trực tiếp trên nền tảng.
                    </p>
                </section>
            </div>

            <div class="mt-12 pt-8 border-t border-overlay/50 text-center">
                <a href="/register" class="button px-8 py-3">Quay lại Đăng ký</a
                >
            </div>
        </div>
    {/if}
</div>
