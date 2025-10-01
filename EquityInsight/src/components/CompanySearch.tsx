import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Company } from "../client/types.gen";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Building2, Check, Loader2, Plus, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { getV3CompanySearch } from "@/client/sdk.gen";
import { z } from "zod";

interface CompanySearchProps {
  onAddCompany: (company: Company) => void;
  selectedCompanyIds: Set<string>;
}

export const searchCompanies = createServerFn({
  method: "GET",
}).inputValidator(z.object({
  query: z.string().optional(),
  limit: z.number().optional(),
  isin_code: z.string().optional(),
  sector: z.string().optional(),
  stock_ticker: z.string().optional(),
  method: z.enum(["fuzzy", "strict"]).optional(),
})).handler(
  async (
    { data },
  ) => {
    const result = await getV3CompanySearch({
      query: {
        name: data.query,
        limit: data.limit || 20,
        isin_code: data.isin_code || undefined,
        sector: data.sector || undefined,
        stock_ticker: data.stock_ticker || undefined,
        method: data.method || "fuzzy",
      },
    });
    return result.data || { results: [] };
  },
);

export function CompanySearch({
  onAddCompany,
  selectedCompanyIds,
}: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "name" | "stock_ticker" | "isin_code" | "sector"
  >("name");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setAllCompanies([]); // Reset companies when search term changes
      setHasMore(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error,
  } = useQuery(
    {
      queryKey: ["searchCompanies", debouncedSearchTerm, searchType],
      queryFn: () =>
        searchCompanies({
          data: {
            query: searchType === "name" ? debouncedSearchTerm : undefined,
            limit: 20,
            isin_code: searchType === "isin_code"
              ? debouncedSearchTerm
              : undefined,
            sector: searchType === "sector" ? debouncedSearchTerm : undefined,
            stock_ticker: searchType === "stock_ticker"
              ? debouncedSearchTerm
              : undefined,
            method: "fuzzy",
          },
        }),
      enabled: debouncedSearchTerm.length >= 2,
    },
  );

  // Update allCompanies when data changes
  useEffect(() => {
    if (data?.results) {
      setAllCompanies(data.results);
      setHasMore(data.results.length === 20); // Assume more if we got full page
    } else if (data && !data.results) {
      // Handle case where API returns data but no results array
      setAllCompanies([]);
      setHasMore(false);
    }
  }, [data]);

  const lastCompanyElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isLoadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          // For now, we'll just show a message that infinite scroll isn't fully implemented
          // since the API doesn't support proper pagination
          setIsLoadingMore(true);
          setTimeout(() => {
            setIsLoadingMore(false);
            setHasMore(false);
          }, 1000);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMore],
  );

  const handleAddCompany = (company: Company) => {
    if (company.id && !selectedCompanyIds.has(company.id)) {
      onAddCompany(company);
    }
  };

  const formatCompanyInfo = (company: Company) => {
    const info = [];
    if (company.stock_tickers?.length) {
      info.push(`Ticker: ${company.stock_tickers.join(", ")}`);
    }
    if (company.isin_codes?.length) {
      info.push(`ISIN: ${company.isin_codes.join(", ")}`);
    }
    if (company.sector) {
      info.push(`Sector: ${company.sector}`);
    }
    return info;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Controls */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search by ${searchType.replace("_", " ")}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) =>
            setSearchType(
              e.target.value as
                | "name"
                | "stock_ticker"
                | "isin_code"
                | "sector",
            )}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="name">Name</option>
          <option value="stock_ticker">Stock Ticker</option>
          <option value="isin_code">ISIN Code</option>
          <option value="sector">Sector</option>
        </select>
      </div>

      {/* Search Results */}
      <div className="flex-1 flex flex-col overflow-auto">
        {isLoading && debouncedSearchTerm && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-muted-foreground mt-2">
                Searching companies by {searchType.replace("_", " ")}...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-500">
              Error loading companies. Please try again.
            </div>
          </div>
        )}

        {!isLoading && debouncedSearchTerm && allCompanies.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No companies found for "{debouncedSearchTerm}"</p>
              <p className="text-sm">
                Try a different search term or change the search type to{" "}
                {searchType.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {allCompanies.length > 0 && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {allCompanies.map((company: Company, index: number) => {
                const isSelected = company.id
                  ? selectedCompanyIds.has(company.id)
                  : false;
                const isLast = index === allCompanies.length - 1;

                return (
                  <Card
                    key={company.id || index}
                    ref={isLast ? lastCompanyElementRef : null}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      isSelected &&
                        "ring-2 ring-green-500 bg-green-50 border-green-200",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">
                              {company.name || "Unknown Company"}
                            </h3>
                            {isSelected && (
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {company.sector && (
                              <Badge variant="secondary" className="text-xs">
                                {company.sector}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            {formatCompanyInfo(company).map((info, idx) => (
                              <p key={idx} className="truncate">{info}</p>
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleAddCompany(company)}
                          disabled={isSelected}
                          className="ml-4 flex-shrink-0"
                        >
                          {isSelected
                            ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                <span className="text-green-600">Added</span>
                              </>
                            )
                            : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {isLoadingMore && (
                <div className="text-center py-4">
                  {
                    /* <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto">
                  </div> */
                  }
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading more companies...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!debouncedSearchTerm && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Search for companies to add to your portfolio</p>
              <p className="text-sm">
                Enter at least 2 characters to start searching by{" "}
                {searchType.replace("_", " ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
