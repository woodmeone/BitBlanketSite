<script setup lang="ts">
import { ref, reactive } from 'vue';

const emit = defineEmits<{
  (e: 'submit', data: { type: string; nickname: string; content: string }): void;
  (e: 'close'): void;
}>();

const form = reactive({
  type: 'topic',
  nickname: '',
  content: ''
});

const isSubmitting = ref(false);
const submitStatus = ref<'idle' | 'success' | 'error'>('idle');
const errorMessage = ref('');

const typeOptions = [
  { value: 'topic', label: '选题建议' },
  { value: 'article', label: '文章建议' },
  { value: 'project', label: '项目建议' },
  { value: 'other', label: '其他' }
];

const handleSubmit = async () => {
  if (!form.content.trim()) {
    errorMessage.value = '请输入建议内容';
    return;
  }
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    emit('submit', {
      type: form.type,
      nickname: form.nickname.trim() || '匿名',
      content: form.content.trim()
    });
    
    submitStatus.value = 'success';
    form.content = '';
    form.nickname = '';
    
    setTimeout(() => {
      emit('close');
    }, 1500);
  } catch (error) {
    submitStatus.value = 'error';
    errorMessage.value = '提交失败，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="suggestion-form space-y-4">
    <div v-if="submitStatus === 'success'" class="text-center py-4">
      <div class="text-green-500 text-lg mb-2">✓ 提交成功！</div>
      <p class="text-muted-foreground text-sm">感谢您的建议</p>
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">建议类型</label>
        <select 
          v-model="form.type"
          class="w-full p-2 border-2 border-primary/20 bg-input-background focus:border-primary/40 outline-none"
        >
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">你的昵称</label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="匿名"
          class="w-full p-2 border-2 border-primary/20 bg-input-background focus:border-primary/40 outline-none"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">建议内容 *</label>
        <textarea
          v-model="form.content"
          rows="4"
          placeholder="请详细描述你的建议..."
          class="w-full p-2 border-2 border-primary/20 bg-input-background focus:border-primary/40 outline-none resize-none"
          required
        ></textarea>
      </div>
      
      <div v-if="errorMessage" class="text-red-500 text-sm">
        {{ errorMessage }}
      </div>
      
      <div class="flex gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 nav-item nav-item-inactive text-center"
          :disabled="isSubmitting"
        >
          取消
        </button>
        <button
          type="submit"
          class="flex-1 nav-item nav-item-active text-center"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '提交中...' : '提交建议' }}
        </button>
      </div>
    </form>
  </div>
</template>
