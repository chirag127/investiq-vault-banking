/**
 * InvestiQ VaultBanking — Quantitative Financial Mathematics Library
 * 
 * Reusable, deterministic functions powering client-side calculations for:
 * 1. DICGC Deposit Insurance Aggregation & Capacity Modeling
 * 2. Auto-Sweep Flexi-Deposit Yield, Breakage & LIFO Liquidation
 * 3. Operating Cash Tiering & Multi-Institution Diversification
 * 4. General Compounding & Breakage Cost Metrics
 */

export interface AccountHolding {
  id: string;
  bankName: string;
  branchName?: string;
  capacity: 'individual' | 'joint_first' | 'joint_second' | 'sole_proprietorship' | 'minor_guardian' | 'corporate_trust';
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'auto_sweep_fd';
  principal: number;
  accruedInterest: number;
  outstandingLoanDues?: number; // Set-off liability
}

export interface CapacityAuditSummary {
  capacityKey: string;
  bankName: string;
  capacityDescription: string;
  totalGrossDeposits: number;
  setOffDues: number;
  netInsurableBalance: number;
  insuredPayout: number;
  uninsuredRiskExposure: number;
  insuranceCoveragePercent: number;
}

export interface BankAuditResult {
  bankName: string;
  grossHoldings: number;
  totalSetOff: number;
  netDeposits: number;
  totalInsuredAmount: number;
  totalUninsuredAmount: number;
  overallCoveragePercent: number;
  capacities: CapacityAuditSummary[];
}

export interface DICGCAggregationReport {
  totalGrossDepositsAcrossBanks: number;
  totalInsuredAcrossBanks: number;
  totalAtRiskAcrossBanks: number;
  effectiveNetworkCoveragePercent: number;
  bankAudits: BankAuditResult[];
  recommendedReallocations: string[];
}

export const DICGC_STATUTORY_CAP = 500000; // ₹5,00,000 statutory limit per depositor per bank

/**
 * 1. DICGC Deposit Insurance Aggregation Engine
 * 
 * Aggregates deposits strictly adhering to the "Same Right and Capacity" principle:
 * - personal accounts of an individual are clubbed across branches of the same bank
 * - sole proprietorship accounts are legally merged with personal accounts of the proprietor
 * - distinct joint account permutations are treated as distinct capacities
 * - outstanding loans/overdrafts in the same right are set off first
 * - strictly caps insured payout at ₹5,00,000 per bank per unique capacity
 */
