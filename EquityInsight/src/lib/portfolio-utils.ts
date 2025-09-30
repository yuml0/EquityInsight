import type { PortfolioCompany } from "../components/PortfolioManager";

export interface PortfolioExportData {
  version: string;
  name: string;
  description?: string;
  createdAt: string;
  companies: PortfolioCompany[];
  useEqualWeights: boolean;
  selectedCompanyIds: string[];
}

export interface PortfolioImportResult {
  success: boolean;
  data?: PortfolioExportData;
  error?: string;
}

/**
 * Export portfolio data to a downloadable JSON file
 */
export function exportPortfolio(
  companies: PortfolioCompany[],
  useEqualWeights: boolean,
  selectedCompanyIds: string[],
  portfolioName: string = "My Portfolio"
): void {
  const exportData: PortfolioExportData = {
    version: "1.0",
    name: portfolioName,
    description: `Portfolio with ${companies.length} companies`,
    createdAt: new Date().toISOString(),
    companies,
    useEqualWeights,
    selectedCompanyIds,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${portfolioName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_portfolio.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export portfolio data to a downloadable CSV file
 */
export function exportPortfolioCSV(
  companies: PortfolioCompany[],
  portfolioName: string = "My Portfolio"
): void {
  // CSV header
  const headers = [
    "Company ID",
    "Company Name",
    "Sector",
    "Weight (%)",
    "Stock Tickers",
    "ISIN Codes"
  ];

  // Convert companies to CSV rows
  const rows = companies.map(company => [
    company.id || "",
    `"${(company.name || "").replace(/"/g, '""')}"`, // Escape quotes in company name
    `"${(company.sector || "").replace(/"/g, '""')}"`, // Escape quotes in sector
    company.weight.toString(),
    `"${(company.stock_tickers || []).join(", ")}"`,
    `"${(company.isin_codes || []).join(", ")}"`
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");

  // Add BOM for proper UTF-8 encoding in Excel
  const csvWithBOM = "\uFEFF" + csvContent;

  const dataBlob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${portfolioName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_portfolio.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Import portfolio data from a JSON file
 */
export function importPortfolio(file: File): Promise<PortfolioImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as PortfolioExportData;

        // Validate the imported data structure
        const validationResult = validatePortfolioData(data);
        if (!validationResult.valid) {
          resolve({
            success: false,
            error: validationResult.error,
          });
          return;
        }

        resolve({
          success: true,
          data,
        });
      } catch (error) {
        resolve({
          success: false,
          error: "Invalid JSON file format",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Import portfolio data from a CSV file
 */
export function importPortfolioCSV(file: File): Promise<PortfolioImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const csvData = parseCSV(content);

        if (!csvData.valid) {
          resolve({
            success: false,
            error: csvData.error,
          });
          return;
        }

        // Convert CSV data to portfolio format
        const companies: PortfolioCompany[] = csvData.rows.map((row, index) => ({
          id: row[0] || `imported-${index}`,
          name: row[1] || `Company ${index + 1}`,
          sector: row[2] || "",
          weight: parseFloat(row[3]) || 0,
          stock_tickers: row[4] ? row[4].split(",").map(t => t.trim()) : [],
          isin_codes: row[5] ? row[5].split(",").map(c => c.trim()) : [],
        }));

        // Validate weights
        const totalWeight = companies.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight === 0) {
          resolve({
            success: false,
            error: "No valid weights found in CSV file",
          });
          return;
        }

        const exportData: PortfolioExportData = {
          version: "1.0",
          name: `Imported Portfolio from ${file.name}`,
          description: `Portfolio imported from CSV with ${companies.length} companies`,
          createdAt: new Date().toISOString(),
          companies,
          useEqualWeights: false,
          selectedCompanyIds: companies.map(c => c.id!),
        };

        resolve({
          success: true,
          data: exportData,
        });
      } catch (error) {
        resolve({
          success: false,
          error: "Failed to parse CSV file",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };

    reader.readAsText(file, "UTF-8");
  });
}

/**
 * Parse CSV content and return structured data
 */
function parseCSV(content: string): { valid: boolean; rows: string[][]; error?: string } {
  try {
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, "");

    const lines = cleanContent.split("\n").filter(line => line.trim());

    if (lines.length < 2) {
      return { valid: false, rows: [], error: "CSV file must have at least a header and one data row" };
    }

    // Parse header
    const header = parseCSVLine(lines[0]);
    const expectedColumns = ["Company ID", "Company Name", "Sector", "Weight (%)", "Stock Tickers", "ISIN Codes"];

    if (header.length !== expectedColumns.length) {
      return { valid: false, rows: [], error: `Expected ${expectedColumns.length} columns, found ${header.length}` };
    }

    // Parse data rows
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === expectedColumns.length) {
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      return { valid: false, rows: [], error: "No valid data rows found" };
    }

    return { valid: true, rows };
  } catch (error) {
    return { valid: false, rows: [], error: "Invalid CSV format" };
  }
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Validate imported portfolio data structure
 */
function validatePortfolioData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data format" };
  }

  if (!data.version || typeof data.version !== "string") {
    return { valid: false, error: "Missing or invalid version field" };
  }

  if (!data.companies || !Array.isArray(data.companies)) {
    return { valid: false, error: "Missing or invalid companies array" };
  }

  if (typeof data.useEqualWeights !== "boolean") {
    return { valid: false, error: "Missing or invalid useEqualWeights field" };
  }

  if (!Array.isArray(data.selectedCompanyIds)) {
    return { valid: false, error: "Missing or invalid selectedCompanyIds array" };
  }

  // Validate each company object
  for (const company of data.companies) {
    if (!company.id || typeof company.id !== "string") {
      return { valid: false, error: "Invalid company data: missing or invalid id" };
    }

    if (typeof company.weight !== "number" || company.weight < 0 || company.weight > 100) {
      return { valid: false, error: "Invalid company data: weight must be between 0 and 100" };
    }

    if (!company.name || typeof company.name !== "string") {
      return { valid: false, error: "Invalid company data: missing or invalid name" };
    }
  }

  return { valid: true };
}

/**
 * Get a user-friendly file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
