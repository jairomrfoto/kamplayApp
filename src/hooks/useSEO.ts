import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export function buildHelmetProps({ title, description, canonical, noindex }: SEOProps) {
  return { title, description, canonical, noindex };
}

export type { SEOProps };
