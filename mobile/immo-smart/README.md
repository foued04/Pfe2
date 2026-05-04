# ImmoSmart Android Wrapper

This Capacitor project wraps the existing Next.js web app from `test_front`.

## Development URL

Capacitor reads the web app from `CAPACITOR_APP_URL`.

Default:

```text
http://10.0.2.2:3000
```

`10.0.2.2` is the Android emulator alias for your host machine's `localhost`.

Important:

- `10.0.2.2` only works in the Android emulator
- it does not work on a real physical phone
- for a real phone, use your computer's Wi-Fi IP such as `http://192.168.1.50:3000`

## Typical workflow

1. Start the backend:

```bash
cd backend
npm install
npm run dev
```

2. Start the web app:

```bash
cd test_front
npm install
npm run dev
```

For a real phone on the same Wi-Fi, use:

```bash
cd test_front
npm install
npm run dev:mobile
```

3. Sync Android:

```bash
cd mobile/immo-smart
npm install
npm run cap:sync
```

4. Open Android Studio:

```bash
npm run android:open
```

## Custom URL

If you need to point the wrapper at another running web URL:

```powershell
$env:CAPACITOR_APP_URL="http://192.168.1.50:3000"
npm run cap:sync
```

For a physical phone, the full flow is:

```powershell
cd backend
npm run dev
```

```powershell
cd test_front
npm run dev:mobile
```

```powershell
$env:CAPACITOR_APP_URL="http://192.168.1.50:3000"
cd mobile/immo-smart
npm run cap:sync
npm run android:open
```

Then run the app on the connected phone from Android Studio.
