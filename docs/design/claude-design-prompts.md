# Claude Design prompts: Pickelton screens

How to use:
1. Paste the **Master context** first in every new Claude Design session (or keep it at the top of the project).
2. Then paste **one batch prompt at a time**. Small batches give more consistent results than "design the whole app".
3. After each batch, tick the screens as designed in [PLAN.md](../../PLAN.md).
4. This is a **full redesign**. Don't attach old screenshots as references. Run Batch 0A first, pick a direction,
   then replace the BRAND section of the master context with the tokens you approved.

---

## Master context (paste first, every time)

```text
You are designing Pickelton, a racket-sports app for PICKLEBALL and BADMINTON players.
Pickelton combines three things: a sports community (clubs, partners, open games), a court-booking platform
(find and book courts at partner venues), and a competitive stats platform (live scoring, ratings, leaderboards,
tournaments).

PLATFORMS
- Player app: iOS + Android (one design, respect platform conventions: iOS safe areas, Android back), 390×844 base.
- Player website: desktop 1440 wide with a persistent left sidebar, a top search bar, a notification bell and an
  account menu. Responsive down to 768.
- Partner portal: desktop web first + a small partner mobile app.
- Admin: desktop web only, dense data tables.

BRAND & VISUAL LANGUAGE (starting point: replace with the direction chosen in Batch 0A)
- Name: Pickelton. Energetic, athletic, modern, premium but friendly. Think Strava × Playtomic × Nike Run Club.
- Primary accent: electric volt lime #CCFF00 (dark mode) / #7FA800 (light mode).
- Dark mode is the default: background #121212, surface #1E1E1E, raised #242424, border #333333, text #FFFFFF,
  muted #A0A0A0, danger #FF5C68.
- Light mode: background #F2F5ED, surface #FFFFFF, border #CBD6BF, text #172014, muted #65705F.
- Sport accents: Pickleball = lime, Badminton = a cool cyan (#5CE1E6). Use them only for sport badges/chips.
- Typography: a bold condensed display face for numbers and scores (scoreboard feel), and a clean geometric sans
  for UI text. Scores and ratings are BIG.
- Radius 12–16 on cards, 999 on chips. Generous spacing, 8pt grid, 44pt minimum touch targets, WCAG AA contrast.
- Icons: outline style, 1.5px stroke.

GLOBAL NAVIGATION (player mobile, 5 tabs)
Home · Play · Courts · Clubs · Profile
The top bar has: a sport switcher (Pickleball ⇄ Badminton), search, notifications bell (with badge), and an
invitations icon.

KEY PRODUCT RULES THE UI MUST SHOW
- A user can own up to 4 clubs: show "2 of 4 clubs" when creating.
- Only club owners/admins can create tournaments. Members see no create button, or a disabled one with an explanation.
- A TeamUp is exactly 2 players and needs the invitation to be accepted.
- Match types: Friendly, TeamUp, Club, Tournament (no practice type).
- A result affects ratings only after the opponent confirms it. Show "Awaiting confirmation" states.
- Ratings are separate per sport and per format (singles / doubles / mixed). Show a reliability %.
- Scoring differs by sport: pickleball to 11, win by 2, side-out or rally, server number 1/2;
  badminton to 21, win by 2, cap 30, rally scoring.
- Bookable venues (Pickelton partners) show a "Book" button. External venues show "Not bookable on Pickelton,
  get directions".

FOR EVERY SCREEN
- Use realistic data (real-sounding names, Indian and European cities, prices in ₹ or €, times, scores). Never use
  lorem ipsum.
- Include the empty, loading (skeleton) and error state where relevant.
- Show both dark and light mode for at least the key screen of each batch.
- Label each frame with its screen name exactly as listed in the batch.
```

---

## Batch 0A: Pick a visual direction (do this first)

```text
Using the master context, this is a complete redesign: ignore any previous Pickelton UI.
Propose 3 distinct visual directions for Pickelton. For each, show the same 3 screens so they can be compared
side by side: Home feed, Live scorecard (pickleball doubles) and Venue detail with booking slots.
Direction ideas (you may improve them):
  A. "Night Court": dark, volt lime accent, bold condensed scoreboard numerals, high energy
  B. "Clubhouse": light, warm off-white, deep green + clay accents, premium and calm
  C. "Rally": bright, playful, bold colour blocks per sport, rounded shapes, social-first
For each direction give: name, colour tokens (dark + light), font pairing, corner radius, icon style, and one
sentence on who it appeals to. Then recommend one.
```

## Batch 0B: Design system foundation

```text
Using the master context and the chosen direction, create the Pickelton design system page:
- Colour tokens (dark + light), sport accent chips, status colours (confirmed, pending, live, cancelled, disputed)
- Type scale incl. a big scoreboard numeral style
- Components: primary/secondary/ghost/destructive buttons, input, OTP input, search bar, segmented control,
  chips/filters, sport badge, level badge (e.g. "3.5"), rating badge with reliability %, avatar + avatar stack,
  player card, match card (upcoming / live / completed / awaiting confirmation), venue card (bookable vs external),
  club card, tournament card, time-slot pill (available / selected / booked / waitlist), bottom sheet, modal,
  toast, tab bar, top app bar, empty state, skeleton loaders, offline banner.
```

