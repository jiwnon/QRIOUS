/**
 * Supabase DB 타입 (생성: npm run db:generate)
 * 로컬에서 supabase 연결 후 위 명령으로 자동 생성 가능
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          name_i18n: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      tables: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          table_number: number | null;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tables']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tables']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          name_i18n: Json;
          description_i18n: Json;
          price: number;
          image_url: string | null;
          docent_content: string | null;
          sort_order: number;
          is_available: boolean;
          category: string | null;
          spicy_level: number;
          ai_docent_ko: string | null;
          ai_docent_en: string | null;
          ai_docent_zh: string | null;
          ai_docent_ja: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          status: string;
          total_amount: number;
          payment_status: string;
          locale: string | null;
          payment_provider: string | null;
          payment_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          options: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      private_reviews: {
        Row: {
          id: string;
          order_id: string;
          restaurant_id: string;
          rating: number;
          food_rating: number | null;
          service_rating: number | null;
          comment: string | null;
          liked_items: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['private_reviews']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['private_reviews']['Insert']>;
      };
      weekly_reports: {
        Row: {
          id: string;
          restaurant_id: string;
          week_start: string;
          report_json: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weekly_reports']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_reports']['Insert']>;
      };
      restaurant_owners: {
        Row: {
          user_id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_owners']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurant_owners']['Insert']>;
      };
    };
  };
}
