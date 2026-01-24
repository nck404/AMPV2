<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";

    let mounted = $state(false);
    let searchTerm = $state("");

    const jobs = [
        {
            id: 1,
            company: "Cộng đồng AMP",
            logo: "🤝",
            title: "Cộng tác viên Dịch Ngôn ngữ kí hiệu",
            type: "Dự án / Tự do",
            salary: "Theo thỏa thuận",
            location: "Toàn quốc (Remote)",
            date: "Vừa đăng",
            tags: ["Cộng đồng", "Phi lợi nhuận", "Ngôn ngữ kí hiệu"],
        },
    ];

    onMount(() => (mounted = true));
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    {#if mounted}
        <div class="space-y-12">
            <!-- Header & Search -->
            <div class="text-center space-y-6">
                <h1 class="text-6xl font-black text-rose-text">
                    Tìm <span class="text-gold">Sự Nghiệp</span> <br /> Mơ Ước Của
                    Bạn
                </h1>
                <p
                    class="text-xl text-subtle max-w-2xl mx-auto leading-relaxed"
                >
                    Nơi hội nhập và phát triển nghề nghiệp dành riêng cho cộng
                    đồng người khiếm thính và khiếm thị.
                </p>

                <div
                    class="max-w-3xl mx-auto pt-6 flex flex-col md:flex-row gap-4"
                >
                    <div class="flex-1 relative group">
                        <span
                            class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-gold transition-all"
                        >
                            <i class="bx bx-search"></i>
                        </span>
                        <input
                            type="text"
                            bind:value={searchTerm}
                            placeholder="Vị trí, công ty hoặc từ khóa..."
                            class="w-full pl-14 h-16 rounded-2xl bg-white shadow-xl shadow-rose-text/5 border-overlay focus:border-gold/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        class="button px-10 h-16 bg-gold text-white text-lg hover:bg-gold/80 hover:shadow-gold/20 active:scale-95 transition-all"
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            <!-- Dashboard Banner -->
            <div
                class="bg-gradient-to-r from-gold/10 to-iris/5 p-12 rounded-[4rem] border border-gold/10 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
            >
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"
                ></div>
                <div class="space-y-6 relative z-10 flex-1">
                    <span
                        class="px-4 py-1.5 bg-white text-gold rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border border-gold/10"
                        >Đối tác doanh nghiệp</span
                    >
                    <h2
                        class="text-4xl font-black text-rose-text leading-tight"
                    >
                        Tuyển dụng không <br /> rào cản.
                    </h2>
                    <p class="text-subtle text-lg max-w-md">
                        AMP kết nối bạn với các doanh nghiệp cam kết tạo dựng
                        môi trường làm việc thông minh và hòa nhập.
                    </p>
                    <button
                        class="px-8 py-4 bg-white text-rose-text font-black rounded-2xl shadow-sm hover:shadow-xl transition-all border border-overlay flex items-center gap-2"
                    >
                        <i class="bx bx-plus-circle"></i> Đăng tin tuyển dụng
                    </button>
                </div>
                <div class="hidden lg:grid grid-cols-2 gap-4">
                    {#each [1, 2, 3, 4] as i}
                        <div
                            class="w-24 h-24 bg-white/60 rounded-3xl shadow-sm border border-white flex items-center justify-center grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer"
                        >
                            <i class="bx bx-建物 text-3xl opacity-20"></i>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Jobs List -->
            <div class="space-y-6">
                <div class="flex items-center justify-between px-4 mb-8">
                    <h3 class="text-2xl font-black text-rose-text">
                        Cơ hội nghề nghiệp
                        <span
                            class="ml-2 text-sm text-muted font-bold px-2 py-0.5 bg-overlay/30 rounded-lg"
                            >{jobs.length} tin</span
                        >
                    </h3>
                </div>

                <div class="grid grid-cols-1 gap-6">
                    {#each jobs as job, i}
                        <div
                            in:fly={{ y: 20, delay: i * 100 }}
                            class="group p-8 bg-surface border border-overlay rounded-[3.5rem] hover:border-gold/30 hover:bg-white transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-10 shadow-sm hover:shadow-2xl hover:shadow-gold/5"
                        >
                            <div class="flex items-center gap-8">
                                <div
                                    class="w-24 h-24 bg-white shadow-lg shadow-rose-text/5 rounded-[2rem] flex items-center justify-center text-5xl border border-overlay group-hover:scale-110 transition-transform duration-500"
                                >
                                    {job.logo}
                                </div>
                                <div class="space-y-2">
                                    <div
                                        class="flex items-center gap-4 text-xs font-bold uppercase tracking-wider"
                                    >
                                        <span class="text-gold"
                                            >{job.company}</span
                                        >
                                        <span
                                            class="w-1.5 h-1.5 bg-muted rounded-full opacity-20"
                                        ></span>
                                        <span class="text-muted"
                                            >{job.date}</span
                                        >
                                    </div>
                                    <h4
                                        class="text-3xl font-black text-rose-text group-hover:text-gold transition-colors leading-tight"
                                    >
                                        {job.title}
                                    </h4>
                                    <div class="flex flex-wrap gap-2 pt-2">
                                        {#each job.tags as tag}
                                            <span
                                                class="px-4 py-1 bg-overlay/30 rounded-full text-[9px] font-black text-muted group-hover:bg-gold/10 group-hover:text-gold transition-colors tracking-wide uppercase"
                                            >
                                                {tag}
                                            </span>
                                        {/each}
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex flex-col md:items-end justify-between gap-6 md:h-full py-2"
                            >
                                <div class="flex flex-col md:items-end gap-1">
                                    <span
                                        class="text-2xl font-black text-rose-text"
                                        >{job.salary}</span
                                    >
                                    <span
                                        class="text-xs font-bold text-muted uppercase tracking-widest"
                                        >{job.location} • {job.type}</span
                                    >
                                </div>
                                <button
                                    class="button px-10 bg-overlay text-rose-text group-hover:bg-gold group-hover:text-white transition-all shadow-none group-hover:shadow-lg group-hover:shadow-gold/20 font-black"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            {#if searchTerm}
                <div in:fade class="py-20 text-center space-y-4 opacity-50">
                    <div class="text-6xl"><i class="bx bx-search-alt"></i></div>
                    <p class="font-bold italic">
                        Không tìm thấy kết quả phù hợp cho "{searchTerm}"...
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</div>
