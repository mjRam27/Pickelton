# PLAN.md: Pickelton UI Redesign

Every screen in every app is being redesigned from scratch. This file lists **what screens exist, how they connect,
and the order to design and build them**. Read it before working on any UI.
Coding conventions are in [CLAUDE.md](CLAUDE.md). Design prompts are in [docs/design/claude-design-prompts.md](docs/design/claude-design-prompts.md).

## Product focus

Pickelton is a **scoring app with a social platform**: live scoring, matches, ratings, clubs, tournaments, and a
community feed (posts, follows, partner finding). **Court booking is parked**: no booking, venue or partner screens
are built for now. The previous partner portal and partner backend are saved on the git branch
`parked/partner-booking`; restore them from there when booking comes back.

## Apps being redesigned

| App | Platforms | Code |
|---|---|---|
| Pickelton (player) | iOS + Android (one Expo app), website | `mobile/`, `web/` |
| Pickelton Admin | Web only | `admin/` (not started) |
| ~~Pickelton Partner~~ | Parked with booking | branch `parked/partner-booking` |

Sports: **pickleball and badminton**. Every screen must work for both.

## Redesign rules

1. **Start with the design system.** No screen is built before tokens and components are approved (Batch 0).
2. **One look across all apps.** Tokens live in `packages/constants` and are used by mobile, web and admin.
3. **Replace, don't patch.** When a redesigned screen lands, delete the old screen and its unused components.
4. **Each screen ships with** dark + light mode, empty/loading/error states, and real API data (no mock data left behind).
5. **Features come from user goals, not backend modules.** "I want to play" is found through **Play**, even if it
   involves matches, invites and teams.

## Navigation

**Player mobile: 5 tabs:** Home · Play · Clubs · Community · Profile
Top bar: sport switcher (Pickleball ⇄ Badminton), search, notifications, invitations.
Tournaments, TeamUps and leaderboards live inside Play and Home. Community is the social feed: posts, follows,
partner finding and club updates. (The current build still has the design's tabs: Home · Clubs · Events · Community.)

**Player web:** left sidebar (Home, Play, Clubs, Community, Tournaments, Leaderboards), top search, notifications,
account menu. Public pages (no login, SEO) for tournaments + brackets, clubs and player profiles.

**Admin web:** Overview, Users, Clubs, Disputes, Tournaments, Host Verification, Moderation, Payments,
Notifications, Analytics, Configuration, Support, Audit Logs, Admin Roles

## Screen list & design order

Tick a screen when it is **designed** and again when it is **built**. The batch numbers match the prompts file.

### Batch 0: Design system
- [ ] Visual direction (pick 1 of 3) · [x] Colour & type tokens · [x] Component library · [ ] Icons & illustrations

### Batch 1: Onboarding & auth
- [x] Splash · [ ] Welcome carousel · [x] Sign in (phone/email, Apple, Google) · [x] Sign up · [ ] OTP
- [ ] Forgot / reset password · [ ] Profile setup + age gate · [ ] Choose sports · [ ] Skill self-assessment
- [ ] Location · [ ] Permission primers · [ ] Terms & privacy consent · [ ] "You're in" suggestions

### Batch 2: Home, Play & Open Games
- [x] Home feed · [ ] Global search · [ ] Notifications inbox · [ ] Invitations inbox · [ ] Play hub
- [ ] Open Games list + map · [ ] Open Game detail · [ ] Create Open Game · [ ] Round robin / open play board
- [ ] Match recap share card

### Batch 3: Matches & live scoring
- [x] Create match (type + sport + format) · [ ] Ruleset picker · [ ] Invite players · [ ] Invitation (recipient)
- [ ] Match lobby · [ ] Scorer selection · [x] Live scorecard: pickleball · [ ] Live scorecard: badminton
- [ ] Score correction · [ ] Match complete · [ ] Result confirmation · [ ] Match summary · [ ] Dispute form
- [ ] Spectator live view

### Batch 4: Clubs & TeamUps
- [x] Clubs tab (mine + discover) · [ ] Create club (x of 4) · [x] Club profile (member) · [ ] Club profile (visitor)
- [ ] Members & roles · [ ] Join requests & invites · [ ] Club admin dashboard · [ ] Club leaderboard
- [ ] Club settings / leave / transfer ownership · [ ] My TeamUps · [ ] Create TeamUp · [ ] TeamUp profile
- [ ] Challenge a TeamUp

### Batch 5: Tournaments
- [x] Discover · [x] Detail · [ ] Registration form + find partner · [ ] Registration status / my registrations
- [ ] Live tournament hub · [ ] Bracket · [x] Standings & results · [ ] Check-in · [x] Host verification apply/status
- [x] Create tournament wizard · [ ] Review registrations · [ ] Seeding & fixtures · [ ] Court schedule
- [ ] TV / big-screen mode (web)

### Batch 6: Courts & booking (parked)
Not being built. See *Product focus* above.

### Batch 7: Profile, settings & system states
- [ ] My profile · [ ] Rating detail · [ ] Match history · [ ] Head-to-head · [ ] Public player profile
- [ ] Achievements · [ ] Leaderboards · [ ] Edit profile · [ ] Settings (notifications, privacy, security,
  linked accounts, language, theme) · [ ] Delete account · [ ] Download my data · [ ] Blocked users
- [ ] Report · [ ] Help & support
- [ ] Empty states · [ ] Offline · [ ] Error/retry · [ ] Force update · [ ] Maintenance · [ ] Permission denied · [x] 404

### Batch 8: Player website
- [x] Landing page · [x] Logged-in home · [x] Community feed · [x] Clubs list + club page · [x] Events list + detail
- [x] Leaderboard · [x] Create tournament · [x] Create match · [x] Live scorer · [x] Profile + settings · [x] Host desk + apply
- [x] Tournament registration (custom questions, UPI payment, UTR) · [x] Review registrations · [x] My tournaments
- [x] Phone verification (SMS) · [x] Public (no-login) tournament page
- [ ] Tournament bracket · [ ] Organizer console · [ ] Public club and player pages · [ ] Player profile (public)

### Batch 9: Partner (parked)
Parked with booking. Dashboard, Courts, Bookings + detail, Customers, Analytics and Settings were built and are
saved on branch `parked/partner-booking`.

### Batch 10: Admin
- [ ] Overview · [ ] Users · [ ] Clubs · [ ] Disputes · [ ] Tournaments · [ ] Host verification
- [ ] Moderation queue · [ ] Notifications · [ ] Configuration · [ ] Analytics · [ ] Support · [ ] Audit log · [ ] Admin roles

## Rules every screen must respect

- Up to **4 owned clubs** per user. Any player with a **verified phone** can host a tournament; a club is optional
  (only that club's owners/admins can attach it).
- Entry fees go **straight to the host by UPI**. A spot counts once registered; the host confirms the payment.
- **TeamUp** = exactly 2 accepted players.
- Match types: **Friendly, TeamUp, Club, Tournament**.
- Results affect ratings **only after the opponent confirms**. Show "awaiting confirmation".
- Ratings are per **sport × format** with a reliability %.
- Scoring: pickleball 11, win by 2, side-out or rally, server 1/2. Badminton 21, win by 2, cap 30, rally.
- Apple requirements: **Sign in with Apple** and **in-app account deletion**.
