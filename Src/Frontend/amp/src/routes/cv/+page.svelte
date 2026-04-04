<script>
    import { onMount } from "svelte";

    // Trạng thái hiển thị (Intro / Builder)
    let showIntro = $state(true);
    let isGeneratingPDF = $state(false);

    // Dữ liệu CV mặc định
    let cvData = $state({
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        avatar: "",
        summary: "",
        skills: "",
        experience: [
            {
                id: 1,
                company: "",
                role: "",
                duration: "",
                description: "",
            },
        ],
        education: [
            {
                id: 1,
                school: "",
                degree: "",
                duration: "",
            },
        ],
    });

    // Thêm kinh nghiệm
    function addExperience() {
        cvData.experience = [
            ...cvData.experience,
            {
                id: Date.now(),
                company: "",
                role: "",
                duration: "",
                description: "",
            },
        ];
    }

    // Xóa kinh nghiệm
    function removeExperience(id) {
        cvData.experience = cvData.experience.filter((exp) => exp.id !== id);
    }

    // Thêm học vấn
    function addEducation() {
        cvData.education = [
            ...cvData.education,
            {
                id: Date.now(),
                school: "",
                degree: "",
                duration: "",
            },
        ];
    }

    // Xóa học vấn
    function removeEducation(id) {
        cvData.education = cvData.education.filter((edu) => edu.id !== id);
    }

    // Xử lý in / xuất PDF bằng html2pdf
    async function handlePrint() {
        if (isGeneratingPDF) return;
        isGeneratingPDF = true;

        try {
            if (typeof window !== 'undefined' && !window.html2pdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Không thể tải thư viện html2pdf'));
                    document.head.appendChild(script);
                });
            }

            const element = document.getElementById('cv-preview');
            if (!element) throw new Error('Không tìm thấy element #cv-preview');

            let fileName = 'CV_AMP.pdf';
            if (cvData.fullName) {
                fileName = `CV_${cvData.fullName.trim().replace(/s+/g, '_')}.pdf`;
            }

            const opt = {
                margin:       [0, 0, 0, 0],
                filename:     fileName,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await window.html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Lỗi khi xuất PDF:', error);
            alert('Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại.');
        } finally {
            isGeneratingPDF = false;
        }
    }

    // Xử lý upload ảnh
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                cvData.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
</script>

<svelte:head>
    <title>Tạo CV Chuyên Nghiệp | AMP</title>
</svelte:head>

