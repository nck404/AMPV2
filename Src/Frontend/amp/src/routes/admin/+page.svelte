<script lang="ts">
    import { api } from "$lib/api.js";
    import { onMount } from "svelte";

    // Active tab state
    let activeTab = $state("users");

    // Real Data
    let users = $state([]);
    let posts = $state([]);
    let jobs = $state([]);
    let lockedRoutes = $state([]);
    let notifications = $state([]);
    let stats = $state({
        total_users: 0,
        total_businesses: 0,
        total_posts: 0,
        total_jobs: 0
    });

    // New notification form state
    let newNotification = $state({
        title: "",
        content: "",
        type: "admin"
    });

    // Search & Filter
    let userSearchTerm = $state("");
    let filteredUsers = $derived(
        users.filter(u => 
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        )
    );

    // Available routes to lock
    const availableRoutes = [
        "/chat",
        "/forum",
        "/recruitment",
        "/people",
        "/cv",
        "/sign-language",
        "/docs",
        "/tools/accessibility"
    ];

    // Modal state for adding user
    let showAddUserModal = $state(false);
    let newUser = $state({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    async function fetchData() {
        try {
            const [usersRes, postsRes, jobsRes, routesRes, statsRes] = await Promise.all([
                api.get("/admin/users"),
                api.get("/admin/posts"),
                api.get("/admin/jobs"),
                api.get("/admin/routes"),
                api.get("/admin/stats")
            ]);

            users = usersRes.users || [];
            posts = postsRes.posts || [];
            jobs = jobsRes.jobs || [];
            lockedRoutes = routesRes.locked_routes || [];
            try {
                const notifRes = await api.get("/admin/notifications");
                notifications = notifRes.notifications || [];
            } catch (e) {}
            stats = statsRes;
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    }

    onMount(() => {
        fetchData();
    });

    // User Actions
    async function changeUserRole(id, role) {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            fetchData();
        } catch (err) {
            alert("Lỗi khi thay đổi vai trò");
        }
    }

    async function toggleBan(id, currentStatus) {
        const ban = currentStatus !== "banned";
        try {
            await api.put(`/admin/users/${id}/ban`, { ban });
            fetchData();
        } catch (err) {
            alert("Lỗi khi thay đổi trạng thái ban");
        }
    }

    async function deleteUser(id) {
        if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa người dùng");
            }
        }
    }

    async function handleAddUser(e) {
        e.preventDefault();
        try {
            await api.post("/auth/register", {
                username: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                is_admin: newUser.role === "admin"
            });
            newUser = { name: "", email: "", password: "", role: "user" };
            showAddUserModal = false;
            fetchData();
        } catch (err) {
            alert("Lỗi khi tạo người dùng");
        }
    }

    // Post Actions
    async function deletePost(id) {
        if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
            try {
                await api.delete(`/admin/posts/${id}`);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa bài viết");
            }
        }
    }

    // Job Actions
    async function approveJob(id) {
        try {
            await api.put(`/admin/jobs/${id}/approve`, {});
            fetchData();
        } catch (err) {
            alert("Lỗi khi duyệt tin");
        }
    }

    async function deleteJob(id) {
        if (confirm("Bạn có chắc muốn xóa tin tuyển dụng này?")) {
            try {
                await api.delete(`/admin/jobs/${id}`);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa tin");
            }
        }
    }

    // Route Locking
    async function toggleRouteLock(route) {
        let newLockedRoutes;
        if (lockedRoutes.includes(route)) {
            newLockedRoutes = lockedRoutes.filter(r => r !== route);
        } else {
            newLockedRoutes = [...lockedRoutes, route];
        }

        try {
            const res = await api.post("/admin/routes", { locked_routes: newLockedRoutes });
            lockedRoutes = res.locked_routes;
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái khóa route");
        }
    }

    // Notification Actions
    async function sendNotification(e) {
        e.preventDefault();
        try {
            await api.post("/admin/notifications", newNotification);
            newNotification = { title: "", content: "", type: "admin" };
            fetchData();
            alert("Thông báo đã được gửi!");
        } catch (err) {
            alert("Lỗi khi gửi thông báo");
        }
    }

    async function deleteNotification(id) {
        if (confirm("Xóa thông báo này?")) {
            try {
                await api.delete(`/admin/notifications/${id}`);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa thông báo");
            }
        }
    }
