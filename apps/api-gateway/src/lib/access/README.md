# Access Control System

Complete access control infrastructure for the Souvera Intelligence Terminal. Enables tier-based feature gating across client and server components.

## Quick Start

### Client Components

```typescript
import { useEntitlements } from '@/hooks/useEntitlements';
import { EntitlementGate, UpgradePrompt } from '@/components/access';

function MyFeature() {
  const { hasEntitlement, currentTier } = useEntitlements();

  // Simple check
  if (!hasEntitlement('trade_data')) {
    return <UpgradePrompt feature="Trade Intelligence" requiredTier="business" />;
  }

  return <TradeIntelligence />;
}
```

### Using EntitlementGate

```typescript
<EntitlementGate
  required="trade_data"
  fallback={<UpgradePrompt feature="Trade Intelligence" requiredTier="business" />}
>
  <TradeIntelligenceModule />
</EntitlementGate>
```

### Server Components

```typescript
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';

export default async function TradePage() {
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return <UpgradePrompt requiredTier="business" />;
  }

  return <TradeIntelligence />;
}
```

### API Routes

```typescript
import { requireEntitlement, createAccessDeniedResponse } from '@/lib/access/server-entitlements';

export async function GET(request: Request) {
  try {
    // Throws if user doesn't have access
    const access = await requireEntitlement('api_access');
    
    // Continue with API logic...
    return Response.json({ data: 'protected data' });
    
  } catch (error) {
    return createAccessDeniedResponse('api_access', 'current_plan');
  }
}
```

## Components

### `<EntitlementGate>`

Conditionally render content based on entitlements.

**Props:**
- `required?: EntitlementKey` - Single entitlement required
- `requiredAll?: EntitlementKey[]` - All entitlements required
- `requiredAny?: EntitlementKey[]` - Any one entitlement required
- `minimumTier?: AccessTier` - Minimum tier required
- `fallback?: ReactNode` - What to show if access denied
- `loadingFallback?: ReactNode` - Loading state

**Examples:**
```typescript
// Single entitlement
<EntitlementGate required="trade_data" fallback={<PaywallBanner />}>
  <TradeModule />
</EntitlementGate>

// Minimum tier
<EntitlementGate minimumTier="business" fallback={<UpgradePrompt />}>
  <BusinessFeatures />
</EntitlementGate>

// Multiple entitlements (all required)
<EntitlementGate
  requiredAll={['trade_data', 'export_access']}
  fallback={<PaywallBanner />}
>
  <ExportButton />
</EntitlementGate>

// Any one entitlement
<EntitlementGate
  requiredAny={['admin_access', 'super_admin_access']}
  fallback={<p>Admin access required</p>}
>
  <AdminPanel />
</EntitlementGate>
```

### `<UpgradePrompt>`

Display upgrade prompt with feature benefits.

**Props:**
- `feature?: string` - Name of the gated feature
- `requiredTier: AccessTier` - Tier required to access
- `featureDescription?: string` - Optional description
- `mode?: 'modal' | 'banner' | 'card'` - Display mode
- `ctaText?: string` - Custom CTA button text

**Examples:**
```typescript
// Modal (default)
<UpgradePrompt
  feature="Trade Intelligence"
  requiredTier="business"
  featureDescription="Access comprehensive trade data for all 74 markets."
/>

// Banner (inline)
<UpgradePrompt
  feature="API Access"
  requiredTier="institutional"
  mode="banner"
/>

// Card (centered)
<UpgradePrompt
  feature="Supply-Demand Matrix"
  requiredTier="investor"
  mode="card"
  ctaText="Unlock Investor Features"
/>
```

### `<PaywallBanner>`

Inline upgrade banner for less intrusive gating.

**Props:**
- `feature: string` - Feature name
- `requiredTier: AccessTier` - Required tier
- `description?: string` - Optional description
- `className?: string` - Additional CSS classes

**Example:**
```typescript
<PaywallBanner
  feature="Export Data"
  requiredTier="institutional"
  description="Export and download data with an Institutional plan."
/>
```

### `<TierBadge>`

Display user's current tier as a badge.

