import { describe, it, expect } from 'vitest';
import {
  auditDICGCAggregation,
  calculateAutoSweepOptimization,
  planOperatingCashTiering,
  DICGC_STATUTORY_CAP,
  type AccountHolding
} from '../src/lib/finance-math';

describe('DICGC Deposit Insurance Aggregation Engine', () => {
  it('correctly aggregates multiple accounts in the same bank under individual capacity to the ₹5,00,000 cap', () => {
    const holdings: AccountHolding[] = [
      {
        id: '1',
        bankName: 'HDFC Bank',
        branchName: 'Koramangala',
        capacity: 'individual',
        accountType: 'savings',
        principal: 200000,
        accruedInterest: 5000
      },
      {
        id: '2',
        bankName: 'HDFC Bank',
        branchName: 'Indiranagar',
        capacity: 'individual',
        accountType: 'fixed_deposit',
        principal: 400000,
        accruedInterest: 20000
      }
    ];

    const report = auditDICGCAggregation(holdings);

    // Total at HDFC = 205000 + 420000 = 625000
    // Insured = 500000, Uninsured = 125000
    expect(report.totalGrossDepositsAcrossBanks).toBe(625000);
    expect(report.totalInsuredAcrossBanks).toBe(500000);
    expect(report.totalAtRiskAcrossBanks).toBe(125000);
    expect(report.effectiveNetworkCoveragePercent).toBe(80);
    expect(report.recommendedReallocations.length).toBeGreaterThan(0);
  });

  it('correctly treats joint holding with different primary capacity as distinct insurance buckets at the same bank', () => {
    const holdings: AccountHolding[] = [
      {
        id: '1',
        bankName: 'State Bank of India',
        capacity: 'individual',
        accountType: 'savings',
        principal: 450000,
        accruedInterest: 10000
      },
      {
        id: '2',
        bankName: 'State Bank of India',
        capacity: 'joint_first', // A & B
        accountType: 'fixed_deposit',
        principal: 480000,
        accruedInterest: 15000
      }
    ];

    const report = auditDICGCAggregation(holdings);

    // Individual = 460000 (all insured)
    // Joint First = 495000 (all insured)
    // Total = 955000, all insured because they have different capacities!
    expect(report.totalGrossDepositsAcrossBanks).toBe(955000);
    expect(report.totalInsuredAcrossBanks).toBe(955000);
    expect(report.totalAtRiskAcrossBanks).toBe(0);
    expect(report.effectiveNetworkCoveragePercent).toBe(100);
  });

  it('correctly merges sole proprietorship accounts with the individual personal capacity', () => {
    const holdings: AccountHolding[] = [
      {
        id: '1',
        bankName: 'ICICI Bank',
        capacity: 'individual',
        accountType: 'savings',
        principal: 300000,
        accruedInterest: 5000
      },
      {
        id: '2',
        bankName: 'ICICI Bank',
        capacity: 'sole_proprietorship',
        accountType: 'current',
        principal: 300000,
        accruedInterest: 0
      }
    ];

    const report = auditDICGCAggregation(holdings);

    // Under DICGC rules, sole proprietorship has no distinct identity from proprietor
    // Merged total = 605000 -> Insured 500000, Uninsured 105000
    expect(report.totalGrossDepositsAcrossBanks).toBe(605000);
    expect(report.totalInsuredAcrossBanks).toBe(500000);
    expect(report.totalAtRiskAcrossBanks).toBe(105000);
  });

  it('correctly applies the legal Right of Set-Off for outstanding loans in the same capacity', () => {
    const holdings: AccountHolding[] = [
      {
        id: '1',
        bankName: 'Axis Bank',
        capacity: 'individual',
        accountType: 'fixed_deposit',
        principal: 600000,
        accruedInterest: 20000,
        outstandingLoanDues: 200000 // Loan set-off
      }
    ];

    const report = auditDICGCAggregation(holdings);

    // Gross = 620000, Loan = 200000
    // Net balance = 420000 -> All covered under ₹5,00,000 cap!
    expect(report.totalGrossDepositsAcrossBanks).toBe(620000);
    expect(report.totalInsuredAcrossBanks).toBe(420000);
    expect(report.totalAtRiskAcrossBanks).toBe(0);
  });

  it('handles empty account lists gracefully without errors', () => {
    const report = auditDICGCAggregation([]);
    expect(report.totalGrossDepositsAcrossBanks).toBe(0);
    expect(report.totalInsuredAcrossBanks).toBe(0);
    expect(report.effectiveNetworkCoveragePercent).toBe(100);
  });
});

