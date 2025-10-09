import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { FC } from "react";
import { getGreeting } from "@/utils/helpers";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface HomeHeaderProps {
  name?: string;
}

export const HomeHeader: FC<HomeHeaderProps> = ({ name = "Welcome" }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>
      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate("Settings" as never)}
      >
        <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
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
    paddingVertical: 20,
  },
  greeting: { fontSize: FONTS.size.medium, color: COLORS.gray.dark },
  userName: { fontSize: FONTS.size.huge, fontWeight: "bold", color: COLORS.black, marginTop: 4 },
  profileButton: { padding: 4 },
});
