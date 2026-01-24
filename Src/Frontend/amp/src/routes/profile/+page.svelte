<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let isEditingId = $state(false);
    let isEditingBio = $state(false);
    let editPublicId = $state("");
    let editBio = $state("");
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
        links: [
            { platform: "Facebook", url: "#" },
            { platform: "Github", url: "#" },
        ],
        stats: {
            posts: 0,
            upvotes: 0,
            completion: "0%",
        },
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
                Object.assign(user, userData);
                editPublicId = userData.public_id;
                editBio = userData.bio;
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                localStorage.removeItem("token");
                goto("/login");
            }
        } catch (err) {
            console.error(err);
        }
    });

    async function handleUpdatePublicId() {
        errorMsg = "";
        if (!/^[a-zA-Z0-9]+$/.test(editPublicId)) {
            errorMsg = "ID chỉ được chứa chữ cái và số!";
            return;
        }

        try {
            const res = await api.put("/me/public_id", {
                public_id: editPublicId,
            });
            if (res.public_id) {
                user.public_id = res.public_id;
                isEditingId = false;
                syncUserData();
            } else {
                errorMsg = res.msg || "Không thể cập nhật ID.";
            }
        } catch (err) {
            errorMsg = "Lỗi kết nối server.";
        }
    }

    async function handleUpdateBio() {
        errorMsg = "";
        try {
            const res = await api.put("/me/bio", { bio: editBio });
            if (res.bio !== undefined) {
                user.bio = res.bio;
                isEditingBio = false;
                syncUserData();
            } else {
                errorMsg = res.msg || "Không thể cập nhật Bio.";
            }
        } catch (err) {
            errorMsg = "Lỗi kết nối server.";
        }
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

    function toggleEditId() {
        isEditingId = !isEditingId;
        if (isEditingId) isEditingBio = false;
        if (!isEditingId) errorMsg = "";
    }

    function toggleEditBio() {
        isEditingBio = !isEditingBio;
        if (isEditingBio) isEditingId = false;
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

                <div
                    class="relative z-10 flex flex-col md:flex-row items-center gap-10"
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
                                        : `http://localhost:5000${user.avatar_url}`}
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

                    <div class="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <div
                                class="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2"
                            >
                                <h1 class="text-4xl font-black text-rose-text">
                                    {user.username}
                                </h1>
                                <div class="flex items-center gap-2">
                                    {#if isEditingId}
                                        <div class="flex flex-col gap-1">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    bind:value={editPublicId}
                                                    class="px-3 py-1 text-sm rounded-full bg-white border border-iris w-32 outline-none h-8"
                                                    placeholder="Custom ID..."
                                                />
                                                <button
                                                    onclick={handleUpdatePublicId}
                                                    class="text-iris hover:text-iris-dark"
                                                    aria-label="Cập nhật ID"
                                                    ><i
                                                        class="bx bx-check-circle text-2xl"
                                                    ></i></button
                                                >
                                                <button
                                                    onclick={toggleEditId}
                                                    class="text-love"
                                                    aria-label="Hủy chỉnh sửa"
                                                    ><i
                                                        class="bx bx-x-circle text-2xl"
                                                    ></i></button
                                                >
                                            </div>
                                        </div>
                                    {:else}
                                        <span
                                            class="px-3 py-1 bg-overlay text-rose-text font-bold text-[10px] rounded-full uppercase tracking-widest border border-white"
                                            >@{user.public_id || "N/A"}</span
                                        >
                                        <button
                                            onclick={toggleEditId}
                                            class="text-iris opacity-50 hover:opacity-100 transition-opacity"
                                            title="Đổi ID"
                                            ><i class="bx bx-edit text-lg"
                                            ></i></button
                                        >
                                    {/if}
                                </div>
                            </div>

                            <div class="group relative">
                                {#if isEditingBio}
                                    <div class="flex flex-col gap-2">
                                        <textarea
                                            bind:value={editBio}
                                            class="w-full p-4 rounded-2xl bg-white border border-iris text-sm min-h-[100px] outline-none"
                                            placeholder="Viết giới thiệu về bạn..."
                                        ></textarea>
                                        <div class="flex justify-end gap-2">
                                            <button
                                                onclick={toggleEditBio}
                                                class="px-4 py-2 text-xs font-bold text-muted"
                                                >Hủy</button
                                            >
                                            <button
                                                onclick={handleUpdateBio}
                                                class="px-4 py-2 text-xs font-bold bg-iris text-white rounded-lg"
                                                >Lưu Bio</button
                                            >
                                        </div>
                                    </div>
                                {:else}
                                    <p
                                        class="text-subtle text-lg italic max-w-md leading-relaxed"
                                    >
                                        {user.bio || "Chưa có giới thiệu nào."}
                                        <button
                                            onclick={toggleEditBio}
                                            class="ml-2 text-iris opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Sửa Bio"
                                            ><i class="bx bx-pencil text-sm"
                                            ></i></button
                                        >
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <div
                            class="flex flex-wrap items-center justify-center md:justify-start gap-3"
                        >
                            <button
                                class="px-6 py-3 bg-white text-rose-text font-bold rounded-xl shadow-sm hover:shadow-lg transition-all border border-overlay text-sm"
                                ><i class="bx bx-edit-alt mr-1"></i> Thiết lập</button
                            >
                            <button
                                onclick={logout}
                                class="px-6 py-3 bg-love/10 text-love font-bold rounded-xl shadow-sm hover:bg-love hover:text-white transition-all border border-love/20 text-sm"
                                ><i class="bx bx-log-out-circle mr-1"></i> Đăng xuất</button
                            >
                        </div>
                        {#if errorMsg}
                            <p
                                class="text-xs text-love font-bold animate-pulse"
                            >
                                {errorMsg}
                            </p>
                        {/if}
                    </div>
                </div>
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
        appearance: none;
        -webkit-appearance: none;
    }
    .glass input,
    .glass textarea {
        padding-left: 1rem !important;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.5);
    }
</style>
