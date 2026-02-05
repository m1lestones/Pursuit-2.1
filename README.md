# Pursuit-2.1
A replica of the Pursuit student dashboard (weekly curriculum view) with PRD-driven UI/UX improvements.

## PRD
- See the full product requirements doc in [PRD.md](PRD.md).

## Included improvements
- Priority tags (Required / Recommended / Optional) on each activity
- “Today’s Focus” panel (top priorities for the selected day)
- Daily + weekly progress bars (updates as you check items)
- Stronger primary CTAs for submissions
- Expand/collapse task details to reduce noise

## Added interaction features
- “Next best action” button (auto-scrolls to the top incomplete priority task)
- Lunch timer (Start/Pause/Reset) with end-of-lunch notifications + toast fallback
- Missed assignments attention pattern: pulsing pill + hourly reminder notifications/toasts

## New in v1.2
- Day detail page (`day.html`) for a focused single-day view
- Day/night theme toggle (persists your preference)
- Swipe/trackpad day switching in day view
- Assignment search (type to find a task and jump to its day)
- Task completion persistence (checkboxes stay checked after refresh)

## Run locally
- `python3 -m http.server 8000`
- Open `http://localhost:8000/`

If port `8000` is taken, use another port:
- `python3 -m http.server 8081`
- Open `http://localhost:8081/`

## How to use
- **Open a day:** click any day card to open the day detail screen.
- **Switch days (day view):**
	- Trackpad horizontal gesture switches previous/next day.
	- Touch swipe left/right switches previous/next day.
	- Keyboard: `←` / `→`.
- **Search assignments:** use the “Find assignment…” box in the top bar.
	- Shortcut: `Cmd/Ctrl + K` focuses the search.
	- Use `↑/↓` to choose a result and `Enter` to jump.
- **Theme:** use the Day/Night toggle in the top bar (applies on both pages).

## Test mode (fast reminders/timers)
- Open `http://localhost:8000/?test=1` to enable a visible “Test mode ON” badge.
- In test mode: missed-assignment reminders run every ~10s and lunch timers default to ~20s.

Day view test mode works too:
- `http://localhost:8000/day.html?day=2026-02-04&test=1`

## Contributing / workflow
- Create a branch: `git checkout -b your-name/feature`
- Make changes + commit: `git add .` then `git commit -m "Describe change"`
- Push your branch: `git push -u origin your-name/feature`
- Open a Pull Request on GitHub into `main`
- Merge the PR when checks look good and there are no conflicts

### Staying up to date
- `git checkout main`
- `git pull origin main`
