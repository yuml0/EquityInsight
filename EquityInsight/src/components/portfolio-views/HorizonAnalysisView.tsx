import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "lucide-react";
import { useHorizonData, useHorizonQueries } from "./hooks";
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

function getRiskColor(score: number) {
  if (score > 0.6) return "text-red-600 bg-red-50";
  if (score > 0.3) return "text-yellow-600 bg-yellow-50";
  return "text-green-600 bg-green-50";
}

export function HorizonAnalysisView({
  companies,
  horizon,
  pathway,
  risk,
  metric,
  availableHorizons,
}: AnalysisViewProps & {
  availableHorizons?: { label: string; value: number }[];
}) {
  const { companyClimateQueries, isLoading, hasError } = useHorizonQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );
  const horizonData = useHorizonData(
    companies,
    companyClimateQueries,
    availableHorizons,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4">
          </div>
          <p className="text-muted-foreground">Loading horizon data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Horizon Data
          </h3>
          <p className="text-muted-foreground">
            Unable to fetch horizon climate data. Please try again.
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
            <CardTitle>Risk Evolution Over Time</CardTitle>
            <CardDescription>
              How climate risk is projected to change across different time
              horizons (2025-2100)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer
              config={{
                horizon: { label: "Time Horizon" },
                score: { label: "Risk Score", color: "#8884d8" },
                impact: { label: "Expected Impact", color: "#82ca9d" },
              }}
              className="h-full min-h-[250px] max-h-[400px] w-full max-w-full"
            >
              <LineChart data={horizonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="horizon"
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

        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Risk Contribution by Horizon</CardTitle>
            <CardDescription>
              Weighted climate risk contribution by time horizon (weight × risk
              score)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer
              config={horizonData.reduce((acc, item, index) => ({
                ...acc,
                [item.horizon]: {
                  label: item.horizon,
                  color: CHART_COLORS[index % CHART_COLORS.length],
                },
              }), {})}
              className="h-full min-h-[250px] max-h-[400px] w-full max-w-full"
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
                    `${horizon}: ${(weightedContribution * 100).toFixed(1)}%`}
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

      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Time Horizon Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis of climate risk across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {horizonData.map((horizon) => (
              <div
                key={horizon.horizon}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{horizon.horizon}</h3>
                    <div className="text-sm text-muted-foreground">
                      Time horizon
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">
                      {(horizon.score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Score
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {(horizon.impact * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expected Impact
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {(horizon.weightedContribution * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Contribution
                    </div>
                  </div>
                  <Badge className={getRiskColor(horizon.score)}>
                    {horizon.score > 0.6
                      ? "high"
                      : horizon.score > 0.3
                      ? "medium"
                      : "low"}
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
