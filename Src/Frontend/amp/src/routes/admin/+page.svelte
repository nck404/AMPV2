<script lang="ts">
    // Active tab state
    let activeTab = $state("users");

    // Mock Data
    let users = $state([
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "a@example.com",
            role: "admin",
            status: "active",
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "b@example.com",
            role: "business",
            status: "active",
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "c@example.com",
            role: "user",
            status: "banned",
        },
    ]);

    let posts = $state([
        {
            id: 101,
            title: "Chia sẻ kinh nghiệm phỏng vấn",
            author: "Nguyễn Văn A",
            date: "2023-10-25",
        },
        {
            id: 102,
            title: "Hỏi về mức lương Fresher React",
            author: "Lê Văn C",
            date: "2023-10-26",
        },
    ]);

    let jobs = $state([
        {
            id: 201,
            title: "Frontend Developer",
            company: "Tech Corp",
            status: "pending",
        },
        {
            id: 202,
            title: "Backend Node.js",
            company: "Soft Solutions",
            status: "approved",
        },
    ]);

    // Modal state for adding user
    let showAddUserModal = $state(false);
    let newUser = $state({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    // User Actions
    function grantBusiness(id: number) {
        const user = users.find((u) => u.id === id);
        if (user) user.role = "business";
    }

    function toggleBan(id: number) {
        const user = users.find((u) => u.id === id);
        if (user) user.status = user.status === "active" ? "banned" : "active";
    }

    function deleteUser(id: number) {
        if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
            users = users.filter((u) => u.id !== id);
        }
    }

    function handleAddUser(e: Event) {
        e.preventDefault();
        users = [
            ...users,
            {
                id: Date.now(),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: "active",
            },
        ];

        // Reset form and close modal
        newUser = { name: "", email: "", password: "", role: "user" };
        showAddUserModal = false;
    }

    // Post Actions
    function deletePost(id: number) {
        if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
            posts = posts.filter((p) => p.id !== id);
        }
    }

    // Job Actions
    function approveJob(id: number) {
        const job = jobs.find((j) => j.id === id);
        if (job) job.status = "approved";
    }

    function deleteJob(id: number) {
        if (confirm("Bạn có chắc muốn xóa tin tuyển dụng này?")) {
            jobs = jobs.filter((j) => j.id !== id);
        }
    }
</script>

