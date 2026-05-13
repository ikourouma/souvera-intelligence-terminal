# Source Registry + Indicator Builder
## Architecture and Implementation Plan

**Document Type:** Architecture Plan  
**Classification:** Internal Technical — Architecture Review  
**Date:** 2026-05-06  
**Version:** 1.0 Draft  
**Owner:** Afronovation Engineering Team  
**Status:** Draft for Review

---

## 1. Executive Summary

This document defines the architecture for two foundational admin capabilities:

1. **Source Registry** — Enables admins to register, configure, and manage data sources without code changes
2. **Indicator Builder** — Enables admins to define new metrics and map them to sources and entities

These capabilities form the foundation for Phase 4B scheduled ingestion and the AGOA + AfCFTA Trade Intelligence Module.

### 1.1 Strategic Value

- **Flexibility:** Add new data sources without deployments
- **Scalability:** Support growing indicator library
- **Governance:** Audit trail for all data changes
- **Quality:** Validation and review workflows

### 1.2 Dependencies

- Phase 4A completion (done)
- Admin authentication and authorization (existing)
- Supabase PostgreSQL database (existing)
- Edge Functions infrastructure (existing)

---

## 2. Source Registry Concept

### 2.1 Purpose

Enable admins to register and manage data sources that feed indicators. Sources can be:
- **API Sources** — REST APIs with scheduled polling
- **File Sources** — CSV/Excel uploads
- **Manual Sources** — Admin-entered data

### 2.2 Source Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    SOURCE LIFECYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ DRAFT    │──▶│ TESTING  │──▶│ ACTIVE   │──▶│ ARCHIVED │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       │              │              │              │        │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  Create/Edit    Test Conn.    Scheduled       Disabled     │
│  Config         Validate      Ingestion       No Ingestion │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Source Configuration Model

```typescript
interface DataSource {
  // Identity
  id: string;                    // UUID
  key: string;                   // Unique key (e.g., "world_bank_wdi")
  name: string;                  // Display name
  description: string;           // Admin description
  
  // Type and Access
  sourceType: 'api' | 'file' | 'manual';
  status: 'draft' | 'testing' | 'active' | 'archived';
  
  // API Configuration (if sourceType === 'api')
  apiConfig?: {
    baseUrl: string;
    authType: 'none' | 'api_key' | 'oauth2' | 'basic';
    authCredentials?: string;    // Encrypted reference
    rateLimit: number;           // Requests per minute
    timeout: number;             // Request timeout (ms)
    retryPolicy: {
      maxRetries: number;
      backoffMs: number;
    };
  };
  
  // File Configuration (if sourceType === 'file')
  fileConfig?: {
    acceptedFormats: string[];   // ['csv', 'xlsx']
    maxSizeBytes: number;
    encoding: string;
  };
  
  // Schedule (for API sources)
  schedule?: {
    enabled: boolean;
    cronExpression: string;      // e.g., "0 0 * * 0" (weekly)
    timezone: string;
  };
  
  // Health and Monitoring
  health: {
    lastCheck: Date;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastError?: string;
    consecutiveFailures: number;
  };
  
  // Audit
  createdBy: string;             // Admin user ID
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
```

### 2.4 Source Types

#### 2.4.1 API Sources

**Configuration Requirements:**
- Base URL
- Authentication method and credentials
- Rate limiting configuration
- Retry policy
- Response schema mapping

**Example: World Bank WDI API**
```json
{
  "key": "world_bank_wdi",
  "name": "World Bank World Development Indicators",
  "sourceType": "api",
  "apiConfig": {
    "baseUrl": "https://api.worldbank.org/v2",
    "authType": "none",
    "rateLimit": 100,
    "timeout": 30000,
    "retryPolicy": {
      "maxRetries": 3,
      "backoffMs": 1000
    }
  },
  "schedule": {
    "enabled": true,
    "cronExpression": "0 0 * * 0",
    "timezone": "UTC"
  }
}
```

#### 2.4.2 File Sources

**Configuration Requirements:**
- Accepted file formats
- Maximum file size
- Column mapping configuration
- Validation rules

