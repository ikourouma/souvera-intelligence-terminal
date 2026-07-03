/**
 * Load Supabase + API keys from free-form root .env.local notes.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const ROOT = path.resolve(__dirname, '../../..');

export function loadProjectEnv(): void {
  dotenv.config({ path: path.join(ROOT, '.env') });
  dotenv.config({ path: path.join(ROOT, '.env.local') });
  dotenv.config({ path: path.join(ROOT, 'apps/api-gateway/.env.local') });

  const notesFile = path.join(ROOT, '.env.local');
  if (!fs.existsSync(notesFile)) return;

  const text = fs.readFileSync(notesFile, 'utf8');

  for (const line of text.split('\n')) {
    const eq = line.match(/^\s*(?:\d+\.\s*)?([A-Z][A-Z0-9_]+)\s*=\s*(\S+)/);
    if (eq && !process.env[eq[1]]) process.env[eq[1]] = eq[2];
  }

  const urlMatch = text.match(/NEXT_PUBLIC_SUPABASE_URL:\s*(\S+)/i);
  if (urlMatch && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = urlMatch[1];
  }
  const keyMatch = text.match(/SUPABASE_SERVICE_ROLE_KEY:\s*(\S+)/i);
  if (keyMatch && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = keyMatch[1];
  }
}
