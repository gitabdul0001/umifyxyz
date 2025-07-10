import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { generateUniqueCode } from '../utils/generateUniqueCode';

export const useProducts = (userId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadProducts = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        throw error;
      }

      const mappedProducts: Product[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        images: item.images || (item.image ? [item.image] : []), // Handle both old and new format
        features: item.features,
        walletAddress: item.wallet_address,
        uniqueCode: item.unique_code,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'uniqueCode'>) => {
    try {
      const uniqueCode = await generateUniqueCode();
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: productData.userId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image,
          images: productData.images,
          features: productData.features,
          wallet_address: productData.walletAddress,
          unique_code: uniqueCode,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      const newProduct: Product = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        images: data.images || (data.image ? [data.image] : []),
        features: data.features,
        walletAddress: data.wallet_address,
        uniqueCode: data.unique_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          image: updates.image,
          images: updates.images,
          features: updates.features,
          wallet_address: updates.walletAddress,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProductById = async (id: string): Promise<Product | undefined> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error getting product by ID:', error);
        return undefined;
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        images: data.images || (data.image ? [data.image] : []),
        features: data.features,
        walletAddress: data.wallet_address,
        uniqueCode: data.unique_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return undefined;
    }
  };

  const getProductByUniqueCode = async (uniqueCode: string): Promise<Product | undefined> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('unique_code', uniqueCode)
        .single();

      if (error || !data) {
        return undefined;
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        images: data.images || (data.image ? [data.image] : []),
        features: data.features,
        walletAddress: data.wallet_address,
        uniqueCode: data.unique_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting product by unique code:', error);
      return undefined;
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductByUniqueCode,
    refreshProducts: loadProducts,
  };
};