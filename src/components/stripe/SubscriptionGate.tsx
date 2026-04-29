import React from 'react';
import { Lock } from 'lucide-react';
import { UserProfile } from '../../types';
import SubscriptionBanner from './SubscriptionBanner';

interface Props {
  profile: UserProfile | null;
  loading: boolean;
  children: React.ReactNode;
}

export default function SubscriptionGate({ profile, loading, children }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dev bypass: set VITE_BYPASS_SUBSCRIPTION=true in .env.local to skip gate
  if (import.meta.env.VITE_BYPASS_SUBSCRIPTION === 'true') return <>{children}</>;

  const status = profile?.subscriptionStatus;
  const isActive = status === 'active' || status === 'trialing';

  if (!isActive) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Función de pago</h2>
        <p className="text-gray-500 text-sm mb-6">
          Para crear campamentos y campus, y acceder a todas las funcionalidades, necesitas una suscripción activa.
        </p>
        {profile && <SubscriptionBanner profile={profile} />}
      </div>
    );
  }

  return <>{children}</>;
}
