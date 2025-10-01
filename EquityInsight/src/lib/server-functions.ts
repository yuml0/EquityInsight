import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getV3CompaniesCompanyIdAssetsClimateScoresAggregation,
  getV3CompaniesCompanyIdClimateScores,
  getV3CompaniesCompanyIdAssets,
  getV3Assets,
  getV3Companies,
} from "@/client/sdk.gen";

// Server function for company climate scores aggregation
export const getCompanyClimateScoresAggregation = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      company_id: z.string(),
      horizon: z.number(),
      pathway: z.string(),
      risk: z.enum(["physical", "transition"]),
      metric: z.string(),
      by: z.enum(["asset_type", "country", "state"]),
    })
  )
  .handler(async ({ data }) => {
    const result = await getV3CompaniesCompanyIdAssetsClimateScoresAggregation({
      path: { company_id: data.company_id },
      query: {
        horizon: data.horizon,
        pathway: data.pathway,
        risk: data.risk,
        metric: data.metric,
        by: data.by,
      },
    });
    return result.data;
  });

// Server function for company climate scores
export const getCompanyClimateScores = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      company_id: z.string(),
      horizon: z.number(),
      pathway: z.string(),
      risk: z.enum(["physical", "transition"]),
      metric: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const result = await getV3CompaniesCompanyIdClimateScores({
      path: { company_id: data.company_id },
      query: {
        horizon: data.horizon,
        pathway: data.pathway,
        risk: data.risk,
        metric: data.metric,
      },
    });
    return result.data;
  });

// Server function for company assets
export const getCompanyAssets = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      company_id: z.string(),
      limit: z.number().optional(),
      cursor: z.string().optional(),
      country: z.string().optional(),
      asset_type: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const result = await getV3CompaniesCompanyIdAssets({
      path: { company_id: data.company_id },
      query: {
        limit: data.limit || 100,
        cursor: data.cursor,
        country: data.country,
        asset_type: data.asset_type,
      },
    });
    return result.data;
  });

// Server function for assets search
export const searchAssets = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      limit: z.number().optional(),
      cursor: z.string().optional(),
      country: z.string().optional(),
      asset_type: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const result = await getV3Assets({
      query: {
        limit: data.limit || 100,
        cursor: data.cursor,
        country: data.country,
        asset_type: data.asset_type,
      },
    });
    return result.data;
  });

// Server function for companies list
export const getCompanies = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      limit: z.number().optional(),
      cursor: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const result = await getV3Companies({
      query: {
        limit: data.limit || 100,
        cursor: data.cursor,
      },
    });
    return result.data;
  });

// Server function for multiple company climate scores aggregation (batch)
export const getMultipleCompanyClimateScoresAggregation = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      company_ids: z.array(z.string()),
      horizon: z.number(),
      pathway: z.string(),
      risk: z.enum(["physical", "transition"]),
      metric: z.string(),
      by: z.enum(["asset_type", "country", "state"]),
    })
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.company_ids.map(async (companyId) => {
        try {
          const result = await getV3CompaniesCompanyIdAssetsClimateScoresAggregation({
            path: { company_id: companyId },
            query: {
              horizon: data.horizon,
              pathway: data.pathway,
              risk: data.risk,
              metric: data.metric,
              by: data.by,
            },
          });
          return {
            company_id: companyId,
            data: result.data,
            success: true,
          };
        } catch (error) {
          return {
            company_id: companyId,
            data: null,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );
    return results;
  });

// Server function for multiple company climate scores (batch)
export const getMultipleCompanyClimateScores = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      company_ids: z.array(z.string()),
      horizon: z.number(),
      pathway: z.string(),
      risk: z.enum(["physical", "transition"]),
      metric: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.company_ids.map(async (companyId) => {
        try {
          const result = await getV3CompaniesCompanyIdClimateScores({
            path: { company_id: companyId },
            query: {
              horizon: data.horizon,
              pathway: data.pathway,
              risk: data.risk,
              metric: data.metric,
            },
          });
          return {
            company_id: companyId,
            data: result.data,
            success: true,
          };
        } catch (error) {
          return {
            company_id: companyId,
            data: null,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );
    return results;
  });
