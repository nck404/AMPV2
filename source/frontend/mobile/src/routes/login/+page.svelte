<script>
  import { fly, fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { setSession } from "$lib/stores/auth.js";
  import { speak } from "$lib/speech.js";
  import { haptic } from "$lib/stores/access.js";

  let showPassword = $state(false);
  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let errorMsg = $state("");
  let successMsg = $state("");

  onMount(() => {
    if (page.url.searchParams.get("registered") === "true") {
      successMsg = "Đăng ký thành công! Hãy đăng nhập ngay.";
      speak(successMsg);
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    errorMsg = "";
    successMsg = "";
    loading = true;
    try {
      const res = await api.post("/login", { email, password });
      if (res.access_token) {
        setSession(res.access_token, res.user);
        haptic(20);
        speak("Đăng nhập thành công");
        goto("/profile");
      } else {
        errorMsg = res.msg || "Email hoặc mật khẩu không chính xác.";
        speak(errorMsg, { force: true });
      }
    } catch (err) {
      errorMsg =
        err.status === 401
          ? "Email hoặc mật khẩu không chính xác."
          : "Không thể kết nối với máy chủ.";
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
        <div class="w-16 h-16 bg-[#907aa9]/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 text-[#907aa9]">
          <i class="bx bx-lock-open-alt"></i>
        </div>
        <h1 class="text-2xl font-black text-[#2c293e]">Đăng nhập</h1>
        <p class="text-[#575279] text-sm mt-1">Chào mừng bạn trở lại AMP</p>
      </div>

      {#if errorMsg}
        <div in:fade class="p-4 bg-[#b4637a]/10 border border-[#b4637a]/20 rounded-2xl text-[#b4637a] text-sm font-bold flex items-center gap-3">
          <i class="bx bx-error-circle text-xl flex-shrink-0"></i> {errorMsg}
        </div>
      {/if}
      {#if successMsg}
        <div in:fade class="p-4 bg-[#286983]/10 border border-[#286983]/20 rounded-2xl text-[#286983] text-sm font-bold flex items-center gap-3">
          <i class="bx bx-check-circle text-xl flex-shrink-0"></i> {successMsg}
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-5">
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

        <button
          type="submit"
          disabled={loading}
          class="w-full h-16 bg-[#907aa9] text-white font-black rounded-2xl shadow-lg text-lg active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {#if loading}
            <i class="bx bx-loader-alt animate-spin"></i> Đang kết nối...
          {:else}
            Đăng nhập ngay
          {/if}
        </button>
      </form>

      <div class="text-center text-[#575279] font-bold text-sm">
        Chưa có tài khoản?
        <a href="/register" class="text-[#907aa9] font-black">Tham gia ngay</a>
      </div>
    </div>
  </div>
</div>
