const { createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ImageViewer.swift declares `unowned var initialSourceView: UIImageView?` and reads
// it from deinit. `unowned` is not zeroed when the referent is deallocated, so the
// read traps with SIGABRT once the source view is gone. Present in every published
// version through 3.3.9 and on master; @nandorojo/galeria pins `~> 3.0`, so there is
// no release to upgrade to.
//
// The property is already Optional, so `weak` is a drop-in: the alpha reset becomes a
// no-op instead of a crash. Applied from the Podfile's post_install hook because the
// pod source is only on disk after CocoaPods resolves it.
const PATCH_HOOK = `
    # Patch ImageViewer.swift: unowned -> weak on initialSourceView.
    # Reading an unowned reference from deinit traps once the source view is gone.
    image_carousel = File.join(
      installer.sandbox.root,
      'ImageViewer.swift', 'Sources', 'ImageViewer_swift', 'ImageCarouselViewController.swift'
    )
    if File.exist?(image_carousel)
      carousel_source = File.read(image_carousel)
      patched_source = carousel_source.sub(
        'unowned var initialSourceView: UIImageView?',
        'weak var initialSourceView: UIImageView?'
      )
      if patched_source != carousel_source
        # CocoaPods installs pod sources read-only.
        original_mode = File.stat(image_carousel).mode
        File.chmod(0644, image_carousel)
        File.write(image_carousel, patched_source)
        File.chmod(original_mode, image_carousel)
        Pod::UI.puts 'ImageViewer.swift: initialSourceView patched to weak'
      end
    end
`;

function addPatchHook(podfilePath) {
  const contents = fs.readFileSync(podfilePath, 'utf8');
  if (contents.includes('ImageViewer.swift: initialSourceView patched to weak')) {
    return;
  }
  const patched = contents.replace(
    /post_install do \|installer\|\n/,
    `post_install do |installer|\n${PATCH_HOOK}`,
  );
  fs.writeFileSync(podfilePath, patched, 'utf8');
}

const withImageViewerPatch = config =>
  withDangerousMod(config, [
    'ios',
    cfg => {
      addPatchHook(path.join(cfg.modRequest.platformProjectRoot, 'Podfile'));
      return cfg;
    },
  ]);

module.exports = createRunOncePlugin(withImageViewerPatch, 'with-image-viewer-patch', '1.0.0');
