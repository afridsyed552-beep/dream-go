import React from 'react';
import { Clock, CheckCircle, Calendar, BarChart3, Zap, Coffee, Briefcase, ArrowUp } from 'lucide-react';

export const ActivityDashboard: React.FC = () => {
  const routineItems = [
    { time: '09:00 AM', title: 'Morning Standup', type: 'work', duration: '30m' },
    { time: '10:00 AM', title: 'Deep Work: Project Alpha', type: 'focus', duration: '2h' },
    { time: '12:30 PM', title: 'Lunch Break', type: 'break', duration: '1h' },
    { time: '02:00 PM', title: 'Client Review', type: 'meeting', duration: '45m' },
    { time: '04:00 PM', title: 'Code Review & Merge', type: 'work', duration: '1h' },
  ];

  const weeklyStats = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 8.2 },
    { day: 'Wed', hours: 6.8 },
    { day: 'Thu', hours: 9.0 },
    { day: 'Fri', hours: 5.5 }, // Current day
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-6xl mx-auto">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Work Hours Card */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock size={80} />
            </div>
            <div className="flex items-end gap-4 mb-2">
                <h2 className="text-4xl font-black text-white">5.5<span className="text-lg text-white/50 font-normal ml-1">hrs</span></h2>
                <span className="text-green-400 text-sm font-bold mb-2 flex items-center gap-1">
                    <ArrowUp size={12} /> +12%
                </span>
            </div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Daily Active Time</p>
            <div className="w-full h-1.5 bg-white/10 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[65%]"></div>
            </div>
        </div>

        {/* Productivity Score */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} />
            </div>
            <div className="flex items-end gap-4 mb-2">
                <h2 className="text-4xl font-black text-white">92<span className="text-lg text-white/50 font-normal ml-1">%</span></h2>
            </div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Focus Score</p>
            <div className="w-full h-1.5 bg-white/10 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 w-[92%]"></div>
            </div>
        </div>

        {/* Tasks Completed */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle size={80} />
            </div>
             <div className="flex items-end gap-4 mb-2">
                <h2 className="text-4xl font-black text-white">14<span className="text-lg text-white/50 font-normal ml-1">/ 18</span></h2>
            </div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Tasks Completed</p>
             <div className="w-full h-1.5 bg-white/10 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[78%]"></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* Daily Routine Timeline */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="text-blue-400" size={20} />
                      Today's Timeline
                  </h3>
                  <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded">Friday, Oct 24</span>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {routineItems.map((item, index) => (
                      <div key={index} className="relative pl-10 group">
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-[#1a1a2e] transition-all duration-300 group-hover:scale-125 ${
                              item.type === 'work' ? 'bg-blue-500' : 
                              item.type === 'focus' ? 'bg-purple-500' : 
                              item.type === 'break' ? 'bg-green-500' : 'bg-orange-500'
                          }`}></div>
                          
                          <div className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-xl transition-all duration-300 hover:translate-x-1">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-white font-bold">{item.title}</h4>
                                  <span className="text-xs font-mono text-white/50">{item.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/40">
                                  <Clock size={14} />
                                  {item.time}
                                  {item.type === 'focus' && <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded border border-purple-500/30">DEEP WORK</span>}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BarChart3 className="text-pink-400" size={20} />
                      Work Load
                  </h3>
              </div>

              <div className="flex-1 flex items-end justify-between gap-2">
                  {weeklyStats.map((stat, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 w-full group">
                          <div className="w-full relative flex items-end justify-center h-48 bg-white/5 rounded-lg overflow-hidden">
                              <div 
                                className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 opacity-60 group-hover:opacity-100 transition-all duration-500 rounded-t-lg relative"
                                style={{ height: `${(stat.hours / 10) * 100}%` }}
                              >
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      {stat.hours}h
                                  </div>
                              </div>
                          </div>
                          <span className={`text-xs font-bold uppercase ${index === 4 ? 'text-white' : 'text-white/30'}`}>
                              {stat.day}
                          </span>
                      </div>
                  ))}
              </div>
              
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Briefcase size={16} className="text-blue-400" />
                      </div>
                      <div>
                          <p className="text-white text-sm font-bold">Project Beta Deadline</p>
                          <p className="text-white/40 text-xs mt-0.5">Due in 3 days • 4 tasks remaining</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};