# EquityInsight

**Portfolio Climate Risk Analytics for Canadian Equities**

A comprehensive analytics workflow that transforms company and asset-level data
into portfolio-level climate risk insights and scenario narratives. Built with
React, TypeScript, and powered by AI to provide intelligent climate risk
analysis for investment portfolios.

## 🚀 Features

### Portfolio Management

- **Company Search & Selection**: Search and add companies to your portfolio
  using fuzzy search by name, ticker, ISIN, or sector
- **Weight Management**: Set custom portfolio weights or use equal-weight
  distribution
- **Portfolio Persistence**: Automatic saving to localStorage with import/export
  capabilities (JSON & CSV)
- **Real-time Validation**: Weight normalization and validation to ensure 100%
  allocation

### Climate Risk Analytics

- **Multi-dimensional Analysis**:
  - **Sector Analysis**: Risk distribution across GICS sectors
  - **Geographic Analysis**: Risk exposure by country and region
  - **Hazard Analysis**: Physical climate risk assessment
  - **Horizon Analysis**: Risk evolution over time (2025-2100)
  - **Top-N Drivers**: Key risk drivers and concentration metrics

- **Advanced Risk Metrics**:
  - DCR Scores (Damage Cost Ratio)
  - Expected Impact
  - Value at Risk (VaR) at 50%, 95%, 99% confidence levels
  - Conditional VaR (CVaR) at multiple confidence levels

- **Climate Scenarios**: Support for multiple climate pathways including SSP
  scenarios and temperature targets

### AI-Powered Assistant

- **Intelligent Chat Interface**: AI assistant powered by Google Gemini 2.5
  Flash
- **Portfolio Context Awareness**: Access to current portfolio and analytics
  settings
- **Comprehensive Data Access**: Query companies, assets, market indexes, and
  climate data
- **Natural Language Queries**: Ask questions about climate risk, portfolio
  analysis, and data insights

### Data Integration

- **RiskThinking.ai API**: Real-time climate risk data for Canadian equities
- **Comprehensive Coverage**: Companies, physical assets, market indexes, and
  climate metrics
- **Geographic Clustering**: Advanced mapping and location-based analysis
- **Asset-Level Detail**: Granular analysis down to individual physical assets

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: TanStack Router with SSR support
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI primitives with Tailwind CSS
- **AI Integration**: AI SDK with Google Gemini 2.5 Flash
- **Data Fetching**: OpenAPI-generated TypeScript client
- **Build Tools**: Vite, Biome (linting/formatting)

## 📋 Prerequisites

- Node.js 22+
- pnpm (recommended) or npm
- Modern web browser with ES2022 support

## 🔧 Installation

### Install Node.js

1. **Download Node.js**:
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS version (22.x or higher)
   - Follow the installation instructions for your operating system

2. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

### Install pnpm (Recommended)

1. **Using npm** (if you have Node.js installed):
   ```bash
   npm install -g pnpm
   ```

2. **Using Corepack** (Node.js 16.13+):
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```

3. **Using Homebrew** (macOS):
   ```bash
   brew install pnpm
   ```

4. **Using curl** (Linux/macOS):
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

5. **Using PowerShell** (Windows):
   ```powershell
   iwr https://get.pnpm.io/install.ps1 -useb | iex
   ```

6. **Verify pnpm Installation**:
   ```bash
   pnpm --version
   ```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Configure Environment Variables

Copy the environment template and add your API keys:

```bash
cp .env.example .env
```

You'll need to obtain API keys from:

- **RiskThinking.ai**: For climate risk data (contact RiskThinking.ai for
  access)
- **Google AI Studio**: For the AI assistant (get your free API key at
  [Google AI Studio](https://aistudio.google.com/app/apikey))

Edit `.env` and add your actual API keys.

### 3. Start Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

The application will be available at `http://localhost:12306`

### 4. Build for Production

```bash
# Using pnpm
pnpm build

# Or using npm
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Radix UI + Tailwind)
│   ├── portfolio-views/ # Analytics visualization components
│   ├── PortfolioManager.tsx    # Portfolio management interface
│   ├── CompanySearch.tsx       # Company search and selection
│   ├── ChatBot.tsx            # AI assistant interface
│   └── HTMLReportGenerator.tsx # Report generation
├── client/              # Auto-generated API client
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and tools
│   ├── chatbot-tools.ts # AI assistant tool definitions
│   └── portfolio-utils.ts # Portfolio management utilities
├── routes/              # TanStack Router routes
│   ├── index.tsx        # Main portfolio page
│   └── server.chat.ts   # AI chat API endpoint
└── main.tsx            # Application entry point
```

## 🔧 Configuration

### Environment Variables

The application requires environment variables for API configuration. Copy
`.env.example` to `.env` and configure your API key:

```bash
cp .env.example .env
```

Required environment variables:

- `VITE_RISKTHINKING_API_KEY`: Your RiskThinking.ai API key
- `VITE_RISKTHINKING_API_BASE_URL`: API base URL (defaults to
  https://api.riskthinking.ai)
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Generative AI API key for the AI
  assistant

### API Configuration

The application connects to the RiskThinking.ai API through a Vite proxy
configuration:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.riskthinking.ai',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## 🎯 Usage Guide

### Building a Portfolio

1. **Search Companies**: Use the search interface to find companies by name,
   ticker, ISIN, or sector
2. **Add to Portfolio**: Click "Add to Portfolio" to include companies
3. **Set Weights**: Adjust portfolio weights manually or enable equal-weight
   distribution
4. **Validate Allocation**: Ensure total weights sum to 100%

### Climate Risk Analysis

1. **Access Analytics**: Switch to the "Climate Analytics" tab (requires
   portfolio with non-zero weights)
2. **Configure Filters**: Set time horizon, climate pathway, risk type, and
   metric
3. **Explore Views**: Navigate through different analysis dimensions:
   - **Sector**: Risk distribution by industry
   - **Geography**: Geographic risk exposure
   - **Hazard**: Physical climate hazards
   - **Horizon**: Risk evolution over time
   - **Top-N Drivers**: Key risk factors

### AI Assistant

1. **Open Chat**: Switch to the "AI Assistant" tab
2. **Ask Questions**: Query about your portfolio, climate risk, or specific
   companies
3. **Get Insights**: The AI can access your current portfolio and provide
   data-driven analysis

### Export/Import

- **Export Portfolio**: Download portfolio as JSON or CSV
- **Import Portfolio**: Upload previously saved portfolio files
- **Generate Reports**: Create HTML reports with comprehensive analytics

## 🔍 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm serve            # Preview production build

# Code Quality
pnpm format           # Format code with Biome
pnpm lint             # Lint code with Biome
pnpm check            # Run all Biome checks

# API Generation
pnpm openapi-ts       # Generate TypeScript client from OpenAPI spec
```

## 🌐 API Integration

The application integrates with the RiskThinking.ai API providing:

- **Company Data**: Search, details, and metadata
- **Asset Information**: Physical asset locations and details
- **Climate Metrics**: Risk scores, impacts, and scenarios
- **Market Data**: Index and market group information
- **Geographic Data**: Location-based clustering and mapping

## 🎨 UI Components

Built with a comprehensive design system using:

- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Consistent iconography
- **Custom Components**: Specialized portfolio and analytics components

## 🔒 Security Considerations

- API keys are stored in environment variables (`.env` file)
- The `.env` file is gitignored to prevent accidental commits
- All data is processed client-side with localStorage persistence
- No sensitive data is stored on external servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm check`
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For technical support or questions about the application, please refer to the
codebase documentation or contact the development team.

---

**Built with ❤️ for climate-conscious investing**
