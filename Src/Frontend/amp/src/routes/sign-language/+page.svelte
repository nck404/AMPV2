<script>
    import { onMount } from "svelte";
    import { fly, fade } from "svelte/transition";

    let mounted = $state(false);
    let selectedCategory = $state("Alphabet");
    let activeLesson = $state(null);

    const categories = [
        { name: "Alphabet", icon: "bx-font", count: 26 },
        { name: "Numbers", icon: "bx-hash", count: 10 },
        { name: "Greetings", icon: "bx-hand", count: 15 },
        { name: "Common Food", icon: "bx-fridge", count: 20 },
        { name: "Emotions", icon: "bx-laugh", count: 12 },
    ];

    const lessons = [
        {
            id: 1,
            title: "Letter A",
            difficulty: "Beginner",
            duration: "2 mins",
            category: "Alphabet",
        },
        {
            id: 2,
            title: "Letter B",
            difficulty: "Beginner",
            duration: "3 mins",
            category: "Alphabet",
        },
        {
            id: 3,
            title: "Letter C",
            difficulty: "Beginner",
            duration: "2 mins",
            category: "Alphabet",
        },
        {
            id: 4,
            title: "Greeting Hello",
            difficulty: "Intermediate",
            duration: "5 mins",
            category: "Greetings",
        },
    ];

    onMount(() => (mounted = true));

    function selectLesson(lesson) {
        activeLesson = lesson;
    }
</script>

