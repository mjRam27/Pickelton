export async function getCurrentAccessToken(): Promise<string> {
  const token = localStorage.getItem("partner_token");

  if (!token) {
    throw new Error("Partner login session not found.");
  }

  return token;
}
