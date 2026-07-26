<script>
  import { fly, fade } from "svelte/transition";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import { speak } from "$lib/speech.js";

  let showPassword = $state(false);
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let loading = $state(false);
  let errorMsg = $state("");
  let agree = $state(false);

  async function handleRegister(e) {
    e.preventDefault();
    errorMsg = "";

    if (!agree) {
      errorMsg = "Bạn cần đồng ý với các điều khoản dịch vụ!";
      speak(errorMsg, { force: true });
      return;
    }
    if (password !== confirmPassword) {
      errorMsg = "Mật khẩu xác nhận không khớp!";
      speak(errorMsg, { force: true });
      return;
    }

    loading = true;
    try {
      const res = await api.post("/register", { username: name, email, password });
      if (res.msg === "User created successfully") {
        speak("Đăng ký thành công");
        goto("/login?registered=true");
      } else {
        errorMsg = res.msg || "Có lỗi xảy ra, vui lòng thử lại.";
        speak(errorMsg, { force: true });
      }
    } catch (err) {
      errorMsg = "Không thể kết nối với máy chủ.";
      speak(errorMsg, { force: true });
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-[70vh] flex items-center justify-center py-8">
  <div in:fly={{ y: 20 }} class="w-full">
    <div class="glass p-6 rounded-[2.5rem] border-2 border-[#f2e9e1] space-y-6">
      <div class="text-center">
        <div class="w-16 h-16 bg-[#b4637a]/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 text-[#b4637a]">
          <i class="bx bx-user-plus"></i>
        </div>
        <h1 class="text-2xl font-black text-[#2c293e]">Đăng ký</h1>
        <p class="text-[#575279] text-sm mt-1">Khám phá AMP ngay hôm nay</p>
      </div>

      {#if errorMsg}
        <div in:fade class="p-4 bg-[#b4637a]/10 border border-[#b4637a]/20 rounded-2xl text-[#b4637a] text-sm font-bold flex items-center gap-3">
          <i class="bx bx-error-circle text-xl flex-shrink-0"></i> {errorMsg}
        </div>
      {/if}

      <form onsubmit={handleRegister} class="space-y-5">
        <div class="space-y-1.5">
          <label for="name" class="text-xs font-black text-[#2c293e]/70 uppercase tracking-wider">Tên hiển thị</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="Nguyễn Văn A"
            required
            class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-base"
          />
        </div>

        <div class="space-y-1.5">
          <label for="email" class="text-xs font-black text-[#2c293e]/70 uppercase tracking-wider">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="your@email.com"
            required
            class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-base"
          />
        </div>

        <div class="space-y-1.5">
          <label for="password" class="text-xs font-black text-[#2c293e]/70 uppercase tracking-wider">Mật khẩu</label>
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              bind:value={password}
              placeholder="••••••••"
              required
              class="w-full h-14 px-5 pr-14 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-base"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-4 top-1/2 -translate-y-1/2 text-[#797593] w-8 h-8 flex items-center justify-center"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <i class="bx {showPassword ? 'bx-hide' : 'bx-show'} text-2xl"></i>
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="confirm" class="text-xs font-black text-[#2c293e]/70 uppercase tracking-wider">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirm"
            bind:value={confirmPassword}
            placeholder="••••••••"
            required
            class="w-full h-14 px-5 bg-[#fffaf3] border-2 border-[#f2e9e1] rounded-2xl focus:border-[#907aa9] outline-none text-base"
          />
        </div>

        <label class="flex items-center gap-3 py-1">
          <input type="checkbox" bind:checked={agree} required class="w-6 h-6 accent-[#907aa9] flex-shrink-0" />
          <span class="text-sm text-[#575279] leading-tight">
            Tôi đồng ý với <a href="/terms" class="text-[#907aa9] font-black">Điều khoản</a> và
            <a href="/privacy" class="text-[#907aa9] font-black">Chính sách</a>.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          class="w-full h-16 bg-[#b4637a] text-white font-black rounded-2xl shadow-lg text-lg active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {#if loading}
            <i class="bx bx-loader-alt animate-spin"></i> Đang xử lý...
          {:else}
            Đăng ký ngay
          {/if}
        </button>
      </form>

      <div class="text-center text-[#575279] font-bold text-sm">
        Đã có tài khoản?
        <a href="/login" class="text-[#907aa9] font-black">Đăng nhập ngay</a>
      </div>
    </div>
  </div>
</div>
