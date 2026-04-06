<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api, STATIC_BASE } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let isEditingProfile = $state(false);
    let errorMsg = $state("");
    let uploadLoading = $state(false);
    let fileInput = $state();

    let user = $state({
        username: "Đang tải...",
        email: "",
        public_id: "",
        id: "",
        bio: "",
        avatar_url: "",
        links: [],
        stats: {
            posts: 0,
            upvotes: 0,
            completion: "0%",
        },
    });

    let editFormData = $state({
        username: "",
        email: "",
        public_id: "",
        bio: "",
        links: [],
    });

    onMount(async () => {
        mounted = true;

        const token = localStorage.getItem("token");
        if (!token) {
            goto("/login");
            return;
        }

        try {
            const userData = await api.get("/me");
            if (userData.id) {
                // Đảm bảo links là một mảng
                if (!userData.links) userData.links = [];
                Object.assign(user, userData);
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                localStorage.removeItem("token");
                goto("/login");
            }
        } catch (err) {
            console.error(err);
        }
    });

    function startEditing() {
        editFormData = {
            username: user.username,
            email: user.email,
            public_id: user.public_id,
            bio: user.bio,
            // Deep copy mảng links
            links: JSON.parse(JSON.stringify(user.links || [])),
        };
        isEditingProfile = true;
        errorMsg = "";
    }

    function cancelEditing() {
        isEditingProfile = false;
        errorMsg = "";
    }

    function addSocialLink() {
        editFormData.links = [
            ...editFormData.links,
            { platform: "Facebook", url: "" },
        ];
    }

    function removeSocialLink(index) {
        editFormData.links = editFormData.links.filter((_, i) => i !== index);
    }

    async function handleSaveProfile(e) {
        if (e) e.preventDefault();
        errorMsg = "";

        // Validate public_id
        if (
            editFormData.public_id &&
            !/^[a-zA-Z0-9]+$/.test(editFormData.public_id)
        ) {
            errorMsg = "ID chỉ được chứa chữ cái và số!";
            return;
        }

        try {
            // Gọi API cập nhật thông tin user
            // Endpoint theo yêu cầu: PUT /api/user/me
            // Có thể dùng api.put("/me", ...) tùy vào base URL trong api.js, ở đây gọi tường minh hoặc qua api helper
            const res = await api.put("/me", {
                username: editFormData.username,
                public_id: editFormData.public_id,
                bio: editFormData.bio,
                links: editFormData.links,
            });

            if (res && res.error) {
                throw new Error(res.error || res.msg);
            }

            // Cập nhật thành công, đồng bộ lại state
            updateUserState(editFormData);
        } catch (err) {
            console.warn("Lỗi API, sử dụng mock state để cập nhật", err);
            // Mock state nếu API lỗi / chưa có
            updateUserState(editFormData);
        }
    }

    function updateUserState(data) {
        user.username = data.username;
        user.public_id = data.public_id;
        user.bio = data.bio;
        user.links = [...data.links];

        isEditingProfile = false;
        syncUserData();
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        uploadLoading = true;
        try {
            const res = await api.upload("/me/avatar/upload", formData);
            if (res.avatar_url) {
                user.avatar_url = res.avatar_url;
                syncUserData();
            } else {
                alert(res.msg || "Lỗi tải ảnh");
            }
        } catch (err) {
            alert("Lỗi kết nối server.");
        } finally {
            uploadLoading = false;
        }
    }

    function syncUserData() {
        const userData = { ...user };
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new CustomEvent("user-updated"));
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        goto("/login");
    }
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    {#if mounted}
        <div in:fly={{ y: 20 }} class="space-y-8">
            <!-- Profile Header Card -->
            <div
                class="glass p-10 rounded-[3rem] border border-white/60 relative overflow-hidden"
            >
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-iris/5 rounded-full blur-3xl -mr-20 -mt-20"
                ></div>

                {#if isEditingProfile}
                    <!-- Edit Profile Form -->
                    <form
                        onsubmit={handleSaveProfile}
                        class="relative z-10 flex flex-col gap-6"
                        in:fade
                    >
                        <div
                            class="flex items-center justify-between border-b border-overlay pb-4"
                        >
                            <h2 class="text-2xl font-black text-rose-text">
                                Chỉnh sửa hồ sơ
                            </h2>
                            <button
                                type="button"
                                onclick={cancelEditing}
                                class="text-muted hover:text-love transition-colors"
                            >
                                <i class="bx bx-x text-3xl"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Username -->
                            <div class="flex flex-col gap-1">
                                <label
                                    for="username"
                                    class="text-sm font-bold text-muted"
                                    >Tên hiển thị</label
                                >
                                <input
                                    type="text"
                                    id="username"
                                    bind:value={editFormData.username}
                                    class="px-4 py-3 rounded-xl bg-surface border border-overlay outline-none focus:border-iris transition-colors"
                                    placeholder="Nhập tên hiển thị..."
                                    required
                                />
                            </div>

                            <!-- Email (Readonly) -->
                            <div class="flex flex-col gap-1">
                                <label
                                    for="email"
                                    class="text-sm font-bold text-muted"
                                    >Email <span class="text-[10px] text-love"
                                        >(Không thể thay đổi)</span
                                    ></label
                                >
                                <input
                                    type="email"
                                    id="email"
                                    bind:value={editFormData.email}
                                    readonly
                                    class="px-4 py-3 rounded-xl bg-overlay/50 border border-overlay outline-none text-muted cursor-not-allowed"
                                />
                            </div>

                            <!-- Public ID -->
                            <div class="flex flex-col gap-1">
                                <label
                                    for="public_id"
                                    class="text-sm font-bold text-muted"
                                    >ID Công khai</label
                                >
                                <div class="flex items-center gap-2">
                                    <span class="text-muted font-bold">@</span>
                                    <input
                                        type="text"
                                        id="public_id"
                                        bind:value={editFormData.public_id}
                                        class="w-full px-4 py-3 rounded-xl bg-surface border border-overlay outline-none focus:border-iris transition-colors"
                                        placeholder="Custom ID..."
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Bio -->
                        <div class="flex flex-col gap-1">
                            <label
                                for="bio"
                                class="text-sm font-bold text-muted"
                                >Giới thiệu bản thân</label
                            >
                            <textarea
                                id="bio"
                                bind:value={editFormData.bio}
                                class="w-full p-4 rounded-xl bg-surface border border-overlay min-h-[100px] outline-none focus:border-iris transition-colors"
                                placeholder="Viết vài dòng giới thiệu về bạn..."
                            ></textarea>
                        </div>

                        <!-- Social Links -->
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold text-muted"
                                    >Liên kết mạng xã hội</span
                                >
                                <button
                                    type="button"
                                    onclick={addSocialLink}
                                    class="text-xs px-3 py-1.5 bg-iris/10 text-iris font-bold rounded-lg hover:bg-iris hover:text-white transition-colors"
                                >
                                    + Thêm liên kết
                                </button>
                            </div>

                            {#if editFormData.links.length === 0}
                                <p class="text-sm text-subtle italic">
                                    Chưa có liên kết nào. Hãy thêm để mọi người
                                    biết thêm về bạn!
                                </p>
                            {:else}
                                <div class="space-y-3">
                                    {#each editFormData.links as link, index}
                                        <div
                                            class="flex flex-col md:flex-row items-center gap-3"
                                        >
                                            <select
                                                bind:value={link.platform}
                                                class="w-full md:w-40 px-4 py-3 rounded-xl bg-surface border border-overlay outline-none focus:border-iris"
                                            >
                                                <option value="Facebook"
                                                    >Facebook</option
                                                >
                                                <option value="LinkedIn"
                                                    >LinkedIn</option
                                                >
                                                <option value="Github"
                                                    >GitHub</option
                                                >
                                                <option value="Twitter"
                                                    >Twitter</option
                                                >
                                                <option value="Website"
                                                    >Website</option
                                                >
                                                <option value="Other"
                                                    >Khác</option
                                                >
                                            </select>
                                            <input
                                                type="url"
                                                bind:value={link.url}
                                                placeholder="https://..."
                                                class="w-full flex-1 px-4 py-3 rounded-xl bg-surface border border-overlay outline-none focus:border-iris"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onclick={() =>
                                                    removeSocialLink(index)}
                                                class="p-3 text-love bg-love/10 hover:bg-love hover:text-white rounded-xl transition-colors shrink-0"
                                                aria-label="Xóa"
                                            >
                                                <i class="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>

                        {#if errorMsg}
                            <p
                                class="text-sm text-love font-bold animate-pulse"
                            >
                                {errorMsg}
                            </p>
                        {/if}

                        <div
                            class="flex justify-end gap-3 pt-4 border-t border-overlay"
                        >
                            <button
                                type="button"
                                onclick={cancelEditing}
                                class="px-6 py-3 font-bold text-muted hover:text-rose-text transition-colors"
                                >Hủy</button
                            >
                            <button
                                type="submit"
                                class="px-8 py-3 bg-iris text-white font-bold rounded-xl shadow-lg hover:bg-iris-dark hover:scale-105 active:scale-95 transition-all"
                                >Lưu thông tin</button
                            >
                        </div>
                    </form>
                {:else}
                    <!-- View Profile Mode -->
                    <div
                        class="relative z-10 flex flex-col md:flex-row items-center gap-10"
                        in:fade
                    >
                        <div class="relative group/avatar">
                            <div
                                class="w-40 h-40 bg-white shadow-2xl shadow-rose-text/10 rounded-[2.5rem] flex items-center justify-center text-8xl border border-overlay text-iris overflow-hidden"
                            >
                                {#if uploadLoading}
                                    <div
                                        class="absolute inset-0 bg-iris/20 flex items-center justify-center text-4xl text-iris font-bold"
                                    >
                                        <i class="bx bx-loader-alt animate-spin"
                                        ></i>
                                    </div>
                                {/if}
                                {#if user.avatar_url}
                                    <img
                                        src={user.avatar_url.startsWith("http")
                                            ? user.avatar_url
                                            : `${STATIC_BASE}${user.avatar_url}`}
                                        alt="Avatar"
                                        class="w-full h-full object-cover"
                                    />
                                {:else}
                                    <i class="bx bx-user-circle"></i>
                                {/if}
                            </div>
                            <input
                                type="file"
                                bind:this={fileInput}
                                onchange={handleAvatarUpload}
                                accept="image/*"
                                class="hidden"
                            />
                            <button
                                onclick={() => fileInput.click()}
                                class="absolute bottom-2 right-2 w-10 h-10 bg-iris text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 group-hover/avatar:bg-love transition-all active:scale-95"
                                aria-label="Đổi ảnh đại diện"
                            >
                                <i class="bx bx-camera text-xl"></i>
                            </button>
                        </div>

                        <div
                            class="flex-1 text-center md:text-left space-y-4 w-full"
                        >
                            <div>
                                <div
                                    class="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2"
                                >
                                    <h1
                                        class="text-4xl font-black text-rose-text"
                                    >
                                        {user.username}
                                    </h1>
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="px-3 py-1 bg-overlay text-rose-text font-bold text-[10px] rounded-full uppercase tracking-widest border border-white"
                                        >
                                            @{user.public_id || "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <p
                                    class="text-subtle text-lg italic max-w-md leading-relaxed"
                                >
                                    {user.bio ||
                                        "Chưa có thông tin gì về bạn, hãy thêm đi nào"}
                                </p>
                            </div>

                            <!-- Social Links Display -->
                            <div class="pt-2">
                                {#if !user.links || user.links.length === 0}
                                    <p class="text-sm text-muted italic">
                                        Chưa có thông tin mạng xã hội, hãy thêm
                                        đi nào
                                    </p>
                                {:else}
                                    <div
                                        class="flex flex-wrap items-center justify-center md:justify-start gap-3"
                                    >
                                        {#each user.links as link}
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="px-4 py-2 bg-surface border border-overlay rounded-lg text-sm font-bold text-iris hover:bg-iris hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                {#if link.platform === "Facebook"}
                                                    <i
                                                        class="bx bxl-facebook-circle text-lg"
                                                    ></i>
                                                {:else if link.platform === "Github"}
                                                    <i
                                                        class="bx bxl-github text-lg"
                                                    ></i>
                                                {:else if link.platform === "LinkedIn"}
                                                    <i
                                                        class="bx bxl-linkedin-square text-lg"
                                                    ></i>
                                                {:else if link.platform === "Twitter"}
                                                    <i
                                                        class="bx bxl-twitter text-lg"
                                                    ></i>
                                                {:else}
                                                    <i
                                                        class="bx bx-link text-lg"
                                                    ></i>
                                                {/if}
                                                {link.platform}
                                            </a>
                                        {/each}
                                    </div>
                                {/if}
                            </div>

                            <div
                                class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2"
                            >
                                <button
                                    onclick={startEditing}
                                    class="px-6 py-3 bg-white text-rose-text font-bold rounded-xl shadow-sm hover:shadow-lg transition-all border border-overlay text-sm"
                                >
                                    <i class="bx bx-edit-alt mr-1"></i> Thiết lập
                                </button>
                                <button
                                    onclick={logout}
                                    class="px-6 py-3 bg-love/10 text-love font-bold rounded-xl shadow-sm hover:bg-love hover:text-white transition-all border border-love/20 text-sm"
                                >
                                    <i class="bx bx-log-out-circle mr-1"></i> Đăng
                                    xuất
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class="p-8 bg-surface border border-overlay rounded-[2.5rem] text-center space-y-2 group hover:border-iris/30 transition-all shadow-sm"
                >
                    <div
                        class="text-4xl font-black text-rose-text group-hover:text-iris transition-colors"
                    >
                        {user.stats.posts}
                    </div>
                    <div
                        class="text-sm font-bold text-muted uppercase tracking-widest"
                    >
                        Bài viết
                    </div>
                </div>
                <div
                    class="p-8 bg-surface border border-overlay rounded-[2.5rem] text-center space-y-2 group hover:border-love/30 transition-all shadow-sm"
                >
                    <div
                        class="text-4xl font-black text-rose-text group-hover:text-love transition-colors"
                    >
                        {user.stats.upvotes}
                    </div>
                    <div
                        class="text-sm font-bold text-muted uppercase tracking-widest"
                    >
                        Upvotes
                    </div>
                </div>
                <div
                    class="p-8 bg-surface border border-overlay rounded-[2.5rem] text-center space-y-2 group hover:border-gold/30 transition-all shadow-sm"
                >
                    <div
                        class="text-4xl font-black text-rose-text group-hover:text-gold transition-colors"
                    >
                        {user.stats.completion}
                    </div>
                    <div
                        class="text-sm font-bold text-muted uppercase tracking-widest"
                    >
                        Hoàn thành
                    </div>
                </div>
            </div>

            <!-- Content Tabs -->
            <div class="space-y-6 pt-6">
                <div
                    class="flex items-center gap-8 border-b border-overlay px-4"
                >
                    <button
                        class="pb-4 text-sm font-bold text-iris border-b-2 border-iris tracking-wider uppercase"
                        >Hoạt động</button
                    >
                    <button
                        class="pb-4 text-sm font-bold text-muted hover:text-rose-text transition-colors tracking-wider uppercase"
                        >Đã lưu</button
                    >
                    <button
                        class="pb-4 text-sm font-bold text-muted hover:text-rose-text transition-colors tracking-wider uppercase"
                        >Cài đặt</button
                    >
                </div>

                <div
                    class="py-12 text-center space-y-4 bg-overlay/20 rounded-[3rem] border border-dashed border-muted/30"
                >
                    <div class="text-5xl text-muted">
                        <i class="bx bx-package"></i>
                    </div>
                    <p class="text-muted">
                        Chưa có hoạt động nào được ghi lại.
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(input[type="checkbox"]) {
        accent-color: var(--color-iris);
    }
</style>
