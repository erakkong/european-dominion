# EUROPEAN DOMINION
**The Fate of Europe Lies in Your Hands.**  
*Grand Strategy · Dynasty MMO · Historical Sandbox · Browser Game*  
*Europa & Anatolien · Epoche ab 1770 · Multiplayer · Echtzeitstrategie*

---

## 🌍 Über das Spiel

**EUROPEAN DOMINION** verbindet die tiefgehende Wirtschaftssimulation von *Victoria 3*, die militärische Strategie von *Hearts of Iron IV*, die Dynastie- und Hofmechaniken von *Crusader Kings*, die detailreiche Kartenstruktur von *Age of History 3* sowie die intuitive Zugänglichkeit von *Call of War*.

Das Spiel beginnt um 1770 am Vorabend der Französischen Revolution und simuliert ein lebendiges europäisches Machtgefüge mit 72 souveränen Staaten, 3.621 Provinzen, strategischen Meerengen (Öresund, Bosporus, Gibraltar, Dardanellen) und dynamischen Großregionen.

---

## 🚀 1-Click Deployment auf Render.com

Dieses Projekt ist für das Hosting als Web Service auf [render.com](https://render.com) optimiert.

### Manuelle Einrichtung auf Render:
1. Erstelle ein kostenloses Konto auf [render.com](https://render.com).
2. Klicke auf **New +** -> **Web Service**.
3. Verbinde dein GitHub-Repository (`european-dominion`).
4. Konfiguriere folgende Einstellungen:
   - **Name:** `european-dominion`
   - **Environment:** `Node`
   - **Region:** `Frankfurt (EU Central)` oder beliebig
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Klicke auf **Deploy Web Service** – Render baut das Projekt und stellt es unter deiner persönlichen `.onrender.com`-Domain online zur Verfügung!

---

## 💻 Lokale Installation & Ausführung

### Voraussetzungen:
- Node.js (v18+)
- Git

### Befehle:
```bash
# 1. Repository klonen
git clone https://github.com/<DEIN-BENUTZERNAME>/european-dominion.git
cd european-dominion

# 2. Abhängigkeiten installieren & Client bauen
npm install
npm run build

# 3. Server starten
npm start
```

Anschließend im Browser unter `http://localhost:3001` öffnen!

---

## 🏛️ Kernfeatures

- **3.621 Detail-Provinzen:** Echte Geometriedaten aus Paradox- und AoH3-Dateien mit Geländetypen, Ressourcen, Bevölkerungszahlen und Verteidigungswerten.
- **49 Großregionen:** Boni für 100% Gebietskontrolle (*Steuereffizienz, Produktionsbonus, Verwaltung, Rekrutierung, Versorgung*).
- **72 Souveräne Staaten:** Authentische Flaggen, Herrschernamen, Dynastien und Schatzkammern um 1770/1792.
- **Strategische Meerengen & Chokepoints:** *Öresund & Großer Belt* (Sundzoll), *Bosporus*, *Dardanellen*, *Straße von Gibraltar*, *Ärmelkanal*, *Straße von Messina* sowie *Rhein*, *Donau* und *Elbe*.
- **Wirtschaft & Binnenmärkte:** Victoria-3-inspiriertes Wirtschaftssystem mit geteilten Märkten und Warenpreisen.
- **Provinzausbau & Subventionen:** 10 Gebäudetypen mit 4 Ausbaustufen sowie staatliche Sektorsubventionen (Landwirtschaft, Industrie, Forschung, Wege).
- **Militär & Doktrinen:** 6 HOI4-Militärdoktrinen, Rekrutierung historischer Regimenter (Linieninfanterie, Husaren/Kavallerie, Feldartillerie).
- **Speichersystem:** Vollständige Schnappschüsse können jederzeit gesichert und geladen werden.

---

## 🛠️ Technologie-Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Karten-Engine:** HTML5 Canvas 2D Engine mit stufenlosem Pan & Zoom und Ray-Casting
- **Backend:** Node.js, Express, WebSockets (`ws`)
- **Architektur:** Server-Authoritative Simulation mit Echtzeit-Synchronisation

---

## 📜 Lizenz
MIT License.
