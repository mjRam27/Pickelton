# Pickelton 🏸🥒

**Pickelton** is a booking and scoring app for **pickleball** and **badminton** players. Whether you're reserving a court or tracking match scores, Pickelton makes it easy to organize games and stay on top of your stats.

---

## Features

### Court Booking
- **Browse available courts** — View real-time court availability for both pickleball and badminton.
- **Reserve a court** — Book courts by date, time, and sport type with just a few taps.
- **Manage reservations** — View, modify, or cancel upcoming bookings from your dashboard.
- **Recurring bookings** — Set up weekly or custom recurring reservations for regular play sessions.

### Scoring & Match Tracking
- **Live score tracking** — Keep score during a match with an intuitive scoreboard interface.
- **Match history** — Review past matches, including scores, opponents, and dates.
- **Support for singles & doubles** — Track games for both singles and doubles formats.
- **Sport-specific rules** — Automatic scoring rules for pickleball (rally scoring or side-out) and badminton (best of 3 games to 21).

### Player Profiles
- **Player accounts** — Create a profile to track your bookings and match history.
- **Stats dashboard** — View personal statistics such as win/loss record and games played.
- **Friend list** — Add other players to quickly invite them to matches and bookings.

### Notifications
- **Booking reminders** — Get notified before your upcoming court reservations.
- **Match invitations** — Receive alerts when another player invites you to a game.
- **Cancellation alerts** — Stay informed if a booking you're part of is modified or cancelled.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/mjRam27/Pickelton.git
cd Pickelton

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=your_database_connection_string
PORT=3000
```

---

## Usage

1. **Create an account** or log in to your existing profile.
2. **Book a court** by selecting a sport, date, and available time slot.
3. **Start a match** and use the built-in scoreboard to track points in real time.
4. **Review your history** on the stats dashboard to see past matches and results.

---

## Tech Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | React             |
| Backend    | Node.js / Express |
| Database   | PostgreSQL        |
| Auth       | JWT               |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "Add my feature"`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Open a pull request.

Please make sure your code follows the existing style and includes appropriate tests.

---

## License

This project is licensed under the [MIT License](LICENSE).