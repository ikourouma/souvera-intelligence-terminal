-- SOUVERA INSTITUTIONAL CONTENT INFRASTRUCTURE
-- Migration: 20260427_institutional_briefs

-- 1. Create the table for strategic briefings
CREATE TABLE IF NOT EXISTS institutional_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT UNIQUE NOT NULL, -- e.g. 'africa-command', 'energy-&-renewables'
    title TEXT NOT NULL,
    tagline TEXT,
    content JSONB NOT NULL, -- Stores the full WHAT/WHO/WHY/HOW structure
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Row Level Security (RLS)
ALTER TABLE institutional_briefs ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the gateway
CREATE POLICY "Public Read Access" 
ON institutional_briefs FOR SELECT 
USING (true);

-- 3. Initial Seed Data: Africa Command Center
INSERT INTO institutional_briefs (page_key, title, tagline, content)
VALUES (
    'africa-command', 
    'Africa Command Center.', 
    'Sovereign Intelligence Gateway',
    '{
        "title": "Africa Command Center.",
        "tagline": "Sovereign Intelligence Gateway",
        "what": {
            "title": "The Continental Pulse.",
            "description": "A high-fidelity intelligence node tracking 54 African nations across macroeconomic, fiscal, and sector-specific corridors.",
            "points": [
                "Real-time GDP & Fiscal health tracking",
                "FDI Sentiment & Investment flow mapping",
                "Sovereign debt & policy shift signaling",
                "Cross-continental trade node visualization"
            ]
        },
        "who": {
            "title": "Designed for Conviction.",
            "description": "Built for decision-makers who require objective truth in emerging markets.",
            "segments": [
                {"name": "Institutional Capital", "benefit": "Private Equity and Hedge Funds targeting strategic growth vectors."},
                {"name": "Sovereign Entities", "benefit": "Central Banks and Ministries benchmarking against regional peers."},
                {"name": "Global Corporates", "benefit": "Fortune 5 firms planning market entry and supply chain expansion."}
            ]
        },
        "why": {
            "title": "Objective Truth in the Era of Alpha.",
            "description": "African markets are often shrouded in fragmented data. Souvera provides the clarity required for billion-dollar convictions.",
            "impact": [
                {"label": "Markets Tracked", "value": "54 Nations"},
                {"label": "Data Nodes", "value": "1,200+"},
                {"label": "Sync Frequency", "value": "Real-Time"},
                {"label": "Accuracy Score", "value": "99.8%"}
            ]
        },
        "how": {
            "title": "How to Utilize the Node.",
            "description": "Integrating the Africa Command Center into your strategic workflow.",
            "steps": [
                "Initialize Identity Node",
                "Select Sovereign Corridor",
                "Monitor Signal Triggers",
                "Execute with Conviction"
            ]
        }
    }'::jsonb
) ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content;

-- 4. Initial Seed Data: Caribbean Command Center
INSERT INTO institutional_briefs (page_key, title, tagline, content)
VALUES (
    'caribbean-command', 
    'Caribbean Command Center.', 
    'CARICOM Intelligence Node',
    '{
        "title": "Caribbean Command Center.",
        "tagline": "CARICOM Intelligence Node",
        "what": {
            "title": "The Transatlantic Bridge.",
            "description": "A dedicated intelligence node for the Caribbean region, tracking 15+ CARICOM member states and their macroeconomic stability.",
            "points": [
                "Blue Economy & Maritime trade signals",
                "Tourism-linked fiscal volatility tracking",
                "CARICOM trade corridor mapping",
                "Regional currency & inflation monitoring"
            ]
        },
        "who": {
            "title": "Regional Strategic Access.",
            "description": "Empowering stakeholders with specialized intelligence on the Caribbean trade nodes.",
            "segments": [
                {"name": "Maritime Investors", "benefit": "Tracking port efficiency and trade-flow signals."},
                {"name": "Policy Architects", "benefit": "Benchmarking regional growth against global peers."},
                {"name": "FDI Strategists", "benefit": "Identifying emerging sectors in the CARICOM network."}
            ]
        },
        "why": {
            "title": "The Caribbean Signal Matrix.",
            "description": "Souvera normalizes fragmented regional data into a single, high-fidelity intelligence interface.",
            "impact": [
                {"label": "CARICOM States", "value": "15 Nations"},
                {"label": "Trade Nodes", "value": "240+"},
                {"label": "Signal Update", "value": "Live"},
                {"label": "Data Integrity", "value": "Sovereign"}
            ]
        },
        "how": {
            "title": "Strategic Implementation.",
            "description": "How to integrate Caribbean intelligence into your global strategy.",
            "steps": [
                "Map Trade Corridors",
                "Analyze Fiscal Moats",
                "Sync Risk Thresholds",
                "Deploy Capital"
            ]
        }
    }'::jsonb
) ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content;
