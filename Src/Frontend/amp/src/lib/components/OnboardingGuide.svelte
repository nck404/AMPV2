<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let isVisible = $state(false);
    let currentStep = $state(0);
    let targetRect = $state({ top: 0, left: 0, width: 0, height: 0 });
    let tooltipPos = $state({ top: 0, left: 0, transform: "translate(0, 0)" });

    // Định nghĩa các bước hướng dẫn
    const steps = [
        {
            title: "Chào mừng đến với AMP!",
            description:
                "Thanh điều hướng giúp bạn truy cập nhanh vào các tính năng chính của hệ thống.",
            selector: "nav, header, .navbar",
            placement: "bottom",
        },
        {
            title: "Trợ lý ảo AI",
            description:
                "Bong bóng AI luôn sẵn sàng giải đáp thắc mắc. Bạn có thể nhấn để chat hoặc kéo thả nó tới bất cứ đâu trên màn hình!",
            selector: ".assistant-bubble",
            placement: "left",
        },
        {
            title: "Thanh công cụ trợ năng",
            description:
                "Đây là thanh công cụ chứa các tiện ích đặc biệt. Nhấp vào đây hoặc dùng phím tắt Ctrl+I để mở.",
            selector: "#tour-dock-trigger",
            placement: "top",
            action: "open-toolbox",
        },
        {
            title: "Công cụ AI",
            description:
                "Mở nhanh cửa sổ chat với trợ lý AI trực tiếp từ thanh công cụ.",
            selector: "#tour-assistant-btn",
            placement: "top",
        },
        {
            title: "Bàn phím ảo",
            description:
                "Hỗ trợ nhập liệu trên màn hình cho người dùng gặp khó khăn với bàn phím vật lý.",
            selector: "#tour-keyboard-btn",
            placement: "top",
        },
        {
            title: "Đọc màn hình",
            description:
                "Kích hoạt chế độ tự động đọc nội dung khi bạn di chuột qua văn bản (Ctrl+J).",
            selector: "#tour-reader-btn",
            placement: "top",
        },
        {
            title: "Tùy chỉnh con trỏ",
            description:
                "Bật hoặc tắt con trỏ chuột tùy chỉnh nổi bật để dễ nhìn hơn.",
            selector: "#tour-cursor-btn",
            placement: "top",
        },
    ];

    onMount(() => {
        // Kiểm tra xem người dùng đã xem hướng dẫn chưa
        const hasSeenTour = localStorage.getItem("amp-onboarding-completed");

        if (!hasSeenTour) {
            // Đợi 1.5s để đảm bảo các component (Navbar, Toolbox, AI) render xong hết
            setTimeout(() => {
                isVisible = true;
                updateHighlight();
            }, 1500);

            window.addEventListener("resize", updateHighlight);
            window.addEventListener("scroll", updateHighlight);
        }

        return () => {
            window.removeEventListener("resize", updateHighlight);
            window.removeEventListener("scroll", updateHighlight);
        };
    });

    function updateHighlight() {
        if (!isVisible || currentStep >= steps.length) return;

        const step = steps[currentStep];

        if (step.action === "open-toolbox") {
            window.dispatchEvent(new CustomEvent("amp-open-toolbox"));
        }

        setTimeout(
            () => {
                const el = document.querySelector(step.selector);

                if (el) {
                    // Cuộn phần tử vào giữa màn hình nếu nó bị khuất
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center",
                    });

                    // Đợi 300ms cho mượt animation cuộn rồi mới lấy tọa độ
                    setTimeout(() => {
                        const rect = el.getBoundingClientRect();

                        targetRect = {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                        };

                        // Tính toán vị trí hiển thị bảng Tooltip
                        const margin = 24; // Khoảng cách từ highlight box tới tooltip

                        if (step.placement === "bottom") {
                            tooltipPos = {
                                top: rect.bottom + margin,
                                left: rect.left + rect.width / 2,
                                transform: "translateX(-50%)",
                            };
                        } else if (step.placement === "top") {
                            tooltipPos = {
                                top: rect.top - margin,
                                left: rect.left + rect.width / 2,
                                transform: "translate(-50%, -100%)",
                            };
                        } else if (step.placement === "left") {
                            tooltipPos = {
                                top: rect.top + rect.height / 2,
                                left: rect.left - margin,
                                transform: "translate(-100%, -50%)",
                            };
                        } else {
                            tooltipPos = {
                                top: rect.bottom + margin,
                                left: rect.left + rect.width / 2,
                                transform: "translateX(-50%)",
                            };
                        }

                        // Chống tràn màn hình cho tooltip
                        // (Chỉ áp dụng logic cơ bản để tránh lỗi hiển thị)
                        if (tooltipPos.left < 160) {
                            tooltipPos.left = 160;
                        }
                        if (tooltipPos.left > window.innerWidth - 160) {
                            tooltipPos.left = window.innerWidth - 160;
                        }
                    }, 300);
                } else {
                    // Nếu không tìm thấy phần tử, tự động bỏ qua bước này
                    console.warn(
                        `Onboarding: Element not found for selector ${step.selector}`,
                    );
                    nextStep();
                }
            },
            step.action === "open-toolbox" ? 500 : 50,
        );
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateHighlight();
        } else {
            finishTour();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateHighlight();
        }
    }

    function finishTour() {
        isVisible = false;
        localStorage.setItem("amp-onboarding-completed", "true");
    }
