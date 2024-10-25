import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const LabelTag = ({ stroke = '#0081F1' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
      <G clip-path="url(#clip0_1807_10408)">
        <Path
          d="M5.33334 5.33333H5.34001M1.33334 3.46667V6.45C1.33334 6.776 1.33334 6.93867 1.37001 7.092C1.40334 7.228 1.45668 7.35867 1.53001 7.478C1.61201 7.612 1.72734 7.72733 1.95801 7.958L7.07068 13.0707C7.86268 13.8627 8.25868 14.2587 8.71534 14.4067C9.11701 14.5372 9.54968 14.5372 9.95134 14.4067C10.408 14.2587 10.8047 13.8627 11.596 13.0707L13.0707 11.596C13.8627 10.804 14.2587 10.408 14.4067 9.95133C14.5372 9.54967 14.5372 9.117 14.4067 8.71533C14.2587 8.25867 13.8627 7.862 13.0707 7.07067L7.95801 1.958C7.72734 1.72733 7.61201 1.612 7.47801 1.53C7.35855 1.45672 7.22828 1.40273 7.09201 1.37C6.93934 1.33333 6.77668 1.33333 6.45068 1.33333H3.46668C2.72001 1.33333 2.34668 1.33333 2.06134 1.47867C1.81047 1.6065 1.60651 1.81046 1.47868 2.06133C1.33334 2.34667 1.33334 2.72 1.33334 3.46667ZM5.66668 5.33333C5.66668 5.42174 5.63156 5.50652 5.56905 5.56904C5.50653 5.63155 5.42175 5.66667 5.33334 5.66667C5.24494 5.66667 5.16015 5.63155 5.09764 5.56904C5.03513 5.50652 5.00001 5.42174 5.00001 5.33333C5.00001 5.24493 5.03513 5.16014 5.09764 5.09763C5.16015 5.03512 5.24494 5 5.33334 5C5.42175 5 5.50653 5.03512 5.56905 5.09763C5.63156 5.16014 5.66668 5.24493 5.66668 5.33333Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1807_10408">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
