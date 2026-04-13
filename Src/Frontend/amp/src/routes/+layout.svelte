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
            ? localStorage.getItem("custom-cursor-active") !== "false"
            : true,
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
        }
    });

    // List of public routes that don't need authentication
    const publicRoutes = ["/", "/login", "/register", "/terms", "/privacy"];

    $effect(() => {
        const path = page.url.pathname;
        const isPublic = publicRoutes.includes(path);

        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");

            if (!isPublic && !token) {
                goto("/login?error=unauthorized");
            }

            if ((path === "/login" || path === "/register") && token) {
                goto("/profile");
            }

            // Route Lockdown Check
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
<Toolbox bind:isCustomCursorActive />

<main class="{page.url.pathname === '/chat' ? 'pt-0 lg:pt-32' : 'pt-6 lg:pt-32'} pb-24 lg:pb-0 min-h-screen">
    {#key page.url.pathname}
        <div in:fly={{ y: 20, duration: 400, delay: 250 }} out:fade={{ duration: 200 }}>
            {@render children()}
        </div>
    {/key}
</main>
