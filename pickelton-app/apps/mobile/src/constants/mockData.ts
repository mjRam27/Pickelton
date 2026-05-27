// pickelton-app/apps/mobile/src/constants/mockData.ts
export const images = {
  player:
    "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=700&q=80",
  live:
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80",
  court:
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  club:
    "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=900&q=80",
  badminton:
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  profile:
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80",
};

export const matches = [
  { id: "1", players: ["Marcus V.", "Elena S."], scores: [11, 8], court: "Court 04", sport: "PICKLEBALL" },
  { id: "2", players: ["Team Alpha", "Westside Duo"], scores: [21, 19], court: "Court 01", sport: "BADMINTON" },
];

export const courts = [
  { id: "1", name: "AeroDome Center", details: "6 Indoor Courts", distance: "1.2 km", price: "Rs 480", image: images.court },
  { id: "2", name: "The Pickle Plaza", details: "8 Outdoor Courts", distance: "2.4 km", price: "Rs 350", image: images.club },
  { id: "3", name: "Zenith Sports Club", details: "Premium Club", distance: "3.1 km", price: "Rs 620", image: images.badminton },
];

export const clubs = [
  { id: "1", name: "Westside Smashers", members: "128 members", sport: "Pickleball", image: images.club },
  { id: "2", name: "Net Masters Bengaluru", members: "84 members", sport: "Badminton", image: images.badminton },
  { id: "3", name: "Southbank Socials", members: "215 members", sport: "Pickleball", image: images.court },
];
