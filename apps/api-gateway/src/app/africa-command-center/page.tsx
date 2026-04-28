import React from 'react';
import { PresentationPageTemplate } from '@/components/templates/PresentationPageTemplate';
import { getInstitutionalBrief } from '@/lib/corporate-service';

export default async function AfricaCommandCenterPage() {
  const content = await getInstitutionalBrief('africa-command');
  return <PresentationPageTemplate content={content} />;
}
