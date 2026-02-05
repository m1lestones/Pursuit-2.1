# 📘 Product Requirements Document (PRD)

**Product:** Pursuit Student Dashboard – Weekly Curriculum View  
**Author:** Juan  
**Date:** Feb 2, 2026  
**Version:** v1.2  

## 0) 🧾 Changelog
### v1.0 → v1.1
- Added “🚀 Next best action” to reduce decision friction in the TODAY column
- Added lunch timer with end-of-break notifications (Notification API + toast fallback)
- Added missed assignment attention pattern (pulse + hourly reminders)
- Added small iconography for high-signal actions (e.g., submit/upload/watch)

### v1.1 → v1.2
- Added task completion persistence (checkbox state saved locally)
- Added horizontal day rail with left/right controls (easier week scanning)
- Added selected day highlight (persists your last clicked day)
- Added click-to-open day detail screen (new page) with persisted selected day
- Added day/night theme toggle (follows system preference by default)
- Improved dark mode contrast using theme-aware CSS variables
- Added swipe/trackpad navigation in day detail view (left/right to switch days)
- Added assignment search (typeahead) to jump to a specific day/task quickly

## 1) 📌 Problem Statement
Pursuit’s student dashboard presents a week-based curriculum view that helps learners track daily activities, assessments, and deliverables. While functional and information-rich, students experience cognitive overload, weak visual hierarchy, and limited interaction clarity—especially during weeks with multiple assessments.

This can lead to:
- Missed submissions
- Confusion around priorities
If you're a student with high cognitive load and limited time, the dashboard should reduce decision friction and increase confidence.

## 2) 🎯 Goals & Success Metrics
### Goals
- Improve clarity of what matters today
- Reduce cognitive load when scanning the week
- Increase confidence that students are “on track”
- Make actions (submit, review, prepare) more obvious

### Success Metrics
- ↓ Missed or late submissions
- ↑ Daily engagement with dashboard
- ↓ Student questions about “what’s due”
- Positive qualitative feedback in retros

## 3) 👤 Target Users
- **Primary:** Pursuit student (career-switcher, high cognitive load, time-constrained)
- **Secondary:** Instructor/TA reviewing student progress

## 4) 🧠 Current UX/UI Issues (Observed)
1. **Cognitive Overload**
   - Too many similar-looking items
   - No strong separation between mandatory vs optional
2. **Weak Visual Hierarchy**
   - “TODAY” is highlighted, but priority inside Today is unclear
3. **Action Ambiguity**
   - CTAs (like “Submit link”) are easy to miss
4. **Progress Visibility**
   - No clear daily/weekly completion signals
5. **Limited Feedback Loops**
   - No clear “on track / behind” feedback

## 5) 🧩 Proposed Solution Overview
Introduce priority-driven structure, progress signaling, and action clarity without changing the curriculum content.

## 6) ✨ Key Features & Requirements

### 6.1 Priority Tagging System
Each activity has a visible tag:
- 🔴 **Required** (must complete)
- 🟡 **Recommended** (high value)
- ⚪ **Optional** (nice-to-have)

**Requirements**
- Tag visible at a glance
- Uses icon + label (not color alone)

### 6.2 “Today Focus” Panel
At the top of the selected day:
- **🎯 Today’s Focus** shows top 1–3 most important items

**Requirements**
- Only critical items appear here
- Reduces scanning effort

### 6.3 Progress Indicators
Add:
- Daily progress (e.g., `3 / 6`)
- Weekly progress (e.g., `12 / 20`)

**Requirements**
- Updates in real time
- Feels reassuring, not punitive

### 6.4 Stronger Primary CTAs
Replace subtle links with clear, consistent buttons:
- “⬆️ Submit Assessment”
- “📎 Upload PRD Draft”
- “▶️ Watch Required Video”

**Requirements**
- Action-oriented labels
- Consistent placement and styling

### 6.5 Expand / Collapse Task Details
Default view is a high-level list; clicking “Details” expands:
- Context
- Expectations
- Rubric links (future)

**Requirements**
- Reduces noise
- Preserves depth when needed

### 6.6 “Next Best Action” CTA (New in v1.1)
Add a “🚀 Next best action” button in Today Focus.

