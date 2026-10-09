import React from 'react';
import { useTransport } from '../context/TransportContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Bus,
  GraduationCap,
  Shield,
  Smartphone,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Bell,
  Sliders,
  KeyRound,
  LogIn,
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onLaunchDemoWalkthrough: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onLaunchDemoWalkthrough,
}) => {
  const { buses, routes, activeAlerts } = useTransport();
  const { navigate } = useNavigation();
  const { portalCredentials } = useAuth();

  const activeBuses = buses.filter((b) => b.isTripActive);

  return (
    <div id="landing-overview-page" className="space-y-12 pb-12">
      {/* Live Operational Status Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
          <div className="text-white">
            <span className="font-bold">LIVE CAMPUS TRANSIT NETWORK</span>
            <span className="text-slate-400 hidden sm:inline"> • Real-Time Telemetry Streaming</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div>
            Active Fleet:{' '}
            <span className="font-bold text-white">
              {activeBuses.length} / {buses.length} Units Active
            </span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            Corridors:{' '}
            <span className="font-bold text-white">{routes.length} Active Corridors</span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            Distress Beacons:{' '}
            <span className={`font-bold ${activeAlerts.length > 0 ? 'text-red-400' : 'text-teal-400'}`}>
              {activeAlerts.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-time GPS Tracking for Campus Transit • 20 Buses Active</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          College Transport, <br className="hidden sm:inline" />
          <span className="text-blue-600">Clearly Connected.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Zero-cost tracking leveraging standard smartphones as GPS emitters. Dynamic ETA calculations,
          automated approaching stop notifications, real-time driver telemetry, and fleet operations console for all 20 campus buses.
        </p>

        {/* 3 Dedicated Portal Login Shortcuts */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/login/student')}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Student Portal Login</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login/driver')}
            className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Bus className="w-4 h-4 text-teal-600" />
            <span>Driver Cockpit Login</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login/admin')}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Admin Portal Login</span>
          </button>

          <button
            type="button"
            onClick={onLaunchDemoWalkthrough}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Walkthrough Demo</span>
          </button>
        </div>
      </div>

      {/* 3 Core Roles Portals Switchboard */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Three Dedicated Transit Portals & Access Credentials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Portal 1: Student */}
          <div className="bg-white border-2 border-slate-200/90 hover:border-blue-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Student Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Portal</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time bus arrival countdowns, live GPS polyline map across 20 fleet buses, seat availability, and
                  automated audio chimes when your bus approaches your stop.
                </p>
              </div>

              {/* Fake Credentials helper box */}
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px] uppercase">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portal Fake Credentials:</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Email: <strong className="text-slate-900">{portalCredentials.student.email}</strong>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Password: <strong className="text-slate-900">{portalCredentials.student.password}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dynamic ETA (Distance ÷ Speed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-teal-600" />
                  <span>Approaching stop alerts (500m geofence)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live passenger seat occupancy</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/login/student')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Student Login Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('student')}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <span>Direct Explore Dashboard</span>
              </button>
            </div>
          </div>

          {/* Portal 2: Driver */}
          <div className="bg-white border-2 border-slate-200/90 hover:border-teal-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <Bus className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Driver Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Driver Console</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mobile-first cockpit turning driver smartphones into GPS emitters. Start/End
                  trips, adjust passenger counts, log delays, and trigger emergency SOS on any of the 20 buses.
                </p>
              </div>

              {/* Fake Credentials helper box */}
              <div className="bg-teal-50/60 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900 text-[11px] uppercase">
                  <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                  <span>Portal Fake Credentials:</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Email: <strong className="text-slate-900">{portalCredentials.driver.email}</strong>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Password: <strong className="text-slate-900">{portalCredentials.driver.password}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Zero-cost smartphone GPS emitter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>One-touch START / END trip toggle</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Instant Emergency SOS distress beacon</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/login/driver')}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Driver Login Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('driver')}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <span>Direct Explore Console</span>
              </button>
            </div>
          </div>

          {/* Portal 3: Fleet Operations / Admin */}
          <div className="bg-white border-2 border-slate-200/90 hover:border-indigo-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Admin Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Fleet Operations</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Campus-wide oversight map, vehicle speed and punctuality tracking across 20 buses, emergency incident
                  dispatch, user role administration, and database settings.
                </p>
              </div>

              {/* Fake Credentials helper box */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-[11px] uppercase">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Portal Fake Credentials:</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Email: <strong className="text-slate-900">{portalCredentials.admin.email}</strong>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Password: <strong className="text-slate-900">{portalCredentials.admin.password}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-time 20-bus telemetry map</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Incident resolution & SOS triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full user management and settings</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/login/admin')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Admin Login Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <span>Direct Explore Operations</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">
          Key System Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Smart Dynamic ETA</h4>
            <p className="text-slate-600 leading-relaxed">
              Computes remaining polyline distance using the Haversine formula divided by real-time GPS
              speed, incorporating live traffic delay offsets.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Smart Geofence Notifications</h4>
            <p className="text-slate-600 leading-relaxed">
              When any of the 20 buses crosses within 500m of a student’s stop, the system fires automated visual
              alerts and web audio arrival chimes.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Zero-Cost Campus Hardware</h4>
            <p className="text-slate-600 leading-relaxed">
              Eliminates the need for expensive third-party GPS hardware modules by turning existing driver
              smartphones into cloud-synced transmitters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
