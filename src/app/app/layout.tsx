'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // রেফারেল কোডটি ব্রাউজারের localStorage-এ সেভ করে রাখা হয়
      // যাতে ব্যবহারকারী অন্য পেজে গেলেও কোডটি হারিয়ে না যায়
      console.log(`Referral code captured: ${refCode}`);
      localStorage.setItem('sponsorId', refCode);
    }
  }, [searchParams]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}