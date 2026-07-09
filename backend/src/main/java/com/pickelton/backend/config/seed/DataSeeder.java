package com.pickelton.backend.config.seed;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.entity.ClubMember;
import com.pickelton.backend.club.repository.ClubMemberRepository;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.community.entity.Post;
import com.pickelton.backend.community.repository.PostRepository;
import com.pickelton.backend.enums.ClubRole;
import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.enums.IdDocumentType;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.PlatformRole;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.ScoreEventType;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.host.entity.HostVerification;
import com.pickelton.backend.host.repository.HostVerificationRepository;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import com.pickelton.backend.match.entity.ScoreEvent;
import com.pickelton.backend.match.entity.TournamentMatch;
import com.pickelton.backend.match.repository.MatchParticipantRepository;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.match.repository.MatchStateRepository;
import com.pickelton.backend.match.repository.ScoreEventRepository;
import com.pickelton.backend.match.repository.TournamentMatchRepository;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds realistic demo data. Runs ONLY when the "seed" Spring profile is active
 * (e.g. {@code SPRING_PROFILES_ACTIVE=seed} or {@code --spring.profiles.active=seed}),
 * so it never executes in production. Idempotent: skips if the marker user exists.
 *
 * All seeded users share the password: {@code Pickelton@123}
 */
