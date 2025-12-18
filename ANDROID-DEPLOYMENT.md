# Android Deployment Guide

## Voraussetzungen

1. Node.js und npm installiert
2. Android Studio installiert
3. Android SDK installiert
4. Java JDK installiert

## Konfiguration

### 1. API-URL konfigurieren

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
VITE_API_BASE_URL=https://your-server.com/api
```

**Wichtig:** Ersetze `https://your-server.com/api` mit der tatsächlichen Backend-URL!

### 2. Capacitor initialisieren

```bash
npm install
npm run build
npx cap add android
```

### 3. Capacitor Config anpassen

Die `capacitor.config.ts` ist bereits konfiguriert:
- `appId`: `com.changeit.todoapp` (kann angepasst werden)
- `appName`: `Todo-App`
- `server.url`: Nur für Development (Live Reload), nicht für Production

### 4. Android Permissions

Die benötigten Permissions werden automatisch von Capacitor hinzugefügt:
- Internet (für API-Calls)
- Storage (für Bild-Uploads)

### 5. Build und Sync

```bash
npm run build
npx cap sync android
```

### 6. Android Studio öffnen

```bash
npx cap open android
```

### 7. In Android Studio

1. Warte bis Gradle Sync abgeschlossen ist
2. Wähle ein Device/Emulator
3. Klicke auf "Run" (▶️)

## Production Build

Für einen Production-Build:

1. Stelle sicher, dass `VITE_API_BASE_URL` auf die Production-URL zeigt
2. `npm run build`
3. `npx cap sync android`
4. In Android Studio: Build → Generate Signed Bundle / APK

## Wichtige Hinweise

- Die API-URL **muss** eine absolute URL sein (mit `https://`)
- Die API-URL wird über die Environment-Variable `VITE_API_BASE_URL` konfiguriert
- Für Development: Setze `VITE_API_BASE_URL=http://localhost:8443/api` (oder deine Dev-URL)
- Für Production: Setze `VITE_API_BASE_URL=https://your-production-server.com/api`
- Die App verwendet HTTPS für Android (siehe `androidScheme: 'https'`)
- `server.url` in `capacitor.config.ts` ist nur für Development Live Reload, nicht für Production!
