import type { Company } from "../client/types.gen";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import {
  Building2,
  ChevronDown,
  Download,
  FileText,
  Percent,
  Table,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  exportPortfolio,
  exportPortfolioCSV,
  importPortfolio,
  importPortfolioCSV,
} from "../lib/portfolio-utils";
import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface PortfolioCompany extends Company {
  weight: number;
}

interface PortfolioManagerProps {
  companies: PortfolioCompany[];
  onRemoveCompany: (companyId: string) => void;
  onUpdateWeight: (companyId: string, weight: number) => void;
  onToggleEqualWeights: () => void;
  useEqualWeights: boolean;
  selectedCompanyIds: string[];
  onImportPortfolio?: (data: {
    companies: PortfolioCompany[];
    useEqualWeights: boolean;
    selectedCompanyIds: string[];
  }) => void;
}

export function PortfolioManager({
  companies,
  onRemoveCompany,
  onUpdateWeight,
  onToggleEqualWeights,
  useEqualWeights,
  selectedCompanyIds,
  onImportPortfolio,
}: PortfolioManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const totalWeight = companies.reduce(
    (sum, company) => sum + company.weight,
    0,
  );
  const equalWeight = companies.length > 0
    ? Math.floor(100 / companies.length)
    : 0;

  const handleWeightChange = (companyId: string, value: string) => {
    const weight = Math.max(0, Math.min(100, parseFloat(value) || 0));
    // Round to 2 decimal places for 0.01% precision
    onUpdateWeight(companyId, Math.round(weight * 100) / 100);
  };

  const normalizeWeights = () => {
    if (totalWeight === 0) return;

    companies.forEach((company) => {
      const normalizedWeight = (company.weight / totalWeight) * 100;
      // Round to 2 decimal places for 0.01% precision
      onUpdateWeight(company.id!, Math.round(normalizedWeight * 100) / 100);
    });
  };

  const setEqualWeights = () => {
    if (companies.length === 0) return;

    // Calculate base weight and remainder to ensure exact 100% total
    const baseWeight = Math.floor(100 / companies.length);
    const remainder = 100 - (baseWeight * companies.length);

    companies.forEach((company, index) => {
      // Give the remainder to the first few companies
      const weight = baseWeight + (index < remainder ? 1 : 0);
      // Round to 2 decimal places for 0.01% precision
      onUpdateWeight(company.id!, Math.round(weight * 100) / 100);
    });
  };

  const handleExportPortfolio = () => {
    const portfolioName = `Portfolio_${new Date().toISOString().split("T")[0]}`;
    exportPortfolio(
      companies,
      useEqualWeights,
      selectedCompanyIds,
      portfolioName,
    );
  };

  const handleExportPortfolioCSV = () => {
    const portfolioName = `Portfolio_${new Date().toISOString().split("T")[0]}`;
    exportPortfolioCSV(companies, portfolioName);
  };

  const handleImportPortfolio = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      // Determine file type and use appropriate import function
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      const result = isCSV
        ? await importPortfolioCSV(file)
        : await importPortfolio(file);

      if (result.success && result.data && onImportPortfolio) {
        onImportPortfolio({
          companies: result.data.companies,
          useEqualWeights: result.data.useEqualWeights,
          selectedCompanyIds: result.data.selectedCompanyIds,
        });
      } else {
        setImportError(result.error || "Failed to import portfolio");
      }
    } catch (error) {
      setImportError("An unexpected error occurred during import");
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const formatCompanyInfo = (company: Company) => {
    const info = [];
    if (company.stock_tickers?.length) {
      info.push(company.stock_tickers.join(", "));
    }
    if (company.isin_codes?.length) {
      info.push(`ISIN: ${company.isin_codes[0]}`);
    }
    return info.join(" • ");
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <span className="font-semibold text-foreground">
            Portfolio ({companies.length} companies)
          </span>
        </div>
        {companies.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="equal-weights" className="text-sm">
              Equal Weights
            </Label>
            <Switch
              id="equal-weights"
              checked={useEqualWeights}
              onCheckedChange={onToggleEqualWeights}
            />
          </div>
        )}
      </div>

      {/* Export/Import Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={companies.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Portfolio
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleExportPortfolio}>
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPortfolioCSV}>
                <Table className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? "Importing..." : "Import Portfolio"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleImportPortfolio}
          className="hidden"
        />
      </div>

      {/* Import Error */}
      {importError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
          <p className="text-sm text-red-800">
            <strong>Import Error:</strong> {importError}
          </p>
        </div>
      )}

      {/* Content */}
      {companies.length === 0
        ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No companies in portfolio</p>
              <p className="text-sm">Search and add companies to get started</p>
            </div>
          </div>
        )
        : (
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Weight Controls */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium pr-2">Total Weight:</span>
                  <span
                    className={cn(
                      "font-mono",
                      Math.abs(totalWeight - 100) <= 0.01
                        ? "text-green-600"
                        : "text-red-600",
                    )}
                  >
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
                {Math.abs(totalWeight - 100) > 0.01 && (
                  <Badge variant="outline" className="text-xs">
                    {totalWeight < 100 ? "Underweight" : "Overweight"}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={normalizeWeights}
                  disabled={totalWeight === 0}
                >
                  Normalize
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={setEqualWeights}
                >
                  Set Equal
                </Button>
              </div>
            </div>

            {/* Company List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3 pr-2">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {company.name || "Unknown Company"}
                        </h4>
                        {company.sector && (
                          <Badge variant="secondary" className="text-xs">
                            {company.sector}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {formatCompanyInfo(company)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!useEqualWeights && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={company.weight.toFixed(1)}
                            onChange={(e) =>
                              handleWeightChange(company.id!, e.target.value)}
                            className="w-20 text-center"
                          />
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveCompany(company.id!)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equal Weights Info */}
            {useEqualWeights && (
              <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                <p className="text-sm text-blue-800">
                  <strong>Equal Weights Mode:</strong> Companies have weights of
                  {" "}
                  {equalWeight.toFixed(1)}% each, with the first{" "}
                  {100 - (equalWeight * companies.length)}{" "}
                  companies getting 1% extra to total exactly 100.0%
                </p>
              </div>
            )}

            {/* Weight Distribution Warning */}
            {!useEqualWeights && Math.abs(totalWeight - 100) > 0.01 && (
              <div className="p-3 bg-yellow-50 rounded-lg flex-shrink-0">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong>{" "}
                  Portfolio weights must sum to 100.0%. Current total:{" "}
                  {totalWeight.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
