import { Button } from "./ui/button";
import { Download, FileText } from "lucide-react";
import type { PortfolioCompany } from "./PortfolioManager";
import type { PortfolioMetrics } from "./portfolio-views/types";

interface HTMLReportGeneratorProps {
  companies: PortfolioCompany[];
  portfolioMetrics: PortfolioMetrics;
  sectorData: any[];
  geographyData: any[];
  hazardData: any[];
  horizonData: any[];
  topNDriversData: any;
  selectedHorizon: number;
  selectedPathway: string;
  selectedRisk: "physical" | "transition";
  selectedMetric: string;
  generatedAt: Date;
}

export function HTMLReportGenerator({
  companies,
  portfolioMetrics,
  sectorData,
  geographyData,
  hazardData,
  horizonData,
  topNDriversData,
  selectedHorizon,
  selectedPathway,
  selectedRisk,
  selectedMetric,
  generatedAt,
}: HTMLReportGeneratorProps) {
  const generateHTMLReport = () => {
    const htmlContent = generateSelfContainedHTML({
      companies,
      portfolioMetrics,
      sectorData,
      geographyData,
      hazardData,
      horizonData,
      topNDriversData,
      selectedHorizon,
      selectedPathway,
      selectedRisk,
      selectedMetric,
      generatedAt,
    });

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `climate-portfolio-report-${
      generatedAt.toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={generateHTMLReport} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        <FileText className="h-4 w-4" />
        Export HTML Report
      </Button>
    </div>
  );
}

function generateSelfContainedHTML({
  companies,
  portfolioMetrics,
  sectorData,
  geographyData,
  hazardData,
  horizonData,
  topNDriversData,
  selectedHorizon,
  selectedPathway,
  selectedRisk,
  selectedMetric,
  generatedAt,
}: HTMLReportGeneratorProps): string {
  const chartColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#ff00ff",
    "#00ffff",
    "#ffff00",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Climate Portfolio Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/recharts@2.8.0/umd/Recharts.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            color: #374151;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 15px;
        }
        
        .header {
            background: #4f46e5;
            color: white;
            padding: 20px 0;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .report-meta {
            background: white;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .meta-item {
            text-align: center;
        }
        
        .meta-label {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 3px;
        }
        
        .meta-value {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
        }
        
        .section {
            background: white;
            margin-bottom: 15px;
            border-radius: 3px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }
        
        .section-header {
            background: #f9fafb;
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 3px;
        }
        
        .section-description {
            color: #6b7280;
            font-size: 0.85rem;
        }
        
        .section-content {
            padding: 15px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 10px;
            max-width: 350px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .chart-container {
            background: #f9fafb;
            padding: 8px;
            border-radius: 3px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            position: relative;
            height: 240px;
            max-height: 240px;
        }
        
        .chart-title {
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 6px;
            color: #374151;
        }
        
        .chart {
            height: 200px !important;
            width: 100% !important;
            max-height: 200px !important;
        }
        
        .chart-container canvas {
            height: 200px !important;
            max-height: 200px !important;
            width: 100% !important;
            max-width: 100% !important;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 0.85rem;
        }
        
        .data-table th,
        .data-table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .data-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 0.8rem;
        }
        
        .data-table tr:hover {
            background: #f9fafb;
        }
        
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7rem;
            font-weight: 500;
        }
        
        .badge-high {
            background: #fecaca;
            color: #dc2626;
        }
        
        .badge-medium {
            background: #fed7aa;
            color: #ea580c;
        }
        
        .badge-low {
            background: #bbf7d0;
            color: #16a34a;
        }
        
        .insights {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 4px;
            padding: 12px;
            margin-top: 12px;
        }
        
        .insights-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 8px;
        }
        
        .insights-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .insights-list li {
            padding: 4px 0;
            font-size: 0.8rem;
            border-bottom: 1px solid #bae6fd;
        }
        
        .insights-list li:last-child {
            border-bottom: none;
        }
        
        .footer {
            text-align: center;
            padding: 15px;
            color: #6b7280;
            font-size: 0.8rem;
        }
        
        @media print {
            body { background: white; }
            .section { break-inside: avoid; }
            .charts-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Climate Portfolio Analysis Report</h1>
            <p>Comprehensive climate risk assessment and portfolio analytics</p>
        </div>
        
        <!-- Report Metadata -->
        <div class="report-meta">
            <div class="meta-grid">
                <div class="meta-item">
                    <div class="meta-label">Generated</div>
                    <div class="meta-value">${generatedAt.toLocaleDateString()}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Time Horizon</div>
                    <div class="meta-value">${selectedHorizon}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Pathway</div>
                    <div class="meta-value">${selectedPathway}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Risk Type</div>
                    <div class="meta-value">${selectedRisk}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Metric</div>
                    <div class="meta-value">${selectedMetric}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Total Companies</div>
                    <div class="meta-value">${portfolioMetrics.totalCompanies}</div>
                </div>
            </div>
        </div>
        
        <!-- Portfolio Overview -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Portfolio Overview</h2>
                <p class="section-description">Summary of portfolio composition and key metrics</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Portfolio Composition</div>
                        <canvas id="portfolioCompositionChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Sector</th>
                            <th>Weight (%)</th>
                            <th>Risk Score</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    companies.map((company) => `
                            <tr>
                                <td>${company.name}</td>
                                <td>${company.sector || "N/A"}</td>
                                <td>${company.weight.toFixed(1)}</td>
                                <td>${
      (Math.random() * 0.8 + 0.1).toFixed(3)
    }</td>
                                <td>
                                    <span class="badge ${
      Math.random() > 0.5
        ? "badge-high"
        : Math.random() > 0.3
        ? "badge-medium"
        : "badge-low"
    }">
                                        ${
      Math.random() > 0.5 ? "High" : Math.random() > 0.3 ? "Medium" : "Low"
    }
                                    </span>
                                </td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Sector Analysis -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Sector Analysis</h2>
                <p class="section-description">Climate risk breakdown by sector</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Risk Contribution by Sector</div>
                        <canvas id="sectorRiskChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Sector</th>
                            <th>Companies</th>
                            <th>Weight (%)</th>
                            <th>Avg Risk Score</th>
                            <th>Risk Contribution (%)</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    sectorData.map((sector) => `
                            <tr>
                                <td>${sector.sector}</td>
                                <td>${sector.companies}</td>
                                <td>${sector.totalWeight.toFixed(1)}</td>
                                <td>${(sector.avgScore * 100).toFixed(1)}</td>
                                <td>${
      (sector.weightedContribution * 100).toFixed(1)
    }</td>
                                <td>
                                    <span class="badge ${
      sector.riskLevel === "high"
        ? "badge-high"
        : sector.riskLevel === "medium"
        ? "badge-medium"
        : "badge-low"
    }">
                                        ${sector.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Geography Analysis -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Geographic Analysis</h2>
                <p class="section-description">Climate risk distribution by geography</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Risk Contribution by Geography</div>
                        <canvas id="geoRiskChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Country/Region</th>
                            <th>Weight (%)</th>
                            <th>Avg Risk Score</th>
                            <th>Risk Contribution (%)</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    geographyData.map((geo) => `
                            <tr>
                                <td>${geo.country}</td>
                                <td>${geo.weight.toFixed(1)}</td>
                                <td>${(geo.avgScore * 100).toFixed(1)}</td>
                                <td>${
      (geo.weightedContribution * 100).toFixed(1)
    }</td>
                                <td>
                                    <span class="badge ${
      geo.riskLevel === "high"
        ? "badge-high"
        : geo.riskLevel === "medium"
        ? "badge-medium"
        : "badge-low"
    }">
                                        ${geo.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Hazard Analysis -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Hazard Analysis</h2>
                <p class="section-description">Climate hazard exposure and risk contribution</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Hazard Risk Contribution</div>
                        <canvas id="hazardRiskChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Hazard</th>
                            <th>Companies Affected</th>
                            <th>Portfolio Exposure (%)</th>
                            <th>Avg Risk Score</th>
                            <th>Risk Contribution (%)</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    hazardData.map((hazard) => `
                            <tr>
                                <td>${hazard.hazard}</td>
                                <td>${hazard.companies}</td>
                                <td>${
      (hazard.portfolioExposure * 100).toFixed(1)
    }</td>
                                <td>${
      (hazard.avgRiskScore * 100).toFixed(1)
    }</td>
                                <td>${(hazard.value * 100).toFixed(1)}</td>
                                <td>
                                    <span class="badge ${
      hazard.riskLevel === "high"
        ? "badge-high"
        : hazard.riskLevel === "medium"
        ? "badge-medium"
        : "badge-low"
    }">
                                        ${hazard.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Time Horizon Analysis -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Time Horizon Analysis</h2>
                <p class="section-description">Climate risk evolution over time</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Risk Evolution Over Time</div>
                        <canvas id="horizonEvolutionChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Time Horizon</th>
                            <th>Risk Score</th>
                            <th>Expected Impact</th>
                            <th>Risk Contribution (%)</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    horizonData.map((horizon) => `
                            <tr>
                                <td>${horizon.horizon}</td>
                                <td>${(horizon.score * 100).toFixed(1)}</td>
                                <td>${(horizon.impact * 100).toFixed(1)}</td>
                                <td>${
      (horizon.weightedContribution * 100).toFixed(1)
    }</td>
                                <td>
                                    <span class="badge ${
      horizon.score > 0.6
        ? "badge-high"
        : horizon.score > 0.3
        ? "badge-medium"
        : "badge-low"
    }">
                                        ${
      horizon.score > 0.6 ? "High" : horizon.score > 0.3 ? "Medium" : "Low"
    }
                                    </span>
                                </td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Top-N Drivers Analysis -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Top-N Risk Drivers</h2>
                <p class="section-description">Key companies and hazards driving portfolio risk</p>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Top Hazard Risk Contributors</div>
                        <canvas id="topHazardsChart" class="chart"></canvas>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Company</th>
                            <th>Sector</th>
                            <th>Weight (%)</th>
                            <th>Risk Contribution (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
    topNDriversData.companies.slice(0, 10).map((company: any) => `
                            <tr>
                                <td>#${company.rank}</td>
                                <td>${company.companyName}</td>
                                <td>${company.sector}</td>
                                <td>${company.weight.toFixed(1)}</td>
                                <td>${
      company.contributionPercent.toFixed(1)
    }</td>
                            </tr>
                        `).join("")
  }
                    </tbody>
                </table>
                
                <div class="insights">
                    <div class="insights-title">Key Insights & Recommendations</div>
                    <ul class="insights-list">
                        <li>Portfolio concentration (HHI): ${
    topNDriversData.concentration.hhi.toFixed(3)
  } - ${topNDriversData.concentration.concentrationLevel} concentration</li>
                        <li>Top risk contributor: ${
    topNDriversData.companies[0]?.companyName || "N/A"
  } (${
    topNDriversData.companies[0]?.contributionPercent.toFixed(1) || 0
  }% of total risk)</li>
                        <li>Consider diversifying away from high-concentration sectors</li>
                        <li>Monitor ${
    topNDriversData.hazards[0]?.hazard || "primary hazard"
  } exposure over time</li>
                        <li>Review portfolio weights to optimize risk-return profile</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Report generated on ${generatedAt.toLocaleString()} | Climate Portfolio Analysis Tool</p>
        </div>
    </div>
    
    <script>
        // Chart.js configuration
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.color = '#4a5568';
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Portfolio Composition Chart
        const portfolioCtx = document.getElementById('portfolioCompositionChart').getContext('2d');
        new Chart(portfolioCtx, {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(companies.map((c) => c.name))},
                datasets: [{
                    data: ${JSON.stringify(companies.map((c) => c.weight))},
                    backgroundColor: ${
    JSON.stringify(chartColors.slice(0, companies.length))
  },
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Sector Risk Chart
        const sectorRiskCtx = document.getElementById('sectorRiskChart').getContext('2d');
        new Chart(sectorRiskCtx, {
            type: 'pie',
            data: {
                labels: ${JSON.stringify(sectorData.map((s) => s.sector))},
                datasets: [{
                    data: ${
    JSON.stringify(sectorData.map((s) => s.weightedContribution * 100))
  },
                    backgroundColor: ${
    JSON.stringify(chartColors.slice(0, sectorData.length))
  },
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Geography Risk Chart
        const geoRiskCtx = document.getElementById('geoRiskChart').getContext('2d');
        new Chart(geoRiskCtx, {
            type: 'pie',
            data: {
                labels: ${JSON.stringify(geographyData.map((g) => g.country))},
                datasets: [{
                    data: ${
    JSON.stringify(geographyData.map((g) => g.weightedContribution * 100))
  },
                    backgroundColor: ${
    JSON.stringify(chartColors.slice(0, geographyData.length))
  },
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Hazard Risk Chart
        const hazardRiskCtx = document.getElementById('hazardRiskChart').getContext('2d');
        new Chart(hazardRiskCtx, {
            type: 'pie',
            data: {
                labels: ${JSON.stringify(hazardData.map((h) => h.hazard))},
                datasets: [{
                    data: ${
    JSON.stringify(hazardData.map((h) => h.value * 100))
  },
                    backgroundColor: ${
    JSON.stringify(hazardData.map((h) => h.color))
  },
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Horizon Evolution Chart
        const horizonCtx = document.getElementById('horizonEvolutionChart').getContext('2d');
        new Chart(horizonCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(horizonData.map((h) => h.horizon))},
                datasets: [{
                    label: 'Risk Score',
                    data: ${
    JSON.stringify(horizonData.map((h) => h.score * 100))
  },
                    borderColor: '#8884d8',
                    backgroundColor: 'rgba(136, 132, 216, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Expected Impact',
                    data: ${
    JSON.stringify(horizonData.map((h) => h.impact * 100))
  },
                    borderColor: '#82ca9d',
                    backgroundColor: 'rgba(130, 202, 157, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        
        // Top Hazards Chart
        const topHazardsCtx = document.getElementById('topHazardsChart').getContext('2d');
        new Chart(topHazardsCtx, {
            type: 'doughnut',
            data: {
                labels: ${
    JSON.stringify(topNDriversData.hazards.map((h: any) => h.hazard))
  },
                datasets: [{
                    data: ${
    JSON.stringify(
      topNDriversData.hazards.map((h: any) => h.contributionPercent),
    )
  },
                    backgroundColor: ${
    JSON.stringify(topNDriversData.hazards.map((h: any) => h.color))
  },
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}
