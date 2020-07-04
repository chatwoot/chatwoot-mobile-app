## Push notification

Refer [rnfirebase](https://rnfirebase.io/) for more details

### Android

1. Create a new [firebase](https://console.firebase.google.com/) project

2. In he Firebase console, add a new Android application and enter your projects details. The "Android package name" must match your local projects package name which can be found inside of the manifest tag within the `/android/app/src/main/AndroidManifest.xml` file within your project.

3. Place `google-services.json` (Firebase) under `android/app` folder

### ios

1. Create a new [firebase](https://console.firebase.google.com/) project

2. In he Firebase console, add a new iOS application and enter your projects details. The "iOS bundle id " must match your local projects package name which can be found inside of the manifest tag within the `info.plist` file within your project.

3. Place `GoogleService-Info.plist` (Firebase) under `ios/` folder

3) Download the `google-services.json` file and place it inside of your project at the following location: `/android/app`

## Deep linking

### Android

Open `AndroidManifest.xml` file under `android/app/src/main/` folder.

`<data android:scheme="https" android:host="app.chatwoot.com" />`

Replace `android:host` with your installation url

In order to test deep linking in local machine run following command in terminal.

```
adb shell am start -W -a android.intent.action.VIEW -d "https://{INSTALLATION_URL}/app/accounts/{ACCOUNT_ID}/conversations/{CONVERSATION_URL} {APP_PACKAGE_NAME}
```

For ex:

```
adb shell am start -W -a android.intent.action.VIEW -d "https://app.chatwoot.com/app/accounts/47/conversations/11” com.chatwoot.app

```

## Sentry

Create a new project in [Sentry](https://sentry.io/for/react-native/)

Create file sentry under `sentry.js` in root of the project

Add the following contents

```
export const SENTRY_TOKEN_URL =<SENTRY_TOKEN_URL>;
```

If you want to supports native crashes, link the sentry SDK to your native projects.
Run the command

```
yarn sentry-wizard -i reactNative -p ios android

```

It will connect the native project with sentry project

- cd ios
- pod install

### Deployment

### Android

Update `gradle.properties` file under `android/app` folder with following contents

```
RELEASE_STORE_FILE=<RELEASE_STORE_FILE>
RELEASE_KEY_ALIAS=<RELEASE_KEY_ALIAS>
RELEASE_STORE_PASSWORD=<RELEASE_STORE_PASSWORD>
RELEASE_KEY_PASSWORD=<RELEASE_KEY_PASSWORD>
```

For releasing the android follow the [guide](https://reactnative.dev/docs/signed-apk-android)
