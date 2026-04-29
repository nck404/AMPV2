<script>
    import { onMount } from "svelte";
    let innerWidth = $state(0);
    import { page } from "$app/state";
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { api, STATIC_BASE } from "$lib/api.js";

    const navItems = [
        { name: "Home", path: "/", icon: "bx-compass" },
        { name: "Học tập", path: "/sign-language", icon: "bx-book-open" },
        { name: "Diễn đàn", path: "/forum", icon: "bx-message-square-detail" },
        { name: "Tuyển dụng", path: "/recruitment", icon: "bx-briefcase" },
        { name: "Trò chuyện", path: "/chat", icon: "bx-chat" },
    ];

    const moreItems = [
        { name: "Diễn đàn", path: "/forum", icon: "bx-message-square-detail" },
        { name: "Tuyển dụng", path: "/recruitment", icon: "bx-briefcase" },
        { name: "Bạn bè", path: "/people", icon: "bx-user-plus" },
        { name: "Học tập", path: "/sign-language", icon: "bx-book-open" },
        { name: "Tạo CV", path: "/cv", icon: "bx-id-card" },
        { name: "Docs", path: "/docs", icon: "bx-book-content" },
        {
            name: "Hỗ trợ",
            path: "/tools/accessibility",
            icon: "bx-accessibility",
        },
    ];

    let scrolled = $state(false);
    let currentUser = $state(null);
    let isToolsDropdownOpen = $state(false);
    let isNotificationsOpen = $state(false);

    let isMobileMenuOpen = $derived(isToolsDropdownOpen || isNotificationsOpen);

    let notifications = $state([]);
    let unreadChatCount = $state(0);

    async function fetchUnreadChatCount() {
        if (!currentUser) return;
        try {
            const data = await api.get("/chat/unread-count");
            unreadChatCount = data.unread_count || 0;
        } catch (e) {
            console.error("Failed to fetch unread chat count", e);
        }
    }

    async function fetchNotifications() {
        if (!currentUser) return;
        try {
            const data = await api.get("/notifications");
            notifications = data.notifications || [];
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    onMount(() => {
        const updateUserData = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                currentUser = JSON.parse(userData);
                fetchNotifications();
                fetchUnreadChatCount();
            } else {
                currentUser = null;
            }
        };

        updateUserData();

        window.addEventListener("user-updated", updateUserData);
        window.addEventListener("chat-updated", fetchUnreadChatCount);

        const handleScroll = () => {
            scrolled = window.scrollY > 20;
        };
        window.addEventListener("scroll", handleScroll);

        const handleClickOutside = (e) => {
            const toolsDropdown = document.getElementById(
                "tools-dropdown-container",
            );
            const toolsDropdownMobile = document.getElementById(
                "tools-dropdown-container-mobile",
            );
            const notifDropdown = document.getElementById(
                "notif-dropdown-container",
            );

            if (
                toolsDropdown &&
                !toolsDropdown.contains(e.target) &&
                toolsDropdownMobile &&
                !toolsDropdownMobile.contains(e.target) &&
                notifDropdown &&
                !notifDropdown.contains(e.target)
            ) {
                isToolsDropdownOpen = false;
                isNotificationsOpen = false;
            }
        };
        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("user-updated", updateUserData);
            window.removeEventListener("chat-updated", fetchUnreadChatCount);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    });
</script>

<svelte:window bind:innerWidth />

