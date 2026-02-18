<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  suggestionId: number;
  initialVotes: number;
}>();

const votes = ref(props.initialVotes);
const hasVoted = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const getVoterId = (): string => {
  if (typeof window === 'undefined') return '';
  let voterId = localStorage.getItem('bit-blanket-voter-id');
  if (!voterId) {
    voterId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('bit-blanket-voter-id', voterId);
  }
  return voterId;
};

const checkVoted = async () => {
  if (typeof window === 'undefined') return;
  
  const localVotedKey = `voted-${props.suggestionId}`;
  if (localStorage.getItem(localVotedKey) === 'true') {
    hasVoted.value = true;
    return;
  }
  
  try {
    const voterId = getVoterId();
    const response = await fetch(`/api/votes?suggestion_id=${props.suggestionId}&voter_id=${encodeURIComponent(voterId)}`);
    const data = await response.json();
    
    if (data.success && data.hasVoted) {
      hasVoted.value = true;
      localStorage.setItem(localVotedKey, 'true');
    }
  } catch (error) {
    console.error('检查投票状态失败:', error);
  }
};

const handleVote = async () => {
  if (hasVoted.value || isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const voterId = getVoterId();
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        suggestion_id: props.suggestionId, 
        voter_id: voterId 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      votes.value = data.votes;
      hasVoted.value = true;
      localStorage.setItem(`voted-${props.suggestionId}`, 'true');
    } else {
      if (data.error === '您已经投过票了') {
        hasVoted.value = true;
        localStorage.setItem(`voted-${props.suggestionId}`, 'true');
      } else {
        errorMessage.value = data.error || '投票失败';
        setTimeout(() => { errorMessage.value = ''; }, 3000);
      }
    }
  } catch (error) {
    console.error('投票失败:', error);
    errorMessage.value = '网络错误，请稍后重试';
    setTimeout(() => { errorMessage.value = ''; }, 3000);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkVoted();
});
</script>

<template>
  <div class="flex flex-col items-end">
    <button
      @click.stop.prevent="handleVote"
      :disabled="hasVoted || isLoading"
      :class="[
        'flex items-center gap-1 px-3 py-1 transition-all',
        hasVoted 
          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 cursor-default' 
          : 'border-2 border-primary/20 hover:border-primary/40 cursor-pointer hover:bg-primary/5'
      ]"
    >
      <span v-if="isLoading" class="animate-spin">⏳</span>
      <span v-else>👍</span>
      <span>{{ votes }}</span>
    </button>
    <span v-if="errorMessage" class="text-xs text-red-500 mt-1">{{ errorMessage }}</span>
    <span v-if="hasVoted && !errorMessage" class="text-xs text-green-600 dark:text-green-400 mt-1">已投票</span>
  </div>
</template>
