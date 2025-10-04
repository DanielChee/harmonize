import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

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
