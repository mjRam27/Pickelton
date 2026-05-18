import { api } from "./api";

export type CreateTournamentPayload = {
  name: string;
  description?: string;
  sportType: string;
  tournamentType: string;
  clubId?: string;
  entryFee?: number;
  maxPlayers: number;
  startDate: string;
};

export async function createTournament(payload: CreateTournamentPayload) {
  const response = await api.post("/api/tournaments", payload);
  return response.data;
}
