# Phase 2 — Advanced Product Details and Quote Experience

This phase upgrades the **Naveen Minerals** product detail experience and quotation workflow into a structured, multi-section industrial B2B and decorative product specification and enquiry system while preserving the established Midnight Navy (`#0F172A`), Soft Cream (`#FFF7ED`), Pure White (`#FFFFFF`), and Brand Red (`#DC2626`) design system and Firebase backend.

## User Review & Critical Decisions

> [!IMPORTANT]
> All product information and quotation flows strictly adhere to verified business facts—no unverified chemical compositions, purity percentages, particle mesh sizes, bulk densities (`kg/m³`), stock counts, or pricing calculations will appear anywhere on the public website.

- **Structured Four-Section Product Detail Pages**: Every product detail page will be organized into four explicit, scannable sections: **Overview**, **Common Applications**, **Product Information**, and **Related Products**.
- **Category-Aware Related Products (Industrial vs. Decorative Separation)**:
  - For the six industrial/construction products (*Limestone Powder*, *Calcite Powder*, *Dolomite Powder*, *Feldspar Powder*, *Stone Grit*, and *Quartz Chips*), related recommendations will prioritize products sharing industrial or construction use cases and never misclassify *Kolam Powder* as an industrial mineral.
  - For *Kolam Powder (Rangoli Powder)*, the page will clearly identify its traditional decorative floor-art purpose and only suggest products that have verified decorative uses (*Stone Grit* and *Quartz Chips* for decorative applications) with clear context.
- **Multi-Section Request a Quote Experience**: The quotation form will be structured into three guided sections (**1. Customer & Contact Details**, **2. Product Selection & Quantity Requirements**, and **3. Delivery Destination & Application Notes**) alongside a live selected-product summary card, field-specific inline validation, and an explicit quotation reference confirmation state.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers comprehensive individual product pages for all seven catalogue items (*Limestone Powder*, *Calcite Powder*, *Dolomite Powder*, *Feldspar Powder*, *Stone Grit*, *Quartz Chips*, and *Kolam Powder (Rangoli Powder)*) and a multi-section Request a Quote page that preselects the customer's chosen product and adapts allowed quantity units automatically.
- **Target Audience / Persona**: Industrial procurement managers, ceramic/glass/paint/construction manufacturers, and decorative buyers seeking clear product suitability information and direct quotation requests without misleading unverified specifications.
- **Key Value**: Customers can inspect realistic mountain-shaped studio photography of each mineral, review structured product information and application suitability notes, switch directly to related products, and submit a validated quotation request in a seamless flow.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Product Detail Inspection**: The visitor lands on `/products/:slug`, views the breadcrumb navigation (`Home / Products / [Product Name]`), inspects the high-resolution 4:3 mountain-shaped mineral photograph, reads the concise **Overview**, reviews **Common Applications**, checks the structured **Product Information** panel (Material Category, Form/Appearance, Enquiry Units, Application Scope, and Supply & Grade Verification Note), and explores curated **Related Products**.
  2. **Contextual Quote Preselection**: Clicking **Request a Quote** on any product card or detail page navigates to `/request-quote?product=:slug`, preselecting that exact product, displaying its studio photograph and overview in the form summary card, and populating the appropriate quantity unit options (`Tonnes`, `Bags`, `kg` for industrial minerals; `kg`, `Bags`, `Packets` for *Kolam Powder*).
  3. **Multi-Section Quote Submission & Confirmation**: The customer completes the three-part form with real-time inline field validation. Submitting validates via the backend `/api/quotes/prepare` endpoint and persists to Firestore `/quote_requests`, displaying the generated reference code (`NM-YYYYMMDD-XXXX`) and a summary of the submitted product, quantity, unit, and delivery location.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Clean, authoritative industrial mineral catalogue with editorial clarity, generous whitespace, and zero-pill metadata discipline.
  - *Color Palette & Mood*:
    - Primary Canvas: Pure White (`#FFFFFF`)
    - Secondary / Highlight Surfaces: Soft Cream (`#FFF7ED`) and Light Grey (`#F3F4F6`)
    - Headings & Primary Brand Accents: Midnight Navy (`#0F172A`)
    - Body Copy: Dark Charcoal (`#1F2937`)
    - Primary Conversion CTAs: Brand Red (`#DC2626` with `#B91C1C` hover)
    - Secondary Metallic Accent: Warm Gold (`#D97706`)
  - *Typography & Hierarchy*: `Plus Jakarta Sans` for structured headings, `DM Sans` for body copy, and `JetBrains Mono` (`tabular-nums`) for phone numbers, quantities, and quote reference codes.
  - *Component Styling & Layout*: Responsive 12-column desktop grid (`max-w-7xl`), subtle 1px borders (`#F3F4F6`), single-elevation card depth, and mobile-friendly sticky/accessible action placement.

