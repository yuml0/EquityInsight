import { z } from 'zod'
import { tool } from 'ai'
import { createClient, createConfig } from '../client/client'
import type { ClientOptions } from '../client/types.gen'
import {
  getV3Companies,
  getV3CompaniesId,
  getV3CompanySearch,
  getV3CompaniesCompanyIdAssets,
  getV3CompaniesCompanyIdClimateScores,
  getV3CompaniesCompanyIdClimateImpacts,
  getV3CompaniesCompanyIdAssetsClimateScores,
  getV3CompaniesCompanyIdAssetsClimateImpacts,
  getV3CompaniesCompanyIdAssetsAggregation,
  getV3CompaniesCompanyIdAssetsLocations,
  getV3CompaniesCompanyIdGeoClusters,
  getV3Assets,
  getV3AssetsAssetId,
  getV3AssetsSearch,
  getV3AssetsAssetIdClimateScores,
  getV3MarketsIndexes,
  getV3MarketsIndexesIndexId,
  getV3MarketsIndexesIndexIdCompanies,
  getV3MarketsIndexesIndexIdAssets,
  getV3MarketsIndexesIndexIdClimateScores,
  getV3MarketsIndexesIndexIdClimateImpacts,
  getV3MarketsIndexesIndexIdCompaniesClimateScores,
  getV3MarketsIndexesIndexIdCompaniesClimateImpacts,
  getV3MarketsIndexesIndexIdAssetsClimateScores,
  getV3MarketsIndexesIndexIdAssetsClimateImpacts,
  getV3MarketsIndexesIndexIdAssetsAggregation,
  getV3MarketsIndexesIndexIdCompaniesAggregation,
  getV3MarketsIndexesIndexIdGeoClusters,
  getV3MarketsIndexesSearch,
  getV3MarketsGroups,
  getV3MarketsGroupsGroupId,
  getV3MarketsGroupsSearch
} from '../client/sdk.gen'

