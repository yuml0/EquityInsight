import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Building2,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useHazardQueries, useTopNDriversData } from "./hooks";
import type { AnalysisViewProps, TopNDriversData } from "./types";

interface TopNDriversViewProps extends AnalysisViewProps {
  onUpdateWeight?: (companyId: string, weight: number) => void;
  onNormalizeWeights?: () => void;
}

// Generate dynamic actionable insights based on analysis results
function generateActionableInsights(data: TopNDriversData): Array<{
  text: string;
  action?: {
    type: "reduce_weight" | "rebalance" | "diversify_sector";
    companyId?: string;
    companyName?: string;
    targetWeight?: number;
    sector?: string;
  };
}> {
  const insights: Array<{
    text: string;
    action?: {
      type: "reduce_weight" | "rebalance" | "diversify_sector";
      companyId?: string;
      companyName?: string;
      targetWeight?: number;
      sector?: string;
    };
  }> = [];

  // Top company insights - actionable
  const topCompany = data.companies[0];
  if (topCompany && topCompany.contributionPercent > 40) {
    insights.push({
      text: `Consider reducing ${topCompany.companyName} exposure (${
        topCompany.contributionPercent.toFixed(1)
      }% of risk)`,
      action: {
        type: "reduce_weight",
        companyId: topCompany.companyId,
        companyName: topCompany.companyName,
        targetWeight: Math.max(5, topCompany.weight * 0.7), // Reduce by 30%, min 5%
      },
    });
  }

  // Sector concentration insights - actionable
  const sectorCounts = data.companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantSector = Object.entries(sectorCounts).find(([_, count]) =>
    count > data.companies.length * 0.5
  );
  if (dominantSector) {
    insights.push({
      text: `Diversify away from ${dominantSector[0]} sector (${
        dominantSector[1]
      } companies)`,
      action: {
        type: "diversify_sector",
        sector: dominantSector[0],
      },
    });
  }

  // High-risk companies - actionable
  const highRiskCompanies = data.companies.filter((c) => c.cvar > 0.6);
  if (highRiskCompanies.length > 0) {
    const topHighRisk = highRiskCompanies[0];
    insights.push({
      text: `Address high-risk company: ${topHighRisk.companyName} (CVaR: ${
        topHighRisk.cvar.toFixed(3)
      })`,
      action: {
        type: "reduce_weight",
        companyId: topHighRisk.companyId,
        companyName: topHighRisk.companyName,
        targetWeight: Math.max(2, topHighRisk.weight * 0.5), // Reduce by 50%, min 2%
      },
    });
  }

  // Concentration-based insights - actionable rebalancing
  if (data.concentration.concentrationLevel === "high") {
    insights.push({
      text: "High concentration detected - rebalance portfolio",
      action: {
        type: "rebalance",
      },
    });
  }

  // Risk distribution insights - actionable
  const riskVariance = calculateRiskVariance(data.companies);
  if (riskVariance > 0.1) {
    insights.push({
      text: "High risk variance detected - rebalance to uniform risk profile",
      action: {
        type: "rebalance",
      },
    });
  }

  // Non-actionable insights
  if (data.concentration.concentrationLevel === "moderate") {
    insights.push({
      text: "Monitor concentration trends over time",
    });
  } else if (data.concentration.concentrationLevel === "low") {
    insights.push({
      text: "Portfolio shows good risk diversification",
    });
  }

  // Hazard-specific insights (non-actionable for now)
  const topHazard = data.hazards[0];
  if (topHazard && topHazard.contributionPercent > 50) {
    insights.push({
      text: `Prioritize ${topHazard.hazard} risk mitigation (${
        topHazard.contributionPercent.toFixed(1)
      }% of portfolio risk)`,
    });
  }

  return insights.slice(0, 6); // Limit to 6 insights for readability
}

// Helper function to calculate risk variance
function calculateRiskVariance(companies: any[]): number {
  if (companies.length < 2) return 0;

  const risks = companies.map((c) => c.cvar);
  const mean = risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
  const variance =
    risks.reduce((sum, risk) => sum + Math.pow(risk - mean, 2), 0) /
    risks.length;

  return Math.sqrt(variance);
}

