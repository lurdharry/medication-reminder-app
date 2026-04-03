import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { FC } from "react";
import { getGreeting } from "@/utils/helpers";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "@/hooks/useAppNavigation";

interface HomeHeaderProps {
  name?: string;
}

export const HomeHeader: FC<HomeHeaderProps> = ({ name = "Welcome" }) => {
  const navigation = useAppNavigation();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>
      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="person-circle" size={42} color={COLORS.primaryDark} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
});
