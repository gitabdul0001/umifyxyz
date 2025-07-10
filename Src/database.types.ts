export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          price: number
          image: string
          images: string[]
          features: string[]
          wallet_address: string
          unique_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          price: number
          image?: string
          images?: string[]
          features?: string[]
          wallet_address: string
          unique_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          price?: number
          image?: string
          images?: string[]
          features?: string[]
          wallet_address?: string
          unique_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          product_id: string
          product_name: string
          product_price: number
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'completed' | 'failed'
          wallet_address: string
          order_date: string
          notes: string
          tx_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          product_price: number
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: Json
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'completed' | 'failed'
          wallet_address: string
          order_date?: string
          notes?: string
          tx_hash?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          product_price?: number
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          shipping_address?: Json
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'completed' | 'failed'
          wallet_address?: string
          order_date?: string
          notes?: string
          tx_hash?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_name: string
          customer_email: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_name: string
          customer_email: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_name?: string
          customer_email?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
    }
  }
}