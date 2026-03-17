// 공통 타입 정의

export type Locale = 'ko' | 'en' | 'zh' | 'ja' | 'ru';

export interface Restaurant {
  id: string;
  name: string;
  name_i18n?: Record<Locale, string>;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type MenuCategory = 'main' | 'side' | 'drink';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  name_i18n?: Record<Locale, string>;
  description?: string;
  description_i18n?: Record<Locale, string>;
  price: number;
  image_url?: string;
  docent_content?: string;
  ai_docent_ko?: string | null;
  ai_docent_en?: string | null;
  ai_docent_zh?: string | null;
  ai_docent_ja?: string | null;
  ai_docent_ru?: string | null;
  sort_order: number;
  is_available: boolean;
  category?: MenuCategory | string | null;
  spicy_level?: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  name: string;
  table_number?: number | null;
  qr_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  locale?: Locale;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  options?: string;
}

export interface PrivateReview {
  id: string;
  order_id: string;
  restaurant_id: string;
  rating: number;
  food_rating?: number | null;
  service_rating?: number | null;
  comment?: string;
  liked_items?: string[];
  created_at: string;
}

/** AI 도슨트 API 응답 형식 */
export interface DocentContent {
  cultural_context: string;
  ingredients: string[];
  recommendation: string;
}

/** 주간 AI 리포트 응답 형식 */
export interface WeeklyReportContent {
  sales_summary: string;
  top_insights: string[];
  recommendations: string[];
  warnings: string[];
}
