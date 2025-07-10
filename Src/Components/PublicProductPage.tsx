import React, { useState, useEffect } from 'react';
import { Check, Star, Share2, User, Wallet, MessageCircle, ThumbsUp, Calendar, Package, ChevronLeft, ChevronRight, Upload, X, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { OrderForm } from './OrderForm';
import { ReviewForm } from './ReviewForm';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useReviews } from '../hooks/useReviews';
import { useWishlists } from '../hooks/useWishlists';
import { Product } from '../types';

interface PublicProductPageProps {
  uniqueCode: string;
  onGoToDashboard?: () => void;
}

export const PublicProductPage: React.FC<PublicProductPageProps> = ({ uniqueCode, onGoToDashboard }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [wishlistEmail, setWishlistEmail] = useState('');
  const [wishlistSubmitting, setWishlistSubmitting] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);
  const { getProductByUniqueCode } = useProducts();
  const { createOrder } = useOrders();
  const { reviews, loading: reviewsLoading, createReview, getReviewStats } = useReviews(product?.id);
  const { addToWishlist } = useWishlists();

  useEffect(() => {
    loadProduct();
  }, [uniqueCode]);

  const loadProduct = async () => {
    try {
      const productData = await getProductByUniqueCode(uniqueCode);
      setProduct(productData || null);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserAvatar(reader.result as string);
        setShowAvatarUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBuyNow = () => {
    setShowOrderForm(true);
  };

  const handleOrderSubmit = async (orderData: any) => {
    try {
      console.log('PublicProductPage: Submitting order data:', orderData);
      
      // Ensure all required fields are present
      if (!orderData.productId || !orderData.customerEmail || !orderData.customerName) {
        throw new Error('Missing required order information');
      }
      
      // Add additional validation
      if (!orderData.productPrice || orderData.productPrice <= 0) {
        throw new Error('Invalid product price');
      }
      
      if (!orderData.walletAddress) {
        throw new Error('Wallet address is required');
      }
      
      if (!orderData.txHash) {
        throw new Error('Transaction hash is required');
      }
      
      console.log('Order validation passed, creating order...');
      
      const newOrder = await createOrder(orderData);
      console.log('PublicProductPage: Order created successfully:', newOrder);
      setShowOrderForm(false);
      setShowReviewForm(true);
      
      // Show success message with transaction details
      const message = `Order placed successfully! 
      
Transaction Hash: ${orderData.txHash}
Payment confirmed on Umi Network blockchain.
Order ID: ${newOrder?.id || 'Generated'}

You can now leave a review for this product.`;
      
      alert(message);
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Order data that failed:', orderData);
      
      // Show detailed error information
      const errorMessage = `Payment was successful and confirmed!
      
Transaction Hash: ${orderData.txHash}

However, there was an issue saving your order details:
${error?.message || 'Unknown error occurred'}

Please contact the seller with your transaction hash for assistance.`;
      
      alert(errorMessage);
      
      // Still close the order form since payment was successful
      setShowOrderForm(false);
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await createReview(reviewData);
      setShowReviewForm(false);
      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `https://product.umify.xyz/${uniqueCode}`,
      });
    } else {
      navigator.clipboard.writeText(`https://product.umify.xyz/${uniqueCode}`);
      alert('Product link copied to clipboard!');
    }
  };

  const handleWishlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !wishlistEmail.trim()) return;

    setWishlistSubmitting(true);
    try {
      console.log('Submitting wishlist for product:', product.id, 'email:', wishlistEmail.trim());
      await addToWishlist(product.id, wishlistEmail.trim());
      console.log('Wishlist submission successful');
      setWishlistSuccess(true);
      setWishlistEmail('');
      setTimeout(() => {
        setShowWishlistForm(false);
        setWishlistSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      console.error('Wishlist error details:', error.message, error.details);
      if (error.message?.includes('duplicate')) {
        alert('This email is already on the wishlist for this product!');
      } else {
        alert(`Failed to add to wishlist: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setWishlistSubmitting(false);
    }
  };

  // Navigation functions for carousel
  const nextImage = () => {
    if (productImages.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or may have been removed.</p>
          {onGoToDashboard && (
            <Button onClick={onGoToDashboard} variant="primary">
              Go to Dashboard
            </Button>
          )}
        </Card>
      </div>
    );
  };

  const reviewStats = getReviewStats();
  const averageRating = reviewStats.averageRating;
  const totalReviews = reviewStats.totalReviews;

  // Handle both old single image and new multiple images format
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);

  const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";

  return (
    <div className="gumroad-page">
      {/* Exact Gumroad Structure */}
      <main className="custom-sections">
        {/* Product Information Bar - Exact Gumroad */}
        <section aria-label="Product information bar" className="product-info-bar">
          <div className="product-cta">
            <div itemScope itemProp="offers" itemType="https://schema.org/Offer" className="offer-container">
              <div className="has-tooltip right" aria-describedby=":Rl:">
                <div className="price" itemProp="price" content={product.price.toString()}>
                  <div className="eth-price-display">
                    <img 
                      src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                      alt="ETH" 
                      className="eth-logo-small"
                    />
                    <span>{product.price.toFixed(4)}</span>
                  </div>
                </div>
                <div role="tooltip" id=":Rl:">
                  <div className="eth-price-display">
                    <img 
                      src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                      alt="ETH" 
                      className="eth-logo-small"
                    />
                    <span>{product.price.toFixed(4)}</span>
                  </div>
                </div>
              </div>
              <link itemProp="url" href={window.location.href} />
              <div itemProp="availability" style={{ display: 'none' }}>https://schema.org/InStock</div>
              <div itemProp="priceCurrency" style={{ display: 'none' }}>eth</div>
              <div itemProp="seller" itemType="https://schema.org/Person" style={{ display: 'none' }}>
                <div itemProp="name" style={{ display: 'none' }}>Product Creator</div>
              </div>
            </div>
            <h3>{product.name}</h3>
            {totalReviews > 0 && (
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`icon ${i < Math.floor(averageRating) ? 'icon-solid-star' : 'icon-outline-star'}`}></span>
                ))}
                <span className="rating-number">{totalReviews} ratings</span>
              </div>
            )}
            <button className="custom-buy-button" onClick={handleBuyNow}>Buy Now</button>
          </div>
        </section>

        {/* Main Section - Exact Gumroad */}
        <section>
          <article className="product">
            {/* Figure Carousel - FIXED NAVIGATION */}
            <figure className="carousel" aria-label="Product preview">
              {/* Navigation Arrows - Only show if multiple images */}
              {productImages.length > 1 && (
                <>
                  <button 
                    className="arrow prev" 
                    aria-label="Show previous cover"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    className="arrow next" 
                    aria-label="Show next cover"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <div className="items">
                {productImages.length > 0 ? (
                  productImages.map((image, index) => (
                    <div key={index} role="tabpanel" id={`image-${index}`} className={selectedImageIndex === index ? 'active' : 'hidden'}>
                      <img src={image} alt={`${product.name} - Image ${index + 1}`} />
                    </div>
                  ))
                ) : (
                  <div role="tabpanel" id="placeholder-image">
                    <div className="placeholder-content">
                      <div className="placeholder-icon">
                        <Package className="w-24 h-24 text-gray-400" />
                      </div>
                      <p className="placeholder-text">{product.name}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Indicators - Only show if multiple images */}
              {productImages.length > 1 && (
                <div role="tablist" aria-label="Select a cover" className="image-indicators">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      role="tab"
                      aria-label={`Show cover ${index + 1}`}
                      aria-selected={selectedImageIndex === index}
                      aria-controls={`image-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`indicator ${selectedImageIndex === index ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </figure>

            {/* Purchase Section - RIGHT AFTER IMAGES */}
            <section className="purchase-section">
              {/* IMPROVED Price Display with White Background */}
              <div className="price-display-white">
                <div className="price-tag-white">
                  <img 
                    src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                    alt="ETH" 
                    className="eth-logo-large"
                  />
                  <span className="amount">{product.price.toFixed(4)}</span>
                </div>
                <p className="price-label">Fixed Price</p>
              </div>

              <button className="custom-buy-button" onClick={handleBuyNow}>
                Buy Now
              </button>

              <div className="action-grid">
                {/* Custom Wishlist Button */}
                <button 
                  className="wishlist-button"
                  onClick={() => setShowWishlistForm(true)}
                >
                  Wishlist
                </button>

                <details className="popover toggle">
                  <summary aria-label="Share" aria-haspopup="true" aria-expanded="false">
                    <span className="has-tooltip bottom">
                      <span aria-describedby=":Rpop9:">
                        <button className="button" type="button" aria-label="Share" onClick={handleShare}>
                          <span className="icon icon-share"></span>
                        </button>
                      </span>
                      <span role="tooltip" id=":Rpop9:">Share</span>
                    </span>
                  </summary>
                  <div className="dropdown">
                    <div className="grid grid-cols-1">
                      <a
                        className="button-social-twitter button-w-i button-twitter button"
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://product.umify.xyz/${uniqueCode}`)}&text=${encodeURIComponent(`Buy ${product.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Share on X
                      </a>
                      <a
                        className="button-social-facebook button-w-i button-facebook button"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://product.umify.xyz/${uniqueCode}`)}&quote=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Share on Facebook
                      </a>
                      <span className="has-tooltip">
                        <span aria-describedby=":R79op9:">
                          <span>
                            <button className="button" type="button" aria-label="Copy product URL" onClick={handleShare}>
                              <span className="icon icon-link"></span> Copy link
                            </button>
                          </span>
                        </span>
                        <span role="tooltip" id=":R79op9:">Copy product URL</span>
                      </span>
                    </div>
                  </div>
                </details>
              </div>
            </section>

            {/* Product Details Section - IMPROVED TYPOGRAPHY */}
            <section>
              <header>
                {/* CHANGED: Product name as H2 with better styling */}
                <h2 className="product-title" itemProp="name">{product.name}</h2>
              </header>

              <section className="details">
                <div itemScope itemProp="offers" itemType="https://schema.org/Offer" className="offer-details">
                  <div className="has-tooltip right" aria-describedby=":R579:">
                    <div className="price" itemProp="price" content={product.price.toString()}>
                      <div className="eth-price-display">
                        <img 
                          src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                          alt="ETH" 
                          className="eth-logo-small"
                        />
                        <span>{product.price.toFixed(4)}</span>
                      </div>
                    </div>
                    <div role="tooltip" id=":R579:">
                      <div className="eth-price-display">
                        <img 
                          src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                          alt="ETH" 
                          className="eth-logo-small"
                        />
                        <span>{product.price.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                  <link itemProp="url" href={`https://product.umify.xyz/${uniqueCode}`} />
                  <div itemProp="availability" style={{ display: 'none' }}>https://schema.org/InStock</div>
                  <div itemProp="priceCurrency" style={{ display: 'none' }}>eth</div>
                  <div itemProp="seller" itemType="https://schema.org/Person" style={{ display: 'none' }}>
                    <div itemProp="name" style={{ display: 'none' }}>Product Creator</div>
                  </div>
                </div>

                {totalReviews > 0 && (
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`icon ${i < Math.floor(averageRating) ? 'icon-solid-star' : 'icon-outline-star'}`}></span>
                    ))}
                    <span className="rating-number">{totalReviews} ratings</span>
                  </div>
                )}
              </section>

              {/* CHANGED: Description Section with H3 heading */}
              <section>
                <h3 className="description-title">Description</h3>
                <div className="rich-text">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  
                  {product.features.length > 0 && (
                    <>
                      <h4 className="features-title">What's included:</h4>
                      <ul className="features-list">
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </section>
            </section>

            {/* Ratings Section - Exact Gumroad Structure */}
            <section>
              <section>
                <header>
                  <h3>Ratings</h3>
                  {totalReviews > 0 && (
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`icon ${i < Math.floor(averageRating) ? 'icon-solid-star' : 'icon-outline-star'}`}></span>
                      ))}
                      <div className="rating-average">{averageRating.toFixed(1)}</div>
                      <span>({totalReviews} ratings)</span>
                    </div>
                  )}
                </header>

                <div itemProp="aggregateRating" itemType="https://schema.org/AggregateRating" itemScope style={{ display: 'none' }}>
                  <div itemProp="reviewCount">{totalReviews}</div>
                  <div itemProp="ratingValue">{averageRating}</div>
                </div>

                {totalReviews > 0 ? (
                  <section className="histogram" aria-label="Ratings histogram">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewStats.ratingCounts[rating] || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) : 0;
                      return (
                        <React.Fragment key={rating}>
                          <div>{rating} star{rating !== 1 ? 's' : ''}</div>
                          <meter aria-label={`${rating} stars`} value={percentage}></meter>
                          <div>{Math.round(percentage * 100)}%</div>
                        </React.Fragment>
                      );
                    })}
                  </section>
                ) : (
                  <p className="no-reviews">No reviews yet</p>
                )}
              </section>
            </section>
          </article>
        </section>

        {/* Footer - Exact Gumroad */}
        <footer>
          Powered by <span className="logo-full">Umify.xyz</span>
        </footer>
      </main>

      {/* Wishlist Form Modal */}
      {showWishlistForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add to Wishlist</h2>
                <Button variant="ghost" onClick={() => setShowWishlistForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {wishlistSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Added to Wishlist!</h3>
                  <p className="text-gray-600">We'll notify you about updates and special offers.</p>
                </div>
              ) : (
                <form onSubmit={handleWishlistSubmit} className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-4">
                      Get notified when this product goes on sale or gets updated.
                    </p>
                    <Input
                      label="Email Address"
                      type="email"
                      value={wishlistEmail}
                      onChange={(e) => setWishlistEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={wishlistSubmitting}
                      className="flex-1"
                    >
                      {wishlistSubmitting ? 'Adding...' : 'Add to Wishlist'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWishlistForm(false)}
                      disabled={wishlistSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Avatar</h2>
                <Button variant="ghost" onClick={() => setShowAvatarUpload(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <img
                      src={userAvatar || defaultAvatar}
                      alt="Current avatar"
                      className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Current avatar</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-sm text-gray-600">
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Upload a new avatar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          product={product}
          onSubmit={handleOrderSubmit}
          onClose={() => setShowOrderForm(false)}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={product.id}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      <style jsx>{`
        /* ETH Logo Styles - DOUBLED SIZE */
        .eth-logo-small {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .eth-logo-large {
          width: 64px;
          height: 64px;
          object-fit: contain;
          margin-right: 8px;
        }

        .eth-price-display {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* IMPROVED Typography Styles */
        .product-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a202c;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -0.025em;
        }

        .description-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
          margin-top: 2rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .features-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin: 1.5rem 0 0.75rem 0;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-list li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
          color: #4a5568;
          line-height: 1.6;
        }

        .features-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #48bb78;
          font-weight: bold;
          font-size: 1.1em;
        }

        /* IMPROVED Price Display with White Background */
        .price-display-white {
          text-align: center;
          margin-bottom: 1.5rem;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #e2e8f0;
        }

        .price-tag-white {
          display: inline-flex;
          align-items: center;
          background: white;
          color: #2d3748;
          padding: 1rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 0.5rem;
          border: 3px solid #4299e1;
        }

        .price-tag-white .amount {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1;
          color: #2d3748;
        }

        /* Exact Gumroad CSS Variables and Styling */
        .gumroad-page {
          --accent: 0 136 255;
          --contrast-accent: 255 255 255;
          --font-family: "ABC Favorit", "ABC Favorit", sans-serif;
          --color: 0 0 0;
          --primary: var(--color);
          --contrast-primary: 255 255 255;
          --filled: 255 255 255;
          --contrast-filled: var(--color);
          --body-bg: #ffffff;
          --active-bg: rgb(var(--color) / var(--gray-1));
          --border-alpha: 1;
          --spacer-2: 0.5rem;
          --spacer-4: 1rem;
          --transition-duration: 0.3s;
          --z-index-menubar: 1000;
          
          background-color: #ffffff;
          color: #000;
          font-family: "ABC Favorit", "ABC Favorit", sans-serif;
          min-height: 100vh;
        }

        .custom-sections {
          /* Main container styling */
        }

        .product-info-bar {
          overflow: hidden;
          padding: 0;
          border: none;
          height: 0;
          transition: var(--transition-duration);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: var(--z-index-menubar);
        }

        .product-cta {
          transition: var(--transition-duration);
          margin-top: 0;
        }

        .offer-container {
          display: flex;
          align-items: center;
        }

        .product {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        @media (max-width: 1024px) {
          .product {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .carousel {
          position: relative;
          margin-bottom: 2rem;
        }

        .carousel .items {
          aspect-ratio: 2.262425447316103;
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 1px solid #e9ecef;
        }

        .carousel .items img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .placeholder-icon {
          margin-bottom: 1rem;
        }

        .placeholder-text {
          color: #6c757d;
          font-size: 1.125rem;
          font-weight: 500;
        }

        /* FIXED CAROUSEL NAVIGATION */
        .carousel .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0.8;
        }

        .carousel .arrow:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.9);
          transform: translateY(-50%) scale(1.1);
        }

        .carousel .arrow.prev {
          left: 1rem;
        }

        .carousel .arrow.next {
          right: 1rem;
        }

        /* Image Indicators */
        .image-indicators {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #dee2e6;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator:hover {
          background: #adb5bd;
          transform: scale(1.2);
        }

        .indicator.active {
          background: #0088ff;
          transform: scale(1.3);
        }

        /* Purchase Section - Positioned right after images */
        .purchase-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .price-label {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }

        .details {
          margin: 2rem 0;
        }

        .offer-details {
          display: flex;
          align-items: center;
        }

        .details .price {
          font-size: 2rem;
          font-weight: bold;
          color: rgb(var(--accent));
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacer-2);
          flex-wrap: wrap;
          margin: 1rem 0;
        }

        .user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #374151;
          position: relative;
        }

        .avatar-container {
          position: relative;
          display: inline-block;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin: 1rem 0;
        }

        .rating .icon-solid-star {
          color: #ffc107;
        }

        .rating .icon-outline-star {
          color: #dee2e6;
        }

        .rating-number {
          margin-left: 0.5rem;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .rating-average {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0 0.5rem;
        }

        .rich-text {
          line-height: 1.6;
          color: #374151;
          margin: 1rem 0;
        }

        .rich-text p {
          margin-bottom: 1rem;
        }

        /* Custom Buy Button Styling - From Uiverse.io by adamgiebl */
        .custom-buy-button {
          background: #989cfc;
          font-family: inherit;
          padding: 0.6em 1.3em;
          font-weight: 900;
          font-size: 18px;
          border: 3px solid black;
          border-radius: 0.4em;
          box-shadow: 0.1em 0.1em;
          cursor: pointer;
          width: 100%;
          margin: 1rem 0;
          color: white;
          text-decoration: none;
          display: block;
          text-align: center;
          transition: all 0.1s ease;
        }

        .custom-buy-button:hover {
          transform: translate(-0.05em, -0.05em);
          box-shadow: 0.15em 0.15em;
        }

        .custom-buy-button:active {
          transform: translate(0.05em, 0.05em);
          box-shadow: 0.05em 0.05em;
        }

        /* Custom Wishlist Button Styling - From Uiverse.io by mayurd8862 - EXACT SMALL SIZE */
        .wishlist-button {
          background: linear-gradient(to right, rgb(241, 225, 119), rgb(180, 67, 241));
          font-family: inherit;
          padding: 0.6em 1.3em;
          font-weight: 900;
          font-size: 18px;
          border: 2px solid black;
          border-radius: 0.4em;
          box-shadow: 0.1em 0.1em;
          cursor: pointer;
          color: white;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          transition: all 0.1s ease;
          width: auto;
          margin: 0;
        }

        .wishlist-button:hover {
          transform: translate(-0.05em, -0.05em);
          box-shadow: 0.15em 0.15em;
        }

        .wishlist-button:active {
          transform: translate(0.05em, 0.05em);
          box-shadow: 0.05em 0.05em;
        }

        .action-grid {
          display: grid;
          gap: var(--spacer-2);
          grid-template-columns: auto auto;
          margin: 1rem 0;
          justify-content: start;
        }

        .button {
          background: white;
          border: 2px solid #dee2e6;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, border-color 0.2s;
          color: #374151;
          text-decoration: none;
        }

        .button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .histogram {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.5rem;
          align-items: center;
          margin-top: 1rem;
        }

        .histogram div {
          font-size: 0.875rem;
          color: #6c757d;
        }

        meter {
          appearance: none;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          border: none;
        }

        meter::-webkit-meter-bar {
          background: #e9ecef;
          border-radius: 4px;
        }

        meter::-webkit-meter-optimum-value {
          background: #ffc107;
          border-radius: 4px;
        }

        meter::-moz-meter-bar {
          background: #ffc107;
          border-radius: 4px;
        }

        .no-reviews {
          color: #6c757d;
          text-align: center;
          padding: 2rem 0;
          font-style: italic;
        }

        footer {
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          padding: 2rem;
          text-align: center;
          color: #6c757d;
          margin-top: 2rem;
        }

        .logo-full {
          color: #374151;
          font-weight: 600;
        }

        /* Icon placeholders */
        .icon {
          display: inline-block;
          width: 1em;
          height: 1em;
        }

        .icon-solid-star::before {
          content: "★";
          color: #ffc107;
        }

        .icon-outline-star::before {
          content: "☆";
          color: #dee2e6;
        }

        .icon-outline-cheveron-down::before {
          content: "▼";
          font-size: 0.75em;
          color: #6c757d;
        }

        .icon-share::before {
          content: "↗";
          color: #6c757d;
        }

        .icon-link::before {
          content: "🔗";
          color: #6c757d;
        }

        .icon-plus::before {
          content: "+";
          color: #6c757d;
        }

        /* Dropdown styling */
        .dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          min-width: 200px;
          z-index: 1000;
        }

        .button-social-twitter,
        .button-social-facebook {
          width: 100%;
          margin-bottom: 0.25rem;
          justify-content: flex-start;
          padding: 8px 12px;
          font-size: 0.875rem;
        }

        .button-social-twitter:hover,
        .button-social-facebook:hover {
          background: #f8f9fa;
        }

        /* Hidden elements */
        .hidden {
          display: none;
        }

        .active {
          display: block;
        }

        /* Tooltips */
        .has-tooltip {
          position: relative;
        }

        [role="tooltip"] {
          position: absolute;
          background: #374151;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }

        .has-tooltip:hover [role="tooltip"] {
          opacity: 1;
        }

        .has-tooltip.right [role="tooltip"] {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 0.5rem;
        }

        .has-tooltip.bottom [role="tooltip"] {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
        }

        /* Responsive Typography */
        @media (max-width: 768px) {
          .product-title {
            font-size: 2rem;
          }
          
          .description-title {
            font-size: 1.25rem;
          }
          
          .features-title {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};