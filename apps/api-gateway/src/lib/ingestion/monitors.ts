// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Policy Source Monitors
// Owner: Afronovation, Inc.
//
// Implements automated monitoring for:
// - Federal Register API (AGOA)
// - Regulations.gov API (AGOA docket)
// - USTR page monitoring
// - AfCFTA Secretariat
// - tralac tracker
//
// NO automatic publication - all changes create review tasks
// ===========================================

import crypto from 'crypto';
import type { 
  PolicySourceMonitor, 
  PolicyChangeEvent, 
  ChangeEventType,
  MonitorType 
} from '../data/types';

export interface MonitorCheckResult {
  success: boolean;
  has_changed: boolean;
  content_hash?: string;
  content_preview?: string;
  detected_changes?: DetectedChange[];
  error_message?: string;
}

export interface DetectedChange {
  event_type: ChangeEventType;
  title: string;
  description?: string;
  url?: string;
  date?: string;
  document_title?: string;
  document_url?: string;
  document_type?: string;
  extracted_data?: Record<string, unknown>;
  matched_keywords?: string[];
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function extractKeywordMatches(content: string, keywords: string[]): string[] {
  const matches: string[] = [];
  const lowerContent = content.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }
  
  return matches;
}

export interface FederalRegisterDocument {
  document_number: string;
  title: string;
  type: string;
  abstract?: string;
  publication_date: string;
  agencies: Array<{ name: string }>;
  html_url: string;
  pdf_url?: string;
  json_url: string;
}

export interface FederalRegisterResponse {
  count: number;
  results: FederalRegisterDocument[];
}

