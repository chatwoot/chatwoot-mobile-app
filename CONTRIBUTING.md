# Contributing to Chatwoot mobile app

## Branching model

We use [git-flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model. The base branch is `develop`.

- [Running](#running)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running](#running-1)
    - [iOS](#ios) - **Mac is required if you wish to develop for iOS.**
    - [Android](#android)

## Installation and setup

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html)
- [Install Yarn](https://yarnpkg.com/en/docs/install)
- `$ yarn global add react-native-cli`

More information on getting started can be found here: https://facebook.github.io/react-native/docs/getting-started.html under the `React Native CLI Quickstart` tab.

#### General

Clone the repository

`$ git clone git@github.com:chatwoot/chatwoot-mobile-app.git`

And install dependencies

`$ yarn`

#### Setup firebase for push notification

- Create a new project in [firebase console](https://console.firebase.google.com/).
- Generate [android credentials](https://rnfirebase.io/#generating-android-credentials) from firebase console. Then download the `google-services.json` file and place it inside of your project at the following location: `android/app/`.
- Generating [iOS credentials](https://rnfirebase.io/#generating-ios-credentials) from firebase console. Then download the `GoogleService-Info.plist` file . Then add this file to project using `Xcode`. More details can be found [here](https://rnfirebase.io/#3-ios-setup).

#### Setup Sentry for error reporting

Create a new project in [Sentry](https://sentry.io/for/react-native/)

Create file sentry under `sentry.js` in root of the project.

Add the following contents.

```
export const SENTRY_TOKEN_URL =<SENTRY_TOKEN_URL>;
```

If you want to supports native crashes, link the sentry SDK to your native projects.
Run the command

```
yarn sentry-wizard -i reactNative -p ios android

```

It will connect the native project with sentry project.

- cd ios
- pod install

## Running

### iOS

- `cd ios && pod install`

- `yarn ios`

OR

Open `Chatwoot.xcworkspace` file under `ios` folder. Choose your target device and click on playbutton.

### Android

- Create `gradle.properties` file with following contents under `android/app` folder

```
android.useAndroidX=true
android.enableJetifier=true
FLIPPER_VERSION=0.33.1
org.gradle.jvmargs=-Xmx4608m
```

- `yarn android`

## Configure and run tests

Add a new brew formula

```
brew tap wix/brew
```

Install simulators

```
brew install wix/applesimutils
```

Build application:

```
detox build --configuration ios
```

Run tests:

```
detox test --configuration ios --loglevel trace
```

Manage simulators:

```
/usr/bin/xcrun simctl list
```
