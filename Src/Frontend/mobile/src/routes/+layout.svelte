<script>
  import "./layout.css";
  let { children } = $props();
</script>

<div class="min-h-screen bg-[#faf4ed] text-[#575279] selection:bg-[#907aa9]/20 font-sans pb-24">
  {@render children()}
</div>
