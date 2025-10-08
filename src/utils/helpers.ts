import { differenceInDays } from "date-fns/differenceInDays";
import { format } from "date-fns/format";

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Check if a time is within a range (e.g., quiet hours)
 */
export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Handle ranges that cross midnight (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Convert time string to minutes since midnight
 */
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Get time of day (morning, afternoon, evening, night)
 */
export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = (): string => {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good evening",
  };
  return greetings[timeOfDay as keyof typeof greetings];
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date, type: "short" | "long" = "short"): string => {
  if (type === "short") {
    return format(date, "M/d/yy");
  }

  return format(date, "MMMM d, yyyy");
};

/**
 * Get days difference between two dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  return Math.abs(differenceInDays(date1, date2));
};
