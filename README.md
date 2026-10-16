# VaultBanking — Bank Risk, Deposit Insurance & Operating Cash Systems

**InvestiQ India — Site 04 of 60**  
**Repository:** `chirag127/investiq-vault-banking`  
**Live Target URL:** [https://chirag127.github.io/investiq-vault-banking/](https://chirag127.github.io/investiq-vault-banking/)  
**License:** MIT  

---

## 1. Overview & System Focus
VaultBanking is a standalone, public institutional research repository and quantitative financial analysis suite dedicated to the Indian banking architecture:
1. **Deposit Insurance & Insolvency Limits:** Forensic evaluation of the **Deposit Insurance and Credit Guarantee Corporation (DICGC) Act, 1961** (as amended by the 2021 Amendment Act), the ₹5,00,000 statutory ceiling, the **"Same Right and Capacity"** legal doctrine, and mandatory 90-day interim payout timelines under **Section 18A**.
2. **Systemic Bank Safety (D-SIBs):** Capital surcharge and systemic importance score tracking for Domestic Systemically Important Banks (**State Bank of India, HDFC Bank, ICICI Bank**).
3. **Cash Optimization & Sweeps:** Mathematical simulation of flexi-sweep deposits, chunk step units, **LIFO liquidation order**, premature withdrawal penalty drag, and the tax differential between **Section 80TTA** (savings) and marginal FD tax slabs.
4. **Treasury Management:** Segregation of operating cash into 3 liquidity tiers (Intraday, Working Capital, and Contingency Core) adapted from **Basel III Liquidity Coverage Ratios (LCR)**.

---

## 2. Interactive Client-Side Solvers
- **DICGC Deposit Insurance Aggregation Audit (`/calculators/#dicgc-audit`):** Multi-bank, multi-branch, multi-capacity account modeling with statutory right of set-off deductions.
- **Auto-Sweep vs Savings Yield Optimizer (`/calculators/#auto-sweep-optimizer`):** Computes true net post-tax alpha accounting for premature breakage friction.
- **Operating Cash Tiering & Counterparty Diversification Planner (`/calculators/#cash-tiering-planner`):** Allocates enterprise cash across D-SIBs and multi-bank deposits maintaining 100% DICGC coverage.

---

## 3. Technology Stack & Sovereign Privacy Guarantee
- **Astro v5 (Static Output):** Zero-JS baseline pages, maximum performance, mobile-first responsive layout.
- **TypeScript:** Strict type checking across financial models and content schemas.
- **Pagefind Static Search:** 100% client-side indexed search built into the static bundle with zero remote API dependencies.
- **Vitest:** Deterministic unit testing suite covering financial mathematics algorithms.
- **Zero-Telemetry Architecture:** Zero cookies, zero analytics beacons (Google Analytics, GTM, Meta Pixel, Hotjar, etc.), zero tracking scripts. Enforced via `scripts/privacy-scanner.js` in CI/CD.

---

## 4. Local Development & Verification
```bash
# Install dependencies
npm install

# Run unit tests
npm run test

# Run privacy & telemetry scanner
npm run privacy-scan

# Run local development server
npm run dev

# Run type check, build, and static search indexer
npm run build
```

---

## 5. Primary Statutory Citations
- **DICGC Act, 1961** (Sections 16, 17, 18A, 21)
- **DICGC (Amendment) Act, 2021** (Act No. 30 of 2021)
- **Banking Regulation Act, 1949** (Sections 35A, 42, 45, 45ZA-45ZF)
- **Banking Regulation (Amendment) Act, 2020** (Act No. 39 of 2020)
- **Reserve Bank of India Act, 1934** (Second Schedule Criteria)
- **Income Tax Act, 1961** (Sections 80TTA, 80TTB, 194A)
- **Indian Contract Act, 1872** (Section 171)
- **Supreme Court of India:** *Smt. Sarbati Devi v. Smt. Usha Devi (AIR 1984 SC 346)*
- **Reserve Bank - Integrated Ombudsman Scheme, 2021 (RB-IOS 2021)**
