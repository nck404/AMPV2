<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
    });

    const supportGroups = [
        { icon: "bx-user-check", label: "Người tìm việc", desc: "Lao động phổ thông, sinh viên mới ra trường" },
        { icon: "bx-building-house", label: "Nhà tuyển dụng", desc: "Doanh nghiệp vừa và nhỏ, cần kênh tuyển dụng hiệu quả" },
        { icon: "bx-accessibility", label: "Người khuyết tật", desc: "Khiếm thính, khiếm thị, hạn chế vận động" },
        { icon: "bx-group", label: "Cộng đồng", desc: "Chuyên gia muốn chia sẻ kiến thức và kinh nghiệm" },
    ];

    const tools = [
        {
            title: "Tìm kiếm việc làm",
            desc: "Hàng trăm tin tuyển dụng được cập nhật liên tục, lọc theo ngành nghề, địa điểm và hình thức làm việc.",
            icon: "bx-briefcase-alt-2",
            color: "bg-gold/10",
            textColor: "text-gold",
            path: "/recruitment",
            tag: "Tuyển dụng"
        },
        {
            title: "Tạo CV chuyên nghiệp",
            desc: "Không cần kỹ năng thiết kế — chỉ điền thông tin, hệ thống tự động tạo hồ sơ CV số đẹp, sẵn sàng gửi nhà tuyển dụng.",
            icon: "bx-id-card",
            color: "bg-iris/10",
            textColor: "text-iris",
            path: "/cv",
            tag: "Công cụ"
        },
        {
            title: "Diễn đàn Cộng đồng",
            desc: "Viết bài, thảo luận, chia sẻ kinh nghiệm nghề nghiệp và kết nối với hàng ngàn thành viên trong cộng đồng AMP.",
            icon: "bx-message-square-dots",
            color: "bg-foam/10",
            textColor: "text-foam",
            path: "/forum",
            tag: "Cộng đồng"
        },
        {
            title: "Bộ công cụ Trợ năng",
            desc: "Đọc số tiền thành lời, chuyển văn bản thành giọng nói (TTS) và nhận diện cử chỉ — hỗ trợ người khiếm thị và người già.",
            icon: "bx-low-vision",
            color: "bg-love/10",
            textColor: "text-love",
            path: "/tools/accessibility",
            tag: "Trợ năng"
        },
        {
            title: "Học ngôn ngữ kí hiệu",
            desc: "Bài học có lộ trình bài bản từ cơ bản đến nâng cao, kết hợp nhận diện cử chỉ AI thời gian thực ngay trên trình duyệt.",
            icon: "bx-hand",
            color: "bg-gold/10",
            textColor: "text-gold",
            path: "/sign-language",
            tag: "Giáo dục"
        },
        {
            title: "Kết bạn & Nhắn tin",
            desc: "Tìm kiếm và kết nối với người dùng khác, nhắn tin trực tiếp để mở ra cơ hội hợp tác và giao lưu trong cộng đồng.",
            icon: "bx-user-plus",
            color: "bg-iris/10",
            textColor: "text-iris",
            path: "/people",
            tag: "Xã hội"
        },
    ];
</script>

