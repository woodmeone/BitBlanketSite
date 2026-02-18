<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  suggestionId: number;
  initialVotes: number;
}>();

const votes = ref(props.initialVotes);
const hasVoted = ref(false);
const isLoading = ref(false);

const getVoterId = (): string => {
  let voterId = localStorage.getItem('bit-blanket-voter-id');
  if (!voterId) {
    voterId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bit-blanket-voter-id', voterId);
  }
  return voterId;
};

const checkVoted = async () => {
  const localVotedKey = `voted-${props.suggestionId}`;
  if (localStorage.getItem(localVotedKey) === 'true') {
    hasVoted.value = true;
    return;
  }
  
  try {
    const voterId = getVoterId();
    const response = await fetch(`/api/votes?suggestion_id=${props.suggestionId}&voter_id=${voterId}`);
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
      }
    }
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
