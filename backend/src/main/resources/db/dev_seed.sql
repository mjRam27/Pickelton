-- Development-only persisted sample accounts.
-- All accounts use the password: Pickelton123!
-- Safe to run repeatedly because every insert is idempotent.

INSERT INTO users (id, name, email, password, date_of_birth, phone_number, email_verified, phone_verified, auth_provider, bio, city)
VALUES
('10000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'aarav@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1993-04-12', '+919000000001', true, true, 'LOCAL', 'Club organizer and competitive doubles player.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000002', 'Diya Rao', 'diya@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1996-08-22', '+919000000002', true, true, 'LOCAL', 'Tournament host and pickleball coach.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000003', 'Kabir Singh', 'kabir@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1991-02-08', '+919000000003', true, true, 'LOCAL', 'Singles player and match referee.', 'Mysuru'),
('10000000-0000-0000-0000-000000000004', 'Ananya Iyer', 'ananya@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1995-11-17', '+919000000004', true, true, 'LOCAL', 'Community organizer and doubles player.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000005', 'Rohan Mehta', 'rohan@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1990-06-03', '+919000000005', true, true, 'LOCAL', 'Badminton and pickleball player.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000006', 'Meera Nair', 'meera@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1998-01-29', '+919000000006', true, true, 'LOCAL', 'Live-score volunteer and club member.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000007', 'Vikram Patel', 'vikram@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1989-09-14', '+919000000007', true, true, 'LOCAL', 'Venue coordinator and tournament player.', 'Hyderabad'),
('10000000-0000-0000-0000-000000000008', 'Ishita Gupta', 'ishita@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1997-05-21', '+919000000008', true, true, 'LOCAL', 'Doubles specialist and community contributor.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000009', 'Arjun Das', 'arjun@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1994-12-02', '+919000000009', true, true, 'LOCAL', 'Competitive singles player.', 'Chennai'),
('10000000-0000-0000-0000-000000000010', 'Sana Khan', 'sana@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1999-03-18', '+919000000010', true, true, 'LOCAL', 'New player building tournament experience.', 'Bengaluru'),
('10000000-0000-0000-0000-000000000011', 'Neel Joshi', 'neel@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1992-07-11', '+919000000011', true, true, 'LOCAL', 'Club administrator and scorekeeper.', 'Pune'),
('10000000-0000-0000-0000-000000000012', 'Tara Menon', 'tara@pickelton.local', '$2b$10$HIT67ePGUZeq8dGBgO6KYeF1HTaQkYVcnXmxg5Wg0wX2Y/RE9h7/O', '1996-10-25', '+919000000012', true, true, 'LOCAL', 'Recreational player and event volunteer.', 'Bengaluru')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clubs (id, name, description, location, created_by) VALUES
('20000000-0000-0000-0000-000000000001', 'Indiranagar Rally Club', 'Open-play sessions and competitive ladders.', 'Indiranagar, Bengaluru', '10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002', 'Southside Smashers', 'A community club for singles and doubles players.', 'Jayanagar, Bengaluru', '10000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000003', 'Deccan Paddle Collective', 'Weekend pickleball and badminton events.', 'Hyderabad', '10000000-0000-0000-0000-000000000007')
ON CONFLICT (id) DO NOTHING;

INSERT INTO club_members (user_id, club_id, role) VALUES
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','ADMIN'),
('10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','MEMBER'),
('10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000001','MEMBER'),
('10000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000001','MEMBER'),
('10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','ADMIN'),
('10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','MEMBER'),
('10000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000002','MEMBER'),
('10000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000002','MEMBER'),
('10000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000003','ADMIN'),
('10000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000003','MEMBER'),
('10000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000003','MEMBER'),
('10000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000003','MEMBER')
ON CONFLICT (club_id, user_id) DO NOTHING;

INSERT INTO tournaments (id, name, description, sport_type, tournament_type, status, created_by, club_id, entry_fee, max_players, start_date) VALUES
('30000000-0000-0000-0000-000000000001','Bengaluru Summer Rally','An open singles tournament for verified local players.','PICKLEBALL','SINGLES','ONGOING','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',499,16,NOW() + INTERVAL '2 days'),
('30000000-0000-0000-0000-000000000002','Deccan Doubles Weekend','A social doubles bracket with live scoring.','PICKLEBALL','DOUBLES','UPCOMING','10000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000003',299,24,NOW() + INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO registrations (user_id, tournament_id, status)
SELECT id, '30000000-0000-0000-0000-000000000001', 'REGISTERED' FROM users WHERE id IN
('10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000010')
ON CONFLICT (user_id, tournament_id) DO NOTHING;

INSERT INTO matches (id, created_by, sport, match_type, status, scheduled_at, location, rules, tournament_id, player1_id, player2_id, score1, score2, round) VALUES
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','PICKLEBALL','SINGLES','LIVE',NOW(),'Court 1, Southside Smashers','{"pointsPerSet":11,"bestOfSets":3,"winByTwo":true}','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000009',8,6,'Quarterfinal'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','PICKLEBALL','SINGLES','SCHEDULED',NOW() + INTERVAL '1 day','Court 2, Indiranagar Rally Club','{"pointsPerSet":11,"bestOfSets":3,"winByTwo":true}',NULL,'10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005',0,0,'Club ladder'),
('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000007','PICKLEBALL','DOUBLES','SCHEDULED',NOW() + INTERVAL '9 days','Center Court, Deccan Paddle Collective','{"pointsPerSet":11,"bestOfSets":3,"winByTwo":true}','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000010',0,0,'Round 1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO match_participants (match_id, user_id, team_code, role, invitation_status) VALUES
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','A','PLAYER','ACCEPTED'),
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000009','B','PLAYER','ACCEPTED'),
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000006',NULL,'SCORER','ACCEPTED'),
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000011',NULL,'REFEREE','ACCEPTED'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','A','PLAYER','ACCEPTED'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','B','PLAYER','ACCEPTED')
ON CONFLICT (match_id, user_id, role) DO NOTHING;

INSERT INTO match_state (match_id, current_score, current_set, live_state, revision) VALUES
('40000000-0000-0000-0000-000000000001','{"A":8,"B":6}',1,'{"servingTeam":"A"}',14),
('40000000-0000-0000-0000-000000000002','{"A":0,"B":0}',1,'{}',0),
('40000000-0000-0000-0000-000000000003','{"A":0,"B":0}',1,'{}',0)
ON CONFLICT (match_id) DO NOTHING;

INSERT INTO tournament_matches (tournament_id, match_id, round) VALUES
('30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','Quarterfinal'),
('30000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003','Round 1')
ON CONFLICT (match_id) DO NOTHING;

INSERT INTO posts (id, user_id, club_id, content, metadata_json) VALUES
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','Open play starts at 7 PM tonight. Four player spots are still available.','{"tag":"OPEN PLAY"}'),
('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000002','Quarterfinal scoring is live on Court 1.','{"tag":"MATCHDAY"}'),
('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000003','Doubles registrations close this Friday.','{"tag":"TOURNAMENT"}')
ON CONFLICT (id) DO NOTHING;
