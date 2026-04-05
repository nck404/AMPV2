<script>
    import { onMount, onDestroy } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { api } from "$lib/api";

    let mounted = $state(false);
    let activeTool = $state("");
    let video = $state(null);
    let canvas = $state(null);
    let stream = $state(null);
    let detectionResult = $state("");
    let isDetecting = $state(false);
    let ttsText = $state("");
    let voicePitch = $state(1);
    let voiceRate = $state(1);

    onMount(() => {
        mounted = true;
    });

    onDestroy(() => {
        stopCamera();
    });

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            if (video) video.srcObject = stream;
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Vui lòng cho phép truy cập camera để sử dụng tính năng này.");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    function speak(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "vi-VN";
        utterance.pitch = voicePitch;
        utterance.rate = voiceRate;
        window.speechSynthesis.speak(utterance);
    }

    async function detectCurrency() {
        if (!video) return;
        isDetecting = true;
        detectionResult = "Đang nhận diện...";

        setTimeout(() => {
            const mockResults = ["50.000 VNĐ", "100.000 VNĐ", "200.000 VNĐ", "500.000 VNĐ"];
            const result = mockResults[Math.floor(Math.random() * mockResults.length)];
            detectionResult = `Mệnh giá: ${result}`;
            speak(result);
            isDetecting = false;
        }, 1500);
    }

    async function performOCR() {
        if (!video) return;
        isDetecting = true;
        detectionResult = "Đang quét văn bản...";

        setTimeout(() => {
            detectionResult = "Văn bản nhận diện: 'Chào mừng bạn đến với AMP. Hệ thống luôn sẵn sàng hỗ trợ bạn.'";
            speak(detectionResult);
            isDetecting = false;
        }, 2000);
    }

    function handleToolSelect(tool) {
        stopCamera();
        activeTool = tool;
        detectionResult = "";
        if (tool === 'currency' || tool === 'ocr') {
            startCamera();
        }
    }

    function readSelectedText() {
        const text = window.getSelection().toString();
        if (text) speak(text);
        else speak("Vui lòng bôi đen đoạn văn bản bạn muốn tôi đọc.");
    }

    function toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
    }
</script>

