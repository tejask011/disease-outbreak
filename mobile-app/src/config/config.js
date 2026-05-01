// src/config/config.js
// IP: 10.90.0.107 (From Expo server output)
export const IP = '10.90.0.107'; // Updated to current network IP
// Using a physical device requires the actual IP address, not localhost
export const CONFIG = {
  API_BASE_URL: `http://${IP}:3000`,
  ML_API_URL: `http://${IP}:5001`
};
