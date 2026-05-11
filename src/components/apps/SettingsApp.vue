<template>
  <div class="p-6 text-slate-200">
    <h2 class="text-xl font-bold mb-6">Settings</h2>

    <div class="space-y-6">
      <div
        class="flex items-center justify-between p-4 bg-slate-800 rounded border border-slate-700"
      >
        <div>
          <h3 class="font-medium">Dark Mode</h3>
          <p class="text-sm text-slate-400">Toggle system-wide dark mode</p>
        </div>
        <div class="w-12 h-6 bg-sky-600 rounded-full relative cursor-pointer">
          <div
            class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"
          ></div>
        </div>
      </div>

      <div
        class="flex items-center justify-between p-4 bg-slate-800 rounded border border-slate-700"
      >
        <div>
          <h3 class="font-medium">Wallpaper</h3>
          <p class="text-sm text-slate-400">Choose your desktop background</p>
        </div>
        <button class="text-sm text-sky-400 hover:underline">Change</button>
      </div>
    </div>
  </div>
</template>
