import React from "react";
import { HTMLReportGenerator } from "./HTMLReportGenerator";
import type { PortfolioCompany } from "./PortfolioManager";
import type { PortfolioMetrics } from "./portfolio-views/types";

// Sample data for testing
const sampleCompanies: PortfolioCompany[] = [
  {
    id: "1",
    name: "Apple Inc.",
    sector: "Technology",
    weight: 25.0,
  },
  {
    id: "2",
    name: "Microsoft Corporation",
    sector: "Technology",
    weight: 20.0,
  },
  {
    id: "3",
    name: "Tesla Inc.",
    sector: "Automotive",
    weight: 15.0,
  },
  {
    id: "4",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    weight: 15.0,
  },
  {
    id: "5",
    name: "Procter & Gamble",
    sector: "Consumer Goods",
    weight: 12.5,
  },
  {
    id: "6",
    name: "JPMorgan Chase",
    sector: "Financials",
    weight: 12.5,
  },
];

const samplePortfolioMetrics: PortfolioMetrics = {
  totalCompanies: 6,
  totalWeight: 100.0,
  avgScore: 0.42,
  highRiskCompanies: 2,
};

const sampleSectorData = [
  {
    sector: "Technology",
    totalWeight: 45.0,
    avgScore: 0.38,
    companies: 2,
    riskLevel: "medium" as const,
    weightedContribution: 0.35,
  },
  {
    sector: "Healthcare",
    totalWeight: 15.0,
    avgScore: 0.25,
    companies: 1,
    riskLevel: "low" as const,
    weightedContribution: 0.10,
  },
  {
    sector: "Automotive",
    totalWeight: 15.0,
    avgScore: 0.55,
    companies: 1,
    riskLevel: "high" as const,
    weightedContribution: 0.22,
  },
  {
    sector: "Consumer Goods",
    totalWeight: 12.5,
    avgScore: 0.30,
    companies: 1,
    riskLevel: "medium" as const,
    weightedContribution: 0.10,
  },
  {
    sector: "Financials",
    totalWeight: 12.5,
    avgScore: 0.45,
    companies: 1,
    riskLevel: "medium" as const,
    weightedContribution: 0.15,
  },
];

const sampleGeographyData = [
  {
    country: "United States",
    weight: 70.0,
    avgScore: 0.40,
    riskLevel: "medium" as const,
    weightedContribution: 0.60,
  },
  {
    country: "Canada",
    weight: 20.0,
    avgScore: 0.35,
    riskLevel: "medium" as const,
    weightedContribution: 0.25,
  },
  {
    country: "Other",
    weight: 10.0,
    avgScore: 0.30,
    riskLevel: "low" as const,
    weightedContribution: 0.15,
  },
];

const sampleHazardData = [
  {
    hazard: "Heat Stress",
    portfolioExposure: 0.35,
    avgRiskScore: 0.42,
    color: "#ff6b6b",
    riskLevel: "high" as const,
    companies: 4,
    value: 0.40,
  },
  {
    hazard: "Flood",
    portfolioExposure: 0.28,
    avgRiskScore: 0.38,
    color: "#4ecdc4",
    riskLevel: "medium" as const,
    companies: 3,
    value: 0.30,
  },
  {
    hazard: "Wildfire",
    portfolioExposure: 0.18,
    avgRiskScore: 0.31,
    color: "#ffa726",
    riskLevel: "medium" as const,
    companies: 2,
    value: 0.20,
  },
  {
    hazard: "Wind",
    portfolioExposure: 0.12,
    avgRiskScore: 0.25,
    color: "#42a5f5",
    riskLevel: "low" as const,
    companies: 1,
    value: 0.10,
  },
];

