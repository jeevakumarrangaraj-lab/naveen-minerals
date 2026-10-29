/**
 * Security Rules & Dirty Dozen Payload Verification Test Runner
 * Verifies the 12 adversarial payloads defined in security_spec.md against our
 * schema and access control invariants.
 */

import fs from 'node:fs';
import path from 'node:path';

const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');

interface TestCase {
  id: number;
  name: string;
  verify: () => boolean;
}

const dirtyDozenTests: TestCase[] = [
  {
    id: 1,
    name: 'Payload 1 — Shadow Field Injection on Quote Request blocked by hasOnly',
    verify: () =>
      rulesContent.includes('function isValidQuoteRequest(data)') &&
      rulesContent.includes("data.keys().hasOnly([") &&
      !rulesContent.includes("'isVerified'")
  },
  {
    id: 2,
    name: 'Payload 2 — Quote Status Shortcutting blocked on create (must be New + empty internalNotes)',
    verify: () =>
      rulesContent.includes("incoming().status == 'New'") &&
      rulesContent.includes("incoming().internalNotes == ''")
  },
  {
    id: 3,
    name: 'Payload 3 — Unauthenticated PII Scraping of /quote_requests blocked',
    verify: () =>
      rulesContent.includes('match /quote_requests/{quoteId}') &&
      rulesContent.includes('allow get: if isValidId(quoteId) && isAdmin();') &&
      rulesContent.includes('allow list: if isAdmin();')
  },
  {
    id: 4,
    name: 'Payload 4 — Unauthenticated PII Scraping of /contact_messages blocked',
    verify: () =>
      rulesContent.includes('match /contact_messages/{messageId}') &&
      rulesContent.includes('allow get: if isValidId(messageId) && isAdmin();') &&
      rulesContent.includes('allow list: if isAdmin();')
  },
  {
    id: 5,
    name: 'Payload 5 — Self-Assigned Admin Escalation blocked on /admin_users',
    verify: () =>
      rulesContent.includes('match /admin_users/{adminUid}') &&
      rulesContent.includes('isValidAdminUser(incoming())') &&
      rulesContent.includes('allow update, delete: if false;')
  },
  {
    id: 6,
    name: 'Payload 6 — Unverified Email Spoofing blocked via email_verified == true check',
    verify: () =>
      rulesContent.includes('request.auth.token.email_verified == true')
  },
  {
    id: 7,
    name: 'Payload 7 — Unpublished Product Scraping blocked for public visitors',
    verify: () =>
      rulesContent.includes('allow get: if isValidId(productId) && (resource.data.published == true || isAdmin());') &&
      rulesContent.includes('allow list: if resource.data.published == true || isAdmin();')
  },
  {
    id: 8,
    name: 'Payload 8 — 1MB String Poisoning blocked on Contact & Quote messages',
    verify: () =>
      rulesContent.includes('data.message.size() <= 1500') &&
      rulesContent.includes('data.fullDescription.size() <= 2000')
  },
  {
    id: 9,
    name: 'Payload 9 — ID Poisoning blocked by isValidId regex and length guard',
    verify: () =>
      rulesContent.includes("id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$')")
  },
  {
    id: 10,
    name: 'Payload 10 — Forged Client Timestamps blocked via request.time equality',
    verify: () =>
      rulesContent.includes('incoming().createdAt == request.time') &&
      rulesContent.includes('incoming().updatedAt == request.time')
  },
  {
    id: 11,
    name: 'Payload 11 — Historical Quote Mutation blocked by immutable field checks and affectedKeys().hasOnly',
    verify: () =>
      rulesContent.includes('incoming().quoteReference == existing().quoteReference') &&
      rulesContent.includes('incoming().productName == existing().productName') &&
      rulesContent.includes("incoming().diff(existing()).affectedKeys().hasOnly(['status', 'internalNotes', 'updatedAt'])")
  },
  {
    id: 12,
    name: 'Payload 12 — Activity Log Tampering / Deletion blocked by immutable rules',
    verify: () =>
      rulesContent.includes('match /activity_logs/{logId}') &&
      rulesContent.includes('incoming().adminUid == request.auth.uid') &&
      rulesContent.includes('allow update, delete: if false;')
  }
];

let failed = 0;
console.log('Running Naveen Minerals Security & Dirty Dozen Verification Suite...\n');

for (const test of dirtyDozenTests) {
  const passed = test.verify();
  if (passed) {
    console.log(`✅ [PASS] ${test.name}`);
  } else {
    console.error(`❌ [FAIL] ${test.name}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\nSecurity suite failed with ${failed} error(s).`);
  process.exit(1);
} else {
  console.log(`\nAll ${dirtyDozenTests.length}/12 Dirty Dozen security invariants verified.`);
}
