import type { KnowledgeBaseContent } from '@/types/knowledge-base';

/**
 * Static Knowledge Base
 * 
 * Contains contextual help content for 10+ core terms
 * 
 * Future: Can be migrated to Supabase for dynamic updates
 */

export const knowledgeBase: Record<string, KnowledgeBaseContent> = {
  // ==========================================
  // SIGNAL METRICS
  // ==========================================
  
  signal_strength: {
    termKey: 'signal_strength',
    termLabel: 'Signal Strength',
    category: 'signal',
    tooltipShort: 'Signal Strength measures investment attractiveness (0-100), combining economic growth (30%), investment climate (40%), political stability (20%), and data confidence (10%).',
    modal: {
      title: 'What is Signal Strength?',
      summary: 'Signal Strength is a proprietary composite score (0-100) that measures a country\'s overall investment attractiveness for institutional investors, businesses, and trade partners.',
      sections: [
        {
          heading: 'How It\'s Calculated',
          content: 'Signal Strength combines four key dimensions into a single, actionable score:',
          subsections: [
            {
              title: '1. Investment Climate (40%)',
              points: [
                'FDI inflows trend (last 5 years)',
                'Ease of doing business ranking',
                'Regulatory environment quality',
              ],
            },
            {
              title: '2. Economic Growth (30%)',
              points: [
                'GDP growth rate (5-year average)',
                'GDP per capita trajectory',
                'Sector diversification index',
              ],
            },
            {
              title: '3. Political Stability (20%)',
              points: [
                'World Bank Governance Indicators',
                'Political risk assessment',
                'Policy continuity probability',
              ],
            },
            {
              title: '4. Data Confidence (10%)',
              points: [
                'Data freshness (< 90 days preferred)',
                'Source reliability (World Bank, IMF prioritized)',
                'Coverage completeness',
              ],
            },
          ],
        },
        {
          heading: 'Signal Levels',
          content: 'Signal scores are categorized into four levels to guide investment decisions:',
          levels: [
            {
              range: '70-100',
              label: 'HIGH GROWTH',
              color: 'green',
              description: 'Strong fundamentals, favorable investment climate, low risk profile',
            },
            {
              range: '50-69',
              label: 'MODERATE GROWTH',
              color: 'yellow',
              description: 'Stable but with some risk factors, selective opportunities available',
            },
            {
              range: '30-49',
              label: 'WATCH',
              color: 'orange',
              description: 'Mixed signals, proceed with extensive due diligence',
            },
            {
              range: '0-29',
              label: 'RISK',
              color: 'red',
              description: 'Significant challenges, high-risk environment requiring mitigation',
            },
          ],
        },
      ],
      dataSources: ['World Bank', 'IMF', 'OECD', 'UNCTAD'],
      learnMoreUrl: '/docs/methodology/signal-strength',
    },
    relatedTerms: ['investment_score', 'confidence_score', 'economic_momentum'],
    tags: ['signal', 'investment', 'score', 'attractiveness'],
  },

  investment_score: {
    termKey: 'investment_score',
    termLabel: 'Investment Score',
    category: 'signal',
    tooltipShort: 'Investment Score (0-100) measures how attractive a country is for foreign direct investment based on FDI inflows, business environment, and regulatory quality.',
    modal: {
      title: 'Investment Score',
      summary: 'A sub-component of Signal Strength, the Investment Score specifically measures a country\'s attractiveness for foreign direct investment (FDI).',
      sections: [
        {
          heading: 'Calculation Factors',
          content: 'Three primary factors determine the Investment Score:',
          subsections: [
            {
              title: 'FDI Net Inflows (50%)',
              points: [
                'Historical trend (5 years) showing consistent growth',
                'Recent momentum (12 months) indicating acceleration',
                'Comparison to regional peers',
              ],
            },
            {
              title: 'Ease of Doing Business (30%)',
              points: [
                'World Bank ranking position',
                'Time required to start a business',
                'Number of procedures for business registration',
              ],
            },
            {
              title: 'Regulatory Environment (20%)',
              points: [
                'Contract enforcement reliability',
                'Property rights protection',
                'Tax transparency and predictability',
              ],
            },
          ],
        },
        {
          heading: 'Interpretation',
          content: 'Investment Score ranges help identify suitable markets:',
          levels: [
            {
              range: '80-100',
              label: 'EXCELLENT',
              color: 'green',
              description: 'Exceptional investment climate (e.g., Singapore, Rwanda)',
            },
            {
              range: '60-79',
              label: 'STRONG',
              color: 'blue',
              description: 'Strong investment potential with manageable risks',
            },
            {
              range: '40-59',
              label: 'MODERATE',
              color: 'yellow',
              description: 'Moderate opportunities, due diligence required',
            },
            {
              range: '0-39',
              label: 'CHALLENGING',
              color: 'orange',
              description: 'Challenging environment, high-risk profile',
            },
          ],
        },
      ],
      dataSources: ['UNCTAD FDI Database', 'World Bank Doing Business'],
    },
    relatedTerms: ['signal_strength', 'fdi_net_inflows'],
    tags: ['investment', 'fdi', 'business', 'climate'],
  },

  confidence_score: {
    termKey: 'confidence_score',
    termLabel: 'Confidence Score',
    category: 'signal',
    tooltipShort: 'Confidence Score (0-100) indicates data quality and reliability based on source credibility, freshness (< 90 days preferred), and coverage completeness.',
    modal: {
      title: 'Confidence Score',
      summary: 'Measures the quality and reliability of the data underlying our intelligence analysis. Higher scores mean more trustworthy insights.',
      sections: [
        {
          heading: 'What Affects Confidence',
          content: 'Three factors determine data confidence:',
          subsections: [
            {
              title: '1. Data Freshness (40%)',
              points: [
                '< 30 days: 100% (most recent)',
                '30-90 days: 80% (recent)',
                '90-180 days: 60% (moderate age)',
                '> 180 days: 40% (outdated)',
              ],
            },
            {
              title: '2. Source Reliability (40%)',
              points: [
                'Tier 1 (World Bank, IMF, UN): 100%',
                'Tier 2 (National statistics agencies): 80%',
                'Tier 3 (Industry reports): 60%',
                'Tier 4 (Estimates, projections): 40%',
              ],
            },
            {
              title: '3. Coverage Completeness (20%)',
              points: [
                'All indicators present: 100%',
                '75-99% present: 80%',
                '50-74% present: 60%',
                '< 50% present: 40%',
              ],
            },
          ],
        },
        {
          heading: 'Confidence Levels',
          content: 'Use these levels to assess data reliability:',
          levels: [
            {
              range: '80-100',
              label: 'HIGH',
              color: 'green',
              description: 'Recent data from authoritative sources, complete coverage',
            },
            {
              range: '60-79',
              label: 'MODERATE',
              color: 'yellow',
              description: 'Some older data or gaps, generally reliable',
            },
            {
              range: '40-59',
              label: 'LOW',
              color: 'orange',
              description: 'Significant data age or gaps, use with caution',
            },
            {
              range: '0-39',
              label: 'VERY LOW',
              color: 'red',
              description: 'Outdated or incomplete data, limited reliability',
            },
          ],
        },
        {
          heading: 'Why It Matters',
          content: 'A country with HIGH GROWTH signal but LOW confidence score suggests promising opportunities but requires additional due diligence before investment decisions.',
          list: [],
        },
      ],
      dataSources: ['Souvera Quality Control System'],
    },
    relatedTerms: ['signal_strength', 'data_freshness'],
    tags: ['confidence', 'data', 'quality', 'reliability'],
  },

  // ==========================================
  // MOMENTUM METRICS
  // ==========================================

  economic_momentum: {
    termKey: 'economic_momentum',
    termLabel: 'Economic Momentum',
    category: 'momentum',
    tooltipShort: 'Economic Momentum tracks the 90-day trend in key indicators (GDP growth, FDI, trade volume). Positive momentum indicates accelerating growth.',
    modal: {
      title: 'Economic Momentum',
      summary: 'Measures the direction and speed of economic change over the past 90 days. Unlike static metrics, momentum shows where the economy is heading.',
      sections: [
        {
          heading: 'What We Track',
          content: 'Economic Momentum analyzes five key trends:',
          list: [
            'GDP Growth Acceleration: Comparing Q-over-Q growth rates',
            'FDI Flow Changes: Month-over-month FDI inflows',
            'Trade Volume Shifts: Export + import growth trends',
            'Inflation Trajectory: Rising or declining inflation rates',
            'Currency Stability: FX rate volatility (lower is better)',
          ],
        },
        {
          heading: 'Momentum Levels',
          content: 'Momentum is expressed as a percentage change and categorized into five levels:',
          levels: [
            {
              range: '+10% or more',
              label: 'ACCELERATING',
              color: 'green',
              description: 'Strong positive trends across multiple indicators',
            },
            {
              range: '+5% to +9.9%',
              label: 'POSITIVE',
              color: 'blue',
              description: 'Moderate improvement, favorable direction',
            },
            {
              range: '-4.9% to +4.9%',
              label: 'STABLE',
              color: 'yellow',
              description: 'Little change, holding steady',
            },
            {
              range: '-5% to -9.9%',
              label: 'SLOWING',
              color: 'orange',
              description: 'Moderate decline, watch closely',
            },
            {
              range: '-10% or less',
              label: 'DECLINING',
              color: 'red',
              description: 'Significant negative trends, high risk',
            },
          ],
        },
        {
          heading: 'Investor Readiness',
          content: 'Use momentum signals to time market entry:',
          list: [
            'ACCELERATING + HIGH GROWTH Signal = PRIME OPPORTUNITY: Enter now to capture early-stage growth',
            'POSITIVE + MODERATE Signal = GOOD TIMING: Stable fundamentals with improving trends',
            'DECLINING + WATCH Signal = WAIT: Postpone until momentum stabilizes',
          ],
        },
      ],
      dataSources: ['World Bank', 'IMF', 'UNCTAD', 'National Statistics'],
    },
    relatedTerms: ['signal_strength', 'gdp_growth_annual_pct'],
    tags: ['momentum', 'trend', 'growth', 'acceleration'],
  },

  // ==========================================
  // INTENSITY METRICS
  // ==========================================

  risk_intensity: {
    termKey: 'risk_intensity',
    termLabel: 'Risk Intensity',
    category: 'intensity',
    tooltipShort: 'Risk Intensity measures potential downsides including political instability, currency volatility, inflation, and regulatory uncertainty (0-100, lower is better).',
    modal: {
      title: 'Risk Intensity',
      summary: 'A composite score (0-100) measuring potential threats to investment returns. Lower scores indicate lower risk.',
      sections: [
        {
          heading: 'Risk Factors',
          content: '⚠️ Lower Risk Intensity = Better (0-100 scale, inverted)',
          subsections: [
            {
              title: '1. Political Risk (30%)',
              points: [
                'Government stability',
                'Policy continuity probability',
                'Civil unrest indicators',
              ],
            },
            {
              title: '2. Currency Volatility (25%)',
              points: [
                'FX rate fluctuation (12-month)',
                'Central bank reserves adequacy',
                'Sovereign credit rating',
              ],
            },
            {
              title: '3. Inflation Risk (20%)',
              points: [
                'Current inflation rate',
                'Inflation trajectory (rising/falling)',
                'Central bank credibility',
              ],
            },
            {
              title: '4. Regulatory Uncertainty (15%)',
              points: [
                'Policy change frequency',
                'Contract enforcement reliability',
                'Expropriation risk',
              ],
            },
            {
              title: '5. Economic Shocks (10%)',
              points: [
                'Commodity price dependence',
                'External debt burden',
                'Trade concentration risk',
              ],
            },
          ],
        },
        {
          heading: 'Risk Levels',
          content: 'Risk categories guide mitigation strategies:',
          levels: [
            {
              range: '0-25',
              label: 'LOW RISK',
              color: 'green',
              description: 'Stable environment, minimal threats',
            },
            {
              range: '26-50',
              label: 'MODERATE RISK',
              color: 'yellow',
              description: 'Some challenges, manageable with planning',
            },
            {
              range: '51-75',
              label: 'HIGH RISK',
              color: 'orange',
              description: 'Significant threats, extensive mitigation required',
            },
            {
              range: '76-100',
              label: 'VERY HIGH RISK',
              color: 'red',
              description: 'Severe challenges, high probability of loss',
            },
          ],
        },
        {
          heading: 'Mitigation Strategies',
          content: 'For MODERATE risk countries:',
          list: [
            'Hedge currency exposure (forward contracts)',
            'Diversify across multiple sectors',
            'Engage local partners with government relationships',
            'Maintain flexible exit strategies',
          ],
        },
      ],
      dataSources: ['World Bank Governance', 'Political Risk Services', 'IMF'],
    },
    relatedTerms: ['opportunity_intensity', 'signal_strength'],
    tags: ['risk', 'volatility', 'uncertainty', 'mitigation'],
  },

  opportunity_intensity: {
    termKey: 'opportunity_intensity',
    termLabel: 'Opportunity Intensity',
    category: 'intensity',
    tooltipShort: 'Opportunity Intensity measures growth potential including market size, demographic dividend, sector strength, and infrastructure development (0-100, higher is better).',
    modal: {
      title: 'Opportunity Intensity',
      summary: 'A composite score (0-100) quantifying upside potential for investors and businesses. Higher scores indicate greater opportunities.',
      sections: [
        {
          heading: 'Opportunity Factors',
          content: '🎯 Higher Opportunity Intensity = Better (0-100 scale)',
          subsections: [
            {
              title: '1. Market Size & Growth (30%)',
              points: [
                'GDP size and growth trajectory',
                'Consumer spending power',
                'Middle-class expansion rate',
              ],
            },
            {
              title: '2. Demographic Dividend (25%)',
              points: [
                'Youth population (% under 30)',
                'Education levels and skills',
                'Digital adoption rate',
              ],
            },
            {
              title: '3. Sector Strength (20%)',
              points: [
                'High-growth sectors (tech, manufacturing)',
                'Competitive advantages',
                'Export potential',
              ],
            },
            {
              title: '4. Infrastructure Development (15%)',
              points: [
                'Transport, energy, digital connectivity',
                'Investment in infrastructure (% GDP)',
                'Public-private partnerships',
              ],
            },
            {
              title: '5. Trade Access (10%)',
              points: [
                'AGOA, AfCFTA, regional agreements',
                'Tariff-free market access',
                'Trade facilitation improvements',
              ],
            },
          ],
        },
        {
          heading: 'Opportunity Levels',
          content: 'Opportunity scores guide investment prioritization:',
          levels: [
            {
              range: '80-100',
              label: 'EXCEPTIONAL',
              color: 'purple',
              description: 'Rare high-growth opportunities, "next frontier" markets',
            },
            {
              range: '60-79',
              label: 'STRONG',
              color: 'green',
              description: 'Significant upside potential, favorable conditions',
            },
            {
              range: '40-59',
              label: 'MODERATE',
              color: 'yellow',
              description: 'Steady opportunities, selective entry recommended',
            },
            {
              range: '20-39',
              label: 'LIMITED',
              color: 'orange',
              description: 'Few growth prospects, challenging environment',
            },
            {
              range: '0-19',
              label: 'MINIMAL',
              color: 'red',
              description: 'Very limited opportunities, avoid',
            },
          ],
        },
        {
          heading: 'Investment Thesis',
          content: 'STRONG Opportunity + MODERATE Risk = FAVORABLE RISK/REWARD. Countries with high opportunity intensity that outweighs manageable risks present compelling investment cases.',
          list: [],
        },
      ],
      dataSources: ['World Bank', 'UN Population Division', 'IMF'],
    },
    relatedTerms: ['risk_intensity', 'signal_strength', 'demographic_dividend'],
    tags: ['opportunity', 'growth', 'potential', 'upside'],
  },

  // ==========================================
  // TRADE AGREEMENTS
  // ==========================================

  agoa: {
    termKey: 'agoa',
    termLabel: 'AGOA',
    category: 'trade',
    tooltipShort: 'AGOA (African Growth and Opportunity Act) provides duty-free access to the U.S. market for eligible sub-Saharan African countries. Expires 2025, extension pending.',
    modal: {
      title: 'AGOA: African Growth and Opportunity Act',
      summary: 'U.S. legislation enacted in 2000 providing trade preferences for sub-Saharan African countries.',
      sections: [
        {
          heading: 'Key Benefits',
          content: 'AGOA provides four critical advantages:',
          list: [
            'Duty-Free Access: 6,500+ products can enter the U.S. market without import tariffs',
            'Significant Savings: Average 8-15% tariff savings → increased competitiveness',
            'Market Access: $28 trillion U.S. market for African exporters',
            'Job Creation: Supports manufacturing and export jobs in Africa',
          ],
        },
        {
          heading: 'Eligibility Criteria',
          content: 'Countries must meet these requirements:',
          list: [
            'Market-based economy',
            'Rule of law and political pluralism',
            'Elimination of trade barriers',
            'Protection of intellectual property',
            'Efforts to combat corruption',
            'Protection of human rights and worker rights',
          ],
        },
        {
          heading: 'Current Status (2025)',
          content: '',
          list: [
            '36 of 49 sub-Saharan African countries eligible',
            '$10.2B total exports to U.S. under AGOA (2025)',
            'Expires September 30, 2025',
            'Extension under review by USTR',
          ],
        },
      ],
      dataSources: ['U.S. Trade Representative (USTR)', 'U.S. Census Bureau'],
      learnMoreUrl: 'https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa',
    },
    relatedTerms: ['afcfta', 'bilateral_trade'],
    tags: ['agoa', 'trade', 'duty-free', 'us', 'africa'],
  },

  afcfta: {
    termKey: 'afcfta',
    termLabel: 'AfCFTA',
    category: 'trade',
    tooltipShort: 'AfCFTA (African Continental Free Trade Area) enables duty-free trade among 54 African countries, creating a 1.3B consumer market and unlocking intra-African trade.',
    modal: {
      title: 'AfCFTA: African Continental Free Trade Area',
      summary: 'The world\'s largest free trade area by number of countries, connecting 54 African nations into a single continental market.',
      sections: [
        {
          heading: 'Key Features',
          content: '',
          list: [
            'Market Size: 1.3 billion consumers across 54 countries',
            'Combined GDP: $3.4 trillion (2023)',
            'Duty-Free Access: Eliminates 90% of tariffs on goods',
            'Launched: January 1, 2021',
          ],
        },
        {
          heading: 'Benefits for Businesses',
          content: '',
          list: [
            'Tariff Elimination: Reduced cost of cross-border trade',
            'Regional Value Chains: Source inputs from multiple African countries',
            'Market Diversification: Access to diverse consumer markets',
            'Investment Attraction: Larger unified market attracts FDI',
          ],
        },
        {
          heading: 'Strategic Advantages',
          content: 'Example: Nigerian manufacturers can source cocoa from Ivory Coast, process in Nigeria, and export duty-free to Kenya—creating regional value chains that boost competitiveness.',
          list: [],
        },
      ],
      dataSources: ['African Union', 'AfCFTA Secretariat', 'World Bank'],
      learnMoreUrl: 'https://au-afcfta.org/',
    },
    relatedTerms: ['agoa', 'ecowas', 'intra_african_trade'],
    tags: ['afcfta', 'africa', 'trade', 'free-trade', 'continental'],
  },

  ecowas: {
    termKey: 'ecowas',
    termLabel: 'ECOWAS',
    category: 'trade',
    tooltipShort: 'ECOWAS (Economic Community of West African States) provides 15 member countries with free movement of goods, services, and people across West Africa (350M consumers).',
    modal: {
      title: 'ECOWAS: Economic Community of West African States',
      summary: 'Regional economic bloc of 15 West African countries promoting integration and free movement.',
      sections: [
        {
          heading: 'Member Countries',
          content: 'Nigeria, Ghana, Senegal, Ivory Coast, Mali, Benin, Burkina Faso, Niger, Togo, Guinea, Sierra Leone, Liberia, Gambia, Guinea-Bissau, Cabo Verde',
          list: [],
        },
        {
          heading: 'Key Benefits',
          content: '',
          list: [
            'Free Movement: Goods, services, capital, and people',
            'Market Access: 350 million consumers',
            'Common External Tariff: Standardized tariffs for non-members',
            'Regional Integration: Harmonized policies and standards',
          ],
        },
        {
          heading: 'Strategic Advantage',
          content: 'For Nigeria as West Africa\'s largest economy, ECOWAS provides preferential access to 350M consumers and serves as a springboard for continental expansion via AfCFTA.',
          list: [],
        },
      ],
      dataSources: ['ECOWAS Commission', 'African Development Bank'],
      learnMoreUrl: 'https://www.ecowas.int/',
    },
    relatedTerms: ['afcfta', 'regional_trade'],
    tags: ['ecowas', 'west-africa', 'trade', 'regional', 'integration'],
  },

  // ==========================================
  // MOMENTUM METRICS (Continued)
  // ==========================================

  investor_readiness: {
    termKey: 'investor_readiness',
    termLabel: 'Investor Readiness',
    category: 'momentum',
    tooltipShort: 'Investor Readiness (0-100) measures how prepared a market is to receive foreign investment, considering infrastructure, regulatory environment, and market accessibility.',
    modal: {
      title: 'Investor Readiness',
      summary: 'A composite score measuring how well-prepared a country is to attract and absorb foreign direct investment.',
      sections: [
        {
          heading: 'Key Components',
          content: 'Investor Readiness is calculated from:',
          list: [
            'Infrastructure Quality (30%): Transport, energy, digital connectivity',
            'Regulatory Framework (25%): Business registration ease, contract enforcement',
            'Market Access (20%): Banking systems, payment infrastructure, currency convertibility',
            'Legal Environment (15%): IP protection, dispute resolution, anti-corruption',
            'Human Capital (10%): Workforce skills, education levels, language proficiency',
          ],
        },
        {
          heading: 'Interpretation',
          content: 'Higher scores indicate markets where investors can deploy capital quickly and efficiently.',
          levels: [
            {
              range: '80-100',
              label: 'HIGHLY READY',
              color: 'purple',
              description: 'Well-developed infrastructure, streamlined processes',
            },
            {
              range: '60-79',
              label: 'READY',
              color: 'blue',
              description: 'Good fundamentals, some friction points',
            },
            {
              range: '40-59',
              label: 'DEVELOPING',
              color: 'yellow',
              description: 'Infrastructure gaps, longer setup times',
            },
            {
              range: '0-39',
              label: 'NOT READY',
              color: 'orange',
              description: 'Significant barriers, high entry costs',
            },
          ],
        },
      ],
      dataSources: ['World Bank', 'World Economic Forum', 'IMF'],
    },
    relatedTerms: ['economic_momentum', 'investment_score'],
    tags: ['readiness', 'infrastructure', 'market', 'access'],
  },

  momentum_index: {
    termKey: 'momentum_index',
    termLabel: 'Momentum Index',
    category: 'momentum',
    tooltipShort: 'Momentum Index measures the rate of change in economic activity over 90 days. Positive values indicate accelerating growth, negative values indicate deceleration.',
    modal: {
      title: 'Momentum Index',
      summary: 'A single number (-100 to +100) representing the speed and direction of economic change.',
      sections: [
        {
          heading: 'What It Measures',
          content: 'The index tracks 90-day changes in:',
          list: [
            'GDP Growth: Quarter-over-quarter acceleration',
            'FDI Flows: Month-over-month changes',
            'Trade Volume: Export + import growth rates',
            'Employment: Job creation trends',
            'Business Activity: PMI and business confidence indices',
          ],
        },
        {
          heading: 'How to Read It',
          content: '',
          levels: [
            {
              range: '+50 to +100',
              label: 'STRONG ACCELERATION',
              color: 'green',
              description: 'Rapid economic expansion across multiple indicators',
            },
            {
              range: '+1 to +49',
              label: 'POSITIVE',
              color: 'blue',
              description: 'Moderate growth, favorable trends',
            },
            {
              range: '-49 to 0',
              label: 'SLOWING',
              color: 'orange',
              description: 'Deceleration, but not contracting',
            },
            {
              range: '-50 to -100',
              label: 'DECLINING',
              color: 'red',
              description: 'Economic contraction, high risk',
            },
          ],
        },
      ],
      dataSources: ['World Bank', 'IMF', 'National Statistics'],
    },
    relatedTerms: ['economic_momentum', 'investor_readiness'],
    tags: ['momentum', 'trend', 'acceleration', 'growth'],
  },

  news_pulse: {
    termKey: 'news_pulse',
    termLabel: 'News Pulse',
    category: 'signal',
    tooltipShort: 'News Pulse analyzes recent news sentiment (7-30 days) using NLP to detect positive, neutral, or negative market signals from media coverage.',
    modal: {
      title: 'News Pulse',
      summary: 'Real-time sentiment analysis of news coverage to identify emerging risks and opportunities before they appear in economic data.',
      sections: [
        {
          heading: 'How It Works',
          content: 'Natural Language Processing (NLP) analyzes:',
          list: [
            'News Headlines: Major publications, business press, local media',
            'Sentiment Scoring: Positive, neutral, negative classification',
            'Topic Detection: Political events, economic reforms, conflicts',
            'Trend Identification: Emerging patterns over 7-30 days',
            'Source Credibility: Weight by publication authority',
          ],
        },
        {
          heading: 'Sentiment Levels',
          content: '',
          levels: [
            {
              range: '0.3 to 1.0',
              label: 'POSITIVE',
              color: 'green',
              description: 'Favorable news coverage, bullish market signals',
            },
            {
              range: '-0.3 to 0.3',
              label: 'NEUTRAL',
              color: 'yellow',
              description: 'Mixed or balanced coverage',
            },
            {
              range: '-1.0 to -0.3',
              label: 'NEGATIVE',
              color: 'red',
              description: 'Unfavorable coverage, bearish signals',
            },
          ],
        },
        {
          heading: 'Why It Matters',
          content: 'News Pulse is a leading indicator—sentiment shifts often precede changes in economic data by 30-90 days. Negative news can signal upcoming risks, while positive news may indicate overlooked opportunities.',
          list: [],
        },
      ],
      dataSources: ['Global News APIs', 'Souvera NLP Engine'],
    },
    relatedTerms: ['risk_intensity', 'opportunity_intensity'],
    tags: ['news', 'sentiment', 'nlp', 'leading-indicator'],
  },

  // ==========================================
  // ECONOMIC INDICATORS (Continued)
  // ==========================================

  gdp_current_usd: {
    termKey: 'gdp_current_usd',
    termLabel: 'GDP (Current USD)',
    category: 'indicator',
    tooltipShort: 'Gross Domestic Product (GDP) is the total value of all goods and services produced in a country over one year, measured in current U.S. dollars.',
    modal: {
      title: 'GDP (Current USD)',
      summary: 'Gross Domestic Product represents the total monetary value of all finished goods and services produced within a country\'s borders during a specific time period.',
      sections: [
        {
          heading: 'What It Measures',
          content: 'GDP captures the size of an economy by summing:',
          list: [
            'Consumer spending (households)',
            'Business investment (companies)',
            'Government spending (public sector)',
            'Net exports (exports minus imports)',
          ],
        },
        {
          heading: 'Why It Matters',
          content: 'GDP is the most comprehensive measure of economic activity:',
          list: [
            'Market Size: Larger GDP = larger consumer market',
            'Economic Health: Growing GDP = expanding economy',
            'Investment Scale: Indicates total investment opportunity',
            'Comparison: Enables cross-country comparisons',
          ],
        },
        {
          heading: 'Interpretation',
          content: 'GDP alone doesn\'t tell the full story. Consider GDP per capita (income per person) and GDP growth rate (speed of expansion) for complete analysis.',
          list: [],
        },
      ],
      dataSources: ['World Bank', 'IMF', 'National Statistics Agencies'],
    },
    relatedTerms: ['gdp_growth_annual_pct', 'gdp_per_capita'],
    tags: ['gdp', 'economy', 'output', 'market-size'],
  },

  // ============================================================================
  // SECTOR INTELLIGENCE SCORES
  // ============================================================================

  sector_strength_score: {
    termKey: 'sector_strength_score',
    termLabel: 'Sector Strength Score',
    category: 'sector',
    tooltipShort: 'Measures current sector performance: infrastructure, workforce quality, established companies, market maturity, and competitive advantages.',
    modal: {
      title: 'Sector Strength Score',
      summary: 'The Sector Strength Score assesses the present-day capacity and competitiveness of a sector within a country. It evaluates existing infrastructure, workforce quality, established companies, market maturity, regulatory environment, and comparative advantages. A high score indicates a well-developed sector with proven capabilities.',
      sections: [
        {
          heading: 'Score Components',
          content: 'Strength is measured across five dimensions:',
          list: [
            'Infrastructure: Physical and digital assets (ports, roads, broadband, power)',
            'Workforce: Skilled labor availability, training programs, talent pipeline',
            'Market Maturity: Number of established players, transaction volume, ecosystem depth',
            'Regulatory Environment: Business-friendly policies, ease of operations, legal framework',
            'Competitive Advantages: Unique assets (natural resources, geographic location, IP)',
          ],
        },
        {
          heading: 'Interpretation',
          content: 'Use strength scores to evaluate risk and readiness:',
          list: [
            '80-100: World-class sector with proven track record',
            '60-79: Strong sector with solid fundamentals',
            '40-59: Developing sector with identified gaps',
            '0-39: Nascent sector requiring significant investment',
          ],
        },
      ],
      dataSources: ['World Bank', 'UNCTAD', 'National Industry Associations', 'Company Data'],
    },
    relatedTerms: ['sector_growth_score', 'sector_attractiveness_score'],
    tags: ['sector', 'strength', 'capacity', 'infrastructure'],
  },

  sector_growth_score: {
    termKey: 'sector_growth_score',
    termLabel: 'Sector Growth Score',
    category: 'sector',
    tooltipShort: 'Measures sector momentum: revenue growth, new company formation, investment inflows, innovation rate, and expansion speed.',
    modal: {
      title: 'Sector Growth Score',
      summary: 'The Sector Growth Score evaluates the rate and sustainability of expansion within a sector. It tracks revenue growth, new company formation, VC/FDI inflows, R&D intensity, patent filings, and export growth. A high score signals a sector in rapid expansion with strong forward momentum.',
      sections: [
        {
          heading: 'Score Components',
          content: 'Growth is measured by momentum indicators:',
          list: [
            'Revenue Growth: Year-over-year sector revenue expansion (%)',
            'Company Formation: New businesses entering the sector (startups, subsidiaries)',
            'Investment Inflows: VC funding, FDI, private equity, and public market activity',
            'Innovation Rate: R&D spending, patent filings, new product launches',
            'Export Growth: International market penetration and sales expansion',
          ],
        },
        {
          heading: 'Interpretation',
          content: 'Growth scores indicate future potential and risk:',
          list: [
            '80-100: Hypergrowth sector with explosive momentum',
            '60-79: Fast-growing sector with sustained expansion',
            '40-59: Moderate growth with cyclical fluctuations',
            '0-39: Stagnant or declining sector',
          ],
        },
      ],
      dataSources: ['National Statistics Agencies', 'VC Databases', 'Patent Offices', 'Export Data'],
    },
    relatedTerms: ['sector_strength_score', 'sector_attractiveness_score'],
    tags: ['sector', 'growth', 'momentum', 'expansion'],
  },

  sector_attractiveness_score: {
    termKey: 'sector_attractiveness_score',
    termLabel: 'Sector Attractiveness Score',
    category: 'sector',
    tooltipShort: 'Measures investor appeal: market size, profitability, policy support, trade access, and strategic importance.',
    modal: {
      title: 'Sector Attractiveness Score',
      summary: 'The Sector Attractiveness Score evaluates how compelling a sector is for investors, exporters, and strategic partners. It combines market opportunity (size, profitability), policy environment (incentives, stability), trade access (AGOA, AfCFTA), and strategic value (critical supply chains, geopolitical importance).',
      sections: [
        {
          heading: 'Score Components',
          content: 'Attractiveness is driven by opportunity quality:',
          list: [
            'Market Opportunity: Total addressable market (TAM), profit margins, demand trends',
            'Policy Support: Tax incentives, grants, subsidies, SEZs, trade agreements',
            'Trade Access: Duty-free exports (AGOA), regional integration (AfCFTA), bilateral FTAs',
            'Strategic Importance: Critical supply chains (tech, energy, minerals), geopolitical priority',
            'Risk-Adjusted Returns: Political stability, currency risk, regulatory predictability',
          ],
        },
        {
          heading: 'Interpretation',
          content: 'Attractiveness scores guide prioritization:',
          list: [
            '80-100: Premier investment opportunity with exceptional returns',
            '60-79: Attractive opportunity with favorable risk-reward balance',
            '40-59: Opportunistic entry with selective risk mitigation',
            '0-39: High-risk opportunity requiring specialized expertise',
          ],
        },
      ],
      dataSources: ['World Bank', 'UNCTAD', 'Trade Databases', 'Policy Trackers'],
    },
    relatedTerms: ['sector_strength_score', 'sector_growth_score', 'agoa', 'afcfta'],
    tags: ['sector', 'attractiveness', 'investment', 'opportunity'],
  },

  // ==========================================
  // OPPORTUNITY TAB
  // ==========================================

  opportunity_overview: {
    termKey: 'opportunity_overview',
    termLabel: 'Investment Opportunity Overview',
    category: 'opportunity',
    tooltipShort: 'Comprehensive investment thesis covering multi-sector opportunities, entry strategies, and regional market advantages.',
    modal: {
      title: 'Investment Opportunity Analysis',
      summary: 'Souvera\'s Investment Opportunity analysis identifies structural inflection points, quantifies addressable markets, and provides actionable entry strategies across high-potential sectors.',
      sections: [
        {
          heading: 'What\'s Included',
          content: 'Our opportunity analysis covers:',
          list: [
            'Core Investment Pillars: Technology, Agriculture, Infrastructure priorities',
            'Market Sizing: TAM (Total Addressable Market) by sector with growth projections',
            'Entry Strategies: Joint ventures, PE/VC, greenfield projects, listed equities',
            'Regional Advantages: ECOWAS, AfCFTA, AGOA market access',
            'Competitive Positioning: Sector attractiveness vs. entry barriers',
          ],
        },
        {
          heading: 'How to Use This Intelligence',
          content: 'Leverage this tab to:',
          list: [
            'Identify priority sectors aligned with your investment mandate',
            'Evaluate entry mechanisms (JV vs greenfield vs PE)',
            'Quantify regional market access (ECOWAS 350M, AfCFTA 1.3B)',
            'Assess risk-adjusted returns by sector',
          ],
        },
      ],
      dataSources: ['World Bank', 'FDI Markets', 'VC Databases', 'Trade Agreements'],
    },
    relatedTerms: ['tech_sector_opportunity', 'agriculture_opportunity', 'infrastructure_opportunity'],
    tags: ['opportunity', 'investment', 'entry', 'strategy'],
  },

  tech_sector_opportunity: {
    termKey: 'tech_sector_opportunity',
    termLabel: 'Technology Sector Opportunity',
    category: 'opportunity',
    tooltipShort: 'Africa\'s leading tech hub with $40B+ fintech transactions, 60% mobile money penetration, and critical mass in AgriTech, EdTech, and e-commerce.',
    modal: {
      title: 'Technology Sector Investment Opportunity',
      summary: 'Nigeria\'s technology ecosystem has reached critical mass, with Lagos as Africa\'s premier tech hub. The sector offers high-growth opportunities in fintech, AgriTech, EdTech, and e-commerce infrastructure.',
      sections: [
        {
          heading: 'Market Dynamics',
          content: 'Key growth drivers:',
          list: [
            'Fintech processed $40B in 2025, growing 35% YoY',
            '60% mobile money penetration (125M+ active users)',
            '45M school-age population driving EdTech demand',
            'Lagos tech ecosystem: 4 unicorns, 200+ funded startups',
          ],
        },
        {
          heading: 'Investment Focus Areas',
          content: 'High-potential subsectors:',
          list: [
            'Fintech Infrastructure: Payment gateways, digital banking, BNPL',
            'AgriTech: Supply chain digitization, farmer financing platforms',
            'EdTech: Online learning, vocational training, K-12 solutions',
            'E-commerce: Last-mile logistics, warehousing, B2B marketplaces',
          ],
        },
        {
          heading: 'Entry Strategies',
          content: 'Recommended approaches:',
          list: [
            'Series B-C PE/VC: Mid-market tech companies with proven models',
            'Strategic Partnerships: Co-develop with Nigerian fintechs',
            'Acqui-hires: Access talent and local market knowledge',
          ],
        },
      ],
      dataSources: ['Partech Africa Report', 'GSMA Mobile Money', 'Crunchbase'],
    },
    relatedTerms: ['opportunity_overview', 'agriculture_opportunity', 'regional_advantages'],
    tags: ['technology', 'fintech', 'agritech', 'edtech'],
  },

  agriculture_opportunity: {
    termKey: 'agriculture_opportunity',
    termLabel: 'Agricultural Value-Add Opportunity',
    category: 'opportunity',
    tooltipShort: 'Africa\'s largest agricultural producer imports $10B in processed food annually. Major value-add opportunities in cassava, cocoa, rice, and cold chain infrastructure.',
    modal: {
      title: 'Agricultural Value-Add Investment Opportunity',
      summary: 'Nigeria is Africa\'s largest agricultural producer but imports $10B in processed food annually. Investment opportunities focus on value-added processing, export-oriented agriculture, and cold chain infrastructure.',
      sections: [
        {
          heading: 'Market Opportunity',
          content: 'Key value-add gaps:',
          list: [
            'Cassava: 60M tons/year production, minimal value-add exports',
            'Cocoa: 3rd largest producer globally, 70% exported raw',
            'Rice: $2B import gap for milled rice',
            'Post-Harvest Losses: 95% preventable with cold chain infrastructure',
          ],
        },
        {
          heading: 'Investment Focus Areas',
          content: 'High-impact sectors:',
          list: [
            'Cassava Processing: Starch, flour, ethanol production',
            'Cocoa Value Chain: Butter, powder, chocolate manufacturing',
            'Rice Milling: Modern mills to close import gap',
            'Cold Chain: Storage, refrigerated transport, processing facilities',
          ],
        },
        {
          heading: 'Entry Strategies',
          content: 'Recommended approaches:',
          list: [
            'Joint Ventures: Partner with Dangote, BUA, Flour Mills for distribution',
            'Greenfield Projects: SEZ incentives (tax holidays, repatriation guarantees)',
            'Off-take Agreements: Secure raw material supply from smallholder aggregators',
          ],
        },
      ],
      dataSources: ['FAO', 'USDA', 'National Agricultural Statistics', 'Trade Data'],
    },
    relatedTerms: ['opportunity_overview', 'infrastructure_opportunity', 'investment_entry_points'],
    tags: ['agriculture', 'value-add', 'processing', 'cassava', 'cocoa'],
  },

  infrastructure_opportunity: {
    termKey: 'infrastructure_opportunity',
    termLabel: 'Infrastructure Development Opportunity',
    category: 'opportunity',
    tooltipShort: '$15B infrastructure pipeline (2025-2028) across power (25GW target), ports, rail, and housing (20M unit deficit).',
    modal: {
      title: 'Infrastructure Investment Opportunity',
      summary: 'Nigeria has a $15B infrastructure pipeline from 2025-2028 covering power generation, port modernization, rail development, and housing. Opportunities span PPP structures, EPC contracts, and equity stakes.',
      sections: [
        {
          heading: 'Pipeline Overview',
          content: 'Priority infrastructure projects:',
          list: [
            'Power: 25GW generation target by 2030 (current: 5GW)',
            'Ports: Lekki Deep Sea Port Phase 2, Warri Port modernization',
            'Rail: Lagos-Kano standard gauge railway (1,315km)',
            'Housing: 20M unit deficit, urbanization at 3.5%/year',
          ],
        },
        {
          heading: 'Investment Mechanisms',
          content: 'Entry strategies by sub-sector:',
          list: [
            'Power: Independent Power Producer (IPP) licenses, solar/gas projects',
            'Ports: Terminal operating concessions, logistics hubs',
            'Rail: Rolling stock supply, maintenance contracts',
            'Housing: Affordable housing PPPs, mortgage finance',
          ],
        },
        {
          heading: 'Risk Mitigation',
          content: 'Key considerations:',
          list: [
            'PPP Structures: Nigerian Sovereign Investment Authority co-investment',
            'Currency Risk: Hard currency revenue streams (port concessions)',
            'Execution Risk: International EPC contractors, escrow accounts',
          ],
        },
      ],
      dataSources: ['World Bank', 'AfDB', 'Federal Ministry of Works', 'ICRC'],
    },
    relatedTerms: ['opportunity_overview', 'agriculture_opportunity', 'investment_entry_points'],
    tags: ['infrastructure', 'power', 'ports', 'rail', 'housing'],
  },

  investment_entry_points: {
    termKey: 'investment_entry_points',
    termLabel: 'Investment Entry Points',
    category: 'opportunity',
    tooltipShort: 'Four primary entry mechanisms: Joint ventures with Nigerian conglomerates, PE/VC in mid-market tech, greenfield SEZ projects, and NSE-listed equities.',
    modal: {
      title: 'Investment Entry Strategies',
      summary: 'Nigeria offers multiple entry mechanisms tailored to risk appetite, capital size, and sector focus. Each approach balances market access, operational control, and risk mitigation.',
      sections: [
        {
          heading: 'Entry Mechanism Comparison',
          content: 'Four primary approaches:',
          subsections: [
            {
              title: '1. Joint Ventures (JVs)',
              points: [
                'Partner with Nigerian conglomerates (Dangote, BUA, Flour Mills)',
                'Best for: Manufacturing, agriculture, distribution',
                'Pros: Established supply chains, political relationships, local expertise',
                'Cons: Shared control, partner risk',
              ],
            },
            {
              title: '2. Private Equity / Venture Capital',
              points: [
                'Target mid-market tech companies (Series B-C)',
                'Best for: Fintech, AgriTech, EdTech, logistics',
                'Pros: Proven business models, regional expansion potential',
                'Cons: Valuation premiums, exit liquidity',
              ],
            },
            {
              title: '3. Greenfield Projects in SEZs',
              points: [
                'Special Economic Zones offer tax holidays, repatriation guarantees',
                'Best for: Export-oriented manufacturing, processing',
                'Pros: Full operational control, tax benefits',
                'Cons: Higher execution risk, longer payback',
              ],
            },
            {
              title: '4. Listed Equities (NSE)',
              points: [
                'Nigerian Stock Exchange for blue-chip exposure',
                'Best for: Banking, consumer goods, industrial sectors',
                'Pros: Liquidity, transparency, portfolio diversification',
                'Cons: Market volatility, limited operational influence',
              ],
            },
          ],
        },
        {
          heading: 'Sector-Specific Recommendations',
          content: 'Optimal entry by sector:',
          list: [
            'Technology: PE/VC for growth-stage companies',
            'Agriculture: JVs with local processors + greenfield SEZ projects',
            'Infrastructure: PPP structures with international consortium',
            'Financial Services: Listed equities for portfolio exposure',
          ],
        },
      ],
      dataSources: ['FDI Markets', 'NSE', 'NEPZA (SEZ Authority)', 'VC Databases'],
    },
    relatedTerms: ['opportunity_overview', 'regional_advantages'],
    tags: ['entry', 'strategy', 'joint-venture', 'pe-vc', 'sez'],
  },

  regional_advantages: {
    termKey: 'regional_advantages',
    termLabel: 'Regional Market Advantages',
    category: 'opportunity',
    tooltipShort: 'Nigeria offers ECOWAS access (350M people), AfCFTA duty-free access (1.3B consumers), AGOA eligibility (U.S. exports), and 200K+ English-speaking graduates annually.',
    modal: {
      title: 'Regional Market Advantages',
      summary: 'Nigeria\'s strategic location and trade agreements provide access to 1.3B+ consumers across Africa and duty-free exports to the U.S. The country also benefits from a large, English-speaking skilled workforce.',
      sections: [
        {
          heading: 'Trade Agreement Access',
          content: 'Key market access mechanisms:',
          subsections: [
            {
              title: 'ECOWAS (Economic Community of West African States)',
              points: [
                'Access to 350M people across 15 West African countries',
                'Duty-free trade within the bloc',
                'Common External Tariff (CET) for third-party imports',
                'Best for: Regional manufacturing hubs, distribution networks',
              ],
            },
            {
              title: 'AfCFTA (African Continental Free Trade Area)',
              points: [
                'Duty-free access to 1.3B African consumers',
                'Largest free trade area by member countries (54 nations)',
                '90% of tariffs eliminated by 2030',
                'Best for: Pan-African value chains, export-oriented production',
              ],
            },
            {
              title: 'AGOA (African Growth and Opportunity Act)',
              points: [
                'Duty-free exports to U.S. market through 2025 (extension likely)',
                'Covers 6,500+ product categories',
                'Particularly valuable for textiles, agriculture, manufacturing',
                'Best for: U.S.-focused export strategies',
              ],
            },
          ],
        },
        {
          heading: 'Workforce Advantage',
          content: 'Nigeria offers a large, skilled, English-speaking workforce:',
          list: [
            '200,000+ university graduates annually',
            'English as official language (business, education, legal)',
            'Strong tech talent pool (Lagos is Africa\'s tech hub)',
            'Lower labor costs vs. South Africa, Kenya',
          ],
        },
        {
          heading: 'Strategic Positioning',
          content: 'Competitive advantages for regional operations:',
          list: [
            'Gateway to West Africa: Lagos port handles 60% of regional trade',
            'Population scale: 220M domestic market + 350M ECOWAS',
            'Currency dynamics: Naira devaluation improves export competitiveness',
            'Infrastructure: Lekki Deep Sea Port (largest in West Africa)',
          ],
        },
      ],
      dataSources: ['ECOWAS Secretariat', 'AfCFTA', 'USTR (AGOA)', 'World Bank'],
    },
    relatedTerms: ['opportunity_overview', 'investment_entry_points', 'agoa', 'afcfta'],
    tags: ['trade', 'ecowas', 'afcfta', 'agoa', 'regional'],
  },

  // ==========================================
  // RISK TAB
  // ==========================================

  risk_overview: {
    termKey: 'risk_overview',
    termLabel: 'Risk Landscape Overview',
    category: 'risk',
    tooltipShort: 'Comprehensive risk analysis covering macro, political, and operational risks with proven mitigation frameworks for emerging market investors.',
    modal: {
      title: 'Risk Landscape Analysis',
      summary: 'Souvera\'s Risk Landscape provides a balanced assessment of macro, political, and operational risks, contextualized by structural reforms and proven mitigation strategies. Our framework helps investors understand not just the risks, but how to manage them effectively.',
      sections: [
        {
          heading: 'Risk Assessment Framework',
          content: 'Our risk analysis evaluates three core categories:',
          list: [
            'Macro Risks: Currency volatility, inflation, debt sustainability',
            'Political Risks: Governance, security, corruption perception',
            'Operational Risks: Power supply, logistics, talent retention',
            'Sector-Specific Risks: Industry-level challenges and opportunities',
          ],
        },
        {
          heading: 'Risk Ratings Explained',
          content: 'We use a five-tier risk classification system:',
          list: [
            'LOW: Minimal risk, well-managed fundamentals',
            'LOW-MODERATE: Below emerging market averages',
            'MODERATE: Typical for emerging markets, manageable',
            'MODERATE-HIGH: Above EM average, requires active mitigation',
            'HIGH: Significant risk, specialist expertise required',
          ],
        },
        {
          heading: 'How to Use This Intelligence',
          content: 'Leverage risk analysis to:',
          list: [
            'Identify priority risks for your sector and business model',
            'Evaluate mitigation strategies (partnerships, insurance, phasing)',
            'Benchmark risk-adjusted returns vs. other emerging markets',
            'Build operational playbooks for risk management',
          ],
        },
      ],
      dataSources: ['World Bank', 'IMF', 'Transparency International', 'Political Risk Services'],
    },
    relatedTerms: ['macro_risks', 'political_risks', 'operational_risks', 'risk_mitigation'],
    tags: ['risk', 'assessment', 'mitigation', 'emerging-markets'],
  },

  macro_risks: {
    termKey: 'macro_risks',
    termLabel: 'Macro Risks',
    category: 'risk',
    tooltipShort: 'Currency volatility (naira depreciation), inflation (18.2%, declining from 24.5% peak), and debt sustainability (42.1% debt-to-GDP, below IMF threshold).',
    modal: {
      title: 'Macro Risk Assessment',
      summary: 'Nigeria\'s macro risks center on currency volatility, elevated inflation, and debt sustainability. While challenges exist, Central Bank reforms, fiscal discipline, and structural adjustments are stabilizing the environment.',
      sections: [
        {
          heading: 'Currency Volatility (MODERATE)',
          content: 'Naira depreciation and exchange rate management:',
          list: [
            'Post-2023 unification: Naira depreciated 461 → 1,450 NGN/USD',
            'Volatility stabilized since Q4 2024 (managed float regime)',
            'CBN maintains $37B reserves (6 months import cover)',
            'Mitigation: Hedging instruments, hard currency revenue, natural hedges',
          ],
        },
        {
          heading: 'Inflation (MODERATE-HIGH)',
          content: 'Inflation dynamics and monetary policy response:',
          list: [
            'Current: 18.2% (2025), down from 24.5% peak (2023)',
            'Drivers: Food insecurity (agricultural shocks), imported inflation',
            'CBN response: Monetary tightening (18.5% interest rates)',
            'Mitigation: Agricultural reforms, mechanization, security improvements',
          ],
        },
        {
          heading: 'Debt Sustainability (LOW-MODERATE)',
          content: 'Fiscal position and debt management:',
          list: [
            'Debt-to-GDP: 42.1% (2025), below IMF 55% EM threshold',
            'External debt service: 11% of exports (manageable)',
            'Fiscal reforms: VAT expansion, tax compliance improvements',
            'Rating: Investment-grade trajectory if reforms continue',
          ],
        },
      ],
      dataSources: ['Central Bank of Nigeria', 'IMF', 'World Bank', 'Debt Management Office'],
    },
    relatedTerms: ['risk_overview', 'political_risks', 'operational_risks'],
    tags: ['macro', 'currency', 'inflation', 'debt', 'fiscal'],
  },

  political_risks: {
    termKey: 'political_risks',
    termLabel: 'Political Risks',
    category: 'risk',
    tooltipShort: 'Governance stability (25 years democracy, 7 peaceful transitions), regional security issues (Boko Haram, banditry), and corruption challenges (rank 145/180).',
    modal: {
      title: 'Political Risk Assessment',
      summary: 'Nigeria\'s political landscape features mature democratic institutions (25 years, 7 peaceful transitions) alongside challenges including regional security concerns, governance quality, and corruption. Strong institutions (CBN independence, judiciary) and international oversight provide stabilizing factors.',
      sections: [
        {
          heading: 'Governance & Stability (MODERATE)',
          content: 'Democratic maturity with persistent challenges:',
          list: [
            'Democracy: 25 years, 7 peaceful presidential transitions',
            'Next election: 2027 (policy continuity watchpoint)',
            'Transparency International: Rank 145/180 (improving)',
            'Mitigation: Strong institutions (CBN, judiciary), IMF/World Bank oversight',
          ],
        },
        {
          heading: 'Security Concerns (REGIONAL)',
          content: 'Localized security issues vary by region:',
          list: [
            'Northeast: Boko Haram insurgency (improving, military gains)',
            'Northwest: Banditry in farming regions (impacts agriculture)',
            'Southeast: Secessionist movements (localized, low intensity)',
            'Commercial hubs (Lagos, Abuja): Stable, strong security presence',
          ],
        },
        {
          heading: 'Mitigating Factors',
          content: 'Institutional and structural safeguards:',
          list: [
            'Central Bank independence: Credible monetary policy',
            'Independent judiciary: Contract enforcement, dispute resolution',
            'Private sector resilience: Nigerian conglomerates weathered volatility cycles',
            'International engagement: IMF programs, World Bank support',
          ],
        },
      ],
      dataSources: ['Transparency International', 'World Bank Governance Indicators', 'Political Risk Services', 'U.S. State Department'],
    },
    relatedTerms: ['risk_overview', 'macro_risks', 'operational_risks'],
    tags: ['political', 'governance', 'security', 'corruption', 'stability'],
  },

  operational_risks: {
    termKey: 'operational_risks',
    termLabel: 'Operational Risks',
    category: 'risk',
    tooltipShort: 'Power supply instability (15-25% added costs for self-generation), logistics challenges (10-14 day port clearance), and talent retention (brain drain to U.S./Europe).',
    modal: {
      title: 'Operational Risk Assessment',
      summary: 'Nigeria\'s operational environment presents challenges in power supply, logistics, and talent retention. However, established business practices (self-generation, Lagos/Abuja focus, competitive compensation) have proven effective in mitigating these risks.',
      sections: [
        {
          heading: 'Power Supply (HIGH IMPACT)',
          content: 'Grid instability requires operational adjustments:',
          list: [
            'Challenge: Grid instability requires self-generation (diesel/solar)',
            'Cost impact: 15-25% additional operating costs',
            'Regional variation: Lagos/Abuja grids more reliable than national grid',
            'Mitigation: Solar/diesel backup standard practice, power reforms underway',
          ],
        },
        {
          heading: 'Logistics (MODERATE)',
          content: 'Port and transport infrastructure challenges:',
          list: [
            'Port congestion: 10-14 days average clearance time',
            'Road quality: Variable; Lagos-Abuja corridor well-maintained',
            'Infrastructure improvements: Lekki Deep Sea Port operational',
            'Mitigation: Pre-clearance processes, bonded warehouses, Lagos focus',
          ],
        },
        {
          heading: 'Talent Retention (MODERATE)',
          content: 'Skilled workforce management:',
          list: [
            'Challenge: Brain drain to Europe/U.S./Canada (tech, professional services)',
            'Impact: Upward salary pressure, training costs',
            'Opportunity: 200K+ university graduates annually (large talent pool)',
            'Mitigation: Competitive salaries, equity participation, career development',
          ],
        },
        {
          heading: 'Sector-Specific Considerations',
          content: 'Operational risks vary by sector:',
          list: [
            'Agriculture: Climate vulnerability, land tenure disputes, insurgency (NW)',
            'Technology: Regulatory uncertainty (data protection, fintech licensing)',
            'Infrastructure: Execution risk (project delays), political interference',
            'Manufacturing: Power costs, input sourcing, customs clearance',
          ],
        },
      ],
      dataSources: ['World Bank Doing Business', 'Nigerian Ports Authority', 'Business Climate Surveys', 'Sector Associations'],
    },
    relatedTerms: ['risk_overview', 'macro_risks', 'political_risks'],
    tags: ['operational', 'power', 'logistics', 'talent', 'infrastructure'],
  },

  risk_mitigation: {
    termKey: 'risk_mitigation',
    termLabel: 'Risk Mitigation Strategies',
    category: 'risk',
    tooltipShort: 'Proven mitigation frameworks: local partnerships, insurance products (political risk, currency, credit), revenue diversification, and phased capital deployment.',
    modal: {
      title: 'Risk Mitigation Strategies',
      summary: 'Effective risk management in Nigeria relies on four core strategies: local partnerships with established conglomerates, comprehensive insurance products, revenue diversification across domestic and export markets, and phased capital deployment to validate business models before scaling.',
      sections: [
        {
          heading: 'Strategy 1: Local Partnerships',
          content: 'Partner with Nigerian conglomerates for risk mitigation:',
          list: [
            'Key partners: Dangote Group, BUA Group, Flour Mills of Nigeria',
            'Benefits: Political relationships, established supply chains, operational expertise',
            'Applications: Manufacturing JVs, distribution networks, regulatory navigation',
            'Structure: Equity partnerships, licensing agreements, supplier relationships',
          ],
        },
        {
          heading: 'Strategy 2: Insurance Products',
          content: 'Comprehensive insurance coverage options:',
          list: [
            'Political Risk Insurance: MIGA, OPIC, private insurers (AIG, Zurich)',
            'Currency Hedging: Forward contracts, options, natural hedges',
            'Credit Insurance: Trade credit, supplier default coverage',
            'Coverage: Expropriation, political violence, breach of contract',
          ],
        },
        {
          heading: 'Strategy 3: Revenue Diversification',
          content: 'Balance domestic and export markets:',
          list: [
            'Hard currency revenue: Exports, diaspora remittances, dollar-denominated contracts',
            'Import substitution: Reduce currency exposure through local sourcing',
            'Regional diversification: ECOWAS markets, AfCFTA opportunities',
            'Customer base: Mix of multinationals, local corporates, SMEs',
          ],
        },
        {
          heading: 'Strategy 4: Phased Capital Deployment',
          content: 'De-risk through staged investment:',
          list: [
            'Phase 1: Pilot operations (validate business model, establish operations)',
            'Phase 2: Scale based on demonstrated ROI (expand capacity, add products)',
            'Phase 3: Full deployment (regional expansion, value chain integration)',
            'Metrics: ROI thresholds, operational KPIs, market validation milestones',
          ],
        },
        {
          heading: 'Investment Horizon Considerations',
          content: 'Risk mitigation aligned with timeline:',
          list: [
            'Short-term (1-3 years): Trade finance, working capital, asset-light models',
            'Medium-term (3-7 years): Greenfield projects, capacity expansion, market development',
            'Long-term (7+ years): Infrastructure, large manufacturing, institutional partnerships',
            'Patient capital: Risk-adjusted returns compelling for 5-7 year horizons',
          ],
        },
      ],
      dataSources: ['MIGA', 'OPIC', 'Private Insurance Providers', 'Investment Case Studies'],
    },
    relatedTerms: ['risk_overview', 'macro_risks', 'political_risks', 'operational_risks'],
    tags: ['mitigation', 'insurance', 'partnerships', 'phasing', 'strategy'],
  },

  // ==========================================
  // TRADE TAB
  // ==========================================

  trade_overview: {
    termKey: 'trade_overview',
    termLabel: 'Trade & Market Access Overview',
    category: 'trade',
    tooltipShort: 'Comprehensive bilateral trade analysis covering exports ($48.2B), imports ($14.5B), AGOA benefits, and regional integration (AfCFTA, ECOWAS).',
    modal: {
      title: 'Trade & Market Access Intelligence',
      summary: 'Nigeria\'s trade landscape combines robust export capacity (primarily crude oil), strategic trade agreements (AGOA, AfCFTA, ECOWAS), and growing regional integration. The country serves as West Africa\'s trade gateway with access to 1.3B+ African consumers.',
      sections: [
        {
          heading: 'Trade Profile',
          content: 'Nigeria\'s trade fundamentals:',
          list: [
            'Total Trade: $62.7B (2025) - Exports $48.2B, Imports $14.5B',
            'Trade Surplus: $33.7B driven by crude oil exports',
            'Export Concentration: 82% crude oil/gas (commodity-dependent)',
            'Top Partners: China (#1 $22.3B), U.S. (#2 $7.3B), EU (#3 $12.8B)',
          ],
        },
        {
          heading: 'Strategic Trade Advantages',
          content: 'Market access mechanisms:',
          list: [
            'AGOA: Duty-free U.S. access for 6,500+ products (through 2025+)',
            'AfCFTA: 1.3B consumer market, 90% tariff elimination by 2030',
            'ECOWAS: 350M regional market, duty-free trade within West Africa',
            'Gateway Position: Lagos port handles 60% of West African trade',
          ],
        },
        {
          heading: 'How to Use This Intelligence',
          content: 'Leverage trade data for:',
          list: [
            'Export Strategy: Identify AGOA-eligible products, target U.S. buyers',
            'Import Optimization: Understand tariffs, customs, logistics',
            'Regional Expansion: AfCFTA duty-free opportunities across Africa',
            'Partner Selection: Align with trade flows (China machinery, U.S. equipment)',
          ],
        },
      ],
      dataSources: ['UN Comtrade', 'World Bank WITS', 'USTR', 'Nigerian Customs Service'],
    },
    relatedTerms: ['us_trade_relationship', 'agoa_detailed', 'regional_trade_agreements'],
    tags: ['trade', 'exports', 'imports', 'bilateral', 'market-access'],
  },

  us_trade_relationship: {
    termKey: 'us_trade_relationship',
    termLabel: 'U.S. Trade Relationship',
    category: 'trade',
    tooltipShort: 'U.S. is Nigeria\'s #2 trade partner ($7.3B total trade), with $5.2B exports (crude oil, cocoa, sesame) and $2.1B imports (machinery, vehicles). AGOA-eligible.',
    modal: {
      title: 'U.S.-Nigeria Trade Relationship',
      summary: 'The United States is Nigeria\'s second-largest trade partner with $7.3B in total trade (2025). The relationship is strengthened by AGOA eligibility, providing duty-free access to the U.S. market for 6,500+ product categories.',
      sections: [
        {
          heading: 'Trade Flow Summary',
          content: 'Bilateral trade dynamics:',
          list: [
            'Total Trade: $7.3B (2025), up 10% YoY',
            'U.S. Exports to Nigeria: $5.2B (crude oil 68%, cocoa 9%, sesame 5%)',
            'U.S. Imports from Nigeria: $2.1B (machinery 32%, vehicles 18%, cereals 14%)',
            'Trade Balance: $3.1B surplus in Nigeria\'s favor',
          ],
        },
        {
          heading: 'AGOA Status',
          content: 'Nigeria is AGOA-eligible through 2025 (extension likely):',
          list: [
            'Current Utilization: 68% of eligible exports use AGOA preferences',
            'AGOA Exports: $3.5B (2025), representing 67% of total U.S. exports',
            'Duty Savings: Estimated $280M+ annually on tariff elimination',
            'Eligible Sectors: Textiles, agriculture, footwear, manufacturing',
          ],
        },
        {
          heading: 'Investment Implications',
          content: 'Strategic considerations:',
          list: [
            'Export-Oriented Manufacturing: AGOA incentivizes U.S.-destined production',
            'Value-Add Processing: Convert raw materials (cocoa, sesame) before export',
            'Supply Chain Integration: U.S. imports (machinery) support local manufacturing',
            'Policy Risk: AGOA renewal in 2025 (high likelihood of extension)',
          ],
        },
      ],
      dataSources: ['USTR', 'U.S. Census Bureau', 'AGOA.gov', 'Nigerian Customs'],
    },
    relatedTerms: ['trade_overview', 'agoa_detailed', 'regional_trade_agreements'],
    tags: ['us-trade', 'bilateral', 'agoa', 'exports', 'imports'],
  },

  agoa_detailed: {
    termKey: 'agoa_detailed',
    termLabel: 'AGOA Trade Advantage',
    category: 'trade',
    tooltipShort: 'African Growth and Opportunity Act provides duty-free U.S. access for 6,500+ products. Nigeria exports $3.5B under AGOA (68% utilization rate), saving $280M+ in tariffs annually.',
    modal: {
      title: 'AGOA Trade Advantage - Detailed Analysis',
      summary: 'The African Growth and Opportunity Act (AGOA) is the cornerstone of U.S.-Africa trade policy, granting duty-free access to the U.S. market for over 6,500 product categories from eligible sub-Saharan African countries. Nigeria has been AGOA-eligible since 2000.',
      sections: [
        {
          heading: 'AGOA Fundamentals',
          content: 'Program structure and benefits:',
          list: [
            'Enacted: 2000, renewed multiple times (current through 2025)',
            'Eligible Products: 6,500+ categories (textiles, agriculture, manufacturing)',
            'Beneficiary Countries: 40+ sub-Saharan African nations',
            'Key Benefit: Duty-free + quota-free access to $23 trillion U.S. market',
          ],
        },
        {
          heading: 'Nigeria\'s AGOA Performance',
          content: 'Utilization and impact:',
          list: [
            'AGOA Exports: $3.5B (2025), 68% of eligible exports',
            'Utilization Rate: 68% (above Africa average of 55%)',
            'Top AGOA Exports: Crude oil (57%), cocoa (11%), sesame seeds (7%)',
            'Duty Savings: $280M+ annually on eliminated tariffs',
          ],
        },
        {
          heading: 'Sector-Specific AGOA Benefits',
          content: 'Key opportunities by sector:',
          subsections: [
            {
              title: 'Textiles & Apparel',
              points: [
                'Third-Country Fabric Rule: Use fabric from anywhere (not just Africa/U.S.)',
                'Duty Elimination: 15-32% tariffs removed on apparel',
                'Opportunity: Ethiopia model - build export-oriented garment industry',
              ],
            },
            {
              title: 'Agriculture',
              points: [
                'Eligible: Cocoa, sesame, cashews, shea, rubber, spices',
                'Advantage: Compete duty-free vs. non-AGOA suppliers',
                'Value-Add: Process raw materials (cocoa → chocolate) for higher margins',
              ],
            },
            {
              title: 'Manufacturing',
              points: [
                'Eligible: Chemicals, plastics, machinery, auto parts',
                'Opportunity: Regional hub for U.S.-destined manufacturing',
                'Requirement: Rules of origin (35% African/U.S. content)',
              ],
            },
          ],
        },
        {
          heading: '2025 Renewal & Beyond',
          content: 'Policy outlook:',
          list: [
            'Current Expiry: September 30, 2025',
            'Renewal Likelihood: HIGH - bipartisan U.S. support',
            'Proposed Extension: Through 2035 (10-year renewal)',
            'Strategic Implication: Long-term AGOA access likely, plan accordingly',
          ],
        },
        {
          heading: 'How to Leverage AGOA',
          content: 'Practical steps for exporters:',
          list: [
            'Product Eligibility: Check HTS codes at AGOA.gov',
            'Rules of Origin: Ensure 35% African/U.S. content requirement met',
            'Customs Documentation: Certificate of Origin, commercial invoice',
            'Market Entry: Partner with U.S. importers, attend AGOA trade shows',
          ],
        },
      ],
      dataSources: ['USTR', 'AGOA.gov', 'U.S. International Trade Commission', 'USAID'],
    },
    relatedTerms: ['us_trade_relationship', 'trade_overview', 'regional_trade_agreements'],
    tags: ['agoa', 'duty-free', 'us-market', 'textiles', 'agriculture', 'manufacturing'],
  },

  regional_trade_agreements: {
    termKey: 'regional_trade_agreements',
    termLabel: 'Regional Trade Agreements',
    category: 'trade',
    tooltipShort: 'Nigeria benefits from AfCFTA (1.3B consumers, 90% tariff elimination by 2030) and ECOWAS (350M people, duty-free West African trade).',
    modal: {
      title: 'Regional Trade Agreements',
      summary: 'Nigeria participates in two major African trade agreements: the African Continental Free Trade Area (AfCFTA) and the Economic Community of West African States (ECOWAS). Together, these provide duty-free access to 1.3B+ consumers across Africa.',
      sections: [
        {
          heading: 'AfCFTA (African Continental Free Trade Area)',
          content: 'World\'s largest free trade area by member count:',
          list: [
            'Launched: January 2021 (trading phase started July 2022)',
            'Member Countries: 54 African nations (1.3B population)',
            'Tariff Elimination: 90% of goods by 2030, 97% by 2033',
            'Nigeria\'s Role: Largest economy in AfCFTA, manufacturing hub potential',
          ],
        },
        {
          heading: 'AfCFTA Opportunities for Nigeria',
          content: 'Strategic advantages:',
          list: [
            'Manufacturing Hub: Duty-free exports to 53 African countries',
            'Value Chain Integration: Pan-African production networks',
            'Import Substitution: Produce for African market, not import from Asia/Europe',
            'Rules of Origin: 30-45% African content requirement (boosts local industry)',
          ],
        },
        {
          heading: 'ECOWAS (Economic Community of West African States)',
          content: 'Regional trade bloc fundamentals:',
          list: [
            'Established: 1975, customs union since 2015',
            'Member Countries: 15 West African nations (350M population)',
            'Trade Status: Duty-free for goods originating in ECOWAS',
            'Nigeria\'s Role: 60% of ECOWAS GDP, regional hegemon',
          ],
        },
        {
          heading: 'ECOWAS Benefits for Nigeria',
          content: 'Regional dominance advantages:',
          list: [
            'Captive Market: 350M consumers in West Africa',
            'Distribution Hub: Lagos port serves entire region',
            'Industrial Exports: Nigerian manufacturing (cement, food, textiles) to ECOWAS',
            'Border Trade: Overland exports to Benin, Niger, Chad (informal + formal)',
          ],
        },
        {
          heading: 'Strategic Recommendations',
          content: 'How to leverage regional agreements:',
          list: [
            'Target AfCFTA: Focus on East/Southern Africa markets (Kenya, South Africa)',
            'Optimize ECOWAS: Strengthen regional distribution for FMCG, cement, textiles',
            'Rules of Origin: Ensure compliance to access duty-free benefits',
            'Supply Chain: Build pan-African value chains (raw materials → processing → export)',
          ],
        },
      ],
      dataSources: ['AfCFTA Secretariat', 'ECOWAS Commission', 'African Union', 'Afreximbank'],
    },
    relatedTerms: ['trade_overview', 'us_trade_relationship', 'agoa_detailed'],
    tags: ['afcfta', 'ecowas', 'regional-trade', 'duty-free', 'africa'],
  },

  // ==========================================
  // REPORTS TAB
  // ==========================================

  reports_overview: {
    termKey: 'reports_overview',
    termLabel: 'Intelligence Reports Overview',
    category: 'reports',
    tooltipShort: 'Generate pre-built reports (Country Profile, Investment Memo, Trade Profile) or create AI-powered custom reports tailored to your specific use case.',
    modal: {
      title: 'Intelligence Reports System',
      summary: 'Souvera\'s reporting platform transforms raw intelligence into actionable documents. Choose from pre-built reports for quick insights or leverage AI to generate custom reports addressing your specific investment questions.',
      sections: [
        {
          heading: 'Report Types',
          content: 'Three tiers of intelligence delivery:',
          subsections: [
            {
              title: 'Pre-Built Reports (Professional+)',
              points: [
                'Country Profile: 4-6 pages, weekly updates',
                'Investment Memo: 8-12 pages, monthly updates (Business+)',
                'Trade Profile: 6-8 pages, quarterly updates (Business+)',
                'Sector Deep-Dive: 10-15 pages, monthly updates (Business+)',
              ],
            },
            {
              title: 'AI-Powered Custom Reports (Business+)',
              points: [
                'Natural language queries (e.g., "Should we open a Lagos fintech?")',
                'Synthesizes data from all 7 tabs',
                'Tailored to budget, timeline, risk appetite',
                'Generates executive summaries + financial models',
              ],
            },
            {
              title: 'Curated Newsletter (All tiers)',
              points: [
                'Weekly Briefing: Key developments, sector updates',
                'Monthly Deep-Dive: Comprehensive sector analysis',
                'Admin-curated content from intelligence team',
              ],
            },
          ],
        },
        {
          heading: 'Export Formats',
          content: 'Multi-format delivery:',
          list: [
            'PDF: Professional formatting with Souvera branding',
            'Word: Editable documents for internal customization',
            'PowerPoint: Presentation-ready slides (Institutional)',
            'Excel: Data tables and financial models (Institutional)',
          ],
        },
        {
          heading: 'Institutional Features',
          content: 'Enterprise-grade capabilities:',
          list: [
            'White-Label: Custom branding (logo, colors, fonts)',
            'API Access: Automated report generation',
            'Team Collaboration: Annotations, approvals, version control',
            'Scheduled Delivery: Automated inbox delivery',
          ],
        },
      ],
      dataSources: ['All Souvera Intelligence Tabs', 'GPT-4 AI Engine', 'External Data Sources'],
    },
    relatedTerms: ['ai_custom_reports', 'newsletter_subscription'],
    tags: ['reports', 'pdf', 'ai', 'custom', 'export'],
  },

  ai_custom_reports: {
    termKey: 'ai_custom_reports',
    termLabel: 'AI-Powered Custom Reports',
    category: 'reports',
    tooltipShort: 'GPT-4 generates tailored reports by synthesizing data from all tabs to answer your specific investment questions (e.g., "Should we open a Lagos manufacturing plant?").',
    modal: {
      title: 'AI-Powered Custom Reports',
      summary: 'Souvera\'s AI Custom Reports leverage GPT-4 to transform your specific investment questions into comprehensive, data-backed intelligence documents. Unlike static pre-built reports, AI synthesizes insights from across all tabs to address your unique use case.',
      sections: [
        {
          heading: 'How It Works',
          content: 'Four-step intelligence generation:',
          list: [
            '1. Query: Describe your investment question in natural language',
            '2. Context: Provide budget, timeline, sector, risk appetite',
            '3. Synthesis: AI pulls relevant data from all 7 tabs + external sources',
            '4. Generation: Creates custom report with executive summary, analysis, recommendations',
          ],
        },
        {
          heading: 'Example Use Cases',
          content: 'Real-world applications:',
          subsections: [
            {
              title: 'Market Entry Decision',
              points: [
                'Query: "Should we open a fintech subsidiary in Lagos?"',
                'AI analyzes: Tech sector ($40B transactions), regulatory environment, talent pool, power costs',
                'Output: Go/no-go recommendation with 3-year financial model',
              ],
            },
            {
              title: 'Trade Feasibility Study',
              points: [
                'Query: "Evaluate AGOA-eligible textile manufacturing in Nigeria"',
                'AI analyzes: AGOA benefits, labor costs, infrastructure, logistics',
                'Output: Feasibility assessment with tariff savings and ROI projections',
              ],
            },
            {
              title: 'Comparative Analysis',
              points: [
                'Query: "Compare Nigeria vs. Kenya for agricultural value-add investment"',
                'AI analyzes: Cross-country data on agriculture, costs, trade access',
                'Output: Side-by-side comparison with recommendation',
              ],
            },
          ],
        },
        {
          heading: 'AI Capabilities',
          content: 'Advanced intelligence features:',
          list: [
            'Multi-Tab Synthesis: Connects insights across Overview, Economy, Sectors, Risk, Trade',
            'Source Attribution: Every claim linked to primary data source',
            'Scenario Modeling: "What if AGOA expires?" sensitivity analysis',
            'Competitive Benchmarking: Nigeria vs. peer emerging markets',
            'Financial Modeling: Revenue projections, cost assumptions, IRR scenarios',
          ],
        },
        {
          heading: 'Quality Assurance',
          content: 'How we ensure accuracy:',
          list: [
            'Source Verification: AI only cites Souvera-verified data',
            'Human Review: Souvera analysts review AI-generated reports (Institutional tier)',
            'Confidence Scoring: AI flags low-confidence claims for user review',
            'Update Tracking: Reports note data freshness (e.g., "as of May 2026")',
          ],
        },
      ],
      dataSources: ['GPT-4 API', 'All Souvera Intelligence Tabs', 'External Verified Sources'],
    },
    relatedTerms: ['reports_overview', 'newsletter_subscription'],
    tags: ['ai', 'gpt-4', 'custom', 'synthesis', 'investment'],
  },

  newsletter_subscription: {
    termKey: 'newsletter_subscription',
    termLabel: 'Curated Intelligence Newsletter',
    category: 'reports',
    tooltipShort: 'Weekly briefings (key developments, sector updates) and monthly deep-dives (comprehensive analysis) curated by Souvera intelligence team and delivered to your inbox.',
    modal: {
      title: 'Curated Intelligence Newsletter',
      summary: 'Souvera\'s newsletter delivers actionable intelligence directly to your inbox. Choose between weekly briefings for rapid market updates or monthly deep-dives for comprehensive sector analysis. All content is curated by Souvera\'s intelligence team.',
      sections: [
        {
          heading: 'Newsletter Types',
          content: 'Two delivery frequencies:',
          subsections: [
            {
              title: 'Weekly Briefing (Every Monday)',
              points: [
                'Key Developments: Policy changes, economic data releases, trade updates',
                'Sector Alerts: Technology deals, agriculture trends, infrastructure projects',
                'Risk Signals: Currency movements, political events, operational disruptions',
                'AGOA Updates: U.S. trade policy changes, product eligibility shifts',
              ],
            },
            {
              title: 'Monthly Deep-Dive (First of Month)',
              points: [
                'Sector Focus: Rotating deep-dive (Technology, Agriculture, Energy, etc.)',
                'Investment Themes: Emerging opportunities with entry strategies',
                'Policy Analysis: Regulatory changes and business implications',
                'Market Data: Trade flows, FDI trends, macro indicators',
              ],
            },
          ],
        },
        {
          heading: 'Content Curation Process',
          content: 'How Souvera selects newsletter content:',
          list: [
            'Admin-Managed: Souvera intelligence team curates all content',
            'Data-Driven: Powered by real-time updates to intelligence tabs',
            'Sector Rotation: Monthly deep-dives rotate across 5 priority sectors',
            'User Preferences: Admins can customize content by subscriber tier',
          ],
        },
        {
          heading: 'Subscriber Management',
          content: 'Admin controls for newsletter delivery:',
          list: [
            'Tier-Based Access: Different content for Explorer, Professional, Business subscribers',
            'Frequency Control: Admins set weekly/monthly delivery schedules',
            'Content Modules: Admins select which sections to include',
            'Unsubscribe Options: Users can opt-out per newsletter type',
          ],
        },
        {
          heading: 'Business Value',
          content: 'Why subscribe to newsletters:',
          list: [
            'Stay Current: Don\'t miss critical market developments',
            'Time Savings: Curated intelligence vs. scouring news sources',
            'Actionable Alerts: Know when to act (e.g., AGOA renewal, policy shifts)',
            'Competitive Edge: Early awareness of emerging opportunities',
          ],
        },
      ],
      dataSources: ['Souvera Intelligence Team', 'Real-Time Tab Data', 'Curated News Sources'],
    },
    relatedTerms: ['reports_overview', 'ai_custom_reports'],
    tags: ['newsletter', 'email', 'weekly', 'monthly', 'curated'],
  },
};
