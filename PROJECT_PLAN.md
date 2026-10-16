# PROJECT PLAN — InvestiQ VaultBanking

**Site Number:** 04 of 60  
**Repository:** `chirag127/investiq-vault-banking`  
**Brand:** InvestiQ India  
**Public Site Title:** VaultBanking — Bank Risk, Deposit Insurance & Operating Cash Systems  
**Live Target URL:** `https://chirag127.github.io/investiq-vault-banking/`  
**Astro Base Path:** `/investiq-vault-banking`  

---

## 1. Objectives & Architectural Requirements
1. **Free-First Stack:**
   - Static Astro v5 with TypeScript (`output: 'static'`, `build: { format: 'directory' }`).
   - Pagefind static search indexing (`pagefind --site dist`).
   - Vitest for deterministic unit testing of financial math functions.
   - Privacy scanner enforcing 0 third-party trackers, beacons, cookies, or remote analytics.
   - Official GitHub Actions Pages deployment (`actions/deploy-pages@v4`, `actions/upload-pages-artifact@v3`).
2. **Editorial Excellence & Content Milestone:**
   - At least 15 comprehensive, master-tier articles covering bank architecture, DICGC legal boundaries, D-SIB classifications, sweep mechanisms, fraud recovery, and institutional cash management.
   - Rich technical diagrams (Mermaid workflows, architecture charts, comparative ASCII/visual tables).
   - Authoritative statutory citations: DICGC Act 1961 (with 2021 Amendment Section 18A), Banking Regulation Act 1949, RBI Master Directions, IT Act 2000, and CBDT Rules.
3. **First-Class Interactive Solvers (Client-Side Only):**
   - **DICGC Deposit Insurance Aggregation Audit:** Multi-bank, multi-branch, multi-capacity account modeling (Individual, Joint 1st holder, Joint 2nd holder, Sole Proprietorship, Minor Guardian, Corporate/LLP/Trust) with set-off loan liabilities and strict ₹5,00,000 threshold enforcement.
   - **Auto-Sweep vs. Standalone Yield & Liquidity Optimizer:** Dynamic modeling of threshold balance, sweep step units, LIFO/FIFO liquidation penalty drag, reverse-sweep breakage cost, and post-tax net yield comparison (Section 80TTA vs 80TTB vs marginal slab).
   - **Institutional Operating Cash & Tiering Planner:** Cash buffer segmentation into Tier 1 (Ultra-liquid intraday/clearing), Tier 2 (Short-term buffer, sweep/liquid funds), and Tier 3 (Strategic core liquidity) with counterparty diversification metrics.
4. **Institutional Quality & Compliance Pages:**
   - Home (`/`), Articles Index (`/articles/`), Solvers (`/calculators/`), Glossary (`/glossary/`), Sources & Gazettes (`/sources/`), FAQ (`/faq/`), Methodology (`/methodology/`), Privacy Architecture (`/privacy/`), Educational Disclaimer (`/disclaimer/`), Corrections (`/corrections/`), 404 (`/404/`).
5. **Quality Gates:**
   - `npm test` passing with thorough coverage of edge cases.
   - `npm run privacy-scan` reporting 0 violations.
   - `npm run build` producing error-free static bundle with Pagefind search index.
   - GitHub push to `main` triggering automated Pages deployment.
