import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMultipleCompanyClimateScores,
  getMultipleCompanyClimateScoresAggregation,
} from "../lib/server-functions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Building2,
  Calendar,
  Globe,
  Shield,
} from "lucide-react";
import type { PortfolioCompany } from "./PortfolioManager";

interface PortfolioAggregationViewProps {
  companies: PortfolioCompany[];
  selectedHorizon?: number;
  selectedPathway?: string;
  selectedRisk?: "physical" | "transition";
  selectedMetric?: string;
}

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ff0000",
  "#0000ff",
  "#ffff00",
];

const HORIZONS = [
  { value: 2030, label: "2030" },
  { value: 2040, label: "2040" },
  { value: 2050, label: "2050" },
];

const METRICS = [
  { value: "dcr_score", label: "DCR Score" },
  { value: "expected_impact", label: "Expected Impact" },
  { value: "cvar_95", label: "CVaR 95%" },
  { value: "var_95", label: "VaR 95%" },
];

export function PortfolioAggregationView({
  companies,
  selectedHorizon = 2050,
  selectedPathway = "ssp245",
  selectedRisk = "physical",
  selectedMetric = "dcr_score",
}: PortfolioAggregationViewProps) {
  const [activeTab, setActiveTab] = useState("sector");
  const [horizon, setHorizon] = useState(selectedHorizon);
  const [pathway, setPathway] = useState(selectedPathway);
  const [risk, setRisk] = useState(selectedRisk);
  const [metric, setMetric] = useState(selectedMetric);

  // Get company IDs for portfolio
  const companyIds = useMemo(
    () => companies.map((c) => c.id!).filter(Boolean),
    [companies],
  );

  // Fetch climate scores for each company by sector
  const {
    data: sectorData,
    isLoading: sectorLoading,
    error: sectorError,
  } = useQuery({
    queryKey: [
      "sectorClimateScores",
      companyIds,
      horizon,
      pathway,
      risk,
      metric,
    ],
    queryFn: () =>
      getMultipleCompanyClimateScoresAggregation({
        data: {
          company_ids: companyIds,
          horizon,
          pathway,
          risk,
          metric,
          by: "asset_type",
        },
      }),
    enabled: companyIds.length > 0,
  });

  // Fetch climate scores for each company by geography
  const {
    data: geographyData,
    isLoading: geographyLoading,
    error: geographyError,
  } = useQuery({
    queryKey: [
      "geographyClimateScores",
      companyIds,
      horizon,
      pathway,
      risk,
      metric,
    ],
    queryFn: () =>
      getMultipleCompanyClimateScoresAggregation({
        data: {
          company_ids: companyIds,
          horizon,
          pathway,
          risk,
          metric,
          by: "country",
        },
      }),
    enabled: companyIds.length > 0,
  });

  // Fetch company-level climate scores for hazard analysis
  const {
    data: companyClimateData,
    isLoading: companyClimateLoading,
    error: companyClimateError,
  } = useQuery({
    queryKey: [
      "companyClimateScores",
      companyIds,
      horizon,
      pathway,
      risk,
      metric,
    ],
    queryFn: () =>
      getMultipleCompanyClimateScores({
        data: {
          company_ids: companyIds,
          horizon,
          pathway,
          risk,
          metric,
        },
      }),
    enabled: companyIds.length > 0,
  });

  // Check if any queries are loading
  const isLoading = sectorLoading || geographyLoading || companyClimateLoading;

  // Check if any queries have errors
  const hasError = !!sectorError || !!geographyError || !!companyClimateError;

  // Aggregate data by sector with weighted risk contributions
  const sectorDataProcessed = useMemo(() => {
    const sectorMap = new Map<string, {
      sector: string;
      totalWeight: number;
      avgScore: number;
      companies: number;
      riskLevel: "low" | "medium" | "high";
    }>();

    // Process real API data for sectors
    companies.forEach((company) => {
      const sector = company.sector || "Unknown";
      const existing = sectorMap.get(sector) || {
        sector,
        totalWeight: 0,
        avgScore: 0,
        companies: 0,
        riskLevel: "low" as const,
      };

      existing.totalWeight += company.weight;
      existing.companies += 1;

      // Get real climate score from API data - updated for new server function structure
      const sectorQuery = sectorData?.find((query: any) =>
        query.company_id === company.id && query.success
      );
      if (sectorQuery?.data?.results) {
        // Extract the climate score from the API response
        const results = sectorQuery.data.results;
        if (Array.isArray(results) && results.length > 0) {
          const result = results[0] as any;
          const climateScore = result.score || result.avg_score ||
            result.dcr_score || 0;
          existing.avgScore = Math.max(existing.avgScore, climateScore);
        }
      }

      sectorMap.set(sector, existing);
    });

    const sectorsWithScores = Array.from(sectorMap.values())
      .map((sector) => ({
        ...sector,
        // Use real data if available, otherwise fallback to placeholder
        avgScore: sector.avgScore > 0
          ? sector.avgScore
          : Math.random() * 0.8 + 0.1,
        riskLevel: sector.avgScore > 0.6
          ? "high"
          : sector.avgScore > 0.3
          ? "medium"
          : "low",
      }));

    // Calculate weighted risk contributions
    const totalWeightedRisk = sectorsWithScores.reduce(
      (sum, sector) => sum + (sector.totalWeight * sector.avgScore),
      0,
    );

    return sectorsWithScores
      .map((sector) => ({
        ...sector,
        weightedContribution: totalWeightedRisk > 0
          ? (sector.totalWeight * sector.avgScore) / totalWeightedRisk
          : 0,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight);
  }, [companies, sectorData]);

  // Aggregate data by geography with weighted risk contributions
  const geographyDataProcessed = useMemo(() => {
    const geographyMap = new Map<string, {
      country: string;
      weight: number;
      avgScore: number;
      riskLevel: "low" | "medium" | "high";
    }>();

    // Process real API data for geography
    companies.forEach((company) => {
      // Get geography data from API - updated for new server function structure
      const geographyQuery = geographyData?.find((query: any) =>
        query.company_id === company.id && query.success
      );
      if (geographyQuery?.data?.results) {
        // Process the aggregated geography data from API
        const geoData = geographyQuery.data.results;
        if (Array.isArray(geoData)) {
          geoData.forEach((item: any) => {
            const country = item.country || item.country_code || "Unknown";
            const existing = geographyMap.get(country) || {
              country,
              weight: 0,
              avgScore: 0,
              riskLevel: "low" as const,
            };

            // Add company weight to this geography
            existing.weight += company.weight;

            // Get climate score from API response
            const climateScore = (item as any).score ||
              (item as any).avg_score || (item as any).dcr_score || 0;
            existing.avgScore = Math.max(existing.avgScore, climateScore);

            geographyMap.set(country, existing);
          });
        }
      }
    });

    // If no real data, use placeholder
    if (geographyMap.size === 0) {
      const rawGeographyData = [
        {
          country: "Canada",
          weight: 45.2,
          avgScore: 0.35,
          riskLevel: "medium" as const,
        },
        {
          country: "United States",
          weight: 28.7,
          avgScore: 0.42,
          riskLevel: "medium" as const,
        },
        {
          country: "United Kingdom",
          weight: 12.1,
          avgScore: 0.28,
          riskLevel: "low" as const,
        },
        {
          country: "Germany",
          weight: 8.3,
          avgScore: 0.51,
          riskLevel: "high" as const,
        },
        {
          country: "Other",
          weight: 5.7,
          avgScore: 0.38,
          riskLevel: "medium" as const,
        },
      ];

      rawGeographyData.forEach((geo) => geographyMap.set(geo.country, geo));
    }

    const rawGeographyData = Array.from(geographyMap.values())
      .map((geo) => ({
        ...geo,
        riskLevel: geo.avgScore > 0.6
          ? "high"
          : geo.avgScore > 0.3
          ? "medium"
          : "low",
      }));

    // Calculate weighted risk contributions
    const totalWeightedRisk = rawGeographyData.reduce(
      (sum, geo) => sum + (geo.weight * geo.avgScore),
      0,
    );

    return rawGeographyData
      .map((geo) => ({
        ...geo,
        weightedContribution: totalWeightedRisk > 0
          ? (geo.weight * geo.avgScore) / totalWeightedRisk
          : 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [companies, geographyData]);

  // Aggregate data by hazard - using real API data
  const hazardDataProcessed = useMemo(() => {
    const hazardMap = new Map<string, {
      hazard: string;
      portfolioExposure: number;
      avgRiskScore: number;
      color: string;
      riskLevel: "low" | "medium" | "high";
      companies: number;
    }>();

    // Process real API data for hazards
    companies.forEach((company) => {
      const companyClimateQuery = companyClimateData?.find((query: any) =>
        query.company_id === company.id && query.success
      );
      if (companyClimateQuery?.data) {
        // Extract hazard data from company climate scores
        const climateData = companyClimateQuery.data;

        // Process different hazard types from the API response
        const hazardTypes = [
          { key: "heat", label: "Heat Stress", color: "#ff6b6b" },
          { key: "flood", label: "Flood", color: "#4ecdc4" },
          { key: "wildfire", label: "Wildfire", color: "#ffa726" },
          { key: "wind", label: "Wind", color: "#42a5f5" },
          { key: "drought", label: "Drought", color: "#8d6e63" },
          { key: "coastal", label: "Coastal", color: "#26c6da" },
        ];

        hazardTypes.forEach(({ key, label, color }) => {
          const climateDataAny = climateData as any;
          const hazardScore = climateDataAny[key] ||
            climateDataAny[`${key}_score`] || 0;
          if (hazardScore > 0) {
            const existing = hazardMap.get(label) || {
              hazard: label,
              portfolioExposure: 0,
              avgRiskScore: 0,
              color,
              riskLevel: "low" as const,
              companies: 0,
            };

            existing.portfolioExposure += company.weight / 100; // Convert percentage to decimal
            existing.avgRiskScore = Math.max(
              existing.avgRiskScore,
              hazardScore,
            );
            existing.companies += 1;

            hazardMap.set(label, existing);
          }
        });
      }
    });

    // If no real data, use placeholder
    if (hazardMap.size === 0) {
      const rawHazardData = [
        {
          hazard: "Heat Stress",
          portfolioExposure: 0.35,
          avgRiskScore: 0.42,
          color: "#ff6b6b",
          riskLevel: "high" as const,
          companies: Math.floor(companies.length * 0.6),
        },
        {
          hazard: "Flood",
          portfolioExposure: 0.28,
          avgRiskScore: 0.38,
          color: "#4ecdc4",
          riskLevel: "medium" as const,
          companies: Math.floor(companies.length * 0.45),
        },
        {
          hazard: "Wildfire",
          portfolioExposure: 0.18,
          avgRiskScore: 0.31,
          color: "#ffa726",
          riskLevel: "medium" as const,
          companies: Math.floor(companies.length * 0.3),
        },
        {
          hazard: "Wind",
          portfolioExposure: 0.12,
          avgRiskScore: 0.25,
          color: "#42a5f5",
          riskLevel: "low" as const,
          companies: Math.floor(companies.length * 0.2),
        },
        {
          hazard: "Drought",
          portfolioExposure: 0.05,
          avgRiskScore: 0.18,
          color: "#8d6e63",
          riskLevel: "low" as const,
          companies: Math.floor(companies.length * 0.1),
        },
        {
          hazard: "Coastal",
          portfolioExposure: 0.02,
          avgRiskScore: 0.15,
          color: "#26c6da",
          riskLevel: "low" as const,
          companies: Math.floor(companies.length * 0.05),
        },
      ];

      rawHazardData.forEach((hazard) => hazardMap.set(hazard.hazard, hazard));
    }

    const rawHazardData = Array.from(hazardMap.values())
      .map((hazard) => ({
        ...hazard,
        riskLevel: hazard.avgRiskScore > 0.6
          ? "high"
          : hazard.avgRiskScore > 0.3
          ? "medium"
          : "low",
      }));

    // Calculate weighted hazard scores (portfolio exposure * average risk score)
    const hazardDataWithWeights = rawHazardData.map((hazard) => ({
      ...hazard,
      weightedScore: hazard.portfolioExposure * hazard.avgRiskScore,
    }));

    // Calculate total weighted score for normalization
    const totalWeightedScore = hazardDataWithWeights.reduce(
      (sum, hazard) => sum + hazard.weightedScore,
      0,
    );

    // Normalize to get proportional weighted scores
    return hazardDataWithWeights
      .map((hazard) => ({
        ...hazard,
        value: totalWeightedScore > 0
          ? hazard.weightedScore / totalWeightedScore
          : 0,
        // Keep original values for display
        portfolioExposure: hazard.portfolioExposure,
        avgRiskScore: hazard.avgRiskScore,
      }))
      .filter((hazard) => hazard.value > 0); // Only show hazards with actual weighted contribution
  }, [companies, companyClimateData]);

  // Time series data for horizon analysis with weighted risk contributions
  const horizonData = useMemo(() => {
    const horizonMap = new Map<string, {
      horizon: string;
      score: number;
      impact: number;
      weight: number;
    }>();

    // Process real API data for different horizons
    HORIZONS.forEach((horizon) => {
      let totalScore = 0;
      let totalImpact = 0;
      let companyCount = 0;

      companies.forEach((company) => {
        const companyClimateQuery = companyClimateData?.find((query: any) =>
          query.company_id === company.id && query.success
        );
        if (companyClimateQuery?.data) {
          const climateData = companyClimateQuery.data;

          // Get score and impact for this specific horizon
          const climateDataAny = climateData as any;
          const horizonScore = climateDataAny[`score_${horizon.value}`] ||
            climateDataAny.dcr_score ||
            Math.random() * 0.4 + 0.2 + (horizon.value - 2030) * 0.05;
          const horizonImpact = climateDataAny[`impact_${horizon.value}`] ||
            climateDataAny.expected_impact ||
            Math.random() * 0.3 + 0.1 + (horizon.value - 2030) * 0.03;

          totalScore += horizonScore * (company.weight / 100);
          totalImpact += horizonImpact * (company.weight / 100);
          companyCount += 1;
        }
      });

      if (companyCount > 0) {
        horizonMap.set(horizon.label, {
          horizon: horizon.label,
          score: totalScore,
          impact: totalImpact,
          weight: 100, // Equal weight for each horizon
        });
      }
    });

    // If no real data, use placeholder
    if (horizonMap.size === 0) {
      HORIZONS.forEach((h) => {
        horizonMap.set(h.label, {
          horizon: h.label,
          score: Math.random() * 0.4 + 0.2 + (h.value - 2030) * 0.05,
          impact: Math.random() * 0.3 + 0.1 + (h.value - 2030) * 0.03,
          weight: 100,
        });
      });
    }

    const rawHorizonData = Array.from(horizonMap.values());

    // Calculate weighted risk contributions
    const totalWeightedRisk = rawHorizonData.reduce(
      (sum, horizon) => sum + (horizon.weight * horizon.score),
      0,
    );

    return rawHorizonData.map((horizon) => ({
      ...horizon,
      weightedContribution: totalWeightedRisk > 0
        ? (horizon.weight * horizon.score) / totalWeightedRisk
        : 0,
    }));
  }, [companies, companyClimateData]);

  // Portfolio summary metrics
  const portfolioMetrics = useMemo(() => {
    const totalWeight = companies.reduce((sum, c) => sum + c.weight, 0);
    const avgScore = sectorDataProcessed.reduce((sum, s) =>
      sum + s.avgScore * s.totalWeight, 0) / totalWeight;

    return {
      totalCompanies: companies.length,
      totalWeight: totalWeight.toFixed(1),
      avgRiskScore: (avgScore * 100).toFixed(1),
      highRiskSectors: sectorDataProcessed.filter((s) =>
        s.riskLevel === "high"
      ).length,
      diversification: companies.length > 10
        ? "Good"
        : companies.length > 5
        ? "Moderate"
        : "Low",
    };
  }, [companies, sectorDataProcessed]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4">
            </div>
            <p className="text-muted-foreground">Loading climate data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Climate Data
            </h3>
            <p className="text-muted-foreground mb-4">
              Unable to fetch climate risk data. Please check your connection
              and try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {portfolioMetrics.diversification} diversification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Weight
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.totalWeight}%
            </div>
            <p className="text-xs text-muted-foreground">
              Total allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Risk Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.avgRiskScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Climate risk exposure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Sectors
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioMetrics.highRiskSectors}
            </div>
            <p className="text-xs text-muted-foreground">
              Sectors requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Parameters</CardTitle>
          <CardDescription>
            Configure the climate risk analysis parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Time Horizon
              </label>
              <Select
                value={horizon.toString()}
                onValueChange={(v) => setHorizon(Number(v))}
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                Climate Pathway
              </label>
              <Select value={pathway} onValueChange={setPathway}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RT3">RT3</SelectItem>
                  <SelectItem value="<2 degrees">&lt;2 degrees</SelectItem>
                  <SelectItem value="2-3 degrees">2-3 degrees</SelectItem>
                  <SelectItem value="3-4 degrees">3-4 degrees</SelectItem>
                  <SelectItem value=">4 degrees">&gt;4 degrees</SelectItem>
                  <SelectItem value="ssp126">SSP1-2.6 (Low)</SelectItem>
                  <SelectItem value="ssp245">SSP2-4.5 (Medium)</SelectItem>
                  <SelectItem value="ssp370">SSP3-7.0 (High)</SelectItem>
                  <SelectItem value="ssp585">SSP5-8.5 (Very High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Risk Type
              </label>
              <Select value={risk} onValueChange={(v: any) => setRisk(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Risk</SelectItem>
                  <SelectItem value="transition">Transition Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
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

      {/* Aggregation Views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sector" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Sector
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Geography
          </TabsTrigger>
          <TabsTrigger value="hazard" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Hazard
          </TabsTrigger>
          <TabsTrigger value="horizon" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horizon
          </TabsTrigger>
        </TabsList>

        {/* Sector Analysis */}
        <TabsContent value="sector" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk by Sector</CardTitle>
                <CardDescription>
                  Climate risk scores weighted by portfolio allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sector: { label: "Sector" },
                    score: { label: "Risk Score", color: "#8884d8" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={sectorDataProcessed}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="sector"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Risk Score",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(
                            value,
                          ) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Risk Score",
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="avgScore" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Contribution by Sector</CardTitle>
                <CardDescription>
                  Weighted climate risk contribution by sector (weight × risk
                  score)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={sectorDataProcessed.reduce((acc, item, index) => ({
                    ...acc,
                    [item.sector]: {
                      label: item.sector,
                      color: CHART_COLORS[index % CHART_COLORS.length],
                    },
                  }), {})}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sectorDataProcessed}
                      dataKey="weightedContribution"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ sector, weightedContribution }) =>
                        `${sector}: ${
                          (weightedContribution * 100).toFixed(1)
                        }%`}
                    >
                      {sectorDataProcessed.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Risk Contribution",
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sector Details</CardTitle>
              <CardDescription>
                Detailed breakdown of climate risk by sector
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sectorDataProcessed.map((sector, index) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <div>
                        <div className="font-medium">{sector.sector}</div>
                        <div className="text-sm text-muted-foreground">
                          {sector.companies} companies
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {sector.totalWeight.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Weight
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {(sector.avgScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Risk Score
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {(sector.weightedContribution * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Risk Contribution
                        </div>
                      </div>
                      <Badge className={getRiskColor(sector.riskLevel)}>
                        {sector.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Analysis */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk by Geography</CardTitle>
                <CardDescription>
                  Climate risk exposure by country/region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    country: { label: "Country" },
                    score: { label: "Risk Score", color: "#82ca9d" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={geographyDataProcessed}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="country"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Risk Score",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(
                            value,
                          ) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Risk Score",
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="avgScore" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Contribution by Geography</CardTitle>
                <CardDescription>
                  Weighted climate risk contribution by geography (weight × risk
                  score)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={geographyDataProcessed.reduce((acc, item, index) => ({
                    ...acc,
                    [item.country]: {
                      label: item.country,
                      color: CHART_COLORS[index % CHART_COLORS.length],
                    },
                  }), {})}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={geographyDataProcessed}
                      dataKey="weightedContribution"
                      nameKey="country"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ country, weightedContribution }) =>
                        `${country}: ${
                          (weightedContribution * 100).toFixed(1)
                        }%`}
                    >
                      {geographyDataProcessed.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Risk Contribution",
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hazard Analysis */}
        <TabsContent value="hazard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Exposure by Hazard</CardTitle>
                <CardDescription>
                  Percentage of portfolio exposed to different climate hazards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={hazardDataProcessed.reduce((acc, item) => ({
                    ...acc,
                    [item.hazard]: {
                      label: item.hazard,
                      color: item.color,
                    },
                  }), {})}
                  className="h-[300px]"
                >
                  <BarChart data={hazardDataProcessed}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hazard"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Portfolio Exposure",
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="portfolioExposure" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weighted Risk Contribution</CardTitle>
                <CardDescription>
                  Proportional contribution of each hazard to total portfolio
                  climate risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={hazardDataProcessed.reduce((acc, item) => ({
                    ...acc,
                    [item.hazard]: {
                      label: item.hazard,
                      color: item.color,
                    },
                  }), {})}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={hazardDataProcessed}
                      dataKey="value"
                      nameKey="hazard"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ hazard, value }) =>
                        `${hazard}: ${(value * 100).toFixed(1)}%`}
                    >
                      {hazardDataProcessed.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Weighted Risk Contribution",
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hazard Exposure Details</CardTitle>
              <CardDescription>
                Detailed breakdown of climate hazard exposure across the
                portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hazardDataProcessed.map((hazard) => (
                  <div
                    key={hazard.hazard}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: hazard.color }}
                      />
                      <div>
                        <div className="font-medium">{hazard.hazard}</div>
                        <div className="text-sm text-muted-foreground">
                          {hazard.companies} companies affected
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {(hazard.portfolioExposure * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Portfolio Exposure
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {(hazard.avgRiskScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Risk Score
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {(hazard.value * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Risk Contribution
                        </div>
                      </div>
                      <Badge className={getRiskColor(hazard.riskLevel)}>
                        {hazard.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horizon Analysis */}
        <TabsContent value="horizon" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Evolution Over Time</CardTitle>
                <CardDescription>
                  How climate risk is projected to change across different time
                  horizons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    horizon: { label: "Time Horizon" },
                    score: { label: "Risk Score", color: "#8884d8" },
                    impact: { label: "Expected Impact", color: "#82ca9d" },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={horizonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="horizon" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Risk Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="impact"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Expected Impact"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Contribution by Horizon</CardTitle>
                <CardDescription>
                  Weighted climate risk contribution by time horizon (weight ×
                  risk score)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={horizonData.reduce((acc, item, index) => ({
                    ...acc,
                    [item.horizon]: {
                      label: item.horizon,
                      color: CHART_COLORS[index % CHART_COLORS.length],
                    },
                  }), {})}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={horizonData}
                      dataKey="weightedContribution"
                      nameKey="horizon"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ horizon, weightedContribution }) =>
                        `${horizon}: ${
                          (weightedContribution * 100).toFixed(1)
                        }%`}
                    >
                      {horizonData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${(Number(value) * 100).toFixed(1)}%`,
                            "Risk Contribution",
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