// Create a server-side client with the correct base URL
const serverClient = createClient(createConfig<ClientOptions>({
  baseUrl: import.meta.env.VITE_RISKTHINKING_API_BASE_URL || 'https://api.riskthinking.ai',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_RISKTHINKING_API_KEY}`
  }
}))

// AI SDK v5 tool definitions
export const tools = {
  // Current portfolio tools

  getCurrentPortfolio: tool({
    description: 'Get the current portfolio',
    inputSchema: z.object({}),
  }),

  getCurrentViewsData: tool({
    description: 'Get current analytics views data including portfolio, filters, settings, and available options',
    inputSchema: z.object({}),
  }),

  // Company tools
  searchCompanies: tool({
    description: 'Search for companies by name or identification codes',
    inputSchema: z.object({
      query: z.string().optional().describe('Search query for company name or identification codes'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      isin_code: z.string().optional().describe('ISIN code to search for'),
      sector: z.string().optional().describe('GICS sector to search for'),
      stock_ticker: z.string().optional().describe('Stock ticker to search for'),
      method: z.enum(['fuzzy', 'strict']).optional().describe('Search method')
    }),
    execute: async ({ query, limit, isin_code, sector, stock_ticker, method }: {
      query?: string;
      limit?: number;
      isin_code?: string;
      sector?: string;
      stock_ticker?: string;
      method?: 'fuzzy' | 'strict';
    }) => {
      try {
        const result = await getV3CompanySearch({
          client: serverClient,
          query: {
            name: query,
            limit,
            isin_code,
            sector,
            stock_ticker,
            method
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error searching companies:', error)
        return { results: [], error: 'Failed to search companies' }
      }
    }
  }),

  getCompany: tool({
    description: 'Get detailed information about a specific company by ID',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company')
    }),
    execute: async ({ companyId }: { companyId: string }) => {
      try {
        const result = await getV3CompaniesId({
          client: serverClient,
          path: { company_id: companyId }
        })
        return result.data || null
      } catch (error) {
        console.error('Error getting company:', error)
        return null
      }
    }
  }),

  listCompanies: tool({
    description: 'List all companies with optional filtering',
    inputSchema: z.object({
      scope: z.enum(['public', 'organization']).optional().describe('Filter companies by scope'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ scope, limit, cursor }: { scope?: 'public' | 'organization'; limit?: number; cursor?: string }) => {
      try {
        const result = await getV3Companies({
          client: serverClient,
          query: { scope, limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error listing companies:', error)
        return { results: [], error: 'Failed to list companies' }
      }
    }
  }),

  // Company asset tools
  getCompanyAssets: tool({
    description: 'Get all assets owned by a specific company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      assetType: z.string().optional().describe('Filter by asset type'),
      sort_by: z.enum(['asset_type', 'country', 'state', 'address', 'city', 'latitude', 'longitude']).optional().describe('Sort by field'),
      sort_direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction')
    }),
    execute: async ({ companyId, limit, cursor, country, state, assetType, sort_by, sort_direction }: {
      companyId: string;
      limit?: number;
      cursor?: string;
      country?: string;
      state?: string;
      assetType?: string;
      sort_by?: 'asset_type' | 'country' | 'state' | 'address' | 'city' | 'latitude' | 'longitude';
      sort_direction?: 'ascending' | 'descending';
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdAssets({
          client: serverClient,
          path: { company_id: companyId },
          query: { limit, cursor, country, state, asset_type: assetType, sort_by, sort_direction }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company assets:', error)
        return { results: [], error: 'Failed to get company assets' }
      }
    }
  }),

  getCompanyAssetLocations: tool({
    description: 'Get physical asset locations for a company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      asset_function: z.string().optional().describe('Filter by asset function'),
      asset_category: z.string().optional().describe('Filter by asset category'),
      bbox: z.string().optional().describe('Bounding box filter (min_longitude,min_latitude,max_longitude,max_latitude)')
    }),
    execute: async ({ companyId, country, state, asset_type, asset_function, asset_category, bbox }: {
      companyId: string;
      country?: string;
      state?: string;
      asset_type?: string;
      asset_function?: string;
      asset_category?: string;
      bbox?: string;
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdAssetsLocations({
          client: serverClient,
          path: { company_id: companyId },
          query: { country, state, asset_type, asset_function, asset_category, bbox }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company asset locations:', error)
        return { results: [], error: 'Failed to get company asset locations' }
      }
    }
  }),

  getCompanyGeoClusters: tool({
    description: 'Get geo clusters for company assets at a specific zoom level',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      zoom: z.number().min(0).max(22).describe('Zoom level for clustering (0-22)'),
      bbox: z.string().optional().describe('Bounding box filter (min_longitude,min_latitude,max_longitude,max_latitude)'),
      country: z.string().optional().describe('Filter by country code'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      radius: z.string().optional().describe('Cluster radius')
    }),
    execute: async ({ companyId, zoom, bbox, country, asset_type, radius }: {
      companyId: string;
      zoom: number;
      bbox?: string;
      country?: string;
      asset_type?: string;
      radius?: string;
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdGeoClusters({
          client: serverClient,
          path: { company_id: companyId },
          query: { zoom, bbox, country, asset_type, radius }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company geo clusters:', error)
        return { results: [], error: 'Failed to get company geo clusters' }
      }
    }
  }),

  // Company climate data tools
  getCompanyClimateScores: tool({
    description: 'Get multifactor climate risk scores for a company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type')
    }),
    execute: async ({ companyId, metric, horizon, pathway, risk, country, state, asset_type }: {
      companyId: string;
      metric?: string;
      horizon?: number;
      pathway?: string;
      risk?: 'physical' | 'transition';
      country?: string;
      state?: string;
      asset_type?: string;
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdClimateScores({
          client: serverClient,
          path: { company_id: companyId },
          query: {
            horizon,
            pathway: pathway || "ssp245",
            risk,
            metric,
            country,
            state,
            asset_type
          }
        })
        console.log("result", result);
        return result.data || null
      } catch (error) {
        console.error('Error getting company climate scores:', error)
        return null
      }
    }
  }),

  getCompanyClimateImpacts: tool({
    description: 'Get single-factor climate risk impacts for a company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type')
    }),
    execute: async ({ companyId, metric, horizon, pathway, risk, country, state, asset_type }: {
      companyId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdClimateImpacts({
          client: serverClient,
          path: { company_id: companyId },
          query: {
            horizon,
            pathway: pathway || "ssp245",
            risk,
            metric,
            country,
            state,
            asset_type
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company climate impacts:', error)
        return { results: [], error: 'Failed to get company climate impacts' }
      }
    }
  }),

  getCompanyAssetsClimateScores: tool({
    description: 'Get climate risk scores for all assets owned by a company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      min_risk: z.number().optional().describe('Minimum risk range'),
      max_risk: z.number().optional().describe('Maximum risk range'),
      sort_by: z.enum(['id', 'asset_type', 'country', 'state', 'downside_likelihood', 'expected_impact', 'cvar_99', 'cvar_95', 'cvar_50', 'var_50', 'var_95', 'var_99']).optional().describe('Sort by field'),
      sort_direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ companyId, metric, horizon, risk, pathway, country, state, asset_type, min_risk, max_risk, sort_by, sort_direction, limit, cursor }: {
      companyId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
      min_risk?: number;
      max_risk?: number;
      sort_by?: 'id' | 'asset_type' | 'country' | 'state' | 'downside_likelihood' | 'expected_impact' | 'cvar_99' | 'cvar_95' | 'cvar_50' | 'var_50' | 'var_95' | 'var_99';
      sort_direction?: 'ascending' | 'descending';
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdAssetsClimateScores({
          client: serverClient,
          path: { company_id: companyId },
          query: {
            metric,
            horizon,
            risk,
            pathway: pathway || "ssp245",
            country,
            state,
            asset_type,
            min_risk,
            max_risk,
            sort_by,
            sort_direction,
            limit,
            cursor
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company assets climate scores:', error)
        return { results: [], error: 'Failed to get company assets climate scores' }
      }
    }
  }),

  getCompanyAssetsClimateImpacts: tool({
    description: 'Get climate risk impacts for all assets owned by a company',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      sort_by: z.enum(['id', 'asset_type', 'country', 'state']).optional().describe('Sort by field'),
      sort_direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ companyId, metric, horizon, risk, pathway, country, state, asset_type, sort_by, sort_direction, limit, cursor }: {
      companyId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
      sort_by?: 'id' | 'asset_type' | 'country' | 'state';
      sort_direction?: 'ascending' | 'descending';
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdAssetsClimateImpacts({
          client: serverClient,
          path: { company_id: companyId },
          query: {
            metric,
            horizon,
            risk,
            pathway: pathway || "ssp245",
            country,
            state,
            asset_type,
            sort_by,
            sort_direction,
            limit,
            cursor
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company assets climate impacts:', error)
        return { results: [], error: 'Failed to get company assets climate impacts' }
      }
    }
  }),

  getCompanyAssetsAggregation: tool({
    description: 'Get aggregated asset data for a company by property',
    inputSchema: z.object({
      companyId: z.string().describe('The unique identifier of the company'),
      groupBy: z.enum(['country', 'asset_type', 'state']).describe('Property to group assets by'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ companyId, groupBy }: {
      companyId: string;
      groupBy: "country" | "state" | "asset_type";
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3CompaniesCompanyIdAssetsAggregation({
          client: serverClient,
          path: { company_id: companyId },
          query: { by: groupBy }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting company assets aggregation:', error)
        return { results: [], error: 'Failed to get company assets aggregation' }
      }
    }
  }),

  // Asset tools
  searchAssets: tool({
    description: 'Search for physical assets',
    inputSchema: z.object({
      query: z.string().optional().describe('Search query for assets'),
      scope: z.enum(['public', 'organization', 'company']).optional().describe('Search scope'),
      company_id: z.string().optional().describe('Company ID when scope is company')
    }),
    execute: async ({ query, scope, company_id }: {
      query?: string;
      scope?: 'public' | 'organization' | 'company';
      company_id?: string;
    }) => {
      try {
        const result = await getV3AssetsSearch({
          client: serverClient,
          query: {
            query,
            scope,
            company_id
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error searching assets:', error)
        return { results: [], error: 'Failed to search assets' }
      }
    }
  }),

  getAsset: tool({
    description: 'Get detailed information about a specific asset by ID',
    inputSchema: z.object({
      assetId: z.string().describe('The unique identifier of the asset')
    }),
    execute: async ({ assetId }: { assetId: string }) => {
      try {
        const result = await getV3AssetsAssetId({
          client: serverClient,
          path: { asset_id: assetId }
        })
        return result.data || null
      } catch (error) {
        console.error('Error getting asset:', error)
        return null
      }
    }
  }),

  listAssets: tool({
    description: 'List all assets with optional filtering',
    inputSchema: z.object({
      country: z.string().optional().describe('Filter by country code'),
      assetType: z.string().optional().describe('Filter by asset type'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ country, assetType, limit, cursor }: {
      country?: string;
      assetType?: string;
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3Assets({
          client: serverClient,
          query: { country, asset_type: assetType, limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error listing assets:', error)
        return { results: [], error: 'Failed to list assets' }
      }
    }
  }),

  getAssetClimateScores: tool({
    description: 'Get climate risk scores for a specific asset',
    inputSchema: z.object({
      assetId: z.string().describe('The unique identifier of the asset'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      pathway: z.string().optional().describe('Climate pathway'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk')
    }),
    execute: async ({ assetId, metric, horizon, pathway, risk }: {
      assetId: string;
      metric?: string;
      horizon?: number;
      pathway?: string;
      risk?: 'physical' | 'transition';
    }) => {
      try {
        const result = await getV3AssetsAssetIdClimateScores({
          client: serverClient,
          path: { asset_id: assetId },
          query: { metric, horizon, pathway: pathway || "ssp245", risk }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting asset climate scores:', error)
        return { results: [], error: 'Failed to get asset climate scores' }
      }
    }
  }),

  // Market index tools
  searchMarketIndexes: tool({
    description: 'Search for market indexes by name',
    inputSchema: z.object({
      query: z.string().describe('Search query for market index name'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ query, limit }: { query: string; limit?: number; cursor?: string }) => {
      try {
        const result = await getV3MarketsIndexesSearch({
          client: serverClient,
          query: { name: query, limit }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error searching market indexes:', error)
        return { results: [], error: 'Failed to search market indexes' }
      }
    }
  }),

  getMarketIndex: tool({
    description: 'Get detailed information about a specific market index by ID',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index')
    }),
    execute: async ({ indexId }: { indexId: string }) => {
      try {
        const result = await getV3MarketsIndexesIndexId({
          client: serverClient,
          path: { index_id: indexId }
        })
        return result.data || null
      } catch (error) {
        console.error('Error getting market index:', error)
        return null
      }
    }
  }),

  listMarketIndexes: tool({
    description: 'List all market indexes with optional filtering',
    inputSchema: z.object({
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ limit, cursor }: { limit?: number; cursor?: string }) => {
      try {
        const result = await getV3MarketsIndexes({
          client: serverClient,
          query: { limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error listing market indexes:', error)
        return { results: [], error: 'Failed to list market indexes' }
      }
    }
  }),

  getMarketIndexCompanies: tool({
    description: 'Get all companies in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, limit, cursor }: {
      indexId: string;
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdCompanies({
          client: serverClient,
          path: { index_id: indexId },
          query: { limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index companies:', error)
        return { results: [], error: 'Failed to get market index companies' }
      }
    }
  }),

  getMarketIndexAssets: tool({
    description: 'Get all assets owned by companies in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      assetType: z.string().optional().describe('Filter by asset type'),
      sector: z.string().optional().describe('Filter by GICS sector'),
      sort_by: z.enum(['asset_type', 'country', 'state']).optional().describe('Sort by field'),
      sort_direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction')
    }),
    execute: async ({ indexId, limit, cursor, country, state, assetType, sector, sort_by, sort_direction }: {
      indexId: string;
      limit?: number;
      cursor?: string;
      country?: string;
      state?: string;
      assetType?: string;
      sector?: string;
      sort_by?: 'asset_type' | 'country' | 'state';
      sort_direction?: 'ascending' | 'descending';
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdAssets({
          client: serverClient,
          path: { index_id: indexId },
          query: { limit, cursor, country, state, asset_type: assetType, sector, sort_by, sort_direction }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index assets:', error)
        return { results: [], error: 'Failed to get market index assets' }
      }
    }
  }),

  getMarketIndexClimateScores: tool({
    description: 'Get aggregate climate risk scores for a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      sector: z.string().optional().describe('Filter by GICS sector')
    }),
    execute: async ({ indexId, metric, horizon, risk, pathway, country, state, asset_type, sector }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
      sector?: string;
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdClimateScores({
          client: serverClient,
          path: { index_id: indexId },
          query: { metric, horizon, risk, pathway: pathway || "ssp245", country, state, asset_type, sector }
        })
        return result.data || null
      } catch (error) {
        console.error('Error getting market index climate scores:', error)
        return null
      }
    }
  }),

  getMarketIndexClimateImpacts: tool({
    description: 'Get aggregate climate risk impacts for a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      sector: z.string().optional().describe('Filter by GICS sector')
    }),
    execute: async ({ indexId, metric, horizon, risk, pathway, country, state, asset_type, sector }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
      sector?: string;
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdClimateImpacts({
          client: serverClient,
          path: { index_id: indexId },
          query: { metric, horizon, risk, pathway: pathway || "ssp245", country, state, asset_type, sector }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index climate impacts:', error)
        return { results: [], error: 'Failed to get market index climate impacts' }
      }
    }
  }),

  getMarketIndexCompaniesClimateScores: tool({
    description: 'Get climate risk scores for all companies in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      risk: z.enum(['physical', 'transition']).optional().describe('Climate risk'),
      pathway: z.string().optional().describe('Climate pathway'),
      country: z.string().optional().describe('Filter by country code'),
      state: z.string().optional().describe('Filter by state/region'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      sector: z.string().optional().describe('Filter by GICS sector'),
      min_risk: z.number().optional().describe('Minimum risk range'),
      max_risk: z.number().optional().describe('Maximum risk range'),
      sort_by: z.enum(['id', 'asset_count', 'sector', 'company_name', 'downside_likelihood', 'expected_impact', 'cvar_99', 'cvar_95', 'cvar_50', 'var_50', 'var_95', 'var_99']).optional().describe('Sort by field'),
      sort_direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, metric, horizon, risk, pathway, country, state, asset_type, sector, min_risk, max_risk, sort_by, sort_direction, limit, cursor }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      risk?: 'physical' | 'transition';
      pathway?: string;
      country?: string;
      state?: string;
      asset_type?: string;
      sector?: string;
      min_risk?: number;
      max_risk?: number;
      sort_by?: 'id' | 'asset_count' | 'sector' | 'company_name' | 'downside_likelihood' | 'expected_impact' | 'cvar_99' | 'cvar_95' | 'cvar_50' | 'var_50' | 'var_95' | 'var_99';
      sort_direction?: 'ascending' | 'descending';
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdCompaniesClimateScores({
          client: serverClient,
          path: { index_id: indexId },
          query: {
            metric,
            horizon,
            risk,
            pathway: pathway || "ssp245",
            country,
            state,
            asset_type,
            sector,
            min_risk,
            max_risk,
            sort_by,
            sort_direction,
            limit,
            cursor
          }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index companies climate scores:', error)
        return { results: [], error: 'Failed to get market index companies climate scores' }
      }
    }
  }),

  getMarketIndexCompaniesClimateImpacts: tool({
    description: 'Get climate risk impacts for all companies in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      scenario: z.string().optional().describe('Climate scenario'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, metric, horizon, limit, cursor }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      scenario?: string;
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdCompaniesClimateImpacts({
          client: serverClient,
          path: { index_id: indexId },
          query: { metric, horizon, limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index companies climate impacts:', error)
        return { results: [], error: 'Failed to get market index companies climate impacts' }
      }
    }
  }),

  getMarketIndexAssetsClimateScores: tool({
    description: 'Get climate risk scores for all assets in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      scenario: z.string().optional().describe('Climate scenario'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, metric, horizon, limit, cursor }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      scenario?: string;
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdAssetsClimateScores({
          client: serverClient,
          path: { index_id: indexId },
          query: { metric, horizon, limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index assets climate scores:', error)
        return { results: [], error: 'Failed to get market index assets climate scores' }
      }
    }
  }),

  getMarketIndexAssetsClimateImpacts: tool({
    description: 'Get climate risk impacts for all assets in a market index',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      metric: z.string().optional().describe('Specific metric to retrieve'),
      horizon: z.number().optional().describe('Time horizon for analysis'),
      scenario: z.string().optional().describe('Climate scenario'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, metric, horizon, limit, cursor }: {
      indexId: string;
      metric?: string;
      horizon?: number;
      scenario?: string;
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdAssetsClimateImpacts({
          client: serverClient,
          path: { index_id: indexId },
          query: { metric, horizon, limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index assets climate impacts:', error)
        return { results: [], error: 'Failed to get market index assets climate impacts' }
      }
    }
  }),

  getMarketIndexAssetsAggregation: tool({
    description: 'Get aggregated asset data for a market index by property',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      groupBy: z.enum(["country", "asset_type", "sector"]).describe('Property to group assets by'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, groupBy }: {
      indexId: string;
      groupBy: 'country' | 'asset_type' | 'sector';
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdAssetsAggregation({
          client: serverClient,
          path: { index_id: indexId },
          query: { by: groupBy }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index assets aggregation:', error)
        return { results: [], error: 'Failed to get market index assets aggregation' }
      }
    }
  }),

  getMarketIndexCompaniesAggregation: tool({
    description: 'Get aggregated company data for a market index by property',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      groupBy: z.enum(['sector']).describe('Property to group companies by'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ indexId, groupBy }: {
      indexId: string;
      groupBy: 'sector';
      limit?: number;
      cursor?: string
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdCompaniesAggregation({
          client: serverClient,
          path: { index_id: indexId },
          query: { by: groupBy }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index companies aggregation:', error)
        return { results: [], error: 'Failed to get market index companies aggregation' }
      }
    }
  }),

  getMarketIndexGeoClusters: tool({
    description: 'Get geo clusters for market index assets at a specific zoom level',
    inputSchema: z.object({
      indexId: z.string().describe('The unique identifier of the market index'),
      zoom: z.number().min(0).max(22).describe('Zoom level for clustering (0-22)'),
      bbox: z.string().optional().describe('Bounding box filter (min_longitude,min_latitude,max_longitude,max_latitude)'),
      country: z.string().optional().describe('Filter by country code'),
      asset_type: z.string().optional().describe('Filter by asset type'),
      radius: z.string().optional().describe('Cluster radius')
    }),
    execute: async ({ indexId, zoom, bbox, country, asset_type, radius }: {
      indexId: string;
      zoom: number;
      bbox?: string;
      country?: string;
      asset_type?: string;
      radius?: string;
    }) => {
      try {
        const result = await getV3MarketsIndexesIndexIdGeoClusters({
          client: serverClient,
          path: { index_id: indexId },
          query: { zoom, bbox, country, asset_type, radius }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error getting market index geo clusters:', error)
        return { results: [], error: 'Failed to get market index geo clusters' }
      }
    }
  }),

  // Market group tools
  searchMarketGroups: tool({
    description: 'Search for market index groups by name',
    inputSchema: z.object({
      query: z.string().describe('Search query for market group name'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ query, limit }: { query: string; limit?: number; cursor?: string }) => {
      try {
        const result = await getV3MarketsGroupsSearch({
          client: serverClient,
          query: { name: query, limit }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error searching market groups:', error)
        return { results: [], error: 'Failed to search market groups' }
      }
    }
  }),

  getMarketGroup: tool({
    description: 'Get detailed information about a specific market group by ID',
    inputSchema: z.object({
      groupId: z.string().describe('The unique identifier of the market group')
    }),
    execute: async ({ groupId }: { groupId: string }) => {
      try {
        const result = await getV3MarketsGroupsGroupId({
          client: serverClient,
          path: { group_id: groupId }
        })
        return result.data || null
      } catch (error) {
        console.error('Error getting market group:', error)
        return null
      }
    }
  }),

  listMarketGroups: tool({
    description: 'List all market index groups',
    inputSchema: z.object({
      limit: z.number().optional().describe('Maximum number of results to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    }),
    execute: async ({ limit, cursor }: { limit?: number; cursor?: string }) => {
      try {
        const result = await getV3MarketsGroups({
          client: serverClient,
          query: { limit, cursor }
        })
        return result.data || { results: [] }
      } catch (error) {
        console.error('Error listing market groups:', error)
        return { results: [], error: 'Failed to list market groups' }
      }
    }
  })
}