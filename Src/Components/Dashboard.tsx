import React, { useState } from 'react';
import { Plus, Package, Eye, Edit, Trash2, ExternalLink, Copy, ShoppingBag, Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useProducts } from '../hooks/useProducts';
import { OrdersTab } from './OrdersTab';
import { WishlistsTab } from './WishlistsTab';
import { Product } from '../types';

interface DashboardProps {
  userId: string;
  onCreateProduct: () => void;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userId,
  onCreateProduct,
  onViewProduct,
  onEditProduct
}) => {
  const { products, loading, deleteProduct } = useProducts(userId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'wishlists'>('products');
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when switching to orders tab
  const handleTabChange = (tab: 'products' | 'orders' | 'wishlists') => {
    setActiveTab(tab);
    if (tab === 'orders') {
      // Force refresh of orders when switching to orders tab
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setDeletingId(productId);
      await deleteProduct(productId);
      setDeletingId(null);
    }
  };

  const getPublicUrl = (uniqueCode: string) => {
    return `https://product.umify.xyz/${uniqueCode}`;
  };

  const handleCopyPublicLink = (uniqueCode: string) => {
    const publicUrl = getPublicUrl(uniqueCode);
    navigator.clipboard.writeText(publicUrl);
    alert('Public link copied to clipboard!');
  };

  const handleOpenPublicLink = (uniqueCode: string) => {
    const publicUrl = getPublicUrl(uniqueCode);
    window.location.href = publicUrl;
  };

  const handleCreateProductClick = () => {
    console.log('Dashboard: Create Product button clicked');
    onCreateProduct();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your products, orders, and wishlists
          </p>
        </div>
        {activeTab === 'products' && (
          <button type="button" className="animated-create-button" onClick={handleCreateProductClick}>
            <span className="fold"></span>

            <div className="points_wrapper">
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
              <i className="point"></i>
            </div>

            <span className="inner">
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              >
                <polyline
                  points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
                ></polyline>
              </svg>
              Create Product
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Products ({products.length})
            </div>
          </button>
          <button
            onClick={() => handleTabChange('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </div>
          </button>
          <button
            onClick={() => handleTabChange('wishlists')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wishlists'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Wishlists
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <div>
          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first product to get started with building landing pages
              </p>
              <button type="button" className="animated-create-button" onClick={handleCreateProductClick}>
                <span className="fold"></span>

                <div className="points_wrapper">
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                  <i className="point"></i>
                </div>

                <span className="inner">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  >
                    <polyline
                      points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
                    ></polyline>
                  </svg>
                  Create Your First Product
                </span>
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {/* Product Image */}
                  <div className="product-image-container">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-placeholder">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Content */}
                  <div className="product-content">
                    <div className="product-header">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-price">
                        <div className="eth-price-container">
                          <img 
                            src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                            alt="ETH" 
                            className="eth-logo"
                          />
                          <span className="eth-amount">{product.price.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-meta">
                      <span className="product-date">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Public Link Display */}
                    <div className="public-link-section">
                      <div className="public-link-label">Public URL:</div>
                      <div className="public-link-container">
                        <div className="public-link-code">
                          /{product.uniqueCode}
                        </div>
                        <div className="public-link-actions">
                          <button
                            onClick={() => handleCopyPublicLink(product.uniqueCode)}
                            className="link-action-btn copy-btn"
                            title="Copy Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPublicLink(product.uniqueCode)}
                            className="link-action-btn open-btn"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="product-actions">
                      <button
                        onClick={() => onViewProduct(product.id)}
                        className="action-btn view-btn"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => onEditProduct(product.id)}
                        className="action-btn edit-btn"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="action-btn delete-btn"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === product.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'orders' ? (
        <OrdersTab key={refreshKey} userId={userId} />
      ) : (
        <WishlistsTab key={refreshKey} userId={userId} />
      )}

      <style jsx>{`
        /* Beautiful Product Card Styles */
        .product-card {
          --background: #f8f9fa;
          --border-color: #2d3748;
          --accent-color: #4299e1;
          --text-primary: #2d3748;
          --text-secondary: #718096;
          --success-color: #48bb78;
          --danger-color: #f56565;
          --shadow-color: rgba(45, 55, 72, 0.1);
          
          background: var(--background);
          border: 3px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 6px 6px 0px var(--border-color);
          padding: 0;
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 8px 8px 0px var(--border-color);
        }

        .product-image-container {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .product-content {
          padding: 20px;
          background: white;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .product-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          flex: 1;
        }

        .product-price {
          background: #ebf8ff;
          padding: 4px 12px;
          border-radius: 8px;
          border: 2px solid var(--accent-color);
          white-space: nowrap;
        }

        .eth-price-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .eth-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .eth-amount {
          font-size: 16px;
          font-weight: 800;
          color: var(--accent-color);
        }

        .product-description {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-meta {
          margin-bottom: 16px;
        }

        .product-date {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .public-link-section {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .public-link-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .public-link-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .public-link-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: var(--accent-color);
          font-weight: 600;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .public-link-actions {
          display: flex;
          gap: 4px;
        }

        .link-action-btn {
          width: 28px;
          height: 28px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .link-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 3px 3px 0px var(--border-color);
        }

        .link-action-btn:active {
          transform: translateY(0);
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .copy-btn {
          color: var(--accent-color);
        }

        .copy-btn:hover {
          background: #ebf8ff;
        }

        .open-btn {
          color: var(--success-color);
        }

        .open-btn:hover {
          background: #f0fff4;
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          height: 40px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 3px 3px 0px var(--border-color);
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 4px 4px 0px var(--border-color);
        }

        .action-btn:active {
          transform: translateY(0);
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 3px 3px 0px var(--border-color);
        }

        .view-btn {
          color: var(--accent-color);
        }

        .view-btn:hover {
          background: #ebf8ff;
        }

        .edit-btn {
          color: #805ad5;
        }

        .edit-btn:hover {
          background: #faf5ff;
        }

        .delete-btn {
          color: var(--danger-color);
        }

        .delete-btn:hover {
          background: #fed7d7;
        }

        /* Animated Create Product Button Styles */
        .animated-create-button {
          --h-button: 48px;
          --w-button: 180px;
          --round: 0.75rem;
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.25s ease;
          background: radial-gradient(
              65.28% 65.28% at 50% 100%,
              rgba(223, 113, 255, 0.8) 0%,
              rgba(223, 113, 255, 0) 100%
            ),
            linear-gradient(0deg, #7a5af8, #7a5af8);
          border-radius: var(--round);
          border: none;
          outline: none;
          padding: 12px 18px;
          min-width: var(--w-button);
          height: var(--h-button);
        }

        .animated-create-button::before,
        .animated-create-button::after {
          content: "";
          position: absolute;
          inset: var(--space);
          transition: all 0.5s ease-in-out;
          border-radius: calc(var(--round) - var(--space));
          z-index: 0;
        }

        .animated-create-button::before {
          --space: 1px;
          background: linear-gradient(
            177.95deg,
            rgba(255, 255, 255, 0.19) 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .animated-create-button::after {
          --space: 2px;
          background: radial-gradient(
              65.28% 65.28% at 50% 100%,
              rgba(223, 113, 255, 0.8) 0%,
              rgba(223, 113, 255, 0) 100%
            ),
            linear-gradient(0deg, #7a5af8, #7a5af8);
        }

        .animated-create-button:active {
          transform: scale(0.95);
        }

        .fold {
          z-index: 1;
          position: absolute;
          top: 0;
          right: 0;
          height: 1rem;
          width: 1rem;
          display: inline-block;
          transition: all 0.5s ease-in-out;
          background: radial-gradient(
            100% 75% at 55%,
            rgba(223, 113, 255, 0.8) 0%,
            rgba(223, 113, 255, 0) 100%
          );
          box-shadow: 0 0 3px black;
          border-bottom-left-radius: 0.5rem;
          border-top-right-radius: var(--round);
        }

        .fold::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 150%;
          height: 150%;
          transform: rotate(45deg) translateX(0%) translateY(-18px);
          background-color: #e8e8e8;
          pointer-events: none;
        }

        .animated-create-button:hover .fold {
          margin-top: -1rem;
          margin-right: -1rem;
        }

        .points_wrapper {
          overflow: hidden;
          width: 100%;
          height: 100%;
          pointer-events: none;
          position: absolute;
          z-index: 1;
        }

        .points_wrapper .point {
          bottom: -10px;
          position: absolute;
          animation: floating-points infinite ease-in-out;
          pointer-events: none;
          width: 2px;
          height: 2px;
          background-color: #fff;
          border-radius: 9999px;
        }

        @keyframes floating-points {
          0% {
            transform: translateY(0);
          }
          85% {
            opacity: 0;
          }
          100% {
            transform: translateY(-55px);
            opacity: 0;
          }
        }

        .points_wrapper .point:nth-child(1) {
          left: 10%;
          opacity: 1;
          animation-duration: 2.35s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(2) {
          left: 30%;
          opacity: 0.7;
          animation-duration: 2.5s;
          animation-delay: 0.5s;
        }
        .points_wrapper .point:nth-child(3) {
          left: 25%;
          opacity: 0.8;
          animation-duration: 2.2s;
          animation-delay: 0.1s;
        }
        .points_wrapper .point:nth-child(4) {
          left: 44%;
          opacity: 0.6;
          animation-duration: 2.05s;
        }
        .points_wrapper .point:nth-child(5) {
          left: 50%;
          opacity: 1;
          animation-duration: 1.9s;
        }
        .points_wrapper .point:nth-child(6) {
          left: 75%;
          opacity: 0.5;
          animation-duration: 1.5s;
          animation-delay: 1.5s;
        }
        .points_wrapper .point:nth-child(7) {
          left: 88%;
          opacity: 0.9;
          animation-duration: 2.2s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(8) {
          left: 58%;
          opacity: 0.8;
          animation-duration: 2.25s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(9) {
          left: 98%;
          opacity: 0.6;
          animation-duration: 2.6s;
          animation-delay: 0.1s;
        }
        .points_wrapper .point:nth-child(10) {
          left: 65%;
          opacity: 1;
          animation-duration: 2.5s;
          animation-delay: 0.2s;
        }

        .inner {
          z-index: 2;
          gap: 6px;
          position: relative;
          width: 100%;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
          transition: color 0.2s ease-in-out;
        }

        .inner svg.icon {
          width: 18px;
          height: 18px;
          transition: fill 0.1s linear;
        }

        .animated-create-button:focus svg.icon {
          fill: white;
        }

        .animated-create-button:hover svg.icon {
          fill: transparent;
          animation:
            dasharray 1s linear forwards,
            filled 0.1s linear forwards 0.95s;
        }

        @keyframes dasharray {
          from {
            stroke-dasharray: 0 0 0 0;
          }
          to {
            stroke-dasharray: 68 68 0 0;
          }
        }

        @keyframes filled {
          to {
            fill: white;
          }
        }
      `}</style>
    </div>
  );
};