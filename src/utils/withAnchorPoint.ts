import type { TransformsStyle } from 'react-native';

type TransformArray = Array<Record<string, number | string>>;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

const isValidSize = (size: Size): boolean => {
  'worklet';
  return size && size.width > 0 && size.height > 0;
};

const defaultAnchorPoint = { x: 0.5, y: 0.5 };

export const withAnchorPoint = (transform: TransformsStyle, anchorPoint: Point, size: Size) => {
  'worklet';
  if (!isValidSize(size)) {
    return transform;
  }

  const transformValue = transform.transform;
  if (!Array.isArray(transformValue)) {
    return transform;
  }
  let injectedTransform: TransformArray = [...transformValue];

  if (anchorPoint.x !== defaultAnchorPoint.x && size.width) {
    const shiftTranslateX: TransformArray = [];

    // shift before rotation
    shiftTranslateX.push({
      translateX: size.width * (anchorPoint.x - defaultAnchorPoint.x),
    });
    injectedTransform = [...shiftTranslateX, ...injectedTransform];
    // shift after rotation
    injectedTransform.push({
      translateX: size.width * (defaultAnchorPoint.x - anchorPoint.x),
    });
  }

  if (anchorPoint.y !== defaultAnchorPoint.y && size.height) {
    const shiftTranslateY: TransformArray = [];
    // shift before rotation
    shiftTranslateY.push({
      translateY: size.height * (anchorPoint.y - defaultAnchorPoint.y),
    });
    injectedTransform = [...shiftTranslateY, ...injectedTransform];
    // shift after rotation
    injectedTransform.push({
      translateY: size.height * (defaultAnchorPoint.y - anchorPoint.y),
    });
  }

  return { transform: injectedTransform as unknown as NonNullable<TransformsStyle['transform']> };
};
