import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser } from '../redux/slices/authSlice';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultAction = await dispatch(loginUser({ email, pass }));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950 p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 bg-neutral-900 dark:bg-white flex items-center justify-center rounded-xl shadow-lg">
            <span className="text-white dark:text-neutral-950 font-black text-lg">C</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-black dark:text-white uppercase tracking-tighter">WMS</h1>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Enterprise Fulfillment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-neutral-50/50 dark:bg-neutral-900/50 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-xl backdrop-blur-sm">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                className="pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                {showPassword ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full shadow-lg mt-2" size="lg" disabled={loading || authLoading}>
            {loading || authLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};