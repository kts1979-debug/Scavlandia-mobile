const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withGoogleMapsApiKey(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    // Remove any existing geo.API_KEY meta-data
    if (application["meta-data"]) {
      application["meta-data"] = application["meta-data"].filter(
        (item) => item.$["android:name"] !== "com.google.android.geo.API_KEY",
      );
    } else {
      application["meta-data"] = [];
    }

    // Add the Maps API key
    application["meta-data"].push({
      $: {
        "android:name": "com.google.android.geo.API_KEY",
        "android:value": "AIzaSyAWOLSMvDOKwiQ122nNfWszwk90SYAJVLg",
      },
    });

    console.log("✅ Google Maps API key injected into AndroidManifest.xml");
    return config;
  });
};
