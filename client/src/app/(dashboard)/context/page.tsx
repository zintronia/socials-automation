'use client';

import { Contexts } from '@/features/context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/lib/useAuth';
import ComponentCard from '@/components/ComponentCard';

export default function ContextPage() {

  return (
    <Contexts />
  );
}
