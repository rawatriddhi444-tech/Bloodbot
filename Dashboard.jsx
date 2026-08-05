import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { useOfflineMode } from '@/lib/offlineMode';
import { sampleBloodBanks, sampleDonors, sampleHospitals, sampleBloodRequests } from '@/lib/sampleData';
import MapView from '@/components/MapView';
import {
  Droplet, Building2, Siren, Activity, HandHeart, MapPin, Truck, Bot, Info, ShieldPlus, Clock, TrendingUp, Heart
} from 'lucide-react';

const actions = [
  { to: '/find-blood', key: 'find_blood', icon: Droplet, color: 'from-red-500 to-red-600' },
  { to: '/blood-banks', key: 'blood_banks', icon: Building2, color: 'from-rose-500 to-rose-600' },
  { to: '/hospitals', key: 'hospitals', icon: ShieldPlus, color: 'from-gray-700 to-gray-900' },
  { to: '/emergency', key: 'emergency', icon: Siren, color: 'from-red-600 to-rose-700' },
  { to: '/compatibility', key: 'compatibility', icon: Activity, color: 'from-pink-500 to-rose-600' },
  { to: '/donation', key: 'donate', icon: HandHeart, color: 'from-red-500 to-pink-600' },
  { to: '/tracker', key: 'tracker', icon: Truck, color: 'from-gray-600 to-gray-800' },
  { to: '/about', key: 'about', icon: Info, color: 'from-slate-500 to-slate-700' }
];

export default function Dashboard() {
  const { t, lang } = useLang();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090, label: 'Delhi, India' });
  const [stats, setStats] = useState({ banks: 0, donors: 0, requests: 0, hospitals: 0 });
  const { isOffline } = useOfflineMode();

  useEffect(() => {
    if (isOffline) {
      setStats({ banks: sampleBloodBanks.length, donors: sampleDonors.filter((d) => d.availability_status === 'Available').length, requests: sampleBloodRequests.length, hospitals: sampleHospitals.length });
      return;
    }
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.BloodBank.list().then(r => setStats(s => ({ ...s, banks: (r.length) }))).catch(() => {});
    base44.entities.BloodDonor.filter({ availability_status: 'Available' }).then(r => setStats(s => ({ ...s, donors: r.length }))).catch(() => {});
    base44.entities.BloodRequest.list().then(r => setStats(s => ({ ...s, requests: r.length }))).catch(() => {});
    base44.entities.Hospital.list().then(r => setStats(s => ({ ...s, hospitals: r.length }))).catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Current Location' }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, [isOffline]);

  const statCards = [
    { label: t('blood_banks_nearby'), value: stats.banks, icon: Building2, color: 'text-red-600 bg-red-50' },
    { label: t('active_donors'), value: stats.donors, icon: HandHeart, color: 'text-pink-600 bg-pink-50' },
    { label: t('blood_requests'), value: stats.requests, icon: TrendingUp, color: 'text-gray-700 bg-gray-100' },
    { label: t('hospitals_nearby'), value: stats.hospitals, icon: ShieldPlus, color: 'text-rose-600 bg-rose-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 p-6 text-white shadow-xl lg:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-300">{t('welcome')},</p>
            <h2 className="text-2xl font-bold lg:text-3xl">{user?.full_name || 'Guest'} 👋</h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4 text-red-400" />
              {t('your_location')}: <span className="font-medium text-white">{location.label}</span>
              <span className="text-gray-400">({location.lat.toFixed(2)}, {location.lng.toFixed(2)})</span>
            </div>
          </div>
          <Link to="/emergency" className="flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold shadow-lg shadow-red-600/40 transition hover:bg-red-500">
            <Siren className="h-5 w-5" /> {t('emergency')}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-gray-900">{t('quick_stats')}</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <MapView center={[location.lat, location.lng]} markers={[{ lat: location.lat, lng: location.lng, color: '#dc2626', label: 'You', radius: 10 }]} height={260} />

      {/* Action cards */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${a.color}`}>
                  <Icon className="h-9 w-9 text-white" />
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-semibold text-gray-900">{t(a.key)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
