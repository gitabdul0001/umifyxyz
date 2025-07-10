import React, { useState, useEffect } from 'react';
import { Check, Star, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

interface ProductLandingProps {
  productId: string;
  onBack?: () => void;
}

export const ProductLanding: React.FC<ProductLandingProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { getProductById } = useProducts();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await getProductById(productId);
      setProduct(productData || null);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  const handleBuyNow = () => {
    // In a real app, this would integrate with a payment processor
    alert(`Purchase initiated for ${product.name}! This would integrate with Stripe or similar payment processor.`);
  };

  const publicUrl = `https://product.umify.xyz/${product.uniqueCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('Product link copied to clipboard!');
  };

  const handleOpenPublicPage = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {onBack && (
              <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
                Back to Dashboard
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" icon={ExternalLink} onClick={handleOpenPublicPage}>
                View Public Page
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div className="space-y-6">
              <div className="aspect-square bg-white rounded-2xl shadow-xl overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-gray-600 text-2xl font-bold">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <p className="text-gray-600">No image available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              {product.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="space-y-3">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="eth-price-container mb-2">
                      <img 
                        src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                        alt="ETH" 
                        className="eth-logo"
                      />
                      <span className="text-4xl font-bold text-gray-900">{product.price.toFixed(4)}</span>
                    </div>
                    <p className="text-gray-600">One-time purchase</p>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full text-lg py-4"
                >
                  Buy Now
                </Button>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Instant delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share This Product</h2>
          <p className="text-gray-600 mb-6">
            Your product is live! Share this unique link with your customers:
          </p>
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto border border-blue-200">
            <div className="text-lg text-blue-700 font-mono break-all mb-4">
              {publicUrl}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                icon={Copy}
                onClick={handleCopyLink}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Copy Link
              </Button>
              <Button
                variant="primary"
                icon={ExternalLink}
                onClick={handleOpenPublicPage}
              >
                Open Public Page
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .eth-price-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eth-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};