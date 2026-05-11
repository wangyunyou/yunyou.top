<template>
  <div class="p-4 grid grid-cols-2 gap-4">
    <div
      v-for="i in 4"
      :key="i"
      class="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors cursor-pointer group"
    >
      <div
        class="h-32 bg-slate-900 rounded mb-3 flex items-center justify-center text-slate-600 group-hover:text-sky-500 transition-colors"
      >
        Project Screenshot {{ i }}
      </div>
      <h3 class="font-bold text-slate-200">Cool Project {{ i }}</h3>
      <p class="text-sm text-slate-400 mt-1">
        A brief description of this amazing project and the tech stack used.
      </p>
    </div>
  </div>
</template>
