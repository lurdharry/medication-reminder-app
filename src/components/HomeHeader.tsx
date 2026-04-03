import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { FC } from "react";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>
        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="person-circle" size={44} color={COLORS.white} />
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: FONTS.size.medium,
    color: COLORS.white + "CC",
  },
  userName: {
    fontSize: FONTS.size.huge,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
});
