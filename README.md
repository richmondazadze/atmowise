# AtmoWise - Next.js Version

A modern air quality tracking application built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Multi-Source Air Quality**: Real-time data from OpenWeather, AirNow, and fallback sources
- **AI-Powered Health Insights**: Personalized recommendations using OpenRouter (DeepSeek model)
- **Symptom Tracking**: Log symptoms and get AI-generated health tips
- **Location Management**: Save favorite places and get location-specific air quality
- **Dark Mode Support**: Complete dark theme implementation
- **Mobile-First Design**: Optimized for mobile with desktop support
- **Real-time Chat**: AI assistant for air quality questions
- **Export & Share**: Download air quality data as images
- **Exercise Coach**: AI-powered outdoor activity recommendations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: TanStack Query
- **AI**: OpenRouter (DeepSeek model)
- **APIs**: OpenWeather, AirNow, OpenRouter, Geocoding services

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── air/           # Air quality endpoints
│   │   ├── health/        # Health check
│   │   ├── profile/       # User profiles
│   │   ├── resources/     # Emergency resources
│   │   ├── symptoms/      # Symptom tracking
│   │   ├── user/          # User management
│   │   └── llm/           # AI reflection
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom hooks
├── lib/                   # Utilities (database, etc.)
├── pages/                 # Page components
├── shared/                # Shared types and schemas
├── next.config.js         # Next.js configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
# Database - Supabase
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# API Keys
OPENROUTER_API_KEY=sk-or-v1-[YOUR_KEY]
OPENWEATHER_API_KEY=[YOUR_OPENWEATHER_KEY]
OPENAQ_API_KEY=[YOUR_OPENAQ_KEY]

# Optional: Geocoding API
GEOCODE_API_KEY=[YOUR_GEOCODE_KEY]
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:
   ```bash
   npx vercel
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`
   - `OPENWEATHER_API_KEY`
   - `OPENAQ_API_KEY`
   - `GEOCODE_API_KEY` (optional)

3. **Deploy**:
   ```bash
   npx vercel --prod
   ```

### Manual Deployment

```bash
npm run build
npm start
```

## 🔧 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/air?lat=37.7749&lon=-122.4194` - Air quality data
- `GET /api/resources` - Emergency resources
- `GET /api/profile/[userId]` - User profile
- `POST /api/profile` - Create profile
- `PUT /api/profile/[userId]` - Update profile
- `POST /api/user/anonymous` - Create anonymous user
- `POST /api/llm/reflection` - AI health insights

## 🎨 UI Components

- **Responsive Design**: Mobile-first with desktop optimization
- **Light Theme**: Clean, professional appearance
- **Authentication**: Sign in/up with email or Google
- **Real-time Data**: Live air quality updates
- **AI Insights**: Health recommendations based on symptoms

## 🔒 Security

- **Environment Variables**: All secrets stored securely
- **Database**: Row Level Security (RLS) enabled
- **Authentication**: Supabase Auth with JWT tokens
- **API Protection**: Server-side validation

## 📱 Mobile Support

- **PWA Ready**: Can be installed as mobile app
- **Responsive**: Works on all screen sizes
- **Touch Optimized**: Mobile-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README
- **Issues**: GitHub Issues
- **Discord**: [Your Discord Server]

---

**AtmoWise** - Track air quality, protect your health 🌬️
