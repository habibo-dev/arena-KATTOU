# DR M. KATTOU — Chirurgien Dentiste

The official digital platform of the DR M. KATTOU dental clinic: a full clinic
website, online appointment booking, and a live patient queue with estimated
waiting times, plus reception / doctor / owner dashboards.

> « اعرف متى سيأتي دورك، بدل أن تجلس وتنتظر. »

## Business information

- **Doctor:** DR M. KATTOU — Chirurgien Dentiste
- **Address:** B22 Bloc 05 N°135 Hay Salam, Khemis Miliana, Aïn Defla, Algeria
- **Phone:** 0558 41 80 73 · 027 56 94 94
- **Services:** ODF · Soins · Prothèses · Extractions · Radio · Blanchiment · Petite Chirurgie

Opening hours are intentionally shown as **« Horaires à confirmer »** until the
clinic configures them in *Settings → Opening hours*.

## What's inside

| Surface | Route | Description |
| --- | --- | --- |
| Clinic website | `/`, `/services`, `/about`, `/location`, `/contact` | Official trilingual (AR/FR/EN) site with full RTL |
| Booking | `/book` | 5-step wizard: service → date → time → details → confirm |
| My appointment | `/a/:token` | View / cancel / reschedule / check-in (opaque token URL) |
| My queue | `/a/:token/queue` | Live position, patients ahead, ETA **range**, remote waiting |
| QR check-in | `/checkin/:token` | Scan-to-check-in confirmation screen |
| Reception | `/staff/queue` | Queue manager, walk-ins, delays, emergencies, patient cards |
| Doctor | `/staff/doctor` | One-tap "next patient", current visit, measured durations |
| Patients | `/staff/patients` | Operational contact list (no medical records) |
| Analytics | `/staff/analytics` | Real metrics from completed visits; honest empty states |
| Settings | `/staff/settings` | Clinic info, hours, booking window, ETA engine, photo |
| Team | `/staff/team` | Roles (owner / doctor / receptionist) + capabilities |
| Product page | `/platform` | Positioning, features and pricing for clinic owners |

### Demo staff accounts (local only)

`admin` / `dr.kattou` / `reception` — password `Kattou@2025`.
These run in the browser and must be replaced by server-issued credentials when
a real backend is connected.

## Architecture

- React 18 + TypeScript + Vite + Tailwind CSS, `react-router-dom` (HashRouter so
  deep links work on any static host).
- All clinic state flows through one store (`src/store/clinic.tsx`) persisted via
  a `ClinicRepository` interface — swap `LocalStorageRepository` for an HTTP
  implementation to connect a real backend without touching components.
- The ETA engine (`src/lib/eta.ts`) is pure, unit-tested and always returns a
  range. Analytics are computed only from measured, completed visits.
- Notification architecture (`src/lib/notifications.ts`) ships an always-on
  in-app channel plus **integration points** for SMS / WhatsApp / push; external
  channels report their real (unconfigured) status and never claim a send.
- Privacy boundary (`src/lib/privacy.ts`) stores operational data only and
  redacts other patients on shared patient pages.

## Development

```bash
npm install
npm run dev        # http://0.0.0.0:5173
npm test           # vitest (ETA engine, queue ordering, validation)
npm run build      # tsc --noEmit && vite build
```

## Honesty by design

The UI never invents credentials, awards, prices, reviews, opening hours or
historical data, and never claims an SMS/WhatsApp/push message was sent unless a
provider is actually configured.
