# 🌍 AI-Based Disease Outbreak Prediction System (Silent Signals)

A high-fidelity, production-grade disease monitoring and risk prediction platform.  
This system leverages Machine Learning to analyze historical outbreak data, weather patterns, and real-time reports to provide **actionable insights for public health officials and the general public**.

Unlike traditional systems, it focuses on detecting **early weak signals** — identifying outbreaks *before they become obvious*.

---

## 📱 Mobile Implementation (Screenshots)

### 📊 Dashboard & Map
| Dashboard | Risk Map |
|----------|----------|
| <img src="screenshots/dashboard.png" width="250"/> | <img src="screenshots/high-risk.png" width="250"/> |

---

### 📈 Analytics & Trends
| Analytics | Trends |
|----------|--------|
| <img src="screenshots/analytics.png" width="250"/> | <img src="screenshots/insights2.png" width="250"/> |

---

### 📍 Risk Levels
| High Risk | Medium Risk | Low Risk |
|----------|-------------|----------|
| <img src="screenshots/high-risk.png" width="220"/> | <img src="screenshots/medium-risk.png" width="220"/> | <img src="screenshots/low-risk.png" width="220"/> |

---

### 📌 Area Details & Insights
| High Risk Area | Medium Risk Area | Low Risk Area |
|---------------|----------------|--------------|
| <img src="screenshots/insgits1.png" width="220"/> | <img src="screenshots/insights2.png" width="220"/> | <img src="screenshots/insights.png" width="220"/> |

---

### 📤 Data Upload
| Upload Dataset |
|---------------|
| <img src="screenshots/upload.png" width="250"/> |

---

## ❗ Problem Statement

Most outbreak detection systems:

- Depend on confirmed hospital data  
- Detect outbreaks only after significant spread  
- Lack early warning capabilities  

👉 This leads to delayed response and increased risk to communities.

---

## 💡 Our Approach

Instead of waiting for large spikes, the system analyzes:

- Gradual increase in disease cases  
- Time-based trends (7–14 days)  
- Environmental conditions (humidity, rainfall, temperature)  
- Regional disease patterns  

👉 The goal is to detect **early weak signals before they become major outbreaks**

---

## ⚙️ Key Features

### 1️⃣ Real-time Risk Engine
- AI-powered predictions using **Random Forest / Gradient Boosting**
- Dynamic risk scoring (Low / Medium / High)
- Trend-based risk evaluation

---

### 2️⃣ Geographic Intelligence
- Interactive map with outbreak clusters
- Hyperlocal risk detection
- Area-level insights

---

### 3️⃣ Advanced Analytics
- Time-series disease tracking
- Multi-disease monitoring (Dengue, Malaria, Flu, etc.)
- Visual analytics dashboards

---

### 4️⃣ Data Management
- CSV / Excel upload support
- Real-time data processing
- Backend integration with ML services

---

### 5️⃣ Explainable AI
- Shows *why* risk increased
- Combines trend + growth + environment
- Human-readable insights

---

## 🧠 Core Concept

> **"Are small changes today the beginning of something bigger?"**

---

## ⚙️ System Flow

```plaintext
Data Input (Clinical + Reports)
        ↓
Data Processing & Cleaning
        ↓
Environmental Data Integration
        ↓
Trend Analysis (7–14 days)
        ↓
Early Weak Signal Detection
        ↓
Risk Calculation Engine
        ↓
Insight Generation
        ↓
Visualization & Alerts

### 🛠 Technology Stack
📱 Frontend (Mobile)
React Native (Expo)
UI: Custom design (modern dashboard UI)
Charts: react-native-chart-kit, react-native-svg
Maps: react-native-maps
🌐 Web Frontend
React.js
Chart.js / Recharts
Responsive dashboard UI
⚙️ Backend
Node.js
Express.js
MongoDB (Atlas)
REST APIs
🧠 Machine Learning
Python
Scikit-learn
Models: Random Forest, Gradient Boosting
Model Serving: Flask / FastAPI
🌍 External APIs
Weather API (temperature, humidity, rainfall)
Geolocation / Mapping API
📁 Project Structure
Backend/
mobile-app/
ml/
frontend/
screenshots/
🚀 Getting Started
1. Clone Repository
git clone <repository-url>
2. Backend Setup
cd Backend
npm install
npm start
3. Mobile App Setup
cd mobile-app
npm install
npm start
4. ML Service Setup
cd ml
pip install -r requirements.txt
python server.py
👥 Team
Yashashri Rajput
Tejas Kulkarni
Samruddhi Patil
💡 Future Improvements
Real-time hospital data integration
Push notification alert system
Advanced deep learning models
Multi-agent AI healthcare system
Government API integration