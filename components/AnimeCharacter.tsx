import React from 'react';

interface AnimeCharacterProps {
  emotion: 'neutral' | 'happy';
}

export const AnimeCharacter: React.FC<AnimeCharacterProps> = ({ emotion }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center animate-float-medium">
      {/* Character Container */}
      <div className="relative w-[350px] h-[500px] md:w-[400px] md:h-[550px]">
        
        {/* Glowing Aura behind character */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 to-transparent rounded-full blur-3xl transform translate-y-10 scale-90"></div>

        {/* Character Image (Using a reliable placeholder that looks illustrative/fantasy) */}
        {/* We use specific picsum IDs that have a soft/portrait feel, or a general evocative image */}
        <img 
            src={emotion === 'happy' 
                ? "https://picsum.photos/seed/animeHappy/400/600" 
                : "https://picsum.photos/seed/animeCool/400/600"
            } 
            alt="Anime Character"
            className="w-full h-full object-cover rounded-[40px] shadow-2xl mask-image-gradient relative z-10 border-4 border-white/10"
            style={{
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
        />

        {/* Floating Elements around character */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400/30 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 -left-12 w-16 h-16 bg-pink-500/30 rounded-full blur-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        
        {/* Dialog/Thought Bubble */}
        <div className={`absolute -top-4 -right-12 bg-white/90 text-slate-800 px-4 py-2 rounded-xl rounded-bl-none shadow-lg transform transition-all duration-500 ${emotion === 'happy' ? 'scale-100 opacity-100' : 'scale-90 opacity-0 translate-y-4'}`}>
            <p className="font-bold text-sm">Welcome back! ✨</p>
        </div>
        
         <div className={`absolute -top-4 -right-12 bg-white/90 text-slate-800 px-4 py-2 rounded-xl rounded-bl-none shadow-lg transform transition-all duration-500 ${emotion === 'neutral' ? 'scale-100 opacity-100' : 'scale-90 opacity-0 translate-y-4'}`}>
            <p className="font-bold text-sm">Identity required.</p>
        </div>

      </div>
    </div>
  );
};