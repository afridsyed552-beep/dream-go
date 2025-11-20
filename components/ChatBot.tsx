import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, Map, X, Mic, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { GoogleGenAI, Chat, LiveServerMessage, Modality } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
    onClose?: () => void;
}

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your Roadmap Architect. You can chat with me here, or switch to Live Voice Mode for a real-time human-like conversation."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0 to 100 for visualizer
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Live API Refs
  const liveSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Text Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are an expert Roadmap Architect and a friendly AI assistant. Be encouraging, clear, and structured.",
          },
        });
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };
    initChat();
    
    return () => {
        stopLiveSession();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMessage.text });
      const responseText = result.text;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm having trouble thinking of a roadmap right now."
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Live API Logic ---

  const startLiveSession = async () => {
    if (isLiveConnected) return;
    setIsLiveConnected(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Setup Visualizer
      analyserRef.current = outputAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      
      // Output Gain
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(analyserRef.current);
      analyserRef.current.connect(outputAudioContextRef.current.destination);

      // Start Visualization Loop
      const updateVolume = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioVolume(avg);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            // Setup Input Pipeline
            if (!inputAudioContextRef.current) return;
            
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            
            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               // Ensure nextStartTime is at least current time
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 ctx,
                 24000,
                 1
               );
               
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }
            
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
              console.log("Live Session Closed");
              stopLiveSession();
          },
          onerror: (e) => {
              console.error("Live Session Error", e);
              stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are Aura, a highly advanced, intelligent vehicle interface and roadmap architect. You are speaking to the driver. Keep responses concise, conversational, and helpful. You have a cool, composed personality.",
        },
      });

      liveSessionRef.current = sessionPromise;
      
    } catch (err) {
        console.error("Failed to start live session:", err);
        stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    setIsLiveConnected(false);
    setAudioVolume(0);
    
    // Stop Visualizer
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Stop Inputs
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }

    // Stop Outputs
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    
    // Reset session ref
    liveSessionRef.current = null;
  };

  const toggleMode = () => {
      if (mode === 'text') {
          setMode('live');
          startLiveSession();
      } else {
          stopLiveSession();
          setMode('text');
      }
  };

  return (
    <div className="flex flex-col h-[600px] w-full glass-panel rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl transition-all duration-500">
      
      {/* Header */}
      <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-white/20 transition-all duration-500 ${mode === 'live' ? 'bg-red-500 shadow-red-500/50' : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20'}`}>
              {mode === 'live' ? <Volume2 className="text-white animate-pulse" size={20} /> : <span className="text-white font-black text-xl italic tracking-tighter pr-0.5">A</span>}
           </div>
           <div>
             <h2 className="text-white font-bold text-lg flex items-center gap-2">
               {mode === 'live' ? 'Voice Interface' : 'Roadmap Architect'}
               {mode === 'text' && <Sparkles size={14} className="text-yellow-400 animate-pulse" />}
             </h2>
             <p className="text-white/40 text-xs">{mode === 'live' ? 'Live Connection Active' : 'Powered by Gemini 2.5'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={toggleMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    mode === 'live' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30'
                }`}
            >
                {mode === 'live' ? <PhoneOff size={16} /> : <Phone size={16} />}
                {mode === 'live' ? 'End Call' : 'Call Agent'}
            </button>
            
            {onClose && (
                <button 
                    onClick={() => { stopLiveSession(); onClose(); }}
                    className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Main View Switcher */}
      {mode === 'text' ? (
          // --- Text Mode Interface ---
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-black/40 to-transparent">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    <div className={`
                    w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-white/10
                    ${msg.role === 'user' ? 'bg-pink-600' : 'bg-gradient-to-br from-cyan-600 to-blue-700'}
                    `}>
                    {msg.role === 'user' ? <User size={16} /> : <span className="text-white font-bold text-xs italic">A</span>}
                    </div>
                    <div className={`
                    max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md
                    ${msg.role === 'user' 
                        ? 'bg-pink-500/20 border border-pink-500/30 text-white rounded-tr-none' 
                        : 'bg-cyan-900/40 border border-cyan-500/30 text-gray-100 rounded-tl-none'}
                    `}>
                    {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={`${line.startsWith('- ') || line.match(/^\d\./) ? 'ml-4 mb-1' : 'mb-2 last:mb-0'} ${line.startsWith('#') ? 'font-bold text-lg text-cyan-300 mt-2' : ''}`}>
                        {line}
                        </p>
                    ))}
                    </div>
                </div>
                ))}
                
                {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center border border-white/10">
                        <span className="text-white font-bold text-xs italic">A</span>
                    </div>
                    <div className="bg-cyan-900/20 border border-cyan-500/20 px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-4 min-w-[120px]">
                        <span className="text-cyan-400/70 text-xs font-bold tracking-widest uppercase">Thinking</span>
                        <div className="flex items-center gap-1 h-4">
                            {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
                                <div key={delay} className="w-1 bg-cyan-400 rounded-full animate-wave" style={{ animationDelay: `${delay}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-black/60 border-t border-white/10 relative z-20">
                <div className="relative flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your goal here..."
                    className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all duration-300"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-900/50"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
                </div>
            </form>
          </>
      ) : (
          // --- Live Voice Mode Interface ---
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background Ambient Effects */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-red-900/20"></div>
              
              {/* Central Visualizer */}
              <div className="relative z-10 flex flex-col items-center gap-8">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      {/* Pulsing Rings based on volume */}
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-red-500 to-orange-600 rounded-full opacity-30 blur-xl transition-all duration-75"
                        style={{ transform: `scale(${1 + audioVolume / 50})` }}
                      ></div>
                      <div 
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex items-center justify-center relative overflow-hidden transition-all duration-75"
                        style={{ transform: `scale(${1 + audioVolume / 100})` }}
                      >
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                          <Mic size={40} className={`text-white/80 ${isLiveConnected ? 'text-red-400' : 'text-gray-500'}`} />
                          
                          {/* Orbital Spinner */}
                          <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      </div>
                  </div>

                  <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-white tracking-widest uppercase">
                          {isLiveConnected ? 'Listening' : 'Connecting...'}
                      </h3>
                      <p className="text-white/40 text-sm">Speak naturally. Aura is listening.</p>
                  </div>
              </div>

              {/* Waveform Visualization (Fake/CSS based for style) */}
              <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center gap-1 pb-8 opacity-50">
                  {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-red-500 rounded-t-full transition-all duration-100"
                        style={{ 
                            height: `${Math.max(10, Math.random() * audioVolume * 2 + 20)}%`,
                            opacity: Math.max(0.2, audioVolume / 100)
                        }}
                      ></div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};