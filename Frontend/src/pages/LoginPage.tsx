import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser } from '../redux/slices/authSlice';
import { Button, Input } from '../components/ui';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ identifier, password })).unwrap();
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to sign in. Please check your credentials.');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#1c1c1c] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8"
      >
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-supabase-green text-black font-black text-xl">
            W
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">ChaseValue</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Warehouse Management System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-0.5">User Id</label>
            <Input
              type="text"
              placeholder="User Id"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-supabase-green hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm font-medium transition-colors"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
