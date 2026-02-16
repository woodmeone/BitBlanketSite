<script setup lang="ts">
import { ref, onMounted } from 'vue';

const moodThemes = [
  {
    id: 'creative',
    name: '创造激情',
    description: '充满创意和激情',
    colors: {
      primary: '#d4463f',
      secondary: '#f5f0e8',
      tertiary: '#1a1a1a',
    },
  },
  {
    id: 'calm',
    name: '平静专注',
    description: '沉静思考的时刻',
    colors: {
      primary: '#6b6556',
      secondary: '#f5f0e8',
      tertiary: '#1a1a1a',
    },
  },
  {
    id: 'energetic',
    name: '活力满满',
    description: '充满能量和动力',
    colors: {
      primary: '#ff6b6b',
      secondary: '#ffe66d',
      tertiary: '#1a1a1a',
    },
  },
  {
    id: 'melancholy',
    name: '忧郁沉思',
    description: '深度思考的状态',
    colors: {
      primary: '#4a5568',
      secondary: '#e8dcc8',
      tertiary: '#2d3748',
    },
  },
  {
    id: 'joyful',
    name: '快乐愉悦',
    description: '开心的一天',
    colors: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      tertiary: '#1a1a1a',
    },
  },
  {
    id: 'mysterious',
    name: '神秘探索',
    description: '发现新事物',
    colors: {
      primary: '#7c3aed',
      secondary: '#f5f0e8',
      tertiary: '#1a1a1a',
    },
  },
];

const selectedTheme = ref<string>('creative');
const isOpen = ref(false);

const applyTheme = (themeId: string) => {
  const theme = moodThemes.find((t) => t.id === themeId);
  if (theme) {
    document.documentElement.style.setProperty('--theme-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--theme-tertiary', theme.colors.tertiary);
    document.documentElement.style.setProperty('--accent', theme.colors.primary);
  }
};

const handleThemeChange = (themeId: string) => {
  selectedTheme.value = themeId;
  localStorage.setItem('mood-theme', themeId);
  applyTheme(themeId);
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

onMounted(() => {
  const saved = localStorage.getItem('mood-theme');
  if (saved) {
    selectedTheme.value = saved;
    applyTheme(saved);
  }
});
</script>

<template>
  <div class="mood-theme-selector">
    <button
      @click="toggleOpen"
      class="nav-item nav-item-inactive px-3 flex items-center gap-2"
      aria-label="心情配色"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <span class="hidden sm:inline">配色</span>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 p-4 bg-card border-2 border-primary/20 shadow-lg z-50 min-w-[320px]"
      >
        <div class="mb-4">
          <h3 class="font-medium mb-1">今天的心情配色</h3>
          <p class="text-sm text-muted-foreground">
            选择一个配色来表达你的心情和感受
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(theme, index) in moodThemes"
            :key="theme.id"
            @click="handleThemeChange(theme.id)"
            :class="[
              'relative p-3 border-2 shadow-sm transition-all cursor-pointer',
              selectedTheme === theme.id
                ? 'border-primary/50 shadow-md'
                : 'border-primary/20 hover:border-primary/40'
            ]"
            :style="{
              transform: `rotate(${((index % 2) - 0.5) * 2}deg)`,
              backgroundColor: theme.colors.secondary,
            }"
          >
            <div
              v-if="selectedTheme === theme.id"
              class="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: theme.colors.primary }"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="space-y-2">
              <div class="flex gap-1 justify-center">
                <div
                  class="w-5 h-5 border border-primary/30"
                  :style="{ backgroundColor: theme.colors.primary }"
                />
                <div
                  class="w-5 h-5 border border-primary/30"
                  :style="{ backgroundColor: theme.colors.tertiary }"
                />
              </div>
              <div class="text-center">
                <p class="font-medium text-xs">{{ theme.name }}</p>
              </div>
            </div>
          </button>
        </div>

        <button
          @click="toggleOpen"
          class="mt-4 w-full nav-item nav-item-inactive text-center"
        >
          关闭
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mood-theme-selector {
  position: relative;
}
</style>
