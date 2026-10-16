---
title: "DICGC Deposit Insurance: Statutory Limits, Aggregation & Branch Rules"
description: "A definitive guide to the Deposit Insurance and Credit Guarantee Corporation Act, 1961: the ₹5,00,000 statutory limit, all-branch aggregation rules, interest inclusion, and set-off liabilities."
publishedDate: "2026-10-17"
lastVerifiedDate: "2026-10-17"
author: "InvestiQ Banking Quantitative Research Team"
tags: ["dicgc", "deposit-insurance", "aggregation-rules", "bank-default", "rbi-statutes"]
category: "DICGC Deposit Insurance & Statutory Limits"
sources:
  - title: "Deposit Insurance and Credit Guarantee Corporation Act, 1961 (Section 16)"
    url: "https://www.dicgc.org.in"
    publisher: "Government of India / DICGC"
    verifiedDate: "2026-10-17"
  - title: "DICGC Frequently Asked Questions & Operational Guidelines"
    url: "https://www.dicgc.org.in"
    publisher: "Deposit Insurance and Credit Guarantee Corporation"
    verifiedDate: "2026-10-17"
---

The **Deposit Insurance and Credit Guarantee Corporation (DICGC)**, a wholly owned subsidiary of the Reserve Bank of India, is the sole statutory entity empowered by Parliament under the **DICGC Act, 1961** to provide deposit insurance in the Republic of India.

Understanding the precise mathematical and statutory contours of DICGC coverage is essential for any individual or corporate entity holding cash balances in Indian banks.

<div class="mermaid">
flowchart TD
    Depositor["Depositor Cash Balances"] --> BranchA["Branch A: Savings Account (₹2,50,000)"]
    Depositor --> BranchB["Branch B: Fixed Deposit (₹3,00,000)"]
    Depositor --> BranchC["Branch C: Flexi-Sweep FD (₹1,50,000)"]

    BranchA --> Aggregation["Statutory Aggregation under DICGC Act (Single Legal Entity)"]
    BranchB --> Aggregation
    BranchC --> Aggregation

    Aggregation --> TotalCalc["Gross Aggregated Balance: ₹7,00,000"]
    TotalCalc --> SetOff{"Less: Outstanding Loan in Same Capacity?"}
    SetOff -- "Yes: ₹1,00,000 Overdraft" --> NetBal["Net Insurable Balance: ₹6,00,000"]
    SetOff -- "No Loan" --> NetBalNoLoan["Net Insurable Balance: ₹7,00,000"]

    NetBal --> PayoutRule{"Apply Statutory Ceiling (DICGC Act Sec 16)"}
    PayoutRule --> Insured["DICGC Payout: ₹5,00,000 (Maximum Cap)"]
    PayoutRule --> Uninsured["Uninsured Risk: ₹1,00,000 (Subordinated in Liquidation)"]
</div>

<h2 id="statutory-framework">1. Statutory Framework & Acts</h2>

Under **Section 16(1)** of the DICGC Act, 1961 (as amended with effect from February 4, 2020 via the Finance Act and Gazetted notifications), the maximum liability of the Corporation for each depositor in an insured bank is **₹5,00,000 (Five Lakh Rupees)**.

### Crucial Statutory Mechanics:
1. **Principal and Accrued Interest Combined:** The ₹5 Lakh ceiling does **not** apply separately to principal and interest. If an individual holds an FD of ₹4,80,000 and has accrued ₹45,000 in interest up to the date of cancellation of the bank's license or imposition of moratorium, the total claim is ₹5,25,000. DICGC will disburse exactly **₹5,00,000**, leaving the remaining ₹25,000 as an unsecured claim against the official liquidator.
2. **Single Legal Entity Rule (All Branches Clubbed):** A scheduled commercial or cooperative bank constitutes a single corporate legal entity under Indian company and banking law. Opening accounts in different branches (e.g., Branch A in Bengaluru, Branch B in Mumbai, Branch C in New Delhi) does **not** create separate insurance covers. All accounts across all branches nationwide are summed together.
3. **All Deposit Types Aggregated:** The aggregation covers:
   - Savings Bank accounts
   - Current accounts
   - Fixed Deposits (FDs)
   - Recurring Deposits (RDs)
   - Auto-sweep term deposit units

<h2 id="quantitative-mechanics">2. Quantitative Mechanics & Data</h2>

Under **Section 17(1)** of the DICGC Act, 1961, the Corporation has the legal mandate to deduct any outstanding dues owed by the depositor to the same bank before calculating the insurable payout.

<div class="math-display">
$$\text{Net Insurable Balance} = \max\Big(0, \sum \text{Deposits} - \sum \text{Liabilities in Same Capacity}\Big)$$
</div>

