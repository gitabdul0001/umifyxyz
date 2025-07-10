import React, { useState } from 'react';
import { Heart, Mail, Calendar, Package, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useWishlists } from '../hooks/useWishlists';

interface WishlistsTabProps {
  userId: string;
}

export const WishlistsTab: React.FC<WishlistsTabProps> = ({ userId }) => {
  const { wishlists, loading } = useWishlists(userId);
  const [exportingEmails, setExportingEmails] = useState(false);

  const exportEmails = () => {
    setExportingEmails(true);
    
    // Get unique emails
    const uniqueEmails = Array.from(new Set(wishlists.map(w => w.email)));
    
    // Create CSV content
    const csvContent = 'Email,Product Name,Date Added\n' + 
      wishlists.map(w => `${w.email},"${w.productName}",${new Date(w.createdAt).toLocaleDateString()}`).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist-emails.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setExportingEmails(false);
  };

  // Group wishlists by product
  const wishlistsByProduct = wishlists.reduce((acc, wishlist) => {
    if (!acc[wishlist.productId]) {
      acc[wishlist.productId] = {
        productName: wishlist.productName || 'Unknown Product',
        emails: []
      };
    }
    acc[wishlist.productId].emails.push(wishlist);
    return acc;
  }, {} as Record<string, { productName: string; emails: typeof wishlists }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalUniqueEmails = new Set(wishlists.map(w => w.email)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wishlists</h2>
          <p className="text-gray-600">
            {totalUniqueEmails} unique email{totalUniqueEmails !== 1 ? 's' : ''} • {wishlists.length} total wishlist{wishlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        {wishlists.length > 0 && (
          <Button
            variant="outline"
            icon={Download}
            onClick={exportEmails}
            disabled={exportingEmails}
          >
            {exportingEmails ? 'Exporting...' : 'Export Emails'}
          </Button>
        )}
      </div>

      {wishlists.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wishlists Yet</h3>
          <p className="text-gray-600">
            When customers add your products to their wishlist, their emails will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(wishlistsByProduct).map(([productId, { productName, emails }]) => (
            <Card key={productId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {emails.length} wishlist{emails.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {emails.map((wishlist) => (
                  <div key={wishlist.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-gray-900">{wishlist.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(wishlist.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};