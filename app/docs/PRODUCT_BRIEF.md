# LastCall — Product Brief

## Purpose

LastCall helps commercial kitchens redirect safe, surplus hot food at closing time to nearby NGOs. It supports SDG 12 (responsible consumption and production) and SDG 2 (zero hunger) by making a time-sensitive handoff visible, traceable, and simple.

## Primary users

- **Kitchen staff:** post food that would otherwise be discarded and manage pickup handoffs.
- **NGO coordinators:** find eligible food nearby, claim it quickly, and confirm collection.

## MVP routes

| Route | User | Primary outcome |
| --- | --- | --- |
| `/kitchen` | Kitchen staff | Create and monitor surplus-food listings. |
| `/ngo` | NGO coordinator | Discover eligible listings and claim one before its deadline. |

## Core workflow

1. Kitchen staff records the food, quantity, allergen information, packaging state, pickup location, and collection deadline.
2. The listing is marked `available` while it remains inside the configured safe collection window.
3. An NGO reviews available nearby listings and submits a claim.
4. The kitchen sees the claimant and pickup details, then prepares the handoff.
5. At collection, the NGO confirms pickup and the listing becomes `collected`.
6. Listings automatically become `expired` once their safe collection deadline passes and can no longer be claimed.

## Safety guardrails

- The kitchen must provide a prepared-at time and safe collection deadline for every listing.
- The interface must visually prioritize the remaining claim time and clearly mark expired food as unavailable.
- Required disclosures: allergens, quantity/servings, packaging/temperature note, pickup instructions, and contact method.
- A claim should reserve the listing immediately to prevent double claims.
- LastCall coordinates a handoff; kitchens and NGOs remain responsible for their own applicable food-safety procedures, storage, transport, and local compliance.

## MVP listing fields

| Field | Description |
| --- | --- |
| Food name and description | What is available and any relevant preparation detail. |
| Quantity | Servings, trays, or another clear unit. |
| Prepared at | When the food was made or removed from service. |
| Claim deadline | Last time an NGO may reserve it. |
| Pickup window | Earliest and latest collection time. |
| Location | Kitchen address or pickup point. |
| Allergens and dietary tags | Plain-language allergen notice plus vegetarian/vegan/halal tags where known. |
| Packaging and handling notes | Sealed containers, hot/cold holding state, or handling instruction. |
| Status | `available`, `claimed`, `collected`, or `expired`. |

## Success measures

- Listings posted and claimed before expiry.
- Portion count diverted from disposal.
- Median time from posting to claim.
- Completed pickups divided by claims.
- Expiry and cancellation rate.

## Out of scope for the hackathon MVP

- Payments, delivery dispatch, and route optimization.
- Automated regulatory certification or temperature-sensor integrations.
- Multi-location enterprise administration.
- Public consumer ordering.
