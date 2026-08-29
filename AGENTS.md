<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Architectural Guidelines & AI Agent Rules (Next.js + Supabase)

You are an expert Full-Stack Engineer specializing in Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, Zustand, and Supabase. Adhere strictly to the following standards, directory structures, database policies, and implementation rules across all created or modified files for "Sehatak - صحتك".

---

1. Unified Project Structure (Next.js + Supabase)

The project uses Next.js with Supabase as the Backend-as-a-Service (BaaS) with full i18n and background notification services:

root/
├── public/
│   ├── sw.js                         # Service Worker for background Web Push notifications
│   ├── manifest.json                 # PWA Web App Manifest configuration
│   ├── icons/                        # App & medicine type icons
│   └── sounds/                       # Notification alert chimes
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Dynamic subpath routing for i18n (en / ar)
│   │   │   ├── (auth)/               # Auth route groups (login, register, reset-password)
│   │   │   ├── (dashboard)/          # Protected patient app routes (dashboard, medications, appointments, settings)
│   │   │   ├── (marketing)/          # Public pages (landing, about, contact, terms, privacy)
│   │   │   ├── layout.tsx            # Locale Root Layout (sets lang and dir="ltr|rtl")
│   │   │   ├── loading.tsx           # Global Route Loading Skeleton
│   │   │   ├── error.tsx             # Global Error Boundary fallback
│   │   │   ├── not-found.tsx         # 404 UI
│   │   │   └── page.tsx              # Landing page entry
│   │   │
│   │   └── api/                      # Next.js BFF / Webhook Handlers
│   │       ├── push/                 # Web Push subscription endpoints (subscribe/trigger)
│   │       ├── telegram/webhook/     # Telegram Bot webhook & 1-click deep link handler
│   │       └── cron/                 # Scheduled background reminder execution webhook
│   │
│   ├── messages/                     # Translation dictionaries (i18n)
│   │   ├── en.json                   # Pure English strings
│   │   └── ar.json                   # Pure Arabic strings
│   │
│   ├── features/                     # Modular domain features (Feature-Driven Slicing)
│   │   ├── auth/                     # Authentication & session management
│   │   ├── dashboard/                # Daily timeline, adherence metrics, meal anchors
│   │   ├── medications/              # Medication catalog, multi-step creation, dose logs
│   │   ├── appointments/             # Doctor visits, calendar, prescription uploads
│   │   └── notifications/            # Web Push manager, Service Worker hooks, Telegram sync
│   │       ├── components/           # Feature-specific UI components
│   │       ├── hooks/                # Feature TanStack Query hooks, Realtime, & local state
│   │       ├── services/             # Supabase data operations, Storage, RPC, & mutations
│   │       ├── types/                # Feature DTOs, schemas, and parameter types
│   │       ├── utils/                # Feature-specific calculation and format helpers
│   │       └── index.ts              # Public feature barrel export
│   │
│   ├── components/                   # Shared & Reusable UI Components
│   │   ├── ui/                       # Primitive atomic elements (Button, Input, Modal, Dropdown)
│   │   ├── layout/                   # Global structures (Navbar, Sidebar, Footer)
│   │   └── feedback/                 # Feedback elements (Skeletons, ErrorBoundary, Toast container)
│   │
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients & SSR configuration
│   │   │   ├── client.ts             # Browser client (createBrowserClient)
│   │   │   ├── server.ts             # Server client (createServerClient with cookies)
│   │   │   ├── middleware.ts         # Session refresh & route protection helper
│   │   │   └── admin.ts              # Service role client (Server-only / restricted)
│   │   ├── push/                     # web-push library configuration & VAPID keys
│   │   └── query-client.ts           # TanStack Query Client initialization & defaults
│   │
│   ├── hooks/                        # Global reusable hooks (useMediaQuery, useDebounce)
│   ├── stores/                       # Global client state (Zustand: UI panels, dynamic meal offsets)
│   ├── utils/                        # Shared pure utility functions (date formatters, meal calculators)
│   ├── types/
│   │   ├── database.types.ts         # Auto-generated Supabase database schema types
│   │   └── index.ts                  # Global application-wide types & unified response interfaces
│   ├── constants/                    # Global config, navigation menus, error keys
│   └── styles/                       # Tailwind CSS global styling & animations
│
├── supabase/                         # Local Supabase development & migrations
│   ├── migrations/                   # SQL migration files (Tables, RLS, RPC functions, Indexes)
│   ├── functions/                    # Supabase Edge Functions (e.g. dispatch-reminders)
│   └── seed.sql                      # Initial development seed data
│
├── middleware.ts                     # Next.js root middleware (i18n routing & Supabase session refresh)
└── agent.md                          # AI Agent guidelines

