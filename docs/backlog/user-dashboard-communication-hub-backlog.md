# User Dashboard & Communication Hub - Backlog Plan

**Created**: June 14, 2026  
**Priority**: To be implemented after data ingestion and reporting phases  
**Estimated Effort**: 30-46 weeks (7-11 months) for full implementation  
**Status**: Backlogged (Dashboard foundation implemented separately)

---

## Overview

Comprehensive backlog plan for sovereign-level User Dashboard and Communication Hub for both users and admins. This addresses the gap between the strong admin platform (Fortune 5-style console) and the weak user platform (no real dashboard exists).

---

## Current State

### Admin Platform (Strong)
- Fortune 5-style enterprise console at `/admin`
- Data ops, content management, user management, billing, marketing CMS, access matrix
- System notifications exist but are system alerts only

### User Platform (Gaps)
- `/platform/terminal` is a marketing page, not a workspace
- Real intelligence tools at `/country/[iso3]` and `/intelligence/**`
- Profile page has basic settings, read-only plan info
- Reports work per-country but no global reports library
- No `/dashboard` exists

---

## Backlog Items

### High Priority

| ID | Feature | Estimated Effort | Description |
|----|---------|------------------|-------------|
| DASH-002 | Unified Reports Library | 2 weeks | Global view of all generated reports, filters, bulk download, quota tracking |
| DASH-003 | User Messages Inbox | 3-4 weeks | Platform announcements, newsletter preferences, support tickets, notifications |
| ADMIN-COMM-001 | Admin Communication Hub | 4-5 weeks | Individual/mass messaging, audience targeting, templates, delivery tracking |
| ADMIN-INQ-001 | Inquiries Management | 2-3 weeks | Wire up `lead_submissions` inbox, status workflow, assignment, quick actions |

### Medium Priority

| ID | Feature | Estimated Effort | Description |
|----|---------|------------------|-------------|
| DASH-004 | Newsletter Preferences | 1 week | Wire up existing UI stub, frequency controls |
| DASH-005 | Subscription Management | 2-3 weeks | Usage analytics, upgrade flows, billing history |
| ADMIN-TASK-001 | Task Management UI | 3-4 weeks | Unified Kanban board, policy review queue, assignment workflows |
| ADMIN-NL-001 | Newsletter Center | 2-3 weeks | Rich editor, audience selection, scheduling, analytics |

### Low Priority

| ID | Feature | Estimated Effort | Description |
|----|---------|------------------|-------------|
| DASH-006 | API Key Management | 2 weeks | Generate/revoke keys, usage analytics (Institutional tier) |
| DASH-007 | Team Management | 3-4 weeks | Invite members, RBAC, seat management (Institutional tier) |
| DASH-008 | Watchlists & Alerts | 2-3 weeks | Save countries, custom dashboards, threshold alerts |

---

## Phase 1: User Dashboard Foundation (IMPLEMENTED SEPARATELY)

> **Note**: This phase was extracted and implemented immediately to provide users with a real workspace.

- `/dashboard` page with persona-based layouts
- Quick Stats widget
- Recent Activity feed
- Navigation to key features
- Account Menu routing updates

---

## Phase 2: User Communication Hub

### 2.1 Messages & Notifications

**Route**: `/dashboard/messages`

**Features**:
- Platform announcements (from admin)
- Newsletter management (subscribe, unsubscribe, preferences)
- Support ticket tracking
- In-app notifications
- Direct messages from admin/support

**Database Tables**:

```sql
CREATE TABLE souvera_user_messages (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES souvera_profiles(id),
  message_type text, -- announcement, newsletter, support, system
  subject text,
  content text,
  sent_by uuid REFERENCES souvera_profiles(id),
  sent_at timestamptz,
  read_at timestamptz,
  archived_at timestamptz
);

CREATE TABLE souvera_message_threads (
  id uuid PRIMARY KEY,
  user_id uuid,
  subject text,
  status text, -- open, in_progress, resolved, closed
  priority text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE souvera_thread_messages (
  id uuid PRIMARY KEY,
  thread_id uuid REFERENCES souvera_message_threads(id),
  author_id uuid,
  content text,
  is_internal boolean,
  created_at timestamptz
);
```

### 2.2 Newsletter Preferences

**API Endpoints**:
- `GET /api/v1/newsletter/preferences`
- `PUT /api/v1/newsletter/preferences`
- `GET /api/v1/newsletter/history`

**User Controls**:
- Weekly intelligence digest
- Market alerts
- Product updates
- Frequency preferences

---

