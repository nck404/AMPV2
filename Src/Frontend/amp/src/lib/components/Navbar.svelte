<script>
    import { onMount } from "svelte";
    import { page } from "$app/state";

    const navItems = [
        { name: "Home", path: "/", icon: "bx-compass" },
        { name: "Diễn đàn", path: "/forum", icon: "bx-message-square-detail" },
        { name: "Tuyển dụng", path: "/recruitment", icon: "bx-briefcase" },
        { name: "Trò chuyện", path: "/chat", icon: "bx-chat" },
        { name: "Học tập", path: "/sign-language", icon: "bx-book-open" },
        { name: "Docs", path: "/docs", icon: "bx-book-content" },
    ];

    let scrolled = $state(false);
    let currentUser = $state(null);

    onMount(() => {
        const updateUserData = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                currentUser = JSON.parse(userData);
            } else {
                currentUser = null;
            }
        };

        updateUserData();

        window.addEventListener("user-updated", updateUserData);

        const handleScroll = () => {
            scrolled = window.scrollY > 20;
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("user-updated", updateUserData);
        };
    });
</script>

<!-- Desktop: Top Dynamic Island -->
<div
    class="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center px-6 pointer-events-none"
>
    <nav
        class="dynamic-island pointer-events-auto flex items-center gap-2 p-1.5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
        class:scrolled
    >
        <!-- Logo section -->
        <a
            href="/"
            class="logo-circle flex items-center justify-center bg-iris text-white rounded-full transition-all duration-500 w-10 h-10 shadow-lg shadow-iris/20"
            title="Trang chủ AMP"
        >
            <i class="bx bx-atom text-xl"></i>
        </a>

        <div
            class="nav-links flex items-center gap-1 overflow-hidden transition-all duration-500"
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
                    <span class="text-sm font-bold whitespace-nowrap label">
                        {item.name}
                    </span>
                    {#if isActive}
                        <div
                            class="absolute inset-0 bg-iris/10 rounded-full -z-10"
                        ></div>
                    {/if}
                </a>
            {/each}
        </div>

        <div class="h-6 w-px bg-overlay/50 mx-1"></div>

        <!-- Action icons -->
        <div class="flex items-center gap-1">
            {#if currentUser}
                <a
                    href="#"
                    class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all relative"
                    aria-label="Thông báo hệ thống"
                    title="Thông báo hệ thống"
                >
                    <i class="bx bx-bell text-2xl"></i>
                    <span
                        class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-text rounded-full"
                    ></span>
                </a>
                <a
                    href="/chat"
                    class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all relative hidden md:flex"
                    aria-label="Chat cộng đồng"
                    title="Chat cộng đồng"
                >
                    <i class="bx bx-message-square-dots text-2xl"></i>
                </a>
                {#if currentUser.is_admin}
                    <a
                        href="/admin"
                        class="nav-item p-2 rounded-full hover:bg-gold/10 text-gold transition-all"
                        title="Bảng điều trị (Admin)"
                        aria-label="Admin Dashboard"
                    >
                        <i class="bx bx-shield-quarter text-2xl"></i>
                    </a>
                {/if}
                <a
                    href="/settings"
                    class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
                    aria-label="Cài đặt"
                    title="Cài đặt"
                >
                    <i class="bx bx-cog text-2xl"></i>
                </a>
                <a
                    href="/profile"
                    class="nav-item flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full hover:bg-iris/10 transition-all border border-transparent hover:border-iris/20"
                    aria-label="Hồ sơ cá nhân"
                >
                    <div
                        class="w-7 h-7 bg-iris/20 text-iris rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                    >
                        {#if currentUser.avatar_url}
                            <img
                                src={currentUser.avatar_url.startsWith("http")
                                    ? currentUser.avatar_url
                                    : `http://localhost:5000${currentUser.avatar_url}`}
                                alt="Avatar"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            {currentUser.username[0].toUpperCase()}
                        {/if}
                    </div>
                    <span
                        class="text-xs font-bold text-rose-text hidden md:block"
                        >@{currentUser.public_id}</span
                    >
                </a>
            {:else}
                <a
                    href="/profile"
                    class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
                    aria-label="Hồ sơ cá nhân"
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

<!-- Mobile: Bottom Navigation Bar -->
<div
    class="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
>
    <nav
        class="glass pointer-events-auto flex items-center justify-around w-full max-w-sm px-2 py-3 rounded-[2.5rem] shadow-2xl border border-white/20"
    >
        {#each navItems as item}
            {@const isActive = page.url.pathname === item.path}
            <a
                href={item.path}
                class="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all {isActive
                    ? 'text-iris scale-110'
                    : 'text-muted'}"
            >
                <i class="bx {item.icon} text-2xl"></i>
                <span
                    class="text-[9px] font-black uppercase tracking-tighter transition-all {isActive
                        ? 'opacity-100'
                        : 'opacity-0 h-0 w-0 overflow-hidden'}"
                >
                    {item.name}
                </span>
            </a>
        {/each}
    </nav>
</div>

<!-- Mobile: Top Actions Bar -->
<div
    class="md:hidden fixed top-4 left-0 right-0 z-50 flex justify-between items-center px-6"
>
    <a
        href="/"
        class="w-10 h-10 bg-iris text-white rounded-full flex items-center justify-center shadow-lg"
        ><i class="bx bx-atom text-xl"></i></a
    >

    <div class="flex items-center gap-3">
        {#if currentUser}
            <a
                href="#"
                class="w-10 h-10 glass rounded-full flex items-center justify-center text-rose-text text-xl relative"
                ><i class="bx bx-bell"></i>
                <span
                    class="absolute top-2 right-2 w-2 h-2 bg-rose-text rounded-full"
                ></span>
            </a>
            <a
                href="/settings"
                class="w-10 h-10 glass rounded-full flex items-center justify-center text-rose-text text-xl"
                ><i class="bx bx-cog"></i></a
            >
            <a
                href="/profile"
                class="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white"
            >
                {#if currentUser.avatar_url}
                    <img
                        src={currentUser.avatar_url.startsWith("http")
                            ? currentUser.avatar_url
                            : `http://localhost:5000${currentUser.avatar_url}`}
                        alt=""
                        class="w-full h-full object-cover"
                    />
                {:else}
                    <div
                        class="w-full h-full flex items-center justify-center font-bold text-iris bg-iris/5"
                    >
                        {currentUser.username[0]}
                    </div>
                {/if}
            </a>
        {:else}
            <a
                href="/login"
                class="bg-rose-text text-white px-5 py-2 rounded-full text-xs font-black shadow-lg"
                >BẮT ĐẦU</a
            >
        {/if}
    </div>
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
    }

    .nav-item:hover .label,
    .nav-item.active .label {
        max-width: 150px;
        opacity: 1;
        margin-left: 4px;
    }

    /* Hide labels on mobile to save space */
    @media (max-width: 768px) {
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
