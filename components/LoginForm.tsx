import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userId: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;

    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userId);
    }, 1500);
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative animate-float-slow z-20">
        
      {/* Decorative top bar */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-violet-600 w-1/2 h-1.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)]"></div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wider flex items-center justify-center gap-2 text-glow">
          <Sparkles size={24} className="text-pink-400" />
          DREAM GO
        </h1>
        <p className="text-white/50 text-sm">Enter your credentials to access Dream Go.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-pink-300 font-semibold ml-1">User ID</label>
          <div className="relative group">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-black/40 transition-all duration-300"
              placeholder="DreamUser-001"
            />
            <div className="absolute inset-0 rounded-xl bg-pink-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 blur-sm -z-10"></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-cyan-300 font-semibold ml-1">Password</label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-black/40 transition-all duration-300"
              placeholder="••••••••"
            />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div className="absolute inset-0 rounded-xl bg-cyan-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 blur-sm -z-10"></div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !userId || !password}
            className={`
              w-full py-4 rounded-xl font-bold text-white tracking-wide uppercase
              bg-gradient-to-r from-pink-600 to-purple-600
              hover:from-pink-500 hover:to-purple-500
              active:scale-[0.98]
              transition-all duration-300 shadow-lg
              flex items-center justify-center gap-2
              ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'}
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </>
            ) : (
              <>
                Start Dream Go
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <a href="#" className="text-xs text-white/40 hover:text-pink-300 transition-colors border-b border-transparent hover:border-pink-300 pb-0.5">
          Forgot your access key?
        </a>
      </div>
    </div>
  );
};