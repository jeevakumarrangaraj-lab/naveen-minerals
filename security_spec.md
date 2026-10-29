# Security Specification — Naveen Minerals Firestore & Storage

## 1. Data Invariants

1. **Default-Deny Safety Net**: Any path not explicitly matched is denied for all `read` and `write` operations.
2. **Administrator Authorization (`isAdmin`)**:
   - No client token custom claims are trusted without verification.
   - An authenticated user is an administrator ONLY if `request.auth != null && request.auth.token.email_verified == true` AND either:
     - Their email matches the bootstrapped owner email (`jeevakumarrangarajk@gmail.com` or `usnnaveen@gmail.com`), OR
     - A document exists at `/databases/$(database)/documents/admin_users/$(request.auth.uid)` with `role == 'admin'`.
3. **Public Catalogue Read Boundaries (`/products/{productId}`)**:
   - Unauthenticated and non-admin visitors can `get` or `list` a product ONLY when `resource.data.published == true`.
   - Unpublished draft products can ONLY be read (`get`/`list`) by `isAdmin()`.
   - Only `isAdmin()` can `create`, `update`, or `delete` product documents, and all mutations must satisfy `isValidProduct(incoming())` plus strict timestamp and immutable `createdAt`/`id` checks.
4. **Public Business Settings (`/business_settings/{settingId}`)**:
   - Public visitors can `get` `/business_settings/main`.
   - Only `isAdmin()` can `create` or `update` `/business_settings/main` with strict schema validation (`isValidBusinessSettings`).
5. **Private Customer Quote Requests (`/quote_requests/{quoteId}`)**:
   - Public users can NEVER `get`, `list`, `update`, or `delete` any document in `/quote_requests`.
   - Public users may `create` a quote request ONLY if:
     - Document ID matches `isValidId(quoteId)`
     - Payload strictly matches `isValidQuoteRequestCreate(incoming())`
     - `status == 'New'` and `internalNotes == ''` (prevents status shortcutting or internal note injection)
     - `privacyConsent == true`
     - `quoteReference` matches `^NM-Q-[0-9]{8}-[A-Z0-9]{6}$`
     - `createdAt == request.time` and `updatedAt == request.time`
   - Only `isAdmin()` can `get`, `list`, or `update` quote requests, and updates must preserve immutable customer submission fields (`quoteReference`, `customerName`, `phone`, `email`, `productSlug`, `productName`, `quantity`, `quantityUnit`, `deliveryLocation`, `message`, `privacyConsent`, `createdAt`).
6. **Private Contact Messages (`/contact_messages/{messageId}`)**:
   - Public users can NEVER `get`, `list`, `update`, or `delete` any document in `/contact_messages`.
   - Public users may `create` a contact enquiry ONLY if `status == 'New'`, `internalNotes == ''`, `privacyConsent == true`, `createdAt == request.time`, `updatedAt == request.time`, and `isValidContactMessageCreate(incoming())` passes.
   - Only `isAdmin()` can `get`, `list`, or `update` contact messages.
7. **Admin Registry (`/admin_users/{adminUid}`)**:
   - Public users cannot read or write `/admin_users`.
   - Only `isAdmin()` can read or register/update admin user documents, preventing self-assigned privilege escalation.
8. **Activity Logs (`/activity_logs/{logId}`)**:
   - Only `isAdmin()` can read or create activity logs; `adminUid` must equal `request.auth.uid` and `createdAt == request.time`. Logs are immutable once created (`allow update, delete: if false;`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Shadow Field Injection on Quote Request (`isVerified: true`)**:
   - Target: `POST /quote_requests/q_shadow_1`
   - Attack: Includes valid quote fields plus `"isVerified": true`.
   - Defense: Rejected by `data.keys().hasOnly(...)` in `isValidQuoteRequest`.
2. **Payload 2 — Quote Status Shortcutting (`status: "Quotation Prepared"`)**:
   - Target: `POST /quote_requests/q_shortcut_2`
   - Attack: Anonymous visitor sets initial status to `"Quotation Prepared"` or adds `"internalNotes": "Approved"`.
   - Defense: Rejected by `incoming().status == 'New' && incoming().internalNotes == ''`.
3. **Payload 3 — Unauthenticated PII Scraping (`GET / LIST /quote_requests`)**:
   - Target: `LIST /quote_requests` as anonymous or regular signed-in non-admin user.
   - Defense: Rejected because `allow get, list: if isAdmin();`.
4. **Payload 4 — Unauthenticated PII Scraping (`GET / LIST /contact_messages`)**:
   - Target: `GET /contact_messages/msg_1` as non-admin user.
   - Defense: Rejected because `allow get, list: if isAdmin();`.
5. **Payload 5 — Self-Assigned Admin Escalation (`PUT /admin_users/attacker_uid`)**:
   - Target: Non-admin user writes `{ uid: 'attacker_uid', email: 'hacker@example.com', role: 'admin' }`.
   - Defense: Rejected because `allow create, update: if isAdmin() ...`.
6. **Payload 6 — Unverified Email Spoofing (`email_verified: false`)**:
   - Target: Attacker signs in with unverified token claiming `jeevakumarrangarajk@gmail.com` and attempts `DELETE /products/limestone-powder`.
   - Defense: Rejected because `isAdmin()` requires `request.auth.token.email_verified == true`.
7. **Payload 7 — Unpublished Product Scraping (`GET /products/draft-mineral`)**:
   - Target: Public visitor attempts to read a product where `published == false`.
   - Defense: Rejected because public `get` and `list` require `resource.data.published == true`.
8. **Payload 8 — Denial of Wallet / 1MB String Poisoning on Contact Form**:
   - Target: Public visitor submits a 50,000-character `message` in `/contact_messages`.
   - Defense: Rejected by `data.message.size() <= 1500`.
9. **Payload 9 — ID Poisoning Attack**:
   - Target: Creating `/quote_requests/invalid..id$$$` or 500-char ID.
   - Defense: Rejected by `isValidId(quoteId)`.
10. **Payload 10 — Forged Client Timestamp (`createdAt` in the past)**:
    - Target: Submitting a quote request with `createdAt: Timestamp(2020, 1, 1)`.
    - Defense: Rejected by `incoming().createdAt == request.time`.
11. **Payload 11 — Historical Quote Mutation by Admin**:
    - Target: Admin updates a quote status and accidentally or maliciously overwrites `customerName` or `productName` or `createdAt`.
    - Defense: Rejected because quote update rule restricts `affectedKeys().hasOnly(['status', 'internalNotes', 'updatedAt'])`.
12. **Payload 12 — Activity Log Tampering / Deletion**:
    - Target: Attacker or user attempts to modify or delete an audit log in `/activity_logs/{logId}`.
    - Defense: Rejected because `allow update, delete: if false;` on `/activity_logs`.
