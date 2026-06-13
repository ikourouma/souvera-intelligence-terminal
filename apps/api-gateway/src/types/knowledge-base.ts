/**
 * Knowledge Base Types
 * 
 * Defines the structure for contextual help content across the platform
 */

export type KnowledgeBaseCategory = 
  | 'metric'           // GDP, FDI, Inflation, etc.
  | 'signal'          // Signal Strength, Investment Score, Confidence
  | 'momentum'        // Economic Momentum, Investor Readiness
  | 'intensity'       // Risk Intensity, Opportunity Intensity
  | 'trade'           // AGOA, AfCFTA, ECOWAS
  | 'indicator'       // Economic indicators
  | 'sector';         // Technology, Finance, Agriculture

export interface KnowledgeBaseContent {
  termKey: string;                    // Unique identifier: "signal_strength"
  termLabel: string;                  // Display name: "Signal Strength"
  category: KnowledgeBaseCategory;
  
  // Tier 1: Quick Tooltip (Hover - Desktop)
  tooltipShort: string;               // 1-2 sentences, max 50 words
  
  // Tier 2: Detailed Modal (Click/Tap)
  modal: {
    title: string;
    summary: string;                  // 1-2 sentence intro
    sections: ModalSection[];
    dataSources?: string[];
    learnMoreUrl?: string;
  };
  
  // Metadata
  relatedTerms?: string[];           // Links to other knowledge base entries
  tags?: string[];                    // For search/filtering
}

export interface ModalSection {
  heading: string;
  content: string;
  subsections?: ModalSubsection[];
  list?: string[];                    // Bullet points
  levels?: SignalLevel[];             // For signal/risk levels
}

export interface ModalSubsection {
  title: string;
  points: string[];
}

export interface SignalLevel {
  range: string;                      // "70-100"
  label: string;                      // "HIGH GROWTH"
  color: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple';
  description: string;
}