## Batch 1: Onboarding & auth (mobile)

```text
Using the master context, design these mobile screens:
1. Splash
2. Welcome carousel (3 slides: find games, book courts, track your rating)
3. Sign in: phone/email, Continue with Apple, Continue with Google
4. Sign up
5. OTP verification
6. Forgot password + reset password
7. Profile setup: photo, name, @handle, date of birth (age gate)
8. Choose your sports: Pickleball, Badminton, Both
9. Skill self-assessment: 5 quick questions per sport → result screen "Your starting level: 3.0"
10. Location: auto-detect or pick a city
11. Permission primers: notifications, location
12. Terms & privacy consent
13. "You're in": suggestions to join a nearby club or an open game
```

## Batch 2: Home, Play & Open Games (mobile)

```text
Using the master context, design these mobile screens:
1. Home feed: next match/booking hero card, pending invitations, "Open games near you" carousel, tournaments near
   you, club announcements, friends' match recap cards
2. Global search with result tabs: Players, Clubs, Venues, Tournaments
3. Notifications inbox (grouped: Today, This week)
4. Invitations inbox (match, TeamUp, club, booking), each with Accept / Decline
5. Play hub: Create match, Find open game, My live/upcoming matches, TeamUps, Tournaments, Leaderboards
6. Open Games list + map toggle, filters: sport, level range, date/time, distance, singles/doubles
7. Open Game detail: venue, time, level range, joined players with levels, "1 spot left", cost split, Join,
   waitlist, chat preview
8. Create Open Game: from an existing booking or a new one, level range, slots, visibility
9. Round-robin / Open Play session board: rotating courts, who's on next, live mini-scores
10. Match recap card (shareable 1080×1920 story image)
```

## Batch 3: Match creation & live scoring (mobile)

```text
Using the master context, design these mobile screens:
1. Create match, step 1: match type (Friendly / TeamUp / Club / Tournament) + sport + format
2. Create match, step 2: ruleset (points to win, win by, cap, rally vs side-out, best of 1/3/5), with presets
   ("Pickleball standard", "Badminton BWF")
3. Create match, step 3: invite players / pick a TeamUp, venue/booking, time
4. Match invitation (recipient view)
5. Match lobby: confirmed players, scorer, court, Start button
6. Scorer selection / hand scoring to another player
7. LIVE SCORECARD, pickleball doubles: huge scores, server indicator + server number (1/2), side-out, rally
   point buttons per side, undo, timeout, end game, "offline: will sync" badge. Landscape variant too.
8. LIVE SCORECARD, badminton: 21-point rally, interval at 11, cap 30, side switching prompt
9. Score correction sheet
10. Game/match complete
11. Result confirmation (opponent view): Confirm / Dispute
12. Match summary: game scores, duration, rating change (+0.04), awaiting-confirmation state
13. Dispute form: reason, evidence photo, comment
14. Spectator live view (read-only, shareable link)
```

## Batch 4: Clubs & TeamUps (mobile)

```text
Using the master context, design these mobile screens:
1. Clubs tab: My clubs + Discover (nearby, filters by sport/city)
2. Create club: name, logo, sport(s), city, privacy, join mode; banner showing "1 of 4 clubs used"
3. Club profile (member view): header, announcements feed, upcoming events, members, leaderboard, matches,
   tournaments tabs
4. Club profile (visitor view): Request to join
5. Members list with role badges (Owner, Admin, Member)
6. Member management: promote to admin, remove, transfer ownership
7. Join requests (approve / decline) + invite members
8. Club admin dashboard: pending requests, create tournament, create club match, post announcement
9. Club leaderboard
10. Club settings + leave club
11. My TeamUps
12. Create TeamUp / invite partner (+ pending state)
13. TeamUp profile: combined rating, W/L, history, analytics charts
14. Challenge another TeamUp
```

## Batch 5: Tournaments (mobile + one desktop organizer screen)

```text
Using the master context, design these screens:
Mobile:
1. Tournaments discover (Open, Upcoming, Live, Completed; filters by sport/city/level)
2. Tournament detail: banner, host + verified badge, dates, venue, categories, fee, rules, Register CTA
3. Registration form (dynamic fields) + "Find a doubles partner" option
4. Registration status (pending, approved, waitlisted, rejected) + My registrations
5. Live tournament hub: order of play, my next match, live courts
6. Bracket (pinch-zoom), group standings table, results
7. Player check-in
8. Host verification: apply + status
Organizer (mobile):
9. Create tournament wizard: details → categories → registration form builder → fees → publish
10. Review registrations (approve / waitlist / reject, bulk)
11. Seeding + fixture generation
12. Court assignment & schedule
Desktop web:
13. Big-screen TV mode: live bracket + order of play for display at the venue
```

## Batch 6: Courts & booking (mobile)

