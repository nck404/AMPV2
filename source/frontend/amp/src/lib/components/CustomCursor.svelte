<script>
    import { onMount } from "svelte";

    let mouseX = $state(0);
    let mouseY = $state(0);
    let cursorX = $state(0);
    let cursorY = $state(0);
    let isPointer = $state(false);
    let isClicked = $state(false);
    let isHidden = $state(true);

    onMount(() => {
        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isHidden = false;

            const target = e.target;
            isPointer =
                window.getComputedStyle(target).cursor === "pointer" ||
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("button") ||
                target.closest("a");
        };

        const handleMouseDown = () => (isClicked = true);
        const handleMouseUp = () => (isClicked = false);
        const handleMouseLeave = () => (isHidden = true);
        const handleMouseEnter = () => (isHidden = false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.documentElement.addEventListener(
            "mouseleave",
            handleMouseLeave,
        );
        document.documentElement.addEventListener(
            "mouseenter",
            handleMouseEnter,
        );

        let raf;
        const animate = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            raf = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.documentElement.removeEventListener(
                "mouseleave",
                handleMouseLeave,
            );
            document.documentElement.removeEventListener(
                "mouseenter",
                handleMouseEnter,
            );
            cancelAnimationFrame(raf);
        };
    });
</script>

<div
    class="custom-cursor {isPointer ? 'pointer' : ''} {isClicked
        ? 'clicked'
        : ''} {isHidden ? 'hidden' : ''}"
    style="transform: translate3d({cursorX}px, {cursorY}px, 0)"
>
    <div class="cursor-dot"></div>
    <div class="cursor-ring"></div>
</div>

<style>
    .custom-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        margin-left: -20px;
        margin-top: -20px;
        z-index: 999999;
        pointer-events: none;
        transition:
            opacity 0.3s,
            transform 0.1s;
    }

    .custom-cursor.hidden {
        opacity: 0;
    }

    .cursor-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background: var(--color-iris);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition:
            width 0.2s,
            height 0.2s,
            background 0.2s;
    }

    .cursor-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 2px solid var(--color-iris);
        border-radius: 50%;
        opacity: 0.3;
        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .custom-cursor.pointer .cursor-ring {
        transform: scale(1.5);
        background: var(--color-iris);
        opacity: 0.1;
    }

    .custom-cursor.pointer .cursor-dot {
        width: 4px;
        height: 4px;
        background: var(--color-love);
    }

    .custom-cursor.clicked {
        transform: scale(0.8);
    }

    /* Only show custom cursor on desktop */
    @media (pointer: coarse) {
        .custom-cursor {
            display: none;
        }
    }
</style>
