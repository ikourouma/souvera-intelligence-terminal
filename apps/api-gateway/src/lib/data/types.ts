// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Phase 4B Data Types
// Owner: Afronovation, Inc.
// ===========================================

// Source confidence levels
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'curated';

// Data freshness status
export type FreshnessStatus = 'fresh' | 'recent' | 'stale' | 'expired';

// Source types
export type SourceType = 'api' | 'file' | 'manual';

// Ingestion types
export type IngestionType = 'scheduled' | 'manual' | 'upload';

// Ingestion methods (Phase 4B addendum)
export type IngestionMethod = 
  | 'api_connector'
  | 'manual_upload'
  | 'admin_file_fetch'
  | 'monitored_source'
  | 'reference_link_only';

// File types
export type FileType = 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf' | 'html' | 'text' | 'other';

// Batch status lifecycle
export type BatchStatus = 
  | 'uploaded'
  | 'stored'
  | 'parsing'
  | 'parsed'
  | 'mapping'
  | 'mapped'
  | 'validating'
  | 'validated'
  | 'under_review'
  | 'approved'
  | 'publishing'
  | 'published'
  | 'rejected'
  | 'superseded'
  | 'rolled_back'
  | 'failed';

// Row validation status
export type RowStatus = 'pending' | 'valid' | 'invalid' | 'warning' | 'mapped' | 'approved' | 'rejected' | 'published';

// Policy data status lifecycle
export type PolicyStatus = 'detected' | 'parsed' | 'drafted' | 'under_review' | 'approved' | 'published' | 'rejected' | 'stale';

// Monitor types
export type MonitorType = 'api_poll' | 'page_hash' | 'link_detection' | 'rss_feed' | 'file_link' | 'document_detection';

// Change event types
export type ChangeEventType = 'new_document' | 'page_changed' | 'content_updated' | 'link_added' | 'file_updated' | 'status_changed' | 'api_response_changed';

// Review actions
export type ReviewAction = 'approve' | 'reject' | 'request_changes' | 'escalate' | 'defer';

// Job status
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'partial';

// AGOA status
export type AGOAStatus = 'eligible' | 'suspended' | 'graduated' | 'ineligible' | 'not_applicable';

// AfCFTA status
export type AfCFTAStatus = 'signed' | 'ratified' | 'deposited' | 'trading' | 'not_signed';

// Finding severity
export type FindingSeverity = 'error' | 'warning' | 'info';

