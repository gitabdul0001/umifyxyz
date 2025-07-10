import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { Product } from '../types';

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
    // Add support for other wallet providers
    okxwallet?: any;
    coinbaseWalletExtension?: any;
    trustWallet?: any;
    phantom?: any;
    solana?: any;
    // WalletConnect and other providers
    WalletConnect?: any;
  }
}

interface OrderFormProps {
  product: Product;
  onSubmit: (orderData: any) => void;
  onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentState, setPaymentState] = useState<'form' | 'connecting' | 'payment' | 'confirming' | 'verifying' | 'success' | 'failed'>('form');
  const [paymentError, setPaymentError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);

  // Detect available wallets
  const detectWallets = () => {
    const wallets: string[] = [];
    
    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
      wallets.push('MetaMask');
    }
    
    // Check for Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension) {
      wallets.push('Coinbase Wallet');
    }
    
    // Check for Trust Wallet
    if (window.ethereum?.isTrust || window.trustWallet) {
      wallets.push('Trust Wallet');
    }
    
    // Check for OKX Wallet
    if (window.okxwallet || window.ethereum?.isOkxWallet) {
      wallets.push('OKX Wallet');
    }
    
    // Check for Phantom (Solana wallet that also supports Ethereum)
    if (window.phantom?.ethereum) {
      wallets.push('Phantom');
    }
    
    // Check for any Ethereum provider
    if (window.ethereum && wallets.length === 0) {
      wallets.push('Web3 Wallet');
    }
    
    // Check for injected providers array (EIP-6963)
    if (window.ethereum?.providers) {
      window.ethereum.providers.forEach((provider: any) => {
        if (provider.isMetaMask && !wallets.includes('MetaMask')) {
          wallets.push('MetaMask');
        }
        if (provider.isCoinbaseWallet && !wallets.includes('Coinbase Wallet')) {
          wallets.push('Coinbase Wallet');
        }
        if (provider.isTrust && !wallets.includes('Trust Wallet')) {
          wallets.push('Trust Wallet');
        }
      });
    }
    
    return wallets;
  };

  React.useEffect(() => {
    const wallets = detectWallets();
    setDetectedWallets(wallets);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Full name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkWalletAvailability = () => {
    const wallets = detectWallets();
    
    if (wallets.length === 0) {
      throw new Error('No crypto wallet detected. Please install MetaMask, Coinbase Wallet, Trust Wallet, or another Ethereum-compatible wallet to continue with the payment.');
    }
    
    return wallets;
  };

  const getEthereumProvider = () => {
    // Try to get the best available provider
    if (window.ethereum) {
      // If there are multiple providers, try to use MetaMask first
      if (window.ethereum.providers) {
        const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask);
        if (metamask) return metamask;
        
        // Otherwise use the first available provider
        return window.ethereum.providers[0];
      }
      
      return window.ethereum;
    }
    
    throw new Error('No Ethereum provider found');
  };

  const switchToUmiDevnet = async (provider: any) => {
    try {
      // First try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA455' }], // Chain ID: 42037 in hex
      });
      return true;
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902 || error.message?.includes('Unrecognized chain ID')) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA455', // 42037 in hex
              chainName: 'Umi Devnet',
              nativeCurrency: { 
                name: 'Ether', 
                symbol: 'ETH', 
                decimals: 18 
              },
              rpcUrls: ['https://devnet.uminetwork.com'],
              blockExplorerUrls: ['https://devnet.explorer.moved.network']
            }],
          });
          return true;
        } catch (addError: any) {
          console.error('Failed to add Umi Devnet network:', addError);
          throw new Error(`Failed to add Umi Devnet network: ${addError.message}`);
        }
      } else {
        console.error('Network switch error:', error);
        throw new Error(`Failed to switch to Umi Devnet: ${error.message}`);
      }
    }
  };

  const connectWallet = async (provider: any) => {
    try {
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked.');
      }
      
      return accounts[0];
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      if (error.code === 4001) {
        throw new Error('Connection rejected by user. Please approve the connection in your wallet.');
      }
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  };

  const waitForReceipt = async (provider: any, txHash: string, maxAttempts = 60) => {
    let receipt = null;
    let attempts = 0;

    console.log(`Waiting for transaction receipt: ${txHash}`);

    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          console.log(`Attempt ${attempts + 1}/${maxAttempts}: Transaction not yet mined...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          attempts++;
        } else {
          console.log('Transaction receipt received:', receipt);
        }
      } catch (error) {
        console.error('Error checking receipt:', error);
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }
    }

    if (!receipt) {
      throw new Error('Transaction confirmation timeout. The transaction may still be pending.');
    }

    return receipt;
  };

  const verifyPaymentOnChain = async (provider: any, txHash: string, userAddress: string) => {
    try {
      console.log('Verifying payment on chain...');
      
      // Get transaction details
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found on blockchain');
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      console.log('Transaction details:', {
        hash: txHash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        status: receipt.status,
        expectedReceiver: product.walletAddress.toLowerCase(),
        expectedSender: userAddress.toLowerCase()
      });

      // Verify transaction status
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on blockchain');
      }

      // Verify sender
      if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Transaction sender mismatch');
      }

      // Verify receiver
      if (tx.to.toLowerCase() !== product.walletAddress.toLowerCase()) {
        throw new Error('Transaction receiver mismatch');
      }

      // Import ethers dynamically
      const { ethers } = await import('ethers');
      
      // Verify amount
      const expectedAmount = ethers.parseEther(product.price.toString());
      if (tx.value < expectedAmount) {
        const receivedAmount = ethers.formatEther(tx.value);
        throw new Error(`Payment amount insufficient. Expected: ${product.price} ETH, Received: ${receivedAmount} ETH`);
      }

      const actualAmount = ethers.formatEther(tx.value);
      console.log('Payment verification successful:', {
        txHash,
        amount: actualAmount,
        from: tx.from,
        to: tx.to
      });

      return {
        success: true,
        txHash,
        amount: actualAmount,
        from: tx.from,
        to: tx.to
      };

    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  const processPayment = async () => {
    try {
      setPaymentState('connecting');
      setPaymentError('');

      console.log('Starting payment process...');

      // Check wallet availability
      const availableWallets = checkWalletAvailability();
      console.log('Available wallets:', availableWallets);

      // Get Ethereum provider
      const provider = getEthereumProvider();
      console.log('Using provider:', provider);

      // Switch to Umi Devnet
      console.log('Switching to Umi Devnet...');
      await switchToUmiDevnet(provider);

      // Connect wallet
      console.log('Connecting wallet...');
      const address = await connectWallet(provider);
      setUserAddress(address);
      console.log('Wallet connected:', address);

      setPaymentState('payment');

      // Initialize ethers with v6 syntax
      console.log('Initializing ethers provider...');
      const { BrowserProvider, ethers } = await import('ethers');
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      // Prepare transaction
      const amountInWei = ethers.parseEther(product.price.toString());
      console.log('Sending transaction:', {
        to: product.walletAddress,
        value: amountInWei.toString(),
        from: address
      });

      // Send transaction
      const tx = await signer.sendTransaction({
        to: product.walletAddress,
        value: amountInWei,
        gasLimit: 21000, // Standard ETH transfer gas limit
      });

      console.log('Transaction sent:', tx.hash);
      setTxHash(tx.hash);
      setPaymentState('confirming');

      // Wait for confirmation
      console.log('Waiting for transaction confirmation...');
      const receipt = await waitForReceipt(ethersProvider, tx.hash);
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on blockchain');
      }

      console.log('Transaction confirmed:', receipt);
      setPaymentState('verifying');

      // Verify payment on-chain
      console.log('Verifying payment...');
      const verificationResult = await verifyPaymentOnChain(ethersProvider, tx.hash, address);

      if (verificationResult.success) {
        console.log('Payment verification successful');
        setPaymentState('success');
        
        // Create order after successful payment
        const orderData = {
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim(),
          customerPhone: formData.customerPhone.trim(),
          shippingAddress: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            zipCode: formData.zipCode.trim(),
            country: formData.country.trim(),
          },
          walletAddress: product.walletAddress,
          notes: formData.notes.trim(),
          txHash: tx.hash,
          paymentStatus: 'completed' as const,
          status: 'paid' as const,
        };

        console.log('Submitting order:', orderData);
        
        // Submit order with better error handling
        try {
          await onSubmit(orderData);
          console.log('Order submitted successfully');
        } catch (orderError) {
          console.error('Order submission failed:', orderError);
          // Even if order creation fails, we still show success since payment went through
          // The order can be manually created later using the transaction hash
          console.warn('Payment successful but order creation failed. Transaction hash:', tx.hash);
        }
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = error.message || 'Payment failed';
      
      // Handle specific error types
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error. Please try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('order')) {
        errorMessage = 'Payment successful but order creation failed. Please contact support with your transaction hash.';
      }
      
      setPaymentError(errorMessage);
      setPaymentState('failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Start payment process immediately
    await processPayment();
  };

  const getPaymentStateMessage = () => {
    switch (paymentState) {
      case 'connecting':
        return 'Connecting to Umi Network and your wallet...';
      case 'payment':
        return 'Please confirm the payment in your wallet...';
      case 'confirming':
        return 'Transaction sent! Waiting for blockchain confirmation...';
      case 'verifying':
        return 'Verifying payment details on blockchain...';
      case 'success':
        return 'Payment successful! Order has been placed.';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return '';
    }
  };

  const getPaymentStateIcon = () => {
    switch (paymentState) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Wallet className="w-6 h-6 text-blue-600" />;
    }
  };

  if (paymentState !== 'form') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center">
            <div className="mb-6">
              {getPaymentStateIcon()}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {paymentState === 'success' ? 'Order Successful!' : 'Processing Payment'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {getPaymentStateMessage()}
            </p>

            {paymentState === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    Your order has been placed successfully and payment confirmed on the Umi Network blockchain.
                  </p>
                </div>
                {txHash && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-blue-700 mb-2">Transaction Hash:</p>
                    <a
                      href={`https://devnet.explorer.uminetwork.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-600 hover:text-blue-800 break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
                <Button onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            )}

            {paymentState === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">{paymentError}</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setPaymentState('form')} variant="outline" className="flex-1">
                    Try Again
                  </Button>
                  <Button onClick={onClose} variant="ghost" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!['success', 'failed'].includes(paymentState) && (
              <>
                {paymentState === 'verifying' ? (
                  <div className="flex items-center justify-center">
                    <img 
                      src="/ezgif-7f503e88987b5white copy copy.gif" 
                      alt="Processing payment..." 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Complete your purchase of {product.name}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{product.name}</span>
              <div className="eth-price-container">
                <img 
                  src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                  alt="ETH" 
                  className="eth-logo"
                />
                <span className="text-2xl font-bold text-blue-600">{product.price.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter your full name"
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
              </div>
              <Input
                label="Phone Number"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Enter your phone number"
                required
                error={errors.customerPhone}
                className="mt-4"
              />
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Shipping Address
              </h3>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Enter your street address"
                  required
                  error={errors.street}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                    required
                    error={errors.city}
                  />
                  <Input
                    label="State/Province"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter your state/province"
                    required
                    error={errors.state}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ZIP/Postal Code"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Enter your ZIP/postal code"
                    required
                    error={errors.zipCode}
                  />
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter your country"
                    required
                    error={errors.country}
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Textarea
                label="Additional Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special delivery instructions or notes..."
                rows={3}
              />
            </div>

            {/* Payment Information */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-green-600" />
                Crypto Payment via Web3 Wallet
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Payment will be processed on Umi Network. Make sure you have a compatible wallet installed and sufficient ETH balance.
              </p>
              
              {/* Show detected wallets */}
              {detectedWallets.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Detected wallets:</p>
                  <div className="flex flex-wrap gap-2">
                    {detectedWallets.map((wallet) => (
                      <span key={wallet} className="bg-white px-2 py-1 rounded text-xs font-medium text-green-700 border border-green-200">
                        {wallet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {detectedWallets.length === 0 && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    No wallet detected. Please install MetaMask, Coinbase Wallet, Trust Wallet, or another Ethereum-compatible wallet.
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded p-3 border">
                <div className="text-xs text-gray-600 mb-1">Seller's Wallet:</div>
                <div className="font-mono text-sm text-blue-700 break-all">{product.walletAddress}</div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                icon={Wallet}
                disabled={detectedWallets.length === 0}
              >
                <div className="flex items-center gap-2">
                  <span>Place Order & Pay</span>
                  <img 
                    src="/b4f90883-7195-49d7-aef7-e4a5f69cb6f6_removalai_preview.png" 
                    alt="ETH" 
                    className="w-4 h-4"
                  />
                  <span>{product.price.toFixed(4)}</span>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <style jsx>{`
        .eth-price-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eth-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};