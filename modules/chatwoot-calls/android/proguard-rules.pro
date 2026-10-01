# Twilio Voice relocates WebRTC under tvo.webrtc so it can coexist with react-native-webrtc
-keep class com.twilio.** { *; }
-keep class tvo.webrtc.** { *; }
-dontwarn tvo.webrtc.**
