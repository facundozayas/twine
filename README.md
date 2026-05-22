# 🔗 Twine — Your shared world

A couples app to save, rank, and experience plans together — with real-time sync across two devices.

---

## ⚡ Deploy in 5 minutes

### Step 1 — Supabase (database + real-time sync)

1. Go to **[supabase.com](https://supabase.com)** → Sign up (free)
2. Click **"New project"** → choose a name (e.g. `twine`) → set a password → Create
3. Wait ~1 min for project to spin up
4. Go to **SQL Editor** (left sidebar) → paste the contents of `supabase_schema.sql` → click **Run**
5. Go to **Settings → API** → copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`

---

### Step 2 — GitHub

1. Create a new **private** repo at [github.com](https://github.com)
2. Upload all files from this folder (or `git push`)

---

### Step 3 — Vercel (hosting)

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub (free)
2. Click **"Add New Project"** → Import your GitHub repo
3. In **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL       = https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY  = your-anon-key-here
   ```
4. Click **Deploy**
5. Vercel gives you a URL like `twine-abc123.vercel.app`

**Both Janina and Facu open the same URL — data syncs in real time. ✅**

---

## 🛠️ Local development

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Fill in your Supabase keys

# 3. Run dev server
npm run dev
```

---

## 📁 Project structure

```
src/
├── App.jsx                    # Root — routing + layout
├── index.css                  # Global styles + animations
├── main.jsx                   # React entry point
├── constants/index.js         # Users, categories, tokens, badges
├── lib/supabase.js            # Supabase client
├── store/useTwineStore.js     # Zustand state + all DB operations
├── views/
│   ├── UserSelect.jsx         # Initial profile picker
│   ├── UserSwitcher.jsx       # Switch profile modal
│   ├── HomeView.jsx           # Dashboard
│   └── PlansView.jsx          # Plans list with category tabs
└── components/
    ├── layout/
    │   ├── Header.jsx
    │   └── BottomNav.jsx
    ├── plans/
    │   ├── PlanCard.jsx
    │   ├── PlanDetail.jsx
    │   └── AddPlanModal.jsx
    ├── swipe/
    │   └── SwipeView.jsx
    ├── insights/
    │   └── InsightsView.jsx
    ├── ai/
    │   └── AIPanel.jsx
    └── shared/
        ├── Icon.jsx
        └── UserAvatar.jsx
```

---

## 🗄️ Database tables

| Table | Purpose |
|-------|---------|
| `plans` | All saved plans with rankings per user |
| `experiences` | Post-date feedback (one per plan) |

---

## ✨ Features

- **Profile picker** — Janina 🌸 or Facu ⚡, remembered per device
- **Plans with category tabs** — 11 categories + All
- **Real-time sync** — changes on one device appear instantly on the other
- **Swipe ranking** — Tinder-style prioritization, per user
- **Mutual Top 5** — average of both rankings
- **Post-date experience** — rate mood, fun, would repeat
- **Insights** — stats, charts, badges
- **AI assistant** — powered by Claude, knows your actual data
- **Full CRUD** — add, edit notes, change status, delete plans
