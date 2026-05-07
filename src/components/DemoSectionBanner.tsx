import React from 'react';
import { Info } from 'lucide-react';
import { useStore } from '../store/store';

interface Props {
  description: string;
}

export default function DemoSectionBanner({ description }: Props) {
  const { isDemoMode } = useStore();
  if (!isDemoMode) return null;

  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-sm text-blue-800">
      <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
      <p>{description}</p>
    </div>
  );
}