</script>

{#if isVisible}
    <div class="onboarding-overlay" transition:fade={{ duration: 400 }}>
        <!-- Vùng sáng (Spotlight) -->
        <div
            class="highlight-box"
            style="
                top: {targetRect.top - 12}px;
                left: {targetRect.left - 12}px;
                width: {targetRect.width + 24}px;
                height: {targetRect.height + 24}px;
            "
        ></div>

        <!-- Bảng thông tin hướng dẫn (Tooltip) -->
        <div
            class="tooltip-box bg-white shadow-2xl rounded-2xl p-6 border border-overlay"
            style="
                top: {tooltipPos.top}px;
                left: {tooltipPos.left}px;
                transform: {tooltipPos.transform};
            "
        >
            <button
                onclick={finishTour}
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-rose-text hover:bg-surface transition-colors"
                title="Bỏ qua hướng dẫn"
            >
                <i class="bx bx-x text-xl"></i>
            </button>

            <h3 class="text-xl font-bold text-iris mb-3 pr-8">
                {steps[currentStep].title}
            </h3>

            <p class="text-sm text-subtle mb-8 leading-relaxed">
                {steps[currentStep].description}
            </p>

            <div class="flex items-center justify-between mt-auto">
                <span
                    class="text-xs font-bold text-muted bg-surface px-3 py-1.5 rounded-full"
                >
                    Bước {currentStep + 1} / {steps.length}
                </span>

                <div class="flex gap-2">
                    {#if currentStep > 0}
                        <button
                            onclick={prevStep}
                            class="px-4 py-2 rounded-xl text-sm font-bold text-rose-text bg-surface hover:bg-overlay transition-colors"
                        >
                            Trở lại
                        </button>
                    {/if}
                    <button
                        onclick={nextStep}
                        class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-iris hover:scale-105 active:scale-95 transition-all shadow-lg shadow-iris/30"
                    >
                        {currentStep === steps.length - 1
                            ? "Hoàn tất"
                            : "Tiếp theo"}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Overlay bao phủ toàn màn hình */
    .onboarding-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000; /* Z-index cực cao để đè lên mọi thứ */
        pointer-events: none; /* Cho phép xuyên qua các vùng tối (nếu cần) */
    }

    /* Hiệu ứng khoét lỗ siêu to bằng box-shadow */
    .highlight-box {
        position: absolute;
        border-radius: 16px; /* Bo góc vùng sáng */
        /* Tạo vùng tối xung quanh */
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto; /* Chặn click vào các phần tử dưới lớp nền tối */
        z-index: 100001;
    }

    /* Khung hiển thị text */
    .tooltip-box {
        position: absolute;
        width: 340px; /* Độ rộng cố định */
        z-index: 100002;
        pointer-events: auto; /* Cho phép click vào nút Tiếp / Trở lại */
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
</style>