<div class="container mx-auto p-4 max-w-6xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
    </div>

    <!-- Navigation Tabs -->
    <div class="mb-6 flex space-x-2 border-b pb-2">
        <button
            class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors {activeTab ===
            'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
            onclick={() => (activeTab = "users")}
        >
            Quản lý Người dùng
        </button>
        <button
            class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors {activeTab ===
            'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
            onclick={() => (activeTab = "posts")}
        >
            Quản lý Bài đăng
        </button>
        <button
            class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors {activeTab ===
            'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
            onclick={() => (activeTab = "jobs")}
        >
            Quản lý Tuyển dụng
        </button>
    </div>

    <!-- Tab Content -->
    <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
        {#if activeTab === "users"}
            <div
                class="p-4 border-b flex justify-between items-center bg-gray-50"
            >
                <h2 class="text-lg font-semibold text-gray-700">
                    Danh sách người dùng
                </h2>
                <button
                    onclick={() => (showAddUserModal = true)}
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                    + Thêm tài khoản
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-600">
                    <thead
                        class="text-xs text-gray-700 uppercase bg-gray-50 border-b"
                    >
                        <tr>
                            <th class="px-4 py-2">ID</th>
                            <th class="px-4 py-2">Tên (Username)</th>
                            <th class="px-4 py-2">Email</th>
                            <th class="px-4 py-2">Vai trò (Role)</th>
                            <th class="px-4 py-2">Trạng thái</th>
                            <th class="px-4 py-2 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each users as user}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="px-4 py-2 font-medium">{user.id}</td>
                                <td class="px-4 py-2">{user.name}</td>
                                <td class="px-4 py-2">{user.email}</td>
                                <td class="px-4 py-2">
                                    <span
                                        class="px-2 py-0.5 rounded text-xs font-medium uppercase
                                        {user.role === 'admin'
                                            ? 'bg-red-100 text-red-800'
                                            : user.role === 'business'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'}"
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td class="px-4 py-2">
                                    <span
                                        class="px-2 py-0.5 rounded text-xs font-medium {user.status ===
                                        'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}"
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td class="px-4 py-2 text-right space-x-1">
                                    {#if user.role !== "business" && user.role !== "admin"}
                                        <button
                                            onclick={() =>
                                                grantBusiness(user.id)}
                                            class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                            >Cấp Business</button
                                        >
                                    {/if}
                                    <button
                                        onclick={() => toggleBan(user.id)}
                                        class="text-xs px-2 py-1 {user.status ===
                                        'active'
                                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'} rounded"
                                    >
                                        {user.status === "active"
                                            ? "Ban"
                                            : "Unban"}
                                    </button>
                                    <button
                                        onclick={() => deleteUser(user.id)}
                                        class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                        >Xóa</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {#if users.length === 0}
                            <tr>
                                <td
                                    colspan="6"
                                    class="px-4 py-4 text-center text-gray-500"
                                    >Không có dữ liệu</td
                                >
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if activeTab === "posts"}
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-600">
                    <thead
                        class="text-xs text-gray-700 uppercase bg-gray-50 border-b"
                    >
                        <tr>
                            <th class="px-4 py-2">ID</th>
                            <th class="px-4 py-2">Tiêu đề</th>
                            <th class="px-4 py-2">Tác giả</th>
                            <th class="px-4 py-2">Ngày đăng</th>
                            <th class="px-4 py-2 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each posts as post}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="px-4 py-2 font-medium">{post.id}</td>
                                <td class="px-4 py-2">{post.title}</td>
                                <td class="px-4 py-2">{post.author}</td>
                                <td class="px-4 py-2">{post.date}</td>
                                <td class="px-4 py-2 text-right">
                                    <button
                                        onclick={() => deletePost(post.id)}
                                        class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                        >Xóa bài</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {#if posts.length === 0}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-4 py-4 text-center text-gray-500"
                                    >Không có dữ liệu</td
                                >
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/if}

        {#if activeTab === "jobs"}
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-600">
                    <thead
                        class="text-xs text-gray-700 uppercase bg-gray-50 border-b"
                    >
                        <tr>
                            <th class="px-4 py-2">ID</th>
                            <th class="px-4 py-2">Vị trí</th>
                            <th class="px-4 py-2">Công ty</th>
                            <th class="px-4 py-2">Trạng thái</th>
                            <th class="px-4 py-2 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each jobs as job}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="px-4 py-2 font-medium">{job.id}</td>
                                <td class="px-4 py-2">{job.title}</td>
                                <td class="px-4 py-2">{job.company}</td>
                                <td class="px-4 py-2">
                                    <span
                                        class="px-2 py-0.5 rounded text-xs {job.status ===
                                        'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'}"
                                    >
                                        {job.status === "approved"
                                            ? "Đã duyệt"
                                            : "Chờ duyệt"}
                                    </span>
                                </td>
                                <td class="px-4 py-2 text-right space-x-1">
                                    {#if job.status === "pending"}
                                        <button
                                            onclick={() => approveJob(job.id)}
                                            class="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                            >Duyệt</button
                                        >
                                    {/if}
                                    <button
                                        onclick={() => deleteJob(job.id)}
                                        class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                        >Xóa tin</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {#if jobs.length === 0}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-4 py-4 text-center text-gray-500"
                                    >Không có dữ liệu</td
                                >
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Thêm Tài Khoản -->
{#if showAddUserModal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                Thêm tài khoản mới
            </h3>

            <form onsubmit={handleAddUser}>
                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                        for="username">Tên (Username)</label
                    >
                    <input
                        id="username"
                        type="text"
                        required
                        bind:value={newUser.name}
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên người dùng"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                        for="email">Email</label
                    >
                    <input
                        id="email"
                        type="email"
                        required
                        bind:value={newUser.email}
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa chỉ email"
                    />
                </div>

                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                        for="password">Mật khẩu</label
                    >
                    <input
                        id="password"
                        type="password"
                        required
                        bind:value={newUser.password}
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mật khẩu"
                    />
                </div>

                <div class="mb-6">
                    <label
                        class="block text-sm font-medium text-gray-700 mb-1"
                        for="role">Vai trò (Role)</label
                    >
                    <select
                        id="role"
                        bind:value={newUser.role}
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">User (Người dùng)</option>
                        <option value="business">Business (Doanh nghiệp)</option
                        >
                        <option value="admin">Admin (Quản trị viên)</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-2">
                    <button
                        type="button"
                        onclick={() => (showAddUserModal = false)}
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Thêm tài khoản
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
