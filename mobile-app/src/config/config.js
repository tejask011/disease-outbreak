// src/config/config.js
// IP: 10.90.0.73 (Found via ipconfig)
export const IP = '10.45.10.73'; // Auto-detected IP
// Using a physical device requires the actual IP address, not localhost
export const CONFIG = {
  API_BASE_URL: `http://${IP}:3000`,
  ML_API_URL: `http://${IP}:5001`
};
