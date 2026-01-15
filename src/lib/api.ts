// API Service for GEX Dashboard Backend
const API_BASE = 'http://localhost:8000';

// Token management
export function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export function getStoredUser(): { id: string; email: string; is_approved: boolean } | null {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: { id: string; email: string; is_approved: boolean }): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new Error('Unauthorized - please login again');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

// Auth API
export async function login(email: string, password: string) {
  const response = await apiRequest<{
    access_token: string;
    user: { id: string; email: string; is_approved: boolean };
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(response.access_token);
  setStoredUser(response.user);
  return response;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearAuthToken();
  }
}

export async function getCurrentUser() {
  return apiRequest<{ id: string; email: string; is_approved: boolean }>('/auth/me');
}

// Journal/Trades API
export interface ApiTrade {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  entry_time: string;
  exit_time: string | null;
  pnl: number | null;
  status: 'open' | 'closed';
  notes: Array<{ content: string; created_at: string }>;
  tags: string[];
  created_at: string;
}

export async function getTrades(params?: {
  symbol?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<ApiTrade[]> {
  const searchParams = new URLSearchParams();
  if (params?.symbol) searchParams.set('symbol', params.symbol);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return apiRequest<ApiTrade[]>(`/journal/trades${query ? `?${query}` : ''}`);
}

export async function createTrade(trade: {
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  entry_time: string;
  exit_price?: number;
  exit_time?: string;
  notes?: string;
  tags?: string[];
}): Promise<{ id: string; status: string; pnl: number | null }> {
  return apiRequest('/journal/trades', {
    method: 'POST',
    body: JSON.stringify(trade),
  });
}

export async function updateTrade(
  tradeId: string,
  updates: {
    exit_price?: number;
    exit_time?: string;
    symbol?: string;
    side?: string;
    quantity?: number;
  }
): Promise<ApiTrade> {
  return apiRequest(`/journal/trades/${tradeId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTrade(tradeId: string): Promise<void> {
  await apiRequest(`/journal/trades/${tradeId}`, { method: 'DELETE' });
}

export async function importTrades(trades: Array<{
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  entry_time: string;
  exit_price?: number;
  exit_time?: string;
  notes?: string;
  tags?: string[];
}>): Promise<{ imported: number; errors: string[] }> {
  return apiRequest('/journal/trades/import', {
    method: 'POST',
    body: JSON.stringify({ trades }),
  });
}

export async function getTradeAnalytics(): Promise<{
  total_trades: number;
  win_rate: number;
  total_pnl: number;
  avg_win: number;
  avg_loss: number;
  best_trade: number;
  worst_trade: number;
}> {
  return apiRequest('/journal/analytics');
}

export async function getCalendarData(month?: string): Promise<Array<{
  date: string;
  pnl: number;
  trade_count: number;
}>> {
  const params = month ? `?month=${month}` : '';
  return apiRequest(`/journal/calendar${params}`);
}

// Add note to trade
export async function addTradeNote(tradeId: string, content: string): Promise<void> {
  await apiRequest(`/journal/trades/${tradeId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// Add tag to trade
export async function addTradeTag(tradeId: string, tag: string): Promise<void> {
  await apiRequest(`/journal/trades/${tradeId}/tags/${encodeURIComponent(tag)}`, {
    method: 'POST',
  });
}

// Get all user tags
export async function getUserTags(): Promise<string[]> {
  return apiRequest('/journal/tags');
}
