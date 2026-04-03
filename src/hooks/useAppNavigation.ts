import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "@/navigation/types";

export const useAppNavigation = () => {
  return useNavigation<AppNavigationProp>();
};
