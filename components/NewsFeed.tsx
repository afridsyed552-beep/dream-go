import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, TrendingUp, RefreshCw, ChevronRight } from 'lucide-react';

export type FeedTab = 'news' | 'magazines';

interface NewsFeedProps {
    initialTab?: FeedTab;
}

const MOCK_GOOGLE_NEWS = [
  {
    id: 1,
    title: "Global Economic Summit: Leaders Agree on New Trade Protocol",
    source: "World News Daily",
    time: "14 mins ago",
    category: "Business",
    image: "https://images.unsplash.com/photo-1526304640151-b5a959e32766?q=80&w=500&auto=format&fit=crop",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Breakthrough in Quantum Computing Architecture Announced",
    source: "TechCrunch",
    time: "1 hour ago",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "SpaceX Successfully Launches New Satellite Constellation",
    source: "SpaceNews",
    time: "2 hours ago",
    category: "Science",
    image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=500&auto=format&fit=crop",
    readTime: "4 min read"
  },
  {
    id: 4,
    title: "Urban Planning: The Rise of Vertical Forests in Mega Cities",
    source: "ArchDaily",
    time: "4 hours ago",
    category: "Environment",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop",
    readTime: "6 min read"
  },
  {
    id: 5,
    title: "The Future of Remote Work: Trends for 2025",
    source: "Forbes",
    time: "5 hours ago",
    category: "Work",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=500&auto=format&fit=crop",
    readTime: "3 min read"
  }
];

const MOCK_MAGAZINES = [
  {
    id: 1,
    title: "TIME",
    issue: "Person of the Year",
    cover: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=500&auto=format&fit=crop",
    color: "from-red-600 to-red-900"
  },
  {
    id: 2,
    title: "WIRED",
    issue: "The AI Revolution",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop",
    color: "from-gray-900 to-black"
  },
  {
    id: 3,
    title: "NAT GEO",
    issue: "Ocean Depths",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop",
    color: "from-yellow-500 to-yellow-700"
  },
  {
    id: 4,
    title: "FORBES",
    issue: "30 Under 30",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop",
    color: "from-blue-600 to-blue-900"
  }
];

export const NewsFeed: React.FC<NewsFeedProps> = ({ initialTab = 'news' }) => {
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [newsData, setNewsData] = useState(MOCK_GOOGLE_NEWS);

  // Sync state if props change
  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  // Simulate API Fetch
  const refreshNews = () => {
    setIsLoading(true);
    // In a real app, this would be: fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=...')
    setTimeout(() => {
      setIsLoading(false);
      // Just shuffling for effect
      setNewsData(prev => [...prev].sort(() => Math.random() - 0.5));
    }, 1500);
  };

  return (
    <div className="glass-panel w-full h-[600px] rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
      {/* Header Tabs */}
      <div className="flex border-b border-white/10 bg-black/40 backdrop-blur-xl z-10">
        <div className="flex-1 flex">
            <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-5 text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative ${
                activeTab === 'news'
                ? 'text-white'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
            >
            <Globe size={16} />
            Google News
            {activeTab === 'news' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            )}
            </button>
            <button
            onClick={() => setActiveTab('magazines')}
            className={`flex-1 py-5 text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative ${
                activeTab === 'magazines'
                ? 'text-white'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
            >
            <BookOpen size={16} />
            Magazines
            {activeTab === 'magazines' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
            )}
            </button>
        </div>
        
        {/* Refresh Button */}
        <button 
            onClick={refreshNews} 
            className="px-6 border-l border-white/10 text-white/40 hover:text-blue-400 transition-colors"
            title="Refresh Feed"
        >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative bg-gradient-to-b from-black/20 to-transparent">
        
        {activeTab === 'news' && (
          <div className="space-y-4 animate-fade-in">
             {/* Google News Header Lookalike */}
             <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                     <TrendingUp size={20} className="text-blue-400" />
                     Top Stories
                 </h3>
                 <span className="text-xs text-white/40">Updated just now</span>
             </div>

            {newsData.map((item) => (
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                key={item.id} 
                className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400/30 rounded-2xl p-4 flex gap-6 transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] block"
              >
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between z-10 relative">
                    <div className="flex items-center gap-3 mb-2">
                         <img 
                            src={`https://ui-avatars.com/api/?name=${item.source}&background=random&size=20`} 
                            alt={item.source} 
                            className="w-5 h-5 rounded-sm" 
                         />
                         <span className="text-xs font-bold text-white/70 uppercase tracking-wide">
                            {item.source}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-white/20"></span>
                         <span className="text-xs text-white/40 flex items-center gap-1">
                            {item.time}
                         </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-300 transition-colors mb-3">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-auto">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                            {item.category}
                         </span>
                         <span className="text-[10px] text-white/30">{item.readTime}</span>
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="w-32 h-24 md:w-40 md:h-28 rounded-xl overflow-hidden flex-shrink-0 relative shadow-lg">
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-0"></div>
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'magazines' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in pb-4">
             {MOCK_MAGAZINES.map((mag) => (
                 <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(mag.title + ' ' + mag.issue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={mag.id} 
                    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block"
                 >
                    <img 
                        src={mag.cover} 
                        alt={mag.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                    
                    {/* Magazine Cover UI */}
                    <div className="absolute top-0 left-0 w-full h-full p-5 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                            <div className={`w-full h-1 bg-gradient-to-r ${mag.color} absolute top-0 left-0`}></div>
                            <div className="mt-2 w-full flex justify-center">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase text-center drop-shadow-lg" style={{fontFamily: 'Times New Roman, serif'}}>
                                    {mag.title}
                                </h2>
                            </div>
                        </div>

                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="inline-block px-2 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest mb-2">
                                {mag.issue}
                            </span>
                            <div className="w-full h-0.5 bg-white/50 mb-3"></div>
                            <div className="flex items-center gap-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                Read Now <ChevronRight size={12} />
                            </div>
                        </div>
                    </div>
                 </a>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};