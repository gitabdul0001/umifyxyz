import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { Upload, X, Plus, Wallet } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

interface ProductFormProps {
  userId: string;
  productId?: string;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  userId,
  productId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [] as string[], // Changed from single image to array of images
    features: [''],
    walletAddress: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const { createProduct, updateProduct, getProductById } = useProducts();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    
    setLoadingProduct(true);
    try {
      const product = await getProductById(productId);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          images: product.images || (product.image ? [product.image] : []), // Handle both old single image and new multiple images
          features: product.features.length > 0 ? product.features : [''],
          walletAddress: product.walletAddress || '',
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required for receiving payments';
    } else if (formData.walletAddress.trim().length < 20) {
      newErrors.walletAddress = 'Please enter a valid wallet address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      const productData = {
        userId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        images: formData.images, // Send array of images
        image: formData.images[0] || '', // Keep backward compatibility with single image field
        features: formData.features.filter(f => f.trim() !== ''),
        walletAddress: formData.walletAddress.trim(),
      };
      
      let product: Product;
      
      if (productId) {
        await updateProduct(productId, productData);
        product = await getProductById(productId) as Product;
      } else {
        product = await createProduct(productData);
      }
      
      onSave(product);
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {productId ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {productId ? 'Update your product details' : 'Fill in the details for your new product'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            required
            error={errors.name}
          />

          <Textarea
            label="Product Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your product..."
            rows={4}
            required
            error={errors.description}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <img 
                  src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                  alt="ETH" 
                  className="w-8 h-8 mr-2"
                />
                Price (ETH)
                <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.0000"
              step="0.0001"
              required
              error={errors.price}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 mr-2 text-blue-600" />
                Umi Wallet Address
                <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <Input
              value={formData.walletAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
              placeholder="Enter your Umi wallet address for receiving payments"
              required
              error={errors.walletAddress}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is where you'll receive ETH payments from customers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="space-y-4">
              {/* Display uploaded images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600">
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Upload images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each. First image will be the main image.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Features
            </label>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};