<div class="max-w-7xl mx-auto px-6 py-12">
    {#if mounted}
        <div
            in:fade={{ duration: 600 }}
            class="flex flex-col lg:flex-row gap-10"
        >
            <!-- Sidebar / Categories -->
            <aside class="w-full lg:w-72 space-y-8">
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-rose-text">Học tập</h2>
                    <div class="space-y-2">
                        {#each categories as cat}
                            <button
                                onclick={() => (selectedCategory = cat.name)}
                                class="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 {selectedCategory ===
                                cat.name
                                    ? 'bg-iris text-white shadow-lg shadow-iris/20'
                                    : 'bg-surface text-muted hover:bg-overlay/60 hover:text-rose-text border border-overlay'}"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl"
                                        ><i class="bx {cat.icon}"></i></span
                                    >
                                    <span class="font-medium">{cat.name}</span>
                                </div>
                                <span class="text-xs opacity-60"
                                    >{cat.count} bài</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Stats Card -->
                <div
                    class="glass p-6 rounded-3xl border border-iris/20 space-y-4"
                >
                    <h3 class="font-bold text-rose-text">Tiến độ của bạn</h3>
                    <div class="space-y-2">
                        <div
                            class="flex justify-between text-xs text-muted mb-1"
                        >
                            <span>Hoàn thành 12/80 bài</span>
                            <span>15%</span>
                        </div>
                        <div
                            class="w-full h-2 bg-overlay rounded-full overflow-hidden"
                        >
                            <div class="w-[15%] h-full bg-iris"></div>
                        </div>
                    </div>
                    <button
                        class="w-full py-2 text-xs font-bold text-iris bg-iris/10 rounded-xl hover:bg-iris/20 transition-colors"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 space-y-8">
                <!-- Header -->
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <h1 class="text-4xl">
                            Chương trình: <span class="text-iris"
                                >{selectedCategory}</span
                            >
                        </h1>
                        <p class="text-muted mt-2">
                            Bắt đầu học ngôn ngữ kí hiệu với mô hình tương tác
                            3D.
                        </p>
                    </div>
                    <button class="button px-6 flex items-center gap-2">
                        <i class="bx bx-camera-movie text-xl"></i> Sử dụng Camera
                        AI
                    </button>
                </div>

                {#if activeLesson}
                    <!-- Study view -->
                    <div in:fly={{ y: 20, duration: 500 }} class="space-y-6">
                        <div
                            class="bg-white rounded-[2.5rem] p-8 shadow-xl border border-overlay relative overflow-hidden group"
                        >
                            <div class="flex items-center justify-between mb-6">
                                <h2
                                    class="text-2xl font-bold text-rose-text flex items-center gap-2"
                                >
                                    <button
                                        onclick={() => (activeLesson = null)}
                                        class="p-2 hover:bg-overlay rounded-lg transition-colors text-xl flex items-center justify-center"
                                        aria-label="Trở lại"
                                        ><i class="bx bx-chevron-left"
                                        ></i></button
                                    >
                                    {activeLesson.title}
                                </h2>
                                <span
                                    class="px-3 py-1 bg-iris/10 text-iris rounded-full text-xs font-bold uppercase tracking-wider"
                                    >{activeLesson.difficulty}</span
                                >
                            </div>

                            <!-- 3D Model Placeholder -->
                            <div
                                class="aspect-video bg-overlay rounded-3xl border-2 border-dashed border-muted/30 flex items-center justify-center flex-col gap-4"
                            >
                                <div class="text-5xl animate-bounce text-iris">
                                    <i class="bx bx-cube-alt"></i>
                                </div>
                                <div class="text-muted text-center">
                                    <p class="font-medium">
                                        Mô hình 3D đang tải...
                                    </p>
                                    <p class="text-xs">
                                        Sử dụng chuột để xoay và phóng to
                                    </p>
                                </div>
                            </div>

                            <div
                                class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                            >
                                <div
                                    class="p-4 bg-surface rounded-2xl border border-overlay"
                                >
                                    <h4
                                        class="font-bold text-rose-text text-sm mb-2"
                                    >
                                        Mô tả
                                    </h4>
                                    <p
                                        class="text-xs text-muted leading-relaxed"
                                    >
                                        Nắm bàn tay lại, để ngón cái sát vào các
                                        ngón khác. Đây là kí hiệu cơ bản cho chữ
                                        A.
                                    </p>
                                </div>
                                <div
                                    class="p-4 bg-surface rounded-2xl border border-overlay"
                                >
                                    <h4
                                        class="font-bold text-rose-text text-sm mb-2"
                                    >
                                        Lưu ý
                                    </h4>
                                    <p
                                        class="text-xs text-muted leading-relaxed"
                                    >
                                        Giữ cổ tay thẳng, tránh gồng quá mức để
                                        cử chỉ trông tự nhiên hơn.
                                    </p>
                                </div>
                                <div
                                    class="p-4 bg-iris text-white rounded-2xl shadow-lg shadow-iris/20 flex flex-col justify-center items-center text-center"
                                >
                                    <div class="text-3xl mb-1">
                                        <i class="bx bx-target-lock"></i>
                                    </div>
                                    <div
                                        class="text-xs font-bold uppercase tracking-widest"
                                    >
                                        Kiểm tra ngay
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {:else}
                    <!-- Grid view -->
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {#each lessons.filter((l) => l.category === selectedCategory) as lesson, i}
                            <button
                                in:fly={{ y: 20, delay: i * 50 }}
                                class="group bg-surface p-6 rounded-3xl border border-overlay hover:border-iris/40 hover:shadow-2xl hover:shadow-iris/5 transition-all duration-500 cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-iris/20"
                                onclick={() => selectLesson(lesson)}
                            >
                                <div
                                    class="h-40 bg-overlay/50 rounded-2xl mb-4 overflow-hidden relative"
                                >
                                    <div
                                        class="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-500"
                                    >
                                        {selectedCategory === "Alphabet"
                                            ? lesson.title.split(" ")[1]
                                            : "📜"}
                                    </div>
                                    <div
                                        class="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur rounded-lg text-[10px] font-bold text-rose-text"
                                    >
                                        {lesson.duration}
                                    </div>
                                </div>
                                <h3
                                    class="text-lg font-bold text-rose-text group-hover:text-iris transition-colors"
                                >
                                    {lesson.title}
                                </h3>
                                <div
                                    class="flex items-center justify-between mt-4"
                                >
                                    <span class="text-xs text-muted"
                                        >{lesson.difficulty}</span
                                    >
                                    <div
                                        class="w-8 h-8 rounded-full bg-overlay flex items-center justify-center group-hover:bg-iris group-hover:text-white transition-all text-xl"
                                    >
                                        <i class="bx bx-right-arrow-alt"></i>
                                    </div>
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </main>
        </div>
    {/if}
</div>

<style>
    aside {
        position: sticky;
        top: 120px;
        height: min-content;
    }
</style>