---

2. Standardized API & Service Response Contract

All backend responses, Route Handlers (/api), RPC functions, and frontend service wrappers must return a predictable structure:

Interface:
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: string[] | Record<string, string>;
}

- If an API or database call fails, return: { success: false, data: null, message: "Error details...", errors: ... }
- If an API or database call succeeds, return: { success: true, data: result, message: "Success message" }

---

3. Next.js Server Components, Actions & Client Boundaries

A. Server vs Client Component Boundaries
- Default to React Server Components (RSC) for initial page renders, static content, and SEO metadata.
- Use 'use client' strictly at the leaf level when interactivity (event listeners, browser APIs, React state/hooks) is required.
- Pass server-fetched data as props to Client Components or prefetch into TanStack Query hydration boundaries.

B. Server Actions
- Use Server Actions for server-side mutations, form actions, and cache revalidation (revalidatePath / revalidateTag).
- Server Actions must validate inputs with Zod and return the standard ApiResponse structure.

---

4. Supabase Integration, Auth & Security Standards

A. Supabase Client Contexts
- Browser Components ('use client'): Use createBrowserClient from @supabase/ssr.
- Server Components & Server Actions: Use createServerClient from @supabase/ssr with cookie handling.
- Never use the service role key on the client side.

B. Row Level Security (RLS) & Database Integrity
- Every PostgreSQL table created must have RLS explicitly enabled: ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
- Write dedicated policies for SELECT, INSERT, UPDATE, and DELETE operations based on auth.uid().
- Rely on database types imported directly from types/database.types.ts for all Supabase queries.

C. Database Transactions & RPC (Stored Procedures)
- Multi-step transactional logic (e.g., batch scheduling, inventory deductions, status transitions) must NOT be executed as separate client-side queries.
- Implement them as atomic PostgreSQL functions (PL/pgSQL / RPC) in supabase/migrations/ and invoke them via supabase.rpc('function_name', payload).

D. Indexing & Query Optimization
- Always create explicit indexes (CREATE INDEX idx_... ON table_name(column_name);) in SQL migrations for columns frequently queried, filtered, or joined (e.g., user_id, scheduled_for, appointment_date, status, foreign keys).

E. Auth & Route Protection (Middleware)
- Use middleware.ts to refresh expired Supabase auth sessions via @supabase/ssr and route localized paths.
- Implement strict route guards:
  1. Unauthenticated users attempting to access protected routes (e.g., /[locale]/(dashboard)) must be redirected to /[locale]/login.
  2. Authenticated users trying to access auth pages (e.g., /[locale]/login, /[locale]/register) must be redirected to /[locale]/dashboard.

F. Environment Variables Security
- Public keys: Only prefix with NEXT_PUBLIC_ if required on the client (e.g., NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY).
- Secret keys: Never use NEXT_PUBLIC_ on sensitive keys (e.g., SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, VAPID_PRIVATE_KEY). Access them exclusively on the server side.

---

5. Media Storage & Optimization

A. Supabase Storage Standards
- Organize uploaded assets into dedicated, categorized storage buckets (e.g., prescriptions, medical-reports, user-avatars).
- Always validate file size and allowed MIME types (JPEG, PNG, WebP, PDF) on the client/server before triggering uploads.
- Apply appropriate RLS policies on storage.objects to control public vs. private bucket access.

B. Image Optimization
- Always use Next.js next/image (<Image />) for all remote and local images.
- Provide explicit width, height, and sizes attributes with alt text.
- Configure allowed remote Supabase storage hostnames in next.config.mjs.

---

6. Data Fetching, Realtime, Caching, Routing & Toast System

A. Real Data & No-Mocking Mandate
- Strict No-Mocking Rule: Never inject hardcoded placeholder arrays, fake objects, or dummy JSON unless explicitly asked.
- Build and connect real Supabase queries with actual database tables.

B. TanStack Query Caching & Deduplication
- Manage all Supabase data fetching through TanStack Query hooks.
- Configure distinct, hierarchical queryKey arrays (e.g., ['medications', 'list', locale], ['appointments', 'detail', id]).
- Set appropriate staleTime and gcTime to eliminate redundant network requests and duplicate fetches.
- Invalidate relevant query keys on mutations (useMutation) to keep UI synchronized with the database.

C. Optimistic Updates
- For quick user interactions (e.g., marking a dose as taken/skipped), implement optimistic UI updates using onMutate, onError (rollback), and onSettled in TanStack Query hooks.

D. URL State & Dynamic Routing
- Sync filters, search queries, pagination, and sorting directly with URL search parameters using useSearchParams and useRouter for shareable, bookmarkable UI states.

