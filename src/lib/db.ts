import type { AstroGlobal } from 'astro';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<D1Result>;
  run(): Promise<D1Result>;
  first<T = unknown>(): Promise<T | null>;
}

export interface D1Result {
  results: unknown[];
  success: boolean;
  error?: string;
  meta?: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface DataRow {
  [key: string]: unknown;
}

let localDbInstance: LocalDatabase | null = null;

class LocalDatabase implements D1Database {
  private tables: Map<string, DataRow[]> = new Map();
  private lastRowId: number = 0;

  constructor() {
    this.initTables();
  }

  private initTables() {
    this.tables.set('posts', []);
    this.tables.set('software', []);
    this.tables.set('projects', []);
    this.tables.set('todos', []);
    this.tables.set('suggestions', []);
    this.tables.set('votes', []);
  }

  prepare(query: string): D1PreparedStatement {
    return new LocalPreparedStatement(this, query);
  }

  async executeQuery(sql: string, params: unknown[]): Promise<D1Result> {
    try {
      const query = sql.trim().toUpperCase();
      
      if (query.startsWith('SELECT')) {
        return this.handleSelect(sql, params);
      }
      
      if (query.startsWith('INSERT')) {
        return this.handleInsert(sql, params);
      }
      
      if (query.startsWith('UPDATE')) {
        return this.handleUpdate(sql, params);
      }
      
      if (query.startsWith('DELETE')) {
        return this.handleDelete(sql, params);
      }

      return { results: [], success: true };
    } catch (error) {
      return { results: [], success: false, error: String(error) };
    }
  }

  private parseTableName(sql: string): string {
    const patterns = [
      /FROM\s+(\w+)/i,
      /INTO\s+(\w+)/i,
      /UPDATE\s+(\w+)/i,
      /DELETE\s+FROM\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = sql.match(pattern);
      if (match) return match[1].toLowerCase();
    }
    return '';
  }

  private handleSelect(sql: string, params: unknown[]): D1Result {
    const tableName = this.parseTableName(sql);
    let results = [...(this.tables.get(tableName) || [])];
    
    if (sql.includes('WHERE published = 1') || sql.includes('WHERE published=1')) {
      results = results.filter(r => r.published === 1 || r.published === true);
    }
    
    if (sql.includes('WHERE published = ?') || sql.includes('WHERE published=?')) {
      const published = params[0];
      results = results.filter(r => r.published === published);
    }
    
    if (sql.includes('WHERE id = ?') || sql.includes('WHERE id=?')) {
      const id = params[0];
      results = results.filter(r => r.id === id);
    }
    
    if (sql.includes('WHERE slug = ?') || sql.includes('WHERE slug=?')) {
      const slug = params[0];
      results = results.filter(r => r.slug === slug);
    }
    
    if (sql.includes('WHERE status = ?') || sql.includes('WHERE status=?')) {
      const status = params[0];
      results = results.filter(r => r.status === status);
    }
    
    if (sql.includes('WHERE status != ?') || sql.includes('WHERE status!=?')) {
      const status = params[0];
      results = results.filter(r => r.status !== status);
    }
    
    if (sql.includes('WHERE suggestion_id = ? AND voter_id = ?') || 
        sql.includes('WHERE suggestion_id=? AND voter_id=?')) {
      const suggestionId = params[0];
      const voterId = params[1];
      results = results.filter(r => 
        r.suggestion_id === suggestionId && r.voter_id === voterId
      );
    }
    
    if (sql.includes('ORDER BY created_at DESC')) {
      results.sort((a, b) => {
        const aTime = new Date(a.created_at as string || 0).getTime();
        const bTime = new Date(b.created_at as string || 0).getTime();
        return bTime - aTime;
      });
    }
    
    if (sql.includes('ORDER BY votes DESC')) {
      results.sort((a, b) => ((b.votes as number) || 0) - ((a.votes as number) || 0));
    }
    
    if (sql.includes('COUNT(*)')) {
      return {
        results: [{ count: results.length }],
        success: true,
        meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 1, rows_written: 0 }
      };
    }
    
