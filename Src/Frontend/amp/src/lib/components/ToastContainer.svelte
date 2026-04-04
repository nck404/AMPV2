<script>
	import { toasts, dismissToast } from "$lib/stores/toast.js";
	import { fly, fade } from "svelte/transition";
	import { flip } from "svelte/animate";

	const getIcon = (type) => {
		switch (type) {
			case 'success': return 'bx-check-circle text-green-500';
			case 'error': return 'bx-x-circle text-rose-500';
			case 'warning': return 'bx-error text-amber-500';
			case 'info':
			default: return 'bx-info-circle text-blue-500';
		}
	};

	const getBorderColor = (type) => {
		switch (type) {
			case 'success': return 'border-green-500';
			case 'error': return 'border-rose-500';
			case 'warning': return 'border-amber-500';
			case 'info':
			default: return 'border-blue-500';
		}
	};
</script>

<div class="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-xs">
	{#each $toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ x: 50, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="pointer-events-auto flex items-center p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 border-l-4 {getBorderColor(toast.type)}"
			role="alert"
		>
			<div class="inline-flex items-center justify-center flex-shrink-0">
				<i class="bx {getIcon(toast.type)} text-2xl"></i>
			</div>
			<div class="ml-3 text-sm font-semibold text-slate-700">
				{toast.message}
			</div>
			<button
				type="button"
				class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-slate-400 hover:text-slate-800 rounded-lg p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8 transition-colors"
				aria-label="Close"
				onclick={() => dismissToast(toast.id)}
			>
				<span class="sr-only">Đóng</span>
				<i class="bx bx-x text-xl"></i>
			</button>
		</div>
	{/each}
</div>

<style>
	/* Make sure the container stays above other elements but below modals if necessary */
	div {
		will-change: transform;
	}
</style>
