# 🔗 Twine — Your shared world

A couples app to save, rank, and experience plans together — with real-time sync across two devices.

---

## ⚡ Deploy in 5 minutes

### Step 1 — Supabase (database + real-time sync)

1. Go to **[supabase.com](https://supabase.com)** → Sign up (free)
2. Click **"New project"** → choose a name (e.g. `twine`) → set a password → Create
3. Wait ~1 min for project to spin up
4. Go to **SQL Editor** (left sidebar) → paste the contents of `supabase_schema.sql` → click **Run**
   - Then do the same with `supabase/002_shopping_lists.sql`, `003_fitness.sql` and `004_goals.sql` (safe to re-run)
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
├── lib/
│   ├── supabase.js            # Supabase client
│   ├── realtime.js            # Shared realtime + resume helpers
│   ├── optimistic.js          # Instant writes with rollback on failure
│   └── dates.js               # Local calendar-day helpers
├── hooks/useLongPress.js      # Tap vs long-press (touch + desktop)
├── store/useTwineStore.js     # Plans state + DB operations, toasts
├── features/
│   └── lists/                 # Shopping lists (self-contained feature)
│       ├── ListsView.jsx      # All lists + archived
│       ├── ListDetail.jsx     # One list: items, add line, clear checked
│       ├── useListsStore.js   # State, optimistic writes, autocomplete
│       ├── constants.js       # List emojis, autocomplete seed
│       └── components/        # ItemRow, NewItemInput, sheets
│   ├── fitness/               # Daily habits (same pattern as lists)
│       ├── FitnessView.jsx    # Day / History switch
│       ├── TodayView.jsx      # One day, one person, arrows for past days
│       ├── HistoryView.jsx    # 14-day grid, streaks, 30-day stats
│       ├── useFitnessStore.js # State, optimistic writes, streak + stats
│       └── components/        # Habit rows, editor sheet, Home Today card
│   └── goals/                 # Goals with date, milestones and cheers
│       ├── GoalsView.jsx      # Open goals by nearest date + Achieved
│       ├── GoalDetail.jsx     # Countdown, why, milestones, cheer, achieve
│       ├── useGoalsStore.js   # State + countdown/progress selectors
│       └── components/        # Form sheet, Home card, confetti
├── theme/
│   ├── themes.js              # Night, Day, Blossom, Lavender color sets
│   └── useTheme.js            # Applies a theme (per phone), Auto mode
├── components/checklist/      # Checkbox row + add line, shared by Lists and Goals
├── views/
│   ├── UserSelect.jsx         # Initial profile picker
│   ├── UserSwitcher.jsx       # Switch profile modal
│   ├── HomeView.jsx           # Dashboard
│   ├── PlansHub.jsx           # Plans tab: Ideas / Rank / Insights
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
    └── shared/
        ├── BottomSheet.jsx
        ├── Segmented.jsx
        ├── SetupNotice.jsx
        ├── Icon.jsx
        └── UserAvatar.jsx
```

---

## 🗄️ Database tables

| Table | Purpose |
|-------|---------|
| `plans` | All saved plans with rankings per user |
| `experiences` | Post-date feedback (one per plan) |
| `shopping_lists` | Lists (Moabit Home, Mitte Home + custom, archivable) |
| `shopping_items` | Items; cleared items are kept for autocomplete |
| `habits` | What each person tracks (yes/no, training, number) |
| `habit_logs` | One row per habit per day; no row = not done |
| `goals` | Goal, owner (facu / janina / both), optional date, why |
| `goal_milestones` | Checklist steps for each goal |
| `goal_cheers` | 👏 sent to a goal; shown on the owner's Home until seen |

---

## ✨ Features

- **Profile picker** — Janina 🌸 or Facu ⚡, remembered per device
- **Plans with category tabs** — 11 categories + All
- **Real-time sync** — changes on one device appear instantly on the other
- **Swipe ranking** — Tinder-style prioritization, per user
- **Mutual Top 5** — average of both rankings
- **Post-date experience** — rate mood, fun, would repeat
- **Insights** — stats, charts, badges
- **Goals** — countdown, milestones and cheering each other on
- **Themes** — Night, Day, Blossom, Lavender or Auto, chosen per phone
- **Fitness** — daily habits per person, training detail, sleep, streaks and history
- **Shopping lists** — one per home plus event lists, check off together in real time, autocomplete, move items between homes
- **Full CRUD** — add, edit notes, change status, delete plans
