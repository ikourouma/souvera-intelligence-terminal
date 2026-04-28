import React from 'react';
import { PresentationPageTemplate } from '@/components/templates/PresentationPageTemplate';
import { getInstitutionalBrief } from '@/lib/corporate-service';

export default async function CaribbeanCommandCenterPage() {
  const content = await getInstitutionalBrief('caribbean-command');
  return <PresentationPageTemplate content={content} />;
}