    return {
      results,
      success: true,
      meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: results.length, rows_written: 0 }
    };
  }

  private handleInsert(sql: string, params: unknown[]): D1Result {
    const tableName = this.parseTableName(sql);
    const table = this.tables.get(tableName) || [];
    
    this.lastRowId++;
    const now = new Date().toISOString();
    
    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!columnsMatch) {
      return { results: [], success: false, error: 'Invalid INSERT syntax' };
    }
    
    const columns = columnsMatch[1].split(',').map(c => c.trim());
    const valuesPart = columnsMatch[2];
    
    const row: DataRow = {
      id: this.lastRowId,
      created_at: now,
      updated_at: now
    };
    
    let paramIndex = 0;
    const valueTokens = this.parseValues(valuesPart);
    
    columns.forEach((col, i) => {
      const token = valueTokens[i];
      if (token === '?') {
        row[col] = params[paramIndex++];
      } else if (token.toUpperCase() === 'CURRENT_TIMESTAMP') {
        row[col] = now;
      } else if (token.startsWith("'") && token.endsWith("'")) {
        row[col] = token.slice(1, -1);
      } else if (!isNaN(Number(token))) {
        row[col] = Number(token);
      } else if (token.toUpperCase() === 'TRUE' || token.toUpperCase() === 'FALSE') {
        row[col] = token.toUpperCase() === 'TRUE';
      } else {
        row[col] = token;
      }
    });
    
    table.push(row);
    this.tables.set(tableName, table);
    
    return {
      results: [],
      success: true,
      meta: { duration: 0, changes: 1, last_row_id: this.lastRowId, rows_read: 0, rows_written: 1 }
    };
  }

  private parseValues(valuesStr: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];
      
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        current += char;
        if (i + 1 < valuesStr.length && valuesStr[i + 1] === stringChar) {
          current += valuesStr[++i];
        } else {
          inString = false;
        }
      } else if (!inString && char === ',') {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      tokens.push(current.trim());
    }
    
    return tokens;
  }

  private handleUpdate(sql: string, params: unknown[]): D1Result {
    const tableName = this.parseTableName(sql);
    const table = this.tables.get(tableName) || [];
    let changes = 0;

    const setMatch = sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
    if (!setMatch) {
      return { results: [], success: true, meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: 0, rows_written: 0 } };
    }

    const idParam = params[params.length - 1];
    const idValue = typeof idParam === 'string' ? parseInt(idParam, 10) : idParam;

    const idIndex = table.findIndex(r => {
      if (sql.includes('WHERE id = ?') || sql.includes('WHERE id=?')) {
        return r.id === idValue || String(r.id) === String(idParam);
      }
      return false;
    });

    if (idIndex !== -1) {
      const setClause = setMatch[1].replace(/\s+/g, ' ').trim();
      const assignments = setClause.split(',').map(s => s.trim());

      let paramIndex = 0;

      for (const assignment of assignments) {
        const colMatch = assignment.match(/^(\w+)\s*=\s*(.+)$/);
        if (!colMatch) continue;

        const col = colMatch[1];
        const value = colMatch[2].trim();

        const incrementMatch = value.match(/^(\w+)\s*\+\s*\?$/);
        if (incrementMatch && incrementMatch[1] === col) {
          const increment = params[paramIndex];
          table[idIndex][col] = ((table[idIndex][col] as number) || 0) + (typeof increment === 'number' ? increment : 1);
          paramIndex++;
        } else if (value === '?') {
          table[idIndex][col] = params[paramIndex];
          paramIndex++;
        } else if (value.toUpperCase() === 'CURRENT_TIMESTAMP') {
          table[idIndex][col] = new Date().toISOString();
        }
      }

      changes = 1;
    }

    this.tables.set(tableName, table);

    return {
      results: [],
      success: true,
      meta: { duration: 0, changes, last_row_id: 0, rows_read: 0, rows_written: changes }
    };
  }

  private handleDelete(sql: string, params: unknown[]): D1Result {
    const tableName = this.parseTableName(sql);
    const table = this.tables.get(tableName) || [];
    const initialLength = table.length;
    
    let filtered = table;
    
    if (sql.includes('WHERE id = ?') || sql.includes('WHERE id=?')) {
      const idParam = params[0];
      const idValue = typeof idParam === 'string' ? parseInt(idParam, 10) : idParam;
      filtered = table.filter(r => r.id !== idValue && String(r.id) !== String(idParam));
    }
    
    if (sql.includes('WHERE suggestion_id = ?') || sql.includes('WHERE suggestion_id=?')) {
      const suggestionIdParam = params[0];
      const suggestionIdValue = typeof suggestionIdParam === 'string' ? parseInt(suggestionIdParam, 10) : suggestionIdParam;
      filtered = table.filter(r => r.suggestion_id !== suggestionIdValue && String(r.suggestion_id) !== String(suggestionIdParam));
    }
    
    this.tables.set(tableName, filtered);
    const changes = initialLength - filtered.length;
    
    return {
      results: [],
      success: true,
      meta: { duration: 0, changes, last_row_id: 0, rows_read: 0, rows_written: changes }
    };
  }
}

class LocalPreparedStatement implements D1PreparedStatement {
  private db: LocalDatabase;
  private sql: string;
  private params: unknown[] = [];

  constructor(db: LocalDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  bind(...values: unknown[]): D1PreparedStatement {
    this.params = values;
    return this;
  }

  async all(): Promise<D1Result> {
    return this.db.executeQuery(this.sql, this.params);
  }

  async run(): Promise<D1Result> {
    return this.db.executeQuery(this.sql, this.params);
  }

  async first<T = unknown>(): Promise<T | null> {
    const result = await this.db.executeQuery(this.sql, this.params);
    return (result.results[0] as T) || null;
  }
}

function getLocalDB(): D1Database {
  if (!localDbInstance) {
    localDbInstance = new LocalDatabase();
  }
  return localDbInstance;
}

export function getDB(context: { locals?: Record<string, unknown> } | AstroGlobal | null | undefined): D1Database {
  const runtime = context?.locals?.runtime;
  if (runtime?.env?.DB) {
    return runtime.env.DB;
  }
  return getLocalDB();
}

export async function query<T = unknown>(
  db: D1Database, 
  sql: string, 
  params: unknown[] = []
): Promise<T[]> {
  const stmt = db.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const result = await bound.all();
  return result.results as T[];
}

export async function queryOne<T = unknown>(
  db: D1Database, 
  sql: string, 
  params: unknown[] = []
): Promise<T | null> {
  const stmt = db.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  return await bound.first<T>();
}

export async function execute(
  db: D1Database, 
  sql: string, 
  params: unknown[] = []
): Promise<D1Result> {
  const stmt = db.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  return await bound.run();
}

export async function insertAndGetId(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<number | null> {
  const result = await execute(db, sql, params);
  return result.meta?.last_row_id || null;
}
