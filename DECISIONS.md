# ARCHITECTURAL DECISIONS — InvestiQ VaultBanking

## DECISION 01: Universal Design Tokens & Color Harmony
- **Decision:** Align with InvestiQ India's sovereign dark-terminal aesthetic (`tokens.css`, `global.css`) using deep navy/charcoal backgrounds (`#0d1117`), high-contrast accessible typography, institutional borders, and gold/blue accent badges.
- **Rationale:** Ensures visual parity across all 60 sites in the InvestiQ network while maintaining WCAG AAA/AA accessibility compliance and zero external fonts or bloated stylesheet dependencies.

## DECISION 02: DICGC Mathematical Modeling Specification
- **Decision:** Model the DICGC statutory rules strictly according to the DICGC Act 1961 and the 2021 Amendment Act (effective Sept 1, 2021):
  1. Principal + accrued interest combined cap at ₹5,00,000 per depositor per insured bank.
  2. All branches of the same bank are legally merged into one entity.
  3. "Same right and capacity":
     - Personal savings, current accounts, fixed deposits, recurring deposits, and auto-sweep FDs held by Person X are aggregated.
     - Sole proprietorship accounts are merged with the individual proprietor's personal accounts.
  4. "Different right and capacity":
     - Joint accounts (e.g., A & B, where A is primary) are separate from B & A (where B is primary), and separate from single accounts of A or B.
     - Formal Trusts, Partnerships, and Registered Companies have separate corporate/entity capacity.
     - Guardian on behalf of minor is distinct from guardian's own personal account.
  5. Right of Set-Off: Outstanding loans / overdrafts in the same right and capacity at the same bank must be deducted before arriving at the insurable deposit balance.
  6. 90-Day Statutory Interim Payout under Section 18A: 45 days (bank list) + 30 days (DICGC verification) + 15 days (disbursement).

## DECISION 03: Auto-Sweep Yield & Breakage Optimization
- **Decision:** Calculate effective returns taking into account:
  - Base threshold retained in savings account earning savings interest (typically 2.70% - 3.50% p.a.).
  - Incremental swept chunks locked in term deposits earning FD rates (e.g. 6.50% - 7.50% p.a.).
  - Premature withdrawal breakage penalty (usually 0.50% - 1.00% reduction on the applicable contracted rate for the broken slab).
  - LIFO (Last-In-First-Out) liquidation methodology deployed by major Indian commercial banks (HDFC, SBI, ICICI) to minimize broken deposit age.
  - Tax drag under Section 80TTA (₹10,000 exemption strictly for savings account interest, not FD interest) vs marginal income tax slab for swept FD earnings.

## DECISION 04: Client-Side Privacy & Sovereign Zero-Telemetry Architecture
- **Decision:** Every financial input entered into calculators remains strictly within browser memory (`localStorage` only when explicitly requested by user; no external API calls, zero analytics scripts, zero tracking pixels).
- **Verification:** Script `scripts/privacy-scanner.js` included in CI pipeline to halt deployment if any tracking pattern is detected.
