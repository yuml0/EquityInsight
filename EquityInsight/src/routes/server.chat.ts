import { createFileRoute } from '@tanstack/react-router'
import { UIMessage, streamText, convertToModelMessages } from 'ai'
import { google } from '@ai-sdk/google'
import { tools } from '../lib/chatbot-tools'
import {
  stepCountIs
} from "ai"

export const Route = createFileRoute("/server/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json()

        // Convert tools to AI SDK format


        const result = streamText({
          model: google("gemini-2.5-flash"),
          messages: convertToModelMessages(messages),
          stopWhen: stepCountIs(20),
          tools,
          system: `You are a climate risk analytics assistant for Canadian equities. You have access to comprehensive data about companies, assets, market indexes, and climate risk metrics. 

Your capabilities include:
- Accessing current portfolio and analytics views data
- Searching and retrieving company information
- Analyzing company assets and their locations
- Accessing climate risk scores and impacts at company, asset, and market index levels
- Providing aggregated analytics by geography, sector, and other dimensions
- Generating geo-clustered visualizations for mapping

When users ask about their current portfolio, analytics settings, or view configurations, use getCurrentPortfolio or getCurrentViewsData to understand their current state. The getCurrentViewsData tool provides:
- Current portfolio companies and metrics
- Active analytics settings (horizon, pathway, risk type, metric, active tab)
- Available options for each setting
- Portfolio summary statistics

When users ask about climate risk analysis, portfolio insights, or company data, use the available tools to fetch relevant information and provide comprehensive, data-driven responses. Always explain what data you're retrieving and how it relates to their query.

For climate risk analysis, focus on:
- DCR scores (Damage Cost Ratio)
- Expected impact metrics
- Value at Risk (VaR) and Conditional VaR (CVaR) at different confidence levels
- Geographic distribution of risk
- Sector-level risk aggregation
- Time horizon and scenario analysis

Be helpful, accurate, and provide context for the data you retrieve. When discussing analytics views, reference the current settings and available options to provide relevant guidance.`
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})