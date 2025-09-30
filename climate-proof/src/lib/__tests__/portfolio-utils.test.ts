import { validatePortfolioData, formatFileSize } from '../portfolio-utils';
import type { PortfolioExportData } from '../portfolio-utils';

describe('portfolio-utils', () => {
  describe('validatePortfolioData', () => {
    it('should validate correct portfolio data', () => {
      const validData: PortfolioExportData = {
        version: '1.0',
        name: 'Test Portfolio',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        companies: [
          {
            id: '1',
            name: 'Test Company',
            weight: 50,
            sector: 'Technology',
            stock_tickers: ['TEST'],
            isin_codes: ['US1234567890'],
          },
        ],
        useEqualWeights: false,
        selectedCompanyIds: ['1'],
      };

      const result = validatePortfolioData(validData);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid data structure', () => {
      const result = validatePortfolioData(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid data format');
    });

    it('should reject missing version', () => {
      const invalidData = {
        companies: [],
        useEqualWeights: false,
        selectedCompanyIds: [],
      };

      const result = validatePortfolioData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing or invalid version field');
    });

    it('should reject invalid companies array', () => {
      const invalidData = {
        version: '1.0',
        companies: 'not an array',
        useEqualWeights: false,
        selectedCompanyIds: [],
      };

      const result = validatePortfolioData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing or invalid companies array');
    });

    it('should reject company with invalid weight', () => {
      const invalidData = {
        version: '1.0',
        companies: [
          {
            id: '1',
            name: 'Test Company',
            weight: 150, // Invalid weight > 100
          },
        ],
        useEqualWeights: false,
        selectedCompanyIds: ['1'],
      };

      const result = validatePortfolioData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid company data: weight must be between 0 and 100');
    });

    it('should reject company with missing name', () => {
      const invalidData = {
        version: '1.0',
        companies: [
          {
            id: '1',
            weight: 50,
          },
        ],
        useEqualWeights: false,
        selectedCompanyIds: ['1'],
      };

      const result = validatePortfolioData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid company data: missing or invalid name');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });
  });
});
