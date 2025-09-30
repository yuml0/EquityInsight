# Portfolio Export/Import Functionality

This document describes the portfolio export and import functionality added to
the Climate Portfolio Builder.

## Features

### Export Portfolio

- **Location**: Portfolio Management tab, in the Portfolio section
- **Button**: "Export Portfolio" dropdown with format options
- **Formats**:
  - JSON file with `.json` extension (full portfolio data)
  - CSV file with `.csv` extension (spreadsheet-friendly)
- **Filename**: Automatically generated as `Portfolio_YYYY-MM-DD.json` or
  `Portfolio_YYYY-MM-DD.csv`
- **Data Included**:
  - **JSON**: Complete portfolio data including companies, weights, settings,
    and metadata
  - **CSV**: Company data in spreadsheet format (ID, Name, Sector, Weight,
    Tickers, ISIN codes)

### Import Portfolio

- **Location**: Portfolio Management tab, in the Portfolio section
- **Button**: "Import Portfolio" button with upload icon
- **Formats**: Both JSON (`.json`) and CSV (`.csv`) files supported
- **Validation**: Comprehensive validation of file structure and data integrity
- **Error Handling**: Clear error messages for invalid files

## File Formats

### JSON Format

The exported/imported JSON file follows this structure:

```json
{
  "version": "1.0",
  "name": "Portfolio Name",
  "description": "Optional description",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "companies": [
    {
      "id": "company-id",
      "name": "Company Name",
      "sector": "Sector",
      "stock_tickers": ["TICKER"],
      "isin_codes": ["ISIN_CODE"],
      "weight": 25.0
    }
  ],
  "useEqualWeights": false,
  "selectedCompanyIds": ["company-id-1", "company-id-2"]
}
```

### CSV Format

The exported/imported CSV file follows this structure:

```csv
Company ID,Company Name,Sector,Weight (%),Stock Tickers,ISIN Codes
sample-1,"Tesla Inc.",Automotive,25.0,TSLA,US88160R1014
sample-2,"NextEra Energy Inc.",Utilities,20.0,NEE,US65339F1012
sample-3,"Vestas Wind Systems A/S",Industrial Goods,15.0,VWS,DK0010268606
```

**CSV Format Notes:**

- First row contains column headers
- Company names and sectors are quoted to handle commas
- Stock tickers and ISIN codes are comma-separated within quoted fields
- Weights are expressed as decimal numbers (e.g., 25.0 for 25%)
- UTF-8 encoding with BOM for proper Excel compatibility

## Usage Instructions

### Exporting a Portfolio

1. Build your portfolio by adding companies and setting weights
2. Click the "Export Portfolio" dropdown button
3. Choose your preferred format:
   - **Export as JSON**: Complete portfolio data with all settings
   - **Export as CSV**: Spreadsheet-friendly format for Excel/Google Sheets
4. The file will be automatically downloaded to your default download folder
5. The filename will include the current date

### Importing a Portfolio

1. Click the "Import Portfolio" button
2. Select a valid portfolio file from your computer (JSON or CSV)
3. The portfolio will be loaded with all companies, weights, and settings
4. If there's an error, you'll see a clear error message

## Validation Rules

The import functionality validates:

### JSON Files

- File format (must be valid JSON)
- Required fields (version, companies, useEqualWeights, selectedCompanyIds)
- Company data integrity (id, name, weight between 0-100)
- Array types for companies and selectedCompanyIds
- Boolean type for useEqualWeights

### CSV Files

- File format (must be valid CSV with proper headers)
- Required columns (Company ID, Company Name, Sector, Weight (%), Stock Tickers,
  ISIN Codes)
- Valid weight values (numeric, between 0-100)
- Proper CSV escaping and quoting

## Sample Files

Sample portfolio files are included in the project root for testing the import
functionality:

- `sample-portfolio.json` - JSON format with 6 climate-focused companies
- `sample-portfolio.csv` - CSV format with the same companies in spreadsheet
  format

## Error Messages

Common error messages you might see:

### JSON Import Errors

- "Invalid JSON file format" - File is not valid JSON
- "Missing or invalid version field" - Required version field is missing
- "Invalid company data: weight must be between 0 and 100" - Company weight is
  invalid
- "Invalid company data: missing or invalid name" - Company name is missing or
  invalid

### CSV Import Errors

- "Invalid CSV format" - File is not valid CSV
- "Expected 6 columns, found X" - Wrong number of columns in CSV
- "CSV file must have at least a header and one data row" - Empty or invalid CSV
- "No valid weights found in CSV file" - No valid weight values found

## Technical Implementation

- **Export**: Uses browser's Blob API and programmatic download
- **Import**: Uses FileReader API for file reading with format detection
- **CSV Parsing**: Custom CSV parser with proper quote handling and BOM support
- **Validation**: Custom validation functions with detailed error reporting for
  both formats
- **State Management**: Integrates with existing React state management
- **UI**: Integrated into existing PortfolioManager component with dropdown menu
  for export options
