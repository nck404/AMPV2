<script>
    import { onMount } from "svelte";
    import { fly, fade, slide } from "svelte/transition";
    import { api } from "$lib/api.js";

    let mounted = $state(false);
    let searchTerm = $state("");
    let selectedLocation = $state("All");
    let selectedType = $state("All");
    let selectedSupport = $state([]);
    
    let rawJobs = $state([]);
    let currentUser = $state(null);

    // Dữ liệu mẫu (Mock Data) chi tiết hơn cho demo
    const mockJobs = [
        {
            id: 1,
            logo: "🏢",
            company: "TechCorp Việt Nam",
            date: "2 ngày trước",
            title: "Lập trình viên Web (Frontend Svelte)",
            tags: ["HTML/CSS", "Svelte", "Remote"],
            salary: "15 - 25 Triệu",
            location: "TP. Hồ Chí Minh",
            type: "Toàn thời gian",
            supports: ["khiem_thinh", "van_dong"],
            description: "Công việc linh hoạt 100% remote. Hệ thống liên lạc nội bộ text-based 100%, không yêu cầu meeting qua voice. Cung cấp trang thiết bị công thái học."
        },
        {
            id: 2,
            logo: "☕",
            company: "Chuỗi Cà phê The Light",
            date: "5 giờ trước",
            title: "Nhân viên Pha chế (Barista)",
            tags: ["F&B", "Giao tiếp", "Theo ca"],
            salary: "7 - 10 Triệu",
            location: "Hà Nội",
            type: "Bán thời gian",
            supports: ["khiem_thinh"],
            description: "Mô hình quán cà phê sử dụng hoàn toàn ngôn ngữ ký hiệu. Khách hàng order qua màn hình cảm ứng (Self-ordering kiosk). Môi trường thân thiện, hoà nhập."
        },
        {
            id: 3,
            logo: "💻",
            company: "DataTech Solutions",
            date: "1 tuần trước",
            title: "Chuyên viên Nhập liệu & Phân tích",
            tags: ["Data Entry", "Excel", "Office"],
            salary: "10 - 15 Triệu",
            location: "Đà Nẵng",
            type: "Remote",
            supports: ["van_dong", "khiem_thi"],
            description: "Hệ thống phần mềm nội bộ đạt chuẩn WCAG 2.1 AA, tương thích hoàn toàn với trình đọc màn hình (Screen Reader). Có thể linh hoạt thời gian."
        },
        {
            id: 4,
            logo: "🎨",
            company: "Creative Agency Z",
            date: "10 giờ trước",
            title: "Nhân viên Thiết kế Đồ họa (2D Graphic)",
            tags: ["Photoshop", "Illustrator", "Creative"],
            salary: "12 - 18 Triệu",
            location: "Hà Nội",
            type: "Toàn thời gian",
            supports: ["khiem_thinh", "van_dong"],
            description: "Văn phòng làm việc thiết kế phẳng (không bậc thang), lối đi rộng rãi cho xe lăn. Trao đổi công việc 100% qua Slack/Trello."
        }
    ];

    async function fetchJobs() {
        try {
            const res = await api.get("/recruitment/jobs");
            if (res && res.jobs && res.jobs.length > 0) {
                rawJobs = res.jobs;
            } else {
                rawJobs = mockJobs;
            }
        } catch (err) {
            console.error(err);
            rawJobs = mockJobs;
        }
    }

    onMount(() => {
        mounted = true;
        const userData = localStorage.getItem("user");
        if (userData) {
            currentUser = JSON.parse(userData);
        }
        fetchJobs();
    });

    let filteredJobs = $derived(
        rawJobs.filter(job => {
            const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
            const matchType = selectedType === "All" || job.type === selectedType;
            const matchSupport = selectedSupport.length === 0 || selectedSupport.every(supp => job.supports?.includes(supp));
            return matchSearch && matchLocation && matchType && matchSupport;
        })
    );

    const toggleSupport = (supp) => {
        if (selectedSupport.includes(supp)) {
            selectedSupport = selectedSupport.filter(s => s !== supp);
        } else {
            selectedSupport = [...selectedSupport, supp];
        }
    };

    const supportBadges = {
        khiem_thinh: { icon: "bx-volume-mute", label: "Hỗ trợ khiếm thính", color: "text-blue-500", bg: "bg-blue-500/10" },
        khiem_thi: { icon: "bx-low-vision", label: "Tương thích trình đọc", color: "text-purple-500", bg: "bg-purple-500/10" },
        van_dong: { icon: "bx-accessibility", label: "Tiếp cận xe lăn", color: "text-green-500", bg: "bg-green-500/10" }
    };
