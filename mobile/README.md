# NCRI Mobile — Hybrid Mobile Application (HMAD)
**National Cyber Incident Analytics Platform for Trend Analysis and Risk Assessment**

> Built for the **Mobile Application Development** Assignment (NITT MCA / PWPI Project Work).  
> Faithfully mirrors the official NCRI Web Platform design, typography, and telemetry visualizers.

---

## 📱 Quick Links & Deliverables

| Deliverable | Location |
| :--- | :--- |
| **Android APK Binary** | [`NCRI-Mobile-App.apk`](../NCRI-Mobile-App.apk) *(also in [`mobile/NCRI-v1.0.0.apk`](./NCRI-v1.0.0.apk))* |
| **Mobile Source Code** | [`mobile/`](./) (React 18, TypeScript, Tailwind CSS, Recharts, Capacitor) |
| **Live Cloud Backend** | [https://ncri.onrender.com](https://ncri.onrender.com) |
| **API Documentation** | [https://ncri.onrender.com/docs](https://ncri.onrender.com/docs) |
| **Web Dashboard** | [https://ncri.vercel.app](https://ncri.vercel.app) |
| **GitHub Repository** | [https://github.com/tej-carpenter/NCRI](https://github.com/tej-carpenter/NCRI) |

---

## 🎨 Human-Centric UI & Visual Fidelity

The hybrid mobile app replicates the exact visual language of the production NCRI web platform:
- **Full Dual Theme Support**: Instant toggling between **Dark Mode** (`#0b0f19` / `#131826`) and **Light Mode** (`#f8fafc` / `#ffffff`), with persistent active pill controls in the top navigation bar.
- **Top Navigation Bar**: Brand identity (`NCRI Platform v1.0.0`), live `● System Operational` badge, `Sync Sources` trigger, `Export CSV` share button, and theme switcher.
- **Scope Ribbon**: Segmented filter allowing single-touch switching between `Global Landscape`, `India`, `United States`, `Germany`, and `United Kingdom`.
- **6 KPI Metric Cards**: `VERIFIED INCIDENTS` [Aggregated], `MONITORED SOURCES` [Active], `EXPLOITED CVES` [Enriched], `COVERED NATIONS` [Cross-Border], `CRITICAL SEVERITY` [Impact], and `RANSOMWARE SHARE` [Dominant].

---

## 📊 Graph & Visualization Rules

In strict compliance with visual analytics standards:
1. **Line Graphs (Exclusively for Temporal Trends)**:
   - **Dashboard**: `Incident Trajectory (2014 – 2026)` smooth spline area chart with gradient fill underneath showing incident volume velocity over years.
   - **Trends & Prediction Tab**: Multi-line visualization rendering Observed Incident Volume (blue line/fill), 3-Period Rolling Moving Average (cyan line), and Linear Forecast Projection (dashed orange line), with `Yearly` / `Monthly` switcher.
2. **Bar Graphs (Exclusively for Categorical Classification)**:
   - **Dashboard**: `Target Sectors by Incident Share` horizontal bar chart with distinct color palette (*Transportation, IT, Education, Government, Healthcare, etc.*).
   - **Sector Analysis Tab**:
     - Horizontal Bar Chart: Incident Volume by Target Sector.
     - Vertical Bar Chart: Attack Classification Breakdown (*Ransomware, Vulnerability Exploitation, DDoS, Data Breach, Malware, etc.*).
     - Categorical Indicators Table with relative share progress bars and severity indices.

---

## 🛡️ Incident-Level NCRI Risk Scoring

In the NCRI framework, **risk indices are computed specifically for each individual cyber incident**:
$$\text{NCRI}_i = (w_{\text{sev}} \cdot S_i) + (w_{\text{crit}} \cdot C_{\text{sector}}) + (w_{\text{expl}} \cdot E_{\text{attack}}) + (w_{\text{actor}} \cdot A_{\text{actor}})$$

- **Per-Incident Assignment**: Every incident card and telemetry row displays its assigned NCRI score (0.0 to 100.0) alongside its severity tier (*Severe, High, Elevated, Moderate, Low*).
- **Incident Detail Modal (Inspect)**: Tapping `Inspect` reveals the mathematical breakdown into severity factor ($S_i$), infrastructure criticality ($C_{\text{sec}}$), exploitation velocity ($E_{\text{att}}$), and threat actor factor ($A_{\text{act}}$).
- **Interactive Risk Simulator**: Security analysts can simulate hypothetical breach scenarios by tweaking sector criticality, severity rating, and threat actor profiles to compute the exact incident NCRI score.
- **Native Sharing**: Users can share incident assessments and risk reports directly to system apps via `@capacitor/share`.

---

## 🏗️ Build & Compilation

To build the APK locally:

```bash
# 1. Build Web Assets
cd mobile
npm run build

# 2. Sync to Android Container
npx cap sync

# 3. Assemble APK via Gradle
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
cd android
.\gradlew assembleDebug
```
The compiled output is located at `mobile/android/app/build/outputs/apk/debug/app-debug.apk` and copied to `NCRI-Mobile-App.apk`.
