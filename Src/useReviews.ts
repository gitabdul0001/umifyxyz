import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

export const useReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadReviews();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
        return;
      }

      const mappedReviews: Review[] = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        customerName: item.customer_name,
        customerEmail: item.customer_email,
        rating: item.rating,
        comment: item.comment,
        createdAt: item.created_at,
      }));

      setReviews(mappedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.productId,
          customer_name: reviewData.customerName,
          customer_email: reviewData.customerEmail,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        throw error;
      }

      const newReview: Review = {
        id: data.id,
        productId: data.product_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
      };

      setReviews(prev => [newReview, ...prev]);
      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  };

  const getReviewStats = () => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      ratingCounts[review.rating as keyof typeof ratingCounts]++;
      totalRating += review.rating;
    });

    const averageRating = totalRating / reviews.length;

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingCounts,
    };
  };

  return {
    reviews,
    loading,
    createReview,
    getReviewStats,
    refreshReviews: loadReviews,
  };
};