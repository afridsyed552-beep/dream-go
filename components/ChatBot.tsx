import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, X, Mic, Phone, PhoneOff, Volume2, Waves } from 'lucide-react';
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
      text: "Hello! I'm your Dream Go AI. You can chat with me here, or switch to Live Voice Mode for a real-time human-like conversation."
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
  const aiRef = useRef<GoogleGenAI | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Text Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        aiRef.current = ai;
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are Dream Go AI, a friendly and expert assistant. Be encouraging, clear, and structured.",
          },
        });
      } catch (error) {
        console.error("Failed to init chat:", error);
      }
    };
    initChat();

    return () => {
        disconnectLive();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Text Chat Logic ---
  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input
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
        text: responseText
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Live Audio Logic ---
  const connectLive = async () => {
    if (!aiRef.current) return;

    try {
      setIsLoading(true);
      
      // Setup Audio Contexts
      const InputContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new InputContextClass({ sampleRate: 16000 });
      const outputCtx = new InputContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Setup Analyser for Visualizer
      const analyser = outputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Start Visualizer Loop
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioVolume(average); // Scale roughly 0-100
        
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Live API
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: "You are Dream Go AI, a futuristic and helpful vehicle assistant.",
        },
        callbacks: {
          onopen: async () => {
            setIsLiveConnected(true);
            setIsLoading(false);
            
            // Stream Audio Input
            const source = inputCtx.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                
                // Connect to analyser for visuals, then to destination for sound
                if (analyserRef.current) {
                    source.connect(analyserRef.current);
                    analyserRef.current.connect(ctx.destination);
                } else {
                    source.connect(ctx.destination);
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                });
                sourcesRef.current.add(source);
            }
          },
          onclose: () => {
            setIsLiveConnected(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsLiveConnected(false);
            setIsLoading(false);
          }
        }
      });
      
      liveSessionRef.current = sessionPromise;

    } catch (error) {
        console.error("Connection failed:", error);
        setIsLoading(false);
        setMode('text');
    }
  };

  const disconnectLive = () => {
      // Stop tracks
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      
      // Close contexts
      if (inputAudioContextRef.current) {
          inputAudioContextRef.current.close();
          inputAudioContextRef.current = null;
      }
      if (outputAudioContextRef.current) {
          outputAudioContextRef.current.close();
          outputAudioContextRef.current = null;
      }
      
      // Cancel animation
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }

      // Stop Sources
      sourcesRef.current.forEach(s => s.stop());
      sourcesRef.current.clear();

      setIsLiveConnected(false);
      setAudioVolume(0);
  };

  const toggleMode = () => {
      if (mode === 'text') {
          setMode('live');
          connectLive();
      } else {
          disconnectLive();
          setMode('text');
      }
  };

  return (
    <div className="w-full h-[600px] glass-panel rounded-3xl flex flex-col overflow-hidden relative shadow-2xl border border-white/20 animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === 'live' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                {mode === 'live' ? <Waves className="text-red-400 animate-pulse" size={20} /> : <Sparkles className="text-blue-400" size={20} />}
            </div>
            <div>
                <h3 className="font-bold text-white tracking-wide">Dream Go AI</h3>
                <p className="text-xs text-white/50 flex items-center gap-1">
                    {mode === 'live' ? (
                        <>
                             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                             Live Voice Active
                        </>
                    ) : (
                         <>
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                             Online
                        </>
                    )}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
             {/* Mode Toggle */}
             <button 
                onClick={toggleMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                    mode === 'live' 
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
             >
                 {mode === 'live' ? 'End Voice' : 'Start Voice'}
             </button>
             
             {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
                    <X size={20} />
                </button>
             )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-b from-black/20 to-transparent">
          
          {mode === 'text' ? (
            <div className="p-6 space-y-6">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-blue-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div
                    className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user'
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                        : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-sm'
                    }`}
                    >
                    {msg.text}
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={16} />
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none">
                        <Loader2 size={16} className="animate-spin text-white/50" />
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
          ) : (
            // VOICE MODE UI
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-8">
                
                {/* Visualizer Core */}
                <div className="relative flex items-center justify-center z-10">
                     {/* Outer Rings */}
                     <div className="absolute w-64 h-64 border border-red-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                     <div className="absolute w-56 h-56 border border-red-500/10 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                     
                     {/* Pulsing Aura based on volume */}
                     <div 
                        className="absolute bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-2xl opacity-40 transition-all duration-75 ease-out"
                        style={{ 
                            width: `${100 + audioVolume * 2}px`, 
                            height: `${100 + audioVolume * 2}px`
                        }}
                     ></div>
                     
                     {/* Central Core */}
                     <div className="w-32 h-32 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] relative">
                        <Mic size={32} className={`text-red-400 transition-transform duration-100 ${audioVolume > 10 ? 'scale-110' : 'scale-100'}`} />
                        
                        {/* Connecting Animation */}
                        {isLoading && (
                            <div className="absolute inset-0 rounded-full border-2 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        )}
                     </div>
                </div>

                <div className="mt-12 text-center z-10">
                    <h2 className="text-2xl font-bold text-white tracking-wider mb-2">
                        {isLiveConnected ? "LISTENING..." : isLoading ? "INITIALIZING UPLINK..." : "DISCONNECTED"}
                    </h2>
                    <p className="text-white/40 text-sm">
                        Speak naturally. Dream Go AI is processing real-time audio.
                    </p>
                </div>
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            </div>
          )}

      </div>

      {/* Input Area (Only for Text Mode) */}
      {mode === 'text' && (
        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="relative flex items-center">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Dream Go AI..."
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
            <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={18} />
            </button>
            </div>
        </div>
      )}
      
       {/* Controls (Only for Live Mode) */}
       {mode === 'live' && (
           <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl flex justify-center">
               <button 
                onClick={disconnectLive}
                className="flex items-center gap-2 px-6 py-3 bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 text-red-400 rounded-xl font-bold uppercase tracking-wider transition-all"
               >
                   <PhoneOff size={18} /> End Session
               </button>
           </div>
       )}
    </div>
  );
};
