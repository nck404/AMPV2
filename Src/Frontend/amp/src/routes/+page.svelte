<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });

    const features = [
        {
            title: "Ngôn ngữ kí hiệu",
            desc: "Học và chuyển đổi ngôn ngữ kí hiệu sang văn bản với công nghệ AI tiên tiến.",
            icon: "bx-hand",
            color: "bg-iris/10",
            textColor: "text-iris",
        },
        {
            title: "Hỗ trợ khiếm thị (BAS)",
            desc: "Đọc và tóm tắt nội dung trang web, hỗ trợ tối đa cho người khiếm thị.",
            icon: "bx-low-vision",
            color: "bg-love/10",
            textColor: "text-love",
        },
        {
            title: "Cộng đồng Forum",
            desc: "Kết nối, chia sẻ và thảo luận với hệ thống upvote và tương tác real-time.",
            icon: "bx-message-square-dots",
            color: "bg-foam/10",
            textColor: "text-foam",
        },
        {
            title: "Cơ hội việc làm",
            desc: "Nền tảng tuyển dụng dành riêng cho cộng đồng, kết nối doanh nghiệp.",
            icon: "bx-briefcase-alt-2",
            color: "bg-gold/10",
            textColor: "text-gold",
        },
    ];
</script>

<div class="px-6 max-w-7xl mx-auto">
    <!-- Hero Section -->
    <section
        class="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 lg:py-24"
    >
        {#if mounted}
            <div
                in:fly={{ x: -30, duration: 1000 }}
                class="flex-1 space-y-8 text-center lg:text-left"
            >
                <div
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-iris/5 border border-iris/10 text-iris font-medium text-sm"
                >
                    <span class="relative flex h-2 w-2">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-iris opacity-75"
                        ></span>
                        <span
                            class="relative inline-flex rounded-full h-2 w-2 bg-iris"
                        ></span>
                    </span>
                    Nền tảng hòa nhập toàn diện
                </div>

                <h1 class="text-5xl md:text-7xl">
                    Kết nối <br />
                    <span class="text-rose">Không giới hạn</span>
                </h1>

                <p
                    class="text-xl text-subtle leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                    AMP là nền tảng đột phá kết nối cộng đồng thông qua ngôn ngữ
                    kí hiệu, hỗ trợ khiếm thị và xây dựng mạng xã hội văn minh.
                </p>

                <div
                    class="flex flex-wrap items-center justify-center lg:justify-start gap-4"
                >
                    <button class="button px-10 py-4 text-lg">
                        <i class="bx bx-rocket mr-2"></i> Bắt đầu ngay
                    </button>
                    <button
                        class="px-8 py-3 rounded-xl border-2 border-overlay text-rose-text font-medium hover:bg-overlay/50 transition-all flex items-center gap-2"
                    >
                        <i class="bx bx-info-circle"></i> Tìm hiểu thêm
                    </button>
                </div>

                <div
                    class="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-overlay/50"
                >
                    <div>
                        <div class="text-2xl font-bold text-rose-text">
                            10k+
                        </div>
                        <div class="text-sm text-muted">Thành viên</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-rose-text">95%</div>
                        <div class="text-sm text-muted">Hỗ trợ chính xác</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-rose-text">
                            24/7
                        </div>
                        <div class="text-sm text-muted">Phản hồi</div>
                    </div>
                </div>
            </div>

            <div
                in:fly={{ x: 30, duration: 1000, delay: 200 }}
                class="flex-1 relative"
            >
                <div
                    class="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-text/10 border border-white/20"
                >
                    <img
                        src="/hero.png"
                        alt="AMP Hero Illustration"
                        class="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                    />
                </div>
                <!-- Decorative elements -->
                <div
                    class="absolute -top-10 -right-10 w-40 h-40 bg-iris/10 blur-3xl rounded-full"
                ></div>
                <div
                    class="absolute -bottom-10 -left-10 w-40 h-40 bg-love/10 blur-3xl rounded-full"
                ></div>
            </div>
        {/if}
    </section>

    <!-- Features Grid -->
    <section class="py-24">
        <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-rose-text">
                Tính năng nổi bật
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                Chúng tôi cung cấp bộ công cụ toàn diện để xóa bỏ rào cản giao
                tiếp và tạo cơ hội bình đẳng cho tất cả mọi người.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each features as feature, i}
                <div
                    class="group p-8 rounded-[2rem] bg-surface border border-overlay hover:border-iris/20 hover:shadow-xl hover:shadow-iris/5 transition-all duration-300"
                >
                    <div
                        class="w-14 h-14 {feature.color} {feature.textColor} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform"
                    >
                        <i class="bx {feature.icon}"></i>
                    </div>
                    <h3 class="text-xl font-bold text-rose-text mb-3">
                        {feature.title}
                    </h3>
                    <p class="text-subtle text-sm leading-relaxed">
                        {feature.desc}
                    </p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Sign Language Teaser -->
    <section
        class="py-24 bg-overlay/30 rounded-[3rem] px-8 lg:px-16 overflow-hidden relative"
    >
        <div
            class="flex flex-col lg:flex-row items-center gap-16 relative z-10"
        >
            <div class="flex-1 space-y-6">
                <h2 class="text-4xl font-bold text-rose-text leading-tight">
                    Minh họa <span class="text-iris">3D Trực quan</span> <br /> Ngôn
                    ngữ kí hiệu
                </h2>
                <p class="text-subtle text-lg">
                    Hệ thống học tập kết hợp mô hình 3D giúp bạn nắm bắt các cử
                    chỉ một cách chính xác nhất. Từ các thao tác cơ bản đến giao
                    tiếp nâng cao.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-rose-text">
                        <i class="bx bx-check-circle text-iris text-xl"></i>
                        Xoay mô hình 360 độ
                    </li>
                    <li class="flex items-center gap-3 text-rose-text">
                        <i class="bx bx-check-circle text-iris text-xl"></i>
                        Tốc độ chuyển động tùy chỉnh
                    </li>
                    <li class="flex items-center gap-3 text-rose-text">
                        <i class="bx bx-check-circle text-iris text-xl"></i>
                        Phản hồi AI thời gian thực
                    </li>
                </ul>
                <button class="button mt-4">Trải nghiệm ngay</button>
            </div>
            <div class="flex-1 relative">
                <div
                    class="w-full aspect-square bg-white/50 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                ></div>
                <!-- Placeholder for 3D/Illustration -->
                <div
                    class="bg-white rounded-3xl p-8 shadow-2xl relative z-10 border border-white"
                >
                    <div
                        class="aspect-video bg-overlay rounded-2xl flex items-center justify-center text-muted italic"
                    >
                        [ 3D Model Preview ]
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Space -->
    <footer class="py-24 border-t border-overlay mt-24 text-center">
        <div class="flex items-center justify-center gap-2 mb-6">
            <div
                class="w-8 h-8 bg-iris rounded-lg flex items-center justify-center text-white font-bold"
            >
                A
            </div>
            <span class="text-xl font-bold text-rose-text tracking-tight"
                >AMP Platform</span
            >
        </div>
        <p class="text-muted text-sm">
            &copy; 2026 AMP. Nền tảng vì cộng đồng. Modern design by
            Antigravity.
        </p>
    </footer>
</div>

<style>
    :global(body) {
        background-image: radial-gradient(
                circle at 10% 20%,
                rgba(144, 122, 169, 0.03) 0%,
                transparent 20%
            ),
            radial-gradient(
                circle at 90% 80%,
                rgba(215, 130, 126, 0.03) 0%,
                transparent 20%
            );
    }

    h1 {
        line-height: 1.1;
    }
</style>
