import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Building2 } from "lucide-react";
import { useSectorData, useSectorQueries } from "./hooks";
import type { AnalysisViewProps } from "./types";

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ffff00",
];

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case "high":
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function SectorAnalysisView({
  companies,
  horizon,
  pathway,
  risk,
  metric,
}: AnalysisViewProps) {
  const { sectorQueries, isLoading, hasError } = useSectorQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const sectorData = useSectorData(companies, sectorQueries);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4">
          </div>
          <p className="text-muted-foreground">Loading sector data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Sector Data
          </h3>
          <p className="text-muted-foreground">
            Unable to fetch sector climate data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 w-full max-w-full">
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Risk Contribution by Sector</CardTitle>
            <CardDescription>
              Weighted climate risk contribution by sector (weight × risk score)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer
              config={sectorData.reduce((acc, item, index) => ({
                ...acc,
                [item.sector]: {
                  label: item.sector,
                  color: CHART_COLORS[index % CHART_COLORS.length],
                },
              }), {})}
              className="h-full min-h-[250px] max-h-[400px] w-full max-w-full"
            >
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="weightedContribution"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ sector, weightedContribution }) =>
                    `${sector}: ${(weightedContribution * 100).toFixed(1)}%`}
                >
                  {sectorData.map((_, index) => (
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

        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Sector Risk Distribution</CardTitle>
            <CardDescription>
              Portfolio weight distribution by sector
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer
              config={sectorData.reduce((acc, item, index) => ({
                ...acc,
                [item.sector]: {
                  label: item.sector,
                  color: CHART_COLORS[index % CHART_COLORS.length],
                },
              }), {})}
              className="h-full min-h-[250px] max-h-[400px] w-full max-w-full"
            >
              <BarChart data={sectorData}>
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
                    value: "Portfolio Weight (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Bar dataKey="totalWeight" fill="#8884d8" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}%`, "Portfolio Weight"]}
                    />
                  }
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Sector Breakdown</CardTitle>
          <CardDescription>
            Detailed sector analysis with risk scores and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sectorData.map((sector) => (
              <div
                key={sector.sector}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{sector.sector}</h3>
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
    </div>
  );
}