export function auditDICGCAggregation(accounts: AccountHolding[]): DICGCAggregationReport {
  if (!accounts || accounts.length === 0) {
    return {
      totalGrossDepositsAcrossBanks: 0,
      totalInsuredAcrossBanks: 0,
      totalAtRiskAcrossBanks: 0,
      effectiveNetworkCoveragePercent: 100,
      bankAudits: [],
      recommendedReallocations: []
    };
  }

  // Group accounts by Bank
  const bankMap = new Map<string, AccountHolding[]>();
  for (const acc of accounts) {
    const bankKey = acc.bankName.trim().toUpperCase();
    if (!bankMap.has(bankKey)) {
      bankMap.set(bankKey, []);
    }
    bankMap.get(bankKey)!.push(acc);
  }

  const bankAudits: BankAuditResult[] = [];
  let totalGrossAll = 0;
  let totalInsuredAll = 0;
  let totalAtRiskAll = 0;
  const recommendations: string[] = [];

  for (const [bankKey, bankAccs] of bankMap.entries()) {
    // Within this bank, group by capacity
    // Sole proprietorship merges into 'individual'
    const capacityGroups = new Map<string, AccountHolding[]>();
    for (const acc of bankAccs) {
      let effectiveCapacity = acc.capacity;
      if (effectiveCapacity === 'sole_proprietorship') {
        effectiveCapacity = 'individual';
      }
      const capKey = `${bankKey}___${effectiveCapacity}`;
      if (!capacityGroups.has(capKey)) {
        capacityGroups.set(capKey, []);
      }
      capacityGroups.get(capKey)!.push(acc);
    }

    const capacitySummaries: CapacityAuditSummary[] = [];
    let bankGross = 0;
    let bankSetOff = 0;
    let bankNet = 0;
    let bankInsured = 0;
    let bankUninsured = 0;

    for (const [capKey, group] of capacityGroups.entries()) {
      const capType = group[0].capacity === 'sole_proprietorship' ? 'individual' : group[0].capacity;
      
      let groupGross = 0;
      let groupSetOff = 0;

      for (const item of group) {
        const itemGross = (Number(item.principal) || 0) + (Number(item.accruedInterest) || 0);
        const itemLoan = Number(item.outstandingLoanDues) || 0;
        groupGross += itemGross;
        groupSetOff += itemLoan;
      }

      // Net balance after mandatory right of set-off
      const netBalance = Math.max(0, groupGross - groupSetOff);
      const insured = Math.min(DICGC_STATUTORY_CAP, netBalance);
      const uninsured = Math.max(0, netBalance - insured);
      const coveragePct = netBalance > 0 ? Number(((insured / netBalance) * 100).toFixed(2)) : 100;

      let desc = 'Individual / Sole Proprietor Personal Capacity';
      if (capType === 'joint_first') desc = 'Joint Holding (1st Applicant Primary Capacity)';
      else if (capType === 'joint_second') desc = 'Joint Holding (2nd Applicant Capacity)';
      else if (capType === 'minor_guardian') desc = 'Guardian on Behalf of Minor (Fiduciary Capacity)';
      else if (capType === 'corporate_trust') desc = 'Registered Corporate / Firm / Trust Capacity';

      capacitySummaries.push({
        capacityKey: capKey,
        bankName: bankAccs[0].bankName,
        capacityDescription: desc,
        totalGrossDeposits: Math.round(groupGross),
        setOffDues: Math.round(groupSetOff),
        netInsurableBalance: Math.round(netBalance),
        insuredPayout: Math.round(insured),
        uninsuredRiskExposure: Math.round(uninsured),
        insuranceCoveragePercent: coveragePct
      });

      bankGross += groupGross;
      bankSetOff += groupSetOff;
      bankNet += netBalance;
      bankInsured += insured;
      bankUninsured += uninsured;

      if (uninsured > 0) {
        recommendations.push(
          `At ${bankAccs[0].bankName} (${desc}), balance exceeds DICGC cap by ₹${Math.round(uninsured).toLocaleString('en-IN')}. Consider diversifying into another Scheduled Commercial Bank or sovereign T-Bills.`
        );
      }
    }

    const overallBankPct = bankNet > 0 ? Number(((bankInsured / bankNet) * 100).toFixed(2)) : 100;

    bankAudits.push({
      bankName: bankAccs[0].bankName,
      grossHoldings: Math.round(bankGross),
      totalSetOff: Math.round(bankSetOff),
      netDeposits: Math.round(bankNet),
      totalInsuredAmount: Math.round(bankInsured),
      totalUninsuredAmount: Math.round(bankUninsured),
      overallCoveragePercent: overallBankPct,
      capacities: capacitySummaries
    });

    totalGrossAll += bankGross;
    totalInsuredAll += bankInsured;
    totalAtRiskAll += bankUninsured;
  }

  const effectiveNetworkCoverage = totalGrossAll > 0 
    ? Number(((totalInsuredAll / totalGrossAll) * 100).toFixed(2)) 
    : 100;

  return {
    totalGrossDepositsAcrossBanks: Math.round(totalGrossAll),
    totalInsuredAcrossBanks: Math.round(totalInsuredAll),
    totalAtRiskAcrossBanks: Math.round(totalAtRiskAll),
    effectiveNetworkCoveragePercent: effectiveNetworkCoverage,
    bankAudits,
    recommendedReallocations: recommendations
  };
}

/**
 * 2. Auto-Sweep Flexi-Deposit Yield & Breakage Optimizer
 * 
 * Simulates:
 * - Pure Savings Account yield
 * - Sweep-linked account with threshold, chunk/step size, and FD tenure rate
 * - Breakage penalty when unexpected cash outflows force premature reverse-sweep
 * - Tax drag under Section 80TTA (₹10,000 exemption for savings) vs FD slab taxation
 */
export interface AutoSweepScenarioInput {
  averageBalance: number;
  sweepThreshold: number; // e.g. ₹25,000
  sweepChunkStep: number; // e.g. ₹5,000 or ₹10,000
  savingsInterestRatePct: number; // e.g. 3.00%
  sweepFDInterestRatePct: number; // e.g. 7.00%
  prematureBreakagePenaltyPct: number; // e.g. 0.50% or 1.00%
  expectedMonthlyOutflowDemand: number; // monthly liquidity pull
  taxSlabRatePct: number; // e.g. 30% (+ cess)
  isSeniorCitizen?: boolean; // Section 80TTB eligibility
}

export interface AutoSweepYieldResult {
  pureSavingsAnnualInterest: number;
  pureSavingsTaxPaid: number;
  pureSavingsNetInPocket: number;
  pureSavingsEffectiveYieldPct: number;

