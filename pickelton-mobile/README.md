# Pickelton Mobile

Standalone Expo Router mobile app for Pickelton.

## Setup

1. Create `.env` from `.env.example`.
2. Set `EXPO_PUBLIC_API_URL` to the LAN IP of the computer running Spring Boot.
3. Keep the phone and computer on the same WiFi network.

```env
EXPO_PUBLIC_API_URL=http://192.168.0.34:8080
```

## Run

```bash
npm install
npx expo start --clear
```

Scan the QR code with Expo Go.

## Routes

- `/(auth)/login`
- `/(auth)/signup`
- `/(tabs)`
- `/(tabs)/clubs`
- `/(tabs)/community`
- `/match/create`
- `/match/invite`
- `/match/scoring`
- `/host/apply`