<div class="math-display">
$$\text{DICGC Disbursement} = \min\Big(₹5,00,000, \text{Net Insurable Balance}\Big)$$
</div>

### Empirical Banking Capital Data Matrix:

| Institution Category | Mandated Minimum CRAR | DICGC Insured? | Maximum Cover | Regulatory Statute |
| :--- | :--- | :--- | :--- | :--- |
| **Scheduled Commercial Banks (PSBs/Private)** | 11.50% (Basel III) | Yes | ₹5,00,000 | Banking Regulation Act 1949 / RBI Act 1934 |
| **Small Finance Banks (SFBs)** | 15.00% (Loss Buffer) | Yes | ₹5,00,000 | RBI Operating Guidelines for SFBs 2014 |
| **Urban Cooperative Banks (Tier 1-4)** | 9.00% - 12.00% | Yes | ₹5,00,000 | Banking Regulation (Amendment) Act 2020 |
| **Regional Rural Banks (RRBs)** | 9.00% | Yes | ₹5,00,000 | Regional Rural Banks Act 1976 |
| **Primary Agricultural Credit Societies (PACS)** | Varies by State | **NO** | **₹0 (Uninsured)** | State Cooperative Societies Acts |

<h2 id="worked-example">3. Worked Empirical Case Study</h2>

Consider a business owner holding multiple balances and a loan facility at Axis Bank:

| Account / Facility | Nature of Holding | Balance / Outstanding |
| :--- | :--- | :--- |
| Savings Account | Personal Asset | + ₹1,50,000 |
| Fixed Deposit (Branch 1) | Personal Asset | + ₹3,50,000 |
| Auto-Sweep FD (Branch 2) | Personal Asset | + ₹1,00,000 |
| Accrued Quarterly Interest | Accrued Asset | + ₹15,000 |
| **Gross Personal Deposits** | **Total Inflow Claims** | **+ ₹6,15,000** |
| Personal Car Loan Outstanding | Liability at same bank | - ₹2,00,000 |
| **Net Balance after Set-Off** | **Insurable Claim** | **₹4,15,000** |
| **DICGC Insurance Payout** | **Disbursed within 90 days** | **₹4,15,000 (100% of Net)** |

Because the net balance after statutory set-off (₹4,15,000) is below the statutory ceiling of ₹5,00,000, the depositor suffers zero capital impairment.

<h2 id="insolvency-waterfall">4. Insolvency & Resolution Protocol</h2>

When an insured bank fails, the resolution and payout progression follows a strict statutory hierarchy:

<div class="mermaid">
sequenceDiagram
    autonumber
    participant Bank as Distressed Bank
    participant RBI as Reserve Bank of India
    participant DICGC as DICGC
    participant Liquidator as Official Liquidator
    participant Depositor as Uninsured Depositor

    RBI->>Bank: Imposes Section 35A Directions / Moratorium
    Bank->>DICGC: Submits Certified Depositor List (within 45 Days)
    DICGC->>DICGC: Forensic Set-Off & Aggregation Audit (within 30 Days)
    DICGC->>Depositor: Direct Bank Transfer up to ₹5,00,000 (within 15 Days)
    Note over DICGC,Depositor: Section 18A: Guaranteed 90-Day Interim Payout!
    
    Liquidator->>Liquidator: Liquidates Bank Assets & Collects Loans
    Liquidator->>DICGC: Reimburses DICGC Payout First (Section 21 Priority)
    Liquidator->>Depositor: Releases Residual Dividends on Balances > ₹5L (Pro-Rata)
</div>

<h2 id="actionable-checklist">5. Institutional Risk Checklist</h2>

Before parking enterprise operating cash or family reserves in an Indian banking institution, execute the following forensic verification checklist:

- [ ] **Verify Schedule II Status:** Confirm the bank is included in the Second Schedule to the RBI Act, 1934 on `rbi.org.in`.
- [ ] **Verify DICGC Registration:** Check that the bank's name appears on the active list of insured banks at `dicgc.org.in`.
- [ ] **Calculate Gross Cap (Principal + Interest):** Never exceed ₹4,50,000 in initial principal to leave buffer room for cumulative accrued interest under the ₹5 Lakh ceiling.
- [ ] **Partition Across Unrelated Institutions:** For portfolios exceeding ₹5 Lakhs, distribute cash across distinct banking licenses (e.g. SBI, HDFC Bank, ICICI Bank, Bank of Baroda).
- [ ] **Separate Legal Capacities:** Utilize individual accounts, joint accounts with inverted primary applicant orders, minor guardian accounts, and corporate trusts to create separate ₹5 Lakh statutory protections within the same bank.