describe('Auto-Sweep Yield & Breakage Optimizer', () => {
  it('calculates positive net alpha when average balance is well above sweep threshold', () => {
    const result = calculateAutoSweepOptimization({
      averageBalance: 200000,
      sweepThreshold: 25000,
      sweepChunkStep: 5000,
      savingsInterestRatePct: 3.0,
      sweepFDInterestRatePct: 7.0,
      prematureBreakagePenaltyPct: 0.5,
      expectedMonthlyOutflowDemand: 10000,
      taxSlabRatePct: 30,
      isSeniorCitizen: false
    });

    expect(result.sweepNetInPocket).toBeGreaterThan(result.pureSavingsNetInPocket);
    expect(result.netAnnualAlpha).toBeGreaterThan(0);
    expect(result.alphaPercentagePoints).toBeGreaterThan(0);
    expect(result.sweepRecommendation).toContain('Auto-sweep delivers substantial post-tax alpha');
  });

  it('correctly notes inactive sweep when balance is below threshold', () => {
    const result = calculateAutoSweepOptimization({
      averageBalance: 20000,
      sweepThreshold: 25000,
      sweepChunkStep: 5000,
      savingsInterestRatePct: 3.0,
      sweepFDInterestRatePct: 7.0,
      prematureBreakagePenaltyPct: 0.5,
      expectedMonthlyOutflowDemand: 5000,
      taxSlabRatePct: 20,
      isSeniorCitizen: false
    });

    expect(result.netAnnualAlpha).toBe(0);
    expect(result.sweepRecommendation).toContain('is below or equal to threshold');
  });

  it('throws error for invalid negative balance inputs', () => {
    expect(() => {
      calculateAutoSweepOptimization({
        averageBalance: -5000,
        sweepThreshold: 25000,
        sweepChunkStep: 5000,
        savingsInterestRatePct: 3.0,
        sweepFDInterestRatePct: 7.0,
        prematureBreakagePenaltyPct: 0.5,
        expectedMonthlyOutflowDemand: 0,
        taxSlabRatePct: 30
      });
    }).toThrow('Balances and thresholds must be non-negative');
  });
});

describe('Operating Cash Tiering Planner', () => {
  it('correctly segments cash into 3 distinct operational tiers and calculates bank diversification', () => {
    const plan = planOperatingCashTiering({
      totalOperatingCash: 2500000, // ₹25 Lakhs
      monthlyPayrollAndOPEX: 300000, // ₹3 Lakhs/mo
      unforeseenRevenueLagMonths: 4
    });

    // Tier 1: 1.5 * 3L = 4.5L
    expect(plan.tier1IntradayBuffer).toBe(450000);
    // Tier 2: 2.5 * 3L = 7.5L
    expect(plan.tier2WorkingCapitalBuffer).toBe(750000);
    // Tier 3: 25L - (4.5L + 7.5L) = 13L
    expect(plan.tier3ContingencyReserve).toBe(1300000);
    // Recommended bank count to stay safe under ₹5L DICGC cap: 25L / 5L = 5 banks
    expect(plan.recommendedBankCount).toBe(5);
    expect(plan.maxExposurePerBank).toBe(500000);
  });
});
