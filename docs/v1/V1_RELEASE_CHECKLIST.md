# V1 Release Checklist

Use this before publishing or sharing the current local browser MVP.

## Verification

- [ ] `node --check src/app.js`
- [ ] `node --check server.mjs`
- [ ] `npm run dev`
- [ ] Open `http://localhost:4173`
- [ ] Sign in with `steve / rollwright`
- [ ] Confirm demo project loads.
- [ ] Add one rectangular room.
- [ ] Add one stair run.
- [ ] Change packing mode.
- [ ] Export JSON.
- [ ] Export installer packet.

## Sharing

- [ ] Confirm the server is running.
- [ ] Use `http://localhost:4173` on the same machine.
- [ ] Use `http://LOCAL_IP:4173` from another device on the same network.
- [ ] Check Windows Firewall if LAN access fails.

## Warnings

- [ ] Tell demo users that login is local-only.
- [ ] Tell demo users not to enter private customer data yet.
- [ ] Tell demo users the optimizer is MVP logic and all cut plans require field verification.
