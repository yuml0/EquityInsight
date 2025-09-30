import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Globe,
  Shield,
  Target,
} from "lucide-react";
// Individual query hooks are now used within each view component
import { SectorAnalysisView } from "./SectorAnalysisView";
import { GeographyAnalysisView } from "./GeographyAnalysisView";
import { HazardAnalysisView } from "./HazardAnalysisView";
import { HorizonAnalysisView } from "./HorizonAnalysisView";
import { TopNDriversView } from "./TopNDriversView";
import { HTMLReportGenerator } from "../HTMLReportGenerator";
import type { PortfolioCompany } from "../PortfolioManager";
import type { PortfolioMetrics } from "./types";
import { useSectorData, useSectorQueries } from "./hooks";
import { useGeographyData, useGeographyQueries } from "./hooks";
import { useHazardData, useHazardQueries } from "./hooks";
import { useHorizonData, useHorizonQueries } from "./hooks";
import { useTopNDriversData } from "./hooks";

interface PortfolioAnalyticsContainerProps {
  companies: PortfolioCompany[];
  selectedHorizon?: number;
  selectedPathway?: string;
  selectedRisk?: "physical" | "transition";
  selectedMetric?: string;
  onUpdateWeight?: (companyId: string, weight: number) => void;
  onNormalizeWeights?: () => void;
}

// every 10 years from 2025 to 2100
const HORIZONS = [
  { label: "2025", value: 2025 },
  { label: "2030", value: 2030 },
  { label: "2040", value: 2040 },
  { label: "2050", value: 2050 },
  { label: "2060", value: 2060 },
  { label: "2070", value: 2070 },
  { label: "2080", value: 2080 },
  { label: "2090", value: 2090 },
  { label: "2100", value: 2100 },
];

const PATHWAYS = [
  { label: "Stochastic View", value: "RT3" },
  { label: "<2 degrees", value: "<2 degrees" },
  { label: "2-3 degrees", value: "2-3 degrees" },
  { label: "3-4 degrees", value: "3-4 degrees" },
  { label: ">4 degrees", value: ">4 degrees" },
  { label: "SSP1-2.6", value: "ssp126" },
  { label: "SSP2-4.5", value: "ssp245" },
  { label: "SSP3-7.0", value: "ssp370" },
  { label: "SSP5-8.5", value: "ssp585" },
];

const RISK_TYPES = [
  { label: "Physical Risk", value: "physical" },
  { label: "Transition Risk", value: "transition" },
];

// dcr_score, expected_impact, cvar_50, cvar_95, cvar_99, var_50, var_95, var_99
const METRICS = [
  { label: "DCR Score", value: "dcr_score" },
  { label: "Expected Impact", value: "expected_impact" },
  { label: "CVaR 50%", value: "cvar_50" },
  { label: "CVaR 95%", value: "cvar_95" },
  { label: "CVaR 99%", value: "cvar_99" },
  { label: "VaR 50%", value: "var_50" },
  { label: "VaR 95%", value: "var_95" },
  { label: "VaR 99%", value: "var_99" },
];

export function PortfolioAnalyticsContainer({
  companies,
  selectedHorizon = 2050,
  selectedPathway = "ssp245",
  selectedRisk = "physical",
  selectedMetric = "dcr_score",
  onUpdateWeight,
  onNormalizeWeights,
}: PortfolioAnalyticsContainerProps) {
  const [activeTab, setActiveTab] = useState("sector");
  const [horizon, setHorizon] = useState(selectedHorizon);
  const [pathway, setPathway] = useState(selectedPathway);
  const [risk, setRisk] = useState(selectedRisk);
  const [metric, setMetric] = useState(selectedMetric);

  // Data hooks for all analysis views
  const { sectorQueries } = useSectorQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const sectorData = useSectorData(companies, sectorQueries);

  const { geographyQueries } = useGeographyQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const geographyData = useGeographyData(companies, geographyQueries);

  const { companyClimateQueries: hazardQueries } = useHazardQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const hazardData = useHazardData(companies, hazardQueries);

  const { companyClimateQueries: horizonQueries } = useHorizonQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const horizonData = useHorizonData(companies, horizonQueries, HORIZONS);

  const topNDriversData = useTopNDriversData(
    companies,
    hazardQueries,
    horizon,
    pathway,
    risk,
    metric,
  );

  // Calculate portfolio metrics
  const portfolioMetrics: PortfolioMetrics = {
    totalCompanies: companies.length,
    totalWeight: companies.reduce((sum, c) => sum + c.weight, 0),
    avgScore: 0.42, // This would be calculated from real data
    highRiskCompanies: Math.floor(companies.length * 0.3),
  };

  // Generate report data for HTML export
  const reportData = useMemo(() => ({
    companies,
    portfolioMetrics,
    sectorData,
    geographyData,
    hazardData,
    horizonData,
    topNDriversData,
    selectedHorizon: horizon,
    selectedPathway: pathway,
    selectedRisk: risk,
    selectedMetric: metric,
    generatedAt: new Date(),
  }), [
    companies,
    portfolioMetrics,
    sectorData,
    geographyData,
    hazardData,
    horizonData,
    topNDriversData,
    horizon,
    pathway,
    risk,
    metric,
  ]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.totalCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Weight
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.totalWeight.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Risk Score
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(portfolioMetrics.avgScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Climate risk level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Companies
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.highRiskCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Filters</CardTitle>
              <CardDescription>
                Adjust parameters to analyze different climate scenarios and
                risk metrics
              </CardDescription>
            </div>
            <HTMLReportGenerator {...reportData} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Horizon</label>
              <Select
                value={horizon.toString()}
                onValueChange={(value) => setHorizon(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HORIZONS.map((h) => (
                    <SelectItem key={h.value} value={h.value.toString()}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Climate Pathway</label>
              <Select value={pathway} onValueChange={setPathway}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATHWAYS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Type</label>
              <Select
                value={risk}
                onValueChange={(value: "physical" | "transition") =>
                  setRisk(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_TYPES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Metric</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
          <TabsTrigger value="sector" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Sector
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Geography
          </TabsTrigger>
          <TabsTrigger value="hazard" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Hazard
          </TabsTrigger>
          <TabsTrigger value="horizon" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horizon
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Top-N Drivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sector" className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <SectorAnalysisView
              companies={companies}
              horizon={horizon}
              pathway={pathway}
              risk={risk}
              metric={metric}
            />
          </div>
        </TabsContent>

        <TabsContent value="geography" className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <GeographyAnalysisView
              companies={companies}
              horizon={horizon}
              pathway={pathway}
              risk={risk}
              metric={metric}
            />
          </div>
        </TabsContent>

        <TabsContent value="hazard" className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <HazardAnalysisView
              companies={companies}
              horizon={horizon}
              pathway={pathway}
              risk={risk}
              metric={metric}
            />
          </div>
        </TabsContent>

        <TabsContent value="horizon" className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <HorizonAnalysisView
              companies={companies}
              horizon={horizon}
              pathway={pathway}
              risk={risk}
              metric={metric}
              availableHorizons={HORIZONS}
            />
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <TopNDriversView
              companies={companies}
              horizon={horizon}
              pathway={pathway}
              risk={risk}
              metric={metric}
              onUpdateWeight={onUpdateWeight}
              onNormalizeWeights={onNormalizeWeights}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
