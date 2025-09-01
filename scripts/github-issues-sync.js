#!/usr/bin/env node

/**
 * GitHub Issues Sync Script
 *
 * This script syncs our TODOs with GitHub Issues for external project management
 * Run: node scripts/github-issues-sync.js
 */

import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";

// Configuration - set these environment variables or modify here
const GITHUB_CONFIG = {
  owner: process.env.GITHUB_OWNER || "your-github-username",
  repo: process.env.GITHUB_REPO || "greenupp-platform",
  token: process.env.GITHUB_TOKEN || null, // Personal Access Token
  apiBase: "https://api.github.com",
};

/**
 * Our current TODOs from the cleanup analysis
 */
const TODOS = [
  {
    id: "security-1",
    title: "Fix field ownership verification vulnerability",
    description: `**CRITICAL SECURITY ISSUE**

Users can currently access other users' field data due to missing authorization checks.

**Location:** \`server/controllers/PlantAnalysisController.ts:66\`

**Problem:**
\`\`\`typescript
// TODO: check field ownership
const analyses = await PlantAnalysisModel.getByField(fieldId);
\`\`\`

**Required Fix:**
1. Add field ownership verification before returning data
2. Ensure users can only access their own fields
3. Add proper error handling for unauthorized access

**Security Impact:** HIGH - Data breach potential`,
    priority: "high",
    labels: ["security", "critical", "authorization", "vulnerability"],
    assignees: [],
    estimatedHours: 4,
    category: "security",
  },
  {
    id: "security-2",
    title: "Fix crop ownership verification vulnerability",
    description: `**CRITICAL SECURITY ISSUE**

Users can currently access other users' crop data due to missing authorization checks.

**Location:** \`server/controllers/PlantAnalysisController.ts:77\`

**Problem:**
\`\`\`typescript
// TODO: check crop ownership
const analyses = await PlantAnalysisModel.getByCrop(cropId);
\`\`\`

**Required Fix:**
1. Add crop ownership verification before returning data
2. Ensure users can only access their own crops
3. Add proper error handling for unauthorized access

**Security Impact:** HIGH - Data breach potential`,
    priority: "high",
    labels: ["security", "critical", "authorization", "vulnerability"],
    assignees: [],
    estimatedHours: 4,
    category: "security",
  },
  {
    id: "geo-distance",
    title: "Implement geographical distance calculation for pest reporting",
    description: `**Feature Enhancement**

Improve pest reporting accuracy by implementing proper geographical distance calculations.

**Location:** \`server/models/PestDiseaseModel.ts:187\`

**Current Issue:**
\`\`\`typescript
eq(pestReports.location, location), // TODO: Implement geographical distance calculation
\`\`\`

**Required Implementation:**
1. Replace exact location matching with radius-based proximity
2. Use PostGIS or similar GIS library for distance calculations  
3. Add configurable radius parameters
4. Optimize query performance for large datasets

**Business Impact:** Improved pest outbreak detection and early warning system`,
    priority: "medium",
    labels: ["enhancement", "gis", "pest-monitoring", "database"],
    assignees: [],
    estimatedHours: 8,
    category: "feature",
  },
  {
    id: "weather-integration",
    title: "Integrate weather data for enhanced risk assessment",
    description: `**Feature Enhancement**

Integrate real-time weather data to improve pest risk assessment calculations.

**Location:** \`server/models/PestDiseaseModel.ts:370-375\`

**Current Issue:**
\`\`\`typescript
weatherSuitability: 50, // TODO: Integrate with weather data
seasonalRisk: 60, // TODO: Calculate based on seasonality data
\`\`\`

**Required Implementation:**
1. Integrate with weather API (OpenWeatherMap, etc.)
2. Create weather-based risk calculation algorithms
3. Add historical weather data analysis
4. Implement seasonal risk patterns
5. Cache weather data for performance

**Business Impact:** More accurate pest risk predictions for farmers`,
    priority: "medium",
    labels: [
      "enhancement",
      "weather-api",
      "risk-assessment",
      "external-integration",
    ],
    assignees: [],
    estimatedHours: 12,
    category: "feature",
  },
  {
    id: "console-cleanup",
    title: "Replace console.log statements with proper logging",
    description: `**Code Quality & Maintenance**

Replace 875 console.log statements across 115 files with proper Winston logger calls.

**Analysis Results:**
- 875 total console statements found
- Mix of info, error, warn, and debug levels
- Impacts production logging and debugging

**Implementation Plan:**
1. Use generated script: \`scripts/apply-console-replacements.js\`
2. Review each replacement for context appropriateness
3. Remove debug statements that shouldn't be in production
4. Ensure all logger imports are added
5. Test logging in different environments

**Files Affected:** 115 files across client and server

**Automation Available:** Yes - auto-replacement script generated`,
    priority: "low",
    labels: ["maintenance", "logging", "code-quality", "cleanup"],
    assignees: [],
    estimatedHours: 6,
    category: "maintenance",
  },
  {
    id: "expert-emails",
    title: "Create experts database and management system",
    description: `**Feature Enhancement**

Create proper database table and management interface for agricultural experts.

**Location:** \`server/services/pest-alert-service.ts:276\`

**Current Issue:**
\`\`\`typescript
// TODO: Get list of agricultural experts from database
const expertEmails = [
  // Add expert email addresses here
];
\`\`\`

**Required Implementation:**
1. Create experts database table with contact information
2. Build admin interface for expert management
3. Add expert specialization/location fields
4. Implement expert notification preferences
5. Add expert verification system

**Business Impact:** Improved expert engagement and response times`,
    priority: "medium",
    labels: ["enhancement", "database", "admin-interface", "experts"],
    assignees: [],
    estimatedHours: 10,
    category: "feature",
  },
];

