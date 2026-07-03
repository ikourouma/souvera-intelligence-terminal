import { env } from '@souvera/config';

/** Show internal phase/dev labels (Vercel preview). Hide on production (APP_ENV=prod). */
export function showDevLabels(): boolean {
  return env.app.env() !== 'prod';
}

/** Trade hub module badges: always show Live/New; hide phase/preview/reference on prod. */
export function shouldShowModuleBadge(badge: string): boolean {
  if (badge === 'Live' || badge === 'New') return true;
  return showDevLabels();
}