</script>

<div class="max-w-7xl mx-auto px-6 py-12">
    {#if mounted}
        <div class="space-y-12">
            <!-- HERO SECTION -->
            <div class="text-center space-y-6">
                <h1 class="text-5xl md:text-6xl font-black text-rose-text">
                    Tìm <span class="text-gold">Sự Nghiệp</span> <br /> Mơ Ước Của Bạn
                </h1>
                <p class="text-lg md:text-xl text-subtle max-w-2xl mx-auto leading-relaxed">
                    Nền tảng tuyển dụng chuyên biệt đầu tiên kết nối ứng viên khuyết tật với các doanh nghiệp bao trùm và hoà nhập.
                </p>

                <!-- ADVANCED SEARCH BAR -->
                <div class="max-w-4xl mx-auto pt-6 flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative group">
                        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-gold transition-all">
                            <i class="bx bx-search"></i>
                        </span>
                        <input
                            type="text"
                            bind:value={searchTerm}
                            placeholder="Vị trí, công ty hoặc từ khóa kỹ năng..."
                            class="w-full pl-16 pr-6 h-16 rounded-[2rem] bg-surface shadow-xl shadow-rose-text/5 border border-overlay focus:border-gold/50 transition-all font-medium outline-none text-rose-text placeholder:text-muted"
                        />
                    </div>
                    <button class="px-10 h-16 rounded-[2rem] bg-gold text-white text-lg font-black hover:bg-gold/80 hover:shadow-lg shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <i class="bx bx-target-lock text-2xl"></i> Tìm kiếm
                    </button>
                </div>
            </div>

            <!-- PROMO BANNER -->
            <div class="bg-gradient-to-r from-gold/10 to-iris/5 p-8 md:p-12 rounded-[3rem] border border-gold/10 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full"></div>
                <div class="space-y-6 relative z-10 flex-1">
                    <span class="px-4 py-1.5 bg-surface text-gold rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border border-gold/10">Dành cho Nhà tuyển dụng</span>
                    <h2 class="text-3xl md:text-4xl font-black text-rose-text leading-tight">Tuyển dụng không <br /> rào cản.</h2>
                    <p class="text-subtle text-base md:text-lg max-w-md">
                        Đăng tin tuyển dụng và tìm kiếm những tài năng đặc biệt. Cùng AMP xây dựng một môi trường làm việc đa dạng, công bằng.
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <a href="/recruitment/post" class="px-8 py-4 bg-surface text-rose-text font-black rounded-2xl shadow-sm hover:shadow-xl transition-all border border-overlay flex items-center gap-2 hover:border-gold/30">
                            <i class="bx bx-plus-circle text-xl"></i> Đăng tin miễn phí
                        </a>
                        {#if currentUser?.role === 'business' || currentUser?.role === 'admin'}
                            <a href="/recruitment/manage" class="px-8 py-4 bg-gold text-white font-black rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gold flex items-center gap-2">
                                <i class="bx bx-list-check text-xl"></i> Quản lý ứng viên
                            </a>
                        {/if}
                    </div>
                </div>
                <div class="hidden lg:grid grid-cols-2 gap-4">
                    {#each [1, 2, 3, 4] as i}
                        <div class="w-24 h-24 bg-surface/60 rounded-3xl shadow-sm border border-overlay flex items-center justify-center grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer hover:-translate-y-1">
                            <i class="bx bx-buildings text-3xl opacity-20"></i>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- MAIN LAYOUT: FILTERS + JOB LIST -->
            <div class="flex flex-col lg:flex-row gap-8 items-start">
                
                <!-- SIDEBAR FILTERS -->
                <aside class="w-full lg:w-1/4 space-y-6 sticky top-24">
                    <div class="glass rounded-[2rem] p-6 border border-overlay space-y-8">
                        <h3 class="text-xl font-black text-rose-text flex items-center gap-2 border-b border-overlay pb-4">
                            <i class="bx bx-filter-alt text-gold"></i> Bộ lọc chi tiết
                        </h3>

                        <!-- Hỗ trợ khuyết tật -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-subtle">Cơ sở vật chất / Hỗ trợ</h4>
                            <div class="space-y-2">
                                {#each Object.entries(supportBadges) as [key, badge]}
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <div class="relative flex items-center justify-center w-5 h-5 rounded border border-overlay group-hover:border-gold transition-colors {selectedSupport.includes(key) ? 'bg-gold border-gold' : 'bg-surface'}">
                                            {#if selectedSupport.includes(key)}
                                                <i class="bx bx-check text-white text-sm"></i>
                                            {/if}
                                        </div>
                                        <input type="checkbox" class="hidden" checked={selectedSupport.includes(key)} onchange={() => toggleSupport(key)} />
                                        <span class="text-sm font-medium text-rose-text group-hover:text-gold transition-colors">{badge.label}</span>
                                    </label>
                                {/each}
                            </div>
                        </div>

                        <!-- Địa điểm -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-subtle">Khu vực làm việc</h4>
                            <select bind:value={selectedLocation} class="w-full p-3 rounded-xl bg-surface border border-overlay outline-none focus:border-gold text-rose-text font-medium appearance-none cursor-pointer">
                                <option value="All">Tất cả khu vực</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                            </select>
                        </div>

                        <!-- Hình thức làm việc -->
                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-subtle">Hình thức</h4>
                            <select bind:value={selectedType} class="w-full p-3 rounded-xl bg-surface border border-overlay outline-none focus:border-gold text-rose-text font-medium appearance-none cursor-pointer">
                                <option value="All">Tất cả hình thức</option>
                                <option value="Toàn thời gian">Toàn thời gian (Full-time)</option>
                                <option value="Bán thời gian">Bán thời gian (Part-time)</option>
                                <option value="Remote">Từ xa (Remote)</option>
                            </select>
                        </div>
                    </div>
                </aside>

                <!-- JOB LISTINGS -->
                <main class="w-full lg:w-3/4 space-y-6">
                    <div class="flex items-center justify-between px-2">
                        <h3 class="text-2xl font-black text-rose-text">
                            Kết quả tìm kiếm
                            <span class="ml-2 text-sm text-muted font-bold px-3 py-1 bg-overlay/30 rounded-full">{filteredJobs.length} tin</span>
                        </h3>
                    </div>

                    {#if filteredJobs.length === 0}
                        <div in:fade class="py-20 text-center space-y-4 opacity-50 bg-surface border border-overlay rounded-[3rem]">
                            <div class="text-6xl text-muted"><i class="bx bx-search-alt"></i></div>
                            <p class="font-bold text-lg text-rose-text">
                                Không tìm thấy công việc phù hợp với tiêu chí lọc...
                            </p>
                            <button onclick={() => { searchTerm=''; selectedLocation='All'; selectedType='All'; selectedSupport=[]; }} class="px-6 py-2 bg-overlay rounded-xl font-bold text-rose-text hover:bg-gold hover:text-white transition-all">
                                Xóa bộ lọc
                            </button>
                        </div>
                    {:else}
                        <div class="grid grid-cols-1 gap-6">
                            {#each filteredJobs as job, i}
                                <div
                                    in:fly={{ y: 20, delay: i * 50 }}
                                    class="group p-6 md:p-8 bg-surface border border-overlay rounded-[2.5rem] hover:border-gold/30 hover:bg-white transition-all duration-300 flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:shadow-gold/10 cursor-pointer"
                                >
                                    <!-- Card Header -->
                                    <div class="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                        <div class="flex gap-6 items-start">
                                            <div class="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gradient-to-br from-surface to-overlay shadow-md rounded-[1.5rem] flex items-center justify-center text-4xl md:text-5xl border border-overlay group-hover:scale-105 transition-transform duration-500">
                                                {job.logo}
                                            </div>
                                            <div class="space-y-2">
                                                <div class="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider">
                                                    <span class="text-gold flex items-center gap-1"><i class="bx bxs-business"></i> {job.company}</span>
                                                    <span class="w-1 h-1 bg-muted rounded-full"></span>
                                                    <span class="text-muted flex items-center gap-1"><i class="bx bx-time-five"></i> {job.date}</span>
                                                </div>
                                                <h4 class="text-2xl md:text-3xl font-black text-rose-text group-hover:text-gold transition-colors leading-tight">
                                                    {job.title}
                                                </h4>
                                                <div class="flex flex-wrap gap-2 pt-1">
                                                    {#each job.tags as tag}
                                                        <span class="px-3 py-1 bg-overlay/30 rounded-lg text-[10px] font-black text-subtle uppercase border border-overlay/50">
                                                            {tag}
                                                        </span>
                                                    {/each}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Salary & Apply Mobile: Hidden, Desktop: Visible -->
                                        <div class="hidden md:flex flex-col items-end gap-3 shrink-0">
                                            <div class="text-right">
                                                <span class="block text-2xl font-black text-love">{job.salary}</span>
                                                <span class="block text-xs font-bold text-muted uppercase mt-1">{job.location} • {job.type}</span>
                                            </div>
                                            <a href="/recruitment/{job.id}/apply" class="px-8 py-3 rounded-2xl bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all font-black flex items-center gap-2 active:scale-95 border border-gold/20">
                                                Ứng tuyển <i class="bx bx-right-arrow-alt text-xl"></i>
                                            </a>
                                        </div>
                                    </div>

                                    <!-- Card Body (Description & Accessibility Badges) -->
                                    <div class="pt-4 border-t border-overlay/50 flex flex-col gap-4">
                                        <p class="text-subtle text-sm leading-relaxed max-w-3xl">
                                            {job.description}
                                        </p>
                                        
                                        <div class="flex flex-wrap gap-3">
                                            <span class="text-xs font-bold text-muted flex items-center mr-2">Hỗ trợ đặc biệt:</span>
                                            {#if job.supports && job.supports.length > 0}
                                                {#each job.supports as supp}
                                                    {#if supportBadges[supp]}
                                                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl {supportBadges[supp].bg} {supportBadges[supp].color} border border-current/10">
                                                            <i class="bx {supportBadges[supp].icon} text-base"></i>
                                                            <span class="text-[11px] font-bold">{supportBadges[supp].label}</span>
                                                        </div>
                                                    {/if}
                                                {/each}
                                            {:else}
                                                <span class="text-xs text-muted italic">Đang cập nhật...</span>
                                            {/if}
                                        </div>
                                    </div>
                                    
                                    <!-- Salary & Apply Mobile Only -->
                                    <div class="md:hidden pt-4 flex items-center justify-between border-t border-overlay/50">
                                        <div>
                                            <span class="block text-xl font-black text-love">{job.salary}</span>
                                            <span class="block text-[10px] font-bold text-muted uppercase mt-0.5">{job.location} • {job.type}</span>
                                        </div>
                                        <a href="/recruitment/{job.id}/apply" class="px-6 py-3 rounded-xl bg-gold text-white font-black flex items-center gap-2 active:scale-95 shadow-md shadow-gold/20">
                                            Ứng tuyển
                                        </a>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </main>
            </div>
        </div>
    {/if}
</div>
