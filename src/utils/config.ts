// src/utils/config.ts
// Central config file — change API_URL here when you deploy to production

export const config = {
  // During development, this points to your laptop's local server
  // IMPORTANT: Replace 192.168.x.x with YOUR computer's actual IP address
  // To find your IP: on Mac run 'ipconfig getifaddr en0' in terminal
  //                  on Windows run 'ipconfig' and look for IPv4 Address
  API_URL: "http://192.168.86.20:3000",

  // How close (in meters) the user must be to 'arrive' at a stop
  ARRIVAL_RADIUS_METERS: 50,

  // How often to check GPS position (in milliseconds)
  LOCATION_UPDATE_INTERVAL: 3000,
};