**Props:**
- `tier: AccessTier` - Tier to display
- `showIcon?: boolean` - Show tier icon (default: true)
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')
- `className?: string` - Additional CSS classes

**Example:**
```typescript
<TierBadge tier="business" size="md" showIcon={true} />
```

## Hooks

### `useUserAccess()`

Get current user's complete access information.

**Returns:**
- `access: UserAccess | null` - User's access object
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any

**Example:**
```typescript
const { access, loading, error } = useUserAccess();

if (loading) return <Spinner />;
if (error) return <Error message={error} />;

console.log(access?.planId); // 'business'
console.log(access?.entitlements); // ['trade_data', 'reports_preview', ...]
```

### `useEntitlements()`

Convenient access checking methods.

**Returns:**
- `access: UserAccess | null` - Full access object
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `currentTier: AccessTier | undefined` - User's current tier
- `planRank: number` - Plan rank (0-100)
- `entitlements: string[]` - All entitlements
- `isAuthenticated: boolean` - Is user logged in
- `isAdmin: boolean` - Has admin access
- `isSuperAdmin: boolean` - Has super admin access
- `hasEntitlement(key)` - Check single entitlement
- `hasAllEntitlements(keys)` - Check all entitlements
- `hasAnyEntitlement(keys)` - Check any entitlement
- `hasMinimumTier(tier)` - Check minimum tier
- `getNextTier()` - Get next upgrade tier

**Example:**
```typescript
const {
  currentTier,
  hasEntitlement,
  hasMinimumTier,
  isAdmin,
  getNextTier,
} = useEntitlements();

if (hasEntitlement('trade_data')) {
  // Show trade features
}

if (hasMinimumTier('business')) {
  // Show business features
}

if (isAdmin) {
  // Show admin panel link
}

const nextTier = getNextTier(); // 'investor' if current is 'business'
```

## Server-Side Functions

### `checkServerEntitlement(required)`

Check if user has specific entitlement (server-side).

**Parameters:**
- `required: EntitlementKey` - Required entitlement

**Returns:**
```typescript
{
  hasAccess: boolean;
  access: UserAccess;
  error?: string;
}
```

**Example:**
```typescript
const { hasAccess, access } = await checkServerEntitlement('trade_data');

if (!hasAccess) {
  return <UpgradePrompt requiredTier="business" />;
}
```

### `checkServerMinimumTier(minimumTier)`

Check if user has minimum tier (server-side).

**Parameters:**
- `minimumTier: AccessTier` - Required minimum tier

**Returns:** Same as `checkServerEntitlement`

### `getServerUserAccess()`

Get current user's access (server-side).

**Returns:** `UserAccess`

**Example:**
```typescript
const access = await getServerUserAccess();
console.log(access.planId); // 'business'
```

### `requireEntitlement(required)`

Require entitlement or throw error.

**Parameters:**
- `required: EntitlementKey` - Required entitlement

**Returns:** `UserAccess` (or throws)

**Example:**
```typescript
export async function GET() {
  try {
    const access = await requireEntitlement('api_access');
    // Access granted, continue...
  } catch (error) {
    return Response.json({ error: 'Access denied' }, { status: 403 });
  }
}
```

### `requireMinimumTier(minimumTier)`

Require minimum tier or throw error.

**Parameters:**
- `minimumTier: AccessTier` - Required tier

**Returns:** `UserAccess` (or throws)

### `createAccessDeniedResponse(required, currentPlan)`

Create standardized 403 response.

**Parameters:**
- `requiredEntitlement: EntitlementKey` - What was required
- `currentPlan: string` - User's current plan

**Returns:** `Response` (403 with upgrade info)

**Example:**
```typescript
if (!hasAccess) {
  return createAccessDeniedResponse('trade_data', access.planId);
}
```

## Common Patterns

### Protect Entire Page

```typescript
// app/trade/page.tsx
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';

export default async function TradePage() {
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-12">
        <UpgradePrompt
          feature="Trade Intelligence"
          requiredTier="business"
          mode="card"
        />
      </div>
    );
  }

  return <TradeIntelligence />;
}
```

### Protect Component Section

