import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';
import { apiFetch } from '../api/baseFetcher';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      setIsSent(true);
      toast.success('New password has been sent to your email');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#1c1c1c] p-4 selection:bg-supabase-green/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] space-y-8"
      >
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-supabase-green text-black font-black text-xl">
            W
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Forgot your password?</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isSent 
                ? "We've sent a new random password to your email inbox."
                : "Enter your email and we'll send you a new random password to sign in."}
            </p>
          </div>
        </div>

        {isSent ? (
          <div className="space-y-6">
            <div className="p-3 bg-supabase-green/5 border border-supabase-green/20 rounded-md">
              <p className="text-xs text-supabase-green font-medium text-center">
                Check your email! You can now use your new random password to sign in.
              </p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-10 text-sm font-medium transition-colors"
            >
              Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-0.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900">
              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium transition-colors"
                loading={loading}
              >
                Send New Password
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-supabase-green hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
