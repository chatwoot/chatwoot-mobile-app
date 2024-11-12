import React from 'react';
import Svg, { Mask, G, Rect } from 'react-native-svg';

// export const UrgentIcon = () => {
//   return (
//     <Svg width="20" height="16" viewBox="0 0 24 24" fill="none">
//       <Mask
//         id="mask0_2323_83959"
//         maskType="alpha"
//         maskUnits="userSpaceOnUse"
//         x="0"
//         y="0"
//         width="24"
//         height="24">
//         <Rect width="24" height="24" fill="#ED8A5C" />
//       </Mask>
//       <G mask="url(#mask0_2323_83959)">
//         <Rect x="4" y="12" width="4" height="8" rx="2" fill="#E54666" />
//         <Rect x="10" y="8" width="4" height="12" rx="2" fill="#E54666" />
//         <Path
//           d="M18 20C17.45 20 16.9792 19.8042 16.5875 19.4125C16.1958 19.0208 16 18.55 16 18C16 17.45 16.1958 16.9792 16.5875 16.5875C16.9792 16.1958 17.45 16 18 16C18.55 16 19.0208 16.1958 19.4125 16.5875C19.8042 16.9792 20 17.45 20 18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20ZM18 14C17.45 14 16.9792 13.8042 16.5875 13.4125C16.1958 13.0208 16 12.55 16 12V4C16 3.45 16.1958 2.97917 16.5875 2.5875C16.9792 2.19583 17.45 2 18 2C18.55 2 19.0208 2.19583 19.4125 2.5875C19.8042 2.97917 20 3.45 20 4V12C20 12.55 19.8042 13.0208 19.4125 13.4125C19.0208 13.8042 18.55 14 18 14Z"
//           fill="#E54666"
//         />
//       </G>
//     </Svg>
//   );
// };

export const UrgentIcon = () => {
  return (
    <Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <G clipPath="url(#clip0_2407_49096)">
        <Mask
          id="mask0_2407_49096"
          maskType="alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="-2"
          width="20"
          height="20">
          <Rect y="-2" width="20" height="20" fill="#ED8A5C" />
        </Mask>
        <G mask="url(#mask0_2407_49096)">
          <Rect x="3.33203" y="8" width="3.33333" height="6.66667" rx="1.66667" fill="#FFC53D" />
          <Rect x="8.33203" y="4.66602" width="3.33333" height="10" rx="1.66667" fill="#FFC53D" />
          <Rect
            x="13.332"
            y="1.33398"
            width="3.33333"
            height="13.3333"
            rx="1.66667"
            fill="#FFC53D"
          />
        </G>
      </G>
    </Svg>
  );
};
