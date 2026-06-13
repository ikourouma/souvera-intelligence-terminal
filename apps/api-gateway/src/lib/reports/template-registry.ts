/**
 * Server-only template registry — PDF generator routing.
 * Client components must import from ./template-ids.ts only.
 */

import { fetchCountryProfileReportData } from './country-profile-data';
import { generateCountryProfileFullV2 } from './generate-country-profile-v2';
import { generateSectorDeepDiveV2 } from './generate-sector-deep-dive-v2';
import {
  generateCountryProfileV1Pdf,
  isCountryProfileV1RollbackEnabled,
} from './_archived/country-profile-v1';
import { renderReportPdfBytes, COUNTRY_PROFILE_TYPE } from './render-report';
import { validateSectorDeepDiveRequest } from '@/lib/sectors/sector-taxonomy';
import type { PreflightReport } from '@/types/report-integrity';
import {
  REPORT_TYPE_BY_TEMPLATE_ID,
  type TemplateId,
} from './template-ids';

export type { TemplateId } from './template-ids';
export {
  TEMPLATE_IDS,
  TEMPLATE_ID_BY_REPORT_TYPE,
  REPORT_TYPE_BY_TEMPLATE_ID,
  isTemplateId,
  resolveTemplateId,
  resolveTemplateIdFromRequestRow,
  isCountryProfileTemplate,
} from './template-ids';

export type TemplateGenerateContext = {
  iso3: string;
  sectorKey?: string;
  query?: string;
  summary?: string;
  opportunityThesis?: string;
  riskNarrative?: string;
  countryName?: string;
  strict?: boolean;
  proofLayout?: boolean;
};

export type TemplateGenerateResult =
  | {
      ok: true;
      pdf: Uint8Array;
      generatorUsed: string;
      preflight?: PreflightReport;
    }
  | { ok: false; preflight: PreflightReport; generatorUsed: string };

export async function generateReportFromTemplate(
  templateId: TemplateId,
  ctx: TemplateGenerateContext
): Promise<TemplateGenerateResult> {
  const iso3 = ctx.iso3.toUpperCase();

  switch (templateId) {
    case 'country_profile_template': {
      if (isCountryProfileV1RollbackEnabled()) {
        const pdf = await generateCountryProfileV1Pdf(iso3, {
          summary: ctx.summary,
          opportunityThesis: ctx.opportunityThesis,
          riskNarrative: ctx.riskNarrative,
        });
        return { ok: true, pdf, generatorUsed: 'generateCountryProfileV1Pdf' };
      }
      const payload = await fetchCountryProfileReportData(iso3);
      if (ctx.summary) payload.summary = ctx.summary;
      if (ctx.opportunityThesis) payload.opportunityThesis = ctx.opportunityThesis;
      if (ctx.riskNarrative) payload.riskNarrative = ctx.riskNarrative;

      const v2 = await generateCountryProfileFullV2(payload, {
        strict: ctx.strict !== false,
        proofLayout: ctx.proofLayout,
      });
      if (!v2.ok) {
        return { ok: false, preflight: v2.preflight, generatorUsed: 'generateCountryProfileFullV2' };
      }
      return { ok: true, pdf: v2.pdf, preflight: v2.preflight, generatorUsed: 'generateCountryProfileFullV2' };
    }

    case 'sector_deep_dive_template': {
      const validation = validateSectorDeepDiveRequest('Sector Deep-Dive', ctx.sectorKey);
      if (!validation.ok) {
        throw new Error(validation.error);
      }
      const pdf = await generateSectorDeepDiveV2(iso3, validation.sectorKey);
      return { ok: true, pdf, generatorUsed: 'generateSectorDeepDiveV2' };
    }

    case 'country_investment_memo_template':
    case 'country_trade_profile_template':
    case 'ai_custom_report_template': {
      const reportType = REPORT_TYPE_BY_TEMPLATE_ID[templateId];
      const pdf = await renderReportPdfBytes({
        countryName: ctx.countryName ?? iso3,
        iso3,
        reportType,
        generatedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        summary: ctx.summary,
        opportunityThesis: ctx.opportunityThesis,
        riskNarrative: ctx.riskNarrative,
        query: ctx.query,
      });
      return { ok: true, pdf, generatorUsed: `renderReportPdfBytes:${reportType}` };
    }

    default: {
      const _exhaustive: never = templateId;
      throw new Error(`Unhandled templateId: ${_exhaustive}`);
    }
  }
}

/** @deprecated Use isCountryProfileV1RollbackEnabled from archive */
export function shouldUseArchivedCountryProfileV1(): boolean {
  return isCountryProfileV1RollbackEnabled();
}

export { COUNTRY_PROFILE_TYPE };
