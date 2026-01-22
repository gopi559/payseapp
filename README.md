# Mobile Wallet Web Application

A PhonePe-style wallet web application built with React, Vite, and Tailwind CSS.

## Features

- 🔐 Authentication (Login + Passcode)
- 💰 Wallet Management
- 💸 Send Money
- 💵 Receive Money
- 📷 Scan QR Code
- 💵 Cash In/Out
- 📜 Transaction History
- 💳 Cards Management
- 👤 Profile Management

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State Management

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Login Credentials

- **Password**: `111111` (static, works with any username)
- **Passcode**: Any 6-digit code (for demo purposes)

## Project Structure

```
src/
├── app/              # App configuration and routing
├── auth/             # Authentication pages and components
├── shell/            # App shell (Header, BottomNav)
├── features/         # Feature modules
│   ├── home/
│   ├── send/
│   ├── receive/
│   ├── scan/
│   ├── cash-in/
│   ├── cash-out/
│   ├── history/
│   ├── cards/
│   └── profile/
├── shared/           # Reusable components
├── store/            # Global state management
├── services/         # API services
├── config/           # Configuration files
└── utils/            # Utility functions
```

## Color Palette

The app uses a strict green color palette defined in `tailwind.config.js`:

- `brand-primary` - Main CTA buttons
- `brand-secondary` - Selected states
- `brand-action` - Floating Pay button
- `brand-surface` - Cards and containers
- `brand-surfaceMuted` - Page backgrounds

**Important**: Never use hex colors directly. Always use Tailwind classes.

## Development Guidelines

1. **Component Architecture**: Feature-based structure
2. **State Management**: Zustand stores in `store/` directory
3. **Styling**: Tailwind classes only, no inline styles
4. **Routing**: All routes defined in `config/routes.js`
5. **Reusability**: Shared components in `shared/components/`

## License

MIT
"# paayseapp" 
