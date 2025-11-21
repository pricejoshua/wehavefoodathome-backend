export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      food_item: {
        Row: {
          created_at: string
          house_id: string
          id: string
          product_id: string
          quantity: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          house_id: string
          id?: string
          product_id: string
          quantity?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          house_id?: string
          id?: string
          product_id?: string
          quantity?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'food_item_house_id_fkey'
            columns: ['house_id']
            isOneToOne: false
            referencedRelation: 'houses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'food_item_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'food_item_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      food_log: {
        Row: {
          action_type: string
          food_id: string
          house_id: string
          id: number
          notes: string | null
          quantity: number | null
          timestamp: string
          unit: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          food_id: string
          house_id: string
          id?: number
          notes?: string | null
          quantity?: number | null
          timestamp?: string
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          food_id?: string
          house_id?: string
          id?: number
          notes?: string | null
          quantity?: number | null
          timestamp?: string
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'food_log_food_id_fkey'
            columns: ['food_id']
            isOneToOne: false
            referencedRelation: 'food_item'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'food_log_house_id_fkey'
            columns: ['house_id']
            isOneToOne: false
            referencedRelation: 'houses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'food_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      houses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
        }
        Insert: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
        }
        Update: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_fkey'
            columns: ['category']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_houses: {
        Row: {
          created_at: string
          house_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          house_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          house_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_houses_house_id_fkey'
            columns: ['house_id']
            isOneToOne: false
            referencedRelation: 'houses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_houses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
    Row: infer R
  }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
  PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
