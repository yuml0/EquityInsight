import type { PortfolioCompany } from "../PortfolioManager";

export interface AnalysisViewProps {
  companies: PortfolioCompany[];
  horizon: number;
  pathway: string;
  risk: "physical" | "transition";
  metric: string;
}

export interface SectorData {
  sector: string;
  totalWeight: number;
  avgScore: number;
  companies: number;
  riskLevel: "low" | "medium" | "high";
  weightedContribution: number;
}

export interface GeographyData {
  country: string;
  weight: number;
  avgScore: number;
  riskLevel: "low" | "medium" | "high";
  weightedContribution: number;
}

export interface HazardData {
  hazard: string;
  portfolioExposure: number;
  avgRiskScore: number;
  color: string;
  riskLevel: "low" | "medium" | "high";
  companies: number;
  value: number; // normalized weighted score for pie chart
}

export interface HorizonData {
  horizon: string;
  score: number;
  impact: number;
  weight: number;
  weightedContribution: number;
}

export interface PortfolioMetrics {
  totalCompanies: number;
  totalWeight: number;
  avgScore: number;
  highRiskCompanies: number;
}

export interface TopNCompanyDriver {
  companyId: string;
  companyName: string;
  sector: string;
  weight: number;
  cvar: number;
  contribution: number;
  contributionPercent: number;
  rank: number;
}

export interface TopNHazardDriver {
  hazard: string;
  totalContribution: number;
  contributionPercent: number;
  rank: number;
  color: string;
}

export interface ConcentrationMetrics {
  hhi: number;
  concentrationLevel: "low" | "moderate" | "high";
  interpretation: string;
}

export interface TopNDriversData {
  companies: TopNCompanyDriver[];
  hazards: TopNHazardDriver[];
  concentration: ConcentrationMetrics;
  totalPortfolioRisk: number;
}