**Example: AGOA Eligibility CSV**
```json
{
  "key": "agoa_eligibility_manual",
  "name": "AGOA Eligibility Status (Manual Upload)",
  "sourceType": "file",
  "fileConfig": {
    "acceptedFormats": ["csv", "xlsx"],
    "maxSizeBytes": 5242880,
    "encoding": "utf-8"
  }
}
```

#### 2.4.3 Manual Sources

**Configuration Requirements:**
- Form field definitions
- Validation rules
- Required approvals

**Example: Admin-Curated Data**
```json
{
  "key": "admin_curated",
  "name": "Admin-Curated Intelligence",
  "sourceType": "manual"
}
```

---

## 3. Indicator Builder Concept

### 3.1 Purpose

Enable admins to define new metrics (indicators) and configure how they:
- Map to source data
- Associate with entities (countries, sectors, products)
- Display in the UI
- Control access by entitlement

### 3.2 Indicator Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   INDICATOR LIFECYCLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ DRAFT    │──▶│ REVIEW   │──▶│ PUBLISHED│──▶│ DEPRECATED│ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       │              │              │              │        │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  Define/Edit    Admin Review   Live for       Hidden from  │
│  Mapping        Validation     Entitled       Users        │
│                                Users                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Indicator Configuration Model

```typescript
interface Indicator {
  // Identity
  id: string;                    // UUID
  key: string;                   // Unique key (e.g., "gdp_current_usd")
  name: string;                  // Display name
  description: string;           // User-facing description
  methodology?: string;          // Methodology notes
  
  // Data Type
  dataType: 'numeric' | 'categorical' | 'boolean' | 'text';
  unit?: string;                 // e.g., "USD", "percent", "index"
  precision?: number;            // Decimal places for numeric
  valueRange?: {
    min?: number;
    max?: number;
  };
  
  // Display Configuration
  display: {
    format: string;              // e.g., "$#,##0", "#,##0.0%"
    displayOrder: number;
    groupKey?: string;           // For grouping indicators
    chartType?: 'line' | 'bar' | 'gauge' | 'none';
  };
  
  // Source Mapping
  sourceMapping: {
    sourceId: string;            // FK to DataSource
    fieldPath: string;           // JSONPath or column name
    transformations?: Transformation[];
    aggregation?: 'sum' | 'avg' | 'latest' | 'none';
  };
  
  // Entity Mapping
  entityMapping: {
    entityType: 'country' | 'sector' | 'product' | 'country_sector' | 'country_product';
    entityKeyField: string;      // Field in source data
    entityKeyType: 'iso3' | 'iso2' | 'sector_key' | 'hs_code';
  };
  
  // Temporal
  temporal: {
    hasTimeSeries: boolean;
    temporalField?: string;      // Field in source data
    temporalGranularity?: 'year' | 'quarter' | 'month' | 'day';
    defaultPeriod?: string;      // e.g., "latest", "2025"
  };
  
  // Access Control
  access: {
    minPlanId: 'explorer' | 'professional' | 'business' | 'institutional';
    visibility: 'public' | 'entitled' | 'admin_only';
  };
  
  // Status
  status: 'draft' | 'review' | 'published' | 'deprecated';
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  publishedBy?: string;
  publishedAt?: Date;
}

interface Transformation {
  type: 'multiply' | 'divide' | 'round' | 'map' | 'conditional';
  params: Record<string, any>;
}
```

### 3.4 Indicator Examples

#### Example 1: World Bank GDP Indicator

```json
{
  "key": "gdp_current_usd",
  "name": "GDP (Current US$)",
  "description": "Gross domestic product at current prices in US dollars",
  "dataType": "numeric",
  "unit": "USD",
  "precision": 0,
  "display": {
    "format": "$#,##0",
    "displayOrder": 1,
    "groupKey": "economic_indicators",
    "chartType": "line"
  },
  "sourceMapping": {
    "sourceId": "world_bank_wdi",
    "fieldPath": "$.value",
    "transformations": [],
    "aggregation": "latest"
  },
  "entityMapping": {
    "entityType": "country",
    "entityKeyField": "$.country.id",
    "entityKeyType": "iso3"
  },
  "temporal": {
    "hasTimeSeries": true,
    "temporalField": "$.date",
    "temporalGranularity": "year",
    "defaultPeriod": "latest"
  },
  "access": {
    "minPlanId": "explorer",
    "visibility": "public"
  },
  "status": "published"
}
```