  sweepAnnualGrossInterest: number;
  estimatedBreakagePenaltyLoss: number;
  sweepAdjustedGrossInterest: number;
  sweepTaxPaid: number;
  sweepNetInPocket: number;
  sweepEffectiveYieldPct: number;

  netAnnualAlpha: number; // Net extra rupees earned vs pure savings
  alphaPercentagePoints: number;
  sweepRecommendation: string;
}

export function calculateAutoSweepOptimization(input: AutoSweepScenarioInput): AutoSweepYieldResult {
  const {
    averageBalance,
    sweepThreshold,
    savingsInterestRatePct,
    sweepFDInterestRatePct,
    prematureBreakagePenaltyPct,
    expectedMonthlyOutflowDemand,
    taxSlabRatePct,
    isSeniorCitizen = false
  } = input;

  if (averageBalance < 0 || sweepThreshold < 0) {
    throw new Error('Balances and thresholds must be non-negative');
  }

  const rSavings = savingsInterestRatePct / 100;
  const rSweepFD = sweepFDInterestRatePct / 100;
  const tRate = taxSlabRatePct / 100;

  // 1. Pure Savings Account Baseline
  const pureSavingsInterest = averageBalance * rSavings;
  let taxableSavingsInterest = 0;
  
  if (isSeniorCitizen) {
    // Section 80TTB allows deduction up to ₹50,000
    taxableSavingsInterest = Math.max(0, pureSavingsInterest - 50000);
  } else {
    // Section 80TTA allows deduction up to ₹10,000
    taxableSavingsInterest = Math.max(0, pureSavingsInterest - 10000);
  }
  const pureSavingsTax = taxableSavingsInterest * tRate;
  const pureSavingsNet = pureSavingsInterest - pureSavingsTax;
  const pureSavingsYieldPct = averageBalance > 0 ? (pureSavingsNet / averageBalance) * 100 : 0;

  // 2. Auto-Sweep Account Configuration
  let retainedSavingsPart = 0;
  let sweptFDPart = 0;

  if (averageBalance <= sweepThreshold) {
    retainedSavingsPart = averageBalance;
    sweptFDPart = 0;
  } else {
    retainedSavingsPart = sweepThreshold;
    sweptFDPart = averageBalance - sweepThreshold;
  }

  const interestFromRetainedSavings = retainedSavingsPart * rSavings;
  const grossInterestFromSweptFD = sweptFDPart * rSweepFD;
  const totalSweepGross = interestFromRetainedSavings + grossInterestFromSweptFD;

  // Breakage calculation:
  // If expected monthly outflows exceed retained buffer, reverse sweeps occur
  const annualOutflow = expectedMonthlyOutflowDemand * 12;
  const bufferDeficit = Math.max(0, annualOutflow - (retainedSavingsPart * 12)); 
  // Portion of swept funds broken prematurely
  const brokenPortionAnnualized = Math.min(sweptFDPart, bufferDeficit / 12);
  const breakageLoss = brokenPortionAnnualized * (prematureBreakagePenaltyPct / 100);

  const sweepAdjustedGross = Math.max(0, totalSweepGross - breakageLoss);

  // Sweep Taxation:
  // Retained savings interest qualifies for 80TTA/80TTB
  // Swept FD interest is considered term deposit interest (taxable at marginal rate, only 80TTB for seniors)
  let taxableRetainedSavings = 0;
  let taxableFDInterest = Math.max(0, grossInterestFromSweptFD - breakageLoss);

  if (isSeniorCitizen) {
    // 80TTB applies across both savings and FD up to ₹50,000
    const totalSeniorInterest = interestFromRetainedSavings + taxableFDInterest;
    const taxableAfter80TTB = Math.max(0, totalSeniorInterest - 50000);
    var sweepTax = taxableAfter80TTB * tRate;
  } else {
    taxableRetainedSavings = Math.max(0, interestFromRetainedSavings - 10000);
    var sweepTax = (taxableRetainedSavings + taxableFDInterest) * tRate;
  }

  const sweepNet = sweepAdjustedGross - sweepTax;
  const sweepYieldPct = averageBalance > 0 ? (sweepNet / averageBalance) * 100 : 0;
  const netAlpha = sweepNet - pureSavingsNet;
  const alphaPts = sweepYieldPct - pureSavingsYieldPct;

  let recommendation = '';
  if (averageBalance <= sweepThreshold) {
    recommendation = `Account balance (₹${averageBalance.toLocaleString('en-IN')}) is below or equal to threshold (₹${sweepThreshold.toLocaleString('en-IN')}). Auto-sweep remains inactive. Consider lowering threshold.`;
  } else if (netAlpha > 1000) {
    recommendation = `Auto-sweep delivers substantial post-tax alpha (+₹${Math.round(netAlpha).toLocaleString('en-IN')}/yr). Highly recommended for current surplus cash.`;
  } else if (netAlpha > 0) {
    recommendation = `Auto-sweep produces marginal post-tax benefit (+₹${Math.round(netAlpha).toLocaleString('en-IN')}/yr). High transaction frequency or premature breakages could erode advantage.`;
  } else {
    recommendation = `Due to high breakage penalties and loss of Section 80TTA benefits, pure savings or liquid mutual funds offer superior cash efficiency.`;
  }

  return {
    pureSavingsAnnualInterest: Math.round(pureSavingsInterest),
    pureSavingsTaxPaid: Math.round(pureSavingsTax),
    pureSavingsNetInPocket: Math.round(pureSavingsNet),
    pureSavingsEffectiveYieldPct: Number(pureSavingsYieldPct.toFixed(2)),

    sweepAnnualGrossInterest: Math.round(totalSweepGross),
    estimatedBreakagePenaltyLoss: Math.round(breakageLoss),
    sweepAdjustedGrossInterest: Math.round(sweepAdjustedGross),
    sweepTaxPaid: Math.round(sweepTax),
    sweepNetInPocket: Math.round(sweepNet),
    sweepEffectiveYieldPct: Number(sweepYieldPct.toFixed(2)),

    netAnnualAlpha: Math.round(netAlpha),
    alphaPercentagePoints: Number(alphaPts.toFixed(2)),
    sweepRecommendation: recommendation
  };
}

