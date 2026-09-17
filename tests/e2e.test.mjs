import { test } from "node:test";
import assert from "node:assert/strict";

const API_BASE = "http://localhost:5000/api";

test("1. Healthcheck returns ok", async () => {
  const res = await fetch(`${API_BASE}/healthz`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");
});

test("2. Case creation and user isolation", async () => {
  // User A creates a case
  const userA = "test-user-a";
  const createResA = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userA },
    body: JSON.stringify({
      merchantLabel: "Merchant A",
      itemLabel: "Wireless Mouse",
      orderReference: "ORD-AAA-01",
      requestedAmountPaise: 129900,
    }),
  });
  assert.equal(createResA.status, 201);
  const caseA = await createResA.json();
  assert.ok(caseA.id);
  assert.equal(caseA.ownerId, userA);
  assert.equal(caseA.version, 1);

  // User B tries to read User A's case -> must receive 404 (isolation)
  const userB = "test-user-b";
  const readResB = await fetch(`${API_BASE}/cases/${caseA.id}`, {
    headers: { "x-user-id": userB },
  });
  assert.equal(readResB.status, 404);

  // User A can read their own case
  const readResA = await fetch(`${API_BASE}/cases/${caseA.id}`, {
    headers: { "x-user-id": userA },
  });
  assert.equal(readResA.status, 200);
  const dataA = await readResA.json();
  assert.equal(dataA.case.id, caseA.id);
});