```text
Using the master context, design these mobile screens:
1. Courts tab: map with price pins + list view, filters (sport, indoor/outdoor, price, amenities, time)
2. Venue detail (Pickelton partner): gallery, rating, amenities, courts, pricing, reviews, directions
3. External venue detail (from Google/OSM): clearly "Not bookable on Pickelton", directions, suggest it to the venue
4. Availability: date strip + court × time grid, slot states (available / selected / booked / waitlist)
5. Booking review: summary, price breakdown, cancellation policy, split payment toggle (invite players to pay)
6. Booking confirmed: add to calendar, invite players, create open game from this booking, share to WhatsApp
7. Booking detail: QR check-in code, directions, cancel booking
8. My bookings (upcoming / past)
9. Rate & review venue
10. Academies & coaching: program list, class detail, enrol
```

## Batch 7: Profile, stats, settings & system states (mobile)

```text
Using the master context, design these mobile screens:
1. My profile: avatar, handle, sports, ratings per sport × format with reliability %, W/L, streak, achievements
2. Rating detail: rating history line chart, recent rated matches
3. Match history (filters: sport, type, result)
4. Head-to-head vs a player
5. Public player profile (another user): Invite to match, Add friend, Block/Report in the overflow menu
6. Achievements/badges
7. Leaderboards: Global / City / Club / Friends, per sport and format
8. Edit profile
9. Settings home
10. Notification preferences, Privacy, Account security (sessions/devices), Linked accounts, Language, Theme
11. Delete account (with consequences + confirmation) and Download my data
12. Blocked users, Report user/content, Help & FAQ, Contact support
13. System states: empty states (no matches, no clubs, no bookings), offline, error/retry, force update,
    maintenance, permission denied, 404
```

## Batch 8: Player website (desktop 1440)

```text
Using the master context, design the Pickelton player website on desktop (1440), with responsive notes for 768:
1. Public landing page: hero, how it works, app download, cities, featured tournaments (SEO)
2. Logged-in home: left sidebar nav (Home, Play, Courts, Clubs, Tournaments, Leaderboards), top search, right
   activity panel
3. Courts search: map + list split view
4. Public venue page with a booking widget
5. Public tournament page + bracket page (shareable, no login needed)
6. Tournament organizer console: registrations table, fixtures, court schedule
7. Public club page
8. Public player profile
9. Leaderboards
10. Settings
```

## Batch 9: Partner portal (desktop) + partner mobile

```text
Using the master context, design Pickelton Partner. It's a business tool: calmer, data-dense, the same brand
tokens, light mode default.
Desktop:
1. Signup + business setup wizard + verification upload/status
2. Dashboard: today's bookings, revenue, occupancy %, alerts, upcoming check-ins
3. Day timeline: all courts × hours, drag to create/move bookings, blocked slots
4. Venues list + add/edit venue (location pin, gallery, amenities, opening hours, policies)
5. Courts list + court editor (sports supported, surface, indoor/outdoor)
6. Pricing rules (peak/off-peak, weekend, member price, per sport)
7. Availability: recurring schedules + blocked dates
8. Bookings table + booking detail (check-in, cancel, refund)
9. Academies: programs, classes, coaches, enrolments
10. Offers/promotions builder with preview of how it looks in the player app
11. Tournament hosting dashboard
12. Customers + customer history
13. Staff & permissions
14. Analytics: occupancy heatmap, peak hours, booking trends
15. Finance: revenue, transactions, payouts
16. Reviews (reply) + settings
Partner mobile (5 tabs: Today, Bookings, Courts, Tournaments, Profile):
17. Today timeline, 18. QR check-in scanner, 19. Walk-in booking, 20. Block a court, 21. Booking notification
```

## Batch 10: Admin (desktop)

```text
Using the master context, design Pickelton Admin: an internal tool, very dense, neutral, light mode, with lime
used only for primary actions. Role-based. Sensitive actions require a confirmation with a reason and 2FA re-auth.
1. Overview KPIs + operational alerts
2. Users directory + user detail (suspend/restore, history)
3. Clubs directory + moderation + ownership dispute
4. Match disputes inbox + case view (evidence, score events timeline, decision)
5. Tournaments review / cancel
6. Host verification queue + application review (evidence, 3 qualifying tournaments, approve/reject)
7. Partner verification + venue review + suspension
8. Content moderation queue (reported profiles, posts, photos)
9. Notifications: templates, broadcast composer, delivery status
10. Configuration: sports, scoring rulesets, rating rules, fees, feature flags
11. Analytics (growth, retention, bookings)
12. Support tickets
13. Audit log (who, what, before/after diff)
14. Admin users & roles
```

---

## Tips

- If a batch comes out inconsistent, reply: *"Keep the exact components from Batch 0B. Regenerate only screens 4–6."*
- Ask for a **flow view** after each batch ("show these screens connected as a user flow") to catch missing steps.
- When a screen is approved, ask Claude Design for **React Native (Expo) component code using our theme tokens**,
  or hand the screenshot to Claude Code with: *"Implement this screen in `mobile/app/...` using `useTheme()` and the
  components in `mobile/components/`."*
