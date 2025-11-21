import React from 'react';

export const VehicleSlider: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center animate-float-medium">
      {/* Main Container */}
      <div className="relative w-full max-w-[600px] aspect-[4/3] md:aspect-[16/10] rounded-[30px] overflow-visible group perspective-1000">
        
        {/* Branding Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#009CDD] via-[#1B3290] to-[#E01D27] rounded-[30px] blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

        {/* Image Container */}
        <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl border border-white/10 bg-black transform transition-transform duration-500 hover:scale-[1.01]">
            <img
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop"
            alt="Dream Go Vehicle"
            className="w-full h-full object-cover transform scale-110 group-hover:scale-105 transition-transform duration-[2s]"
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 opacity-60"></div>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2048px-BMW.svg.png" alt="Logo" className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm tracking-widest drop-shadow-md">DREAM GO SYSTEMS</h3>
                    <p className="text-blue-400 text-[10px] font-mono tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        SYSTEM ONLINE
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 left-8 z-10">
                 <div className="flex items-center gap-1.5 mb-3">
                    <span className="h-5 w-1.5 bg-[#009CDD] skew-x-[-20deg] shadow-[0_0_10px_#009CDD]"></span>
                    <span className="h-5 w-1.5 bg-[#1B3290] skew-x-[-20deg] shadow-[0_0_10px_#1B3290]"></span>
                    <span className="h-5 w-1.5 bg-[#E01D27] skew-x-[-20deg] shadow-[0_0_10px_#E01D27]"></span>
                    <span className="text-white font-black italic text-xl ml-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">DREAM GO PERFORMANCE</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl">
                    DREAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">GO</span>
                 </h1>
            </div>

             {/* Tech Stats */}
             <div className="absolute top-1/2 right-0 transform -translate-y-1/2 flex flex-col gap-3 z-10">
                 {[
                     { label: 'Horsepower', value: '503 hp', icon: '⚡' },
                     { label: '0-60 mph', value: '3.4 s', icon: '⏱️' },
                     { label: 'Torque', value: '479 lb-ft', icon: '⚙️' }
                 ].map((stat, idx) => (
                    <div key={idx} className="bg-black/60 backdrop-blur-md pl-6 pr-4 py-2.5 rounded-l-xl border-l-2 border-[#009CDD] text-right translate-x-2 hover:translate-x-0 transition-transform duration-300 group/stat">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider group-hover/stat:text-blue-400 transition-colors">{stat.label}</p>
                        <p className="text-lg font-bold text-white flex items-center justify-end gap-2">
                            {stat.value}
                        </p>
                    </div>
                 ))}
             </div>
             
             {/* Decorative Lines */}
             <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-white/10 rounded-br-[30px]"></div>
             <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-white/10 rounded-tl-[30px]"></div>
        </div>
      </div>
    </div>
  );
};