const { execSync } = require("child_process");
try {
  console.log("[Prettier][Staged files] ...");

  // Get list of staged files using git diff
  const command = 'git diff --cached --name-only --diff-filter=ACM -- "*.php" "*.json"';
  console.log(`Executing command: ${command}`);
  const stdout = execSync(command, { encoding: "utf-8" });
  const files = stdout.trim().split("\n");
  if (files.length > 10) {
    console.log(`[Prettier][File] all`);
    execSync(`npx prettier --write .`);
  } else
    files.forEach((file) => {
      try {
        if (!file) {
          return;
        }
        console.log(`[Prettier][File] ${file}`);
        execSync(`npx prettier --write "${file}"`);
        execSync(`git add "${file}"`);
        console.log(`Staged ${file}`);
      } catch (error) {
        console.error(`Error formatting ${file}:`, error.stderr.toString());
        process.exit(1);
      }
    });

  console.log("[Prettier][Staged files] done");
} catch (error) {
  console.error(`Error executing command: ${error}`);
}
