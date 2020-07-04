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

## Deployment

Detailed guide for [Publishing a React Native App to the App Store](https://www.reactnativeschool.com/publishing-react-native-app/)

### Android

In order to distribute your Android application via Google Play store it needs to be signed with a release key that then needs to be used for all future updates. More details can be found [here](https://reactnative.dev/docs/signed-apk-android)

Update `gradle.properties` file under `android/app` folder with following contents

```
RELEASE_STORE_FILE=<RELEASE_STORE_FILE>
RELEASE_KEY_ALIAS=<RELEASE_KEY_ALIAS>
RELEASE_STORE_PASSWORD=<RELEASE_STORE_PASSWORD>
RELEASE_KEY_PASSWORD=<RELEASE_KEY_PASSWORD>
```

For releasing the android follow the [guide](https://reactnative.dev/docs/signed-apk-android)

- Important - We are using [Fastlane](https://docs.fastlane.tools/getting-started/cross-platform/react-native/) for deploying Chatwoot official application.
