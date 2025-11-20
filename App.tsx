import React, { useState } from 'react';
import { Background } from './components/Background';
import { LoginForm } from './components/LoginForm';
import { DobForm } from './components/DobForm';
import { VehicleSlider } from './components/VehicleSlider';
import { FloatingParticles } from './components/FloatingParticles';
import { HomePage } from './components/HomePage';

const App: React.FC = () => {
  const [loginStep, setLoginStep] = useState<'credentials' | 'dob' | 'complete'>('credentials');
  const [username, setUsername] = useState('');

  const handleCredentialsSubmit = (user: string) => {
    setUsername(user);
    setLoginStep('dob');
  };

  const handleDobSubmit = (dob: string) => {
    // In a real app, we'd verify the DOB here
    setLoginStep('complete');
  };

  const handleLogout = () => {
    setLoginStep('credentials');
    setUsername('');
  };

  if (loginStep === 'complete') {
    return <HomePage username={username} onLogout={handleLogout} />;
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white font-sans">
      {/* Ambient Background Effects */}
      <Background />
      <FloatingParticles />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 p-4 w-full max-w-7xl">
        
        {/* Left Side: The Vehicle Showcase */}
        <div className="hidden md:block w-1/2 h-[500px] relative">
           <VehicleSlider />
        </div>

        {/* Right Side: The Login Flow */}
        <div className="w-full md:w-1/3 flex flex-col items-center transition-all duration-500">
            
            {loginStep === 'credentials' && (
                <LoginForm onLogin={handleCredentialsSubmit} />
            )}

            {loginStep === 'dob' && (
                <DobForm 
                    onSubmit={handleDobSubmit} 
                    onBack={() => setLoginStep('credentials')} 
                />
            )}
            
        </div>
      </div>
      
      {/* Mobile Background Fallback */}
      <div className="md:hidden absolute top-10 left-1/2 transform -translate-x-1/2 opacity-20 pointer-events-none z-0">
          <div className="w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

    </div>
  );
};

export default App;
