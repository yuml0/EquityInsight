import { createFileRoute } from '@tanstack/react-router'
import { UIMessage, streamText, convertToModelMessages } from 'ai'
import { google } from '@ai-sdk/google'

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json()

        const result = streamText({
          model: google("gemini-2.5-flash"),
          messages: convertToModelMessages(messages),
        })

        return result.toTextStreamResponse()
      },
    },
  },
})