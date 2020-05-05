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

#### Environment Variables

In order to run the application locally you will need to find and add some environment variables to the project. These can be found in `url.js` under `src/constants` folder. Replace `INSTALLATION_URL` with your Chatwoot installation url

## Running

### iOS

- `cd ios && pod install`

- `yarn ios`

OR

Open `Chatwoot.xcworkspace` file under `ios` folder. Choose your target device and click on playbutton

### Android

- Create `gradle.properties` file with following contents under `android/app` folder

```
android.useAndroidX=true
android.enableJetifier=true
FLIPPER_VERSION=0.33.1
org.gradle.jvmargs=-Xmx4608m
```

- `yarn android`
