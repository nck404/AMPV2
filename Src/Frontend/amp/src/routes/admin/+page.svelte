<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { fade, fly } from "svelte/transition";

    let mounted = $state(false);

    onMount(() => {
        mounted = true;
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.is_admin) {
            goto("/");
        }
    });

    const adminModules = [
        {
            name: "Quản lý Tài liệu",
            desc: "Thêm, sửa, xóa hướng dẫn và quy trình hệ thống.",
            icon: "bx-book-content",
            color: "bg-iris",
            path: "/admin/docs",
        },
        {
            name: "Quản lý Người dùng",
            desc: "Phân quyền Admin, quản lý tài khoản và bảo mật.",
            icon: "bx-group",
            color: "bg-love",
            path: "/admin/users",
        },
        {
            name: "Kiểm duyệt Diễn đàn",
            desc: "Quản lý bài viết, báo cáo vi phạm và bình luận.",
            icon: "bx-message-square-dots",
            color: "bg-gold",
            path: "/admin/forum", // Placeholder
        },
        {
            name: "Hệ thống & AI",
            desc: "Cấu hình thuật toán, theo dõi hiệu năng và log.",
            icon: "bx-cog",
            color: "bg-rose-text",
            path: "/settings", // Placeholder
        },
    ];
</script>

<svelte:head>
    <title>Bảng quản trị | AMP</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-20 px-4">
    <div class="max-w-6xl mx-auto space-y-12">
        <header class="text-center" in:fade>
            <h1 class="text-5xl font-black text-rose-text mb-4">
                Hệ thống Quản trị
            </h1>
            <p class="text-subtle text-lg">
                Chào mừng quay lại, quản trị viên. Hãy chọn một chức năng để bắt
                đầu.
            </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            {#each adminModules as module, i}
                <a
                    href={module.path}
                    class="group p-8 bg-surface border border-overlay rounded-[3.5rem] flex items-center gap-8 hover:border-iris hover:shadow-xl hover:shadow-iris/5 transition-all duration-300"
                    in:fly={{ y: 20, delay: i * 100 }}
                >
                    <div
                        class="w-20 h-20 {module.color} text-white rounded-[1.8rem] flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                    >
                        <i class="bx {module.icon}"></i>
                    </div>

                    <div class="flex-1 space-y-1">
                        <h2 class="text-2xl font-black text-rose-text">
                            {module.name}
                        </h2>
                        <p class="text-subtle text-sm leading-relaxed">
                            {module.desc}
                        </p>
                        <div
                            class="flex items-center gap-2 text-iris font-black text-xs pt-2"
                        >
                            MỞ CHỨC NĂNG <i
                                class="bx bx-right-arrow-alt text-lg"
                            ></i>
                        </div>
                    </div>
                </a>
            {/each}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div
                class="lg:col-span-2 p-10 bg-iris/5 border border-iris/10 rounded-[3rem] space-y-6"
            >
                <h3 class="text-2xl font-black text-iris">
                    Thông tin hệ thống
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black text-muted uppercase tracking-widest"
                        >
                            Trạng thái Server
                        </p>
                        <p class="text-cat-green font-bold">Hoạt động (100%)</p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black text-muted uppercase tracking-widest"
                        >
                            Người dùng Online
                        </p>
                        <p class="text-rose-text font-bold">124 người</p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black text-muted uppercase tracking-widest"
                        >
                            Phiên bản
                        </p>
                        <p class="text-rose-text font-bold text-sm">
                            AMP Neural v2.5.0
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="p-10 bg-love/5 border border-love/10 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-4"
            >
                <i class="bx bx-shield-quarter text-5xl text-love"></i>
                <h3 class="text-xl font-black text-love">Bảo mật cao</h3>
                <p class="text-xs text-subtle">
                    Mọi hành động của Admin đều được ghi lại trong log hệ thống
                    để đảm bảo an toàn.
                </p>
            </div>
        </div>
    </div>
</div>
