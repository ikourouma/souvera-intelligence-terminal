import { Metadata } from 'next';
import { ReportsResetClient } from './ReportsResetClient';

export const metadata: Metadata = {
  title: 'Reports Reset | Admin',
  description: 'Reset report quota usage, history, and storage for platform support',
};

export default function ReportsResetPage() {
  return <ReportsResetClient />;
}
