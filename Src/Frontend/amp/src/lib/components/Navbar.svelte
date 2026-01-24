<script>
	import { onMount } from "svelte";
	import { page } from "$app/state";

	const navItems = [
		{ name: "Khám phá", path: "/", icon: "bx-compass" },
		{ name: "Diễn đàn", path: "/forum", icon: "bx-message-square-detail" },
		{ name: "Tuyển dụng", path: "/recruitment", icon: "bx-briefcase" },
		{ name: "Trò chuyện", path: "/chat", icon: "bx-chat" },
		{ name: "Học tập", path: "/sign-language", icon: "bx-book-open" },
	];

	let scrolled = $state(false);
	let currentUser = $state(null);

	onMount(() => {
		const updateUserData = () => {
			const userData = localStorage.getItem("user");
			if (userData) {
				currentUser = JSON.parse(userData);
			} else {
				currentUser = null;
			}
		};

		updateUserData();

		window.addEventListener("user-updated", updateUserData);

		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("user-updated", updateUserData);
		};
	});
</script>

<div
	class="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
>
	<nav
		class="dynamic-island pointer-events-auto flex items-center gap-2 p-1.5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
		class:scrolled
	>
		<!-- Logo section -->
		<a
			href="/"
			class="logo-circle flex items-center justify-center bg-iris text-white rounded-full transition-all duration-500 w-10 h-10 shadow-lg shadow-iris/20"
			title="Trang chủ AMP"
		>
			<i class="bx bx-atom text-xl"></i>
		</a>

		<div
			class="nav-links flex items-center gap-1 overflow-hidden transition-all duration-500"
		>
			{#each navItems as item}
				{@const isActive = page.url.pathname === item.path}
				<a
					href={item.path}
					class="nav-item group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
					class:active={isActive}
				>
					<i
						class="bx {item.icon} text-xl transition-transform duration-300 group-hover:scale-110"
					></i>
					<span class="text-sm font-bold whitespace-nowrap label">
						{item.name}
					</span>
					{#if isActive}
						<div
							class="absolute inset-0 bg-iris/10 rounded-full -z-10"
						></div>
					{/if}
				</a>
			{/each}
		</div>

		<div class="h-6 w-px bg-overlay/50 mx-1"></div>

		<!-- Action icons -->
		<div class="flex items-center gap-1">
			{#if currentUser}
				<a
					href="/settings"
					class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
					aria-label="Cài đặt"
				>
					<i class="bx bx-cog text-2xl"></i>
				</a>
				<a
					href="/profile"
					class="nav-item flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full hover:bg-iris/10 transition-all border border-transparent hover:border-iris/20"
					aria-label="Hồ sơ cá nhân"
				>
					<div
						class="w-7 h-7 bg-iris/20 text-iris rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
					>
						{#if currentUser.avatar_url}
							<img
								src={currentUser.avatar_url.startsWith("http")
									? currentUser.avatar_url
									: `http://localhost:5000${currentUser.avatar_url}`}
								alt="Avatar"
								class="w-full h-full object-cover"
							/>
						{:else}
							{currentUser.username[0].toUpperCase()}
						{/if}
					</div>
					<span
						class="text-xs font-bold text-rose-text hidden md:block"
						>@{currentUser.public_id}</span
					>
				</a>
			{:else}
				<a
					href="/profile"
					class="nav-item p-2 rounded-full hover:bg-iris/10 transition-all"
					aria-label="Hồ sơ cá nhân"
				>
					<i class="bx bx-user-circle text-2xl"></i>
				</a>
				<a
					href="/login"
					class="login-btn ml-1 px-5 py-2.5 bg-rose-text text-white rounded-full text-sm font-bold hover:bg-iris hover:shadow-lg transition-all duration-300 whitespace-nowrap"
				>
					Bắt đầu
				</a>
			{/if}
		</div>
	</nav>
</div>

<style>
	.dynamic-island {
		background: rgba(255, 250, 243, 0.8);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(215, 130, 126, 0.2);
		border-radius: 999px;
		box-shadow:
			0 4px 6px -1px rgba(87, 82, 121, 0.05),
			0 10px 30px -5px rgba(87, 82, 121, 0.1);
		width: auto;
		max-width: fit-content;
	}

	.dynamic-island.scrolled {
		transform: translateY(-5px) scale(0.98);
		background: rgba(255, 250, 243, 0.95);
		border-color: rgba(144, 122, 169, 0.3);
		box-shadow: 0 20px 40px -10px rgba(87, 82, 121, 0.15);
	}

	.nav-item {
		color: var(--color-subtle);
		text-decoration: none;
	}

	.nav-item:hover,
	.nav-item.active {
		color: var(--color-iris);
	}

	/* Label animations */
	.nav-links .label {
		max-width: 0;
		opacity: 0;
		transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.nav-item:hover .label,
	.nav-item.active .label {
		max-width: 150px;
		opacity: 1;
		margin-left: 4px;
	}

	/* Hide labels on mobile to save space */
	@media (max-width: 768px) {
		.nav-links .label {
			display: none;
		}
		.nav-item:hover .label,
		.nav-item.active .label {
			display: none;
		}
	}

	.logo-circle:hover {
		transform: rotate(360deg);
		background: var(--color-love);
	}
</style>
