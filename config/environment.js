//environment.js
var environments = {  
    staging: {
      FIREBASE_API_KEY: 'AIzaSyAXPq_JzkD5XZmUcde2yhLUzHJGlPSJPtA',
      FIREBASE_AUTH_DOMAIN: 'detect-text-66e39.firebaseapp.com',
      FIREBASE_DATABASE_URL: 'https://detect-text-66e39.firebaseio.com',
      FIREBASE_PROJECT_ID: 'detect-text-66e39',
      FIREBASE_STORAGE_BUCKET: 'detect-text-66e39.appspot.com',
      FIREBASE_MESSAGING_SENDER_ID: '668334676189',
      GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyAY-60LXEK9ljB10Wa4aAyodQYiqtHtigE'
    },
    production: {
      // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
    }
  };
  
  function getReleaseChannel() {  
    let releaseChannel = Expo.Constants.manifest.releaseChannel;
    if (releaseChannel === undefined) {
      return 'staging';
    } else if (releaseChannel === 'staging') {
      return 'staging';
    } else {
      return 'staging';
    }
  }
  function getEnvironment(env) {  
    console.log('Release Channel: ', getReleaseChannel());
    return environments[env];
  }
  var Environment = getEnvironment(getReleaseChannel());  
  export default Environment;  