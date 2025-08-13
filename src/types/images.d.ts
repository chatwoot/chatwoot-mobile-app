declare module '*.png' {
  const src: any;
  export default src;
}

declare module '*.jpg' {
  const src: any;
  export default src;
}

declare module '*.jpeg' {
  const src: any;
  export default src;
}

declare module '*.gif' {
  const src: any;
  export default src;
}

declare module '*.webp' {
  const src: any;
  export default src;
}

declare module '*.svg' {
  import React from 'react';
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}


