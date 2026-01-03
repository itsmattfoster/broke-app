# broke

A Copilot-inspired financial management app for iOS built with React Native and Expo.

## Features

- **6 Swipeable Tabs**: School, Coaching, Summary (Dashboard), Spending, Earning, Subscriptions
- **Persistent Header**: Black header with "broke" branding and tab pills
- **Demo Mode**: Uses mock data for testing (can be toggled in Settings)
- **Dashboard Cards**: Copilot-style cards for spending overview, budgets, transactions, and upcoming bills
- **AI Coaching**: Chat interface with mock AI recommendations (ready for OpenAI integration)
- **School Plan**: Track flex dollars, meal swipes, and burn rate
- **Budget Tracking**: Category budgets with visual progress indicators
- **Subscriptions**: Track recurring payments and renewal dates

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Zustand** for state management
- **Expo Router** for file-based navigation
- **react-native-pager-view** for swipeable tabs
- **react-native-svg** for charts
- **AsyncStorage** for local data persistence
- **Supabase** for backend database and authentication

## Quick Start

### Prerequisites

- Node.js 20.11.0 or higher
- iOS device or simulator
- Expo Go app (for testing on device)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI Configuration (optional)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Paste them into your `.env` file

**Note:** The `.env` file is gitignored and won't be committed to version control.

### Running the App

#### iOS Simulator

```bash
npm run ios
```

#### On Your iPhone (Expo Go)

```bash
npm start
```

Then scan the QR code with your iPhone camera or Expo Go app.

#### Build for Production

```bash
npx expo prebuild
npx expo run:ios
```

## Project Structure

```
broke-app/
├── app/                        # Expo Router screens
│   ├── _layout.tsx            # Root layout
│   ├── index.tsx              # Main screen with pager
│   ├── settings.tsx           # Settings modal
│   └── tabs/                  # Tab screens
│       ├── school.tsx
│       ├── coaching.tsx
│       ├── summary.tsx
│       ├── spending.tsx
│       ├── earning.tsx
│       └── subscriptions.tsx
├── components/
│   ├── navigation/            # Header, tab pills
│   ├── cards/                 # Dashboard cards
│   ├── charts/                # Line chart components
│   └── ui/                    # Reusable UI components
├── store/                     # Zustand state management
├── data/                      # Mock data
├── lib/                       # Utilities and helpers
└── types/                     # TypeScript definitions
```

## Key Interactions

1. **Swipe Navigation**: Swipe left/right to navigate between tabs
2. **Settings**: Tap gear icon (top-left) to open settings
3. **Tab Selection**: Tap tab pills in header to jump to specific tab
4. **Mark as Reviewed**: Mark transactions as reviewed from Summary tab
5. **AI Coaching**: Chat with mock AI assistant in Coaching tab
6. **Demo Mode**: Toggle in Settings to switch between mock and real data

## Future Enhancements

- **Plaid Integration**: Connect real bank accounts
- **OpenAI Integration**: Real AI coaching powered by GPT
- **Transaction Categorization**: Auto-categorize transactions
- **Budget Goals**: Set and track financial goals
- **Insights & Reports**: Advanced spending analytics
- **Push Notifications**: Alerts for budget overages and upcoming bills
- **Dark Mode**: Full dark mode support

## Data Model

All data is currently mocked (see `data/mockData.ts`). The structure is designed to easily swap mock data for real data from APIs:

- **Transactions**: Spending and income with categories
- **Budgets**: Monthly budgets per category
- **Subscriptions**: Recurring payments
- **School Plan**: Flex dollars and meal swipes
- **Income Sources**: Regular income streams
- **Coaching Messages**: Chat history with AI

## Settings

- **Currency**: USD (configurable for future multi-currency support)
- **Notifications**: Enable/disable push notifications
- **Demo Mode**: Toggle between mock and real data

## Development Notes

- The app defaults to **Summary tab** on launch (index 2)
- All state is managed with Zustand for simplicity
- AsyncStorage is used for settings persistence
- Styling follows minimalist black/white "broke" branding
- Components are modular and reusable

## License

MIT

## Author

Built by Cursor AI Assistant for Matthew Foster