## Phase 3: Admin Communication Hub

### 3.1 Navigation Updates

Add Operations section to `AdminSidebar.tsx`:

```typescript
{
  id: 'operations',
  label: 'Operations',
  icon: MessageSquare,
  superAdminOnly: true,
  items: [
    { label: 'Communication Hub', href: '/admin/operations/communications' },
    { label: 'Inquiries & Requests', href: '/admin/operations/inquiries' },
    { label: 'Task Management', href: '/admin/operations/tasks' },
    { label: 'Newsletter Center', href: '/admin/operations/newsletter' },
  ]
}
```

### 3.2 Communication Hub

**Route**: `/admin/operations/communications`

**Features**:
- Compose Message: Individual or mass communication
- Target Audience: Filter by tier, country, activity, signup date
- Message Types: Announcement, newsletter, alert, promotional
- Scheduling: Send now or schedule
- Templates: Pre-built message templates
- Delivery Tracking: Sent, delivered, read, clicked

**API Endpoints**:
- `POST /api/v1/admin/communications/send`
- `GET /api/v1/admin/communications`
- `GET /api/v1/admin/communications/[id]/stats`
- `POST /api/v1/admin/communications/schedule`

### 3.3 Inquiries & Requests Management

**Route**: `/admin/operations/inquiries`

Wire up existing `lead_submissions` table:

**Features**:
- Inbox view with filters
- Status workflow: New → In Review → Contacted → Qualified/Disqualified → Converted
- Assignment to team members
- Internal notes and history
- Quick actions: Reply, Schedule Call, Provision User, Archive

**Database Extensions** to `lead_submissions`:
- `assigned_to` uuid
- `internal_notes` text
- `last_contacted_at` timestamptz
- `follow_up_date` date
- `conversion_data` jsonb

### 3.4 Task Management

**Route**: `/admin/operations/tasks`

**Task Sources**:
- Policy review queue (`souvera_policy_review_queue`)
- Content review (News Pulse, Curated News)
- User onboarding tasks
- Data quality issues
- Manual admin tasks

**Features**:
- Kanban board view
- List view with filters
- Task assignment
- Priority levels
- Due dates and reminders

**Database**:

```sql
CREATE TABLE souvera_admin_tasks (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  task_type text,
  source_table text,
  source_id text,
  assigned_to uuid REFERENCES souvera_profiles(id),
  created_by uuid REFERENCES souvera_profiles(id),
  status text, -- todo, in_progress, review, done, cancelled
  priority text, -- low, medium, high, urgent
  due_date date,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
```

### 3.5 Newsletter Center

**Route**: `/admin/operations/newsletter`

**Features**:
- Compose Newsletter: Rich editor with templates
- Audience Selection: By tier, country interest, activity
- Content Blocks: Drag-and-drop sections
- Preview & Test: Send test emails
- Schedule: Immediate or scheduled
- Analytics: Open rates, click rates, unsubscribes
- A/B Testing: Subject line variants

---

## Phase 4: Advanced User Features

### 4.1 API Key Management (Institutional)

**Route**: `/dashboard/api`

- Generate/revoke API keys
- Usage analytics per key
- Rate limit monitoring
- API documentation embedded
- Webhook configuration

### 4.2 Team Management (Institutional)

**Route**: `/dashboard/team`

- Invite team members
- Role-based access control
- Seat management
- Usage by team member
- Shared reports and watchlists

### 4.3 Watchlists & Saved Views

- Save countries to watchlists
- Custom indicator dashboards
- Saved comparisons
- Alert rules (notify when indicator crosses threshold)

---

## Dependencies

- Email service provider (SendGrid/Mailgun/AWS SES)
- Real-time notifications (Pusher, Ably, or Socket.io)
- Rich text editor (TipTap, Lexical, or Quill)
- Email template framework (MJML or React Email)
- Task queue for scheduled sends (Bull, BullMQ)

---

## Success Metrics

### User Dashboard
- Daily active users on `/dashboard` (target: 70%)
- Reports library usage
- Upgrade conversion rate

### Communication Hub
- Admin messages sent per month
- User message open rate (target: >60%)
- Support ticket response time (target: <24 hours)
- Newsletter open rate (target: >25%)
- Inquiry → conversion rate (target: >15%)

### Task Management
- Task completion rate (target: >90%)
- Overdue tasks (target: <10%)

---

## Implementation Notes

- Implement after data ingestion and reporting phases complete
- Start with admin communication hub for immediate operational value
- User messaging system should integrate with existing notification patterns
- Consider phased rollout: internal users first, then broader release
