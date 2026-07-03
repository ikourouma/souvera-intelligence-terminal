import type { Metadata } from 'next';
import { ProfessionalServicesHub } from './ProfessionalServicesHub';

export const metadata: Metadata = {
  title: 'Professional Services | Souvera Intelligence Terminal',
  description:
    'Souvera Professional Services helps institutional partners turn 74-market intelligence into trade missions, corridor activation, and capital-ready deal pipelines.',
  openGraph: {
    title: 'Professional Services | Souvera Intelligence Terminal',
    description:
      'Expert guidance to turn frontier-market intelligence into capital — trade missions, corridor programs, and institutional onboarding by Afronovation.',
  },
};

export default function ProfessionalServicesPage() {
  return <ProfessionalServicesHub />;
}
