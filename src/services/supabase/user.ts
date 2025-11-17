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

    // Note: Profile will be created when user completes Spotify OAuth or profile setup
    // No automatic placeholder profile created
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
  // Check for test admin user
  if (userId === "00000000-0000-0000-0000-000000000001") {
    console.log("[User] Returning test admin profile");
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: "test@admin.com",
      username: "test_admin",
      display_name: "Test Admin",
      bio: "This is a test admin account for development purposes.",
      pronouns: "they/them",
      age: 25,
      city: "Atlanta",
      university: "Georgia Tech",
      academic_year: "Graduate Student",
      profile_picture_url: "https://via.placeholder.com/200",
      looking_for: "both",
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
    } as User;
  }

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
