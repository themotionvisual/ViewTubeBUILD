# Billing & Subscription Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate frontend billing state with backend `/billing/entitlement/:email` endpoint.

**Architecture:**
1. Frontend identifies user via Google OAuth email.
2. `billingEntitlement.ts` manages entitlement state and syncs with backend.
3. UI in `Settings.tsx` updates based on entitlement status.

**Tech Stack:** TypeScript/React, Node.js (mock backend).

---

### Task 1: Update GoogleService for User Info

**Files:**
- Modify: `src/services/googleService.ts`
- Test: `src/services/googleService.test.ts` (if it exists, else create)

- [ ] **Step 1: Write test for getUserInfo**
- [ ] **Step 2: Implement getUserInfo in googleService.ts**
- [ ] **Step 3: Run tests and verify**
- [ ] **Step 4: Commit**

### Task 2: Implement Billing Entitlement Service

**Files:**
- Create: `src/services/billingEntitlement.ts`
- Test: `src/services/billingEntitlement.test.ts`

- [ ] **Step 1: Write test for fetchEntitlementFromServer**
- [ ] **Step 2: Implement fetchEntitlementFromServer and local storage sync**
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit**

### Task 3: Integrate with Auth Session

**Files:**
- Modify: `src/services/authSession.ts`

- [ ] **Step 1: Update scopes and auth session to include email**
- [ ] **Step 2: Commit**

### Task 4: Update Settings UI

**Files:**
- Modify: `src/views/Settings.tsx`

- [ ] **Step 1: Update UI to call fetchEntitlementFromServer on load**
- [ ] **Step 2: Display backend-synced status in settings**
- [ ] **Step 3: Commit**
