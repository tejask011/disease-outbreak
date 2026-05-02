// src/config/config.js

// === LOCAL DEVELOPMENT (Expo Go) ===
// Change this IP to your machine's IP (found in Expo output or `ipconfig`)
const LOCAL_IP = '10.90.0.107';

const DEV_CONFIG = {
  API_BASE_URL: `http://${LOCAL_IP}:3000`,
  ML_API_URL: `http://${LOCAL_IP}:5001`,
};

// === PRODUCTION (APK / Deployed) ===
const PROD_CONFIG = {
  API_BASE_URL: "https://disease-outbreak.onrender.com",
  ML_API_URL: "https://disease-outbreak-2.onrender.com",
};

// Auto-detect: __DEV__ is true in Expo Go / dev mode, false in production APK builds
export const CONFIG = __DEV__ ? DEV_CONFIG : PROD_CONFIG;
