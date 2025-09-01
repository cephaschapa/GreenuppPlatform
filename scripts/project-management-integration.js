#!/usr/bin/env node

/**
 * Project Management Integration Script
 *
 * This script exports TODOs and tasks to various project management formats
 * and can integrate with external PM tools like GitHub Issues, Jira, Trello, etc.
 */

import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Configuration for different PM tools
const PM_CONFIGS = {
  github: {
    name: "GitHub Issues",
    format: "markdown",
    apiEndpoint: "https://api.github.com/repos/{owner}/{repo}/issues",
    requiresAuth: true,
  },
  jira: {
    name: "Jira",
    format: "json",
    apiEndpoint: "https://{domain}.atlassian.net/rest/api/2/issue",
    requiresAuth: true,
  },
  trello: {
    name: "Trello",
    format: "json",
    apiEndpoint: "https://api.trello.com/1/cards",
    requiresAuth: true,
  },
  linear: {
    name: "Linear",
    format: "json",
    apiEndpoint: "https://api.linear.app/graphql",
    requiresAuth: true,
  },
  csv: {
    name: "CSV Export",
    format: "csv",
    requiresAuth: false,
  },
  json: {
    name: "JSON Export",
    format: "json",
    requiresAuth: false,
  },
};

// Priority mapping for different systems
const PRIORITY_MAPPING = {
  high: {
    github: "high priority",
    jira: "High",
    trello: "red",
    linear: 1,
  },
  medium: {
    github: "medium priority",
    jira: "Medium",
    trello: "yellow",
    linear: 2,
  },
  low: {
    github: "low priority",
    jira: "Low",
    trello: "green",
    linear: 3,
  },
};

/**
 * Load TODOs from our todo system
 */
async function loadTodos() {
  // This would integrate with your todo system
  // For now, I'll create a sample structure based on our cleanup items
  return [
    {
      id: "security-1",
      title: "Fix field ownership verification vulnerability",
      description:
        "Implement authorization checks in PlantAnalysisController.ts:66 to prevent users from accessing other users' field data",
      priority: "high",
      category: "security",
      assignee: null,
      status: "pending",
      estimatedHours: 4,
      tags: ["security", "authorization", "critical"],
      file: "server/controllers/PlantAnalysisController.ts",
      line: 66,
    },
    {
      id: "security-2",
      title: "Fix crop ownership verification vulnerability",
      description:
        "Implement authorization checks in PlantAnalysisController.ts:77 to prevent users from accessing other users' crop data",
      priority: "high",
      category: "security",
      assignee: null,
      status: "pending",
      estimatedHours: 4,
      tags: ["security", "authorization", "critical"],
      file: "server/controllers/PlantAnalysisController.ts",
      line: 77,
    },
    {
      id: "geo-distance",
      title: "Implement geographical distance calculation",
      description:
        "Add proper geographical distance calculation for pest reporting accuracy in PestDiseaseModel.ts:187",
      priority: "medium",
      category: "feature",
      assignee: null,
      status: "pending",
      estimatedHours: 8,
      tags: ["gis", "pest-monitoring", "calculation"],
      file: "server/models/PestDiseaseModel.ts",
      line: 187,
    },
    {
      id: "weather-integration",
      title: "Integrate weather data for risk assessment",
      description:
        "Connect weather API to improve risk assessment calculations in PestDiseaseModel.ts:370-375",
      priority: "medium",
      category: "integration",
      assignee: null,
      status: "pending",
      estimatedHours: 12,
      tags: ["weather-api", "risk-assessment", "external-api"],
      file: "server/models/PestDiseaseModel.ts",
      line: 370,
    },
    {
      id: "console-cleanup",
      title: "Replace console.log with proper logging",
      description:
        "Replace 875 console.log statements with Winston logger calls for better production logging",
      priority: "low",
      category: "maintenance",
      assignee: null,
      status: "pending",
      estimatedHours: 6,
      tags: ["logging", "maintenance", "cleanup"],
      file: "multiple",
      line: null,
    },
  ];
}

/**
 * Export to GitHub Issues format
 */
