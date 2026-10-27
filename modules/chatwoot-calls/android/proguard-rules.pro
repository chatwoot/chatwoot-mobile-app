# Twilio's WebRTC namespace avoids dependency collisions.
-keep class com.twilio.** { *; }
-keep class tvo.webrtc.** { *; }
-dontwarn tvo.webrtc.**
