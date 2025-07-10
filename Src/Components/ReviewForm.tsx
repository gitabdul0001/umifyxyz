import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';

interface ReviewFormProps {
  productId: string;
  onSubmit: (reviewData: any) => void;
  onClose: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 5,
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        productId,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
      };
      
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter your name"
              required
              error={errors.customerName}
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              placeholder="Enter your email"
              required
              error={errors.customerEmail}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Your Review"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
              required
              error={errors.comment}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};