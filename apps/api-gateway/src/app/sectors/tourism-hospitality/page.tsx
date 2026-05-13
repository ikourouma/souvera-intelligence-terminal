import type { Metadata } from 'next';
import { TourismHospitalityHub } from './TourismHospitalityHub';

export const metadata: Metadata = {
  title: 'Tourism & Hospitality | Souvera',
  description: 'Destination, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.',
  keywords: ['tourism Africa', 'tourism Caribbean', 'hospitality investment', 'visitor economy', 'aviation connectivity', 'diaspora travel', 'events tourism', 'cultural tourism', 'heritage tourism', 'destination infrastructure'],
  openGraph: {
    title: 'Tourism & Hospitality | Souvera',
    description: 'Destination, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.',
    url: 'https://souvera.vercel.app/sectors/tourism-hospitality',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/tourism-hospitality',
  },
};

export default function TourismHospitalityPage() {
  return <TourismHospitalityHub />;
}
