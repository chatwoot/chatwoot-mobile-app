Pod::Spec.new do |s|
  s.name           = 'ChatwootCalls'
  s.version        = '1.0.0'
  s.summary        = 'Native call layer for the Chatwoot mobile app'
  s.description    = 'Twilio Voice media and audio routing for calls handled in the Chatwoot mobile app'
  s.author         = 'Chatwoot'
  s.homepage       = 'https://github.com/chatwoot/chatwoot-mobile-app'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'TwilioVoice', '~> 6.13'
  # The same WebRTC build react-native-webrtc links, so the module can drive its audio session
  s.dependency 'JitsiWebRTC', '~> 124.0.0'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.resource_bundles = { 'ChatwootCallsResources' => ['*.png'] }
end
