export const avatarTheme = {
  base: 'relative items-center justify-center bg-gray-100',
  size: {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
    xl: 'h-8 w-8',
    '2xl': 'h-10 w-10',
    '3xl': 'h-12 w-12',
    '4xl': 'h-14 w-14',
  },
  image: 'w-full h-full',
  // Having style objects because specific value not present as tailwind classnames
  borderRadius: {
    size: {
      xs: { borderRadius: 4 },
      sm: { borderRadius: 5 },
      md: { borderRadius: 5 },
      lg: { borderRadius: 6 },
      xl: { borderRadius: 6 },
      '2xl': { borderRadius: 8 },
      '3xl': { borderRadius: 10 },
      '4xl': { borderRadius: 12 },
    },
  },
  circular: 'rounded-full',
  // SVG Icon Scaling with respect to Container Width
  defaultUserIcon: {
    xs: 'w-2.5',
    sm: 'w-2.5',
    md: 'w-3',
    lg: 'w-3',
    xl: 'w-4',
    '2xl': 'w-4',
    '3xl': 'w-5',
    '4xl': 'w-6',
  },
  initials: {
    base: 'text-center uppercase text-gray-800',
    size: {
      xs: 'font-inter-medium-24 text-xs',
      sm: 'font-inter-medium-24 text-cxs',
      md: 'font-inter-medium-24 text-sm',
      lg: 'font-inter-medium-24 text-sm',
      xl: 'font-inter-medium-24 text-base',
      '2xl': 'font-inter-medium-24 text-lg',
      '3xl': 'font-inter-medium-24 text-xl',
      '4xl': 'font-inter-medium-24 text-xl',
    },
  },
  status: {
    position: { bottom: -2.5, right: -2.5 },
    active: {
      container: 'absolute border-[1.5px] border-white bg-white rounded-full bottom-0 right-0',
      base: 'bg-green-700 rounded-full',
      size: {
        xs: 'h-1 w-1',
        sm: 'h-[5px] w-[5px]',
        md: 'h-1.5 w-1.5',
        lg: 'h-[7px] w-[7px]',
        xl: 'h-2 w-2',
        '2xl': 'h-2.5 w-2.5',
        '3xl': 'h-[11px] w-[11px]',
        '4xl': 'h-5 w-5',
      },
    },
    away: {
      container: 'absolute border-[1.5px] border-white bg-white rounded-full bottom-0 right-0',
      base: 'bg-white rounded-full',
      size: {
        xs: 'h-1 w-1',
        sm: 'h-[5px] w-[5px]',
        md: 'h-1.5 w-1.5',
        lg: 'h-[7px] w-[7px]',
        xl: 'h-2 w-2',
        '2xl': 'h-2.5 w-2.5',
        '3xl': 'h-[11px] w-[11px]',
        '4xl': 'h-5 w-5',
      },
    },
    sleep: {
      container: 'absolute border-[1.5px] border-white bg-white rounded-full bottom-0 right-0',
      base: 'bg-white rounded-full',
      size: {
        xs: 'h-1 w-1',
        sm: 'h-[5px] w-[5px]',
        md: 'h-1.5 w-1.5',
        lg: 'h-[7px] w-[7px]',
        xl: 'h-2 w-2',
        '2xl': 'h-2.5 w-2.5',
        '3xl': 'h-[11px] w-[11px]',
        '4xl': 'h-5 w-5',
      },
    },
    typing: {
      container: 'absolute border-[1.5px] border-white bg-white rounded-full bottom-0 right-0',
      base: 'rounded-full flex flex-row justify-evenly items-center bg-gray-800',
      size: {
        xs: 'w-2 h-[5px]',
        sm: 'w-[9px] h-1.5',
        md: 'w-[11px] h-[7px]',
        lg: 'w-[13px] h-2',
        xl: 'w-[14px] h-2',
        '2xl': 'w-[15px] h-[9px]',
        '3xl': 'w-[17px] h-[10px]',
        '4xl': 'w-[17px] h-[10px]',
      },
      innerDots: {
        base: 'h-0.5 w-0.5 rounded-full bg-white',
        size: {
          xs: 'h-0.5 w-0.5',
          sm: 'h-[2.25px] w-[2.25px]',
          md: 'h-[2.8px] w-[2.8px]',
          lg: 'h-[3.25px] w-[3.25px]',
          xl: 'h-0.5 w-0.5',
          '2xl': 'h-[2.25px] w-[2.25px]',
          '3xl': 'h-[2.5px] w-[2.5px]',
          '4xl': 'h-[2.5px] w-[2.5px]',
        },
      },
    },
    icon: {
      container: 'absolute border-[1.5px] border-white bg-white rounded-full bottom-0 right-0',
      size: {
        xs: 'w-[9px]',
        sm: 'w-2.5',
        md: 'w-3',
        lg: 'w-3.5',
        xl: 'w-4',
        '2xl': 'w-4.5',
        '3xl': 'w-5',
        '4xl': 'h-5 w-5',
      },
    },
  },
  group: {
    base: 'relative flex-row items-center',
    avatarWrapper: {
      ringStyle: 'border-2',
      circular: 'rounded-full',
      // Adding +4 to the negative margin including the borderWidth(2) value
      spacing: {
        xs: '-ml-[5px]',
        sm: '-ml-1.5',
        md: '-ml-1.5',
        lg: '-ml-1.5',
        xl: '-ml-2',
        '2xl': '-ml-[10px]',
        '3xl': '-ml-[12px]',
      },
    },
  },
};