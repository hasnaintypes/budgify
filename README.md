# Budgify - Modern Personal Finance Dashboard

Budgify is a comprehensive personal finance management application built with Next.js, offering real-time financial tracking, analytics, and visualization tools.

## ✨ Key Features

### 📊 Dashboard Overview

- Real-time financial snapshot
- Monthly spending vs income comparison
- Quick access to recent transactions

### 💰 Transaction Management

- **Income & Expense Tracking**
- **Smart Categorization** (Auto-tagging)
- **Multi-account Support**
- **Recurring Transactions**
- **Receipt Capture** (Coming Soon)

### 📈 Advanced Analytics

- Interactive charts with filtering
- Custom report generation
- Export to CSV/PDF
- Budget vs Actual comparison

### 🔒 Security Features

- End-to-end encryption
- Biometric authentication
- Role-based access control

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+ or yarn
- Clerk account (for authentication)
- Convex account (for backend)

### Installation

```bash
git clone https://github.com/nainee99/budgify.git
cd budgify
npm install
```

### Configuration

Create `.env.local` file with these variables (see `.env.example` for reference):

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Backend
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Optional Features
ENABLE_RECURRING_TRANSACTIONS=true
MAX_UPLOAD_SIZE=5MB
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

### Core

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend

- **Convex** - Real-time database
- **Clerk** - Authentication

### Visualization

- **Recharts** - Interactive charts
- **React Table** - Data tables

## 📂 Project Structure

```
budgify/
├── app/               # Next.js app router
├── components/        # Reusable components
├── lib/               # Utility functions
├── convex/            # Convex functions
└── public/            # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Run production build
npm run lint      # Run linter
npm run format    # Format code
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - [@nainee99](https://twitter.com/nainee99) - naine909@gmail.com

Project Link: [https://github.com/yourusername/budgify](https://github.com/nainee99/budgify)
