import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadOrders = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('Loading orders for user:', userId);
      
      // Add a small delay to ensure any recent orders are available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // First, get all products for this user
      const { data: userProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', userId);

      if (productsError) {
        console.error('Error loading user products:', productsError);
        setOrders([]);
        return;
      }

      if (!userProducts || userProducts.length === 0) {
        console.log('No products found for user');
        setOrders([]);
        return;
      }

      const productIds = userProducts.map(p => p.id);
      console.log('User product IDs:', productIds);

      // Then get orders for those products
      console.log('Querying orders with product IDs:', productIds);
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        console.error('Orders error details:', ordersError.message, ordersError.details);
        console.error('Error code:', ordersError.code);
        console.error('Error hint:', ordersError.hint);
        setOrders([]);
        return;
      }

      console.log('Raw orders data:', ordersData);

      const mappedOrders: Order[] = (ordersData || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productPrice: item.product_price,
        customerName: item.customer_name,
        customerEmail: item.customer_email,
        customerPhone: item.customer_phone,
        shippingAddress: item.shipping_address as any,
        status: item.status as Order['status'],
        paymentStatus: item.payment_status as Order['paymentStatus'],
        walletAddress: item.wallet_address,
        orderDate: item.order_date,
        notes: item.notes,
        txHash: item.tx_hash,
      }));

      console.log('Mapped orders:', mappedOrders);
      setOrders(mappedOrders);
      
      // Log success
      console.log(`Successfully loaded ${mappedOrders.length} orders for user ${userId}`);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    try {
      console.log('Creating order with data:', orderData);
      
      // Validate required fields
      if (!orderData.productId || !orderData.customerEmail || !orderData.customerName) {
        throw new Error('Missing required order fields');
      }

      // Log the exact data being sent to Supabase
      const insertData = {
        product_id: orderData.productId,
        product_name: orderData.productName,
        product_price: orderData.productPrice,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        wallet_address: orderData.walletAddress,
        notes: orderData.notes || '',
        tx_hash: orderData.txHash || '',
      };
      
      console.log('Insert data for Supabase:', insertData);

      // Create order with explicit field mapping
      const { data, error } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          insertData: insertData
        });
        
        throw new Error(`Failed to create order: ${error.message}`);
      }

      console.log('Order created successfully:', data);
      
      // Refresh orders list after creating a new order
      setTimeout(() => {
        console.log('Refreshing orders list after creation...');
        loadOrders();
      }, 1000);

      const newOrder: Order = {
        id: data.id,
        productId: data.product_id,
        productName: data.product_name,
        productPrice: data.product_price,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        shippingAddress: data.shipping_address as any,
        status: data.status as Order['status'],
        paymentStatus: data.payment_status as Order['paymentStatus'],
        walletAddress: data.wallet_address,
        orderDate: data.order_date,
        notes: data.notes,
        txHash: data.tx_hash,
      };

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    try {
      const updateData: any = { status };
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        console.error('Error getting order by ID:', error);
        return undefined;
      }

      return {
        id: data.id,
        productId: data.product_id,
        productName: data.product_name,
        productPrice: data.product_price,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        shippingAddress: data.shipping_address as any,
        status: data.status as Order['status'],
        paymentStatus: data.payment_status as Order['paymentStatus'],
        walletAddress: data.wallet_address,
        orderDate: data.order_date,
        notes: data.notes,
        txHash: data.tx_hash,
      };
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return undefined;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    getOrderById,
    refreshOrders: loadOrders,
  };
};