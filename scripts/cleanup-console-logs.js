#!/usr/bin/env node

/**
 * Console Log Cleanup Script
 *
 * This script identifies and categorizes console.log statements that should be
 * replaced with proper logging using the Winston logger.
 */

import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import path from "path";

const IGNORE_PATTERNS = [
  "node_modules/**",
  "dist/**",
  "build/**",
  "*.log",
  "package-lock.json",
];

// Patterns that are okay to keep (legitimate console usage)
const KEEP_PATTERNS = [
  /console\.log.*Development.*mode/i, // Development mode notifications
  /console\.log.*EMAIL.*DEVELOPMENT/i, // Email development logging
  /console\.error.*catch/i, // Error handling in catch blocks
  /scripts\/.*\.js/, // Build/utility scripts
  /.*\.config\./, // Config files
];

// Categories of console usage
const CATEGORIES = {
  DEBUG: /console\.log.*debug|console\.log.*Debug/i,
  ERROR: /console\.error/,
  WARN: /console\.warn/,
  INFO: /console\.log/,
  DEVELOPMENT: /console\.log.*dev|console\.log.*Dev|console\.log.*development/i,
};

async function findConsoleStatements() {
  console.log("🔍 Scanning for console statements...\n");

  const files = await glob("**/*.{ts,tsx,js,jsx}", {
    ignore: IGNORE_PATTERNS,
    cwd: process.cwd(),
  });

  const results = {
    toReplace: [],
    toKeep: [],
    summary: {
      total: 0,
      debug: 0,
      error: 0,
      warn: 0,
      info: 0,
      development: 0,
    },
  };

  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (
          !trimmedLine ||
          trimmedLine.startsWith("//") ||
          trimmedLine.startsWith("*")
        ) {
          return;
        }

        // Check for console statements
        if (/console\.(log|error|warn|info|debug)/.test(trimmedLine)) {
          results.summary.total++;

          // Categorize
          let category = "INFO";
          if (CATEGORIES.DEBUG.test(trimmedLine)) {
            category = "DEBUG";
            results.summary.debug++;
          } else if (CATEGORIES.ERROR.test(trimmedLine)) {
            category = "ERROR";
            results.summary.error++;
          } else if (CATEGORIES.WARN.test(trimmedLine)) {
            category = "WARN";
            results.summary.warn++;
          } else if (CATEGORIES.DEVELOPMENT.test(trimmedLine)) {
            category = "DEVELOPMENT";
            results.summary.development++;
          } else {
            results.summary.info++;
          }

          const entry = {
            file,
            line: lineNumber,
            content: trimmedLine,
            category,
          };

          // Check if this should be kept
          const shouldKeep = KEEP_PATTERNS.some((pattern) => {
            if (pattern instanceof RegExp) {
              return pattern.test(trimmedLine) || pattern.test(file);
            }
            return false;
          });

          if (shouldKeep) {
            results.toKeep.push(entry);
          } else {
            results.toReplace.push(entry);
          }
        }
      });
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  return results;
}

function generateReport(results) {
  console.log("📊 Console Log Cleanup Report");
  console.log("===============================\n");

  console.log("📈 Summary:");
  console.log(`  Total console statements: ${results.summary.total}`);
  console.log(`  To replace: ${results.toReplace.length}`);
  console.log(`  To keep: ${results.toKeep.length}`);
  console.log(`  
  Breakdown:
    • Debug: ${results.summary.debug}
    • Error: ${results.summary.error}  
    • Warn: ${results.summary.warn}
    • Info: ${results.summary.info}
    • Development: ${results.summary.development}\n`);

  if (results.toReplace.length > 0) {
    console.log("🚨 Console statements that should be replaced with logger:");
    console.log("=========================================================\n");

    // Group by file
    const byFile = results.toReplace.reduce((acc, item) => {
      if (!acc[item.file]) acc[item.file] = [];
      acc[item.file].push(item);
      return acc;
    }, {});

    Object.entries(byFile).forEach(([file, statements]) => {
      console.log(`📄 ${file}:`);
      statements.forEach((stmt) => {
        console.log(`  Line ${stmt.line}: ${stmt.content} [${stmt.category}]`);
      });
      console.log("");
    });
  }

  console.log("\n💡 Recommended Actions:");
  console.log("========================");
  console.log(
    "1. Replace console.log with logger.info() for informational messages"
  );
  console.log("2. Replace console.error with logger.error() for errors");
  console.log("3. Replace console.warn with logger.warn() for warnings");
  console.log(
    "4. Replace console.debug with logger.debug() for debug messages"
  );
  console.log("5. Consider removing debug statements in production code");
  console.log("\nExample replacements:");
  console.log('  console.log("Info message") → logger.info("Info message")');
  console.log(
    '  console.error("Error:", error) → logger.error("Error:", error)'
  );

  return results;
}

async function generateCleanupScript(results) {
  const script = `#!/usr/bin/env node

/**
 * Auto-generated console.log replacement script
 * Generated on: ${new Date().toISOString()}
 * 
 * This script will replace console statements with proper logger calls.
 * Review before running!
 */

import { readFile, writeFile } from 'fs/promises';

const replacements = [
${results.toReplace
  .map((item) => {
    const loggerMethod =
      item.category.toLowerCase() === "error"
        ? "error"
        : item.category.toLowerCase() === "warn"
        ? "warn"
        : item.category.toLowerCase() === "debug"
        ? "debug"
        : "info";

    return `  {
    file: "${item.file}",
    line: ${item.line},
    original: ${JSON.stringify(item.content)},
    replacement: ${JSON.stringify(
      item.content.replace(
        /console\.(log|error|warn|info|debug)/,
        `logger.${loggerMethod}`
      )
    )},
    category: "${item.category}"
  }`;
  })
  .join(",\n")}
];

console.log('⚠️  This is an auto-generated script. Review carefully before running!');
console.log('🔄 To apply replacements, uncomment the replacement logic below.\\n');

// Uncomment to apply replacements:
/*
for (const replacement of replacements) {
  try {
    const content = await readFile(replacement.file, 'utf-8');
    const lines = content.split('\\n');
    
    if (lines[replacement.line - 1].trim() === replacement.original) {
      lines[replacement.line - 1] = lines[replacement.line - 1].replace(
        replacement.original,
        replacement.replacement
      );
      
      await writeFile(replacement.file, lines.join('\\n'));
      console.log(\`✅ Updated \${replacement.file}:\${replacement.line}\`);
    } else {
      console.log(\`⚠️  Skipped \${replacement.file}:\${replacement.line} - content changed\`);
    }
  } catch (error) {
    console.error(\`❌ Error updating \${replacement.file}:\`, error.message);
  }
}
*/

console.log('\\n📊 Summary:');
console.log(\`Total replacements identified: \${replacements.length}\`);
console.log('\\n💡 Manual review recommended for:');
console.log('  • Debug statements that should be removed entirely');
console.log('  • Temporary logging that should be deleted');
console.log('  • Performance-sensitive logging');
`;

  await writeFile("scripts/apply-console-replacements.js", script);
  console.log(
    "📝 Generated cleanup script: scripts/apply-console-replacements.js"
  );
}

// Main execution
async function main() {
  try {
    const results = await findConsoleStatements();
    generateReport(results);
    await generateCleanupScript(results);

    console.log("\n🎯 Next Steps:");
    console.log("1. Review the report above");
    console.log("2. Examine scripts/apply-console-replacements.js");
    console.log("3. Manually update critical files first");
    console.log("4. Run the auto-replacement script for bulk changes");
    console.log("5. Test thoroughly after changes");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

main();
