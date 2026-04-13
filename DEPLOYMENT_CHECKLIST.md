# ViewTube.live Deployment Checklist

## Phase 1: GitHub & Vercel Setup

### Task 1: Create GitHub Repository
- [ ] Go to github.com and create new repo "viewtube-live"
- [ ] Run these commands:
```bash
cd /Users/cwb/Downloads/viewtube
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/viewtube-live.git
git push -u origin main
```

### Task 2: Set Up Vercel
- [ ] Go to vercel.com and sign up with GitHub
- [ ] Click "Add New Project"
- [ ] Select "viewtube-live" repo
- [ ] Click "Deploy"

### Task 3: Create Staging Branch
- [ ] Run: `git checkout -b staging && git push origin staging`
- [ ] In Vercel: Project Settings → Git → Staging Environment → Set to "staging"

---

## Phase 2: CSV Import Version

### Task 4: Create CSVImportLanding.tsx
- [ ] Create file: `src/views/CSVImportLanding.tsx`
- [ ] Copy the component code from the deployment documentation

### Task 5: Modify AppRoutes.tsx
- [ ] Add import: `import { CSVImportLanding } from "../views/CSVImportLanding"`
- [ ] Change line 34 from `<Route path="/" element={<Dashboard />} />` to `<Route path="/" element={<CSVImportLanding />} />`

### Task 6: Test Locally
- [ ] Run: `npm install && npm run dev`
- [ ] Open http://localhost:5173 and verify CSV landing page appears

---

## Phase 3: GoDaddy DNS Configuration

### Task 7: Add Domain to Vercel
- [ ] Vercel → Project Settings → Domains → Add "viewtube.live"

### Task 8: Configure GoDaddy DNS (CRITICAL!)
Add TWO separate records:

**Record 1 - A Record:**
- Type: A
- Name: @
- Value: 76.76.21.21
- TTL: 600

**Record 2 - CNAME:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com
- TTL: 600

⚠️ **Common Mistakes to Avoid:**
- Don't select "A" for both records - second must be CNAME
- Don't put "to:" before the value
- Don't put IP in CNAME record

### Task 9: Verify DNS
- [ ] Wait 30 minutes for DNS propagation
- [ ] Vercel → Project Settings → Domains → Click "Verify"
- [ ] Should show ✅ Verified

---

## Phase 4: Deploy CSV Version

### Task 10: Deploy to Production
- [ ] Run: `git add . && git commit -m "Production ready" && git push origin main`

### Task 11: Test Live Site
- [ ] Visit https://viewtube.live
- [ ] Test CSV upload
- [ ] Test Google Sheets connection
- [ ] Verify all features work

---

## Phase 5: Firebase Setup (For YouTube Auth Later)

### Task 12: Create Firebase Project
- [ ] Go to console.firebase.google.com
- [ ] Click "Add project" → Name: "viewtube-live"
- [ ] Enable Google Analytics

### Task 13: Enable Firebase Services
- [ ] Authentication → Enable Google provider
- [ ] Firestore Database → Create database (test mode)
- [ ] Storage → Get started (test mode)

### Task 14: Add Firebase to Vercel
- [ ] Run: `npm install firebase`
- [ ] Create `src/firebase.ts` with your config
- [ ] Add env variables to Vercel: Project Settings → Environment Variables

---

## Phase 6: YouTube Auth Integration (Future)

### Task 15: Enable YouTube Data API
- [ ] Go to console.cloud.google.com
- [ ] Select your project
- [ ] APIs & Services → Library → Enable "YouTube Data API v3"

### Task 16: Configure OAuth Consent
- [ ] APIs & Services → OAuth consent screen
- [ ] User Type: "External"
- [ ] Add scopes: youtube.readonly, youtube.upload
- [ ] Add test users

### Task 17: Create OAuth Credentials
- [ ] APIs & Services → Credentials
- [ ] Create OAuth 2.0 Client ID
- [ ] Application type: "Web application"
- [ ] Authorized origins: https://viewtube.live
- [ ] Authorized redirect URIs: https://viewtube.live/auth/callback

---

## Quick Reference

### GoDaddy DNS Values
| Type  | Name | Value              | TTL  |
|-------|------|--------------------|------|
| A     | @    | 76.76.21.21        | 600  |
| CNAME | www  | cname.vercel-dns.com | 600 |

### Essential Commands
```bash
# Initial setup
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/USERNAME/viewtube-live.git
git push -u origin main

# Create staging
git checkout -b staging && git push origin staging

# Deploy
git add . && git commit -m "Deploy" && git push origin main

# Test locally
npm install && npm run dev
```

### Important Links
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- GoDaddy DNS: https://www.godaddy.com/domains
- DNS Propagation Check: https://whatsmydns.net