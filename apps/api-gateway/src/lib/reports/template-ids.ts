/**
 * Canonical template IDs — client-safe constants (no Puppeteer / server generators).
 */

export const TEMPLATE_IDS = [
  'country_profile_template',
  'country_investment_memo_template',
  'country_trade_profile_template',
  'sector_deep_dive_template',
  'ai_custom_report_template',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Legacy UI / API reportType labels */
export const REPORT_TYPE_BY_TEMPLATE_ID: Record<TemplateId, string> = {
  country_profile_template: 'Country Profile',
  country_investment_memo_template: 'Investment Memo',
  country_trade_profile_template: 'Trade Profile',
  sector_deep_dive_template: 'Sector Deep-Dive',
  ai_custom_report_template: 'AI Custom Report',
};

export const TEMPLATE_ID_BY_REPORT_TYPE: Record<string, TemplateId> = {
  'Country Profile': 'country_profile_template',
  'Investment Memo': 'country_investment_memo_template',
  'Trade Profile': 'country_trade_profile_template',
  'Sector Deep-Dive': 'sector_deep_dive_template',
  'AI Custom Report': 'ai_custom_report_template',
};

export function isTemplateId(value: string): value is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(value);
}

export function resolveTemplateId(input: {
  templateId?: string;
  reportType?: string;
}): { templateId: TemplateId; reportType: string } | { error: string; status: number } {
  if (input.templateId?.trim()) {
    const id = input.templateId.trim();
    if (!isTemplateId(id)) {
      return { error: `Unknown templateId: ${id}`, status: 422 };
    }
    return { templateId: id, reportType: REPORT_TYPE_BY_TEMPLATE_ID[id] };
  }
  if (!input.reportType?.trim()) {
    return { error: 'templateId or reportType is required', status: 400 };
  }
  const mapped = TEMPLATE_ID_BY_REPORT_TYPE[input.reportType.trim()];
  if (!mapped) {
    return { error: `Unknown reportType: ${input.reportType}`, status: 422 };
  }
  return { templateId: mapped, reportType: input.reportType.trim() };
}

export function resolveTemplateIdFromRequestRow(row: {
  template_id?: string | null;
  report_type?: string | null;
}): TemplateId {
  if (row.template_id && isTemplateId(row.template_id)) {
    return row.template_id;
  }
  const rt = row.report_type ?? '';
  return TEMPLATE_ID_BY_REPORT_TYPE[rt] ?? 'country_profile_template';
}

export function isCountryProfileTemplate(templateId: TemplateId): boolean {
  return templateId === 'country_profile_template';
}
