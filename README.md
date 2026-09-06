# LokoChop: Confluence Multi-Kitchen Food Ordering & Dispatch Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![NDPR Compliant](https://img.shields.io/badge/NDPR-Compliant-emerald.svg)](https://ndpc.gov.ng/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**LokoChop** is a production-grade, 100% transparent decentralized culinary marketplace and courier dispatch engine purpose-built for Lokoja, Kogi State, Nigeria. 

The platform empowers local restaurant owners, bukas, and caterers by eliminating delayed payouts, middleman payment withholdings, and inflated food prices. Diners can order dishes from **multiple distinct kitchens simultaneously** in a single checkout, with transparent multi-pickup courier routing, direct Nigerian bank transfers, and real-time WhatsApp order dispatch.

---

## 🌟 Core Features & Innovations

### 1. Multi-Vendor Kitchen Ordering & Transparent Dispatch Fees
- **Cross-Kitchen Cart**: Diners can combine dishes from different kitchens across Lokoja (e.g. Chicken Republic at Paparanda Square, Foodcastle at Ganaja Junction, and Treasures Bakery at Phase 1) into a single unified checkout.
- **Accurate Geographic Dispatch Routing & Neighborhood Tiers**:
  - **Tier 1 (Core Lokoja Corridor)**: Paparanda Square, Post Office, Lokongoma Phase 1/2, GRA, Adankolo, Ganaja Junction (Base ₦800).
  - **Tier 2 (Mid-Range Corridor)**: Felele, Sarkin Noma, Crusher, Zone 8, State Secretariat (₦1,200).
  - **Tier 3 (Highway & Peripheral Corridors)**: Federal Poly By-Pass, Nataco Junction, Zango Daji, Ganaja Village (₦2,000–₦2,200).
- **Location-Based Dispatch Engine & Shared-Location Consolidation**:
  - **Stops-Based Dispatch**: Dispatch fee is computed for each distinct pickup location to the customer's selected destination.
  - **Shared-Location Rule**: If 2 or more vendors reside in the same neighborhood (e.g. two restaurants at Ganaja Junction or Paparanda Square), the dispatch fee for that pickup stop is charged only once and equitably split among those vendors. Diners never pay double dispatch fees for a single courier stop!
  - **Thermal Takeaway Packaging**: ₦250 per kitchen for certified tamper-evident, leak-proof food packaging.
- **Itemized Central Dispatch & Vendor WhatsApp Routing**:
  - Central support receives a structured dispatch manifest detailing the specific dishes, phone hotlines, and bank verification statuses itemized per vendor so dispatch riders collect the exact dishes with zero confusion.

### 2. 100% Financial Transparency & Direct Bank Transfer Protocol
- **Zero In-App Wallet Lockup**: Traditional food delivery platforms withhold customer funds for 7–14 days. LokoChop routes 100% of the food payment directly from the customer's Nigerian banking app (GTBank, OPay, Zenith, First Bank, Kuda, PalmPay) into the verified bank account of each kitchen owner.
- **Payment Verification via Mobile Banking & WhatsApp**:
  - Instant pre-filled WhatsApp receipts generated with order IDs, itemized dish breakdowns, customer delivery landmarks, and transaction reference numbers.
  - Multi-vendor orders provide both consolidated and itemized kitchen transfer instructions with quick copy buttons for bank name, account number, and exact amounts.
- **Voluntary 5% – 8.5% Vendor Remittance**: Vendors voluntarily remit a modest platform maintenance fee weekly from their verified earnings. 0% is deducted at source.

### 3. Comprehensive Logistics & Neighborhood Coverage
- **Three-Tier Delivery Zones**:
  - **Tier 1 (Core Lokoja)**: Post Office, Paparanda Square, Lokongoma, Adankolo, GRA (20–35 min ETA).
  - **Tier 2 (Extended Corridor)**: Felele, Ganaja Road, Crusher, Zone 8, State Secretariat (35–45 min ETA).
  - **Tier 3 (Outer Transit)**: Nataco Junction, Zango Daji, FULokoja Felele Campus, Salem University corridor (45–60 min ETA).