{#if innerWidth === 0 || innerWidth >= 1024}
    <div
        class="top-nav-container fixed top-6 left-0 right-0 z-50 justify-center px-6 pointer-events-none hidden lg:flex {page
            .url.pathname === '/chat'
            ? 'is-chat'
            : ''}"
    >
        <nav
            class="dynamic-island pointer-events-auto flex items-center gap-2 p-1.5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            class:scrolled
        >
            <a
                href="/"
                class="logo-circle flex items-center justify-center bg-iris text-white rounded-full transition-all duration-500 w-10 h-10 shadow-lg shadow-iris/20"
                title="Trang chủ AMP"
            >
                <i class="bx bx-atom text-xl"></i>
            </a>

            <div
                class="nav-links flex items-center gap-1 transition-all duration-500"
            >
                {#each navItems as item}
                    {@const isActive = page.url.pathname === item.path}
                    <a
                        href={item.path}
                        class="nav-item group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                        class:active={isActive}
                    >
                        <i
                            class="bx {item.icon} text-xl transition-transform duration-300 group-hover:scale-110"
                        ></i>
                        <span class="text-sm font-bold whitespace-nowrap label"
                            >{item.name}</span
                        >
                        {#if isActive}
                            <div
                                class="absolute inset-0 bg-iris/10 rounded-full -z-10"
                            ></div>
                        {/if}
                        {#if item.path === "/chat" && unreadChatCount > 0}
                            <span
                                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-love text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse"
                            >
                                {unreadChatCount > 99 ? "99+" : unreadChatCount}
                            </span>
                        {/if}
                    </a>
                {/each}

                <div id="tools-dropdown-container" class="relative">
                    <button
                        onclick={() =>
                            (isToolsDropdownOpen = !isToolsDropdownOpen)}
                        class="nav-item group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 {isToolsDropdownOpen
                            ? 'text-iris bg-iris/5'
                            : ''}"
                    >
                        <i
                            class="bx bx-grid-alt text-xl transition-transform duration-300 group-hover:rotate-90"
                        ></i>
                        <div
                            class="flex items-center gap-1 label overflow-hidden whitespace-nowrap transition-all duration-500"
                        >
                            <span class="text-sm font-bold">Công cụ</span>
                            <i
                                class="bx bx-chevron-down text-lg transition-transform duration-300 {isToolsDropdownOpen
                                    ? 'rotate-180'
                                    : ''}"
                            ></i>
                        </div>
                    </button>

                    {#if isToolsDropdownOpen}
                        <div
                            class="absolute top-full left-0 mt-3 w-48 glass border border-iris/20 rounded-2xl overflow-hidden shadow-2xl py-2 z-[60]"
                            in:fly={{ y: 10, duration: 300, easing: cubicOut }}
                        >
                            {#each moreItems as item}
                                {@const isActive =
                                    page.url.pathname === item.path}
                                <a
                                    href={item.path}
                                    class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all {isActive
                                        ? 'text-iris bg-iris/5'
                                        : 'text-subtle hover:bg-iris/5 hover:text-iris'}"
                                    onclick={() =>
                                        (isToolsDropdownOpen = false)}
                                >
                                    <i class="bx {item.icon} text-xl"></i>
                                    {item.name}
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="h-6 w-px bg-overlay/50 mx-1"></div>

            <div class="flex items-center gap-1">
                {#if currentUser}
                    <div id="notif-dropdown-container" class="relative">
                        <button
                            onclick={() => {
                                isNotificationsOpen = !isNotificationsOpen;
                                if (isNotificationsOpen) fetchNotifications();
                            }}
                            class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all relative {isNotificationsOpen
                                ? 'text-iris bg-iris/5'
                                : ''}"
                            aria-label="Thông báo"
                            title="Thông báo hệ thống"
                        >
                            <i class="bx bx-bell text-2xl"></i>
                            {#if notifications.some((n) => !n.is_read)}
                                <span
                                    class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-text rounded-full border-2 border-white"
                                ></span>
                            {/if}
                        </button>

                        {#if isNotificationsOpen}
                            <div
                                class="absolute top-full right-0 mt-3 w-80 glass border border-iris/20 rounded-[2rem] overflow-hidden shadow-2xl z-[60]"
                                in:fly={{
                                    y: 15,
                                    duration: 400,
                                    easing: cubicOut,
                                }}
                            >
                                <div
                                    class="p-4 border-b border-white/10 bg-iris/5"
                                >
                                    <h3
                                        class="text-sm font-black text-rose-text uppercase tracking-widest"
                                    >
                                        Thông báo từ hệ thống
                                    </h3>
                                </div>
                                <div
                                    class="max-h-[350px] overflow-y-auto custom-scrollbar"
                                >
                                    {#each notifications as notif}
                                        <div
                                            class="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default"
                                        >
                                            <div class="flex gap-3">
                                                <div
                                                    class="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0
                                                {notif.type === 'admin'
                                                        ? 'bg-iris/10 text-iris'
                                                        : notif.type ===
                                                            'warning'
                                                          ? 'bg-love/10 text-love'
                                                          : notif.type ===
                                                              'success'
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-subtle/10 text-subtle'}"
                                                >
                                                    <i
                                                        class="bx {notif.type ===
                                                        'admin'
                                                            ? 'bx-shield-quarter'
                                                            : 'bx-info-circle'}"
                                                    ></i>
                                                </div>
                                                <div class="min-w-0">
                                                    <p
                                                        class="text-sm font-bold text-rose-text truncate"
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    <p
                                                        class="text-xs text-subtle mt-1 leading-relaxed"
                                                    >
                                                        {notif.content}
                                                    </p>
                                                    <p
                                                        class="text-[9px] font-black text-subtle/50 mt-2 uppercase tracking-tighter"
                                                    >
                                                        {new Date(
                                                            notif.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    {:else}
                                        <div class="p-8 text-center opacity-50">
                                            <i
                                                class="bx bx-bell-off text-4xl mb-2"
                                            ></i>
                                            <p
                                                class="text-xs font-bold uppercase tracking-widest"
                                            >
                                                Không có thông báo mới
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>

                    {#if currentUser.is_admin}
                        <a
                            href="/admin"
                            class="nav-item p-2 rounded-full hover:bg-gold/10 text-gold transition-all"
                            title="Quản trị viên"
                        >
                            <i class="bx bx-shield-quarter text-2xl"></i>
                        </a>
                    {/if}

                    <a
                        href="/settings"
                        class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
                        title="Cài đặt"
                    >
                        <i class="bx bx-cog text-2xl"></i>
                    </a>

                    <a
                        href="/profile"
                        class="nav-item flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full hover:bg-iris/10 transition-all border border-transparent hover:border-iris/20"
                    >
                        <div
                            class="w-7 h-7 bg-iris/20 text-iris rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                        >
                            {#if currentUser.avatar_url}
                                <img
                                    src={currentUser.avatar_url.startsWith(
                                        "http",
                                    )
                                        ? currentUser.avatar_url
                                        : `${STATIC_BASE}${currentUser.avatar_url}`}
                                    alt=""
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                {currentUser.username[0].toUpperCase()}
                            {/if}
                        </div>
                        <span
                            class="text-xs font-bold text-rose-text hidden lg:block"
                            >@{currentUser.public_id}</span
                        >
                    </a>
                {:else}
                    <a
                        href="/profile"
                        class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
                        aria-label="Hồ sơ"
                    >
                        <i class="bx bx-user-circle text-2xl"></i>
                    </a>
                    <a
                        href="/login"
                        class="login-btn ml-1 px-5 py-2.5 bg-rose-text text-white rounded-full text-sm font-bold hover:bg-iris hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                        Bắt đầu
                    </a>
                {/if}
            </div>
        </nav>
    </div>
{/if}

{#if isMobileMenuOpen}
    <div
        class="fixed inset-0 bg-rose-text/20 backdrop-blur-md z-[90] lg:hidden"
        onclick={() => {
            isToolsDropdownOpen = false;
            isNotificationsOpen = false;
        }}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                isToolsDropdownOpen = false;
                isNotificationsOpen = false;
            }
        }}
        role="button"
        tabindex="0"
        aria-label="Close menu"
        in:fade={{ duration: 400 }}
        out:fade={{ duration: 300 }}
    ></div>
{/if}

<div
    class="lg:hidden fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
>
    <nav
        class="glass pointer-events-auto flex items-center justify-around w-full px-1 pt-3 pb-6 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(87,82,121,0.2)] border-t border-white/60 relative"
    >
        {#each navItems.filter((i) => i.path === "/" || i.path === "/chat") as item}
            {@const isActive = page.url.pathname === item.path}
            <a
                href={item.path}
                class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl transition-all active:scale-90 relative {isActive
                    ? 'text-iris'
                    : 'text-muted'}"
            >
                <div class="relative">
                    <i
                        class="bx {item.icon} text-2xl transition-transform {isActive
                            ? 'scale-110 -translate-y-1'
                            : ''}"
                    ></i>
                    {#if isActive}
                        <div
                            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-iris rounded-full"
                            in:fade
                        ></div>
                    {/if}
                </div>
                <span
                    class="text-[9px] font-black uppercase tracking-tighter transition-all {isActive
                        ? 'opacity-100'
                        : 'opacity-0 h-0 w-0 overflow-hidden'}"
                >
                    {item.name}
                </span>
                {#if item.path === "/chat" && unreadChatCount > 0}
                    <span
                        class="absolute top-1 right-2 min-w-[16px] h-[16px] px-1 bg-love text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                        {unreadChatCount > 99 ? "99+" : unreadChatCount}
                    </span>
                {/if}
            </a>
        {/each}

        {#if currentUser}
            <div id="notif-dropdown-container-mobile" class="relative">
                <button
                    onclick={() => {
                        isNotificationsOpen = !isNotificationsOpen;
                        isToolsDropdownOpen = false;
                        if (isNotificationsOpen) fetchNotifications();
                    }}
                    class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl transition-all relative {isNotificationsOpen
                        ? 'text-iris animate-bounce-short'
                        : 'text-muted'}"
                    aria-label="Thông báo"
                >
                    <div class="relative">
                        <i class="bx bx-bell text-2xl"></i>
                        {#if notifications.some((n) => !n.is_read)}
                            <span
                                class="absolute top-0 right-0 w-2 h-2 bg-rose-text rounded-full border-2 border-white"
                            ></span>
                        {/if}
                    </div>
                    <span
                        class="text-[9px] font-black uppercase tracking-tighter"
                        >Thông báo</span
                    >
                </button>

                {#if isNotificationsOpen}
                    <div
                        class="fixed bottom-24 left-4 right-4 glass border border-iris/20 rounded-[2.5rem] overflow-hidden shadow-2xl z-[110]"
                        in:fly={{ y: 20, duration: 400, easing: cubicOut }}
                        out:fly={{ y: 20, duration: 300, easing: cubicOut }}
                    >
                        <div
                            class="p-5 border-b border-white/10 bg-iris/5 flex items-center justify-between"
                        >
                            <h3
                                class="text-xs font-black text-rose-text uppercase tracking-widest"
                            >
                                Thông báo hệ thống
                            </h3>
                            <button
                                onclick={() => (isNotificationsOpen = false)}
                                class="text-muted"
                                aria-label="Đóng thông báo"
                                ><i class="bx bx-x text-xl"></i></button
                            >
                        </div>
                        <div
                            class="max-h-[50vh] overflow-y-auto custom-scrollbar"
                        >
                            {#each notifications as notif}
                                <div
                                    class="p-5 border-b border-white/5 hover:bg-iris/5 transition-colors"
                                >
                                    <div class="flex gap-4">
                                        <div
                                            class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0
                                            {notif.type === 'admin'
                                                ? 'bg-iris/10 text-iris'
                                                : notif.type === 'warning'
                                                  ? 'bg-love/10 text-love'
                                                  : notif.type === 'success'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-subtle/10 text-subtle'}"
                                        >
                                            <i
                                                class="bx {notif.type ===
                                                'admin'
                                                    ? 'bx-shield-quarter'
                                                    : 'bx-info-circle'}"
                                            ></i>
                                        </div>
                                        <div class="min-w-0">
                                            <p
                                                class="text-sm font-black text-rose-text truncate"
                                            >
                                                {notif.title}
                                            </p>
                                            <p
                                                class="text-xs text-subtle mt-1.5 leading-relaxed"
                                            >
                                                {notif.content}
                                            </p>
                                            <p
                                                class="text-[9px] font-black text-subtle/40 mt-2.5 uppercase tracking-wider"
                                            >
                                                {new Date(
                                                    notif.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            {:else}
                                <div class="p-12 text-center opacity-40">
                                    <i class="bx bx-bell-off text-5xl mb-3"></i>
                                    <p
                                        class="text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Hộp thư trống
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

        <div id="tools-dropdown-container-mobile" class="relative">
            <button
                onclick={() => {
                    isToolsDropdownOpen = !isToolsDropdownOpen;
                    isNotificationsOpen = false;
                }}
                class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl transition-all {isToolsDropdownOpen
                    ? 'text-iris animate-bounce-short'
                    : 'text-muted'}"
                aria-label="Công cụ"
            >
                <i class="bx bx-grid-alt text-2xl"></i>
                <span class="text-[9px] font-black uppercase tracking-tighter"
                    >Công cụ</span
                >
            </button>

            {#if isToolsDropdownOpen}
                <div
                    class="fixed bottom-24 left-4 right-4 glass border border-iris/20 rounded-[2.5rem] overflow-hidden shadow-2xl py-3 z-[110]"
                    in:fly={{ y: 20, duration: 400, easing: cubicOut }}
                    out:fly={{ y: 20, duration: 300, easing: cubicOut }}
                >
                    <div class="px-6 py-4 border-b border-white/10 mb-2">
                        <h3
                            class="text-xs font-black text-rose-text uppercase tracking-widest text-center"
                        >
                            Tiện ích AMP
                        </h3>
                    </div>
                    <div class="grid grid-cols-2 gap-2 px-3">
                        {#each moreItems as item}
                            {@const isActive = page.url.pathname === item.path}
                            <a
                                href={item.path}
                                class="flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold transition-all {isActive
                                    ? 'text-iris bg-iris/10'
                                    : 'text-subtle hover:bg-iris/5 hover:text-iris'}"
                                onclick={() => (isToolsDropdownOpen = false)}
                            >
                                <i class="bx {item.icon} text-xl"></i>
                                {item.name}
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        {#if currentUser}
            <a
                href="/profile"
                class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl transition-all relative {page
                    .url.pathname === '/profile'
                    ? 'text-iris'
                    : 'text-muted'}"
            >
                <div
                    class="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white/50 {page
                        .url.pathname === '/profile'
                        ? 'ring-2 ring-iris/30'
                        : ''}"
                >
                    {#if currentUser.avatar_url}
                        <img
                            src={currentUser.avatar_url.startsWith("http")
                                ? currentUser.avatar_url
                                : `${STATIC_BASE}${currentUser.avatar_url}`}
                            alt=""
                            class="w-full h-full object-cover"
                        />
                    {:else}
                        <div
                            class="w-full h-full flex items-center justify-center text-[10px] font-black text-iris"
                        >
                            {currentUser.username[0].toUpperCase()}
                        </div>
                    {/if}
                </div>
                <span class="text-[9px] font-black uppercase tracking-tighter"
                    >Hồ sơ</span
                >
            </a>
        {:else}
            <a
                href="/login"
                class="flex flex-col items-center gap-1 px-2.5 py-2 text-muted"
            >
                <i class="bx bx-log-in-circle text-2xl"></i>
                <span class="text-[9px] font-black uppercase tracking-tighter"
                    >Login</span
                >
            </a>
        {/if}
    </nav>
</div>

<style>
    .dynamic-island {
        background: rgba(255, 250, 243, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(215, 130, 126, 0.2);
        border-radius: 999px;
        box-shadow:
            0 4px 6px -1px rgba(87, 82, 121, 0.05),
            0 10px 30px -5px rgba(87, 82, 121, 0.1);
        width: auto;
        max-width: fit-content;
    }

    .dynamic-island.scrolled {
        transform: translateY(-5px) scale(0.98);
        background: rgba(255, 250, 243, 0.95);
        border-color: rgba(144, 122, 169, 0.3);
        box-shadow: 0 20px 40px -10px rgba(87, 82, 121, 0.15);
    }

    .nav-item {
        color: var(--color-subtle);
        text-decoration: none;
    }

    .nav-item:hover,
    .nav-item.active {
        color: var(--color-iris);
    }

    /* Label animations */
    .nav-links .label {
        max-width: 0;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        overflow: hidden;
    }

    .nav-item:hover .label,
    .nav-item.active .label {
        max-width: 150px;
        opacity: 1;
        margin-left: 4px;
    }

    /* Hide labels on mobile to save space */
    @media (max-width: 1023px) {
        .nav-links .label {
            display: none;
        }
        .nav-item:hover .label,
        .nav-item.active .label {
            display: none;
        }
    }

    .logo-circle:hover {
        transform: rotate(360deg);
        background: var(--color-love);
    }
</style>
