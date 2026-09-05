# BoothOS V2.1

A clean, runnable browser foundation for a photo-booth platform.

## Run locally

```bash
npm install
npm run dev
```

For the iPad booth, open the app from HTTPS. Safari camera access requires a secure context.

## Current working pieces

- Dashboard navigation
- Event creation
- Event settings
- Front-camera booth mode
- Countdown
- Mirrored preview
- JPEG capture at the camera's negotiated video resolution
- Branding overlay
- Template selector foundation
- Custom template upload UI
- Device pairing/status foundation
- Remote-control command foundation
- Client gallery and password gate
- Local persistence

## Important

This is a browser foundation, not a finished cloud SaaS. The next step is a backend with authentication, database, object storage and WebSockets so an iPad and laptop can communicate across the internet.