<script>
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";

    let mounted = $state(false);
    let activeTab = $state("chung");

    const tabs = [
        { id: "chung", label: "Chung", icon: "bx-check-circle" },
        { id: "vieclam", label: "Việc làm", icon: "bx-briefcase" },
        { id: "doanhnghiep", label: "Doanh nghiệp", icon: "bx-buildings" },
        {
            id: "mangxahoi",
            label: "Mạng xã hội",
            icon: "bx-message-rounded-dots",
        },
        {
            id: "quyengop",
            label: "Quyên góp & Từ thiện",
            icon: "bx-donate-heart",
        },
    ];

    onMount(() => (mounted = true));
</script>

<div class="max-w-4xl mx-auto px-6 pt-4 pb-20">
    {#if mounted}
        <div
            in:fly={{ y: 20 }}
            class="glass p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-2xl relative overflow-hidden"
        >
            <!-- Decorative line at the top of the box to separate from Navbar -->
            <div
                class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-love via-iris to-gold opacity-90"
            ></div>

            <h1
                class="text-3xl md:text-4xl font-black text-rose-text mb-6 text-center tracking-tight"
            >
                Điều khoản dịch vụ
            </h1>

            <div
                class="flex overflow-x-auto gap-2 mt-14 mb-10 md:justify-center border-b border-overlay pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {#each tabs as tab}
                    <button
                        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all {activeTab ===
                        tab.id
                            ? 'bg-iris text-white shadow-md shadow-iris/20'
                            : 'bg-surface text-subtle hover:text-rose-text hover:bg-overlay'}"
                        onclick={() => (activeTab = tab.id)}
                    >
                        <i class="bx {tab.icon} text-lg"></i>
                        {tab.label}
                    </button>
                {/each}
            </div>

            <div
                class="space-y-8 text-rose-text/80 leading-relaxed text-lg min-h-[400px]"
            >
                {#if activeTab === "chung"}
                    <div in:fade={{ duration: 300 }} class="space-y-8">
                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-check-circle text-iris"></i> 1. Chấp
                                nhận điều khoản
                            </h2>
                            <p>
                                Bằng cách truy cập và sử dụng nền tảng AMP, bạn
                                đồng ý tuân thủ các điều khoản và điều kiện được
                                nêu tại đây. Nếu bạn không đồng ý, vui lòng
                                ngừng sử dụng dịch vụ của chúng tôi.
                            </p>
                        </section>

                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-user-voice text-iris"></i> 2. Quyền
                                và trách nhiệm người dùng
                            </h2>
                            <p>
                                Bạn chịu trách nhiệm về tính bảo mật của tài
                                khoản và tất cả các hoạt động xảy ra dưới tên
                                người dùng của mình. AMP cam kết hỗ trợ toàn
                                diện cho người khiếm thị và khiếm thính, tuy
                                nhiên người dùng cần cung cấp thông tin chính
                                xác để hệ thống AI hoạt động tốt nhất.
                            </p>
                        </section>

                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-shield-x text-iris"></i> 3. Hành vi
                                bị cấm
                            </h2>
                            <ul class="list-disc pl-6 space-y-2">
                                <li>
                                    Đưa ra các thông tin sai lệch, gây hận thù
                                    hoặc xúc phạm người khác.
                                </li>
                                <li>
                                    Cố gắng can thiệp vào hệ thống AI và mã
                                    nguồn của nền tảng.
                                </li>
                                <li>
                                    Sử dụng dịch vụ cho bất kỳ mục đích bất hợp
                                    pháp nào.
                                </li>
                            </ul>
                        </section>

                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-revision text-iris"></i> 4. Thay đổi
                                điều khoản
                            </h2>
                            <p>
                                AMP có quyền cập nhật các điều khoản này bất kỳ
                                lúc nào. Chúng tôi sẽ thông báo cho bạn thông
                                qua email hoặc thông báo trực tiếp trên nền
                                tảng.
                            </p>
                        </section>
                    </div>
                {:else if activeTab === "vieclam"}
                    <div in:fade={{ duration: 300 }} class="space-y-8">
                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-briefcase text-iris"></i> Tuyển dụng
                                và Việc làm
                            </h2>
                            <p>
                                AMP cung cấp các cơ hội việc làm dành riêng cho
                                người khuyết tật. Tất cả các thông tin tuyển
                                dụng được đăng tải trên nền tảng phải đảm bảo
                                tính trung thực, minh bạch và không phân biệt
                                đối xử.
                            </p>
                            <ul class="list-disc pl-6 space-y-2">
                                <li>
                                    Ứng viên có quyền yêu cầu hỗ trợ đặc biệt
                                    trong quá trình phỏng vấn.
                                </li>
                                <li>
                                    Nhà tuyển dụng phải tuân thủ các quy định về
                                    lao động và quyền của người khuyết tật.
                                </li>
                                <li>
                                    AMP không chịu trách nhiệm trực tiếp về các
                                    tranh chấp hợp đồng lao động giữa ứng viên
                                    và nhà tuyển dụng.
                                </li>
                            </ul>
                        </section>
                    </div>
                {:else if activeTab === "doanhnghiep"}
                    <div in:fade={{ duration: 300 }} class="space-y-8">
                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-buildings text-iris"></i> Đối tác
                                Doanh nghiệp
                            </h2>
                            <div
                                class="bg-gold/10 border-l-4 border-gold p-6 rounded-xl space-y-4"
                            >
                                <p
                                    class="font-bold text-gold flex items-center gap-2"
                                >
                                    <i class="bx bx-error-circle text-xl"></i> Yêu
                                    cầu cấp phép đặc biệt
                                </p>
                                <p>
                                    Để đăng ký tài khoản Doanh nghiệp hoặc đăng
                                    tải thông tin thương mại trên AMP, bạn <strong
                                        >bắt buộc phải có sự đồng ý</strong
                                    > từ ban quản trị.
                                </p>
                                <p>
                                    Vui lòng xin phép và liên hệ thông qua email
                                    của Frenda tại đường dẫn sau:
                                </p>
                                <a
                                    href="https://frendas.pages.dev/bio"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center gap-2 text-iris font-bold hover:underline bg-white/50 px-4 py-2 rounded-lg"
                                >
                                    <i class="bx bx-link-external"></i> https://frendas.pages.dev/bio
                                </a>
                            </div>
                            <p>
                                Mọi tài khoản doanh nghiệp hoạt động trái phép
                                hoặc chưa được phê duyệt sẽ bị vô hiệu hóa mà
                                không cần báo trước.
                            </p>
                        </section>
                    </div>
                {:else if activeTab === "mangxahoi"}
                    <div in:fade={{ duration: 300 }} class="space-y-8">
                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-message-rounded-dots text-iris"
                                ></i> Ứng xử trên mạng xã hội
                            </h2>
                            <p>
                                Mạng xã hội của AMP là nơi kết nối cộng đồng.
                                Chúng tôi mong muốn xây dựng một môi trường an
                                toàn, tôn trọng và đồng cảm.
                            </p>
                            <ul class="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Tôn trọng lẫn nhau:</strong> Không sử
                                    dụng ngôn từ thù ghét, phân biệt đối xử, đe dọa
                                    hoặc quấy rối bất kỳ cá nhân hay nhóm người nào.
                                </li>
                                <li>
                                    <strong>Nội dung phù hợp:</strong> Không đăng
                                    tải nội dung khiêu dâm, bạo lực, hoặc vi phạm
                                    bản quyền.
                                </li>
                                <li>
                                    <strong>Tính xác thực:</strong> Không mạo danh
                                    người khác hoặc chia sẻ thông tin sai lệch gây
                                    hoang mang dư luận.
                                </li>
                                <li>
                                    <strong>Quyền riêng tư:</strong> Tôn trọng quyền
                                    riêng tư của người khác. Không tự ý chia sẻ thông
                                    tin cá nhân khi chưa được phép.
                                </li>
                            </ul>
                        </section>
                    </div>
                {:else if activeTab === "quyengop"}
                    <div in:fade={{ duration: 300 }} class="space-y-8">
                        <section class="space-y-4">
                            <h2
                                class="text-2xl font-bold text-rose-text flex items-center gap-3"
                            >
                                <i class="bx bx-donate-heart text-iris"></i> Quyên
                                góp & Từ thiện
                            </h2>
                            <p>
                                Các hoạt động quyên góp trên AMP nhằm mục đích
                                hỗ trợ cộng đồng người khuyết tật và phát triển
                                hệ thống.
                            </p>
                            <ul class="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Minh bạch:</strong> Tất cả các khoản quyên
                                    góp sẽ được công khai minh bạch về mục đích sử
                                    dụng.
                                </li>
                                <li>
                                    <strong>Tự nguyện:</strong> Quyên góp hoàn toàn
                                    là tự nguyện. Chúng tôi không bao giờ ép buộc
                                    hoặc thu phí ẩn từ người dùng.
                                </li>
                                <li>
                                    <strong>Không hoàn lại:</strong> Các khoản quyên
                                    góp đã được xác nhận sẽ không thể hoàn lại. Vui
                                    lòng kiểm tra kỹ trước khi thực hiện giao dịch.
                                </li>
                                <li>
                                    <strong>Quỹ Frenda:</strong> Mọi khoản đóng góp
                                    sẽ được quản lý bởi quỹ Frenda để hỗ trợ các dự
                                    án công nghệ cho người khiếm khuyết.
                                </li>
                            </ul>
                        </section>
                    </div>
                {/if}
            </div>

            <div class="mt-12 pt-8 border-t border-overlay/50 text-center">
                <button
                    onclick={() => window.history.back()}
                    class="button px-8 py-3 inline-block"
                >
                    Quay lại
                </button>
            </div>
        </div>
    {/if}
</div>