export function TopNDriversView({
  companies,
  horizon,
  pathway,
  risk,
  metric,
  onUpdateWeight,
  onNormalizeWeights,
}: TopNDriversViewProps) {
  const { companyClimateQueries, isLoading, hasError } = useHazardQueries(
    companies,
    horizon,
    pathway,
    risk,
    metric,
  );

  const topNDriversData = useTopNDriversData(
    companies,
    companyClimateQueries,
    horizon,
    pathway,
    risk,
    metric,
  );

  // Dialog state for actionable insights
  const [selectedAction, setSelectedAction] = useState<
    {
      type: "reduce_weight" | "rebalance" | "diversify_sector";
      companyId?: string;
      companyName?: string;
      targetWeight?: number;
      sector?: string;
    } | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActionClick = (action: typeof selectedAction) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  // Calculate estimated results for the action
  const calculateEstimatedResults = () => {
    if (!selectedAction) return null;

    const currentTotalRisk = topNDriversData.totalPortfolioRisk;
    const currentHHI = topNDriversData.concentration.hhi;
    const currentTopCompany = topNDriversData.companies[0];

    if (
      selectedAction.type === "reduce_weight" && selectedAction.companyId &&
      selectedAction.targetWeight
    ) {
      const company = companies.find((c) => c.id === selectedAction.companyId);
      if (!company) return null;

      const currentWeight = company.weight;
      const newWeight = selectedAction.targetWeight;
      const weightChange = newWeight - currentWeight;

      // Estimate risk reduction based on weight change
      const riskReduction = (weightChange / currentWeight) *
        (currentTopCompany?.contribution || 0);
      const estimatedNewRisk = Math.max(0, currentTotalRisk + riskReduction);

      return {
        type: "reduce_weight",
        companyName: selectedAction.companyName,
        currentWeight,
        newWeight,
        weightChange,
        currentRisk: currentTotalRisk,
        estimatedNewRisk,
        riskReduction: Math.abs(riskReduction),
        riskReductionPercent: Math.abs(
          (riskReduction / currentTotalRisk) * 100,
        ),
      };
    }

    if (selectedAction.type === "rebalance") {
      const equalWeight = 100 / companies.length;
      const currentVariance = calculateRiskVariance(topNDriversData.companies);

      // Estimate improved diversification
      const estimatedHHI = 1 / companies.length; // Perfect equal weights
      const hhiImprovement = currentHHI - estimatedHHI;

      return {
        type: "rebalance",
        equalWeight,
        currentHHI,
        estimatedHHI,
        hhiImprovement,
        currentVariance,
        estimatedVariance: 0, // Equal weights = no variance
      };
    }

    if (selectedAction.type === "diversify_sector" && selectedAction.sector) {
      const sectorCompanies = companies.filter((c) =>
        c.sector === selectedAction.sector
      );
      const reductionFactor = 0.7;

      const currentSectorWeight = sectorCompanies.reduce(
        (sum, c) => sum + c.weight,
        0,
      );
      const estimatedSectorWeight = sectorCompanies.reduce(
        (sum, c) => sum + Math.max(2, c.weight * reductionFactor),
        0,
      );
      const sectorWeightReduction = currentSectorWeight - estimatedSectorWeight;

      return {
        type: "diversify_sector",
        sector: selectedAction.sector,
        affectedCompanies: sectorCompanies.length,
        currentSectorWeight,
        estimatedSectorWeight,
        sectorWeightReduction,
        sectorWeightReductionPercent:
          (sectorWeightReduction / currentSectorWeight) * 100,
      };
    }

    return null;
  };

  const estimatedResults = calculateEstimatedResults();

  const handleConfirmAction = () => {
    if (!selectedAction || !onUpdateWeight) return;

    if (
      selectedAction.type === "reduce_weight" && selectedAction.companyId &&
      selectedAction.targetWeight
    ) {
      // Apply the weight change
      onUpdateWeight(selectedAction.companyId, selectedAction.targetWeight);
    } else if (selectedAction.type === "rebalance") {
      // Rebalance all companies to equal weights
      const equalWeight = 100 / companies.length;
      companies.forEach((company) => {
        onUpdateWeight(company.id!, equalWeight);
      });
    } else if (
      selectedAction.type === "diversify_sector" && selectedAction.sector
    ) {
      // Reduce weights of companies in the dominant sector
      const sectorCompanies = companies.filter((c) =>
        c.sector === selectedAction.sector
      );
      const reductionFactor = 0.7; // Reduce by 30%

      // Apply weight changes
      sectorCompanies.forEach((company) => {
        const newWeight = Math.max(2, company.weight * reductionFactor);
        onUpdateWeight(company.id!, newWeight);
      });
    }

    // Normalize weights after any changes
    if (onNormalizeWeights) {
      setTimeout(() => {
        onNormalizeWeights();
      }, 100); // Small delay to ensure state updates are processed
    }

    setIsDialogOpen(false);
    setSelectedAction(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2">
                </div>
                <p className="text-sm text-muted-foreground">
                  Loading Top-N drivers analysis...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">
                  Error loading Top-N drivers data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 pr-3">
      {/* Compact Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-shrink-0">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Portfolio Risk</p>
              <p className="text-lg font-bold">
                {topNDriversData.totalPortfolioRisk.toFixed(3)}
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Concentration</p>
              <p className="text-lg font-bold">
                {topNDriversData.concentration.hhi.toFixed(3)}
              </p>
            </div>
            <Badge
              variant={topNDriversData.concentration.concentrationLevel ===
                  "high"
                ? "destructive"
                : topNDriversData.concentration.concentrationLevel ===
                    "moderate"
                ? "secondary"
                : "default"}
              className="text-xs"
            >
              {topNDriversData.concentration.concentrationLevel}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Top Driver</p>
              <p className="text-lg font-bold">
                {topNDriversData.companies[0]?.contributionPercent.toFixed(1) ||
                  0}%
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Companies</p>
              <p className="text-lg font-bold">
                {topNDriversData.companies.length}
              </p>
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Company Drivers - Compact Table */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Top Company Drivers
          </CardTitle>
          <CardDescription className="text-sm">
            Risk contribution ranking (w_i × CVaR_i)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-12 text-xs">#</TableHead>
                <TableHead className="text-xs">Company</TableHead>
                <TableHead className="text-right text-xs w-16">
                  Weight
                </TableHead>
                <TableHead className="text-right text-xs w-16">
                  CVaR
                </TableHead>
                <TableHead className="text-right text-xs w-20">
                  Contribution
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topNDriversData.companies.slice(0, 8).map((company) => (
                <TableRow
                  key={company.companyId}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-sm">
                    {company.rank}
                  </TableCell>
                  <TableCell className="py-2">
                    <div>
                      <div className="font-medium text-sm truncate max-w-[120px]">
                        {company.companyName}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {company.sector}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {company.weight.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {company.cvar.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12">
                        <Progress
                          value={company.contributionPercent}
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-xs font-medium w-10">
                        {company.contributionPercent.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hazard Drivers - Compact List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Top Hazard Drivers
          </CardTitle>
          <CardDescription className="text-sm">
            Climate hazards by risk contribution
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <div className="space-y-2 p-2">
            {topNDriversData.hazards.map((hazard) => (
              <div
                key={hazard.hazard}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hazard.color }}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {hazard.hazard}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rank #{hazard.rank}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {hazard.contributionPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hazard.totalContribution.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compact Insights & Actions */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Risk Insights & Actions
          </CardTitle>
          <CardDescription className="text-sm">
            HHI: {topNDriversData.concentration.hhi.toFixed(3)} •{" "}
            {topNDriversData.concentration.interpretation}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Actionable Insights - Compact */}
            <div className="space-y-2">
              {generateActionableInsights(topNDriversData).slice(0, 4).map((
                insight,
                index,
              ) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                >
                  <span className="text-sm flex-1">• {insight.text}</span>
                  {insight.action && onUpdateWeight && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionClick(insight.action!)}
                      className="ml-2 h-6 px-2 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Action Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Confirm Portfolio Adjustment</DialogTitle>
                  <DialogDescription>
                    Review the estimated impact before applying changes to your
                    portfolio.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Action Summary */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Action Summary</h4>
                    {selectedAction?.type === "reduce_weight" &&
                      estimatedResults &&
                      estimatedResults.type === "reduce_weight" && (
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Action:</strong> Reduce{" "}
                          {estimatedResults.companyName} exposure
                        </p>
                        <p>
                          <strong>Weight Change:</strong>{" "}
                          {estimatedResults.currentWeight?.toFixed(1)}% →{" "}
                          {estimatedResults.newWeight?.toFixed(1)}%
                          ({estimatedResults.weightChange &&
                              estimatedResults.weightChange > 0
                            ? "+"
                            : ""}
                          {estimatedResults.weightChange?.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                    {selectedAction?.type === "rebalance" && estimatedResults &&
                      estimatedResults.type === "rebalance" && (
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Action:</strong> Rebalance to equal weights
                        </p>
                        <p>
                          <strong>New Weight per Company:</strong>{" "}
                          {estimatedResults.equalWeight?.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedAction?.type === "diversify_sector" &&
                      estimatedResults &&
                      estimatedResults.type === "diversify_sector" && (
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Action:</strong> Diversify away from{" "}
                          {estimatedResults.sector} sector
                        </p>
                        <p>
                          <strong>Affected Companies:</strong>{" "}
                          {estimatedResults.affectedCompanies} companies
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Estimated Impact */}
                  {estimatedResults && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-900">
                        Estimated Impact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {estimatedResults.type === "reduce_weight" && (
                          <>
                            <div>
                              <p className="text-blue-800">
                                <strong>Portfolio Risk:</strong>{" "}
                                {estimatedResults.currentRisk?.toFixed(3)} →
                                {" "}
                                {estimatedResults.estimatedNewRisk?.toFixed(3)}
                              </p>
                              <p className="text-blue-600">
                                Risk Reduction:{" "}
                                {estimatedResults.riskReductionPercent?.toFixed(
                                  1,
                                )}%
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-800">
                                <strong>Risk Reduction:</strong>{" "}
                                {estimatedResults.riskReduction?.toFixed(3)}
                              </p>
                              <p className="text-blue-600">
                                Lower risk concentration
                              </p>
                            </div>
                          </>
                        )}

                        {estimatedResults.type === "rebalance" && (
                          <>
                            <div>
                              <p className="text-blue-800">
                                <strong>Concentration (HHI):</strong>{" "}
                                {estimatedResults.currentHHI?.toFixed(3)} →{" "}
                                {estimatedResults.estimatedHHI?.toFixed(3)}
                              </p>
                              <p className="text-blue-600">
                                Improvement:{" "}
                                {estimatedResults.hhiImprovement?.toFixed(3)}
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-800">
                                <strong>Risk Variance:</strong>{" "}
                                {estimatedResults.currentVariance?.toFixed(3)} →
                                {" "}
                                {estimatedResults.estimatedVariance?.toFixed(3)}
                              </p>
                              <p className="text-blue-600">
                                More uniform risk distribution
                              </p>
                            </div>
                          </>
                        )}

                        {estimatedResults.type === "diversify_sector" && (
                          <>
                            <div>
                              <p className="text-blue-800">
                                <strong>Sector Weight:</strong>{" "}
                                {estimatedResults.currentSectorWeight?.toFixed(
                                  1,
                                )}% → {estimatedResults.estimatedSectorWeight
                                  ?.toFixed(1)}%
                              </p>
                              <p className="text-blue-600">
                                Reduction:{" "}
                                {estimatedResults.sectorWeightReductionPercent
                                  ?.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-800">
                                <strong>Weight Reduction:</strong>{" "}
                                {estimatedResults.sectorWeightReduction
                                  ?.toFixed(1)}%
                              </p>
                              <p className="text-blue-600">
                                Better sector diversification
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warning for significant changes */}
                  {estimatedResults && (
                    (estimatedResults.type === "reduce_weight" &&
                      estimatedResults.weightChange &&
                      Math.abs(estimatedResults.weightChange) > 20) ||
                    (estimatedResults.type === "diversify_sector" &&
                      estimatedResults.sectorWeightReductionPercent &&
                      estimatedResults.sectorWeightReductionPercent > 25)
                  ) && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-semibold">
                          Significant Change
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        This action will make substantial changes to your
                        portfolio. Please review carefully before proceeding.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmAction}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Apply Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