test("3. Capacity limit enforcement (max 5 active cases)", async () => {
  const userLimit = `test-user-limits-${Date.now()}`;
  // Create 5 active cases
  for (let i = 1; i <= 5; i++) {
    const res = await fetch(`${API_BASE}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userLimit },
      body: JSON.stringify({
        merchantLabel: `Store ${i}`,
        itemLabel: `Item ${i}`,
      }),
    });
    assert.equal(res.status, 201);
  }

  // 6th case must be rejected with 403
  const res6 = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userLimit },
    body: JSON.stringify({
      merchantLabel: "Store 6",
      itemLabel: "Item 6",
    }),
  });
  assert.equal(res6.status, 403);
  const errorData = await res6.json();
  assert.match(errorData.error, /Capacity limit reached/);
});

test("4. Full lifecycle: Slot reservation -> Upload -> OCR -> Confirmation -> Revision -> Outcome -> Snapshot", async () => {
  const userId = `test-user-full-${Date.now()}`;

  // 1. Create Case
  const caseRes = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      merchantLabel: "Demo Store",
      itemLabel: "Noise-Cancelling Headphones",
      orderReference: "DEMO-104",
      requestedAmountPaise: 480000,
    }),
  });
  assert.equal(caseRes.status, 201);
  const caseItem = await caseRes.json();

  // 2. Reserve Upload Slot for Source 1
  const slotRes = await fetch(`${API_BASE}/cases/${caseItem.id}/upload-slot`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      kind: "image",
      originalFilename: "chat-12-sep.png",
      mime: "image/png",
    }),
  });
  assert.equal(slotRes.status, 201);
  const slotData = await slotRes.json();
  const source1Id = slotData.source.id;

  // 3. Upload Source 1 Data
  const uploadRes = await fetch(`${API_BASE}/sources/${source1Id}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      noteText: "We will issue the refund within 48 hours after warehouse receipt.",
    }),
  });
  assert.equal(uploadRes.status, 200);

  // 4. Trigger OCR Reading
  const ocrRes = await fetch(`${API_BASE}/sources/${source1Id}/read`, {
    method: "POST",
    headers: { "x-user-id": userId },
  });
  assert.equal(ocrRes.status, 200);
  const ocrData = await ocrRes.json();
  assert.equal(ocrData.success, true);
  assert.ok(ocrData.lines.length > 0);

  // 5. Autosave Review Draft
  const draftRes = await fetch(`${API_BASE}/sources/${source1Id}/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      selectedLineIds: ["line-1"],
      formFields: { wording: "We will issue the refund within 48 hours after warehouse receipt." },
    }),
  });
  assert.equal(draftRes.status, 200);

  // 6. Confirm Promise 1
  const rec1Res = await fetch(`${API_BASE}/cases/${caseItem.id}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      expectedCaseVersion: 1,
      kind: "promise",
      sourceId: source1Id,
      verbatimText: "We will issue the refund within 48 hours after warehouse receipt.",
      promise: {
        actionKind: "refund",
        conditionLabel: "Warehouse receipt confirmation",
        rawWindow: "48 hours",
        durationHours: 48,
        userDisposition: "condition_unmet",
      },
    }),
  });
  assert.equal(rec1Res.status, 201);
  const rec1Data = await rec1Res.json();
  assert.equal(rec1Data.newCaseVersion, 2);

  // 7. Add Source 2 (Later wording change)
  const slot2Res = await fetch(`${API_BASE}/cases/${caseItem.id}/upload-slot`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      kind: "note",
      noteText: "Please allow five working days after warehouse receipt.",
    }),
  });
  assert.equal(slot2Res.status, 201);
  const slot2Data = await slot2Res.json();

  // 8. Confirm Promise 2
  const rec2Res = await fetch(`${API_BASE}/cases/${caseItem.id}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      expectedCaseVersion: 2,
      kind: "promise",
      sourceId: slot2Data.source.id,
      verbatimText: "Please allow five working days after warehouse receipt.",
      promise: {
        actionKind: "refund",
        conditionLabel: "Warehouse receipt confirmation",
        rawWindow: "5 working days",
        dateBasis: "business_days",
      },
    }),
  });
  assert.equal(rec2Res.status, 201);
  const rec2Data = await rec2Res.json();
  assert.equal(rec2Data.newCaseVersion, 3);

  // 9. Link Promise 2 as Changed Date for Promise 1
  const linkRes = await fetch(`${API_BASE}/cases/${caseItem.id}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      earlierRecordId: rec1Data.record.id,
      laterRecordId: rec2Data.record.id,
      relation: "changed_date",
    }),
  });
  assert.equal(linkRes.status, 201);
  const linkData = await linkRes.json();
  assert.equal(linkData.newCaseVersion, 4);

  // 10. Record Final Outcome
  const outcomeRes = await fetch(`${API_BASE}/cases/${caseItem.id}/outcomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({
      kind: "full_refund",
      receivedTotalPaise: 480000,
      note: "Refund received in bank account",
    }),
  });
  assert.equal(outcomeRes.status, 201);

  // 11. Fetch Export Snapshot
  const snapRes = await fetch(`${API_BASE}/cases/${caseItem.id}/snapshot`, {
    headers: { "x-user-id": userId },
  });
  assert.equal(snapRes.status, 200);
  const snapshot = await snapRes.json();
  assert.equal(snapshot.case.lifecycle, "resolved");
  assert.equal(snapshot.chronology.length, 2);
  assert.equal(snapshot.links.length, 1);
  assert.equal(snapshot.outcomes.length, 1);
  assert.equal(snapshot.summary.totalRecords, 2);
});

test("5. Maintenance endpoint requires valid secret", async () => {
  // Missing secret -> 403
  const noAuthRes = await fetch(`${API_BASE}/internal/maintenance`, {
    method: "POST",
  });
  assert.equal(noAuthRes.status, 403);

  // Valid secret -> 200
  const authRes = await fetch(`${API_BASE}/internal/maintenance`, {
    method: "POST",
    headers: {
      Authorization: "Bearer still-owed-dev-maintenance-secret-2026",
    },
  });
  assert.equal(authRes.status, 200);
  const data = await authRes.json();
  assert.equal(data.success, true);
  assert.ok(typeof data.results.expiredLeasesReset === "number");
});