{#if showIntro}
    <!-- Intro / Landing Page -->
    <div
        class="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 md:px-8"
    >
        <div class="max-w-5xl mx-auto text-center">
            <h1
                class="text-4xl md:text-5xl font-extrabold text-iris mb-6 tracking-tight"
            >
                Tạo CV Nổi Bật Cùng AMP
            </h1>
            <p
                class="text-lg text-subtle mb-12 max-w-3xl mx-auto leading-relaxed"
            >
                Tạo CV chuyên nghiệp trong vài phút với thao tác dễ dàng. AMP
                không chỉ cung cấp công cụ tạo CV trực quan mà còn là cầu nối uy
                tín kết nối bạn với mạng lưới doanh nghiệp hỗ trợ người khuyết
                tật, mở ra những cơ hội việc làm công bằng và phù hợp.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                <div
                    class="p-8 glass rounded-2xl shadow-sm border border-surface hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-14 h-14 bg-surface text-iris rounded-xl flex items-center justify-center text-3xl mb-6"
                    >
                        <i class="bx bx-edit"></i>
                    </div>
                    <h3 class="text-xl font-bold text-rose-text mb-3">
                        Dễ dàng & Nhanh chóng
                    </h3>
                    <p class="text-subtle leading-relaxed">
                        Điền thông tin trực tiếp trên form và xem trước CV theo
                        thời gian thực. Giao diện thân thiện với mọi người dùng.
                    </p>
                </div>

                <div
                    class="p-8 glass rounded-2xl shadow-sm border border-surface hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-14 h-14 bg-surface text-love rounded-xl flex items-center justify-center text-3xl mb-6"
                    >
                        <i class="bx bx-buildings"></i>
                    </div>
                    <h3 class="text-xl font-bold text-rose-text mb-3">
                        Kết nối Doanh nghiệp
                    </h3>
                    <p class="text-subtle leading-relaxed">
                        Cơ hội tiếp cận trực tiếp với các nhà tuyển dụng có môi
                        trường làm việc hòa nhập và chính sách hỗ trợ tốt nhất.
                    </p>
                </div>

                <div
                    class="p-8 glass rounded-2xl shadow-sm border border-surface hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-14 h-14 bg-surface text-pine rounded-xl flex items-center justify-center text-3xl mb-6"
                    >
                        <i class="bx bx-export"></i>
                    </div>
                    <h3 class="text-xl font-bold text-rose-text mb-3">
                        Xuất PDF Chuyên nghiệp
                    </h3>
                    <p class="text-subtle leading-relaxed">
                        Tải xuống CV dưới định dạng PDF chất lượng cao hoàn toàn
                        miễn phí, sẵn sàng gửi đến nhà tuyển dụng.
                    </p>
                </div>
            </div>

            <button
                onclick={() => (showIntro = false)}
                class="button px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-iris/20 hover:-translate-y-1 inline-flex items-center gap-2"
                style="background-color: var(--iris); color: var(--base);"
            >
                Tạo CV Ngay <i class="bx bx-right-arrow-alt text-2xl"></i>
            </button>
        </div>
    </div>
{:else}
    <!-- Giao diện Trình Tạo CV -->
    <div class="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-6 no-print">
                <h1 class="text-3xl font-bold text-rose-text">Trình Tạo CV</h1>
                <div class="flex gap-4">
                    <button
                        onclick={() => (showIntro = true)}
                        class="button flex items-center gap-2 glass border border-highlight-med hover:bg-surface text-rose-text px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm"
                    >
                        <i class="bx bx-arrow-back"></i> Quay lại
                    </button>
                    <button
                        onclick={handlePrint}
                        disabled={isGeneratingPDF}
                        class="button flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        style="background-color: var(--love); color: var(--base);"
                    >
                        {#if isGeneratingPDF}
                            <i class="bx bx-loader-alt bx-spin text-xl"></i> Đang xuất...
                        {:else}
                            <i class="bx bx-printer text-xl"></i> Xuất PDF
                        {/if}
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Cột trái: Form điền thông tin -->
                <div
                    class="form-container glass p-6 rounded-2xl shadow-sm border border-surface h-[calc(100vh-160px)] overflow-y-auto no-print custom-scrollbar"
                >
                    <!-- Thông tin cá nhân -->
                    <section class="mb-8">
                        <h2
                            class="text-xl font-bold text-iris mb-4 pb-2 border-b border-highlight-low flex items-center gap-2"
                        >
                            <i class="bx bx-user"></i> Thông tin cá nhân
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group md:col-span-2">
                                <label
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Ảnh đại diện (Avatar)</label
                                >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onchange={handleAvatarUpload}
                                    class="w-full px-4 py-2 border border-highlight-low bg-overlay rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all text-sm text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-surface file:text-iris hover:file:bg-highlight-low"
                                />
                            </div>
                            <div class="form-group">
                                <label
                                    for="fullName"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Họ và Tên</label
                                >
                                <input
                                    type="text"
                                    id="fullName"
                                    bind:value={cvData.fullName}
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all"
                                />
                            </div>
                            <div class="form-group">
                                <label
                                    for="jobTitle"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Vị trí ứng tuyển</label
                                >
                                <input
                                    type="text"
                                    id="jobTitle"
                                    bind:value={cvData.jobTitle}
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all"
                                />
                            </div>
                            <div class="form-group">
                                <label
                                    for="email"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Email</label
                                >
                                <input
                                    type="email"
                                    id="email"
                                    bind:value={cvData.email}
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all"
                                />
                            </div>
                            <div class="form-group">
                                <label
                                    for="phone"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Số điện thoại</label
                                >
                                <input
                                    type="text"
                                    id="phone"
                                    bind:value={cvData.phone}
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all"
                                />
                            </div>
                            <div class="form-group md:col-span-2">
                                <label
                                    for="address"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Địa chỉ</label
                                >
                                <input
                                    type="text"
                                    id="address"
                                    bind:value={cvData.address}
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all"
                                />
                            </div>
                            <div class="form-group md:col-span-2">
                                <label
                                    for="summary"
                                    class="block text-sm font-medium text-rose-text mb-1"
                                    >Giới thiệu bản thân</label
                                >
                                <textarea
                                    id="summary"
                                    bind:value={cvData.summary}
                                    rows="3"
                                    class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Kỹ năng -->
                    <section class="mb-8">
                        <h2
                            class="text-xl font-bold text-iris mb-4 pb-2 border-b border-highlight-low flex items-center gap-2"
                        >
                            <i class="bx bx-code-alt"></i> Kỹ năng chuyên môn
                        </h2>
                        <div class="form-group">
                            <label
                                for="skills"
                                class="block text-sm text-subtle mb-2"
                                >Nhập các kỹ năng của bạn, phân cách bởi dấu
                                phẩy</label
                            >
                            <textarea
                                id="skills"
                                bind:value={cvData.skills}
                                rows="2"
                                class="w-full px-4 py-2 bg-overlay border border-highlight-low text-rose-text rounded-lg focus:ring-2 focus:ring-iris focus:border-iris outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </section>

                    <!-- Kinh nghiệm làm việc -->
                    <section class="mb-8">
                        <div
                            class="flex justify-between items-center mb-4 pb-2 border-b border-highlight-low"
                        >
                            <h2
                                class="text-xl font-bold text-iris flex items-center gap-2"
                            >
                                <i class="bx bx-briefcase"></i> Kinh nghiệm làm việc
                            </h2>
                            <button
                                onclick={addExperience}
                                class="text-sm bg-surface text-iris px-3 py-1.5 rounded-md hover:bg-highlight-low font-medium transition-colors border border-highlight-med"
                            >
                                + Thêm
                            </button>
                        </div>

                        <div class="space-y-6">
                            {#each cvData.experience as exp (exp.id)}
                                <div
                                    class="p-4 bg-overlay rounded-xl border border-highlight-low relative group"
                                >
                                    <button
                                        onclick={() => removeExperience(exp.id)}
                                        class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-surface text-love rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-highlight-low border border-love/20"
                                        title="Xóa"
                                    >
                                        <i class="bx bx-trash"></i>
                                    </button>
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div class="form-group">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Công ty</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={exp.company}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                        <div class="form-group">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Vị trí / Chức vụ</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={exp.role}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                        <div class="form-group md:col-span-2">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Thời gian (VD: 01/2022 - Hiện
                                                tại)</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={exp.duration}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                        <div class="form-group md:col-span-2">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Mô tả công việc</label
                                            >
                                            <textarea
                                                bind:value={exp.description}
                                                rows="2"
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>

                    <!-- Học vấn -->
                    <section>
                        <div
                            class="flex justify-between items-center mb-4 pb-2 border-b border-highlight-low"
                        >
                            <h2
                                class="text-xl font-bold text-iris flex items-center gap-2"
                            >
                                <i class="bx bxs-graduation"></i> Học vấn
                            </h2>
                            <button
                                onclick={addEducation}
                                class="text-sm bg-surface text-iris px-3 py-1.5 rounded-md hover:bg-highlight-low font-medium transition-colors border border-highlight-med"
                            >
                                + Thêm
                            </button>
                        </div>

                        <div class="space-y-6">
                            {#each cvData.education as edu (edu.id)}
                                <div
                                    class="p-4 bg-overlay rounded-xl border border-highlight-low relative group"
                                >
                                    <button
                                        onclick={() => removeEducation(edu.id)}
                                        class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-surface text-love rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-highlight-low border border-love/20"
                                        title="Xóa"
                                    >
                                        <i class="bx bx-trash"></i>
                                    </button>
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div class="form-group">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Trường</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={edu.school}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                        <div class="form-group">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Ngành học / Bằng cấp</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={edu.degree}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                        <div class="form-group md:col-span-2">
                                            <label
                                                class="block text-xs font-medium text-subtle mb-1"
                                                >Thời gian (VD: 2018 - 2022)</label
                                            >
                                            <input
                                                type="text"
                                                bind:value={edu.duration}
                                                class="w-full px-3 py-1.5 border border-highlight-low rounded bg-base text-rose-text focus:ring-1 focus:ring-iris outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>
                </div>

                <!-- Cột phải: Preview CV -->
                <div
                    class="preview-container glass p-4 sm:p-8 rounded-2xl flex justify-center overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar border border-surface"
                >
                    <div
                        id="cv-preview"
                        class="cv-document bg-base shadow-xl overflow-hidden text-rose-text"
                    >
                        <!-- Header -->
                        <header
                            class="bg-surface border-b border-highlight-med text-rose-text p-8 flex items-center gap-6"
                        >
                            {#if cvData.avatar}
                                <img
                                    src={cvData.avatar}
                                    alt="Avatar"
                                    class="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-highlight-low shadow-md flex-shrink-0"
                                />
                            {/if}
                            <div>
                                <h1
                                    class="text-3xl font-black tracking-tight mb-2 uppercase text-rose-text"
                                >
                                    {cvData.fullName || "Tên của bạn"}
                                </h1>
                                <h2
                                    class="text-xl font-medium text-iris tracking-wide"
                                >
                                    {cvData.jobTitle || "Vị trí công việc"}
                                </h2>
                            </div>
                        </header>

                        <div class="flex flex-col md:flex-row min-h-[800px]">
                            <!-- Sidebar (Left) -->
                            <aside
                                class="w-full md:w-[32%] bg-overlay p-6 border-r border-highlight-low"
                            >
                                <!-- Contact -->
                                <div class="mb-8">
                                    <h3
                                        class="text-sm font-bold uppercase tracking-wider text-rose-text border-b-2 border-highlight-med pb-2 mb-4"
                                    >
                                        Liên hệ
                                    </h3>
                                    <ul class="space-y-3 text-sm text-subtle">
                                        {#if cvData.phone}
                                            <li
                                                class="flex items-start gap-2 break-all"
                                            >
                                                <i
                                                    class="bx bxs-phone mt-1 text-muted"
                                                ></i>
                                                <span>{cvData.phone}</span>
                                            </li>
                                        {/if}
                                        {#if cvData.email}
                                            <li
                                                class="flex items-start gap-2 break-all"
                                            >
                                                <i
                                                    class="bx bxs-envelope mt-1 text-muted"
                                                ></i>
                                                <span>{cvData.email}</span>
                                            </li>
                                        {/if}
                                        {#if cvData.address}
                                            <li
                                                class="flex items-start gap-2 break-all"
                                            >
                                                <i
                                                    class="bx bxs-map mt-1 text-muted"
                                                ></i>
                                                <span>{cvData.address}</span>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>

                                <!-- Skills -->
                                {#if cvData.skills}
                                    <div>
                                        <h3
                                            class="text-sm font-bold uppercase tracking-wider text-rose-text border-b-2 border-highlight-med pb-2 mb-4"
                                        >
                                            Kỹ năng
                                        </h3>
                                        <div class="flex flex-wrap gap-2">
                                            {#each cvData.skills
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter((s) => s) as skill}
                                                <span
                                                    class="bg-surface border border-highlight-low text-rose-text px-2 py-1 text-xs rounded-md font-medium shadow-sm"
                                                >
                                                    {skill}
                                                </span>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </aside>

                            <!-- Main Content (Right) -->
                            <main class="w-full md:w-[68%] p-6 md:p-8">
                                <!-- Summary -->
                                {#if cvData.summary}
                                    <section class="mb-8">
                                        <h3
                                            class="text-lg font-bold uppercase tracking-wider text-rose-text border-b-2 border-iris pb-2 mb-4 flex items-center gap-2"
                                        >
                                            <i
                                                class="bx bx-user-circle text-iris"
                                            ></i> Tóm tắt
                                        </h3>
                                        <p
                                            class="text-sm text-subtle leading-relaxed text-justify"
                                        >
                                            {cvData.summary}
                                        </p>
                                    </section>
                                {/if}

                                <!-- Experience -->
                                {#if cvData.experience.length > 0}
                                    <section class="mb-8">
                                        <h3
                                            class="text-lg font-bold uppercase tracking-wider text-rose-text border-b-2 border-iris pb-2 mb-5 flex items-center gap-2"
                                        >
                                            <i
                                                class="bx bx-briefcase-alt-2 text-iris"
                                            ></i> Kinh nghiệm làm việc
                                        </h3>
                                        <div class="space-y-6">
                                            {#each cvData.experience as exp}
                                                {#if exp.company || exp.role}
                                                    <div
                                                        class="relative pl-4 border-l-2 border-highlight-low"
                                                    >
                                                        <div
                                                            class="absolute w-2.5 h-2.5 bg-iris rounded-full -left-[6px] top-1.5 ring-4 ring-base"
                                                        ></div>
                                                        <div
                                                            class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1"
                                                        >
                                                            <h4
                                                                class="text-base font-bold text-rose-text"
                                                            >
                                                                {exp.role ||
                                                                    "Vị trí"}
                                                            </h4>
                                                            <span
                                                                class="text-xs font-semibold text-iris bg-surface border border-highlight-low px-2 py-0.5 rounded-full mt-1 sm:mt-0 whitespace-nowrap"
                                                                >{exp.duration}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="text-sm font-semibold text-subtle mb-2"
                                                        >
                                                            {exp.company ||
                                                                "Tên công ty"}
                                                        </div>
                                                        {#if exp.description}
                                                            <p
                                                                class="text-sm text-subtle leading-relaxed whitespace-pre-line text-justify"
                                                            >
                                                                {exp.description}
                                                            </p>
                                                        {/if}
                                                    </div>
                                                {/if}
                                            {/each}
                                        </div>
                                    </section>
                                {/if}

                                <!-- Education -->
                                {#if cvData.education.length > 0}
                                    <section>
                                        <h3
                                            class="text-lg font-bold uppercase tracking-wider text-rose-text border-b-2 border-iris pb-2 mb-5 flex items-center gap-2"
                                        >
                                            <i
                                                class="bx bxs-graduation text-iris"
                                            ></i> Học vấn
                                        </h3>
                                        <div class="space-y-5">
                                            {#each cvData.education as edu}
                                                {#if edu.school || edu.degree}
                                                    <div
                                                        class="relative pl-4 border-l-2 border-highlight-low"
                                                    >
                                                        <div
                                                            class="absolute w-2.5 h-2.5 bg-subtle rounded-full -left-[6px] top-1.5 ring-4 ring-base"
                                                        ></div>
                                                        <div
                                                            class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1"
                                                        >
                                                            <h4
                                                                class="text-base font-bold text-rose-text"
                                                            >
                                                                {edu.degree ||
                                                                    "Bằng cấp/Ngành"}
                                                            </h4>
                                                            <span
                                                                class="text-xs font-semibold text-subtle mt-1 sm:mt-0 whitespace-nowrap"
                                                                >{edu.duration}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="text-sm font-medium text-subtle"
                                                        >
                                                            {edu.school ||
                                                                "Tên trường"}
                                                        </div>
                                                    </div>
                                                {/if}
                                            {/each}
                                        </div>
                                    </section>
                                {/if}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Styling for the CV preview to look like an A4 paper */
    .cv-document {
        width: 210mm;
        min-height: 297mm;
        /* Using variables dynamically based on theme */
    }

    /* Tùy chỉnh thanh cuộn */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--highlight-med, #cbd5e1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--highlight-high, #94a3b8);
    }

    /* Print media query - Khi nhấn in/xuất PDF */
    @media print {
        @page {
            size: A4;
            margin: 0;
        }

        /* Ẩn tất cả những thứ không cần thiết */
        body * {
            visibility: hidden;
        }

        .no-print {
            display: none !important;
        }

        /* Chỉ hiển thị phần CV Preview */
        #cv-preview,
        #cv-preview * {
            visibility: visible;
        }

        #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            box-shadow: none;
            margin: 0;
            padding: 0;
            /* Đảm bảo in được background color của CSS */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Khi in, ép sidebar và main content hiển thị dạng flex ngang như desktop */
        #cv-preview > div {
            display: flex !important;
            flex-direction: row !important;
        }
        #cv-preview aside {
            width: 32% !important;
        }
        #cv-preview main {
            width: 68% !important;
        }
    }
</style>