/**
 * 3. Operating Cash Tiering & Institutional Liquidity Planner
 * 
 * Segregates operating cash into 3 tiers:
 * - Tier 1: Intraday clearing & payroll (0-30 days, D-SIB Current/Savings, instant liquidity)
 * - Tier 2: Working capital buffer (30-90 days, auto-sweep/Treasury Bills/Arbitrage, <₹5L per SCB)
 * - Tier 3: Core contingency reserve (90-365 days, multi-bank FDs, Sovereign RBI Floating Rate Bonds)
 */
export interface CashTieringInput {
  totalOperatingCash: number;
  monthlyPayrollAndOPEX: number;
  unforeseenRevenueLagMonths: number; // buffer factor (e.g. 3 to 6 months)
}

export interface CashTieringResult {
  tier1IntradayBuffer: number;
  tier2WorkingCapitalBuffer: number;
  tier3ContingencyReserve: number;
  recommendedBankCount: number;
  maxExposurePerBank: number;
  tieringSummary: string;
}

export function planOperatingCashTiering(input: CashTieringInput): CashTieringResult {
  const { totalOperatingCash, monthlyPayrollAndOPEX, unforeseenRevenueLagMonths } = input;

  if (totalOperatingCash <= 0 || monthlyPayrollAndOPEX <= 0) {
    throw new Error('Operating cash and monthly expenses must be positive');
  }

  // Tier 1: 1.5 months of payroll & opex
  const tier1 = Math.min(totalOperatingCash, monthlyPayrollAndOPEX * 1.5);
  const remainingCash = Math.max(0, totalOperatingCash - tier1);

  // Tier 2: Next buffer up to required lag months
  const desiredTier2 = monthlyPayrollAndOPEX * Math.max(1, unforeseenRevenueLagMonths - 1.5);
  const tier2 = Math.min(remainingCash, desiredTier2);

  // Tier 3: Balance capital
  const tier3 = Math.max(0, remainingCash - tier2);

  // To maintain safe DICGC coverage for retail/SME, or D-SIB systemic safety:
  const recommendedBankCount = Math.max(2, Math.ceil(totalOperatingCash / DICGC_STATUTORY_CAP));
  const maxSafePerBank = Math.round(totalOperatingCash / recommendedBankCount);

  return {
    tier1IntradayBuffer: Math.round(tier1),
    tier2WorkingCapitalBuffer: Math.round(tier2),
    tier3ContingencyReserve: Math.round(tier3),
    recommendedBankCount,
    maxExposurePerBank: maxSafePerBank,
    tieringSummary: `Allocated Tier 1 (₹${Math.round(tier1).toLocaleString('en-IN')}) in D-SIB checking, Tier 2 (₹${Math.round(tier2).toLocaleString('en-IN')}) in auto-sweep/T-Bills, and Tier 3 (₹${Math.round(tier3).toLocaleString('en-IN')}) across ${recommendedBankCount} institutions.`
  };
}
