import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Dashboard } from './components/Dashboard';
import { ProductForm } from './components/ProductForm';
import { ProductLanding } from './components/ProductLanding';
import { PublicProductPage } from './components/PublicProductPage';
import { Header } from './components/layout/Header';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';

type View = 'signup' | 'login' | 'dashboard' | 'create-product' | 'edit-product' | 'view-product' | 'public-product';

function App() {
  const [currentView, setCurrentView] = useState<View>('signup');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [publicProductCode, setPublicProductCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated, loading: authLoading, login, signup, logout } = useAuth();
  const { getProductByUniqueCode } = useProducts();

  // Check URL and route accordingly
  const checkAndRouteFromURL = async () => {
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    console.log('Checking URL path:', path);
    console.log('Checking hostname:', hostname);
    
    // Check if we're on the product subdomain
    if (hostname === 'product.umify.xyz' && path !== '/') {
      const uniqueCode = path.substring(1); // Remove leading slash
      console.log('Extracted unique code:', uniqueCode);
      
      // Check if it's a valid unique code (8 characters, alphanumeric)
      if (uniqueCode.length === 8 && /^[A-Z0-9]+$/.test(uniqueCode)) {
        console.log('Valid unique code format, checking for product...');
        const product = await getProductByUniqueCode(uniqueCode);
        console.log('Found product for code:', product);
        
        if (product) {
          console.log('Setting public product view with code:', uniqueCode);
          setPublicProductCode(uniqueCode);
          setCurrentView('public-product');
          return true; // Found a public product
        } else {
          console.log('No product found for unique code:', uniqueCode);
        }
      } else {
        console.log('Invalid unique code format:', uniqueCode);
      }
    } else if (hostname === 'product.umify.xyz' && path === '/') {
      // If on product subdomain but no unique code, redirect to main app
      window.location.href = 'https://app.umify.xyz';
      return false;
    }
    
    // If not a public product URL, handle normal routing
    if (isAuthenticated) {
      console.log('User is authenticated, setting dashboard view');
      setCurrentView('dashboard');
    } else {
      console.log('User not authenticated, setting signup view');
      setCurrentView('signup');
    }
    setPublicProductCode(null);
    return false;
  };

  // Initialize the app state
  useEffect(() => {
    if (authLoading || isInitialized) return;
    
    console.log('Initializing app...');
    checkAndRouteFromURL().then((foundPublicProduct) => {
      console.log('Found public product during init:', foundPublicProduct);
      setIsInitialized(true);
    });
  }, [authLoading, isAuthenticated, isInitialized]);

  // Watch for authentication changes and redirect accordingly
  useEffect(() => {
    if (!authLoading && isInitialized) {
      console.log('Auth state changed - isAuthenticated:', isAuthenticated, 'currentView:', currentView);
      
      // If user just became authenticated and we're on auth pages, redirect to dashboard
      if (isAuthenticated && (currentView === 'login' || currentView === 'signup')) {
        console.log('User authenticated, redirecting to dashboard');
        setCurrentView('dashboard');
        window.history.pushState({}, '', '/');
      }
      
      // If user logged out, redirect to signup
      if (!isAuthenticated && currentView === 'dashboard') {
        console.log('User logged out, redirecting to signup');
        setCurrentView('signup');
        window.history.pushState({}, '', '/');
      }
    }
  }, [isAuthenticated, authLoading, isInitialized, currentView]);

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      console.log('Pop state event triggered');
      checkAndRouteFromURL();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('Attempting login...');
    const result = await login(email, password);
    console.log('Login result:', result);
    if (result.success) {
      // The useEffect will handle the redirect
      console.log('Login successful, redirect will be handled by useEffect');
    }
    return result;
  };

  const handleSignup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    console.log('Attempting signup...');
    const result = await signup(email, password, name);
    console.log('Signup result:', result);
    if (result.success) {
      // The useEffect will handle the redirect
      console.log('Signup successful, redirect will be handled by useEffect');
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('signup');
    setPublicProductCode(null);
    window.history.pushState({}, '', '/');
  };

  const handleCreateProduct = () => {
    console.log('App: handleCreateProduct called - switching to create-product view');
    setCurrentView('create-product');
    setSelectedProductId(null);
  };

  const handleEditProduct = (productId: string) => {
    setCurrentView('edit-product');
    setSelectedProductId(productId);
  };

  const handleViewProduct = (productId: string) => {
    setCurrentView('view-product');
    setSelectedProductId(productId);
  };

  const handleProductSaved = () => {
    setCurrentView('dashboard');
    setSelectedProductId(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProductId(null);
    setPublicProductCode(null);
    window.history.pushState({}, '', '/');
  };

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      setPublicProductCode(null);
      window.history.pushState({}, '', '/');
    } else {
      setCurrentView('login');
      setPublicProductCode(null);
      window.history.pushState({}, '', '/');
    }
  };

  // Don't render anything until initialized
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-[#f7f5ed] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Debug log to see current view
  console.log('App render - Current view:', currentView, 'User authenticated:', isAuthenticated, 'Public code:', publicProductCode);

  // Public product view (no authentication required) - this takes priority
  if (currentView === 'public-product' && publicProductCode) {
    console.log('Rendering PublicProductPage with code:', publicProductCode);
    return <PublicProductPage uniqueCode={publicProductCode} onGoToDashboard={handleGoToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f5ed]">
      {isAuthenticated && (
        <Header user={user} onLogout={handleLogout} />
      )}
      
      {currentView === 'signup' && (
        <div className="flex items-center justify-center p-4 py-16">
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        </div>
      )}
      
      {currentView === 'login' && (
        <div className="flex items-center justify-center p-4 py-16">
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={() => setCurrentView('signup')}
          />
        </div>
      )}
      
      {currentView === 'dashboard' && user && (
        <Dashboard
          userId={user.id}
          onCreateProduct={handleCreateProduct}
          onViewProduct={handleViewProduct}
          onEditProduct={handleEditProduct}
        />
      )}
      
      {(currentView === 'create-product' || currentView === 'edit-product') && user && (
        <ProductForm
          userId={user.id}
          productId={selectedProductId || undefined}
          onSave={handleProductSaved}
          onCancel={handleBackToDashboard}
        />
      )}
      
      {currentView === 'view-product' && selectedProductId && (
        <ProductLanding
          productId={selectedProductId}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;