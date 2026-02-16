---
title: '使用Claude构建智能助手'
description: '详细讲解如何利用Claude API构建自己的智能助手，包含完整代码示例'
pubDate: 2026-02-10
heroImage: '/blog/claude-assistant.jpg'
tags: ['Claude', 'API', '实践']
category: 'ai'
featured: false
---

## 准备工作

在开始之前，你需要：

1. Anthropic API密钥
2. Node.js开发环境
3. 基础的JavaScript/TypeScript知识

## 项目初始化

```bash
mkdir claude-assistant
cd claude-assistant
npm init -y
npm install @anthropic-ai/sdk
```

## 基础代码实现

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function chat(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: message }
    ],
  });
  
  return response.content[0].text;
}

// 使用示例
const answer = await chat('你好，请介绍一下你自己');
console.log(answer);
```

## 添加对话记忆

为了让助手能够记住上下文，我们需要维护对话历史：

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class ChatAssistant {
  private messages: Message[] = [];
  
  async chat(userMessage: string): Promise<string> {
    // 添加用户消息
    this.messages.push({ role: 'user', content: userMessage });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: this.messages,
    });
    
    const assistantMessage = response.content[0].text;
    
    // 添加助手回复
    this.messages.push({ role: 'assistant', content: assistantMessage });
    
    return assistantMessage;
  }
  
  clearHistory() {
    this.messages = [];
  }
}
```

## 总结

通过本文，你学会了：

- 如何设置Claude API
- 实现基础的对话功能
- 添加对话记忆功能

下一步可以尝试添加更多功能，如流式输出、工具调用等。