#### Example 2: AGOA Eligibility Status Indicator

```json
{
  "key": "agoa_eligible",
  "name": "AGOA Eligibility Status",
  "description": "Current AGOA eligibility status",
  "dataType": "categorical",
  "display": {
    "format": "status_badge",
    "displayOrder": 1,
    "groupKey": "trade_policy"
  },
  "sourceMapping": {
    "sourceId": "agoa_eligibility_manual",
    "fieldPath": "status",
    "transformations": [
      {
        "type": "map",
        "params": {
          "eligible": "Eligible",
          "suspended": "Suspended",
          "graduated": "Graduated",
          "never_eligible": "Not Eligible"
        }
      }
    ]
  },
  "entityMapping": {
    "entityType": "country",
    "entityKeyField": "iso3",
    "entityKeyType": "iso3"
  },
  "temporal": {
    "hasTimeSeries": false,
    "defaultPeriod": "current"
  },
  "access": {
    "minPlanId": "explorer",
    "visibility": "public"
  },
  "status": "published"
}
```

---

## 4. API / Source Connector Model

### 4.1 Connector Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONNECTOR LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Connector Interface                    ││
│  │  - connect(): Promise<void>                             ││
│  │  - fetch(params): Promise<RawData>                      ││
│  │  - validate(data): ValidationResult                     ││
│  │  - healthCheck(): HealthStatus                          ││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                 │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ API         │   │ File        │   │ Manual      │       │
│  │ Connector   │   │ Connector   │   │ Connector   │       │
│  ├─────────────┤   ├─────────────┤   ├─────────────┤       │
│  │ World Bank  │   │ CSV Parser  │   │ Form Input  │       │
│  │ ITC         │   │ Excel Parse │   │ Validation  │       │
│  │ Census      │   │ Validation  │   │             │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Connector Interface

```typescript
interface Connector {
  sourceId: string;
  
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Data Fetching
  fetch(params: FetchParams): Promise<RawData>;
  fetchIncremental(since: Date): Promise<RawData>;
  
  // Validation
  validate(data: RawData): ValidationResult;
  
  // Health
  healthCheck(): Promise<HealthStatus>;
}

interface FetchParams {
  indicators?: string[];         // Specific indicators to fetch
  entities?: string[];           // Specific entities (countries, etc.)
  startDate?: Date;
  endDate?: Date;
}

interface RawData {
  sourceId: string;
  fetchedAt: Date;
  rowCount: number;
  data: Record<string, any>[];
  metadata?: Record<string, any>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  lastSuccess?: Date;
  errorMessage?: string;
}
```

### 4.3 Built-in Connectors

**Phase 4B:**
1. **World Bank WDI Connector** — World Development Indicators API
2. **CSV File Connector** — Generic CSV upload and parsing
3. **Excel File Connector** — Generic Excel upload and parsing
4. **Manual Entry Connector** — Admin form entry

**Phase 4C:**
5. **ITC Trade Map Connector** — Trade flow data
6. **U.S. Census Connector** — U.S. trade statistics

---

## 5. HS Code Mapping

### 5.1 HS Code Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    HS CODE HIERARCHY                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Section (I-XXI)                                            │
│    └── Chapter (2-digit: 01-99)                             │
│          └── Heading (4-digit: 0101-9999)                   │
│                └── Subheading (6-digit: 010110-999999)      │
│                      └── National Line (8-10 digit)         │
│                                                             │
│  Example:                                                   │
│  Section II: Vegetable Products                             │
│    └── Chapter 09: Coffee, tea, maté and spices             │
│          └── 0901: Coffee                                   │
│                └── 090111: Coffee, not roasted, not decaf   │
│                      └── 0901.11.00: (U.S. HTS)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 HS Code Data Model

