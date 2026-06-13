import { Metadata } from 'next';
import { CuratedNewsEditor } from './CuratedNewsEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Article | Curated News',
};

export default async function CuratedNewsEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <CuratedNewsEditor articleId={id} />;
}
