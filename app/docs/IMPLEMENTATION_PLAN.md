# LastCall — Implementation Plan

## Scope and assumptions

Build a responsive, front-end-first hackathon demo with Next.js App Router, TypeScript, and Tailwind CSS. Use mocked listings and local UI state for the first demo; isolate data access behind typed functions so a database can replace mock data later.

## Information architecture

```text
/
├─ /kitchen       Kitchen dashboard
│  ├─ Create listing form
│  ├─ Active / claimed / expired listing cards
│  └─ Pickup handoff details
└─ /ngo           NGO discovery dashboard
   ├─ Urgent available-listing feed
   ├─ Filters and listing details
   └─ Claim confirmation state
```

## Route requirements

### `/kitchen`

- Prominent “Post surplus food” action opening an inline form or modal.
- Form validation for required safety and pickup fields.
- Dashboard summary: available, claimed, collected, and expired counts.
- Listing cards showing status, remaining safe time, quantity, pickup window, and claimant when present.
- Clear handoff state after an NGO claim, including NGO name and collection instructions.

### `/ngo`

- Feed ordered by urgency, with expired and claimed listings excluded from claim actions.
- Each listing displays food, quantity, allergens, time remaining, pickup location, and handling note.
- Lightweight filters for distance/location, dietary tags, quantity, and pickup time.
- Claim flow with a confirmation step and immediate reserved state on success.
- Empty states for no matching listings and no active claims.

## Shared UI and visual direction

- Warm, practical civic-service design: food-forward photography or illustration area, dark text, generous whitespace, and accessible high-contrast status colors.
- Shared header with LastCall wordmark, route switcher, and a visible “safe pickup window” explanation.
- Reusable status badge, countdown, listing card, field label, empty state, and toast/confirmation components.
- Mobile-first layouts: single-column cards on small screens; dashboard grids at larger widths.
- Never convey listing status or urgency through color alone.

## Data model and state transitions

```text
available --claim--> claimed --confirm pickup--> collected
    |
    └--deadline passes--> expired
claimed --deadline/cancellation--> available or expired (policy decision)
```

Recommended types:

- `FoodListing`: listing details, safety metadata, pickup details, timestamps, and status.
- `Kitchen`: name, address, contact, and operating details.
- `Ngo`: name, service area, contact, and capacity note.
- `Claim`: listing ID, NGO ID, claimant details, claim timestamp, and pickup confirmation timestamp.

## Build sequence

1. Define shared TypeScript models, mock listings, status helpers, and claim-window calculations.
2. Establish global visual tokens, shell, navigation, responsive spacing, and accessible color states.
3. Build `/kitchen`: dashboard metrics, create-listing form, validation, and listing lifecycle views.
4. Build `/ngo`: urgent feed, filters, details, claim confirmation, and local reservation behavior.
5. Add empty/loading/error states, keyboard behavior, form labels, focus management, and screen-reader status updates.
6. Verify mobile and desktop layouts; run lint, type checks, and a production build.

## Demo scenario

Seed the demo with at least three listings: one urgent available item, one claimed item awaiting pickup, and one expired item. Demonstrate a kitchen post followed by an NGO claim, then show the listing move out of the available feed.

## Decisions needed before a production build

- Confirm the governing food-safety jurisdiction and required retention/audit fields.
- Decide whether kitchens approve claims or whether NGO claims reserve instantly.
- Define the cancellation and no-show policy.
- Select authentication, database, notifications, maps, and hosting providers.