const sampleHorizonData = [
  {
    horizon: "2025",
    score: 0.25,
    impact: 0.15,
    weightedContribution: 0.10,
  },
  {
    horizon: "2030",
    score: 0.30,
    impact: 0.18,
    weightedContribution: 0.12,
  },
  {
    horizon: "2040",
    score: 0.35,
    impact: 0.22,
    weightedContribution: 0.15,
  },
  {
    horizon: "2050",
    score: 0.42,
    impact: 0.28,
    weightedContribution: 0.20,
  },
  {
    horizon: "2060",
    score: 0.48,
    impact: 0.32,
    weightedContribution: 0.18,
  },
  {
    horizon: "2070",
    score: 0.52,
    impact: 0.35,
    weightedContribution: 0.15,
  },
  {
    horizon: "2080",
    score: 0.55,
    impact: 0.38,
    weightedContribution: 0.10,
  },
];

const sampleTopNDriversData = {
  companies: [
    {
      companyId: "1",
      companyName: "Apple Inc.",
      sector: "Technology",
      weight: 25.0,
      cvar: 0.45,
      contribution: 0.1125,
      contributionPercent: 28.5,
      rank: 1,
    },
    {
      companyId: "3",
      companyName: "Tesla Inc.",
      sector: "Automotive",
      weight: 15.0,
      cvar: 0.55,
      contribution: 0.0825,
      contributionPercent: 20.9,
      rank: 2,
    },
    {
      companyId: "6",
      companyName: "JPMorgan Chase",
      sector: "Financials",
      weight: 12.5,
      cvar: 0.45,
      contribution: 0.05625,
      contributionPercent: 14.2,
      rank: 3,
    },
    {
      companyId: "2",
      companyName: "Microsoft Corporation",
      sector: "Technology",
      weight: 20.0,
      cvar: 0.30,
      contribution: 0.06,
      contributionPercent: 15.2,
      rank: 4,
    },
    {
      companyId: "4",
      companyName: "Johnson & Johnson",
      sector: "Healthcare",
      weight: 15.0,
      cvar: 0.25,
      contribution: 0.0375,
      contributionPercent: 9.5,
      rank: 5,
    },
    {
      companyId: "5",
      companyName: "Procter & Gamble",
      sector: "Consumer Goods",
      weight: 12.5,
      cvar: 0.30,
      contribution: 0.0375,
      contributionPercent: 9.5,
      rank: 6,
    },
  ],
  hazards: [
    {
      hazard: "Heat Stress",
      totalContribution: 0.158,
      contributionPercent: 40.0,
      rank: 1,
      color: "#ff6b6b",
    },
    {
      hazard: "Flood",
      totalContribution: 0.118,
      contributionPercent: 30.0,
      rank: 2,
      color: "#4ecdc4",
    },
    {
      hazard: "Wildfire",
      totalContribution: 0.071,
      contributionPercent: 18.0,
      rank: 3,
      color: "#ffa726",
    },
    {
      hazard: "Wind",
      totalContribution: 0.039,
      contributionPercent: 10.0,
      rank: 4,
      color: "#42a5f5",
    },
    {
      hazard: "Drought",
      totalContribution: 0.020,
      contributionPercent: 2.0,
      rank: 5,
      color: "#8d6e63",
    },
  ],
  concentration: {
    hhi: 0.18,
    concentrationLevel: "moderate" as const,
    interpretation: "Portfolio risk shows moderate concentration.",
  },
  totalPortfolioRisk: 0.395,
};

export function TestHTMLReport() {
  const reportData = {
    companies: sampleCompanies,
    portfolioMetrics: samplePortfolioMetrics,
    sectorData: sampleSectorData,
    geographyData: sampleGeographyData,
    hazardData: sampleHazardData,
    horizonData: sampleHorizonData,
    topNDriversData: sampleTopNDriversData,
    selectedHorizon: 2050,
    selectedPathway: "ssp245",
    selectedRisk: "physical" as const,
    selectedMetric: "dcr_score",
    generatedAt: new Date(),
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test HTML Report Generation</h1>
      <p className="mb-4">
        Click the button below to generate a sample HTML report with test data.
      </p>
      <HTMLReportGenerator {...reportData} />
    </div>
  );
}
