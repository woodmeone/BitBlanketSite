<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  suggestionId: number;
  initialVotes: number;
}>();

const votes = ref(props.initialVotes);
const hasVoted = ref(false);
const isLoading = ref(false);

const checkVoted = async () => {
  const votedKey = `voted-${props.suggestionId}`;
  hasVoted.value = localStorage.getItem(votedKey) === 'true';
};

const handleVote = async () => {
  if (hasVoted.value) return;
  
  isLoading.value = true;
  
  try {
    const votedKey = `voted-${props.suggestionId}`;
    localStorage.setItem(votedKey, 'true');
    votes.value += 1;
    hasVoted.value = true;
  } catch (error) {
    console.error('投票失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkVoted();
});
</script>

<template>
  <button
    @click="handleVote"
    :disabled="hasVoted || isLoading"
    :class="[
      'flex items-center gap-1 px-3 py-1 transition-all',
      hasVoted 
        ? 'bg-accent text-accent-foreground cursor-default' 
        : 'border-2 border-primary/20 hover:border-primary/40 cursor-pointer'
    ]"
  >
    <span>{{ hasVoted ? '👍' : '👍' }}</span>
    <span>{{ votes }}</span>
  </button>
</template>