- **Rider Dispatch Dashboard**: Couriers claim active runs, navigate between multiple kitchen pickup locations, and confirm delivery hot to customer doors.

### 4. Role-Based Workspaces & Portals
- **Diner Marketplace**: Browse 14+ authentic bukas, filter by dietary preferences and delivery speeds, search dishes, and save favorites.
- **Vendor Kitchen Hub**: Live 4-column order fulfillment pipeline (Pending Confirmation, Cooking, Packed, Dispatched), sales analytics with interactive Recharts volume visualizations, and remittance calculator.
- **Administrative Command Center**: Oversee platform GMV, audit vendor compliance, supervise store operations, and monitor delivery SLA metrics.
- **Rider Terminal**: Real-time batch pickup notifications, multi-point routes, and delivery status logs.
- **FAQs, Legal & Cost Transparency Hub**: Comprehensive interactive cost calculator, NDPR Privacy Policy, Terms of Service, and Dispute SLA.

---

## 🏛️ System Architecture

```
                                  [ Diner Browser / PWA ]
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
       [ Browse & Cart ]             [ Order Service ]             [ P2P Direct Transfer ]
               │                             │                             │
    Multi-Vendor Detection                   │                     Direct to Vendor NIP
    (₦450/extra kitchen)                     │                     (OPay / GTB / FirstBank)
               │                             │                             │
               └──────────────────────► [ LiveOrder ] ◄────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
            [ WhatsApp Dispatch ]                       [ Storage Engine ]
            • Vendor 1 Notification                     • LocalStorage (Fast Cache)
            • Vendor 2 Notification                     • Firestore Realtime DB
            • Central Dispatch Support
                       │
                       ▼
        [ Kitchen Hub & Rider Terminal ]
```

---

## 📁 Repository Structure (GitHub Standard)

```
lokochop/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── AdminVendorMonitor.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CateringInquiryModal.tsx
│   │   ├── CustomerReviews.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── NotificationsModal.tsx
│   │   ├── PaymentTransferModal.tsx
│   │   ├── PortalModal.tsx
│   │   ├── PwaInstallBanner.tsx
│   │   ├── TermsAndPrivacyModal.tsx
│   │   ├── TermsModal.tsx
│   │   ├── TopNavBar.tsx
│   │   ├── VendorConfirmPaymentModal.tsx
│   │   └── VendorRemittanceModal.tsx
│   ├── data/
│   │   ├── approvedVendors.ts
│   │   ├── authData.ts
│   │   └── mockData.ts
│   ├── services/
│   │   └── orderService.ts
│   ├── views/
│   │   ├── AdminLoginView.tsx
│   │   ├── AdminPortalView.tsx
│   │   ├── MarketplaceView.tsx
│   │   ├── NeighborhoodsView.tsx
│   │   ├── OrderHistoryView.tsx
│   │   ├── OrderTrackingView.tsx
│   │   ├── RiderPortalView.tsx
│   │   ├── TransparencyAndLegalView.tsx
│   │   ├── VendorHubView.tsx
│   │   ├── VendorLoginView.tsx
│   │   ├── VendorOnboardingView.tsx
│   │   └── VendorStorefrontView.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── README.md
├── SECURITY.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lokochop/lokochop.git
   cd lokochop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build & Verification

```bash
# Type check and lint codebase
npm run lint

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 🔒 Security & Privacy (NDPR Compliance)

- **Zero Cardholder Data**: LokoChop does not collect, store, or process debit/credit card numbers or CVVs. All transactions take place within the customer's secure mobile banking application.
- **NDPR Adherence**: User records (names, delivery landmarks, and phone numbers) are handled in strict compliance with the Nigeria Data Protection Regulation 2019 and guidelines from the Nigeria Data Protection Commission (NDPC).
- For security disclosure policies, refer to [SECURITY.md](./SECURITY.md).

---

## 🤝 Contributing

We welcome community contributions from developers across Nigeria and worldwide! Please review our [Contributing Guidelines](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) before submitting Pull Requests.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

© 2026 LokoChop Technologies. Powered by Confluence logistics from Paparanda to Felele.