<div class="px-6 max-w-7xl mx-auto">
    <section class="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 lg:py-24">
        {#if mounted}
            <div in:fly={{ x: -30, duration: 1000 }} class="flex-1 space-y-8 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-iris/5 border border-iris/10 text-iris font-medium text-sm">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-iris opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-iris"></span>
                    </span>
                    AMP - Công nghệ cho sự bình đẳng
                </div>

                <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-rose-text">
                    Nâng tầm <br />
                    <span class="text-iris">Giá trị sống</span>
                </h1>

                <p class="text-xl text-subtle leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    <span class="font-bold text-rose-text">Accessible Multi-purpose Platform (AMP)</span> 
                    là giải pháp đột phá kết nối thị trường việc làm, xây dựng cộng đồng văn minh và mang đến công cụ trợ năng hiện đại cho người khuyết tật.
                </p>

                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <a href="/register" class="button px-10 py-4 text-lg shadow-xl shadow-iris/20">
                        <i class="bx bx-rocket mr-2"></i> Bắt đầu ngay
                    </a>
                    <a href="#mission" class="text-subtle font-bold px-8 py-3 rounded-xl border border-overlay hover:bg-iris/5 hover:text-iris transition-all flex items-center gap-2">
                        <i class="bx bx-info-circle"></i> Tìm hiểu thêm
                    </a>
                </div>

                <div class="flex items-center justify-center lg:justify-start gap-10 pt-8 border-t border-overlay/50">
                    <div>
                        <div class="text-3xl font-black text-rose-text">6.2M+</div>
                        <div class="text-xs font-bold text-muted uppercase tracking-widest">Nhu cầu hỗ trợ</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-rose-text">87%</div>
                        <div class="text-xs font-bold text-muted uppercase tracking-widest">Độ chính xác AI</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-rose-text">0.8s</div>
                        <div class="text-xs font-bold text-muted uppercase tracking-widest">Tốc độ phản hồi</div>
                    </div>
                </div>
            </div>

            <div in:fly={{ x: 30, duration: 1000, delay: 200 }} class="flex-1 relative w-full max-w-xl lg:max-w-none mx-auto mt-12 lg:mt-0">
                <div class="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(144,122,169,0.3)] group">
                    <img
                        src="/hero.png"
                        alt="AMP Platform Vision"
                        class="w-full h-auto transform group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-rose-text/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div class="absolute -top-12 -right-12 w-64 h-64 bg-iris/5 blur-[100px] rounded-full animate-pulse"></div>
                <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-love/5 blur-[100px] rounded-full animate-pulse"></div>
            </div>
        {/if}
    </section>

    <section id="mission" class="py-24 border-y border-overlay/50">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div class="space-y-8">
                <div class="inline-block px-4 py-1.5 bg-love/10 text-love rounded-full text-xs font-black uppercase tracking-widest">
                    Tại sao lại là AMP?
                </div>
                <h2 class="text-4xl md:text-5xl font-black text-rose-text leading-tight">
                    Xóa bỏ rào cản <br /> <span class="text-love">Bằng công nghệ</span>
                </h2>
                <div class="space-y-6 text-subtle text-lg leading-relaxed">
                    <p>
                        Việt Nam hiện có hơn <span class="font-bold text-rose-text font-serif italic">6.2 triệu</span> người khuyết tật, nhưng chỉ <span class="font-bold text-rose-text">30%</span> có khả năng tiếp cận các dịch vụ số cơ bản.
                    </p>
                    <p>
                        AMP ra đời với sứ mệnh thu hẹp khoảng cách số, giúp người lao động phổ thông và người khuyết tật tìm thấy cơ hội việc làm bình đẳng, hòa nhập sâu rộng vào cộng đồng.
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-6 bg-iris/5 rounded-3xl border border-iris/10 hover:border-iris/30 transition-all">
                        <i class="bx bx-check-double text-iris text-2xl mb-2"></i>
                        <div class="font-bold text-rose-text text-sm">Hòa nhập Số</div>
                        <div class="text-xs text-muted">Tiếp cận dịch vụ 4.0 dễ dàng</div>
                    </div>
                    <div class="p-6 bg-love/5 rounded-3xl border border-love/10 hover:border-love/30 transition-all">
                        <i class="bx bx-unite text-love text-2xl mb-2"></i>
                        <div class="font-bold text-rose-text text-sm">Kết nối việc làm</div>
                        <div class="text-xs text-muted">Cơ hội cho mọi trình độ</div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="glass p-8 rounded-[2.5rem] border border-white relative overflow-hidden group">
                    <div class="flex items-start gap-6 relative z-10">
                        <div class="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center shrink-0">
                            <i class="bx bx-shield-check text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-black text-rose-text mb-2">Tuyển dụng minh bạch</h4>
                            <p class="text-sm text-subtle">Hệ thống lọc hồ sơ thông minh, tự động kết nối ứng viên với công việc phù hợp nhất.</p>
                        </div>
                    </div>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>
                </div>
                <div class="glass p-8 rounded-[2.5rem] border border-white relative overflow-hidden group translate-x-4">
                    <div class="flex items-start gap-6 relative z-10">
                        <div class="w-12 h-12 bg-iris/10 text-iris rounded-full flex items-center justify-center shrink-0">
                            <i class="bx bx-group text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-black text-rose-text mb-2">Diễn đàn Văn minh</h4>
                            <p class="text-sm text-subtle">Không gian thảo luận, chia sẻ kinh nghiệm được quản duyệt chặt chẽ bởi cộng đồng.</p>
                        </div>
                    </div>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-iris/5 rounded-full blur-2xl"></div>
                </div>
                <div class="glass p-8 rounded-[2.5rem] border border-white relative overflow-hidden group translate-x-8">
                    <div class="flex items-start gap-6 relative z-10">
                        <div class="w-12 h-12 bg-love/10 text-love rounded-full flex items-center justify-center shrink-0">
                            <i class="bx bx-accessibility text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-black text-rose-text mb-2">Hỗ trợ không rào cản</h4>
                            <p class="text-sm text-subtle">Sử dụng AI tiên tiến để đọc số tiền, nhận diện cử chỉ và học ngôn ngữ kí hiệu.</p>
                        </div>
                    </div>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-love/5 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-24 space-y-20">

        <div class="text-center space-y-4">
            <div class="inline-block px-4 py-1.5 bg-iris/10 text-iris rounded-full text-xs font-black uppercase tracking-widest">
                AMP hỗ trợ cho
            </div>
            <h2 class="text-4xl md:text-5xl font-black text-rose-text">
                Nền tảng dành cho <span class="text-iris">tất cả mọi người</span>
            </h2>
            <p class="text-subtle max-w-2xl mx-auto font-medium text-lg">
                Dù bạn là ai — AMP đều có chỗ cho bạn. Chúng tôi xây dựng hệ sinh thái số toàn diện, xóa bỏ rào cản và kết nối cộng đồng.
            </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            {#each supportGroups as group}
                <div class="group text-center p-8 rounded-[2.5rem] bg-white border border-overlay/40 hover:border-iris/20 hover:shadow-lg transition-all duration-300">
                    <div class="w-16 h-16 bg-iris/5 text-iris rounded-full flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-iris group-hover:text-white transition-all duration-300">
                        <i class="bx {group.icon}"></i>
                    </div>
                    <div class="font-black text-rose-text text-base mb-1">{group.label}</div>
                    <div class="text-xs text-muted leading-relaxed">{group.desc}</div>
                </div>
            {/each}
        </div>

        <div class="flex items-center gap-6">
            <div class="flex-1 h-px bg-overlay/50"></div>
            <div class="text-xs font-black text-muted uppercase tracking-[0.25em] whitespace-nowrap">Các công cụ hiện có</div>
            <div class="flex-1 h-px bg-overlay/50"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each tools as tool}
                <a href={tool.path} class="group relative p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white border border-overlay/40 hover:border-iris/20 hover:shadow-[0_20px_50px_-15px_rgba(144,122,169,0.12)] transition-all duration-500 overflow-hidden">
                    <div class="absolute top-6 right-6">
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest {tool.color} {tool.textColor}">
                            {tool.tag}
                        </span>
                    </div>
                    <div class="w-16 h-16 {tool.color} {tool.textColor} rounded-[1.5rem] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <i class="bx {tool.icon}"></i>
                    </div>
                    <h3 class="text-xl font-black text-rose-text mb-3">{tool.title}</h3>
                    <p class="text-subtle text-sm leading-relaxed mb-6">{tool.desc}</p>
                    <div class="flex items-center gap-2 text-xs font-black text-iris uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Dùng ngay <i class="bx bx-right-arrow-alt text-lg"></i>
                    </div>
                    <div class="absolute -bottom-6 -right-6 w-32 h-32 {tool.color} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </a>
            {/each}
        </div>

    </section>

    <section class="py-24 bg-rose-text rounded-[4rem] px-8 lg:px-20 overflow-hidden relative shadow-2xl">
        <div class="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
        <div class="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div class="flex-1 space-y-8">
                <div class="px-4 py-1.5 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit">
                    AI powered learning
                </div>
                <h2 class="text-4xl md:text-6xl font-black text-white leading-tight">
                    Học tập theo cách <br /> <span class="text-iris">Hoàn toàn mới</span>
                </h2>
                <p class="text-white/70 text-xl leading-relaxed font-medium">
                    Hệ thống học tập ngôn ngữ kí hiệu thông minh với lộ trình bài bản, kết hợp video karaoke cử chỉ và nhận diện AI ngay trên trình duyệt.
                </p>
                <div class="flex flex-wrap gap-4">
                    <a href="/sign-language" class="bg-white text-rose-text px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                        Trải nghiệm Học tập
                    </a>
                    <a href="/tools/accessibility" class="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                        Xem Công cụ Trợ năng
                    </a>
                </div>
            </div>
            <div class="flex-1 relative">
                <div class="absolute inset-0 bg-iris/20 blur-[100px] rounded-full"></div>
                <div class="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-4 border border-white/10 relative z-10 shadow-2xl">
                    <div class="aspect-video bg-black/40 rounded-[2rem] flex flex-col items-center justify-center text-white/50 p-8 text-center border border-white/5">
                        <i class="bx bx-video-off text-6xl mb-4 opacity-20"></i>
                        <p class="text-sm font-black uppercase tracking-widest">Sign Language AI Module Preview</p>
                        <div class="mt-4 flex gap-2">
                            <span class="w-2 h-2 bg-iris rounded-full animate-bounce"></span>
                            <span class="w-2 h-2 bg-iris rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span class="w-2 h-2 bg-iris rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="py-24 border-t border-overlay mt-24">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div class="space-y-6">
                <div class="flex items-center gap-2 justify-center md:justify-start">
                    <div class="w-10 h-10 bg-iris rounded-2xl flex items-center justify-center text-white font-black shadow-lg">A</div>
                    <span class="text-2xl font-black text-rose-text tracking-tighter">AMP Platform</span>
                </div>
                <p class="text-subtle text-sm leading-relaxed">
                    Nền tảng hỗ trợ việc làm, cộng đồng và người khuyết tật. 
                    Dự án đạt giải thưởng Sáng tạo Thanh Thiếu Niên 2025 - 2026.
                </p>
            </div>
            <div class="flex flex-col gap-4">
                <h4 class="font-black text-rose-text uppercase tracking-widest text-xs">Liên kết nhanh</h4>
                <div class="flex flex-col gap-2">
                    <a href="/forum" class="text-sm text-subtle hover:text-iris transition-all font-bold">Cộng đồng</a>
                    <a href="/recruitment" class="text-sm text-subtle hover:text-iris transition-all font-bold">Thị trường việc làm</a>
                    <a href="/tools/accessibility" class="text-sm text-subtle hover:text-iris transition-all font-bold">Bộ công cụ trợ năng</a>
                </div>
            </div>
            <div class="space-y-4">
                <h4 class="font-black text-rose-text uppercase tracking-widest text-xs">Kết nối với chúng tôi</h4>
                <div class="flex gap-4 justify-center md:justify-start">
                    <a href="#" class="w-10 h-10 glass rounded-full flex items-center justify-center text-iris hover:bg-iris hover:text-white transition-all shadow-sm" aria-label="Facebook">
                        <i class="bx bxl-facebook text-xl"></i>
                    </a>
                    <a href="#" class="w-10 h-10 glass rounded-full flex items-center justify-center text-iris hover:bg-iris hover:text-white transition-all shadow-sm" aria-label="GitHub">
                        <i class="bx bxl-github text-xl"></i>
                    </a>
                    <a href="#" class="w-10 h-10 glass rounded-full flex items-center justify-center text-iris hover:bg-iris hover:text-white transition-all shadow-sm" aria-label="Email">
                        <i class="bx bx-envelope text-xl"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="mt-20 pt-8 border-t border-overlay/30 text-center">
            <p class="text-muted text-[10px] font-black uppercase tracking-[0.3em]">
                &copy; 2026 AMP. ALL RIGHTS RESERVED. DESIGNED FOR INCLUSION.
            </p>
        </div>
    </footer>
</div>

<style>
    :global(body) {
        background-image:
            radial-gradient(
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
