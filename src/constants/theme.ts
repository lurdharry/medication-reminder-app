import { Dimensions } from "react-native";

export const FONTS = {
  family: {
    regular: "System",
    medium: "System",
    bold: "System",
    light: "System",
  },

  size: {
    tiny: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    extraLarge: 20,
    huge: 24,
    massive: 32,
    giant: 40,
  },

  weight: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

const { width, height } = Dimensions.get("window");

export const DIMENSIONS = {
  SCREEN_WIDTH: width,
  SCREEN_HEIGHT: height,

  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  PADDING: 16,
  PADDING_SMALL: 8,
  PADDING_LARGE: 24,

  BORDER_RADIUS: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
    circle: 9999,
  },
};