```sql
-- Product HS Code Reference Table
CREATE TABLE product_hs_codes (
  hs_code VARCHAR(10) PRIMARY KEY,
  hs_level INTEGER NOT NULL,        -- 2, 4, 6, 8, 10
  description TEXT NOT NULL,
  description_short VARCHAR(255),
  parent_code VARCHAR(10),
  section_code VARCHAR(5),
  chapter_code VARCHAR(2),
  
  -- Trade Policy Status
  agoa_eligible BOOLEAN DEFAULT FALSE,
  gsp_eligible BOOLEAN DEFAULT FALSE,
  special_provisions TEXT[],        -- Array of special rule codes
  
  -- Categorization
  category_key VARCHAR(50),         -- Maps to Souvera sector categories
  subcategory_key VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_parent FOREIGN KEY (parent_code) 
    REFERENCES product_hs_codes(hs_code)
);

-- AGOA-specific product eligibility
CREATE TABLE agoa_product_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hs_code VARCHAR(10) NOT NULL,
  eligible BOOLEAN NOT NULL,
  effective_date DATE,
  notes TEXT,
  source VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_hs_code FOREIGN KEY (hs_code) 
    REFERENCES product_hs_codes(hs_code)
);
```

### 5.3 HS Code to Souvera Sector Mapping

```
┌──────────────────────────────────────────────────────────────┐
│               HS CODE → SECTOR MAPPING                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Souvera Sector            │ HS Chapters/Codes              │
│  ─────────────────────────────────────────────────────────── │
│  digital_infrastructure    │ 84 (computers), 85 (telecom)   │
│  fintech_digital_finance   │ (services - no HS codes)       │
│  energy_renewables         │ 27 (fuels), 84-85 (equipment)  │
│  agriculture_agribusiness  │ 01-24 (agricultural products)  │
│  mining_critical_minerals  │ 25-27 (minerals), 71-83 (metals)│
│  logistics_trade           │ (services - limited HS codes)  │
│  tourism_hospitality       │ (services - no HS codes)       │
│                                                              │
│  Note: Many sectors involve services not captured by HS codes│
│  HS code mapping is primarily for goods trade intelligence   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Category Mapping Table

```sql
-- Mapping HS chapters/codes to Souvera categories
CREATE TABLE hs_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hs_code_pattern VARCHAR(10) NOT NULL,  -- e.g., "09%" for all Chapter 09
  sector_key VARCHAR(50) NOT NULL,
  category_key VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 0,             -- For overlapping mappings
  
  CONSTRAINT fk_sector FOREIGN KEY (sector_key) 
    REFERENCES souvera_sectors(key)
);

-- Example mappings
INSERT INTO hs_category_mapping (hs_code_pattern, sector_key, category_key, category_label) VALUES
  ('26%', 'mining_critical_minerals', 'ores', 'Ores and Minerals'),
  ('28%', 'mining_critical_minerals', 'inorganic_chemicals', 'Inorganic Chemicals'),
  ('71%', 'mining_critical_minerals', 'precious_metals', 'Precious Metals'),
  ('81%', 'mining_critical_minerals', 'base_metals', 'Other Base Metals'),
  ('09%', 'agriculture_agribusiness', 'coffee_tea_spices', 'Coffee, Tea, and Spices'),
  ('06%', 'agriculture_agribusiness', 'cut_flowers', 'Cut Flowers'),
  ('50%', 'agriculture_agribusiness', 'textiles_apparel', 'Textiles (Silk)'),
  ('61%', 'agriculture_agribusiness', 'textiles_apparel', 'Apparel (Knitted)'),
  ('62%', 'agriculture_agribusiness', 'textiles_apparel', 'Apparel (Not Knitted)');
