import React, { useState } from 'react';
import { Package, Mail, Phone, MapPin, Calendar, DollarSign, Eye, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';

interface OrdersTabProps {
  userId: string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ userId }) => {
  const { orders, loading, updateOrderStatus } = useOrders(userId);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Debug logging
  React.useEffect(() => {
    console.log('OrdersTab: Component mounted/updated');
    console.log('OrdersTab: userId:', userId);
    console.log('OrdersTab: loading:', loading);
    console.log('OrdersTab: orders count:', orders.length);
    console.log('OrdersTab: orders data:', orders);
  }, [userId, loading, orders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'paid': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600">
            {orders.length} order{orders.length !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">
            Orders from customers will appear here once they start purchasing your products
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <Card key={order.id} className="p-6" hover>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {order.productName}
                    </h3>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="eth-price-container mb-1">
                      <img 
                        src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                        alt="ETH" 
                        className="eth-logo"
                      />
                      <span className="text-2xl font-bold text-blue-600">{order.productPrice.toFixed(4)}</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {order.customerName}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {order.customerEmail}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Date</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                  
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'paid')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {order.status === 'paid' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        className="text-green-600 hover:bg-green-50"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600">Order #{selectedOrder.id}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Product:</span>
                      <span className="font-medium">{selectedOrder.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Amount:</span>
                      <div className="eth-price-container">
                        <img 
                          src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                          alt="ETH" 
                          className="eth-logo"
                        />
                        <span className="text-xl font-bold text-blue-600">{selectedOrder.productPrice.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Order Date:</span>
                      <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.customerName}</div>
                    <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                    <div><strong>Phone:</strong> {selectedOrder.customerPhone}</div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="text-sm">
                    <div>{selectedOrder.shippingAddress.street}</div>
                    <div>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </div>
                    <div>{selectedOrder.shippingAddress.country}</div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <img 
                      src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                      alt="ETH" 
                      className="w-5 h-5 mr-2"
                    />
                    Payment Information
                  </h3>
                  <div className="text-sm">
                    <div className="mb-2"><strong>Your Wallet Address:</strong></div>
                    <div className="font-mono text-xs bg-white p-2 rounded border break-all">
                      {selectedOrder.walletAddress}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Notes</h3>
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'paid')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {selectedOrder.status === 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {selectedOrder.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        .eth-price-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .eth-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};