function exportToGitHub(todos) {
  return todos.map((todo) => ({
    title: `[${todo.category.toUpperCase()}] ${todo.title}`,
    body: `## Description
${todo.description}

## File Location
- **File**: \`${todo.file}\`${todo.line ? `\n- **Line**: ${todo.line}` : ""}

## Priority
${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}

## Estimated Work
${todo.estimatedHours} hours

## Category
${todo.category}

## Technical Details
This issue was automatically generated from codebase cleanup analysis.

### Acceptance Criteria
- [ ] Implement the required functionality
- [ ] Add appropriate tests
- [ ] Update documentation if needed
- [ ] Verify no regression in existing functionality`,
    labels: [
      `priority:${todo.priority}`,
      `category:${todo.category}`,
      ...todo.tags,
      "generated",
    ],
    assignees: todo.assignee ? [todo.assignee] : [],
  }));
}

/**
 * Export to Jira format
 */
function exportToJira(todos) {
  return {
    issues: todos.map((todo) => ({
      fields: {
        project: { key: "GREENUP" }, // You'd set your project key
        summary: `[${todo.category.toUpperCase()}] ${todo.title}`,
        description: `h2. Description
${todo.description}

h2. File Location
*File*: {{${todo.file}}}${todo.line ? `\n*Line*: ${todo.line}` : ""}

h2. Technical Details
This issue was automatically generated from codebase cleanup analysis.

h3. Acceptance Criteria
* Implement the required functionality
* Add appropriate tests  
* Update documentation if needed
* Verify no regression in existing functionality`,
        issuetype: { name: todo.category === "security" ? "Bug" : "Task" },
        priority: { name: PRIORITY_MAPPING[todo.priority].jira },
        labels: todo.tags,
        timetracking: {
          originalEstimate: `${todo.estimatedHours}h`,
        },
      },
    })),
  };
}

/**
 * Export to CSV format
 */
function exportToCSV(todos) {
  const headers = [
    "ID",
    "Title",
    "Description",
    "Priority",
    "Category",
    "Status",
    "Estimated Hours",
    "File",
    "Line",
    "Tags",
  ];

  const rows = todos.map((todo) => [
    todo.id,
    `"${todo.title}"`,
    `"${todo.description}"`,
    todo.priority,
    todo.category,
    todo.status,
    todo.estimatedHours,
    `"${todo.file}"`,
    todo.line || "",
    `"${todo.tags.join(", ")}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Export to Trello format
 */
function exportToTrello(todos) {
  return {
    cards: todos.map((todo) => ({
      name: `[${todo.category.toUpperCase()}] ${todo.title}`,
      desc: `**Description:**
${todo.description}

**File:** \`${todo.file}\`${
        todo.line
          ? `
**Line:** ${todo.line}`
          : ""
      }

**Priority:** ${todo.priority}
**Estimated Hours:** ${todo.estimatedHours}

**Tags:** ${todo.tags.join(", ")}

_Auto-generated from codebase cleanup analysis_`,
      labels: [
        {
          name: `Priority: ${todo.priority}`,
          color: PRIORITY_MAPPING[todo.priority].trello,
        },
        {
          name: `Category: ${todo.category}`,
          color: "blue",
        },
      ],
      due: null, // Could be set based on priority
      idList: "YOUR_TRELLO_LIST_ID", // You'd configure this
    })),
  };
}

/**
 * Generate project management exports
 */
