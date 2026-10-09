import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransport } from '../context/TransportContext';
import { useNavigation } from '../context/NavigationContext';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  User,
  Phone,
  Shield,
  GraduationCap,
  Bus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  initialPortal?: UserRole;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  initialPortal,
}) => {
  const { login, signup, portalCredentials } = useAuth();
  const { setRole: setTransportRole } = useTransport();
  const { currentPath, navigate } = useNavigation();

  // Determine active portal from path (/login/student, /login/driver, /login/admin) or prop
  const getInitialPortal = (): UserRole => {
    if (initialPortal) return initialPortal;
    if (currentPath === '/login/student') return 'student';
    if (currentPath === '/login/driver') return 'driver';
    if (currentPath === '/login/admin') return 'admin';
    return 'student';
  };

  const [activePortal, setActivePortal] = useState<UserRole>(getInitialPortal);
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update active portal when currentPath changes
  useEffect(() => {
    if (currentPath === '/login/student') setActivePortal('student');
    else if (currentPath === '/login/driver') setActivePortal('driver');
    else if (currentPath === '/login/admin') setActivePortal('admin');
  }, [currentPath]);

  // When switching portal tabs, reset any error messages
  const handleSelectPortal = (portal: UserRole) => {
    setActivePortal(portal);
    setError(null);
    setSuccessMsg(null);
    // Auto-update URL without breaking back navigation
    navigate(`/login/${portal}`);
  };

  // Helper to copy text to clipboard
  const handleCopyText = (text: string, keyName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // 1-Click Auto Fill official fake credentials for current portal
  const handleFillCredentials = () => {
    const cred = portalCredentials[activePortal];
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
    setSuccessMsg(`Loaded credentials for ${cred.name} (${activePortal.toUpperCase()})`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your portal email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your portal password.');
      return;
    }

    if (!isLogin) {
      if (!displayName.trim()) {
        setError('Please enter your full name for enrollment.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Strict portal authentication: checks email, password in database, and matches portal clearance
        await login(cleanEmail, password, activePortal);

        setSuccessMsg(`Welcome! Authenticated successfully to ${portalDetails[activePortal].portalTitle}.`);
        setTransportRole(activePortal);

        // Redirect directly to destination dashboard
        setTimeout(() => {
          if (activePortal === 'admin') {
            navigate('/admin');
          } else if (activePortal === 'driver') {
            navigate('/driver');
          } else {
            navigate('/student');
          }
        }, 500);
      } else {
        await signup(cleanEmail, password, displayName.trim(), activePortal, phone.trim());
        setTransportRole(activePortal);
        setSuccessMsg(`Registration complete! Account created in database for ${displayName.trim()}.`);

        setTimeout(() => {
          if (activePortal === 'admin') navigate('/admin');
          else if (activePortal === 'driver') navigate('/driver');
          else navigate('/student');
        }, 600);
      }
    } catch (err: any) {
      let rawMsg = err.message || '';
      if (rawMsg.startsWith('ROLE_MISMATCH:')) {
        setError(rawMsg.replace('ROLE_MISMATCH:', ''));
      } else if (rawMsg.includes('auth/wrong-password')) {
        setError('Incorrect password for this account. Please verify credentials or use the quick fill button.');
      } else if (
        rawMsg.includes('auth/invalid-credential') ||
        rawMsg.includes('auth/user-not-found')
      ) {
        setError('No account found with this email. Please check your spelling or register a new profile.');
      } else if (rawMsg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (rawMsg.includes('auth/weak-password')) {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(rawMsg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Metadata for the 3 distinct portals
  const portalDetails = {
    student: {
      badge: 'Student Transit Portal',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      themeColor: 'blue',
      activeTabClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20',
      accentBorder: 'from-blue-600 via-cyan-500 to-indigo-600',
      portalTitle: 'Student Portal Login',
      portalSubtitle: 'Live bus tracking, smart dynamic ETA countdowns, approaching stop alerts & seat telemetry.',
      icon: <GraduationCap className="w-5 h-5" />,
      destinationName: 'Student Live Dashboard',
      destinationRoute: '/student',
      heroBg: 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    },
    driver: {
      badge: 'Driver Cockpit Portal',
      badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      themeColor: 'teal',
      activeTabClass: 'bg-teal-600 text-white shadow-md shadow-teal-600/20',
      accentBorder: 'from-teal-600 via-emerald-500 to-cyan-600',
      portalTitle: 'Driver Cockpit Login',
      portalSubtitle: 'Mobile GPS emitter cockpit, trip start/stop telemetry, delay dispatch & emergency SOS beacon.',
      icon: <Bus className="w-5 h-5" />,
      destinationName: 'Driver Telemetry Console',
      destinationRoute: '/driver',
      heroBg: 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    },
    admin: {
      badge: 'Fleet Operations Admin Portal',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      themeColor: 'indigo',
      activeTabClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20',
      accentBorder: 'from-indigo-600 via-purple-500 to-violet-600',
      portalTitle: 'Fleet Admin Login',
      portalSubtitle: 'Central campus-wide fleet oversight, 20-bus telemetry, incident triage, user management & settings.',
      icon: <Shield className="w-5 h-5" />,
      destinationName: 'Fleet Operations Center',
      destinationRoute: '/admin',
      heroBg: 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    },
  };

  const currentDetails = portalDetails[activePortal];
  const activeCredInfo = portalCredentials[activePortal];

  return (
    <div id="auth-portal-page" className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      {/* 3 Portal Navigation Selector Tabs */}
      <div className="w-full max-w-xl mb-6">
        <div className="text-center mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Your Dedicated Portal
          </span>
        </div>

        <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner">
          <button
            type="button"
            id="tab-portal-student"
            onClick={() => handleSelectPortal('student')}
            className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePortal === 'student'
                ? portalDetails.student.activeTabClass
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            id="tab-portal-driver"
            onClick={() => handleSelectPortal('driver')}
            className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePortal === 'driver'
                ? portalDetails.driver.activeTabClass
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Driver Portal</span>
          </button>

          <button
            type="button"
            id="tab-portal-admin"
            onClick={() => handleSelectPortal('admin')}
            className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePortal === 'admin'
                ? portalDetails.admin.activeTabClass
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Main Portal Login Box */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all">
        {/* Accent top stripe matching portal theme */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentDetails.accentBorder}`} />

        {/* Header with Portal Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border mb-3 shadow-2xs ${currentDetails.badgeClass}">
            {currentDetails.icon}
            <span>{currentDetails.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isLogin ? currentDetails.portalTitle : `Register for ${currentDetails.badge}`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            {isLogin
              ? currentDetails.portalSubtitle
              : `Create new credentials in the Cambus Go database to access the ${currentDetails.destinationName}.`}
          </p>
        </div>

        {/* Interactive Stored Credentials Card for this Portal */}
        <div className={`mb-5 p-4 rounded-2xl border ${currentDetails.heroBg} transition-all`}>
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Official Database Fake Credentials:</span>
            </div>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
              title="Automatically fill form with these database credentials"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Fill Form</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Portal Fake Email:
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                  {activeCredInfo.email}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(activeCredInfo.email, 'email')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  title="Copy email"
                >
                  {copiedKey === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Portal Fake Password:
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {activeCredInfo.password}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(activeCredInfo.password, 'pass')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  title="Copy password"
                >
                  {copiedKey === 'pass' ? (
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              Pre-seeded User: <strong className="text-slate-900 dark:text-white">{activeCredInfo.name}</strong> • {activeCredInfo.note}
            </span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Login / Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aanya Sharma or Rajesh Kumar"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                id="portal-input-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeCredInfo.email}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="portal-input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="portal-submit-btn"
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 min-h-[46px] ${
              activePortal === 'admin'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                : activePortal === 'driver'
                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
            }`}
          >
            {loading ? (
              <span>Verifying Database Credentials...</span>
            ) : (
              <>
                <span>
                  {isLogin
                    ? `Sign In to ${currentDetails.portalTitle}`
                    : `Create ${activePortal.toUpperCase()} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-5 text-center pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
          >
            {isLogin
              ? `Need new account? Register as ${activePortal}`
              : 'Already registered? Return to Sign In'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
