<script>
  let {
    quizQuestion,
    quizOptions,
    selectedQuizAnswer,
    quizFeedback,
    answerQuiz,
    generateNewQuiz
  } = $props();
</script>

<div class="glass rounded-3xl p-5 border border-[#f2e9e1] space-y-4">
  <h2 class="text-sm font-bold uppercase tracking-wider text-[#797593] flex items-center gap-2 border-b border-[#f2e9e1] pb-2">
    <i class="bx bx-question-mark text-[#ea9d34]"></i> Câu hỏi trắc nghiệm cử chỉ
  </h2>
  <div class="bg-[#fffaf3] border border-[#f2e9e1] rounded-2xl p-4 text-center space-y-2">
    <p class="text-xs text-[#797593] font-bold uppercase tracking-wider">Cử chỉ sau đây là của từ nào?</p>
    <p class="text-sm text-[#2c293e] italic font-medium leading-relaxed">"{quizQuestion.description}"</p>
  </div>

  <div class="space-y-2">
    {#each quizOptions as option}
      <button
        onclick={() => answerQuiz(option)}
        disabled={selectedQuizAnswer !== null}
        class="w-full p-4 rounded-2xl text-left border font-bold text-sm transition-all flex items-center justify-between
          {selectedQuizAnswer === option 
            ? option === quizQuestion.word 
              ? 'bg-green-500/10 border-green-500 text-green-700' 
              : 'bg-red-500/10 border-red-500 text-red-700'
            : 'bg-[#fffaf3] border-[#f2e9e1] text-[#2c293e] hover:bg-[#ea9d34]/10 hover:border-[#ea9d34]'
          }"
      >
        <span>{option}</span>
        {#if selectedQuizAnswer === option}
          {#if option === quizQuestion.word}
            <i class="bx bx-check-circle text-lg text-green-600"></i>
          {:else}
            <i class="bx bx-x-circle text-lg text-red-600"></i>
          {/if}
        {/if}
      </button>
    {/each}
  </div>

  {#if selectedQuizAnswer}
    <div class="flex items-center justify-between pt-2">
      <p class="text-xs font-semibold {quizFeedback === 'correct' ? 'text-green-600' : 'text-red-500'}">
        {quizFeedback === 'correct' ? 'Chính xác! Làm tốt lắm.' : `Sai rồi. Đáp án đúng là: ${quizQuestion.word}`}
      </p>
      <button onclick={generateNewQuiz} class="px-4 py-2 bg-[#ea9d34] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all">
        Tiếp tục <i class="bx bx-arrow-to-right"></i>
      </button>
    </div>
  {/if}
</div>
