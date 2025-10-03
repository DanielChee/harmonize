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

- **Home Tab** – concert buddy discovery  
- **Profile Tab** – configure your profile (music stats, bio, university, etc.)  
- **DMs Tab** – placeholder messaging screen


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

## 📚 Learn More

- [Expo Docs](https://docs.expo.dev/)  
- [Supabase Docs](https://supabase.com/docs)  
- [Spotify API Reference](https://developer.spotify.com/documentation/web-api/)  
- [Songkick API Docs](https://www.songkick.com/developer)  


## ✨ Next Steps
- Build profile configuration screen  
- Connect Spotify API to fetch top artists/songs  
- Integrate Songkick API for event listings  
- Implement Supabase auth + storage  
- Basic chat/DM functionality
