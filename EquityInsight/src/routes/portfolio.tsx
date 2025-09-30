import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "usehooks-ts";
import { PortfolioCompany } from "../components/PortfolioManager";
import { useCallback, useMemo, useState } from "react";
import { CompanySearch } from "../components/CompanySearch";
import { PortfolioManager } from "../components/PortfolioManager";
import { PortfolioAnalyticsContainer } from "../components/portfolio-views";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BarChart3, Building2 } from "lucide-react";
import type { Company } from "../client/types.gen";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  // Use useLocalStorage hooks for persistent state
  const [companies, setCompanies] = useLocalStorage<PortfolioCompany[]>(
    "portfolio-companies",
    [],
  );
  const [useEqualWeights, setUseEqualWeights] = useLocalStorage<boolean>(
    "portfolio-use-equal-weights",
    false,
  );
  const [selectedCompanyIdsArray, setSelectedCompanyIdsArray] = useLocalStorage<
    string[]
  >(
    "portfolio-selected-company-ids",
    [],
  );
  const [activeTab, setActiveTab] = useState("portfolio");

  // Convert array to Set for internal use (memoized to prevent unnecessary re-renders)
  const selectedCompanyIds = useMemo(() => new Set(selectedCompanyIdsArray), [
    selectedCompanyIdsArray,
  ]);

  // Helper functions to manage selected company IDs
  const addSelectedCompanyId = useCallback((companyId: string) => {
    setSelectedCompanyIdsArray((prev) =>
      prev.includes(companyId) ? prev : [...prev, companyId]
    );
  }, []);

  const removeSelectedCompanyId = useCallback((companyId: string) => {
    setSelectedCompanyIdsArray((prev) => prev.filter((id) => id !== companyId));
  }, []);

  const handleAddCompany = useCallback((company: Company) => {
    if (!company.id) return;

    const newCompany: PortfolioCompany = {
      ...company,
      weight: 0,
    };

    setCompanies((prev) => {
      if (prev.some((c) => c.id === company.id)) return prev;

      const updated = [...prev, newCompany];

      // If equal weights is enabled, set equal weights for all companies
      if (useEqualWeights) {
        const baseWeight = Math.floor(100 / updated.length);
        const remainder = 100 - (baseWeight * updated.length);
        return updated.map((c, index) => ({
          ...c,
          weight: Math.round((baseWeight + (index < remainder ? 1 : 0)) * 100) /
            100,
        }));
      }

      return updated;
    });

    addSelectedCompanyId(company.id!);
  }, [useEqualWeights, addSelectedCompanyId]);

  const handleRemoveCompany = useCallback((companyId: string) => {
    setCompanies((prev) => {
      const updated = prev.filter((c) => c.id !== companyId);

      // If equal weights is enabled, recalculate weights
      if (useEqualWeights && updated.length > 0) {
        const baseWeight = Math.floor(100 / updated.length);
        const remainder = 100 - (baseWeight * updated.length);
        return updated.map((c, index) => ({
          ...c,
          weight: Math.round((baseWeight + (index < remainder ? 1 : 0)) * 100) /
            100,
        }));
      }

      return updated;
    });

    removeSelectedCompanyId(companyId);
  }, [useEqualWeights, removeSelectedCompanyId]);

  const handleUpdateWeight = useCallback(
    (companyId: string, weight: number) => {
      setCompanies((prev) =>
        prev.map((c) => c.id === companyId ? { ...c, weight } : c)
      );
    },
    [],
  );

  const handleNormalizeWeights = useCallback(() => {
    setCompanies((prev) => {
      const totalWeight = prev.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight === 0) return prev;

      return prev.map((c) => ({
        ...c,
        weight: (c.weight / totalWeight) * 100,
      }));
    });
  }, []);

  const handleToggleEqualWeights = useCallback(() => {
    const newUseEqualWeights = !useEqualWeights;
    setUseEqualWeights(newUseEqualWeights);

    if (newUseEqualWeights && companies.length > 0) {
      // Set equal weights for all companies
      const baseWeight = Math.floor(100 / companies.length);
      const remainder = 100 - (baseWeight * companies.length);
      setCompanies((prev) =>
        prev.map((c, index) => ({
          ...c,
          weight: Math.round((baseWeight + (index < remainder ? 1 : 0)) * 100) /
            100,
        }))
      );
    }
  }, [useEqualWeights, companies.length]);

  const handleImportPortfolio = useCallback((data: {
    companies: PortfolioCompany[];
    useEqualWeights: boolean;
    selectedCompanyIds: string[];
  }) => {
    setCompanies(data.companies);
    setUseEqualWeights(data.useEqualWeights);
    setSelectedCompanyIdsArray(data.selectedCompanyIds);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground">
            Climate Portfolio Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Search and add companies to build your climate-focused investment
            portfolio
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 min-h-0">
        <div className="max-w-7xl mx-auto h-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 flex-shrink-0">
              <TabsTrigger
                value="portfolio"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Portfolio Management
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Climate Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="flex-1 min-h-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                {/* Search Column */}
                <div className="flex flex-col min-h-0">
                  <div className="bg-card rounded-lg shadow-sm border flex flex-col h-full">
                    <div className="px-6 py-4 border-b flex-shrink-0">
                      <h2 className="text-xl font-semibold text-foreground">
                        Search Companies
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Find companies to add to your portfolio
                      </p>
                    </div>
                    <div className="flex-1 p-6 overflow-auto">
                      <CompanySearch
                        onAddCompany={handleAddCompany}
                        selectedCompanyIds={selectedCompanyIds}
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio Column */}
                <div className="flex flex-col min-h-0">
                  <div className="bg-card rounded-lg shadow-sm border flex flex-col h-full">
                    <div className="px-6 py-4 border-b flex-shrink-0">
                      <h2 className="text-xl font-semibold text-foreground">
                        Portfolio
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your selected companies and weights
                      </p>
                    </div>
                    <div className="flex-1 p-6 overflow-auto">
                      <PortfolioManager
                        companies={companies}
                        onRemoveCompany={handleRemoveCompany}
                        onUpdateWeight={handleUpdateWeight}
                        onToggleEqualWeights={handleToggleEqualWeights}
                        useEqualWeights={useEqualWeights}
                        selectedCompanyIds={selectedCompanyIdsArray}
                        onImportPortfolio={handleImportPortfolio}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 min-h-0">
              <div className="h-full overflow-auto">
                <PortfolioAnalyticsContainer
                  companies={companies}
                  onUpdateWeight={handleUpdateWeight}
                  onNormalizeWeights={handleNormalizeWeights}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