async function generateExports(format = "all") {
  console.log("🎯 Generating Project Management Exports...\n");

  const todos = await loadTodos();
  const timestamp = new Date().toISOString().slice(0, 10);
  const outputDir = "exports/project-management";

  // Create output directory
  await import("fs").then((fs) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  const exports = {};

  if (format === "all" || format === "github") {
    exports.github = exportToGitHub(todos);
    await writeFile(
      `${outputDir}/github-issues-${timestamp}.json`,
      JSON.stringify(exports.github, null, 2)
    );
    console.log("✅ GitHub Issues export created");
  }

  if (format === "all" || format === "jira") {
    exports.jira = exportToJira(todos);
    await writeFile(
      `${outputDir}/jira-import-${timestamp}.json`,
      JSON.stringify(exports.jira, null, 2)
    );
    console.log("✅ Jira import file created");
  }

  if (format === "all" || format === "csv") {
    exports.csv = exportToCSV(todos);
    await writeFile(`${outputDir}/tasks-${timestamp}.csv`, exports.csv);
    console.log("✅ CSV export created");
  }

  if (format === "all" || format === "trello") {
    exports.trello = exportToTrello(todos);
    await writeFile(
      `${outputDir}/trello-import-${timestamp}.json`,
      JSON.stringify(exports.trello, null, 2)
    );
    console.log("✅ Trello import file created");
  }

  // Generate summary report
  const summary = {
    exportDate: new Date().toISOString(),
    totalTasks: todos.length,
    byPriority: {
      high: todos.filter((t) => t.priority === "high").length,
      medium: todos.filter((t) => t.priority === "medium").length,
      low: todos.filter((t) => t.priority === "low").length,
    },
    byCategory: todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {}),
    totalEstimatedHours: todos.reduce(
      (sum, todo) => sum + todo.estimatedHours,
      0
    ),
    files: [...new Set(todos.map((t) => t.file))].length,
  };

  await writeFile(
    `${outputDir}/export-summary-${timestamp}.json`,
    JSON.stringify(summary, null, 2)
  );

  console.log("\n📊 Export Summary:");
  console.log(`- Total Tasks: ${summary.totalTasks}`);
  console.log(`- High Priority: ${summary.byPriority.high}`);
  console.log(`- Medium Priority: ${summary.byPriority.medium}`);
  console.log(`- Low Priority: ${summary.byPriority.low}`);
  console.log(`- Total Estimated Hours: ${summary.totalEstimatedHours}`);
  console.log(`- Files Affected: ${summary.files}`);

  return exports;
}

/**
 * Create webhook integration for real-time sync
 */
function generateWebhookIntegration() {
  const webhookCode = `
// Webhook endpoint for project management integration
// Add this to your Express server

app.post('/api/pm-webhook/:provider', async (req, res) => {
  const { provider } = req.params;
  const { action, task, payload } = req.body;
  
  try {
    switch (provider) {
      case 'github':
        await handleGitHubWebhook(action, payload);
        break;
      case 'jira':
        await handleJiraWebhook(action, payload);
        break;
      case 'trello':
        await handleTrelloWebhook(action, payload);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleGitHubWebhook(action, payload) {
  // Handle GitHub issue updates
  if (action === 'closed' && payload.issue) {
    // Mark corresponding todo as completed
    await updateTodoStatus(payload.issue.id, 'completed');
  }
}

async function handleJiraWebhook(action, payload) {
  // Handle Jira issue updates
  // Implementation depends on your Jira setup
}

async function handleTrelloWebhook(action, payload) {
  // Handle Trello card updates
  // Implementation depends on your Trello setup
}
`;

  return webhookCode;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "export";
  const format = args[1] || "all";

  switch (command) {
    case "export":
      await generateExports(format);
      break;
    case "webhook":
      const webhookCode = generateWebhookIntegration();
      await writeFile("server/webhook-integration.js", webhookCode);
      console.log("✅ Webhook integration code generated");
      break;
    case "help":
      console.log(`
🎯 Project Management Integration Tool

Usage:
  node scripts/project-management-integration.js [command] [format]

Commands:
  export [format] - Export todos to PM format (default: all)
  webhook        - Generate webhook integration code
  help          - Show this help

Formats:
  all     - Export to all formats
  github  - GitHub Issues JSON
  jira    - Jira import JSON
  trello  - Trello import JSON
  csv     - CSV file

Examples:
  node scripts/project-management-integration.js export github
  node scripts/project-management-integration.js export csv
  node scripts/project-management-integration.js webhook
      `);
      break;
    default:
      console.error('Unknown command. Use "help" for usage information.');
      process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

export {
  generateExports,
  exportToGitHub,
  exportToJira,
  exportToCSV,
  exportToTrello,
};


