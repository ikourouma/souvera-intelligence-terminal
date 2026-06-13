import { Metadata } from 'next';
import { NewsPulseClient } from './NewsPulseClient';

export const metadata: Metadata = {
  title: 'News Pulse | Admin',
  description: 'Review and publish country news signals for the intelligence terminal',
};

export default function NewsPulsePage() {
  return <NewsPulseClient />;
}
