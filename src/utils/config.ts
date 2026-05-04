// src/utils/config.ts
// Central config file — toggle IS_DEV to switch between local and production

const IS_DEV = false; // ← set to true for local testing, false for production builds

export const config = {
  API_URL: IS_DEV
    ? "http://192.168.86.20:3000" // local dev
    : "https://scavlandia-api-production.up.railway.app", // production

  // How close (in meters) the user must be to 'arrive' at a stop
  ARRIVAL_RADIUS_METERS: 50,

  // How often to check GPS position (in milliseconds)
  LOCATION_UPDATE_INTERVAL: 3000,
};