- **Interactive Feedback & Motion**:
  - Instant inline field-level error feedback when a user leaves a required field incomplete or enters an invalid phone/email/quantity.
  - Smooth product preview updates when switching products inside the Request a Quote selector.
  - Clear loading state during backend + Firestore persistence, and a dedicated confirmation view with a one-click option to submit another enquiry.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Structured Four-Part Product Information Architecture Without Unverified Specs**
  - *Chosen Approach*: Present **Overview**, **Common Applications**, **Product Information** (covering verified attributes: Product Category, Physical Form, Supported Enquiry Units, Usage Classification, and Grade/Suitability Guidance), and **Related Products** without fabricating mesh sizes, whiteness percentages, or chemical formulas.
  - *Why*: B2B buyers require clear, trustworthy documentation of how a material is supplied and ordered while respecting the strict rule against unverified technical claims or pricing.
  - *Alternatives Considered*: Showing placeholder technical tables with "TBD" values was rejected because empty or placeholder specification tables erode trust.

- **Decision 2: Domain-Accurate Related Products Matching**
  - *Chosen Approach*: Map each product to curated related products based on shared application domains:
    - Industrial Powders (*Limestone*, *Calcite*, *Dolomite*, *Feldspar*) suggest relevant industrial powders and mineral raw materials (*Quartz Chips* / *Stone Grit* where ceramic, glass, or construction applications overlap), excluding *Kolam Powder*.
    - *Stone Grit* and *Quartz Chips* suggest complementary crushed/industrial minerals.
    - *Kolam Powder (Rangoli Powder)* is explicitly badged and described as a traditional decorative floor powder, and its related section only highlights items with decorative uses (*Quartz Chips* and *Stone Grit*) accompanied by a clear note distinguishing traditional kolam use from decorative stone applications.
  - *Why*: Prevents confusing industrial procurement buyers while honouring the traditional cultural identity of Kolam Powder.

- **Decision 3: Multi-Section Quotation Form with Live Product Context**
  - *Chosen Approach*: Organize the Request a Quote form into three logical sections with a live product preview card and quick-select unit buttons alongside the unit dropdown (always supporting `Bags` where relevant), backed by field-specific validation states and the existing `/api/quotes/prepare` + Firestore `/quote_requests` persistence pipeline.
  - *Why*: Reduces form friction, confirms to the user that the right mineral product is selected, and ensures error messages appear directly beside the relevant input field as well as in the form summary alert.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Naveen Minerals Client (React)                      │
