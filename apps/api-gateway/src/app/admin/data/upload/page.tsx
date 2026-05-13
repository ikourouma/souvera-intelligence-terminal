// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin File Upload Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { FileUploadClient } from './FileUploadClient';

export const metadata: Metadata = {
  title: 'Upload Data | Admin',
  description: 'Upload source files for ingestion into Souvera Intelligence Terminal',
};

export default function UploadPage() {
  return <FileUploadClient />;
}
