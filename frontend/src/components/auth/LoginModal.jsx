import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Toast';
import { ShieldCheck, Sparkles, UserCheck, Check, Info } from 'lucide-react';

export function LoginModal({ isOpen, onClose }) {
  const { loginWithGoogle, loginDemo, authConfig } = useAuth();
  const [selectedRole, setSelectedRole] = useState('OFFICER');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginDemo(role);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In to GramVerse AI" maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-300">
            India's Rural Development Command Center & Digital Twin
          </p>
          <div className="flex items-center justify-center space-x-1 text-[11px] font-mono text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SIH1704 · OAuth 2.0 Secure Session</span>
          </div>
        </div>

        {/* Primary OAuth Button: Continue with Google */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-3 group"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isAuthenticating ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500">
            Or Quick Judge Demo
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* One-Click Hackathon Evaluator Roles */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span>Select Evaluation Persona:</span>
            <span className="text-[10px] text-cyan-400 font-mono">Instant Demo Mode</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoLogin('OFFICER')}
              className="p-3 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    Er. Vikramaditya Sharma
                  </div>
                  <div className="text-[10px] text-slate-400">
                    District Panchayat Planning Officer (Patiala)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Panchayat Suite
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('CITIZEN')}
              className="p-3 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                    Gurpreet Singh
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Village Resident (Kalyan Gram Sabha)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Community Mode
              </span>
            </button>
          </div>
        </div>

        {/* Security & Config Note */}
        <div className="p-2.5 rounded-xl bg-[#080c14] border border-slate-800/80 text-[10px] text-slate-400 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <b>OAuth Security Standard:</b> GramVerse never stores passwords or exposes access tokens in client storage.
          </span>
        </div>
      </div>
    </Modal>
  );
}
