
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://77.90.33.66:8000';
export interface Donation {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  discount?: string;
  image?: string;
  mode: string;
  features?: any[];
  chat_prefix?: string;
  command?: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
  mode: string;
  command?: string;
  created_at: string;
  updated_at: string;
}
export interface ModePublic {
  id: number;
  name: string;
  slug: string;
  image?: string;
  server_id?: string;
  leaderboard_enabled?: boolean;
  created_at: string;
  updated_at: string;
}
export interface Mode extends ModePublic {
  leaderboard_table?: string;
  leaderboard_db_host?: string;
  leaderboard_db_port?: number;
  leaderboard_db_name?: string;
  leaderboard_db_user?: string;
  leaderboard_db_password?: string;
}

export interface LeaderboardEntry {
  position: number;
  username: string;
  score: number;
  prefix?: string;
  suffix?: string;
  displayname?: string;
}

export interface LeaderboardResponse {
  mode: string;
  period: string;
  date: string;
  total: number;
  leaderboard: LeaderboardEntry[];
}

export interface Category {
  id: number;
  category_id: string;
  name: string;
  icon?: string;
  mode: string;
  created_at: string;
  updated_at: string;
}

export interface Promocode {
  id: number;
  code: string;
  discount: number;
  active: boolean;
  uses_count: number;
  max_uses?: number;
  one_per_account: boolean;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  username: string;
  email?: string;
  product_type: string;
  product_id: number;
  product_name: string;
  quantity: number;
  duration?: string;
  price: number;
  final_price: number;
  promocode?: string;
  discount_amount: number;
  cashback_amount: number;
  cashback_percent: number;
  payment_method: string;
  status: string;
  mode: string;
  test_mode: boolean;
  command?: string;
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  total_orders: number;
  total_revenue: number;
  total_promo_uses: number;
  daily_orders: Array<{ date: string; orders: number; revenue: number }>;
  daily_revenue: Array<{ date: string; orders: number; revenue: number }>;
  promo_stats: Array<{ code: string; uses: number; discount: number }>;
  top_products: Array<{ name: string; sales: number; revenue: number }>;
}

export interface AdminPermissions {
  view_stats?: boolean;
  manage_promo?: boolean;
  manage_donations?: boolean;
  manage_items?: boolean;
  manage_orders?: boolean;
  manage_categories?: boolean;
  manage_modes?: boolean;
  manage_game_modes?: boolean;
  manage_settings?: boolean;
  manage_admins?: boolean;
}

export interface Admin {
  id: number;
  username: string;
  is_active: boolean;
  role: string; // "super_admin" | "moderator"
  permissions?: AdminPermissions;
  created_at: string;
  updated_at?: string;
}

export interface AdminCreate {
  username: string;
  password: string;
  role?: string;
  permissions?: AdminPermissions;
}

