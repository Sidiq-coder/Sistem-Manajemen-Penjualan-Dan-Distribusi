import type { Metadata } from 'next';
import { DemoTour } from './demo-tour';

export const metadata: Metadata = {
  title: 'Demo Sistem | SMPD',
  description:
    'Tur publik sistem manajemen penjualan dan distribusi, dari order dibuat sampai barang diterima.',
};

export default function DemoPage() {
  return <DemoTour />;
}
