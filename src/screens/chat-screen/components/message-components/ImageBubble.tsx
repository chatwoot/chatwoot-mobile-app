import React, { useState, useEffect } from 'react';
import { Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';

type ImageBubbleProps = {
  imageSrc: string; // The source URI of the image to display.
  width?: number; // Optional maximum width for the image bubble.
};

export const ImageBubble = (props: ImageBubbleProps) => {
  const { imageSrc, width: imageWidth} = props;
  // State to store the calculated width and height of the image to maintain aspect ratio.
  // Defaults to a placeholder size before the actual dimensions are determined.
  const [imageSize, setImageSize] = useState({ width: 300, height: 215 });

  useEffect(() => {
    // Get the actual dimensions of the remote image.
    RNImage.getSize(
      imageSrc,
      (width, height) => {
        const maxWidth = imageWidth || 300; // Use provided width or default to 300.
        const aspectRatio = width / height;
        const calculatedHeight = maxWidth / aspectRatio; // Calculate height to maintain aspect ratio.

        setImageSize({ width: maxWidth, height: calculatedHeight });
      },
      error => {
        // Log an error if image dimensions cannot be retrieved.
        console.error(`Couldn't get image size: ${error.message}`);
      },
    );
  }, [imageSrc, imageWidth]); // Re-run effect if image source or desired width changes.

  return (
    // Galeria component provides image viewing capabilities, including fullscreen and pinch-to-zoom.
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }} // Set the image source.
          contentFit="contain" // Ensure the image fits within its bounds without cropping.
          style={[
            tailwind.style('h-full w-full bg-gray-100 overflow-hidden rounded-lg'),
            // Apply dynamically calculated width and height to maintain aspect ratio.
            { width: imageSize.width, height: imageSize.height },
          ]}
        />
      </Galeria.Image>
    </Galeria>
  );
};