export interface AdminUpdate {
  is_active?: boolean;
  role?: string;
  permissions?: AdminPermissions;
}
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};
const getHeaders = (includeAuth = false) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
export const authAPI = {
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Неверный логин или пароль');
    }
    
    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },
  
  async register(username: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка регистрации');
    }
    
    return response.json();
  },
  
  async me() {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error('Не авторизован');
    }
    
    return response.json();
  },
  
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('adminAuth');
    }
  },
};
export const donationsAPI = {
  async getAll(mode?: string, admin: boolean = false): Promise<Donation[]> {
    const endpoint = admin ? '/api/donations/admin' : '/api/donations';
    const url = mode ? `${API_URL}${endpoint}?mode=${mode}` : `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: admin ? getHeaders(true) : getHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка загрузки донатов');
    return response.json();
  },
  
  async getById(id: number): Promise<Donation> {
    const response = await fetch(`${API_URL}/api/donations/${id}`);
    if (!response.ok) throw new Error('Донат не найден');
    return response.json();
  },
  
  async create(data: Partial<Donation>): Promise<Donation> {
    const response = await fetch(`${API_URL}/api/donations`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания доната');
    return response.json();
  },
  
  async update(id: number, data: Partial<Donation>): Promise<Donation> {
    const response = await fetch(`${API_URL}/api/donations/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления доната');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/donations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления доната');
  },
};
export const itemsAPI = {
  async getAll(mode?: string, category?: string, admin: boolean = false): Promise<Item[]> {
    const endpoint = admin ? '/api/items/admin' : '/api/items';
    let url = `${API_URL}${endpoint}?`;
    if (mode) url += `mode=${mode}&`;
    if (category) url += `category=${category}&`;
    
    const response = await fetch(url, {
      headers: admin ? getHeaders(true) : getHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка загрузки предметов');
    return response.json();
  },
  
  async getById(id: number): Promise<Item> {
    const response = await fetch(`${API_URL}/api/items/${id}`);
    if (!response.ok) throw new Error('Предмет не найден');
    return response.json();
  },
  
  async create(data: Partial<Item>): Promise<Item> {
    const response = await fetch(`${API_URL}/api/items`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания предмета');
    return response.json();
  },
  
  async update(id: number, data: Partial<Item>): Promise<Item> {
    const response = await fetch(`${API_URL}/api/items/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления предмета');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления предмета');
  },
};
export const modesAPI = {
  async getAll(): Promise<Mode[]> {
    const response = await fetch(`${API_URL}/api/modes`);
    if (!response.ok) throw new Error('Ошибка загрузки режимов');
    return response.json();
  },
  
  async create(data: Partial<Mode>): Promise<Mode> {
    const response = await fetch(`${API_URL}/api/modes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания режима');
    return response.json();
  },
  
  async update(id: number, data: Partial<Mode>): Promise<Mode> {
    const response = await fetch(`${API_URL}/api/modes/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления режима');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/modes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления режима');
  },
};
export const categoriesAPI = {
  async getAll(mode?: string): Promise<Category[]> {
    const url = mode ? `${API_URL}/api/categories?mode=${mode}` : `${API_URL}/api/categories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    return response.json();
  },
  
  async create(data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания категории');
    return response.json();
  },
  
  async update(id: number, data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления категории');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления категории');
  },
};
export interface GameMode {
  id: number;
  title: string;
  description: string;
  features: string[] | null;
  image: string | null;
  status: "Работает" | "В разработке";
  video_url: string | null;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameModeCreate {
  title: string;
  description: string;
  features?: string[];
  image?: string;
  status: "Работает" | "В разработке";
  video_url?: string;
  order?: number;
  active?: boolean;
}

export interface GameModeUpdate {
  title?: string;
  description?: string;
  features?: string[];
  image?: string;
  status?: "Работает" | "В разработке";
  video_url?: string;
  order?: number;
  active?: boolean;
}

export const gameModesAPI = {
  async getAll(includeInactive: boolean = false): Promise<GameMode[]> {
    const params = includeInactive ? '?include_inactive=true' : '';
    const response = await fetch(`${API_URL}/api/game-modes${params}`);
    if (!response.ok) throw new Error('Failed to fetch game modes');
    return response.json();
  },

  async getById(id: number): Promise<GameMode> {
    const response = await fetch(`${API_URL}/api/game-modes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch game mode');
    return response.json();
  },

  async create(gameMode: GameModeCreate): Promise<GameMode> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/game-modes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(gameMode),
    });
    if (!response.ok) throw new Error('Failed to create game mode');
    return response.json();
  },

  async update(id: number, gameMode: GameModeUpdate): Promise<GameMode> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/game-modes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(gameMode),
    });
    if (!response.ok) throw new Error('Failed to update game mode');
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/game-modes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete game mode');
  },
};

export const promocodesAPI = {
  async getAll(): Promise<Promocode[]> {
    const response = await fetch(`${API_URL}/api/promocodes`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка загрузки промокодов');
    return response.json();
  },
  
  async validate(code: string, username?: string): Promise<{ valid: boolean; discount: number; code: string }> {
    const url = username 
      ? `${API_URL}/api/promocodes/validate/${code}?username=${encodeURIComponent(username)}`
      : `${API_URL}/api/promocodes/validate/${code}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Промокод недействителен');
    }
    return response.json();
  },
  
  async create(data: Partial<Promocode>): Promise<Promocode> {
    const response = await fetch(`${API_URL}/api/promocodes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания промокода');
    return response.json();
  },
  
  async update(id: number, data: Partial<Promocode>): Promise<Promocode> {
    const response = await fetch(`${API_URL}/api/promocodes/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления промокода');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/promocodes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления промокода');
  },
};
export const ordersAPI = {
  async getAll(status?: string, mode?: string): Promise<Order[]> {
    let url = `${API_URL}/api/orders?`;
    if (status) url += `status=${status}&`;
    if (mode) url += `mode=${mode}&`;
    
    const response = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    return response.json();
  },
  
  async getById(id: number): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Заказ не найден');
    return response.json();
  },
  
  async create(data: Partial<Order>): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка создания заказа');
    return response.json();
  },
  
  async update(id: number, data: { status: string }): Promise<Order> {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления заказа');
    return response.json();
  },
  
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка удаления заказа');
  },
};
export const statisticsAPI = {
  async get(days: number = 7): Promise<Statistics> {
    const response = await fetch(`${API_URL}/api/statistics?days=${days}`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка загрузки статистики');
    return response.json();
  },
};
export interface SiteSettings {
  cashback: number;
  online_max: number;
  test_mode: boolean;
  cashback_command?: string;
}

export interface ServerStatus {
  online: number;
  max: number;
  cached?: boolean;
}

export const settingsAPI = {
  async get(): Promise<SiteSettings> {
    const response = await fetch(`${API_URL}/api/settings`);
    if (!response.ok) throw new Error('Ошибка загрузки настроек');
    return response.json();
  },
  
  async update(data: SiteSettings): Promise<SiteSettings> {
    const response = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка обновления настроек');
    return response.json();
  },
};
export const serverStatusAPI = {
  async get(): Promise<ServerStatus> {
    const response = await fetch(`${API_URL}/api/server-status`);
    if (!response.ok) throw new Error('Ошибка загрузки статуса сервера');
    return response.json();
  },
};
export const adminsAPI = {
  async getMe(): Promise<Admin> {
    const response = await fetch(`${API_URL}/api/admins/me`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка загрузки информации об админе');
    return response.json();
  },

  async getAll(): Promise<Admin[]> {
    const response = await fetch(`${API_URL}/api/admins/`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка загрузки списка админов');
    return response.json();
  },

  async create(data: AdminCreate): Promise<Admin> {
    const response = await fetch(`${API_URL}/api/admins/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка создания админа');
    }
    return response.json();
  },

  async update(id: number, data: AdminUpdate): Promise<Admin> {
    const response = await fetch(`${API_URL}/api/admins/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка обновления админа');
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/admins/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка удаления админа');
    }
  },

  async checkPermissions(): Promise<{ role: string; permissions: AdminPermissions }> {
    const response = await fetch(`${API_URL}/api/admins/permissions/check`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Ошибка проверки прав доступа');
    return response.json();
  },
};
export interface Banner {
  id: number;
  image_url: string;
  link?: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerCreate {
  image_url: string;
  link?: string;
  order?: number;
  active?: boolean;
}

export interface BannerUpdate {
  image_url?: string;
  link?: string;
  order?: number;
  active?: boolean;
}
export const bannersAPI = {
  async getAll(activeOnly = true): Promise<Banner[]> {
    const response = await fetch(`${API_URL}/api/banners?active_only=${activeOnly}`);
    if (!response.ok) throw new Error('Ошибка загрузки баннеров');
    return response.json();
  },

  async getById(id: number): Promise<Banner> {
    const response = await fetch(`${API_URL}/api/banners/${id}`);
    if (!response.ok) throw new Error('Баннер не найден');
    return response.json();
  },

  async create(banner: BannerCreate): Promise<Banner> {
    const response = await fetch(`${API_URL}/api/banners`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(banner),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка создания баннера');
    }
    return response.json();
  },

  async update(id: number, banner: BannerUpdate): Promise<Banner> {
    const response = await fetch(`${API_URL}/api/banners/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(banner),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка обновления баннера');
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/banners/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка удаления баннера');
    }
  },
};
export interface LeaderboardPublic {
  id: number;
  mode_id: number;
  title: string;
  icon: string | null;
  gradient: string | null;
  color: string | null;
  bg_light: string | null;
  order: number;
  active: boolean;
}
export const leaderboardsAPI = {
  async getForMode(modeSlug: string): Promise<LeaderboardPublic[]> {
    const response = await fetch(`${API_URL}/api/leaderboards/mode/${modeSlug}`, {
      headers: getHeaders(false),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка получения списка топов');
    }
    return response.json();
  },
  async getData(
    leaderboardId: number,
    period: string = 'daily',
    date?: string,
    limit: number = 100
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
    });
    if (date) {
      params.append('date', date);
    }
    
    const response = await fetch(`${API_URL}/api/leaderboards/${leaderboardId}/data?${params}`, {
      headers: getHeaders(false),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка получения данных топа');
    }
    return response.json();
  },
};

