# Technical Assessment Portal

![Project Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-orange)

A modern, streamlined web application designed to orchestrate and manage technical engineering assessments. This portal allows recruitment teams and engineering leads to conduct structured, data-driven evaluations with ease, ensuring consistency and transparency across all candidate assessments.

## 🚀 Overview

The **Technical Assessment Portal** transforms complex evaluation matrices into an intuitive, interactive experience. It bridges the gap between raw assessment criteria (defined in CSVs) and the final hiring decision, providing real-time scoring, weighted analytics, and comprehensive candidate profiles.

## ✨ Key Features

### 📋 Structured Assessment Management

- **Library View**: Centralized repository for technical topics, modules, and evaluation criteria.
- **Dynamic Profiles**: Define specific profiles (e.g., Senior Fullstack, DevOps) with custom weightings for each technical module.
- **Multi-Stack Support**: Tailor assessments to specific technology stacks (e.g., React, Java, AWS).

### ⚖️ Advanced Scoring & Analytics

- **Weighted Evaluations**: Automatically calculates scores based on topic importance and profile requirements.
- **Hierarchical Feedback**: Capture notes and scores at the granular topic level, rolling up into module-level and overall aggregates.
- **Assessment Sessions**: Track multiple candidates and sessions simultaneously with unique, navigable IDs.

### 🛠️ Data & Persistence

- **CSV Data Import**: Bulk-load your assessment matrix, profiles, and level mappings via simple CSV files.
- **Backup & Restore**: Portable system state via JSON exports—never lose your evaluation data.
- **Local Persistence**: Zero-database setup; all session data is securely stored in the browser's local storage.

### 🎨 Premium User Experience

- **Sleek Interface**: Built with Tailwind CSS v4 and Lucide icons for a modern, glassmorphic feel.
- **Responsive Design**: fully usable across desktops and tablets.
- **Interactive Modals**: Seamless workflows for data configuration and session creation.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/) (powered by [Rolldown](https://rolldown.rs/))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State & Utils**:
  - `Papa Parse`: High-performance CSV parsing.
  - `Lucide React`: Beautiful, consistent iconography.
  - `File Saver`: Client-side file generation for backups.

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/JustMeGaaRa/assessment.webapp.git
   cd assessment.webapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📊 CSV Import Specification

To get started, you can import your existing assessment matrix via CSV. The application expects the following formats:

### 1. Topics CSV (Required)

Defines the technical topics and their stack-specific evaluation criteria.

- **Columns**: `Module Code`, `Module Name`, `Topic`, `[Stack Name 1]`, `[Stack Name 2]`, ...
- **Example**: `BE-01, Backend Core, Event-Driven Architecture, Node.js Patterns, Java Spring Events`

### 2. Profiles CSV (Required)

Defines how different candidate profiles weight each technical module.

- **Columns**: `Module Code`, `Module Name`, `[Profile Name 1] %`, `[Profile Name 2] %`, ...
- **Example**: `BE-01, Backend Core, 100, 80` (where 100/80 are weights for Senior/Mid-level)

### 3. Modules CSV (Optional)

Provides detailed summaries/descriptions for each module.

- **Columns**: `Module Code`, `Module Name`, `Module Summary`

### 4. Levels CSV (Optional)

Maps total weighted scores to descriptive levels (e.g., Junior, Mid, Senior).

- **Columns**: `Level`, `Min Score`, `Max Score`
- **Example**: `Senior Engineer, 4.5, 5.0`

---

## 📁 Project Structure

```text
src/
├── components/      # Reusable UI primitives and feature-specific components
│   ├── assessment/  # Evaluation and scoring components
│   ├── dashboard/   # Session cards and management
│   ├── home/        # Landing page forms
│   ├── library/     # Criteria display components
│   └── ui/          # Generic UI elements (Modals, Headers, etc.)
├── pages/           # Main route-level view components
├── utils/           # Helper functions for CSV parsing and backups
├── types.ts         # Centralized TypeScript interfaces
└── App.tsx          # Application root and state management
```

## 📖 How to Use

1. **Initial Setup**: On your first visit, the portal will prompt you to import your assessment data.
2. **Import Data**: Prepare CSV files for **Profiles**, **Topics**, **Modules**, and **Levels**. Upload them via the Configuration modal.
3. **Set Assessor**: Enter your name to identify who is conducting the evaluations.
4. **Start Assessment**: Click "New Assessment", enter the candidate's name, and select their profile and stack.
5. **Conduct Evaluation**: Navigate to the candidate's session and grade them topic by topic.
6. **Save & Backup**: Export your assessment data periodically using the "Backup" button to ensure safety.

---

Built with ❤️ by the Engineering Team.
