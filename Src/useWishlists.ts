import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wishlist } from '../types';

export const useWishlists = (userId?: string) => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadWishlists();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadWishlists = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('Loading wishlists for user:', userId);
      
      // First, get all products for this user
      const { data: userProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId);

      if (productsError) {
        console.error('Error loading user products:', productsError);
        setWishlists([]);
        return;
      }

      if (!userProducts || userProducts.length === 0) {
        console.log('No products found for user');
        setWishlists([]);
        return;
      }

      const productIds = userProducts.map(p => p.id);
      console.log('User product IDs:', productIds);

      // Then get wishlists for those products
      const { data: wishlistsData, error: wishlistsError } = await supabase
        .from('wishlists')
        .select('*')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (wishlistsError) {
        console.error('Error loading wishlists:', wishlistsError);
        console.error('Wishlists error details:', wishlistsError.message, wishlistsError.details);
        setWishlists([]);
        return;
      }

      console.log('Raw wishlists data:', wishlistsData);

      // Map wishlists with product names
      const mappedWishlists: Wishlist[] = (wishlistsData || []).map(item => {
        const product = userProducts.find(p => p.id === item.product_id);
        return {
          id: item.id,
          productId: item.product_id,
          email: item.email,
          createdAt: item.created_at,
          productName: product?.name || 'Unknown Product',
        };
      });

      console.log('Mapped wishlists:', mappedWishlists);
      setWishlists(mappedWishlists);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string, email: string) => {
    try {
      console.log('Adding to wishlist:', { productId, email });
      
      // Validate inputs
      if (!productId || !email) {
        throw new Error('Product ID and email are required');
      }
      
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          product_id: productId,
          email: email,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to wishlist:', error);
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Check if it's a duplicate entry error
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('This email is already on the wishlist for this product');
        }
        
        throw error;
      }

      console.log('Wishlist entry created successfully:', data);

      const newWishlist: Wishlist = {
        id: data.id,
        productId: data.product_id,
        email: data.email,
        createdAt: data.created_at,
        productName: '', // Will be populated when loading wishlists
      };

      return newWishlist;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const getWishlistStats = (productId?: string) => {
    if (productId) {
      const productWishlists = wishlists.filter(w => w.productId === productId);
      return {
        totalWishlists: productWishlists.length,
        uniqueEmails: new Set(productWishlists.map(w => w.email)).size,
      };
    }
    
    return {
      totalWishlists: wishlists.length,
      uniqueEmails: new Set(wishlists.map(w => w.email)).size,
    };
  };

  return {
    wishlists,
    loading,
    addToWishlist,
    getWishlistStats,
    refreshWishlists: loadWishlists,
  };
};