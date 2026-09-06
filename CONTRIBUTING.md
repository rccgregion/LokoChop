# Contributing to LokoChop

Thank you for your interest in contributing to **LokoChop**! We welcome contributions to enhance Nigeria's most transparent, multi-kitchen food ordering and logistics platform.

---

## 📜 Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat all community members with respect and courtesy.

---

## 🛠️ Development Workflow

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/lokochop.git
   cd lokochop
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/multi-vendor-enhancement
   # or
   git checkout -b fix/dispatch-fee-rounding
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Verify Build & Types**:
   Ensure all TypeScript types and ESLint checks pass without errors:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📝 Commit Guidelines

We enforce **Conventional Commits**:
- `feat: <description>` for new user-facing features.
- `fix: <description>` for bug fixes.
- `docs: <description>` for documentation updates.
- `refactor: <description>` for internal code refactoring.
- `test: <description>` for test updates.
- `perf: <description>` for performance optimizations.

---

## 🚀 Pull Request Checklist

Before submitting a Pull Request:
- [ ] Code compiles without TypeScript errors (`npm run build`).
- [ ] Lint checks pass cleanly (`npm run lint`).
- [ ] No sensitive credentials, API keys, or personal bank accounts hardcoded.
- [ ] Responsive design verified on both mobile and desktop viewports.
- [ ] PR description clearly explains the changes and references any related issue.

---

## 💬 Community & Questions

For questions or feedback regarding the codebase or Lokoja logistics operations, reach out to the development team at `dev@lokochop.ng` or via WhatsApp Support at `+2349074072454`.
