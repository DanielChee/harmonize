# 🎶 Harmonize – Concert Buddy Finder

A React Native mobile app connecting university students as concert buddies based on shared music taste. Think **Hinge meets Spotify** for finding people to attend concerts with.

**Built With**: Expo (React Native) • TypeScript • Supabase • Spotify API

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-team/harmonize.git
cd harmonize
npm install

# Set up environment (see .env.example)
cp .env.example .env
# Add your Supabase and Spotify credentials

# Start development server
npx expo start
```

**Scan QR code** with Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) to run on your device.

---

## 📱 Features

| Tab | Feature | Status |
|-----|---------|--------|
| **Match** | Swipe-based concert buddy discovery | ✅ Implemented |
| **Meet** | Chat with matched users | ✅ UI complete |
| **Profile** | Spotify-powered music profiles | ✅ Fully functional |

**Core Functionality**:
- ✅ Spotify OAuth integration (top artists, tracks, genres)
- ✅ 3 profile view modes (High/Mid/Low detail)
- ✅ Profile cycling system with test data
- ✅ Concert discovery interface
- ✅ Chat/conversation list
- 🚧 Peer review system (Sprint 4 - in progress)

---

## 🔧 Tech Stack

**Frontend**: React Native 0.76 • Expo SDK 54 • TypeScript 5.9 • Expo Router 6.0
**Backend**: Supabase (PostgreSQL + Auth)
**APIs**: Spotify Web API (OAuth 2.0 PKCE)
**State**: Zustand (lightweight state management)

**Architecture**: MVVM (Model-View-ViewModel) with feature-based organization

---

## 🛠️ Setup Requirements

### 1. Prerequisites
- Node.js 18+ and npm
- Expo Go app on your phone
- Accounts: [Supabase](https://supabase.com), [Spotify Developer](https://developer.spotify.com/dashboard)

### 2. Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
EXPO_PUBLIC_SPOTIFY_REDIRECT_URI=exp://localhost:8081/--/spotify-callback
```

### 3. Database Setup

Run in Supabase SQL Editor:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  bio TEXT,
  pronouns TEXT,
  age INTEGER,
  university TEXT,
  city TEXT,
  top_genres TEXT[],
  top_artists TEXT[],
  top_songs TEXT[],
  concert_preferences TEXT[],
  spotify_user_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Prototyping mode (replace with proper auth in production)
CREATE POLICY "Enable all for prototyping" ON profiles
FOR ALL USING (true) WITH CHECK (true);
```

### 4. Spotify App Configuration

1. Create app at [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URI: `exp://localhost:8081/--/spotify-callback`
3. Copy Client ID to `.env`

---

## 👥 Team

**Team 3DS** (Georgia Tech)
- Daniel Ayoung-Chee
- Daniel Martin Lee
- Sonia Lin
- Danny Jiang

---

## 🎯 Project Status

**Current Sprint**: Sprint 4 (Peer Review System A/B Testing)
**Completion**: 63% (10/16 phases complete)

**Recent Milestones**:
- ✅ MVVM architecture with path aliases
- ✅ Profile cards (3 view modes: High/Mid/Low)
- ✅ Spotify OAuth + data fetching
- ✅ Concert discovery UI
- ✅ Chat interface

**In Progress**:
- 🚧 A/B testing infrastructure (Amazon reviews vs Badge system)
- 🚧 User testing data collection
- 🚧 Profile edit form

**Known Limitations**:
- Mock data for concerts (Songkick API integration pending)
- No real-time messaging (Supabase realtime planned)
- UUID-based auth (proper Supabase Auth in production)
- No matching algorithm (swipe-based matching placeholder)

---

## 🧪 Testing & Development

```bash
# Run type checking
npx tsc --noEmit

# Run linter
npm run lint

# Clear cache and restart
npx expo start -c

# Test routes
# Navigate to /test-components for UI component testing
# Navigate to /test-supabase for Spotify/database testing
```

---

## 📄 License

This project is part of an academic course at Georgia Tech.

---

**Questions?** Check [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) or open an issue.
