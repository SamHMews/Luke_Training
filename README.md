# Luke Training

Independent iPhone Home Screen workout app based on PPLUL release 46. The programme repeats **Light → Medium → Heavy** across three weeks, with three workouts each week. All nine sessions appear on the home screen; a new cycle archives all nine together.

## Programme and logging

The source is [workout-plan.txt](workout-plan.txt). There are 26 cards. Leg-press pulses, full-range reps after pulses and both drop-set stages are separate cards with independent logs. Each card records one working weight, one reps-achieved value and one effort choice. Muscle-ups and unweighted pull-ups need reps and effort only. Reps can be entered directly by tapping the rep number or using the slider; target ranges are guidance, not input limits. Dumbbell weights are per dumbbell. Wide-grip pulldowns initially use an unlabelled machine-position number, matching the notes' “12th hole”.

The existing swipe interaction, green completed cards, undo, plate animation and Spotify control appearance are retained. Only the last unfinished card in a day plays the completion animation and returns to the plan.

## Historical import

33 records from the four dated groups in the attached plan are included in `dist/historical-results.json` and the initial app state. View all original set results in **History → Imported · Light / Medium / Heavy**. Exercise cards show the latest matching phase's weight × average reps, rounded to one decimal where needed. Mixed-weight sessions show a separate average for each weight. Progress cards expose the dated imports through **Earlier records**.

Original partial reps (`8.5`), trailing minus markers, the slip note, unspecified weights and mixed-weight sets are preserved. No effort scores or representative weights were invented. The compact card average uses the recorded numeric rep values, including partial reps and slip sets; unspecified trailing markers do not change those values. The mixed shoulder-press result stores all three weights/reps individually as historical source data, while new logging remains one value per card. The supplied dates identify groups of records: individual day dates and cycle numbers were not provided, so imports are not assigned artificial training cycles or plotted as if they were. New completed logs plot against their actual cycle number.

Completing a card does not replace its historical reference during the active cycle. Previous references exclude the active cycle and stay within the same phase/day. Imported history does not complete any of the new cycle's workouts.

## Isolation

The original PPLUL and LT-PPLUL repositories are unchanged. This app uses its own `luke-training` IndexedDB database, service-worker cache, GitHub token/baseline keys and Spotify token keys. Backups are tagged `appId: luke-training`; other apps' backups are rejected. GitHub sync targets only `SamHMews/Luke_Training/data/workouts.json`. This is a public repository, so uploaded workout snapshots are public. Exported JSON contains workout state, not authentication tokens.

## Spotify

Spotify is optional and does not block workouts. In this app's Settings → Spotify, enter a **public Spotify App Client ID**, then connect. Register `https://samhmews.github.io/Luke_Training/` as that app's redirect URI in Spotify's developer dashboard first. No client secret is used or stored. Connections from the original apps are deliberately not copied.

## Development and deployment

No production build or backend is required. `node server.mjs` serves `dist/` locally. Install the pinned development dependencies with `npm install`, then run `npm test`. For browser regression checks, install Playwright browsers and run `npm run test:browser` with the local server running. `APP_URL`, `BROWSER`, and `BROWSER_CHANNEL` can override the test target.

GitHub Actions runs the programme/data checks, Spotify API simulations and iPhone-sized browser tests in Chromium and WebKit. A successful main-branch run publishes only `dist/` to GitHub Pages. Workflow permissions are limited to reading repository contents and publishing Pages. `preservation.json` locks the existing gesture and completion-animation modules; intentional changes require reviewing the matching regression checks before updating hashes.

Live page: https://samhmews.github.io/Luke_Training/
