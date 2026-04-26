// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Phase 1 Final Verification
// ===========================================

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key);

async function verify() {
  console.log('Verifying Souvera Data Engine...');

  // 1. Check Country Lite View
  const { data: lite, error: liteError } = await supabase
    .from('souvera_country_lite_v')
    .select('*')
    .limit(5);

  if (liteError) {
    console.error('❌ Error reading souvera_country_lite_v:', liteError.message);
  } else {
    console.log(`✅ souvera_country_lite_v accessible. Sample (${lite.length} records):`);
    lite.forEach(c => {
      console.log(`   - ${c.name} (${c.iso3}): GDP: ${c.gdp_current_usd ?? 'N/A'}, Pop: ${c.population_total ?? 'N/A'}`);
    });
  }

  // 2. Check Observation Count
  const { count, error: obsError } = await supabase
    .from('souvera_country_observations')
    .select('*', { count: 'exact', head: true });

  if (obsError) {
    console.error('❌ Error reading souvera_country_observations:', obsError.message);
  } else {
    console.log(`✅ souvera_country_observations contains ${count} records.`);
  }

  // 3. Check Job Logs
  const { data: jobs, error: jobError } = await supabase
    .from('souvera_ingestion_jobs')
    .select('job_type, status, records_processed')
    .order('created_at', { ascending: false })
    .limit(2);

  if (jobError) {
    console.error('❌ Error reading ingestion jobs:', jobError.message);
  } else {
    console.log('✅ Ingestion jobs logged:');
    jobs.forEach(j => {
      console.log(`   - ${j.job_type}: ${j.status} (Processed: ${j.records_processed})`);
    });
  }
}

verify();