/**
 * Convert TODO to GitHub Issue format
 */
function todoToGitHubIssue(todo) {
  const priorityEmoji = {
    high: "🚨",
    medium: "⚡",
    low: "🔧",
  };

  const categoryEmoji = {
    security: "🔒",
    feature: "✨",
    maintenance: "🛠️",
    bug: "🐛",
  };

  return {
    title: `${priorityEmoji[todo.priority]} [${todo.category.toUpperCase()}] ${
      todo.title
    }`,
    body: `${categoryEmoji[todo.category]} **${
      todo.category.charAt(0).toUpperCase() + todo.category.slice(1)
    } Issue**

${todo.description}

---

## 📋 Task Details
- **Priority:** ${todo.priority.toUpperCase()}
- **Category:** ${todo.category}
- **Estimated Hours:** ${todo.estimatedHours}
- **ID:** \`${todo.id}\`

## ✅ Acceptance Criteria
- [ ] Implement the required functionality
- [ ] Add appropriate tests
- [ ] Update documentation if needed
- [ ] Verify no regression in existing functionality
- [ ] Code review completed

---
*This issue was automatically generated from codebase cleanup analysis.*`,
    labels: [
      `priority:${todo.priority}`,
      `category:${todo.category}`,
      `estimate:${todo.estimatedHours}h`,
      ...todo.labels,
      "auto-generated",
    ],
    assignees: todo.assignees || [],
  };
}

/**
 * Create GitHub Issues (requires authentication)
 */
async function createGitHubIssues() {
  if (!GITHUB_CONFIG.token) {
    console.log(
      "❌ GitHub token not provided. Issues will be exported to JSON instead."
    );
    return exportToJSON();
  }

  console.log("🔄 Creating GitHub Issues...\n");

  const createdIssues = [];

  for (const todo of TODOS) {
    const issue = todoToGitHubIssue(todo);

    try {
      const response = await fetch(
        `${GITHUB_CONFIG.apiBase}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${GITHUB_CONFIG.token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(issue),
        }
      );

      if (response.ok) {
        const createdIssue = await response.json();
        createdIssues.push(createdIssue);
        console.log(`✅ Created issue #${createdIssue.number}: ${todo.title}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create issue for ${todo.title}: ${error}`);
      }
    } catch (error) {
      console.error(
        `❌ Error creating issue for ${todo.title}:`,
        error.message
      );
    }
  }

  console.log(`\n🎉 Created ${createdIssues.length} GitHub issues!`);
  return createdIssues;
}

/**
 * Export issues to JSON (for manual import or review)
 */
