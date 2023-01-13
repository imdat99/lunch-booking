import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: React.CSSProperties
    subtitle3: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties
    subtitle3?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true
    subtitle3: true
  }
}

// export type CustomThemeType = {
//   [Key in keyof typeof theme]: typeof theme[Key]
// }
const customPalette = {
  background: {
    default: '#F3F5F7',
  },
  primary: {
    main: '#439D0D',
    light: '#95DB76',
    dark: '#1E4725',
  },
  secondary: {
    main: '#B91D37',
    light: '#A7616D',
    dark: '#7B1324',
  },
  error: {
    main: '#E1251B',
    light: '#FFCCCC',
    dark: '#8A171A',
  },
  success: {
    main: '#0EB70E',
    light: '#CDF0D8',
    dark: '#05882C',
  },
  info: {
    main: '#1877F2',
    light: '#E8F0FF',
    dark: '#1155CC',
  },
  warning: {
    main: '#FFC92C',
    light: '#FFF8E1',
    dark: '#FFA10A',
  },
  colors: {
    red: {
      900: '#510D0A',
      800: '#6C120D',
      700: '#881610',
      600: '#B41E16',
      500: '#E1251B',
      400: '#E75149',
      300: '#ED7D77',
      200: '#F4B0AD',
      100: '#FADDDB',
      50: '#FDEEED',
    },
    ink: {
      900: '#263238',
      800: '#37474F',
      700: '#455A64',
      600: '#546E7A',
      500: '#607D8B',
      400: '#607D8B',
      300: '#90A4AE',
      200: '#B0BEC5',
      100: '#CFD8DC',
      50: '#ECEFF1',
    },
    neutral: {
      900: '#212121',
      800: '#424242',
      700: '#616161',
      600: '#757575',
      500: '#9E9E9E',
      400: '#BDBDBD',
      300: '#E0E0E0',
      200: '#EEEEEE',
      100: '#F5F5F5',
      50: '#FAFAFA',
    },
    grey: {
      500: '#333333',
      400: '#c3c3c3',
      300: '#AEAEAE',
      200: `rgba(0, 0, 0, 0.09)`,
      100: `rgba(0, 0, 0, 0.06)`,
    },
    green: {
      300: '#ace3a1',
      200: '#edf9f0',
    },
  },
  commonStatus: {
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  action: {
    disabledBackground: '#BDBDBD',
    disabled: '#616161',
  },
  checkbox: {
    disabled: 'rgba(0, 0, 0, 0.26)',
    hover: 'rgba(0, 0, 0, 0.03)',
  },
  zoneLabel: {
    main: '#151515',
  },
  stroke: {
    light: '#e6e6e6',
  },
}

const theme = createTheme({
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        option: ({ theme }) => ({
          '&[data-focus="true"]': {
            backgroundColor: `${(theme.palette as any).colors.neutral[200]}!important` as any,
            borderColor: 'transparent',
          },
          '&[aria-selected="true"]': {
            backgroundColor: `${(theme.palette as any).colors.neutral[200]}!important` as any,
            borderColor: 'transparent',
            '&:hover': {
              backgroundColor: `${(theme.palette as any).colors.neutral[100]}!important` as any,
            },
          },
        }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.MuiButtonBase-root.MuiPickersDay-root.Mui-selected': {
            backgroundColor: customPalette.secondary.dark,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          'button.PrivatePickersYear-yearButton.Mui-selected': {
            backgroundColor: customPalette.secondary.dark,
            borderRadius: '4px',
          },
          'button.MuiTypography-root.MuiTypography-h5.PrivatePickersMonth-root.Mui-selected': {
            backgroundColor: customPalette.secondary.dark,
            borderRadius: '4px',
          },
          '.MuiCalendarPicker-root': {
            backgroundColor: '#f3f5f7',
            borderRadius: 4,
            overflow: 'hidden',
          },
          '.MuiCalendarPicker-root .MuiCalendarPicker-viewTransitionContainer': {
            backgroundColor: '#fff',
          },
          '.MuiCalendarPicker-root > div:first-of-type': {
            position: 'relative',
            paddingLeft: 12,
            marginTop: 8,
          },
          '.MuiCalendarPicker-root > div:first-of-type > div:first-of-type': {
            position: 'absolute',
            width: 'calc(100% - 92px)',
            left: 46,
            justifyContent: 'center',
            textAlign: 'center',
          },
          '.MuiCalendarPicker-root > div:first-of-type > div:first-of-type .MuiButtonBase-root': {
            marginRight: 0,
          },
          '.MuiCalendarPicker-root .MuiPickersArrowSwitcher-root': {
            width: '100%',
            justifyContent: 'space-between',
          },
          '.MuiCalendarPicker-root .PrivatePickersSlideTransition-root': {
            minHeight: 204,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: customPalette.primary.main,
          '&.Mui-checked': {
            color: customPalette.primary.main,
          },
          '&.MuiCheckbox-indeterminate': {
            color: customPalette.primary.main,
          },
          '&.Mui-disabled': {
            color: customPalette.checkbox.disabled,
          },
          // '& + .MuiFormControlLabel-label.Mui-disabled': {
          //   color: 'red',
          // },
          '&:hover': {
            backgroundColor: customPalette.checkbox.hover,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltipPlacementTop: {
          marginBottom: '0 !important',
        },
      },
    },
  },
  palette: {
    ...customPalette,
  },
  typography: {
    fontFamily: 'Inter',
    h1: {
      fontFamily: 'Inter',
      fontSize: 96,
      fontWeight: 700,
      lineHeight: '144px',
    },
    h2: {
      fontFamily: 'Inter',
      fontSize: 60,
      fontWeight: 700,
      lineHeight: '90px',
    },
    h3: {
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: 700,
      lineHeight: '72px',
    },
    h4: {
      fontFamily: 'Inter',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '51px',
    },
    h5: {
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 700,
      lineHeight: '36px',
    },
    h6: {
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: 700,
      lineHeight: '30px',
      color: '#9C9C9C',
    },
    subtitle1: {
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#9C9C9C',
      lineHeight: '27px',
    },
    subtitle2: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#9C9C9C',
      lineHeight: '24px',
    },
    subtitle3: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#9C9C9C',
      lineHeight: '21px',
    },
    body1: {
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: 400,
      lineHeight: '27px',
    },
    body2: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '24px',
    },
    body3: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '21px',
    },
    button: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 700,
      textTransform: 'unset',
    },
    caption: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px',
    },
    overline: {
      fontFamily: 'Inter',
      fontSize: 10,
      fontWeight: 400,
      lineHeight: '15px',
      textTransform: 'unset',
    },
  },
})

export default theme
