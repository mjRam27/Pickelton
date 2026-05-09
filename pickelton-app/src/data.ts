import { Group, Court, Match } from "./types";

export const GROUPS: Group[] = [
  {
    id: "1",
    name: "London Shuttle Elites",
    description: "Premier badminton club in Central London. High-intensity training sessions every Tuesday and Thursday.",
    members: 156,
    sport: "Badminton",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvJ3xxSDZDPUPVUoiZ9-lAsk6TKVOjAF1O-_zuN1JFJw5sRrAFuWrWsk-P5GMOIbgWeNkgEdD-KHuTqg4tGioHnI6XFK-7N5A9HWobxwwVxc53a4YFh9WdbEP9tcIwjdJ0JZA6D4IlFbmXwxQjF_gibh8fn6f9fShKrAfr0PlcH1hPpVnmreFc8YLdTZPbwsZP6pdHjYIc47LAzKAqXZsquEabvgP3gCC4iYWJiHgDu6aPYSuC9G8l1ZiSCxtUMA2MD6TPP_9tw085",
    trending: true,
    live: true
  },
  {
    id: "2",
    name: "Westside Smashers",
    description: "The most active pickleball community in West London. Open to all skill levels from beginners to pros.",
    members: 128,
    sport: "Pickleball",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpujoC3HrX6LmyW_gEk8KAk6IZ6OgoOkyA6z_Ie8HYi3gfDOd1_YTRaM3hHyo_g-hKe5lU6XUPCH6QC7QSJyO8foKLUld73fdAIw5JRjS3FxB2Iaqpix8E0FFsbX8m5oaxMugSVYQ9nLo65zZZeAbk8vfP6svD_iPk0tf_ISxK0w-iekkN-GTAS2bb0z2WHNo_qhBTViKsRTfsOOcrFxaWRni9s_iA5BaprcARPIx6MewSqVcec7B9k7vzxkjOLPl92JK9XaTgFWUh",
    activity: "3 new events this week"
  },
  {
    id: "3",
    name: "Net Masters London",
    description: "Competitive badminton for advanced players. Weekly ladder matches and monthly tournaments.",
    members: 84,
    sport: "Badminton",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2Zy2CNftkULwhAwBX45rOb3JHYlozQncPANt6bvnG9PmZOW16AIYi4vR-txyuSl-T3X1vA4d5RpTV7kqmC7_0G0TgycTY-x0bmn8qT3U3abiIgSa1LJGMDL4YalnSbTR-PZeilWr3UY25W7-bezoSdBywI8qUvM09Yap87eLr2Wdtl-L1PL2v5wqylDu5rDRPrLLYxyWeYkIYXmzkqlrmbU-4OBf7bUGBYnxMRHEhXhv6HeAkNiXVaj5CKqpFGhT18VhFGhwDPUds",
    activity: "Matches every Wed"
  },
  {
    id: "4",
    name: "Southbank Socials",
    description: "Fun, social-first pickleball group. We play, we hang out, we drink coffee. No pressure, just vibes.",
    members: 215,
    sport: "Pickleball",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAguPKj1Zs_ih823xt35fImvtipxvwgOIMScSacLczIaWv1gm2zU9VL4DwV0cCu2JkXftPFR-TI_PaKaiAxKcmKHtxdqd3Z-KURzX67h4ybGP4wnjDhpipuhAjRj4og1TQXvG-FU3OQGUoedHF9SFkgQx-j2y6mEdeKVfKQFwhrCggKTQIiMNWo5cTx35Fac-fzByH3T_9WA0m-1gks3wvmLkmViuS0Q1gbb9IUik0lf9Zxs1VPJIJfIBB4HeyAomhkv5aHS2oiuE5N",
    activity: "Fastest growing"
  }
];

export const COURTS: Court[] = [
  {
    id: "1",
    name: "AeroDome Center",
    type: "6 INDOOR COURTS",
    price: 18,
    distance: "1.2 MILES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7RXt4X8D8K52Z5DQ8n0T1jMy305XNtJg55psaZf_GdkOK4ncGgyCssOV-2lAPTDc59uTn0isNFnmmC5Mf_FqRmSmsFJagIWUqUu27l5AbH8MHz3HMro-FKLsWJjiTfeTQ2MGXa2L5jpIgWsM-cuQIqndDoyU3FPksLUX97JuA98QKFEQQFsUMcuSkC5to4USyfiVqEZC4mhQMEQBDRt--9KmlpXiGM5cB3OzNs79zis6jn7dpyOcJYYLeN8hz_id_x3g39X6exW8T",
    courts: 6
  },
  {
    id: "2",
    name: "The Pickle Plaza",
    type: "8 OUTDOOR COURTS",
    price: 12,
    distance: "2.4 MILES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4z8a5vzvo9nzzgSoXAKTbcuRPgAqhv_Hsvn430hOoX7RxVp3DShNUwllN0giNfHUImo5ja5jF0_bdOHGpDo0kDK8WZN2yG7YgHbjA_T_szLPJmv83EbVEJXAK-hwPq--Mi_LY-1hmT9aeKaXTXaSsGTj5W5un6p4PfDEEG1ImVXMNweDKiy8dfm3Di78HEc4S_oZjcTXI4Z0cJLHPdNDq13R_-P6GX_kusaogmoQ_FTqeQr7buvB_RuGWRaciYgGrYzedDT9eB2JJ",
    courts: 8
  },
  {
    id: "3",
    name: "Zenith Sports Club",
    type: "PREMIUM CLUB",
    price: 25,
    distance: "0.8 MILES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYMuUSfHMn7X8wjvTSI_MCgjhuRbtTE_qUKT3uZq4qz3E-elQZkq-MrtSEP7LPUcSdmqUmBJ7b8d8CRD6fShDwQP4rl6I3T3LzZdvay1uwvgSa7bnxNY1q-f8hL9FFvmjDGlwQaEnJ3eZIayw5moSoXGWK5j396lOZr_4CFOlDa6luBIdZcbEmAjAW-Qr58zbvl8fh3ESNV1ieqjhHjxk04PBdt47FN_j1ZR4FV4TsnAbnyEaefnlp6Q-FxbKlNvUHJeaP0ZHFOjpU",
    courts: 4,
    premium: true
  }
];

export const MATCHES: Match[] = [
  {
    id: "1",
    player1: "Team Alpha",
    player2: "Westside Duo",
    score1: 11,
    score2: 8,
    sport: "Pickleball",
    court: "Court 4",
    live: true
  },
  {
    id: "2",
    player1: "S. Malik",
    player2: "J. Christie",
    score1: 21,
    score2: 19,
    sport: "Badminton",
    court: "Court 1",
    live: true
  }
];