```

---

## 6. Country / Sector / Product Mapping

### 6.1 Entity Key Types

```typescript
type EntityKeyType = 
  | 'iso3'           // 3-letter country code (NGA, ZAF, KEN)
  | 'iso2'           // 2-letter country code (NG, ZA, KE)
  | 'country_name'   // Full country name
  | 'sector_key'     // Souvera sector key (agriculture_agribusiness)
  | 'hs_code'        // HS code at any level (09, 0901, 090111)
  | 'custom';        // Custom mapping required
```

### 6.2 Entity Lookup Tables

```sql
-- Country key mapping (handles variations)
CREATE TABLE entity_key_country_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key VARCHAR(100) NOT NULL,
  source_key_type VARCHAR(50) NOT NULL,  -- iso3, iso2, name, custom
  country_id UUID NOT NULL,
  
  CONSTRAINT fk_country FOREIGN KEY (country_id) 
    REFERENCES souvera_countries(id),
  CONSTRAINT unique_source_key UNIQUE (source_key, source_key_type)
);

-- Sector key mapping
CREATE TABLE entity_key_sector_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key VARCHAR(100) NOT NULL,
  source_key_type VARCHAR(50) NOT NULL,
  sector_key VARCHAR(50) NOT NULL,
  
  CONSTRAINT fk_sector FOREIGN KEY (sector_key) 
    REFERENCES souvera_sectors(key),
  CONSTRAINT unique_source_key UNIQUE (source_key, source_key_type)
);
```

### 6.3 Mapping Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  ENTITY MAPPING WORKFLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Source Data                Mapping Layer              DB   │
│  ────────────               ─────────────              ──   │
│                                                             │
│  { country: "Nigeria" }  →  Lookup("Nigeria", "name")  →  NGA│
│  { iso3: "NGA" }         →  Lookup("NGA", "iso3")      →  NGA│
│  { iso2: "NG" }          →  Lookup("NG", "iso2")       →  NGA│
│                                                             │
│  { sector: "agriculture" } → Lookup("agriculture", ...)→  agri│
│  { hs_code: "0901" }     →  Lookup("0901", "hs_code")  →  0901│
│                                                             │
│  Unmapped Keys:                                             │
│  - Log warning                                              │
│  - Queue for admin review                                   │
│  - Optional: create mapping suggestion                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Ingestion Trigger Flow

### 7.1 Trigger Types

```typescript
type IngestionTrigger = 
  | 'scheduled'      // Cron-based automatic trigger
  | 'manual'         // Admin-initiated trigger
  | 'file_upload'    // File upload event
  | 'webhook';       // External webhook (future)
```

### 7.2 Ingestion Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   INGESTION PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. TRIGGER                                                 │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│     │ Schedule │   │ Manual   │   │ Upload   │             │
│     └────┬─────┘   └────┬─────┘   └────┬─────┘             │
│          │              │              │                    │
│          └──────────────┼──────────────┘                    │
│                         ▼                                   │
│  2. FETCH          ┌──────────────────┐                     │
│                    │ Connector.fetch() │                     │
│                    └────────┬─────────┘                     │
│                             ▼                               │
│  3. VALIDATE       ┌──────────────────┐                     │
│                    │ Schema Validation │                     │
│                    │ Data Validation   │                     │
│                    └────────┬─────────┘                     │
│                             │                               │
│               ┌─────────────┴─────────────┐                 │
│               ▼                           ▼                 │
│        ┌──────────────┐           ┌──────────────┐         │
│        │ Valid        │           │ Invalid      │         │
│        └──────┬───────┘           └──────┬───────┘         │
│               │                          │                  │
│               ▼                          ▼                  │
│  4. TRANSFORM  ┌──────────────────┐  ┌──────────────────┐  │
│                │ Apply Transform  │  │ Log Errors       │  │
│                │ Map Entities     │  │ Alert Admin      │  │
│                └────────┬─────────┘  └──────────────────┘  │
│                         ▼                                   │
│  5. STAGE      ┌──────────────────┐                         │
│                │ Staging Table    │                         │
│                └────────┬─────────┘                         │
│                         ▼                                   │
│  6. PUBLISH    ┌──────────────────┐                         │
│                │ Publish to Live  │                         │
│                │ Update Freshness │                         │
│                └────────┬─────────┘                         │
│                         ▼                                   │
│  7. AUDIT      ┌──────────────────┐                         │
│                │ Log Completion   │                         │
│                │ Update Stats     │                         │
│                └──────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Ingestion Job Model

```typescript
interface IngestionJob {
  id: string;                    // UUID
  sourceId: string;              // FK to DataSource
  triggerType: IngestionTrigger;
  triggeredBy?: string;          // Admin user ID for manual
  
