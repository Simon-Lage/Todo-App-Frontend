# Test-Benutzer für die Todo-App

## 🔐 Feste Login-Daten (nach Backend-Seed)

Nach dem Ausführen des Seed-Commands im Backend stehen folgende Test-Accounts zur Verfügung:

### 🔴 **Administrator**
```
E-Mail:    admin@changeit.test
Passwort:  123
```
**Berechtigungen:** Nur Benutzer/Rollen/Logs

**Kann:**
- ✅ Benutzer verwalten (erstellen, bearbeiten, löschen, aktivieren/deaktivieren)
- ✅ Rollen verwalten (erstellen, bearbeiten, löschen, Berechtigungen setzen)
- ✅ System-Logs einsehen
- ❌ Keine Aufgaben oder Projekte sehen/bearbeiten

---

### 🟡 **Abteilungsleiter (Teamlead)**
```
E-Mail:    teamlead@changeit.test
Passwort:  123
```
**Berechtigungen:** Projekt- und Task-Management

**Kann:**
- ✅ Tasks für sein Team erstellen und zuweisen
- ✅ Alle Tasks sehen (auch von anderen)
- ✅ Projekte erstellen und verwalten
- ✅ Team-Mitglieder sehen
- ❌ Keine Benutzer/Rollen verwalten
- ❌ Nichts löschen

---

### 🟢 **Mitarbeiter (Staff)**
```
E-Mail:    staff@changeit.test
Passwort:  123
```
**Berechtigungen:** Basis-Zugriff

**Kann:**
- ✅ Eigene Tasks bearbeiten (Status ändern)
- ✅ Projekte ansehen
- ❌ Keine Tasks erstellen
- ❌ Keine Projekte erstellen
- ❌ Keine Admin-Funktionen

---

## 🚀 Backend-Daten generieren

```bash
cd Todo-App-Backend
docker compose exec php bin/console app:dev:seed-random-data --purge
```

Dies erstellt:
- 3 feste Test-User (siehe oben)
- 1 weiterer Admin + 9 weitere Teamleads + 99 weitere Staff-Member (zufällige Namen)
- ~100 Projekte
- ~1000 Tasks mit Zuweisungen

---

## 📝 Hinweise

- Die Seed-Daten verwenden als Domain standardmäßig `@changeit.test`.
- Einige zufällig generierte Accounts können inaktiv sein; die drei festen Test-Accounts oben sind aktiv.