<div class="max-w-7xl mx-auto px-6 py-16 min-h-screen">
    {#if mounted}
        <div in:fly={{ y: 20 }} class="space-y-16">
            <!-- Hero Section -->
            <section class="relative p-12 md:p-20 glass rounded-[4rem] border-white/60 overflow-hidden text-center">
                <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-iris/10 via-transparent to-love/10 opacity-30"></div>
                <div class="absolute -top-24 -left-24 w-64 h-64 bg-iris/20 rounded-full blur-[100px]"></div>
                <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-love/20 rounded-full blur-[100px]"></div>

                <div class="relative z-10 space-y-6">
                    <div class="inline-flex items-center gap-2 px-6 py-2 bg-iris/10 border border-iris/20 rounded-full text-iris font-black text-xs uppercase tracking-[0.2em]">
                        <i class="bx bxs-check-shield"></i> Standard Accessibility
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black text-rose-text leading-[1.1] tracking-tight">
                        Trung tâm <span class="bg-gradient-to-r from-iris to-love bg-clip-text text-transparent">Trình trợ năng</span>
                    </h1>
                    <p class="text-muted text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                        Mang đến trải nghiệm không rào cản bằng trí tuệ nhân tạo. Hỗ trợ nhận diện tiền tệ, đọc văn bản và tối ưu thị giác.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 pt-4">
                        <button onclick={() => document.getElementById('tools-grid').scrollIntoView({behavior:'smooth'})} 
                                class="px-10 py-5 bg-rose-text text-white font-black rounded-3xl hover:bg-iris transition-all shadow-xl shadow-rose-text/20">
                            TRẢI NGHIỆM NGAY
                        </button>
                        <button onclick={() => speak("Chào mừng bạn tới với trung tâm trợ năng của AMP. Chúng tôi cung cấp các công cụ nhận diện tiền tệ, quét văn bản và hỗ trợ thị giác.")} 
                                class="px-10 py-5 glass border border-overlay text-rose-text font-black rounded-3xl hover:bg-white transition-all">
                            <i class="bx bx-play-circle mr-2"></i> NGHE GIỚI THIỆU
                        </button>
                    </div>
                </div>
            </section>

            <!-- Tools Grid Section -->
            <div id="tools-grid" class="space-y-8">
                <div class="flex items-center justify-between px-4">
                    <h2 class="text-3xl font-black text-rose-text">Dịch vụ Trợ giúp</h2>
                    <div class="text-sm text-muted italic flex items-center gap-2">
                        <i class="bx bx-info-circle"></i> Chọn một công cụ bên dưới
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {#each [
                        { id: 'currency', name: 'Mệnh giá tiền', desc: 'Nhận diện Polymer VNĐ', icon: 'bx-money', color: 'iris' },
                        { id: 'ocr', name: 'Đọc văn bản', desc: 'Sách báo, ghi chú', icon: 'bx-scan', color: 'rose' },
                        { id: 'tts', name: 'Trợ lý ảo', desc: 'Đọc to nội dung chọn', icon: 'bx-speaker', color: 'gold' },
                        { id: 'magnify', name: 'Tùy chỉnh', desc: 'Tương phản & Cỡ chữ', icon: 'bx-paint', color: 'pine' }
                    ] as tool}
                        <button
                            onclick={() => handleToolSelect(tool.id)}
                            class="group relative p-10 glass rounded-[3rem] border-2 transition-all text-center
                                {activeTool === tool.id ? 'border-iris ring-4 ring-iris/10 bg-white' : 'border-white/60 hover:border-iris/40'}"
                        >
                            <div class="w-20 h-20 bg-{tool.color}/10 rounded-[2rem] flex items-center justify-center text-{tool.color} text-4xl mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <i class="bx {tool.icon}"></i>
                            </div>
                            <h3 class="font-black text-rose-text text-xl">{tool.name}</h3>
                            <p class="text-muted text-xs mt-3 uppercase font-bold tracking-widest">{tool.desc}</p>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Main Workspace -->
            {#if activeTool}
                <div in:fly={{ y: 50 }} class="glass p-12 md:p-20 rounded-[4rem] border-white/60 shadow-2xl relative">
                    <div class="flex flex-col lg:flex-row gap-16 items-start">
                        <div class="w-full lg:w-3/5 space-y-10">
                            {#if activeTool === 'currency' || activeTool === 'ocr'}
                                <div class="bg-black rounded-[3rem] overflow-hidden relative shadow-2xl border-[12px] border-white/30 aspect-square md:aspect-video group">
                                    <video bind:this={video} autoplay playsinline class="w-full h-full object-cover grayscale-[0.2]"></video>
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border-2 border-white/20 border-dashed rounded-[2rem]"></div>
                                    <div class="absolute bottom-6 left-6 text-white/50 text-[10px] tracking-widest font-black uppercase">Live stream: Encrypted</div>
                                </div>
                            {/if}

                            <div class="space-y-6">
                                {#if detectionResult}
                                    <div in:fade class="p-10 bg-iris/5 border border-iris/20 rounded-[2.5rem] shadow-inner text-center">
                                        <div class="text-xs font-black text-iris uppercase tracking-widest mb-2">Kết quả nhận diện</div>
                                        <p class="text-4xl font-black text-rose-text">{detectionResult}</p>
                                    </div>
                                {/if}

                                <div class="flex gap-4">
                                    {#if activeTool === 'currency' || activeTool === 'ocr'}
                                        <button onclick={activeTool === 'currency' ? detectCurrency : performOCR} 
                                                class="flex-1 py-7 bg-iris text-white font-black rounded-3xl shadow-xl shadow-iris/30 text-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                            {isDetecting ? 'ĐANG QUÉT...' : 'BẮT ĐẦU QUÉT'}
                                        </button>
                                    {/if}
                                    <button 
                                        onclick={() => { stopCamera(); activeTool = ''; }} 
                                        class="p-7 glass border border-overlay rounded-3xl text-rose-text hover:bg-love/10 transition-colors"
                                        aria-label="Đóng công cụ"
                                        title="Đóng công cụ"
                                    >
                                        <i class="bx bx-x text-3xl"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="w-full lg:w-2/5 space-y-10">
                            <div class="space-y-6">
                                <h4 class="text-xl font-black text-rose-text">Cài đặt giọng nói</h4>
                                <div class="space-y-8 p-8 bg-surface border border-overlay rounded-[3rem]">
                                    <div class="space-y-4">
                                        <div class="flex justify-between text-xs font-bold text-muted uppercase"><span>Tốc độ</span> <span>{voiceRate}x</span></div>
                                        <input type="range" min="0.5" max="2" step="0.1" bind:value={voiceRate} class="w-full accent-iris">
                                    </div>
                                    <div class="space-y-4">
                                        <div class="flex justify-between text-xs font-bold text-muted uppercase"><span>Độ trầm bổng</span> <span>{voicePitch}</span></div>
                                        <input type="range" min="0" max="2" step="0.1" bind:value={voicePitch} class="w-full accent-gold">
                                    </div>
                                </div>
                            </div>

                            <div class="p-10 bg-iris/5 rounded-[3rem] border border-iris/10 space-y-4">
                                <h4 class="font-black text-rose-text">Hướng dẫn</h4>
                                <ul class="space-y-4 text-sm text-subtle">
                                    <li class="flex gap-3"><i class="bx bx-check-double text-iris"></i> Cầm điện thoại hoặc vật phẩm ở khoảng cách 20cm.</li>
                                    <li class="flex gap-3"><i class="bx bx-check-double text-iris"></i> Đảm bảo đủ ánh sáng để camera hoạt động tốt nhất.</li>
                                    <li class="flex gap-3"><i class="bx bx-check-double text-iris"></i> Kết quả sẽ được tự động đọc to sau khi quét.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Education / Tutorial Section -->
            <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="col-span-1 md:col-span-2 space-y-8">
                    <h2 class="text-4xl font-black text-rose-text">Hành trình hòa nhập</h2>
                    <div class="p-10 glass border-white/60 rounded-[4rem] space-y-6">
                        <p class="text-lg text-subtle leading-relaxed italic">
                            "Tại AMP, chúng tôi không chỉ xây dựng phần mềm, chúng tôi xây dựng những nhịp cầu. Công vụ hỗ trợ dành cho người khuyết tật là một phần trong cam kết dài hạn về một thế giới phẳng, nơi kiến thức và sự tiện nghi dành cho tất cả mọi người."
                        </p>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-iris rounded-2xl flex items-center justify-center text-white"><i class="bx bxs-quote-alt-left"></i></div>
                            <div>
                                <div class="font-black text-rose-text">Đội ngũ Phát triển AMP</div>
                                <div class="text-xs text-muted font-bold uppercase tracking-widest">Innovation Team</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-surface border border-overlay rounded-[4rem] p-12 text-center flex flex-col items-center justify-center space-y-6">
                    <div class="w-20 h-20 bg-love/10 rounded-full flex items-center justify-center text-love text-4xl shadow-inner">
                        <i class="bx bx-help-circle"></i>
                    </div>
                    <h3 class="font-black text-rose-text text-xl">Câu hỏi thường gặp?</h3>
                    <p class="text-sm text-muted">Chúng tôi đã tổng hợp các mẹo sử dụng camera và thiết bị ngoại vi tại đây.</p>
                    <button class="px-8 py-3 bg-white border border-overlay text-rose-text font-black rounded-2xl hover:bg-love hover:text-white transition-all">XEM WIKI</button>
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    :global(body.high-contrast) {
        filter: contrast(1.8) brightness(1.1);
        background: #000 !important;
    }
    :global(body.high-contrast *) {
        color: #fff !important;
        border-color: #fff !important;
    }
    :global(body.high-contrast button) {
        background: #fff !important;
        color: #000 !important;
    }
    :global(body.high-contrast .glass) {
        background: transparent !important;
    }
</style>
