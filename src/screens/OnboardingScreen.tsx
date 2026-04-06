import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";
import { Button } from "@/components/Button";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface OnboardingSlide {
  id: string;
  icon: IoniconsName;
  iconBg: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    icon: "medical",
    iconBg: COLORS.tint.pink,
    title: "Track Your Medications",
    description:
      "Never miss a dose again. Add your medications, set schedules, and get timely reminders.",
  },
  {
    id: "2",
    icon: "mic",
    iconBg: COLORS.tint.purple,
    title: "AI Voice Assistant",
    description:
      "Manage your medications hands-free. Just speak and let our AI assistant help you.",
  },
  {
    id: "3",
    icon: "people",
    iconBg: COLORS.tint.blue,
    title: "Keep Loved Ones Informed",
    description:
      "Add emergency contacts who get notified if you miss your medications. Stay safe together.",
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Login");
    }
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <View />
        {!isLastSlide && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: COLORS.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          rightIcon={isLastSlide ? "arrow-forward" : "chevron-forward"}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    fontWeight: "500",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 28,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