@Slf4j
@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    public static final String SEED_PASSWORD = "Pickelton@123";
    private static final String MARKER_EMAIL = "aarav.sharma@pickelton.dev";

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final MatchStateRepository matchStateRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final PostRepository postRepository;
    private final HostVerificationRepository hostVerificationRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    private static final String[][] PEOPLE = {
        {"Aarav Sharma", "Indiranagar"}, {"Vivaan Mehta", "Koramangala"}, {"Aditya Rao", "Whitefield"},
        {"Vihaan Nair", "HSR Layout"}, {"Arjun Reddy", "Jayanagar"}, {"Sai Krishnan", "Marathahalli"},
        {"Reyansh Gupta", "Bellandur"}, {"Ishaan Verma", "BTM Layout"}, {"Kabir Singh", "Hebbal"},
        {"Ananya Iyer", "Indiranagar"}, {"Diya Patel", "Koramangala"}, {"Saanvi Menon", "Whitefield"},
        {"Aadhya Pillai", "HSR Layout"}, {"Myra Joshi", "Jayanagar"}, {"Anika Desai", "Marathahalli"},
        {"Kiara Bhat", "Bellandur"}, {"Navya Kapoor", "BTM Layout"}, {"Sara Khan", "Hebbal"},
        {"Rohan Shetty", "Electronic City"}, {"Karthik Hegde", "Yelahanka"}, {"Meera Shah", "Indiranagar"},
        {"Tanvi Kulkarni", "Koramangala"}, {"Dev Malhotra", "Whitefield"}, {"Nisha Pai", "HSR Layout"},
        {"Aryan Chawla", "Jayanagar"}, {"Priya Ramesh", "Marathahalli"}, {"Veer Saxena", "Bellandur"},
        {"Riya Banerjee", "BTM Layout"},
    };

    private static final String[] BIOS = {
        "Weekend warrior. 3.5 DUPR and climbing.", "Dink first, ask questions later.",
        "Badminton convert chasing the perfect third-shot drop.", "Here for the rallies and the post-match dosa.",
        "Left-handed, unpredictable, mostly harmless.", "Singles grinder. Doubles when bribed with coffee.",
        "Club organiser and certified line-call diplomat.", "Smash now, apologise never.",
        "Two paddles, one dream.", "Recovering tennis player. The net is lower now and I love it.",
    };

    private static final String[] POST_TAGS = {"MATCHDAY", "OPEN PLAY", "WIN", "TRAINING", "CLUB NOTE", "LADDER"};
    private static final String[] POST_CONTENT = {
        "Two courts, eight paddles, one suspiciously competitive warm-up. Four spots open tonight.",
        "Took the decider 12-10 after being down 3-8. Never give up on a rally.",
        "Morning drills done. Working on the backhand dink all week.",
        "Who's in for the Saturday ladder? Bring water and a good attitude.",
        "First tournament win in the books. Thanks to everyone who came out.",
        "Reminder: club night moves to 7:30 PM this week. New nets are in.",
        "Lost in the semis but the level of play was unreal. Already booked next month.",
        "Looking for a doubles partner around HSR. Intermediate, plays weekends.",
        "That third-shot drop is finally landing. Patience pays off.",
        "Great session with the new players tonight. The community keeps growing.",
    };

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail(MARKER_EMAIL).isPresent()) {
            log.info("[seed] Marker user already exists - skipping data seeding.");
            return;
        }
        log.info("[seed] Seeding demo data...");

        List<User> users = seedUsers();
        seedHostVerifications(users);
        List<Club> clubs = seedClubs(users);
        List<Tournament> tournaments = seedTournaments(users.get(0), clubs);
        seedMatchesAndLeaderboardData(users, tournaments);
        seedCasualMatches(users);
        seedPosts(users, clubs);

        log.info("[seed] Done. {} users, {} clubs, {} tournaments seeded. Login with any seeded email + password '{}'.",
            users.size(), clubs.size(), tournaments.size(), SEED_PASSWORD);
        log.info("[seed] Marker / approved-host account: {}", MARKER_EMAIL);
    }

    private List<User> seedUsers() {
        String hash = passwordEncoder.encode(SEED_PASSWORD);
        List<User> users = new ArrayList<>();
        for (int i = 0; i < PEOPLE.length; i++) {
            String name = PEOPLE[i][0];
            String city = PEOPLE[i][1];
            String email = name.toLowerCase().replace(" ", ".") + "@pickelton.dev";
            String phone = String.format("+9190%08d", 10000000 + i);
            SportType sport = i % 3 == 0 ? SportType.BADMINTON : i % 3 == 1 ? SportType.PICKLEBALL : SportType.BOTH;
            User user = User.builder()
                .name(name)
                .email(email)
                .password(hash)
                .phoneNumber(phone)
                .dateOfBirth(LocalDate.of(1988 + (i % 18), 1 + (i % 12), 1 + (i % 27)))
                .emailVerified(true)
                .phoneVerified(true)
                .authProvider("LOCAL")
                .role(i == 0 ? PlatformRole.ADMIN : PlatformRole.USER)
                .bio(BIOS[i % BIOS.length])
                .avatarUrl("https://i.pravatar.cc/300?img=" + (i + 1))
                .city(city)
                .build();
            // sport currently informational; stored in bio context. Kept for future profile use.
            users.add(user);
        }
        return userRepository.saveAll(users);
    }

    private void seedHostVerifications(List<User> users) {
        OffsetDateTime now = OffsetDateTime.now();
        // Approved host (the marker user) - can create tournaments.
        hostVerificationRepository.save(HostVerification.builder()
            .user(users.get(0))
            .fullName(users.get(0).getName())
            .dateOfBirth(users.get(0).getDateOfBirth())
            .phoneNumber(users.get(0).getPhoneNumber())
            .addressLine1("12, 1st Main Road")
            .city(users.get(0).getCity())
            .stateRegion("Karnataka")
            .postalCode("560038")
            .idDocumentType(IdDocumentType.AADHAAR)
            .idDocumentNumberLast4("4321")
            .documentImageUrl("https://placehold.co/600x400?text=ID+Document")
            .selfieWithDocumentUrl("https://placehold.co/600x400?text=Selfie")
            .termsAccepted(true)
            .dataProcessingConsent(true)
            .status(HostVerificationStatus.APPROVED)
            .submittedAt(now.minusDays(30))
            .reviewedAt(now.minusDays(29))
            .reviewedBy(users.get(0))
            .build());

        // Pending application (the status screen has something to show).
        hostVerificationRepository.save(HostVerification.builder()
            .user(users.get(1))
            .fullName(users.get(1).getName())
            .dateOfBirth(users.get(1).getDateOfBirth())
            .phoneNumber(users.get(1).getPhoneNumber())
            .addressLine1("44, 80 Feet Road")
            .city(users.get(1).getCity())
            .stateRegion("Karnataka")
            .postalCode("560034")
            .idDocumentType(IdDocumentType.AADHAAR)
            .idDocumentNumberLast4("9876")
            .documentImageUrl("https://placehold.co/600x400?text=ID+Document")
            .selfieWithDocumentUrl("https://placehold.co/600x400?text=Selfie")
            .termsAccepted(true)
            .dataProcessingConsent(true)
            .status(HostVerificationStatus.PENDING_REVIEW)
            .submittedAt(now.minusDays(2))
            .build());
    }

    private List<Club> seedClubs(List<User> users) {
        String[][] clubData = {
            {"Net Masters Bengaluru", "Indiranagar", "Competitive pickleball crew. Tuesday and Thursday nights."},
            {"Southbank Smashers", "Koramangala", "All-levels badminton and pickleball. Beginners welcome."},
            {"Whitefield Pickle Hub", "Whitefield", "8 outdoor courts. Weekend ladders and socials."},
            {"City Court Kings", "Jayanagar", "Doubles specialists. Coaching every Sunday."},
            {"HSR Rally Club", "HSR Layout", "Early-morning play and a strong community feed."},
        };
        List<Club> clubs = new ArrayList<>();
        for (int i = 0; i < clubData.length; i++) {
            User owner = users.get(i);
            Club club = clubRepository.save(Club.builder()
                .name(clubData[i][0])
                .location(clubData[i][1])
                .description(clubData[i][2])
                .createdBy(owner)
                .build());
            clubMemberRepository.save(ClubMember.builder().club(club).user(owner).role(ClubRole.ADMIN).build());
            // Add 4-6 distinct members per club.
            int members = 4 + random.nextInt(3);
            List<Integer> added = new ArrayList<>();
            for (int m = 0; m < members; m++) {
                int idx = (i + 5 + m) % users.size();
                if (idx == i || added.contains(idx)) continue;
                added.add(idx);
                clubMemberRepository.save(ClubMember.builder()
                    .club(club).user(users.get(idx)).role(ClubRole.MEMBER).build());
            }
            clubs.add(club);
        }
        return clubs;
    }

    private List<Tournament> seedTournaments(User host, List<Club> clubs) {
        LocalDateTime now = LocalDateTime.now();
        List<Tournament> tournaments = new ArrayList<>();
        tournaments.add(tournamentRepository.save(Tournament.builder()
            .name("Bengaluru Summer Smash")
            .description("A city-wide singles ladder with a crisp Saturday finish.")
            .sportType(SportType.PICKLEBALL).tournamentType(TournamentType.SINGLES)
            .status(TournamentStatus.FINISHED).createdBy(host).club(clubs.get(0))
            .entryFee(new BigDecimal("499.00")).maxPlayers(32).startDate(now.minusDays(20))
            .build()));
        tournaments.add(tournamentRepository.save(Tournament.builder()
            .name("Indiranagar Night League")
            .description("Floodlit pickleball under the Indiranagar sky. Ongoing rounds.")
            .sportType(SportType.PICKLEBALL).tournamentType(TournamentType.SINGLES)
            .status(TournamentStatus.ONGOING).createdBy(host).club(clubs.get(0))
            .entryFee(new BigDecimal("350.00")).maxPlayers(16).startDate(now.minusDays(3))
            .build()));
        tournaments.add(tournamentRepository.save(Tournament.builder()
            .name("Whitefield Winter Open")
            .description("Doubles badminton across two weekends. Registration open.")
            .sportType(SportType.BADMINTON).tournamentType(TournamentType.DOUBLES)
            .status(TournamentStatus.UPCOMING).createdBy(host).club(clubs.get(2))
            .entryFee(new BigDecimal("799.00")).maxPlayers(24).startDate(now.plusDays(14))
            .build()));
        return tournaments;
    }

    private void seedMatchesAndLeaderboardData(List<User> users, List<Tournament> tournaments) {
        // Register 10 players into each of the first two tournaments; 8 into the upcoming one.
        registerPlayers(tournaments.get(0), users, 0, 10);
        registerPlayers(tournaments.get(1), users, 4, 10);
        registerPlayers(tournaments.get(2), users, 8, 8);

        // FINISHED tournament: 6 completed singles matches -> full leaderboard.
        Tournament finished = tournaments.get(0);
        int[][] finishedPairs = {{0, 1}, {2, 3}, {0, 2}, {4, 5}, {1, 4}, {3, 0}};
        for (int i = 0; i < finishedPairs.length; i++) {
            int[] p = finishedPairs[i];
            completedTournamentMatch(finished, users.get(p[0]), users.get(p[1]),
                users.get((p[0] + 10) % users.size()), "ROUND " + (i / 2 + 1), 20 - i);
        }

        // ONGOING tournament: 3 completed + 2 live matches.
        Tournament ongoing = tournaments.get(1);
        int[][] ongoingDone = {{4, 5}, {6, 7}, {4, 6}};
        for (int i = 0; i < ongoingDone.length; i++) {
            int[] p = ongoingDone[i];
            completedTournamentMatch(ongoing, users.get(p[0]), users.get(p[1]),
                users.get((p[1] + 10) % users.size()), "GROUP STAGE", 3);
        }
        liveTournamentMatch(ongoing, users.get(5), users.get(7), users.get(12), "SEMI-FINAL");
        liveTournamentMatch(ongoing, users.get(6), users.get(8), users.get(13), "SEMI-FINAL");
    }

    private void seedCasualMatches(List<User> users) {
        // A couple of casual (non-tournament) completed matches for variety.
        completedMatch(users.get(9), users.get(10), users.get(0), null, MatchStatus.COMPLETED, 7, "AeroDome Center", 5);
        completedMatch(users.get(11), users.get(12), users.get(1), null, MatchStatus.COMPLETED, 4, "The Pickle Plaza", 2);
        // One standalone live casual match for the home screen.
        Match live = matchRepository.save(baseMatch(users.get(13), MatchStatus.LIVE, "Zenith Sports Club", 0));
        addPlayers(live, users.get(13), users.get(14), users.get(2));
        matchStateRepository.save(liveState(live, 9, 7));
    }

    private void registerPlayers(Tournament tournament, List<User> users, int start, int count) {
        for (int i = 0; i < count; i++) {
            User u = users.get((start + i) % users.size());
            registrationRepository.save(Registration.builder()
                .tournament(tournament).user(u).status(RegistrationStatus.REGISTERED).build());
        }
    }

    private void completedTournamentMatch(Tournament tournament, User a, User b, User scorer, String round, int daysAgo) {
        Match match = completedMatch(a, b, scorer, round, MatchStatus.COMPLETED, daysAgo,
            tournament.getClub() != null ? tournament.getClub().getLocation() : "Center Court", daysAgo);
        tournamentMatchRepository.save(TournamentMatch.builder()
            .tournament(tournament).match(match).round(round).build());
    }

    private void liveTournamentMatch(Tournament tournament, User a, User b, User scorer, String round) {
        Match match = matchRepository.save(baseMatch(a, MatchStatus.LIVE,
            tournament.getClub() != null ? tournament.getClub().getLocation() : "Center Court", 0));
        match.setRound(round);
        addPlayers(match, a, b, scorer);
        matchStateRepository.save(liveState(match, 8 + random.nextInt(3), 5 + random.nextInt(3)));
        tournamentMatchRepository.save(TournamentMatch.builder()
            .tournament(tournament).match(match).round(round).build());
    }

    private Match completedMatch(User a, User b, User scorer, String round, MatchStatus status,
                                 int scoreLoser, String location, int daysAgo) {
        Match match = baseMatch(a, status, location, daysAgo);
        match.setRound(round);
        // Winner = a, final score 11 - scoreLoser.
        match.setWinner(a);
        match = matchRepository.save(match);
        addPlayers(match, a, b, scorer);
        matchStateRepository.save(finalState(match, 11, Math.min(scoreLoser, 9)));
        seedScoreEvents(match, scorer, 11 + Math.min(scoreLoser, 9));
        return match;
    }

    private Match baseMatch(User creator, MatchStatus status, String location, int daysAgo) {
        return Match.builder()
            .createdBy(creator)
            .sport(SportType.PICKLEBALL)
            .matchType(MatchType.SINGLES)
            .status(status)
            .scheduledAt(OffsetDateTime.now().minusDays(daysAgo))
            .location(location)
            .rules(rules())
            .build();
    }

    private void addPlayers(Match match, User a, User b, User scorer) {
        matchParticipantRepository.save(participant(match, a, "A", ParticipantRole.PLAYER));
        matchParticipantRepository.save(participant(match, b, "B", ParticipantRole.PLAYER));
        if (scorer != null && !scorer.getId().equals(a.getId()) && !scorer.getId().equals(b.getId())) {
            matchParticipantRepository.save(participant(match, scorer, null, ParticipantRole.SCORER));
        }
    }

    private MatchParticipant participant(Match match, User user, String team, ParticipantRole role) {
        return MatchParticipant.builder()
            .match(match).user(user).team(team).role(role)
            .invitationStatus(InvitationStatus.ACCEPTED).build();
    }

    private MatchState finalState(Match match, int a, int b) {
        Map<String, Object> score = new LinkedHashMap<>();
        score.put("A", a);
        score.put("B", b);
        List<Map<String, Object>> sets = new ArrayList<>();
        sets.add(score);
        return MatchState.builder()
            .match(match).currentScore(score).currentSet(1).setSummary(sets)
            .liveState(new LinkedHashMap<>()).revision((long) (a + b))
            .lastEventAt(OffsetDateTime.now().minusDays(1)).build();
    }

    private MatchState liveState(Match match, int a, int b) {
        Map<String, Object> score = new LinkedHashMap<>();
        score.put("A", a);
        score.put("B", b);
        return MatchState.builder()
            .match(match).currentScore(score).currentSet(1).setSummary(new ArrayList<>())
            .liveState(new LinkedHashMap<>()).revision((long) (a + b))
            .lastEventAt(OffsetDateTime.now()).build();
    }

    private void seedScoreEvents(Match match, User scorer, int totalPoints) {
        long seq = 1;
        int a = 0, b = 0;
        for (int i = 0; i < totalPoints; i++) {
            boolean toA = random.nextBoolean() ? a < 11 : b >= 9;
            if (toA && a < 11) a++; else if (b < 9) b++; else a++;
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("team", toA ? "A" : "B");
            payload.put("scoreA", a);
            payload.put("scoreB", b);
            scoreEventRepository.save(ScoreEvent.builder()
                .match(match).actor(scorer).eventType(ScoreEventType.POINT)
                .payload(payload).sequenceNumber(seq++).build());
        }
    }

    private Map<String, Object> rules() {
        Map<String, Object> rules = new LinkedHashMap<>();
        rules.put("pointsToWin", 11);
        rules.put("winByTwo", true);
        rules.put("bestOf", 1);
        return rules;
    }

    private void seedPosts(List<User> users, List<Club> clubs) {
        for (int i = 0; i < 30; i++) {
            User author = users.get(random.nextInt(users.size()));
            Map<String, Object> metadata = new LinkedHashMap<>();
            metadata.put("tag", POST_TAGS[i % POST_TAGS.length]);
            Post post = Post.builder()
                .user(author)
                .club(i % 3 == 0 ? clubs.get(i % clubs.size()) : null)
                .content(POST_CONTENT[i % POST_CONTENT.length])
                .metadata(metadata)
                .build();
            postRepository.save(post);
        }
    }
}
