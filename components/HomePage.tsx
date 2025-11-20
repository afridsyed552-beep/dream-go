import React, { useState } from 'react';
import { ChatBot } from './ChatBot';
import { NewsFeed, FeedTab } from './NewsFeed';
import { ActivityDashboard } from './ActivityDashboard';
import { LogOut, Car, MessageSquareText, Home, Globe, BookOpen, Activity, Briefcase, Menu } from 'lucide-react';

interface HomePageProps {
  username: string;
  onLogout: () => void;
}

type ViewSection = 'dashboard' | 'news' | 'magazines' | 'activity' | 'work';

export const HomePage: React.FC<HomePageProps> = ({ username, onLogout }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

  const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'news', label: 'Global News', icon: Globe },
      { id: 'magazines', label: 'Magazines', icon: BookOpen },
      { id: 'activity', label: 'Routine & Activity', icon: Activity },
      { id: 'work', label: 'Work Logs', icon: Briefcase },
  ];

  const renderContent = () => {
      switch(currentView) {
          case 'dashboard':
              return (
                  <div className="space-y-8 animate-fade-in">
                    {/* Welcome Banner */}
                    <div className="glass-panel p-8 rounded-3xl border-l-4 border-blue-500 w-full">
                        <h2 className="text-3xl font-black text-white mb-2 italic uppercase">Daily <span className="text-blue-400 text-glow">Intelligence</span></h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                            Welcome back, {username}. Your digital cockpit is ready. Systems nominal.
                        </p>
                    </div>
                    
                    {/* Dashboard previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-white font-bold flex items-center gap-2"><Activity size={18} className="text-cyan-400"/> Today's Overview</h3>
                                 <button onClick={() => setCurrentView('activity')} className="text-xs text-cyan-400 hover:underline">View Details</button>
                             </div>
                             {/* Mini Activity Preview */}
                             <div className="glass-panel p-6 rounded-2xl hover:border-cyan-500/30 transition-colors cursor-pointer" onClick={() => setCurrentView('activity')}>
                                 <div className="flex justify-between items-center mb-4">
                                    <span className="text-white/60 text-xs uppercase tracking-wider">Productivity</span>
                                    <span className="text-cyan-400 font-bold text-xl">92%</span>
                                 </div>
                                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-cyan-400 w-[92%]"></div>
                                 </div>
                                 <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
                                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                     Current Focus: Deep Work
                                 </div>
                             </div>
                        </div>

                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-white font-bold flex items-center gap-2"><Globe size={18} className="text-blue-400"/> Latest Headlines</h3>
                                 <button onClick={() => setCurrentView('news')} className="text-xs text-blue-400 hover:underline">Read More</button>
                             </div>
                             <div onClick={() => setCurrentView('news')} className="cursor-pointer">
                                 <NewsFeed initialTab="news" />
                             </div>
                        </div>
                    </div>
                  </div>
              );
          case 'news':
              return <NewsFeed initialTab="news" />;
          case 'magazines':
              return <NewsFeed initialTab="magazines" />;
          case 'activity':
          case 'work':
              return <ActivityDashboard />;
          default:
              return null;
      }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=2664&auto=format&fit=crop" 
          alt="BMW M2 Competition" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-black/80"></div>
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
             <Car className="text-blue-400" size={20} />
             <span className="font-bold tracking-wide">M2 COCKPIT</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
              <Menu />
          </button>
      </div>

      {/* Sidebar */}
      <div className={`
          absolute md:relative z-40 h-full w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
          <div className="p-6 border-b border-white/10">
               <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                        <Car className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide leading-none">M2 COCKPIT</h1>
                        <p className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">System Online</p>
                    </div>
                </div>
          </div>

          <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                        setCurrentView(item.id as ViewSection);
                        setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        currentView === item.id 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                      <item.icon size={20} className={`transition-colors ${currentView === item.id ? 'text-blue-400' : 'text-white/50 group-hover:text-white'}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {currentView === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>}
                  </button>
              ))}
          </div>

          <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                       {username.charAt(0).toUpperCase()}
                   </div>
                   <div className="overflow-hidden">
                       <p className="text-sm font-bold text-white truncate">{username}</p>
                       <p className="text-xs text-white/40 truncate">Pro Account</p>
                   </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider"
            >
                <LogOut size={14} />
                Disconnect
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-20 md:pt-8 scroll-smooth custom-scrollbar">
              {/* Top Bar Title (Dynamic) */}
              <div className="mb-6 flex items-center gap-2 md:hidden">
                  <span className="text-white/50 text-sm uppercase tracking-widest font-bold">
                      {navItems.find(i => i.id === currentView)?.label}
                  </span>
                  <div className="h-px flex-1 bg-white/10"></div>
              </div>

              {renderContent()}
          </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`
            fixed bottom-8 right-8 z-40 p-4 rounded-full 
            bg-gradient-to-r from-cyan-600 to-blue-600 
            text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] 
            hover:scale-110 transition-all duration-300
            ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <MessageSquareText size={28} />
      </button>

      {/* Chat Modal Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl relative animate-float-fast">
                <ChatBot onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
      )}

    </div>
  );
};