import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "../src/services/supabase/supabase";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";


// EXAMPLE OF ADDING NEW ITEM TO harmonize TABLE

export default function TestSupabase() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // generate a random user id
        const userId = uuidv4();

        // insert a test row
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            username: "test_user",
            bio: "Hello from Expo!",
            pronouns: "they/them",
            city: "Atlanta",
            top_genres: ["indie", "pop"],
            top_artists: ["Phoebe Bridgers", "Taylor Swift"],
          });

        if (insertError) {
          setMessage("Insert error: " + insertError.message);
          return;
        }

        // query the row back
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId);

        if (fetchError) {
          setMessage("Fetch error: " + fetchError.message);
        } else {
          setMessage("Success! Inserted user: " + JSON.stringify(data));
        }
      } catch (err) {
        setMessage("Unexpected error: " + err);
      }
    };

    testSupabase();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{message}</Text>
    </View>
  );
}
