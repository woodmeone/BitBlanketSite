import type { ApiResponse, Suggestion, PaginatedResponse } from '../types/api';

const STORAGE_KEY = 'bit-blanket-suggestions';

function getSuggestions(): Suggestion[] {
  if (typeof localStorage === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveSuggestions(suggestions: Suggestion[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
}

function generateId(): number {
  return Date.now();
}

export const suggestionsApi = {
  async list(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    sortBy?: 'votes' | 'createdAt';
  } = {}): Promise<ApiResponse<PaginatedResponse<Suggestion>>> {
    try {
      const { page = 1, pageSize = 10, status, sortBy = 'votes' } = params;
      let suggestions = getSuggestions();
      
      if (status && status !== 'all') {
        suggestions = suggestions.filter(s => s.status === status);
      }
      
      if (sortBy === 'votes') {
        suggestions.sort((a, b) => b.votes - a.votes);
      } else {
        suggestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      const total = suggestions.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const items = suggestions.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          items,
          total,
          page,
          pageSize,
          totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: '获取建议列表失败'
      };
    }
  },

  async create(data: {
    type: Suggestion['type'];
    nickname?: string;
    content: string;
  }): Promise<ApiResponse<Suggestion>> {
    try {
      const suggestions = getSuggestions();
      const newSuggestion: Suggestion = {
        id: generateId(),
        type: data.type,
        nickname: data.nickname || '匿名',
        content: data.content,
        status: 'pending',
        votes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      suggestions.unshift(newSuggestion);
      saveSuggestions(suggestions);
      
      return {
        success: true,
        data: newSuggestion,
        message: '建议提交成功'
      };
    } catch (error) {
      return {
        success: false,
        error: '提交建议失败'
      };
    }
  },

  async vote(suggestionId: number, voterId: string): Promise<ApiResponse<Suggestion>> {
    try {
      const suggestions = getSuggestions();
      const index = suggestions.findIndex(s => s.id === suggestionId);
      
      if (index === -1) {
        return {
          success: false,
          error: '建议不存在'
        };
      }
      
      const votedKey = `voted-${suggestionId}`;
      if (localStorage.getItem(votedKey)) {
        return {
          success: false,
          error: '您已经投过票了'
        };
      }
      
      suggestions[index].votes += 1;
      suggestions[index].updatedAt = new Date().toISOString();
      saveSuggestions(suggestions);
      localStorage.setItem(votedKey, 'true');
      
      return {
        success: true,
        data: suggestions[index],
        message: '投票成功'
      };
    } catch (error) {
      return {
        success: false,
        error: '投票失败'
      };
    }
  },

  async checkVoted(suggestionId: number): Promise<ApiResponse<boolean>> {
    try {
      const votedKey = `voted-${suggestionId}`;
      const voted = localStorage.getItem(votedKey) === 'true';
      return {
        success: true,
        data: voted
      };
    } catch (error) {
      return {
        success: false,
        error: '检查投票状态失败'
      };
    }
  },

  async getStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    completed: number;
  }>> {
    try {
      const suggestions = getSuggestions();
      return {
        success: true,
        data: {
          total: suggestions.length,
          pending: suggestions.filter(s => s.status === 'pending').length,
          approved: suggestions.filter(s => s.status === 'approved').length,
          inProgress: suggestions.filter(s => s.status === 'in_progress').length,
          completed: suggestions.filter(s => s.status === 'completed').length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: '获取统计失败'
      };
    }
  }
};