export async function checkFederalRegisterAPI(
  monitor: PolicySourceMonitor,
  lastContentHash?: string
): Promise<MonitorCheckResult> {
  try {
    const params = monitor.api_params as Record<string, string> || {};
    const url = new URL(monitor.api_endpoint || monitor.monitor_url);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Souvera Intelligence Terminal/1.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        has_changed: false,
        error_message: `Federal Register API returned ${response.status}`,
      };
    }

    const data: FederalRegisterResponse = await response.json();
    const contentHash = hashContent(JSON.stringify(data.results.map(r => r.document_number)));
    const hasChanged = lastContentHash !== contentHash;

    const detectedChanges: DetectedChange[] = [];
    
    if (hasChanged && data.results.length > 0) {
      for (const doc of data.results) {
        const matchedKeywords = extractKeywordMatches(
          `${doc.title} ${doc.abstract || ''}`,
          monitor.keywords
        );

        if (matchedKeywords.length > 0) {
          detectedChanges.push({
            event_type: 'new_document',
            title: doc.title,
            description: doc.abstract,
            url: doc.html_url,
            date: doc.publication_date,
            document_title: doc.title,
            document_url: doc.html_url,
            document_type: doc.type.toLowerCase(),
            extracted_data: {
              document_number: doc.document_number,
              agencies: doc.agencies.map(a => a.name),
              pdf_url: doc.pdf_url,
            },
            matched_keywords: matchedKeywords,
          });
        }
      }
    }

    return {
      success: true,
      has_changed: hasChanged,
      content_hash: contentHash,
      content_preview: data.results.slice(0, 3).map(r => r.title).join('; '),
      detected_changes: detectedChanges,
    };

  } catch (error) {
    return {
      success: false,
      has_changed: false,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export interface RegulationsGovDocument {
  id: string;
  type: string;
  attributes: {
    documentType: string;
    title: string;
    postedDate: string;
    docketId: string;
    commentStartDate?: string;
    commentEndDate?: string;
  };
  links: {
    self: string;
  };
}

export interface RegulationsGovResponse {
  data: RegulationsGovDocument[];
  meta: {
    totalElements: number;
  };
}

export async function checkRegulationsGovAPI(
  monitor: PolicySourceMonitor,
  lastContentHash?: string
): Promise<MonitorCheckResult> {
  try {
    const apiKey = process.env.REGULATIONS_GOV_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        has_changed: false,
        error_message: 'REGULATIONS_GOV_API_KEY not configured',
      };
    }

    const params = monitor.api_params as Record<string, string> || {};
    const url = new URL(monitor.api_endpoint || monitor.monitor_url);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
        'User-Agent': 'Souvera Intelligence Terminal/1.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        has_changed: false,
        error_message: `Regulations.gov API returned ${response.status}`,
      };
    }

    const data: RegulationsGovResponse = await response.json();
    const contentHash = hashContent(JSON.stringify(data.data.map(d => d.id)));
    const hasChanged = lastContentHash !== contentHash;

    const detectedChanges: DetectedChange[] = [];
    
    if (hasChanged && data.data.length > 0) {
      for (const doc of data.data) {
        const matchedKeywords = extractKeywordMatches(
          doc.attributes.title,
          monitor.keywords
        );

        detectedChanges.push({
          event_type: 'new_document',
          title: doc.attributes.title,
          url: `https://www.regulations.gov/document/${doc.id}`,
          date: doc.attributes.postedDate,
          document_title: doc.attributes.title,
          document_url: `https://www.regulations.gov/document/${doc.id}`,
          document_type: doc.attributes.documentType.toLowerCase(),
          extracted_data: {
            document_id: doc.id,
            docket_id: doc.attributes.docketId,
            comment_start: doc.attributes.commentStartDate,
            comment_end: doc.attributes.commentEndDate,
          },
          matched_keywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
        });
      }
    }

    return {
      success: true,
      has_changed: hasChanged,
      content_hash: contentHash,
      content_preview: data.data.slice(0, 3).map(d => d.attributes.title).join('; '),
      detected_changes: detectedChanges,
    };

  } catch (error) {
    return {
      success: false,
      has_changed: false,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkPageHash(
  monitor: PolicySourceMonitor,
  lastContentHash?: string
): Promise<MonitorCheckResult> {
  try {
    const response = await fetch(monitor.monitor_url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Souvera Intelligence Terminal/1.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        has_changed: false,
        error_message: `Page returned ${response.status}`,
      };
    }

    const html = await response.text();
    
    // Extract relevant content if selector is specified
    let contentToHash = html;
    if (monitor.page_selector) {
      // Simple content extraction - in production, use a proper HTML parser
      const selectorMatch = html.match(new RegExp(`<[^>]*id="${monitor.page_selector}"[^>]*>([\\s\\S]*?)</`, 'i'));
      if (selectorMatch) {
        contentToHash = selectorMatch[1];
      }
    }

    const contentHash = hashContent(contentToHash);
    const hasChanged = lastContentHash !== contentHash;

    const detectedChanges: DetectedChange[] = [];
    
    if (hasChanged) {
      const matchedKeywords = extractKeywordMatches(html, monitor.keywords);
      
      detectedChanges.push({
        event_type: 'page_changed',
        title: `Page content changed: ${monitor.monitor_name}`,
        url: monitor.monitor_url,
        date: new Date().toISOString().split('T')[0],
        matched_keywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
      });
    }

    return {
      success: true,
      has_changed: hasChanged,
      content_hash: contentHash,
      content_preview: html.substring(0, 200).replace(/<[^>]*>/g, '').trim(),
      detected_changes: detectedChanges,
    };

  } catch (error) {
    return {
      success: false,
      has_changed: false,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function runMonitorCheck(
  monitor: PolicySourceMonitor
): Promise<MonitorCheckResult> {
  switch (monitor.monitor_type as MonitorType) {
    case 'api_poll':
      // Determine which API to use based on URL
      if (monitor.monitor_url.includes('federalregister.gov')) {
        return checkFederalRegisterAPI(monitor, monitor.last_content_hash || undefined);
      } else if (monitor.monitor_url.includes('regulations.gov')) {
        return checkRegulationsGovAPI(monitor, monitor.last_content_hash || undefined);
      }
      return {
        success: false,
        has_changed: false,
        error_message: 'Unknown API endpoint',
      };

    case 'page_hash':
      return checkPageHash(monitor, monitor.last_content_hash || undefined);

    case 'link_detection':
    case 'rss_feed':
    case 'file_link':
    case 'document_detection':
      // Not yet implemented
      return {
        success: false,
        has_changed: false,
        error_message: `Monitor type ${monitor.monitor_type} not yet implemented`,
      };

    default:
      return {
        success: false,
        has_changed: false,
        error_message: `Unknown monitor type: ${monitor.monitor_type}`,
      };
  }
}