E. Toast & Notification Feedback Rules
- Every user-triggered action/mutation must show explicit toast feedback (e.g., using sonner):
  1. If the action is a network/API request: Display the actual dynamic response message or server error returned from the backend (response.message or error.message).
  2. If the action is local/custom: Display the localized descriptive UI message.

F. Supabase Realtime Subscriptions
- Listen to database changes (INSERT, UPDATE, DELETE) using Supabase channel subscriptions inside dedicated hooks (e.g., live medication log sync across multiple open devices).
- Sync realtime events directly into TanStack Query's cache using queryClient.setQueryData to update the UI instantly without triggering full refetches.

---

7. Internationalization (i18n) & Localization Standards

A. Route-Level Localization
- All user-facing views must reside under the `/[locale]/` dynamic segment (supporting strictly `en` and `ar`).
- Root layouts must automatically set `lang={locale}` and `dir={locale === 'ar' ? 'rtl' : 'ltr'}`.
- Font management: Load Inter/Plus Jakarta Sans for English and Cairo/Tajawal for Arabic with proper CSS font swapping.

B. Strict Separation of Locales
- Never mix English and Arabic labels in the same UI view.
- All static strings, form labels, tooltips, validation messages, and toast feedback must be consumed exclusively via translation dictionaries (`messages/en.json` and `messages/ar.json`).

---

8. Notification Engine & Background Scheduling Standards

A. Web Push & Service Worker Integration
- Browser push notification subscriptions must be managed via standard Web Push API / VAPID keys and persisted in `push_subscriptions`.
- Service worker (`public/sw.js`) must strictly handle background `push` and `notificationclick` events without relying on open tabs.
- Notifications must include action buttons (e.g., "Mark as Taken", "Dismiss") and redirect properly on click.

B. Telegram Deep Linking & Fallback Bot
- One-click Telegram account linking must utilize standard deep linking: `https://t.me/<BOT_USERNAME>?start=${userId}`.
- Webhook endpoints under `/api/telegram/webhook/route.ts` must validate incoming tokens, extract `message.chat.id` and `userId`, persist it to `profiles.telegram_chat_id`, and reply with an immediate localized confirmation.

C. Scheduled Reminder Execution
- Recurring checks and dose dispatches must run via Supabase `pg_cron` calling Edge Functions or authenticated Next.js API routes every minute without client polling.
- Reminder computation must support interval hours, fixed times, and dynamically shifted meal offsets for the current day.

---

9. Code & Architecture Rules (Strict Enforcement)

A. Component Decoupling & Thin Pages
- Thin Pages Rule: page.tsx must only extract route params/searchParams, generate SEO metadata, and assemble feature components. Never write heavy logic, inline fetch calls, or raw queries inside page.tsx.
- Separation of Concerns:
  1. UI Component: Pure presentation and layout.
  2. Custom Hook: State, TanStack Query wrappers, Realtime listeners, mutation triggers.
  3. Service: Supabase queries, RPC calls, Storage uploads, and payload transformation returning standard ApiResponse.
  4. Types: Strict TypeScript schemas.

B. Mandatory UI State Handling & Error Boundaries
- Every data-dependent component must explicitly implement 4 states:
  1. Loading State: Skeleton loaders tailored to the layout.
  2. Error State: User-friendly localized message with a retry action.
  3. Empty State: Clear placeholder when data arrays/records are empty.
  4. Success State: Standard data render.
- Ensure error.tsx is present across major route boundaries to catch runtime exceptions safely.

C. Design System & Light Mode Aesthetic
- Color Palette: Strictly Medical Clean Light Mode (Whites, Mint/Teal `#008080`, Medical Cyan `#0077B6`, Slate borders `#E2E8F0`).
- No Random Styling: Never introduce arbitrary unconfigured CSS values or unauthorized Dark Mode classes.
- Icons: Use `lucide-react` as the standard icon library. Avoid mixing multiple icon libraries.
- UI Primitives: Reuse atomic components from `components/ui/` rather than creating new basic inputs or buttons.

D. State Management & Forms
- Server State: TanStack Query exclusively.
- Global Client State: Zustand stores for non-server data (e.g., dynamic meal time shifts for the current day).
- Local State: Standard useState / useReducer for single-component transient state.
- Forms: Use react-hook-form paired with zod for validation schemas.

E. Strict TypeScript & Validation
- No `any` types allowed. Every function argument, return type, and Supabase query must be explicitly typed.
- Match all frontend forms and mutations with Zod schemas.

F. Code Output Delivery
- Never truncate code outputs with comments like `// ... rest of code`. Always output full files or complete, continuous functional blocks.