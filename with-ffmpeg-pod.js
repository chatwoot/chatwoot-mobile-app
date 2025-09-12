const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function addPodDependency(podfilePath) {
  const podInstallLine = `pod 'chatwoot-ffmpeg-kit-ios-https', :podspec => 'https://raw.githubusercontent.com/chatwoot/ffmpeg/master/chatwoot-ffmpeg-kit-ios-https.podspec'`;
  const podInstallLine2 = `pod 'ffmpeg-kit-react-native', :path => '../node_modules/ffmpeg-kit-react-native'`;

  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (!contents.includes(podInstallLine)) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `${podInstallLine}\n\n  post_install do |installer|`,
    );
  }
  if (!contents.includes(podInstallLine2)) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `${podInstallLine2}\n\n  post_install do |installer|`,
    );
  }
  fs.writeFileSync(podfilePath, contents, 'utf8');
}

function withMyFFmpegPod(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      addPodDependency(podfilePath);
      return cfg;
    },
  ]);
}

const withFFmpegPod = config => {
  return withPlugins(config, [withMyFFmpegPod]);
};

module.exports = createRunOncePlugin(withFFmpegPod, 'with-ffmpeg-pod', '1.0.0');
