import { redirect } from 'next/navigation';

/** Legacy route — canonical page is /sectors/tourism-hospitality */
export default function TourismPage() {
  redirect('/sectors/tourism-hospitality');
}
