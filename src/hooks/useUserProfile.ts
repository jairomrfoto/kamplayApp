import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserProfile } from '../services/firestore';
import { UserProfile } from '../types';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserProfile(user.uid)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user]);

  const refresh = () => {
    if (!user) return;
    getUserProfile(user.uid).then(setProfile).catch(() => {});
  };

  return { profile, loading, refresh };
}
