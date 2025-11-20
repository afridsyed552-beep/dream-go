import React, { useState } from 'react';
import { Calendar, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface DobFormProps {
  onSubmit: (dob: string) => void;
  onBack: () => void;
}

export const DobForm: React.FC<DobFormProps> = ({ onSubmit, onBack }) => {
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;

    setIsLoading(true);
    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(dob);
    }, 1000);
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative animate-float-slow z-20">
        
      {/* Decorative top bar */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 w-1/2 h-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]"></div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wider flex items-center justify-center gap-2 text-glow">
          <Calendar size={24} className="text-cyan-400" />
          VERIFY
        </h1>
        <p className="text-white/50 text-sm">Confirm your date of birth to proceed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-cyan-300 font-semibold ml-1">Date of Birth</label>
          <div className="relative group">
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-black/40 transition-all duration-300 appearance-none"
              style={{ colorScheme: 'dark' }}
              required
            />
            <div className="absolute inset-0 rounded-xl bg-cyan-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 blur-sm -z-10"></div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !dob}
            className={`
              flex-1 py-4 rounded-xl font-bold text-white tracking-wide uppercase
              bg-gradient-to-r from-cyan-600 to-blue-600
              hover:from-cyan-500 hover:to-blue-500
              active:scale-[0.98]
              transition-all duration-300 shadow-lg
              flex items-center justify-center gap-2
              ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'}
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                Verifying...
              </>
            ) : (
              <>
                Complete Access
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-white/30">
          Security Protocol v2.4 active
        </p>
      </div>
    </div>
  );
};