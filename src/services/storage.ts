import { MMKV } from "react-native-mmkv";

const storage = new MMKV({
  id: "medication-reminder-storage",
});

export const Storage = {
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // Object operations (with JSON)
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  getBoolean: (key: string): boolean => {
    return storage.getBoolean(key) ?? false;
  },

  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  // Utility methods
  remove: (key: string): void => {
    storage.delete(key);
  },

  removeMultiple: (keys: string[]): void => {
    keys.forEach((key) => storage.delete(key));
  },

  clearAll: (): void => {
    storage.clearAll();
  },

  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
};
