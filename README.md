# 🫀 Patient Vital Signs Monitor Simulator

A real-time patient vital signs monitor built in React, simulating how biomedical sensors feed data into embedded alert systems. Developed as a demonstration of embedded systems logic applied to healthcare — bridging a background in Human Physiology with software engineering.

---

## 🔬 What It Does

This project simulates the core architecture of a biomedical monitoring device:

**Sensor Input → Data Processing → Threshold Logic → Alert Output**

Every 2 seconds, the system "polls" simulated sensor readings for five vital signs and runs them through conditional logic to determine patient status — exactly how a real embedded system like an Arduino or Raspberry Pi would process signals from physical sensors.

### Vitals Monitored

| Vital Sign | Normal Range | Source |
|---|---|---|
| Heart Rate | 60–100 bpm | Cardiovascular Physiology |
| SpO₂ (Blood Oxygen) | 95–100% | Respiratory Physiology |
| Body Temperature | 36.1–37.5 °C | Thermoregulation |
| Systolic Blood Pressure | 90–120 mmHg | Cardiovascular Physiology |
| Diastolic Blood Pressure | 60–80 mmHg | Cardiovascular Physiology |

> Normal ranges are clinically accurate, sourced from Human Physiology (B.Sc., Bayero University Kano).

---

## ✨ Features

- **Live ECG Waveform** — animates in real time, speed tied to current heart rate
- **5 Vital Sign Cards** — colour-coded with HIGH/LOW flags when out of range
- **3 Patient Profiles** — switch between Cardiology, ICU, and General Ward patients
- **Condition Simulator** — toggle between Stable, Warning, and Critical states to observe system response
- **Alert Log** — fires contextual alerts when readings breach thresholds
- **Reading History** — tracks the last 8 readings with timestamps and status

---

## 🧠 The Embedded Systems Connection

This project was built to demonstrate understanding of how embedded systems work in healthcare contexts:

| Embedded Concept | This Simulation |
|---|---|
| Sensor polling | Vitals generated every 2 seconds |
| Threshold comparisons | Conditional checks against clinical ranges |
| State machine logic | Stable → Warning → Critical transitions |
| Output/actuation | Alert log firing on abnormal readings |
| Real-time display | Live ECG canvas + updating vital cards |

In a physical implementation, the Python or C logic powering an Arduino/Raspberry Pi would follow the same flow — read sensor, compare to threshold, trigger output.

---

## 🛠 Built With

- React (Hooks)
- HTML5 Canvas — ECG waveform rendering
- CSS animations — pulse, blink, slide-in effects
- No external dependencies beyond React

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/asiyasabiu25/vital-signs-monitor.git

# Install dependencies
npm install

# Start development server
npm start
```

Or view the live demo: **[asiyasabiu25.github.io/vital-signs-monitor](#)**

---

## 👩🏾‍💻 About the Developer

**Asiya Sabiu Sulaiman** — Data Analytics & Health Technology

- B.Sc. Human Physiology, Bayero University Kano
- 3MTT Data Science & Machine Learning Certificate
- Microsoft Business Analyst Professional Certificate (Coursera)
- McKinsey Forward Programme 2026

This project sits at the intersection of my clinical background and software skills — demonstrating that understanding *what* sensors measure and *why* thresholds matter is just as important as the code itself.

🔗 [Portfolio](https://docs.google.com/document/d/1QSPGPmWNSs3jboSpEqSpeG8Y8zmXLGCKRGVwH5ZifIs/edit?usp=sharing) · [GitHub](https://github.com/asiyasabiu25) · [LinkedIn](https://linkedin.com/in/asiya-sabiu)

---

## 📄 License

MIT — free to use, adapt, and build on.