├──────────────────────────────────────┬─────────────────────────────────────┤
│     Individual Product Detail View   │     Multi-Section Quote Experience  │
│          (/products/:slug)           │           (/request-quote)          │
│                                      │                                     │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Breadcrumb & Product Header    │  │  │ Preselected Product Banner &  │  │
│  │ (Category · Catalogue Context) │  │  │ Live Mineral Preview Card     │  │
│  └───────────────┬────────────────┘  │  └───────────────┬───────────────┘  │
│                  ▼                   │                  ▼                  │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ 1. Overview & Studio Mound Img │  │  │ Section 1: Customer & Company │  │
│  │    (4:3 Mountain Pile Asset)   │  │  │ (Name, Company, Phone, Email) │  │
│  ├────────────────────────────────┤  │  ├───────────────────────────────┤  │
│  │ 2. Common Applications         │  │  │ Section 2: Product & Quantity │  │
│  │    (Verified Use Cases + Note) │  │  │ (7 Products, Qty, Unit: Bags/ │  │
│  ├────────────────────────────────┤  │  │  Tonnes/kg/Packets)           │  │
│  │ 3. Product Information         │  │  ├───────────────────────────────┤  │
│  │    (Supply Form, Enquiry Units,│  │  │ Section 3: Delivery & Notes   │  │
│  │     Enquiry Process & Guidance)│  │  │ (Location, Requirements,      │  │
│  ├────────────────────────────────┤  │  │  Privacy Consent)             │  │
│  │ 4. Curated Related Products    │  │  └───────────────┬───────────────┘  │
│  │    (Industrial vs Decorative)  │  │                  │                  │
│  └───────────────┬────────────────┘  │                  ▼                  │
│                  │                   │  ┌───────────────────────────────┐  │
│                  └───────────────────┼─►│ Client Field Validator        │  │
│                    ?product=:slug    │  └───────────────┬───────────────┘  │
└──────────────────────────────────────┴──────────────────┼──────────────────┘
                                                          │
                                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   Trusted Backend & Firebase Persistence                   │
│                                                                            │
│   1. POST /api/quotes/prepare ──► Rate Limit, Server Validation &          │
│                                   Quote Reference (NM-YYYYMMDD-XXXX)       │
│   2. Firestore Write          ──► /quote_requests/{docId} (Status: New)    │
│   3. Confirmation View        ──► Displays Reference & Submitted Summary   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Product Catalogue State (`AppDataContext`)**: Supplies the seven verified `ProductRecord` items (`limestone-powder`, `calcite-powder`, `dolomite-powder`, `feldspar-powder`, `stone-grit`, `quartz-chips`, `kolam-powder`), each linked to its `/assets/minerals/<slug>.jpg` mountain-shaped studio photograph and allowed quantity units.
- **Product Information Metadata**: Derived deterministically from each product's verified record (`category`, `allowedUnits`, `commonApplications`, and industrial vs. traditional decorative classification) so no unverified technical metrics are ever introduced.
- **Quote Form State**: Tracks `customerName`, `companyName`, `phone`, `email`, `productSlug`, `quantity`, `quantityUnit`, `deliveryLocation`, `message`, `privacyConsent`, field-level validation errors (`fieldErrors`), submission progress (`submitting`), and the confirmed quotation receipt (`submittedReceipt` containing reference code, product name, quantity, unit, and delivery location).

### Interactive Component & State Mapping
- **Product Detail Navigation & Sections**:
  - Clicking section jump links (`Overview`, `Common Applications`, `Product Information`, `Related Products`) smoothly scrolls to the corresponding section on the detail page.
  - Clicking **Request a Quote** passes `?product=<slug>` to `/request-quote`, immediately preselecting that product.
- **Dynamic Product & Unit Synchronization in Quote Form**:
  - Changing the selected product in `/request-quote` updates the live product preview card (showing the product's mountain-shaped studio photo, category, and short description) and resets `quantityUnit` to a valid unit for that product if the previous unit is not applicable (e.g., switching to `kg` or `Bags` when *Kolam Powder* is selected).
  - Clicking a unit quick-selector button or dropdown updates `quantityUnit` immediately.
- **Field-Level Validation & Error Recovery**:
  - Modifying any input clears its specific inline error immediately.
  - Submitting with invalid or missing fields highlights the exact fields with accessible error descriptions (`aria-invalid`, `role="alert"`) and prevents network submission until resolved.
  - If the backend or Firestore write fails, the form preserves all user-entered data and displays a clear error banner without ever reporting a false success.