  // Status
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  
  // Results
  rowsFetched?: number;
  rowsValid?: number;
  rowsInvalid?: number;
  rowsInserted?: number;
  rowsUpdated?: number;
  
  // Errors
  errors?: IngestionError[];
  warnings?: IngestionWarning[];
  
  // Audit
  createdAt: Date;
}

interface IngestionError {
  code: string;
  message: string;
  rowNumber?: number;
  fieldName?: string;
  value?: any;
}
```

### 7.4 Scheduled Ingestion

```typescript
// Cron job configuration for scheduled sources
const scheduledIngestionCron = async () => {
  // Get all active sources with schedules due
  const dueSources = await getDueScheduledSources();
  
  for (const source of dueSources) {
    // Create ingestion job
    const job = await createIngestionJob({
      sourceId: source.id,
      triggerType: 'scheduled'
    });
    
    // Queue for processing
    await queueIngestionJob(job.id);
  }
};

// Run every 15 minutes to check schedules
// Actual ingestion timing controlled by source.schedule.cronExpression
```

---

## 8. Validation and Publish Workflow

### 8.1 Validation Rules

```typescript
interface ValidationRule {
  id: string;
  indicatorId?: string;          // Specific indicator, or null for global
  ruleType: 'required' | 'range' | 'format' | 'uniqueness' | 'reference' | 'custom';
  ruleConfig: Record<string, any>;
  severity: 'error' | 'warning';
  message: string;
}

// Example validation rules
const validationRules: ValidationRule[] = [
  {
    id: 'gdp_positive',
    indicatorId: 'gdp_current_usd',
    ruleType: 'range',
    ruleConfig: { min: 0 },
    severity: 'error',
    message: 'GDP must be a positive value'
  },
  {
    id: 'country_exists',
    ruleType: 'reference',
    ruleConfig: { 
      table: 'souvera_countries', 
      keyField: 'iso3' 
    },
    severity: 'error',
    message: 'Country code not found in reference table'
  },
  {
    id: 'year_reasonable',
    ruleType: 'range',
    ruleConfig: { min: 1960, max: 2030 },
    severity: 'warning',
    message: 'Year outside expected range'
  }
];
```

### 8.2 Publish Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLISH WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐                                               │
│  │ Staged   │                                               │
│  │ Data     │                                               │
│  └────┬─────┘                                               │
│       │                                                     │
│       ▼                                                     │
│  ┌──────────────────┐                                       │
│  │ Validation Pass? │───────── No ──────▶ Review Required   │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           Yes                                               │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │ Auto-Publish     │                                       │
│  │ Enabled?         │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┐                                           │
│     │           │                                           │
│    Yes          No                                          │
│     │           │                                           │
│     ▼           ▼                                           │
│  ┌─────────┐  ┌─────────────────────────────────────┐       │
│  │ Publish │  │ Admin Review                        │       │
│  │ to Live │  │  - View staged data                 │       │
│  └─────────┘  │  - Compare to current               │       │
│               │  - Approve or Reject                │       │
│               └──────────────────┬──────────────────┘       │
│                                  │                          │
│                           ┌──────┴──────┐                   │
│                           │             │                   │
│                        Approve       Reject                 │
│                           │             │                   │
│                           ▼             ▼                   │
│                      ┌─────────┐   ┌─────────────┐          │
│                      │ Publish │   │ Archive     │          │
│                      │ to Live │   │ with Reason │          │
│                      └─────────┘   └─────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Audit Log Requirements

### 9.1 Audit Event Types

```typescript
type AuditEventType = 
  // Source Events
  | 'source.created'
  | 'source.updated'
  | 'source.status_changed'
  | 'source.archived'
  
  // Indicator Events
  | 'indicator.created'
  | 'indicator.updated'
  | 'indicator.published'
  | 'indicator.deprecated'
  
  // Ingestion Events
  | 'ingestion.triggered'
  | 'ingestion.completed'
  | 'ingestion.failed'
  
  // Data Events
  | 'data.staged'
  | 'data.published'
  | 'data.rejected'
  | 'data.corrected';
