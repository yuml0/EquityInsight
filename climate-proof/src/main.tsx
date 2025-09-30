import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { client } from "./client/client.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

client.setConfig({
  baseUrl: "/api",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer zbLnoZJaplE1jbyXQzF2XZVE2fY7aJYg`,
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
