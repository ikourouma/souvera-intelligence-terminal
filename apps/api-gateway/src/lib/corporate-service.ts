import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PROJECT_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_PUBLIC;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Souvera Service] Supabase credentials missing. Operating in SNAPSHOT-ONLY mode.');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  } catch (err) {
    console.error('[Souvera Service] Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * DEFAULT CORPORATE CONTENT SNAPSHOTS
 */
const CORPORATE_SNAPSHOTS: Record<string, any> = {
  'africa-command': {
    title: 'Africa Command Center.',
    tagline: 'Sovereign Intelligence Gateway',
    what: {
      title: 'The Continental Pulse.',
      description: 'A high-fidelity intelligence node tracking 54 African nations across macroeconomic, fiscal, and sector-specific corridors.',
      points: [
        'Curated GDP & Fiscal health tracking',
        'FDI Sentiment & Investment flow mapping',
        'Sovereign debt & policy shift signaling',
        'Cross-continental trade node visualization'
      ]
    },
    who: {
      title: 'Designed for Conviction.',
      description: 'Built for decision-makers who require objective truth in emerging markets.',
      segments: [
        { name: 'Institutional Capital', benefit: 'Private Equity and Hedge Funds targeting strategic growth vectors.' },
        { name: 'Sovereign Entities', benefit: 'Central Banks and Ministries benchmarking against regional peers.' },
        { name: 'Global Corporates', benefit: 'Fortune 5 firms planning market entry and supply chain expansion.' }
      ]
    },
    why: {
      title: 'Objective Truth in the Era of Alpha.',
      description: 'African markets are often shrouded in fragmented data. Souvera provides the clarity required for billion-dollar convictions.',
      impact: [
        { label: 'Markets Tracked', value: '54 Nations' },
        { label: 'Data Nodes', value: '1,200+' },
        { label: 'Sync Frequency', value: 'Source-Attributed' },
        { label: 'Accuracy Score', value: '99.8%' }
      ]
    },
    how: {
      title: 'How to Utilize the Node.',
      description: 'Integrating the Africa Command Center into your strategic workflow.',
      steps: [
        'Initialize Identity Node',
        'Select Sovereign Corridor',
        'Monitor Signal Triggers',
        'Execute with Conviction'
      ]
    }
  },
  'caribbean-command': {
    title: 'Caribbean Command Center.',
    tagline: 'CARICOM Intelligence Node',
    what: {
      title: 'The Transatlantic Bridge.',
      description: 'A dedicated intelligence node for the Caribbean region, tracking 15+ CARICOM member states and their macroeconomic stability.',
      points: [
        'Blue Economy & Maritime trade signals',
        'Tourism-linked fiscal volatility tracking',
        'CARICOM trade corridor mapping',
        'Regional currency & inflation monitoring'
      ]
    },
    who: {
      title: 'Regional Strategic Access.',
      description: 'Empowering stakeholders with specialized intelligence on the Caribbean trade nodes.',
      segments: [
        { name: 'Maritime Investors', benefit: 'Tracking port efficiency and trade-flow signals.' },
        { name: 'Policy Architects', benefit: 'Benchmarking regional growth against global peers.' },
        { name: 'FDI Strategists', benefit: 'Identifying emerging sectors in the CARICOM network.' }
      ]
    },
    why: {
      title: 'The Caribbean Signal Matrix.',
      description: 'Souvera normalizes fragmented regional data into a single, high-fidelity intelligence interface.',
      impact: [
        { label: 'CARICOM States', value: '15 Nations' },
        { label: 'Trade Nodes', value: '240+' },
        { label: 'Signal Update', value: 'Live' },
        { label: 'Data Integrity', value: 'Sovereign' }
      ]
    },
    how: {
      title: 'Strategic Implementation.',
      description: 'How to integrate Caribbean intelligence into your global strategy.',
      steps: [
        'Map Trade Corridors',
        'Analyze Fiscal Moats',
        'Sync Risk Thresholds',
      ]
    }
  },
  'energy-&-renewables': {
    title: 'Energy & Renewables.',
    tagline: 'Sovereign Energy Transition',
    what: {
      title: 'Powering the Future.',
      description: 'Tracking the transition from fossil baseloads to renewable energy nodes, including LNG, Green Hydrogen, and Solar clusters.',
      points: [
        'Green Hydrogen development tracking',
        'LNG export terminal capacity monitoring',
        'Solar & Wind grid integration signals',
        'Energy policy & subsidy transparency'
      ]
    },
    who: {
      title: 'For Utility & Infrastructure Capital.',
      description: 'Built for investors targeting the $2.8T African energy gap.',
      segments: [
        { name: 'IPP Developers', benefit: 'Identifying regions with favorable PPA frameworks.' },
        { name: 'Infrastructure Funds', benefit: 'Benchmarking grid stability and transmission risk.' },
        { name: 'Sovereign Wealth', benefit: 'Tracking energy security and export potential.' }
      ]
    },
    why: {
      title: 'The Energy Alpha.',
      description: 'Energy is the primary constraint to industrialization. Identifying where power is being unlocked is the primary signal for GDP growth.',
      impact: [
        { label: 'Project Nodes', value: '124 Active' },
        { label: 'CapEx Tracked', value: '$42B+' },
        { label: 'Signal Sync', value: 'Live' },
        { label: 'Reliability', value: '99.9%' }
      ]
    },
    how: {
      title: 'Deploying Energy Capital.',
      description: 'How to utilize energy signals for strategic site selection.',
      steps: [
        'Map Generation Nodes',
        'Audit Regulatory Pulse',
        'Verify Transmission Moats',
        'Initialize Investment'
      ]
    }
  },
  'mining-&-critical-minerals': {
    title: 'Mining & Critical Minerals.',
    tagline: 'Global Supply Chain Security',
    what: {
      title: 'The Bedrock of Technology.',
      description: 'Tracking the extraction and processing of critical minerals (Lithium, Cobalt, Copper) required for the global energy transition.',
      points: [
        'Critical mineral deposit mapping',
        'Mine-to-port logistics monitoring',
        'ESG & Compliance auditing nodes',
        'Sovereign mining policy tracking'
      ]
    },
    who: {
      title: 'For Industrial & Tech Strategists.',
      description: 'Empowering supply chain resilience for G2000 firms.',
      segments: [
        { name: 'EV Manufacturers', benefit: 'Securing long-term critical mineral off-take.' },
        { name: 'Mining Majors', benefit: 'Benchmarking operational risk against regional peers.' },
        { name: 'Tech Strategists', benefit: 'Mapping future semiconductor and battery supply nodes.' }
      ]
    },
    why: {
      title: 'The Mineral Moat.',
      description: 'Control over critical mineral nodes is the primary geopolitical differentiator for the next decade.',
      impact: [
        { label: 'Active Mines', value: '450+' },
        { label: 'Mineral Types', value: '12 Keys' },
        { label: 'Policy Updates', value: 'Pulse' },
        { label: 'Integrity', value: 'Sovereign' }
      ]
    },
    how: {
      title: 'Securing Supply.',
      description: 'How to integrate mining intelligence into supply chain strategy.',
      steps: [
        'Identify Deposit Nodes',
        'Analyze Logistical Flow',
        'Audit ESG Signals',
        'Execute Off-take Agreements'
      ]
    }
  },
  'fintech-&-digital-finance': {
    title: 'Fintech & Digital Finance.',
    tagline: 'Sovereign Digital Infrastructure',
    what: {
      title: 'The Digital Leapfrog.',
      description: 'Tracking the deployment of digital payment nodes, mobile money networks, and CBDC (Central Bank Digital Currency) pilots.',
      points: [
        'Mobile Money penetration tracking',
        'CBDC development & policy signals',
        'Digital identity (e-ID) adoption nodes',
        'Fintech regulatory pulse monitoring'
      ]
    },
    who: {
      title: 'For Global Financial Institutions.',
      description: 'Empowering banking and payment firms to target high-growth digital nodes.',
      segments: [
        { name: 'Payment Networks', benefit: 'Identifying regions with rapid digital adoption.' },
        { name: 'Retail Banks', benefit: 'Mapping future digital banking hubs.' },
        { name: 'Policy Makers', benefit: 'Benchmarking regional digital currency success.' }
      ]
    },
    why: {
      title: 'The Digital Dividend.',
      description: 'Digital infrastructure is the primary catalyst for financial inclusion and SME growth in emerging markets.',
      impact: [
        { label: 'Active Fintechs', value: '850+' },
        { label: 'Payment Nodes', value: '45,000+' },
        { label: 'Growth Vector', value: 'High' },
        { label: 'Sync Status', value: 'Live' }
      ]
    },
    how: {
      title: 'Integrating Finance.',
      description: 'How to utilize digital signals for market expansion.',
      steps: [
        'Map Adoption Nodes',
        'Audit Regulatory Pulse',
        'Verify Infrastructure Moats',
        'Initialize Digital Node'
      ]
    }
  },
  'tourism-&-hospitality': {
    title: 'Tourism & Hospitality.',
    tagline: 'Regional Growth Anchors',
    what: {
      title: 'The Leisure Economy.',
      description: 'Tracking tourism-linked fiscal signals, hospitality CapEx, and regional maritime arrivals in the Caribbean and Africa.',
      points: [
        'Cruise & Maritime arrival monitoring',
        'Hospitality project development tracking',
        'Tourism-linked GDP volatility signals',
        'Regional brand expansion mapping'
      ]
    },
    who: {
      title: 'For Hospitality & Leisure Capital.',
      description: 'Built for developers and funds targeting regional leisure hubs.',
      segments: [
        { name: 'Hotel Developers', benefit: 'Identifying regions with favorable tourism incentives.' },
        { name: 'Maritime Operators', benefit: 'Mapping future cruise and port expansion nodes.' },
        { name: 'Regional Planners', benefit: 'Benchmarking tourism impact against peers.' }
      ]
    },
    why: {
      title: 'The Hospitality Moat.',
      description: 'Tourism is a primary hard-currency driver for CARICOM and select African nations, serving as a core fiscal stabilizer.',
      impact: [
        { label: 'Arrival Nodes', value: '42 Major' },
        { label: 'CapEx Tracked', value: '$12B+' },
        { label: 'Growth Signal', value: 'Stable' },
        { label: 'Data Tier', value: 'Sovereign' }
      ]
    },
    how: {
      title: 'Strategic Site Selection.',
      description: 'How to utilize tourism signals for capital deployment.',
      steps: [
        'Analyze Arrival Flows',
        'Audit Fiscal Incentives',
        'Map Project Pipelines',
        'Deploy Hospitality Capital'
      ]
    }
  },
  'logistics-&-trade': {
    title: 'Logistics & Trade.',
    tagline: 'Transatlantic Supply Corridors',
    what: {
      title: 'The Flow of Sovereignty.',
      description: 'Tracking port efficiency, trade-flow volumes, and regional logistics hubs across the transatlantic corridor.',
      points: [
        'Port efficiency & turnaround signals',
        'Trade corridor volume monitoring',
        'Logistics infrastructure project tracking',
        'Customs & regulatory pulse signals'
      ]
    },
    who: {
      title: 'For Supply Chain & Trade Strategists.',
      description: 'Empowering G2000 firms to optimize regional trade routes.',
      segments: [
        { name: 'Shipping Majors', benefit: 'Identifying high-efficiency port nodes.' },
        { name: 'Trade Financiers', benefit: 'Mapping future export-import growth vectors.' },
        { name: 'Infrastructure Funds', benefit: 'Benchmarking port and rail project stability.' }
      ]
    },
    why: {
      title: 'The Logistical Advantage.',
      description: 'Efficient trade corridors are the primary multiplier for regional macroeconomic expansion.',
      impact: [
        { label: 'Port Nodes', value: '24 Tier-1' },
        { label: 'Trade Volume', value: '$150B+' },
        { label: 'Signal Sync', value: 'Source-Attributed' },
        { label: 'Reliability', value: 'Sovereign' }
      ]
    },
    how: {
      title: 'Mapping the Flow.',
      description: 'How to utilize logistics signals for supply chain optimization.',
      steps: [
        'Audit Port Efficiency',
        'Map Trade Corridors',
        'Analyze Regulatory Pulse',
        'Secure Logistical Moat'
      ]
    }
  }
};

/**
 * Fetches dynamic content for presentation pages from Supabase 'institutional_briefs' table.
 * Falls back to local snapshots for resilience.
 */
export async function getInstitutionalBrief(key: string) {
  try {
    const supabase = getSupabase();
    if (!supabase) return CORPORATE_SNAPSHOTS[key] || CORPORATE_SNAPSHOTS['africa-command'];

    const { data, error } = await supabase
      .from('institutional_briefs')
      .select('*')
      .eq('page_key', key)
      .single();

    if (error || !data) {
       return CORPORATE_SNAPSHOTS[key] || CORPORATE_SNAPSHOTS['africa-command'];
    }

    return data.content; // Assuming 'content' column stores the JSON brief
  } catch (err) {
    return CORPORATE_SNAPSHOTS[key] || CORPORATE_SNAPSHOTS['africa-command'];
  }
}