// Data source interface
export interface DataSource {
  id: string;
  key: string;
  name: string;
  domain: string;
  provider_url?: string;
  api_base_url?: string;
  api_docs_url?: string;
  source_type: SourceType;
  confidence_level: ConfidenceLevel;
  attribution_template?: string;
  requires_credential: boolean;
  source_status: 'approved' | 'testing' | 'paused' | 'retired';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Indicator interface
export interface Indicator {
  id: string;
  key: string;
  label: string;
  domain: string;
  unit?: string;
  description?: string;
  data_type: string;
  freshness_threshold_days: number;
  visibility_label: string;
  min_plan_id?: string;
  created_at: string;
  updated_at: string;
}

// Ingestion run interface
export interface IngestionRun {
  id: string;
  source_id: string;
  run_type: IngestionType;
  triggered_by?: string;
  started_at: string;
  completed_at?: string;
  status: JobStatus;
  rows_fetched: number;
  rows_valid: number;
  rows_invalid: number;
  rows_inserted: number;
  rows_updated: number;
  rows_rejected: number;
  error_message?: string;
  error_details?: Record<string, unknown>;
  created_at: string;
}

// Quality finding interface
export interface QualityFinding {
  id: string;
  ingestion_run_id?: string;
  severity: FindingSeverity;
  code: string;
  message: string;
  row_number?: number;
  field_name?: string;
  field_value?: string;
  country_iso3?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

// Country code crosswalk interface
export interface CountryCodeCrosswalk {
  id: string;
  country_id: string;
  iso3: string;
  census_code?: string;
  comtrade_code?: string;
  wdi_code?: string;
  imf_code?: string;
  name_variations: string[];
  is_souvera_market: boolean;
  is_excluded: boolean;
  exclusion_reason?: string;
}

// Trade policy status interface
export interface TradePolicyStatus {
  id: string;
  country_id: string;
  // AGOA
  agoa_status?: AGOAStatus;
  agoa_eligible_since?: string;
  agoa_apparel_eligible?: boolean;
  agoa_suspension_date?: string;
  agoa_suspension_reason?: string;
  agoa_notes?: string;
  agoa_source_url?: string;
  agoa_as_of_date?: string;
  agoa_last_reviewed_at?: string;
  // AfCFTA
  afcfta_status?: AfCFTAStatus;
  afcfta_signed_date?: string;
  afcfta_ratified_date?: string;
  afcfta_deposited_date?: string;
  afcfta_trading_since?: string;
  afcfta_tariff_offers_submitted?: boolean;
  afcfta_services_offers_submitted?: boolean;
  afcfta_notes?: string;
  afcfta_source_url?: string;
  afcfta_as_of_date?: string;
  afcfta_last_reviewed_at?: string;
  // Audit
  updated_at: string;
}

// Supply-demand signal interface
export interface SupplyDemandSignal {
  id: string;
  country_id: string;
  sector_key: string;
  supply_score?: number;
  supply_confidence?: ConfidenceLevel;
  supply_notes?: string;
  demand_score?: number;
  demand_confidence?: ConfidenceLevel;
  demand_notes?: string;
  opportunity_score?: number;
  opportunity_rationale?: string;
  as_of_date?: string;
  last_reviewed_at?: string;
  min_plan_id?: string;
}

// Source attribution for UI display
export interface SourceAttribution {
  source_key: string;
  source_name: string;
  source_type: SourceType;
  indicator_key?: string;
  as_of_date?: string;
  last_reviewed_at?: string;
  confidence_level: ConfidenceLevel;
  freshness_status: FreshnessStatus;
  min_plan_id?: string;
  attribution_text?: string;
}

// Displayed metric with full attribution
export interface DisplayedMetric {
  value: number | string | null;
  formatted_value: string;
  source_name: string;
  source_type: SourceType;
  as_of_date?: string;
  last_reviewed_at?: string;
  freshness_status: FreshnessStatus;
  confidence_level: ConfidenceLevel;
  min_plan_id?: string;
  is_entitled: boolean;
}

// Upload batch interface
export interface UploadBatch {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes?: number;
  upload_type: string;
  source_id?: string;
  uploaded_by: string;
  source_url?: string;
  as_of_date: string;
  last_reviewed_at: string;
  ingestion_run_id?: string;
  status: JobStatus;
  created_at: string;
}

// Upload row interface
export interface UploadRow {
  id: string;
  batch_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  is_valid: boolean;
  validation_errors?: ValidationError[];
  country_id?: string;
  mapped_iso3?: string;
  is_processed: boolean;
  processed_at?: string;
}

// Validation error interface
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
}

// =========================================================
// PHASE 4B INGESTION ARCHITECTURE ADDENDUM
// =========================================================

// Source file asset interface
export interface SourceFileAsset {
  id: string;
  source_id: string;
  file_name: string;
  file_type: FileType;
  file_size_bytes?: number;
  mime_type?: string;
  storage_path: string;
  storage_bucket: string;
  original_url?: string;
  fetch_method?: string;
  fetched_at?: string;
  fetched_by?: string;
  file_hash_sha256?: string;
  content_hash?: string;
  is_pdf_evidence: boolean;
  pdf_page_count?: number;
  pdf_extraction_status?: string;
  source_document_title?: string;
  source_document_date?: string;
  source_document_url?: string;
  created_at: string;
  updated_at: string;
}

// File ingestion batch interface
export interface FileIngestionBatch {
  id: string;
  source_id: string;
  file_asset_id?: string;
  batch_name?: string;
  batch_description?: string;
  status: BatchStatus;
  source_name: string;
  source_url?: string;
  as_of_date: string;
  last_reviewed_at: string;
  source_confidence: ConfidenceLevel;
  total_rows?: number;
  valid_rows?: number;
  invalid_rows?: number;
  warning_rows?: number;
  mapping_template_id?: string;
  column_mapping?: Record<string, unknown>;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  published_at?: string;
  published_by?: string;
  supersedes_batch_id?: string;
  superseded_by_batch_id?: string;
  superseded_at?: string;
  rolled_back_at?: string;
  rolled_back_by?: string;
  rollback_reason?: string;
  error_message?: string;
  ingestion_run_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// File ingestion row interface
export interface FileIngestionRow {
  id: string;
  batch_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  mapped_data?: Record<string, unknown>;
  source_country_value?: string;
  mapped_country_id?: string;
  mapped_iso3?: string;
  status: RowStatus;
  validation_errors?: ValidationError[];
  validation_warnings?: ValidationError[];
  is_duplicate: boolean;
  is_excluded: boolean;
  exclusion_reason?: string;
  admin_override: boolean;
  override_by?: string;
  override_reason?: string;
  published_at?: string;
  target_table?: string;
  target_record_id?: string;
  created_at: string;
  updated_at: string;
}

// Column mapping interface
export interface ColumnMapping {
  id: string;
  source_id: string;
  source_column_name: string;
  source_column_index?: number;
  target_field_name: string;
  target_table: string;
  transform_type?: string;
  transform_config?: Record<string, unknown>;
  is_required: boolean;
  validation_rules?: Record<string, unknown>[];
  default_value?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Ingestion template interface
export interface IngestionTemplate {
  id: string;
  source_id?: string;
  template_name: string;
  template_description?: string;
  target_table: string;
  target_data_type?: string;
  column_mappings: Record<string, unknown>[];
  validation_config?: Record<string, unknown>;
  country_column?: string;
  country_mapping_type?: string;
  required_columns: string[];
  default_confidence: ConfidenceLevel;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Policy source monitor interface
export interface PolicySourceMonitor {
  id: string;
  source_id: string;
  monitor_name: string;
  monitor_type: MonitorType;
  monitor_url: string;
  api_endpoint?: string;
  api_params?: Record<string, unknown>;
  api_headers?: Record<string, unknown>;
  page_selector?: string;
  link_patterns?: string[];
  feed_url?: string;
  check_interval_minutes: number;
  last_check_at?: string;
  next_check_at?: string;
  last_content_hash?: string;
  last_response_status?: number;
  last_error_message?: string;
  consecutive_failures: number;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Policy source snapshot interface
export interface PolicySourceSnapshot {
  id: string;
  monitor_id: string;
  snapshot_at: string;
  content_hash: string;
  content_preview?: string;
  full_content?: string;
  storage_path?: string;
  response_status?: number;
  has_changed: boolean;
  change_summary?: string;
  detected_links?: string[];
  detected_documents?: Record<string, unknown>[];
  created_at: string;
}

// Policy change event interface
export interface PolicyChangeEvent {
  id: string;
  monitor_id: string;
  snapshot_id?: string;
  event_type: ChangeEventType;
  event_title: string;
  event_description?: string;
  event_url?: string;
  event_date?: string;
  document_title?: string;
  document_url?: string;
  document_type?: string;
  extracted_data?: Record<string, unknown>;
  matched_keywords?: string[];
  status: PolicyStatus;
  assigned_to?: string;
  assigned_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  review_action?: ReviewAction;
  approved_by?: string;
  approved_at?: string;
  published_at?: string;
  published_to_table?: string;
  published_record_id?: string;
  created_at: string;
  updated_at: string;
}

// Policy review queue item interface
export interface PolicyReviewQueueItem {
  id: string;
  source_type: string;
  source_id: string;
  title: string;
  description?: string;
  priority: number;
  policy_type?: string;
  country_iso3?: string;
  status: PolicyStatus;
  assigned_to?: string;
  assigned_at?: string;
  due_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  review_action?: ReviewAction;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  completed_at?: string;
  completed_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
