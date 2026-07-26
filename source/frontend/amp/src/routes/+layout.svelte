<script>
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import "./layout.css";
    import Navbar from "$lib/components/Navbar.svelte";
    import CustomCursor from "$lib/components/CustomCursor.svelte";
    import Toolbox from "$lib/components/Toolbox.svelte";
    import OnboardingGuide from "$lib/components/OnboardingGuide.svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { api } from "$lib/api.js";

    import { fly, fade } from "svelte/transition";

    let { children } = $props();

    let isCustomCursorActive = $state(
        typeof window !== "undefined"
            ? localStorage.getItem("custom-cursor-active") === "true"
            : false,
    );
    let isDarkMode = $state(
        typeof window !== "undefined"
            ? localStorage.getItem("theme") === "dark" || 
              (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
            : false
    );

    $effect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.style.setProperty(
                "--cursor-state",
                isCustomCursorActive ? "none" : "auto",
            );
            localStorage.setItem(
                "custom-cursor-active",
                isCustomCursorActive.toString(),
            );
            
            if (isDarkMode) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
        }
    });

    $effect(() => {
        const path = page.url.pathname;
        
        // Chỉ những route này (hoặc có chứa từ khóa này) mới bắt buộc đăng nhập
        const isProtected = 
            path.startsWith("/profile") || 
            path.startsWith("/chat") || 
            path.startsWith("/settings") || 
            path.startsWith("/admin") || 
            path.startsWith("/cv") || 
            path.includes("/post") || 
            path.includes("/manage") || 
            path.endsWith("/apply") ||
            path.includes("/create") || // VD: /forum/create
            path.includes("/new");

        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");

            if (isProtected && !token) {
                goto("/login?error=unauthorized");
            }

            if ((path === "/login" || path === "/register") && token) {
                goto("/profile");
            }

            if (path !== "/maintenance" && path !== "/admin") {
                api.get(`/admin/check-route?path=${path}`).then(res => {
                    if (res.locked) {
                        goto(`/maintenance?from=${path}`);
                    }
                });
            }
        }
    });

    onMount(() => {
        const storedFont = localStorage.getItem("preferred-font");
        if (storedFont) {
            document.documentElement.style.setProperty(
                "--font-main",
                `'${storedFont}', sans-serif`,
            );
        }

        const storedFontSize = localStorage.getItem("preferred-font-size");
        if (storedFontSize) {
            document.documentElement.style.fontSize = storedFontSize;
        }
    });
</script>

<svelte:head>
    <link rel="icon" href="/favicon.png" />
    <meta name="google-site-verification" content="Rj5CohCzIgRnlj5wpCMKd4Rbv6iYBZTckWL8rTZArjI" />
</svelte:head>

{#if isCustomCursorActive}
    <CustomCursor />
{/if}
<OnboardingGuide />
<Navbar />
<Toolbox bind:isCustomCursorActive bind:isDarkMode />

<main class="{page.url.pathname === '/chat' ? 'pt-0 lg:pt-32' : 'pt-6 lg:pt-32'} pb-24 lg:pb-0 min-h-screen">
    {#key page.url.pathname}
        <div in:fly={{ y: 20, duration: 400, delay: 250 }} out:fade={{ duration: 200 }}>
            {@render children()}
        </div>
    {/key}
</main>
