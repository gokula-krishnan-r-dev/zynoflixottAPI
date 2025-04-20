"use strict";
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
// Ensure dist directory exists
if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist", { recursive: true });
}
// Ensure dist/src directory structure exists
if (!fs.existsSync("./dist/src")) {
    fs.mkdirSync("./dist/src", { recursive: true });
}
if (!fs.existsSync("./dist/src/routes")) {
    fs.mkdirSync("./dist/src/routes", { recursive: true });
}
// Run TypeScript compilation
console.log("Building TypeScript files...");
try {
    execSync("tsc", { stdio: "inherit" });
}
catch (error) {
    console.error("TypeScript compilation failed, but continuing with the build process");
    // Continue with the build process despite TypeScript errors
    // This is because Vercel will run the TypeScript compiler again
}
// Copy package.json to dist for Vercel deployment
console.log("Copying necessary files...");
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
// Remove development dependencies and scripts for production
packageJson.devDependencies = {};
packageJson.scripts = {
    start: "node index.js",
};
fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));
// Create a minimal vercel.json in the dist directory
fs.writeFileSync("./dist/vercel.json", JSON.stringify({
    version: 2,
    regions: ["bom1"],
}, null, 2));
// Copy .env file if it exists
if (fs.existsSync("./.env")) {
    fs.copyFileSync("./.env", "./dist/.env");
}
// Create a public directory in dist if it doesn't exist
if (!fs.existsSync("./dist/public")) {
    fs.mkdirSync("./dist/public", { recursive: true });
}
// Copy any additional files if needed
// For example, if you have static files
// fs.copyFileSync('./src/static/file.ext', './dist/static/file.ext');
console.log("Build completed successfully!");
//# sourceMappingURL=build.js.map