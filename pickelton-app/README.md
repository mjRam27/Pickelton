# Pickelton App

Frontend workspace for Pickelton with platform-specific presentation and neutral reusable logic:

- `apps/mobile`: Expo React Native application for Android and iOS through Expo Go.
- `apps/web`: Next.js web application using semantic HTML and responsive web UI.
- `packages/api`: HTTP client and backend endpoint definitions.
- `packages/types`: API DTOs and domain types.
- `packages/constants`: cross-platform domain constants.
- `packages/utils`: pure formatting and validation helpers.

Web and mobile do not share rendered UI components or theme implementations. Each app owns its components, navigation, and visual tokens while sharing only service contracts and pure logic.

## Prerequisites

The mobile app uses Expo SDK 54 for the currently targeted Expo Go runtime. Use Node.js 22 LTS, preferably `22.13.0` or newer.

## Install

```bash
npm install
```

## Phone With Expo Go

```bash
npm run mobile
```

Install Expo Go on your phone, keep the phone and computer on the same Wi-Fi, and scan the QR code displayed in the terminal. If the LAN connection is blocked by the network, use:

```bash
npm run mobile:tunnel
```

## Next.js Web

```bash
npm run web
```

Open `http://localhost:3000`. Web pages use Next.js-native React components and can be extended with server-rendered public tournament routes.

## Backend Connection

Use API contracts from `packages/types` and endpoints/client code from `packages/api`. Implement authentication/session storage separately in each app using:

- Mobile local network URL: `http://<your-computer-lan-ip>:8080`
- Android emulator URL: `http://10.0.2.2:8080`
- Web local URL: `http://localhost:8080`

Do not use `localhost` from a physical phone because it refers to the phone itself.

Use `EXPO_PUBLIC_API_URL` for the mobile endpoint and `NEXT_PUBLIC_API_URL` for web when the backend URL differs from local development.
