const fs = require("fs");
const { execSync } = require("child_process");

// Ensure dist directory exists
if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist", { recursive: true });
}

// Run TypeScript compilation
console.log("Building TypeScript files...");
execSync("tsc", { stdio: "inherit" });

// Copy any additional files if needed
// For example, if you have static files
// fs.copyFileSync('./src/static/file.ext', './dist/static/file.ext');

console.log("Build completed successfully!");