</script>

<div class="container mx-auto p-4 max-w-6xl space-y-8">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-black text-rose-text">Admin <span class="text-iris">Dashboard</span></h1>
        <div class="flex gap-2">
             <button
                onclick={fetchData}
                class="glass p-3 rounded-xl text-rose-text hover:text-iris transition-colors"
                title="Làm mới dữ liệu"
            >
                <i class="bx bx-refresh text-2xl"></i>
            </button>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-iris/10 flex items-center justify-center text-iris text-2xl">
                <i class="bx bx-user"></i>
            </div>
            <div>
                <p class="text-sm font-bold text-subtle uppercase tracking-wider">Người dùng</p>
                <p class="text-2xl font-black text-rose-text">{stats.total_users || 0}</p>
            </div>
        </div>
        <div class="glass p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold text-2xl">
                <i class="bx bx-briefcase"></i>
            </div>
            <div>
                <p class="text-sm font-bold text-subtle uppercase tracking-wider">Doanh nghiệp</p>
                <p class="text-2xl font-black text-rose-text">{stats.total_businesses || 0}</p>
            </div>
        </div>
        <div class="glass p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-love/10 flex items-center justify-center text-love text-2xl">
                <i class="bx bx-news"></i>
            </div>
            <div>
                <p class="text-sm font-bold text-subtle uppercase tracking-wider">Bài viết</p>
                <p class="text-2xl font-black text-rose-text">{stats.total_posts || 0}</p>
            </div>
        </div>
        <div class="glass p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 text-2xl">
                <i class="bx bx-check-circle"></i>
            </div>
            <div>
                <p class="text-sm font-bold text-subtle uppercase tracking-wider">Việc làm</p>
                <p class="text-2xl font-black text-rose-text">{stats.total_jobs || 0}</p>
            </div>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex space-x-2 border-b border-white/10 pb-2">
        <button
            class="px-6 py-3 text-sm font-black rounded-t-2xl transition-all {activeTab === 'users' ? 'bg-iris text-white shadow-lg shadow-iris/20' : 'text-subtle hover:text-rose-text'}"
            onclick={() => (activeTab = "users")}
        >
            NGƯỜI DÙNG
        </button>
        <button
            class="px-6 py-3 text-sm font-black rounded-t-2xl transition-all {activeTab === 'posts' ? 'bg-iris text-white shadow-lg shadow-iris/20' : 'text-subtle hover:text-rose-text'}"
            onclick={() => (activeTab = "posts")}
        >
            BÀI ĐĂNG
        </button>
        <button
            class="px-6 py-3 text-sm font-black rounded-t-2xl transition-all {activeTab === 'jobs' ? 'bg-iris text-white shadow-lg shadow-iris/20' : 'text-subtle hover:text-rose-text'}"
            onclick={() => (activeTab = "jobs")}
        >
            TUYỂN DỤNG
        </button>
        <button
            class="px-6 py-3 text-sm font-black rounded-t-2xl transition-all {activeTab === 'system' ? 'bg-iris text-white shadow-lg shadow-iris/20' : 'text-subtle hover:text-rose-text'}"
            onclick={() => (activeTab = "system")}
        >
            HỆ THỐNG
        </button>
        <button
            class="px-6 py-3 text-sm font-black rounded-t-2xl transition-all {activeTab === 'notifications' ? 'bg-iris text-white shadow-lg shadow-iris/20' : 'text-subtle hover:text-rose-text'}"
            onclick={() => (activeTab = "notifications")}
        >
            THÔNG BÁO
        </button>
    </div>

    <!-- Tab Content -->
    <div class="glass rounded-[2rem] border border-white/10 overflow-hidden min-h-[400px]">
        {#if activeTab === "users"}
            <div class="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
                <div class="relative w-full md:w-96 group">
                    <i class="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-subtle group-focus-within:text-iris transition-colors"></i>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..." 
                        bind:value={userSearchTerm}
                        class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-rose-text focus:outline-none focus:ring-2 focus:ring-iris/50 transition-all input-icon"
                    />
                </div>
                <button
                    onclick={() => (showAddUserModal = true)}
                    class="w-full md:w-auto px-6 py-3 bg-iris text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-iris/20 flex items-center justify-center gap-2"
                >
                    <i class="bx bx-user-plus text-xl"></i> Thêm tài khoản
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead>
                        <tr class="text-xs text-subtle uppercase border-b border-white/10 bg-white/2">
                            <th class="px-6 py-4 font-black">Người dùng</th>
                            <th class="px-6 py-4 font-black">Vai trò</th>
                            <th class="px-6 py-4 font-black">Trạng thái</th>
                            <th class="px-6 py-4 font-black text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredUsers as user}
                            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-iris/10 flex items-center justify-center text-iris font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p class="font-bold text-rose-text">{user.name}</p>
                                            <p class="text-xs text-subtle">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider 
                                        {user.role === 'admin' ? 'bg-iris/20 text-iris' : user.role === 'business' ? 'bg-gold/20 text-gold' : 'bg-white/10 text-subtle'}">
                                        {user.role}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="flex items-center gap-1.5 font-bold {user.status === 'active' ? 'text-green-500' : 'text-love'}">
                                        <span class="w-2 h-2 rounded-full {user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-love'}"></span>
                                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex justify-end gap-2">
                                        <div class="flex bg-white/5 rounded-xl p-1 border border-white/5">
                                            <button 
                                                onclick={() => changeUserRole(user.id, "user")}
                                                class="p-2 rounded-lg transition-all {user.role === 'user' ? 'bg-iris text-white' : 'text-subtle hover:text-rose-text'}"
                                                title="Đặt vai trò User"
                                            >
                                                <i class="bx bx-user"></i>
                                            </button>
                                            <button 
                                                onclick={() => changeUserRole(user.id, "business")}
                                                class="p-2 rounded-lg transition-all {user.role === 'business' ? 'bg-gold text-white' : 'text-subtle hover:text-rose-text'}"
                                                title="Đặt vai trò Doanh nghiệp"
                                            >
                                                <i class="bx bx-briefcase"></i>
                                            </button>
                                            <button 
                                                onclick={() => changeUserRole(user.id, "admin")}
                                                class="p-2 rounded-lg transition-all {user.role === 'admin' ? 'bg-red-500 text-white' : 'text-subtle hover:text-rose-text'}"
                                                title="Đặt vai trò Admin"
                                            >
                                                <i class="bx bx-shield-quarter"></i>
                                            </button>
                                        </div>

                                        <button 
                                            onclick={() => toggleBan(user.id, user.status)}
                                            class="p-3 rounded-xl transition-all {user.status === 'active' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}"
                                            title={user.status === 'active' ? "Khóa tài khoản" : "Mở khóa"}
                                        >
                                            <i class="bx {user.status === 'active' ? 'bx-lock-alt' : 'bx-lock-open-alt'}"></i>
                                        </button>
                                        <button 
                                            onclick={() => deleteUser(user.id)}
                                            class="p-3 rounded-xl bg-love/10 text-love hover:bg-love hover:text-white transition-all"
                                            title="Xóa vĩnh viễn"
                                        >
                                            <i class="bx bx-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if activeTab === "posts"}
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-subtle uppercase border-b border-white/10 bg-white/2">
                        <tr>
                            <th class="px-6 py-4 font-black">Tiêu đề bài viết</th>
                            <th class="px-6 py-4 font-black">Người đăng</th>
                            <th class="px-6 py-4 font-black">Ngày đăng</th>
                            <th class="px-6 py-4 font-black text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each posts as post}
                            <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td class="px-6 py-4 font-bold text-rose-text">{post.title}</td>
                                <td class="px-6 py-4 text-subtle">{post.author}</td>
                                <td class="px-6 py-4 text-subtle">{post.date}</td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        onclick={() => deletePost(post.id)}
                                        class="p-3 rounded-xl bg-love/10 text-love hover:bg-love hover:text-white transition-all"
                                    >
                                        <i class="bx bx-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if activeTab === "jobs"}
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-subtle uppercase border-b border-white/10 bg-white/2">
                        <tr>
                            <th class="px-6 py-4 font-black">Vị trí tuyển dụng</th>
                            <th class="px-6 py-4 font-black">Công ty</th>
                            <th class="px-6 py-4 font-black">Trạng thái</th>
                            <th class="px-6 py-4 font-black text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each jobs as job}
                            <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td class="px-6 py-4 font-bold text-rose-text">{job.title}</td>
                                <td class="px-6 py-4 text-subtle">{job.company}</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase {job.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-gold/20 text-gold'}">
                                        {job.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right flex justify-end gap-2">
                                    {#if job.status === "pending"}
                                        <button
                                            onclick={() => approveJob(job.id)}
                                            class="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                        >
                                            <i class="bx bx-check"></i>
                                        </button>
                                    {/if}
                                    <button
                                        onclick={() => deleteJob(job.id)}
                                        class="p-3 rounded-xl bg-love/10 text-love hover:bg-love hover:text-white transition-all"
                                    >
                                        <i class="bx bx-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if activeTab === "notifications"}
            <div class="p-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Send Notification Form -->
                    <div class="lg:col-span-1 border-r border-white/10 pr-0 lg:pr-8">
                        <h2 class="text-2xl font-black text-rose-text mb-6">Gửi thông báo mới</h2>
                        <form onsubmit={sendNotification} class="space-y-4">
                            <div>
                                <label class="block text-xs font-black text-subtle uppercase mb-2">Tiêu đề</label>
                                <input 
                                    type="text" 
                                    bind:value={newNotification.title}
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-rose-text focus:ring-2 focus:ring-iris/50 outline-none"
                                    placeholder="Tiêu đề thông báo..."
                                    required
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-black text-subtle uppercase mb-2">Nội dung</label>
                                <textarea 
                                    bind:value={newNotification.content}
                                    rows="4"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-rose-text focus:ring-2 focus:ring-iris/50 outline-none resize-none"
                                    placeholder="Nội dung thông báo chi tiết..."
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-black text-subtle uppercase mb-2">Loại thông báo</label>
                                <div class="flex gap-2">
                                    {#each ['admin', 'info', 'warning', 'success'] as type}
                                        <button 
                                            type="button"
                                            onclick={() => newNotification.type = type}
                                            class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all {newNotification.type === type ? 'bg-iris text-white border-iris shadow-lg shadow-iris/20' : 'border-white/10 text-subtle hover:border-iris/50'}"
                                        >
                                            {type}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                            <button 
                                type="submit"
                                class="w-full py-4 bg-iris text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-iris/20 flex items-center justify-center gap-2"
                            >
                                <i class="bx bx-paper-plane text-xl"></i>
                                GỬI CHO TẤT CẢ
                            </button>
                        </form>
                    </div>

                    <!-- Notification History -->
                    <div class="lg:col-span-2">
                        <h2 class="text-2xl font-black text-rose-text mb-6">Lịch sử thông báo</h2>
                        <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {#each notifications as notif}
                                <div class="glass p-5 rounded-3xl border border-white/10 group hover:border-iris/30 transition-all">
                                    <div class="flex items-start justify-between gap-4">
                                        <div class="flex items-start gap-4">
                                            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl
                                                {notif.type === 'admin' ? 'bg-iris/10 text-iris' : 
                                                 notif.type === 'warning' ? 'bg-love/10 text-love' :
                                                 notif.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-subtle/10 text-subtle'}">
                                                <i class="bx {notif.type === 'admin' ? 'bx-shield-quarter' : 
                                                             notif.type === 'warning' ? 'bx-error' :
                                                             notif.type === 'success' ? 'bx-check-circle' : 'bx-info-circle'}"></i>
                                            </div>
                                            <div>
                                                <h3 class="font-bold text-rose-text">{notif.title}</h3>
                                                <p class="text-sm text-subtle mt-1">{notif.content}</p>
                                                <p class="text-[10px] font-black text-subtle/50 uppercase mt-2 tracking-widest">
                                                    {new Date(notif.created_at).toLocaleString()} | {notif.type}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onclick={() => deleteNotification(notif.id)}
                                            class="p-2 text-subtle hover:text-love transition-colors"
                                        >
                                            <i class="bx bx-x text-xl"></i>
                                        </button>
                                    </div>
                                </div>
                            {/each}
                            {#if notifications.length === 0}
                                <div class="flex flex-col items-center justify-center py-12 text-subtle opacity-50">
                                    <i class="bx bx-bell-off text-6xl mb-4"></i>
                                    <p class="font-bold uppercase tracking-widest italic text-center">Chưa có thông báo nào được gửi.</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        {#if activeTab === "system"}
            <div class="p-8">
                <div class="mb-8">
                    <h2 class="text-2xl font-black text-rose-text mb-2">Quản lý Hệ thống</h2>
                    <p class="text-subtle">Kích hoạt chế độ bảo trì cho từng khu vực cụ thể trên ứng dụng.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each availableRoutes as route}
                        <div class="glass p-6 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-iris/30 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-2xl {lockedRoutes.includes(route) ? 'bg-rose-500/10 text-rose-500' : 'bg-iris/10 text-iris'} flex items-center justify-center text-2xl">
                                    <i class="bx {lockedRoutes.includes(route) ? 'bx-error-circle' : 'bx-link'}"></i>
                                </div>
                                <div>
                                    <h3 class="font-black text-rose-text">{route}</h3>
                                    <p class="text-xs font-bold uppercase tracking-widest {lockedRoutes.includes(route) ? 'text-love' : 'text-green-500'}">
                                        {lockedRoutes.includes(route) ? 'Bảo trì' : 'Hoạt động'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onclick={() => toggleRouteLock(route)}
                                class="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all {lockedRoutes.includes(route) ? 'bg-love text-white shadow-lg shadow-love/20' : 'bg-white/10 text-subtle hover:bg-iris hover:text-white'}"
                            >
                                {lockedRoutes.includes(route) ? 'Mở khóa' : 'Khóa'}
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Thêm Tài Khoản -->
{#if showAddUserModal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
        <div
            class="glass rounded-lg shadow-lg w-full max-w-md p-6 relative border border-white/10"
        >
            <h3 class="text-xl font-bold text-rose-text mb-4">
                Thêm tài khoản mới
            </h3>

            <form onsubmit={handleAddUser}>
                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-rose-text/80 mb-1"
                        for="username">Tên (Username)</label
                    >
                    <input
                        id="username"
                        type="text"
                        required
                        bind:value={newUser.name}
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 text-rose-text rounded focus:outline-none focus:ring-2 focus:ring-iris"
                        placeholder="Nhập tên người dùng"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-rose-text/80 mb-1"
                        for="email">Email</label
                    >
                    <input
                        id="email"
                        type="email"
                        required
                        bind:value={newUser.email}
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 text-rose-text rounded focus:outline-none focus:ring-2 focus:ring-iris"
                        placeholder="Nhập địa chỉ email"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-rose-text/80 mb-1"
                        for="password">Mật khẩu</label
                    >
                    <input
                        id="password"
                        type="password"
                        required
                        bind:value={newUser.password}
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 text-rose-text rounded focus:outline-none focus:ring-2 focus:ring-iris"
                        placeholder="Nhập mật khẩu"
                    />
                </div>

                <div class="mb-6">
                    <label
                        class="block text-sm font-medium text-rose-text/80 mb-1"
                        for="role">Vai trò (Role)</label
                    >
                    <select
                        id="role"
                        bind:value={newUser.role}
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 text-rose-text rounded focus:outline-none focus:ring-2 focus:ring-iris"
                    >
                        <option value="user" class="text-gray-900"
                            >User (Người dùng)</option
                        >
                        <option value="business" class="text-gray-900"
                            >Business (Doanh nghiệp)</option
                        >
                        <option value="admin" class="text-gray-900"
                            >Admin (Quản trị viên)</option
                        >
                    </select>
                </div>

                <div class="flex justify-end space-x-2">
                    <button
                        type="button"
                        onclick={() => (showAddUserModal = false)}
                        class="button px-4 py-2 text-sm font-medium text-rose-text glass rounded hover:bg-white/10"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        class="button px-4 py-2 text-sm font-medium text-white bg-iris rounded hover:bg-iris/80"
                    >
                        Thêm tài khoản
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
