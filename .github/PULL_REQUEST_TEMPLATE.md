# Pull Request Template

## Description 

This Pull Request introduces a robust audio playback system using `expo-av` and a centralized `PlayerHub` for managing audio instances, along with several enhancements and fixes for stability and compatibility.

- **feat(audio): implement robust audio playback with expo-av**
  Refactors audio playback logic to use expo-av, introducing a PlayerHub for
  centralized control and improved stability.
  - Implemented `PlayerHub` for managing multiple audio instances and
    handling playback, pause, resume, and seeking.
  - Converted OGG audio files to WAV for iOS compatibility.
  - Updated `AudioBubble.tsx` to integrate with the new `PlayerHub` and display
    current playback status and duration.
  - Modified `ComposedBubble.tsx` to pass unique IDs to `AudioBubble` for
    better management.
  - Adjusted `AudioCell.tsx` to reflect new audio playback status handling.
  - Updated `jest.config.js`, `package.json`, and `pnpm-lock.yaml` to
    accommodate new dependencies and configurations for `expo-av` and `babel-jest`.

- **fix(audio): enhance PlayerHub stability and HMR compatibility**
  Further refines the audio playback system, improving PlayerHub robustness,
  iOS/Android audio interruption handling, and ensuring better compatibility
  with Fast Refresh/HMR.
  - Updated `interruptionModeIOS` and `interruptionModeAndroid` constants.
  - Introduced `forceStopAll` to `PlayerHub` for comprehensive audio stop control.
  - Implemented Fast Refresh/HMR cleanup logic for `PlayerHub` instances.
  - Optimized `playById` to efficiently handle already playing audio.
  - Refactored `manualSeekTo` and `pauseAudio` with `runOnJS` for Reanimated worklets.
  - Streamlined `PlayerHub.unregister` cleanup.
  - Ensured `setCurrentPlayingAudioSrc` is correctly dispatched on initial load.
  - Cast `attachment.id` to `String` when passed to `AudioBubble` in `ComposedBubble.tsx`
    for explicit type handling.

Fixes # (issue)

## Type of change

- [x] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?

The audio playback functionality, including play, pause, seek, and resume operations, was manually tested on both Android and iOS platforms (simulators/devices). Verification included testing with multiple audio bubbles in a conversation, ensuring correct state management and handling of OGG files on iOS. Hot Module Replacement (HMR) compatibility was also verified during development.

## Checklist:

- [x] I have performed a self-review of my own code
- [x] I have commented on my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] I have tested in both Android and iOS platform
- [x] My changes generate no new warnings
- [x] Any dependent changes have been merged and published in downstream modules