```

### 9.2 Audit Log Model

```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Info
  event_type VARCHAR(50) NOT NULL,
  event_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Actor
  admin_user_id UUID NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  
  -- Target
  entity_type VARCHAR(50) NOT NULL,   -- source, indicator, data
  entity_id VARCHAR(100) NOT NULL,
  entity_name VARCHAR(255),
  
  -- Change Details
  action VARCHAR(50) NOT NULL,        -- create, update, delete, publish
  changes JSONB,                       -- { field: { old: X, new: Y } }
  metadata JSONB,                      -- Additional context
  
  -- Request Info
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT fk_admin_user FOREIGN KEY (admin_user_id)
    REFERENCES auth.users(id)
);

CREATE INDEX idx_audit_event_type ON admin_audit_log(event_type);
CREATE INDEX idx_audit_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_admin ON admin_audit_log(admin_user_id);
CREATE INDEX idx_audit_timestamp ON admin_audit_log(event_timestamp);
```

### 9.3 Audit Log Retention

- **Hot Storage:** 90 days in primary table
- **Archive:** After 90 days, move to archive table
- **Retention:** 7 years for compliance

---

## 10. Role Permissions

### 10.1 Admin Roles

```typescript
type AdminRole = 
  | 'super_admin'      // Full access to all admin functions
  | 'data_admin'       // Source and indicator management
  | 'content_admin'    // Content curation (existing)
  | 'viewer';          // Read-only admin access
```

### 10.2 Permission Matrix

| Permission | Super Admin | Data Admin | Content Admin | Viewer |
|------------|-------------|------------|---------------|--------|
| **Sources** |
| View sources | ✅ | ✅ | ❌ | ✅ |
| Create source | ✅ | ✅ | ❌ | ❌ |
| Edit source | ✅ | ✅ | ❌ | ❌ |
| Delete source | ✅ | ❌ | ❌ | ❌ |
| Trigger ingestion | ✅ | ✅ | ❌ | ❌ |
| **Indicators** |
| View indicators | ✅ | ✅ | ✅ | ✅ |
| Create indicator | ✅ | ✅ | ❌ | ❌ |
| Edit indicator | ✅ | ✅ | ❌ | ❌ |
| Publish indicator | ✅ | ✅ | ❌ | ❌ |
| **Data** |
| View staged data | ✅ | ✅ | ✅ | ✅ |
| Approve/reject data | ✅ | ✅ | ❌ | ❌ |
| Manual data entry | ✅ | ✅ | ✅ | ❌ |
| **Audit** |
| View audit log | ✅ | ✅ | ✅ | ✅ |
| Export audit log | ✅ | ✅ | ❌ | ❌ |

### 10.3 Permission Enforcement

```typescript
// Middleware for admin API routes
const checkAdminPermission = (requiredPermission: string) => {
  return async (req: Request) => {
    const { user, adminRole } = await getAuthenticatedAdmin(req);
    
    if (!hasPermission(adminRole, requiredPermission)) {
      throw new ForbiddenError(`Permission denied: ${requiredPermission}`);
    }
    
    return { user, adminRole };
  };
};

// Usage
const createSource = async (req: Request) => {
  await checkAdminPermission('sources.create')(req);
  // ... create source logic
};
```

---

## 11. Database Schema Summary

### 11.1 New Tables (Phase 4B)

```sql
-- Source Registry
CREATE TABLE admin_data_sources (...);
CREATE TABLE admin_source_credentials (...);  -- Encrypted
CREATE TABLE admin_source_health_checks (...);

