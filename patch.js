const fs = require('fs');
const file = 'Src/Frontend/amp/src/routes/cv/+page.svelte';
let data = fs.readFileSync(file, 'utf8');

// Thêm isGeneratingPDF
data = data.replace(
    'let showIntro = $state(true);',
    'let showIntro = $state(true);\n    let isGeneratingPDF = $state(false);'
);

// Sửa handlePrint
const oldPrint = `    // Xử lý in / xuất PDF
    function handlePrint() {
        window.print();
    }`;

const newPrint = `    // Xử lý in / xuất PDF bằng html2pdf
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
                fileName = \`CV_\${cvData.fullName.trim().replace(/\s+/g, '_')}.pdf\`;
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
    }`;

data = data.replace(oldPrint, newPrint);

// Sửa button xuất PDF
const oldButton = `<button
                        onclick={handlePrint}
                        class="button flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold shadow-lg transition-all"
                        style="background-color: var(--love); color: var(--base);"
                    >
                        <i class="bx bx-printer text-xl"></i> Xuất PDF
                    </button>`;

const newButton = `<button
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
                    </button>`;

data = data.replace(oldButton, newButton);

fs.writeFileSync(file, data, 'utf8');
