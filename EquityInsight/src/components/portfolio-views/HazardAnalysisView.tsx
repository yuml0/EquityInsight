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
import { Shield } from "lucide-react";
import { useHazardData, useHazardQueries } from "./hooks";
import type { AnalysisViewProps } from "./types";

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

export function HazardAnalysisView({
  companies,
  horizon,
  pathway,
  risk,
  metric,
}: AnalysisViewProps) {
  const { companyClimateQueries, isLoading, hasError } = useHazardQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const hazardData = useHazardData(companies, companyClimateQueries);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4">
          </div>
          <p className="text-muted-foreground">Loading hazard data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Hazard Data
          </h3>
          <p className="text-muted-foreground">
            Unable to fetch hazard climate data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 overflow-y-auto pr-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 w-full">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Weighted Risk Contribution</CardTitle>
            <CardDescription>
              Proportional climate hazard risk contribution to total portfolio
              risk
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4">
            <div className="w-full h-full overflow-hidden">
              <ChartContainer
                config={hazardData.reduce((acc, item) => ({
                  ...acc,
                  [item.hazard]: {
                    label: item.hazard,
                    color: item.color,
                  },
                }), {})}
                className="h-full w-full"
              >
                <PieChart>
                  <Pie
                    data={hazardData}
                    dataKey="value"
                    nameKey="hazard"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ hazard, value }) =>
                      `${hazard}: ${(value * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {hazardData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
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
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Hazard Exposure by Portfolio</CardTitle>
            <CardDescription>
              Portfolio exposure to different climate hazards
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4">
            <div className="w-full h-full overflow-x-auto">
              <ChartContainer
                config={hazardData.reduce((acc, item) => ({
                  ...acc,
                  [item.hazard]: {
                    label: item.hazard,
                    color: item.color,
                  },
                }), {})}
                className="h-full w-full"
              >
                <BarChart
                  data={hazardData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <XAxis
                    dataKey="hazard"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    label={{
                      value: "Portfolio Exposure (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Bar dataKey="portfolioExposure" fill="#8884d8" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(
                          value,
                        ) => [
                          `${(Number(value) * 100).toFixed(1)}%`,
                          "Portfolio Exposure",
                        ]}
                      />
                    }
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Hazard Exposure Details</CardTitle>
          <CardDescription>
            Detailed breakdown of climate hazard exposure and risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hazardData.map((hazard) => (
              <div
                key={hazard.hazard}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{hazard.hazard}</h3>
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
    </div>
  );
}