-- Indicator Builder
CREATE TABLE admin_indicators (...);
CREATE TABLE admin_indicator_mappings (...);
CREATE TABLE admin_validation_rules (...);

-- Ingestion
CREATE TABLE admin_ingestion_jobs (...);
CREATE TABLE admin_ingestion_errors (...);
CREATE TABLE admin_staged_data (...);

-- Audit
CREATE TABLE admin_audit_log (...);

-- Entity Mapping
CREATE TABLE entity_key_country_map (...);
CREATE TABLE entity_key_sector_map (...);
```

### 11.2 New Tables (Phase 4C)

```sql
-- HS Code Products
CREATE TABLE product_hs_codes (...);
CREATE TABLE hs_category_mapping (...);
CREATE TABLE agoa_product_eligibility (...);

-- Trade Policy
CREATE TABLE agoa_eligibility (...);
CREATE TABLE afcfta_status (...);

-- Trade Data
CREATE TABLE country_product_supply (...);
CREATE TABLE us_product_demand (...);
CREATE TABLE product_opportunities (...);
```

---

## 12. Risks and Mitigations

### 12.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API source rate limiting | Medium | High | Respect rate limits, implement backoff |
| Credential security breach | High | Low | Encrypt credentials, audit access |
| Data quality issues | Medium | Medium | Validation rules, admin review |
| Performance with large datasets | Medium | Medium | Pagination, caching, async processing |
| Schema changes in sources | Medium | Medium | Schema versioning, validation |

### 12.2 Operational Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Admin errors publishing bad data | High | Medium | Validation, review workflow, rollback |
| Orphaned indicators after source changes | Medium | Medium | Dependency tracking, alerts |
| Audit log gaps | Medium | Low | Redundant logging, monitoring |
| Permission escalation | High | Low | Role enforcement, audit trail |

### 12.3 Data Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Source data licensing violations | High | Medium | Source documentation, license tracking |
| Incorrect entity mapping | Medium | Medium | Mapping review, fuzzy matching |
| Stale data not detected | Medium | Medium | Freshness badges, staleness alerts |
| Data inconsistency across sources | Medium | High | Source priority rules, reconciliation |

---

## 13. Implementation Phases

### 13.1 Phase 4B Implementation (4-6 weeks)

**Week 1-2: Source Registry**
- Database schema for sources
- Admin UI for source management
- Basic API and file connectors
- Connection testing

**Week 3-4: Indicator Builder**
- Database schema for indicators
- Admin UI for indicator definition
- Source field mapping
- Entity mapping

**Week 5-6: Ingestion Pipeline**
- Manual ingestion trigger
- Scheduled ingestion (World Bank)
- Validation pipeline
- Data freshness badges

### 13.2 Phase 4C Implementation (6-8 weeks)

**Week 1-2: HS Code Layer**
- HS code reference data
- AGOA/GSP eligibility data
- Category mapping

**Week 3-4: Trade Data Integration**
- U.S. Census connector
- ITC Trade Map connector
- Supply-demand data model

**Week 5-8: Trade Intelligence Features**
- Supply-demand matrix
- Product opportunity scoring
- Report builder MVP

---

## 14. Success Criteria

### 14.1 Phase 4B Success

- [ ] Source Registry supports 5+ data sources
- [ ] Indicator Builder supports 20+ indicators
- [ ] World Bank scheduled ingestion operational
- [ ] Data freshness badges visible in UI
- [ ] AGOA eligibility status for 49 countries
- [ ] AfCFTA status for 54 countries
- [ ] Audit log captures all admin actions

### 14.2 Phase 4C Success

- [ ] HS code layer covers 500+ products
- [ ] Trade data integrated (Census, ITC)
- [ ] Supply-demand matrix operational
- [ ] Product opportunities calculated
- [ ] Report builder generates country profiles

---

**Document Version:** 1.0 Draft  
**Classification:** Internal Technical  
**Next Review:** After architecture review  
**Owner:** Afronovation Engineering Team