```typescript
import { EntitlementGate, PaywallBanner } from '@/components/access';

function Dashboard() {
  return (
    <div>
      <PublicSection />
      
      <EntitlementGate
        required="trade_data"
        fallback={
          <PaywallBanner
            feature="Advanced Trade Data"
            requiredTier="business"
          />
        }
      >
        <TradeDataSection />
      </EntitlementGate>
      
      <EntitlementGate
        minimumTier="investor"
        fallback={
          <PaywallBanner
            feature="Supply-Demand Matrix"
            requiredTier="investor"
          />
        }
      >
        <SupplyDemandSection />
      </EntitlementGate>
    </div>
  );
}
```

### Protect API Endpoint

```typescript
// app/api/v1/trade/data/route.ts
import { requireEntitlement, createAccessDeniedResponse } from '@/lib/access/server-entitlements';

export async function GET(request: Request) {
  try {
    // Require 'trade_data' entitlement
    const access = await requireEntitlement('trade_data');
    
    // User has access, continue with logic
    const data = await fetchTradeData();
    
    return Response.json({ data });
    
  } catch (error) {
    // User doesn't have access
    return createAccessDeniedResponse('trade_data', 'public');
  }
}
```

### Conditional UI Elements

```typescript
import { useEntitlements } from '@/hooks/useEntitlements';

function FeatureList() {
  const { hasEntitlement, currentTier } = useEntitlements();

  return (
    <div>
      <Feature name="Intelligence Hub" available={true} />
      
      <Feature
        name="Trade Intelligence"
        available={hasEntitlement('trade_data')}
        upgrade={!hasEntitlement('trade_data') ? 'business' : undefined}
      />
      
      <Feature
        name="API Access"
        available={hasEntitlement('api_access')}
        upgrade={!hasEntitlement('api_access') ? 'institutional' : undefined}
      />
      
      {currentTier && (
        <TierBadge tier={currentTier} className="mt-4" />
      )}
    </div>
  );
}
```

## Access Tier Hierarchy

| Tier | Rank | Key Features |
|------|------|-------------|
| public | 0 | Marketing site, basic previews |
| explorer | 1 | Intelligence hub, basic insights |
| professional | 2 | Full macro data, sector analysis |
| business | 3 | Trade intelligence, 1 report/month |
| investor | 4 | Supply-Demand Matrix, 5 reports/month |
| institutional | 5 | API access, unlimited reports |
| platform_admin | 99 | Admin panel access |
| super_admin | 100 | Full platform control |

## Entitlement Keys

See `packages/entitlements/index.ts` for the complete list of entitlement keys.

Common entitlements:
- `country_identity` - Basic country info
- `headline_macro` - GDP, population teasers
- `full_macro` - Complete macro data
- `trade_data` - Trade intelligence suite
- `forecast_metrics` - Supply-Demand Matrix
- `reports_preview` - Report generation
- `api_access` - API access (Institutional)
- `export_access` - Export/download features
- `admin_access` - Admin panel
- `super_admin_access` - Super admin panel

## Testing

Test with different personas:

```bash
# Test users (all password: PEGWest@1235)
explorer@afronovation.com       # Rank 1
professional@afronovation.com   # Rank 2
business@afronovation.com       # Rank 3
investor@afronovation.com       # Rank 4
institutional@afronovation.com  # Rank 5
```

## Best Practices

1. **Always use server-side checks for sensitive operations** - Client-side checks can be bypassed
2. **Protect API endpoints** - Use `requireEntitlement()` in all API routes
3. **Use appropriate fallbacks** - Modal for page-level, banner for sections, gate for components
4. **Provide clear upgrade paths** - Always link to `/access` page
5. **Test all tiers** - Verify access control works for all personas
6. **Don't expose sensitive data in fallbacks** - Only show what user should see

## Implementation Status

✅ Complete:
- Client-side hooks (`useUserAccess`, `useEntitlements`)
- Access control components (`EntitlementGate`, `UpgradePrompt`, `PaywallBanner`, `TierBadge`)
- Server-side helpers (`checkServerEntitlement`, `requireEntitlement`, etc.)

🚧 Next Steps (Sprint 1B):
- Apply gates to trade intelligence modules
- Protect API endpoints
- Test with all personas
- Add report quota enforcement
