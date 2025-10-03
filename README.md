# 🎶 Harmonize – Concert Buddy Finder 🎶

Harmonize is a social music app designed to help university students and young adults meet concert buddies.  
Think of it as a mix between **Hinge** and **Spotify** – we connect you with people who share your music taste and want to attend the same concerts.  

Built with **Expo (React Native)**, **Supabase**, **Spotify API**, and **Songkick API**.  


## Prerequisites
Make sure you have Node.js (v18 or later) installed.  
If you don’t already have Expo, install it globally:

```bash
npm install -g expo-cli
```

## 🚀 Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/<username>/harmonize-app.git
   cd harmonize-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo app:

   ```bash
   npx expo start
   ```

   You can now open the app and run it locally in the Expo Go App (scan the QR code)


## 📱 App Structure (Barebones, Sprint 3)

- **Match Tab** – concert buddy discovery  
- **Concerts Tab** – explore upcoming concerts  
- **Chat Tab** – placeholder messaging screen  
- **Profile Tab** – configure your profile (music stats, bio, university, etc.)  


## 🔧 Tech Stack

- **Frontend**: React Native (Expo Go)  
- **Backend/Auth/DB**: [Supabase](https://supabase.com)  
- **APIs**:  
  - [Spotify Web API](https://developer.spotify.com/documentation/web-api/) – top artists, songs, genres  
  - [Songkick API](https://www.songkick.com/developer) – concert + event data  


## 👥 Team 3DS

- Daniel Ayoung-Chee
- Daniel Martin Lee
- Sonia Lin
- Danny Jiang


## 🔗 Supabase Setup (Prototype Mode)

This app uses [Supabase](https://supabase.com) as the backend for storing user profiles.

### Steps to Set Up

1. Create a project on Supabase.
   - Get the `Project URL` and `anon key` from **Project Settings → API**.

2. Create a `profiles` table with this SQL:

   ```sql
      drop table if exists profiles;

      create table profiles (
      id uuid primary key,
      username text,
      bio text,
      pronouns text,
      city text,
      top_genres text[],
      top_artists text[],
      created_at timestamp default now()
      );

      -- Open everything for prototyping
      alter table profiles enable row level security;

      create policy "Enable all for prototyping" on profiles
      for all
      using (true)
      with check (true);

   ```

3. Add environment variables in `.env`:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://rdmttxhlfbbcpbwejvfy.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbXR0eGhsZmJiY3Bid2VqdmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDI1MDAsImV4cCI6MjA3NTA3ODUwMH0.vABv8fkw60Gq1hnLQVxybmX-aOQcgI09Vj2xb6-WQl8

   ```

4. Install dependencies:

   ```bash
   npm install @supabase/supabase-js
   npx expo install @react-native-async-storage/async-storage
   npm install react-native-get-random-values uuid
   ```

5. On first run, the app auto-generates a user UUID and stores it in AsyncStorage.  
   - That UUID is also inserted into Supabase as a `profiles` row.  
   - This allows multiple users across devices **without login**.

If you need a supabase password ask dayoungchee3@gatech.edu