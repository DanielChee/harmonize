import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import type { User } from "@types";

export async function getOrCreateUser() {
  let userId = await AsyncStorage.getItem("userId");

  if (!userId) {
    userId = uuidv4();
    await AsyncStorage.setItem("userId", userId);

    // Insert placeholder profile in Supabase
    await supabase.from("profiles").insert({
      id: userId,
      username: "Demo User",
      bio: "Concert lover 🎶",
    });
  }

  return userId;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error(error.message);
    }

    return data as User;
  } catch (err) {
    console.error("Failed to update profile:", err);
    throw err;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
}
