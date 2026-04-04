<script>
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import Navbar from "$lib/components/Navbar.svelte";
    import CustomCursor from "$lib/components/CustomCursor.svelte";
    import Toolbox from "$lib/components/Toolbox.svelte";
    import OnboardingGuide from "$lib/components/OnboardingGuide.svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let { children } = $props();

    let isCustomCursorActive = $state(true);

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

            // Optional: Deep link validation - if token exists on protected route,
            // the individual pages already call /me.
            // If they return 401, api.js will handle redirect.

            if ((path === "/login" || path === "/register") && token) {
                goto("/profile");
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

        const storedCursor = localStorage.getItem("custom-cursor-active");
        if (storedCursor !== null) {
            isCustomCursorActive = storedCursor === "true";
        }
    });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isCustomCursorActive}
    <CustomCursor />
{/if}
<OnboardingGuide />
<Navbar />
<Toolbox bind:isCustomCursorActive />

<main class="pt-32 pb-32 md:pb-0 min-h-screen">
    {@render children()}
</main>