async function exportToJSON() {
  console.log("📝 Exporting issues to JSON...\n");

  const issues = TODOS.map(todoToGitHubIssue);
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalIssues: issues.length,
      repository: `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
      summary: {
        high: TODOS.filter((t) => t.priority === "high").length,
        medium: TODOS.filter((t) => t.priority === "medium").length,
        low: TODOS.filter((t) => t.priority === "low").length,
      },
    },
    issues,
  };

  const filename = `exports/github-issues-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  // Ensure exports directory exists
  const fs = await import("fs");
  if (!fs.existsSync("exports")) {
    fs.mkdirSync("exports", { recursive: true });
  }

  await writeFile(filename, JSON.stringify(exportData, null, 2));

  console.log(`✅ Issues exported to: ${filename}`);
  console.log("\n📋 Summary:");
  console.log(`- Total Issues: ${exportData.metadata.totalIssues}`);
  console.log(`- High Priority: ${exportData.metadata.summary.high}`);
  console.log(`- Medium Priority: ${exportData.metadata.summary.medium}`);
  console.log(`- Low Priority: ${exportData.metadata.summary.low}`);

  console.log("\n🚀 Next Steps:");
  console.log("1. Review the exported JSON file");
  console.log(
    "2. Set GITHUB_TOKEN environment variable for automatic creation"
  );
  console.log("3. Or manually create issues using the exported data");

  return exportData;
}

/**
 * Generate setup instructions
 */
function generateSetupInstructions() {
  return `
# GitHub Issues Integration Setup

## 🔧 Environment Setup

1. **Create GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a new token with 'repo' permissions
   - Copy the token

2. **Configure Environment:**
   \`\`\`bash
   export GITHUB_TOKEN="your_personal_access_token"
   export GITHUB_OWNER="your-github-username"
   export GITHUB_REPO="greenupp-platform"
   \`\`\`

3. **Run the sync:**
   \`\`\`bash
   node scripts/github-issues-sync.js
   \`\`\`

## 🔄 Workflow Integration

### Webhook Setup (Optional)
Add this webhook URL to your GitHub repository:
\`https://your-domain.com/api/pm-webhook/github\`

### Local Development
\`\`\`bash
# Export issues to JSON (no auth required)
node scripts/github-issues-sync.js --export-only

# Create issues on GitHub (requires token)
node scripts/github-issues-sync.js --create
\`\`\`

## 📊 Issue Labels

The script automatically adds these labels:
- \`priority:high/medium/low\`
- \`category:security/feature/maintenance\`
- \`estimate:Xh\` (hours)
- Custom labels based on issue type
- \`auto-generated\`

## 🎯 Benefits

1. **External Tracking**: Track progress outside your main codebase
2. **Team Collaboration**: Share issues with team members easily  
3. **Project Management**: Use GitHub Projects for kanban boards
4. **Integration**: Connect with other tools via GitHub API
5. **Automation**: Auto-close issues when PRs are merged
`;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log("🎯 GitHub Issues Integration\n");

  switch (command) {
    case "--export-only":
      await exportToJSON();
      break;
    case "--create":
      await createGitHubIssues();
      break;
    case "--setup":
      const instructions = generateSetupInstructions();
      await writeFile("docs/GITHUB_ISSUES_SETUP.md", instructions);
      console.log("✅ Setup instructions created: docs/GITHUB_ISSUES_SETUP.md");
      break;
    case "--help":
      console.log(`
🎯 GitHub Issues Sync Tool

Usage:
  node scripts/github-issues-sync.js [command]

Commands:
  --export-only  Export issues to JSON (no GitHub auth required)
  --create       Create issues on GitHub (requires GITHUB_TOKEN)
  --setup        Generate setup instructions
  --help         Show this help

Environment Variables:
  GITHUB_TOKEN   Personal access token for GitHub API
  GITHUB_OWNER   GitHub username or organization
  GITHUB_REPO    Repository name
      `);
      break;
    default:
      // Default behavior: try to create issues, fall back to export
      if (GITHUB_CONFIG.token) {
        await createGitHubIssues();
      } else {
        console.log("ℹ️  No GitHub token provided, exporting to JSON...\n");
        await exportToJSON();
      }
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

export { createGitHubIssues, exportToJSON, todoToGitHubIssue };


