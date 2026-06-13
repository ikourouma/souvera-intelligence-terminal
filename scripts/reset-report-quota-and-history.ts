/**
 * Reset report quota usage, request history, and storage PDFs.
 *
 * Usage (from repo root):
 *   npx tsx scripts/reset-report-quota-and-history.ts --email business@afronovation.com
 *   npx tsx scripts/reset-report-quota-and-history.ts --email business@afronovation.com --dry-run
 *   npx tsx scripts/reset-report-quota-and-history.ts --all
 *   npx tsx scripts/reset-report-quota-and-history.ts --usage-only --email professional@afronovation.com
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in apps/api-gateway/.env.local
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  getCurrentQuotaPeriod,
  resetReports,
  resetReportsForEmail,
} from '../apps/api-gateway/src/lib/reports/reset-reports';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function printHelp() {
  console.log(`
Reset Souvera report quota, history, and storage PDFs.

Options:
  --email=<address>   Reset one user (recommended for QA)
  --all               Reset ALL users (requests + usage + storage)
  --period=YYYY-MM    Limit usage reset to one month (default: all periods for scope)
  --usage-only        Reset quota counters only (keep history PDFs)
  --keep-storage      Skip storage bucket cleanup
  --keep-history      Skip souvera_report_requests delete (quota only)
  --dry-run           Show counts without deleting
  --help              This message

Examples:
  npx tsx scripts/reset-report-quota-and-history.ts --email business@afronovation.com
  npx tsx scripts/reset-report-quota-and-history.ts --all --dry-run
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const emailArg =
    args.find((a) => a.startsWith('--email='))?.split('=')[1] ??
    (args.includes('--email') ? args[args.indexOf('--email') + 1] : undefined);
  const periodArg =
    args.find((a) => a.startsWith('--period='))?.split('=')[1] ??
    (args.includes('--period') ? args[args.indexOf('--period') + 1] : undefined);
  const allUsers = args.includes('--all');
  const dryRun = args.includes('--dry-run');
  const usageOnly = args.includes('--usage-only');
  const keepStorage = args.includes('--keep-storage');
  const keepHistory = args.includes('--keep-history');

  if (!emailArg && !allUsers) {
    console.error('Specify --email=<address> or --all');
    printHelp();
    process.exit(1);
  }

  if (emailArg && allUsers) {
    console.error('Use either --email or --all, not both');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const options = {
    period: periodArg,
    resetUsage: true,
    deleteRequests: !usageOnly && !keepHistory,
    deleteStorage: !usageOnly && !keepStorage,
    dryRun,
  };

  console.log(`Period filter: ${periodArg ?? 'all months'}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE DELETE'}`);
  console.log(`Current UTC month: ${getCurrentQuotaPeriod()}\n`);

  const result = emailArg
    ? await resetReportsForEmail(supabase, emailArg, options)
    : await resetReports(supabase, options);

  console.log('Result:');
  console.log(`  Users scoped: ${result.userIds.length ? result.userIds.join(', ') : 'ALL'}`);
  console.log(`  Usage rows reset: ${result.usageRowsReset}`);
  console.log(`  Report requests deleted: ${result.requestsDeleted}`);
  console.log(`  Storage files deleted: ${result.storageFilesDeleted}`);

  if (result.errors.length) {
    console.error('\nErrors:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (dryRun) {
    console.log('\nDry run complete — re-run without --dry-run to apply.');
  } else {
    console.log('\nReset complete. Refresh Reports tab and generate again.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
