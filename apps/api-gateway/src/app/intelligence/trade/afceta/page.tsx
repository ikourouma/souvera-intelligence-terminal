import { Metadata } from 'next';
import AfCETALandingClient from './AfCETALandingClient';

export const metadata: Metadata = {
  title: 'AfCETA — African-Caribbean Economic & Trade Agreement | Souvera',
  description:
    'Trade intelligence for Africa and the Caribbean. AfCETA treaty framework, corridor opportunity index, Caribbean export portfolio, and Atlantic tradable-asset mapping.',
};

export default function AfCETALandingPage() {
  return <AfCETALandingClient />;
}
