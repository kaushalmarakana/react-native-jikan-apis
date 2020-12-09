import { Dimensions, Platform } from "react-native";

export const StyleVars = {
  PRIMARY_SPACING: 10,
  SCREEN_BOUNDERY: 20,
  BORDER_RADIUS_SM: 5,
  WINDOW_WIDTH: Dimensions.get("window").width,
  IS_ANDROID: Platform.OS === "android",
};