**Requirements**
- On click, automatically:
  - Finds the first incomplete 🔴 Required focus item (fallback to next incomplete focus item)
  - Scrolls to the task
  - Expands details
  - Briefly highlights the task
- If nothing is left, show an “All set” confirmation

### 6.7 Lunch Timer (New in v1.1)
Add a lunch break timer in the “Lunch” separator.

**Requirements**
- Start/Pause/Reset controls
- Visible countdown
- Notifies the student when time is up:
  - Prefer browser/system notification if allowed
  - Fallback to an in-page toast + sound

### 6.8 Missed Assignments Attention Pattern (New in v1.1)
Make missed assignments hard to overlook.

**Requirements**
- “Missed assignments” pill has a pulsing animation to grab attention
- Reminders roughly every hour (configurable)
  - Prefer Notification API if allowed
  - Fallback to in-page toast
- Respect reduced-motion preferences

### 6.9 Task Completion Persistence (New in v1.2)
Persist a student’s task checkmarks so progress isn’t lost on refresh.

**Requirements**
- Checkbox state is saved locally per task/day
- Reloading the page restores completion state
- Works on both the dashboard week view and the day detail view

### 6.10 Day Detail View + Navigation (New in v1.2)
Allow students to click a day card and view that day on its own screen (like Pursuit), reducing clutter and enabling focused execution.

**Requirements**
- Clicking a day card opens a dedicated day page
- Day page shows the same activities list with tags and checkboxes
- Back navigation returns to the dashboard
- Selected day is remembered (so deep links and refreshes remain stable)

### 6.11 Theme Toggle (Day/Night) (New in v1.2)
Allow students to toggle between light and dark themes.

**Requirements**
- Toggle available on dashboard and day detail view
- Theme persists across page reloads
- Defaults to system preference when the user has not chosen a theme
- Dark mode maintains readable contrast for key content

### 6.12 Swipe / Trackpad Day Switching (New in v1.2)
In the day detail view, support quickly switching days using touchpad or touch gestures.

**Requirements**
- Trackpad horizontal gestures switch to next/previous day
- Touch swipe left/right switches to next/previous day on mobile/tablet
- Must not break vertical scrolling
- Optional keyboard support (Left/Right arrow) is allowed

### 6.13 Assignment Search + Jump to Day (New in v1.2)
Enable a “type to find” experience so students can jump directly to an assessment/assignment without scanning all days.

**Requirements**
- Search input in the top bar
- As the user types, show a dropdown of matching assignments across the week
- Selecting a result navigates to that assignment’s day
- Keyboard navigation supported (↑/↓/Enter/Esc)
- Shortcut supported: `Cmd/Ctrl + K` focuses search (optional but recommended)

### 6.14 Horizontal Day Rail (New in v1.2)
Improve week scanning by presenting days in a horizontal, scrollable rail with left/right controls.

**Requirements**
- Day cards are horizontally scrollable
- Buttons scroll left/right by about one card
- Scroll snapping keeps cards aligned

## 7) 🚫 Out of Scope (This Version)
- Mobile-first redesign
- Calendar sync / external reminders integration
- Instructor analytics dashboard
- AI recommendations or personalization
- Authentication, server persistence, and real curriculum data fetching
- Full notification settings UI (snooze, quiet hours, custom cadence)

## 8) 🧪 Risks & Mitigations
- **Over-engineering:** keep default view simple; progressive disclosure
- **Student overwhelm:** focus panel + next best action reduces decision fatigue
- **Accessibility:** icon + label for tags; reduced-motion support

## 9) ✅ Implementation Notes (Current Prototype)
Implemented in:
- [index.html](index.html) (structure + JS behaviors)
- [day.html](day.html) (day detail view)
- [styles.css](styles.css) (visual design + animations)

Behaviors included:
- Real-time daily/weekly progress updates
- Today Focus list generation
- Next best action scroll + expand + highlight
- Lunch timer + notifications/toast fallback
- Missed assignment pulsing + hourly reminder
- Task completion persistence via `localStorage`
- Click-to-highlight selected day and persist it
- Navigation from dashboard → day detail view via `day.html?day=...`
- Swipe/trackpad day switching on day detail view
- Assignment search + jump-to-day (typeahead)
