<script>
  import { page } from "$app/state";
  import { currentUser } from "$lib/stores/auth.js";
  import { speak } from "$lib/speech.js";
  import { haptic } from "$lib/stores/access.js";

  const tabs = [
    { href: "/", label: "Trang chủ", icon: "bx-home-alt", activeIcon: "bxs-home-alt-2", color: "#b4637a" },
    { href: "/sign-language", label: "Ký hiệu", icon: "bx-book", activeIcon: "bxs-book", color: "#ea9d34" },
    { href: "/forum", label: "Cộng đồng", icon: "bx-group", activeIcon: "bxs-group", color: "#907aa9" },
    { href: "/recruitment", label: "Việc làm", icon: "bx-briefcase", activeIcon: "bxs-briefcase", color: "#286983" },
  ];

  function profileTab() {
    return $currentUser
      ? { href: "/profile", label: "Cá nhân", icon: "bx-user", activeIcon: "bxs-user", color: "#7287fd" }
      : { href: "/login", label: "Đăng nhập", icon: "bx-log-in", activeIcon: "bxs-log-in", color: "#7287fd" };
  }

  function isActive(href) {
    if (href === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(href);
  }

  function onTap(label) {
    haptic(10);
    speak(label);
  }
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-50 bg-[#faf4ed]/95 backdrop-blur border-t-2 border-[#f2e9e1] pb-[env(safe-area-inset-bottom)]"
  aria-label="Điều hướng chính"
>
  <div class="flex items-stretch justify-around max-w-md mx-auto">
    {#each [...tabs, profileTab()] as tab}
      <a
        href={tab.href}
        onclick={() => onTap(tab.label)}
        aria-current={isActive(tab.href) ? "page" : undefined}
        class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[64px] transition-colors"
        style={isActive(tab.href) ? `color:${tab.color}` : "color:#797593"}
      >
        <i class="bx {isActive(tab.href) ? tab.activeIcon : tab.icon} text-2xl"></i>
        <span class="text-[11px] font-bold leading-none">{tab.label}</span>
      </a>
    {/each}
  </div>
</nav>
