# Chatwoot Mobile App

- [Running](#running)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running](#running-1)
    - [iOS](#ios)
    - [Android](#android)
  - [Debugging](#debugging)

## Installation and setup

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html)
- [Install Yarn](https://yarnpkg.com/en/docs/install)
- `$ yarn global add react-native-cli`

More information on getting started can be found here: https://facebook.github.io/react-native/docs/getting-started.html under the `React Native CLI Quickstart` tab.

#### General

Clone the repository

`$ git clone git@github.com:pranavrajs/chatwoot-mobile-app.git`

And install dependencies

`$ yarn`

#### iOS

- Install Xcode from the App Store and accept the license agreement.
- Run Xcode once so that it can install additional components it will need.

Next, open the `ios/Chatwoot.xcworkspace` file. Plug in your device via USB, and select it in the device dropdown in the top left of Xcode. Then hit the build (Play) button.

#### Android

- Install [Android Studio](https://developer.android.com/studio/index.html).
- Install the Android SDK and necessary components.
  - Open Android Studio. If this is the first time you open it, it will prompt you to install the Android SDK. You can proceed with the default settings.
  - Select "Open an existing Android Studio project" and select the `./android` folder in this repository. This will help you to get the necessary dependencies installed.
  - Android Studio will automatically try to build the project. You will see the Gradle process running.
  - When dependencies are missing (e.g. SDK Platform or build tools), it will error and show a link to install them (e.g. "Install Build Tool xx.x.x and sync project"). Click on the link (in the Gradle Sync tab) to resolve. Repeat this until you get a BUILD SUCCESSFUL message.
  - It will also automatically create the file `./android/local.properties` with a entry `sdk.dir=<path to your android sdk>`, which is required for the build to work. You will need this in the next step
- Create and start an emulator (aka AVD (Android Virtual Device)).
  - Open Android Studio and click on the AVD Manager icon (4th from the far right) in the toolbar (this will appear when the project compiled correctly).
  - Choose any device you want.
  - Select a system image. Choose a recommended one (e.g. API 27). Click on the download link next to the image name. It will automatically start downloading.
  - Click next through to finish.
  - Start your AVD by clicking the green play button under actions.
- Add `<path to your android sdk>/platform-tools` (find it in `./android/local.properties`) to your `PATH`. This is required because React Native will run `adb` to install the app on your emulator/device. e.g. add
  ```
  export PATH="<path-to-sdk>/platform-tools:$PATH"
  ```
  to your `.bashrc`/`.zshrc`
- Make sure you have Java 8 installed (Java 9 won't work). If you wany, you can point `JAVA_HOME` to the embedded JDK from Android Studio to make sure you have a JDK version, which works with Android.

### Environment Variables

In order to run the application locally you will need to find and add some environment variables to the project. These can be found in `.env.example`. Copy this file into another file called `.env`:

```bash
cp .env.example .env
```

## Running

### iOS

- `react-native run-ios`

### Android

- `react-native run-android`

### Debugging

The recommended tool for debugging is [React Native Debugger](https://github.com/jhen0409/react-native-debugger) which has built in support for Redux Devtools.

To install React Native Debugger:

```bash
brew update && brew cask install react-native-debugger
```

Then to debug:

1.  Close any other debugger windows you have open
1.  Open the App from your Applications folder
1.  Start debugging in the app using one of the following methods:

| Platform    | Command                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| **iOS**     | Press Cmd+R to reload, Cmd+D or shake for dev.                                    |
| **Android** | Double tap R on your keyboard to reload, shake or press menu button for dev menu. |
