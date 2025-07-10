import React, { useState } from 'react';

interface SignupFormProps {
  onSignup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await onSignup(email, password, name);
      if (!result.success) {
        setError(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col text-center">
      <div className="flex justify-center items-center flex-col bg-white h-auto w-auto border-2 border-[#264143] rounded-[20px] shadow-[3px_4px_0px_1px_#E99F4C] px-6 py-4">
        <p className="text-[#264143] font-black text-xl mt-1 mb-3">SIGN UP</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex flex-col items-baseline m-1">
            <label className="font-semibold mb-0.5 text-[#264143] text-sm" htmlFor="name">Name</label>
            <input
              id="name"
              placeholder="Enter your full name"
              className="outline-none border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] w-[260px] p-2.5 rounded text-sm focus:translate-y-1 focus:shadow-[1px_2px_0px_0px_#E99F4C] transition-all duration-150"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col items-baseline m-1">
            <label className="font-semibold mb-0.5 text-[#264143] text-sm" htmlFor="email">Email</label>
            <input
              id="email"
              placeholder="Enter your email"
              className="outline-none border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] w-[260px] p-2.5 rounded text-sm focus:translate-y-1 focus:shadow-[1px_2px_0px_0px_#E99F4C] transition-all duration-150"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col items-baseline m-1">
            <label className="font-semibold mb-0.5 text-[#264143] text-sm" htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="Enter your password (min 6 characters)"
              className="outline-none border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] w-[260px] p-2.5 rounded text-sm focus:translate-y-1 focus:shadow-[1px_2px_0px_0px_#E99F4C] transition-all duration-150"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-xs text-center mb-1 max-w-[260px] break-words bg-red-50 p-2 rounded border border-red-200">
              {error}
              {error.includes('rate limit') && (
                <div className="mt-2 text-blue-600">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="underline hover:no-underline"
                  >
                    Try logging in instead
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="p-3 mt-3 mb-2 w-[260px] text-sm bg-[#989cfc] rounded-[10px] font-extrabold shadow-[3px_3px_0px_0px_#E99F4C] text-white border-none cursor-pointer hover:opacity-90 focus:translate-y-1 focus:shadow-[1px_2px_0px_0px_#E99F4C] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
            
            <p className="text-[#264143] mb-1 text-xs">
              Have an Account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                disabled={isLoading}
                className="font-extrabold text-[#264143] p-0.5 underline hover:opacity-80 transition-opacity duration-150 disabled:opacity-50"
              >
                Login Here!
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};