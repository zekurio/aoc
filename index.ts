import * as fs from "fs";
import * as path from "path";

// ANSI color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const c = {
  success: (text: string) => `${colors.green}${text}${colors.reset}`,
  error: (text: string) => `${colors.red}${text}${colors.reset}`,
  warn: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  header: (text: string) =>
    `${colors.bold}${colors.magenta}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bold}${text}${colors.reset}`,
};

function printBanner() {
  console.log(`${colors.cyan}Advent of Code Runner${colors.reset}\n`);
}

function getSessionToken(): string | null {
  if (process.env.AOC_SESSION) return process.env.AOC_SESSION;
  const sessionPath = path.join(process.cwd(), ".session");
  if (fs.existsSync(sessionPath))
    return fs.readFileSync(sessionPath, "utf8").trim();
  return null;
}

async function downloadInput(year: number, day: number): Promise<void> {
  const session = getSessionToken();
  if (!session) {
    console.log(c.error("[!] No session token found!"));
    console.log(c.dim("    Set AOC_SESSION env var or create .session file"));
    process.exit(1);
  }

  const url = `https://adventofcode.com/${year}/day/${day}/input`;
  const dayDir = path.join(
    process.cwd(),
    year.toString(),
    day.toString().padStart(2, "0"),
  );
  const inputPath = path.join(dayDir, "input");

  console.log(c.info(`[*] Downloading input for ${year} Day ${day}...`));

  try {
    const response = await fetch(url, {
      headers: {
        Cookie: `session=${session}`,
        "User-Agent": "github.com/zekurio/aoc by aoc@zekurio.dev",
      },
    });

    if (!response.ok) {
      if (response.status === 404)
        console.log(c.error("[!] Puzzle not available yet (404)"));
      else if (response.status === 400)
        console.log(c.error("[!] Invalid session token (400)"));
      else console.log(c.error(`[!] Failed to download: ${response.status}`));
      process.exit(1);
    }

    const input = await response.text();
    if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });
    fs.writeFileSync(inputPath, input);
    console.log(c.success(`[+] Input saved to ${inputPath}`));
  } catch (error) {
    console.log(c.error(`[!] Failed to download input: ${error}`));
    process.exit(1);
  }
}

async function runSolution(year: number, day: number): Promise<void> {
  const dayPadded = day.toString().padStart(2, "0");
  const solutionPath = path.join(
    process.cwd(),
    year.toString(),
    dayPadded,
    "index.ts",
  );

  if (!fs.existsSync(solutionPath)) {
    console.log(c.error(`[!] No solution found at ${solutionPath}`));
    console.log(c.dim(`    Run 'aoc new ${year} ${day}' to create one`));
    process.exit(1);
  }

  console.log(c.header(`\nAdvent of Code ${year} - Day ${day}\n`));
  console.log(c.dim("─".repeat(40)));

  try {
    const module = await import(`./${year}/${dayPadded}/index.ts`);

    const startTime1 = performance.now();
    if (typeof module.part1 === "function") {
      const result1 = await module.part1();
      const time1 = (performance.now() - startTime1).toFixed(2);
      console.log(
        `${c.info("Part 1:")} ${c.success(String(result1))} ${c.dim(`(${time1}ms)`)}`,
      );
    }

    const startTime2 = performance.now();
    if (typeof module.part2 === "function") {
      const result2 = await module.part2();
      const time2 = (performance.now() - startTime2).toFixed(2);
      console.log(
        `${c.info("Part 2:")} ${c.success(String(result2))} ${c.dim(`(${time2}ms)`)}`,
      );
    }

    console.log(c.dim("─".repeat(40)) + "\n");
  } catch (error) {
    console.log(c.error(`[!] Error running solution: ${error}`));
    process.exit(1);
  }
}

function scaffoldDay(year: number, day: number): void {
  const dayPadded = day.toString().padStart(2, "0");
  const dayDir = path.join(process.cwd(), year.toString(), dayPadded);
  const solutionPath = path.join(dayDir, "index.ts");

  if (fs.existsSync(solutionPath)) {
    console.log(c.warn(`[!] Solution already exists at ${solutionPath}`));
    process.exit(1);
  }

  const template = `import * as fs from "fs";

function readInput(): string {
  return fs.readFileSync("./${year}/${dayPadded}/input", "utf8").trim();
}

export function part1(): number | string {
  const input = readInput();
  const lines = input.split("\\n");
  return 0;
}

export function part2(): number | string {
  const input = readInput();
  const lines = input.split("\\n");
  return 0;
}

if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
`;

  if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });
  fs.writeFileSync(solutionPath, template);
  console.log(c.success(`[+] Created ${solutionPath}`));

  const inputPath = path.join(dayDir, "input");
  if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(inputPath, "");
    console.log(c.success(`[+] Created ${inputPath}`));
  }

  console.log(c.info(`\n    Next steps:`));
  console.log(c.dim(`    1. Download input: aoc download ${year} ${day}`));
  console.log(c.dim(`    2. Implement your solution`));
  console.log(c.dim(`    3. Run: aoc run ${year} ${day}\n`));
}

async function runAllSolutions(year: number): Promise<void> {
  const yearDir = path.join(process.cwd(), year.toString());

  if (!fs.existsSync(yearDir)) {
    console.log(c.error(`[!] No solutions found for year ${year}`));
    process.exit(1);
  }

  const days = fs
    .readdirSync(yearDir)
    .filter((d) => /^\d{2}$/.test(d))
    .sort();

  if (days.length === 0) {
    console.log(c.error(`[!] No solutions found for year ${year}`));
    process.exit(1);
  }

  printBanner();
  console.log(c.header(`Running all solutions for ${year}\n`));

  for (const day of days) {
    await runSolution(year, parseInt(day, 10));
  }
}

// ============================================================================
// NEW BOOTSTRAP COMMAND - Non-breaking, with failure collection
// ============================================================================

async function bootstrap(year: number, day?: number): Promise<void> {
  const days = day ? [day] : Array.from({ length: 25 }, (_, i) => i + 1);
  const failures: { day: number; error: string }[] = [];

  printBanner();
  console.log(
    c.header(
      `Bootstrapping Advent of Code ${year}${day ? ` Day ${day}` : ""}\n`,
    ),
  );

  for (const d of days) {
    console.log(c.dim(`─ Day ${d} `.padEnd(40, "─")));

    // Scaffold
    try {
      const dayPadded = d.toString().padStart(2, "0");
      const dayDir = path.join(process.cwd(), year.toString(), dayPadded);
      const solutionPath = path.join(dayDir, "index.ts");

      if (fs.existsSync(solutionPath)) {
        console.log(c.warn(`  ⚠ Solution exists at ${solutionPath}`));
      } else {
        const template = `import * as fs from "fs";

function readInput(): string {
  return fs.readFileSync("./${year}/${dayPadded}/input", "utf8").trim();
}

export function part1(): number | string {
  const input = readInput();
  const lines = input.split("\\n");
  return 0;
}

export function part2(): number | string {
  const input = readInput();
  const lines = input.split("\\n");
  return 0;
}

if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
`;

        if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });
        fs.writeFileSync(solutionPath, template);
        console.log(c.success(`  ✓ Created ${solutionPath}`));
      }

      const inputPath = path.join(dayDir, "input");
      if (!fs.existsSync(inputPath)) {
        fs.writeFileSync(inputPath, "");
      }
    } catch (error) {
      failures.push({ day: d, error: `Scaffold failed: ${error}` });
      console.log(c.error(`  ✗ ${error}`));
      continue;
    }

    // Download
    try {
      const session = getSessionToken();
      if (!session) throw new Error("No session token");

      const url = `https://adventofcode.com/${year}/day/${d}/input`;
      const response = await fetch(url, {
        headers: {
          Cookie: `session=${session}`,
          "User-Agent": "github.com/zekurio/aoc by aoc@zekurio.dev",
        },
      });

      if (!response.ok) {
        if (response.status === 404)
          throw new Error("Puzzle not available yet (404)");
        if (response.status === 400)
          throw new Error("Invalid session token (400)");
        throw new Error(`HTTP ${response.status}`);
      }

      const input = await response.text();
      const dayPadded = d.toString().padStart(2, "0");
      const dayDir = path.join(process.cwd(), year.toString(), dayPadded);
      const inputPath = path.join(dayDir, "input");

      if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });
      fs.writeFileSync(inputPath, input);
      console.log(c.success(`  ✓ Downloaded input to ${inputPath}`));
    } catch (error) {
      failures.push({ day: d, error: String(error) });
      console.log(c.error(`  ✗ ${error}`));
    }
  }

  // Summary
  console.log(c.dim(`\n${"─".repeat(40)}`));
  console.log(c.header("Summary"));
  console.log(c.dim(`${"─".repeat(40)}\n`));

  if (failures.length === 0) {
    console.log(
      c.success(`✓ All ${days.length} days bootstrapped successfully!`),
    );
  } else {
    const successful = days.length - failures.length;
    console.log(c.info(`Total: ${days.length} days`));
    console.log(c.success(`Successful: ${successful}`));
    console.log(c.error(`Failed: ${failures.length}\n`));
    console.log(c.warn("The following days could not be added:"));
    failures.forEach(({ day, error }) =>
      console.log(c.warn(`  Day ${day}: ${error}`)),
    );
  }
  console.log();
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (args.length === 0 || command === "help") {
    printBanner();
    console.log(`${c.bold("Usage:")} aoc <command> [options]\n`);
    console.log(`${c.bold("Commands:")}`);
    console.log(
      `  ${c.info("bootstrap")} <year> [day]  Scaffold + download (new)`,
    );
    console.log(
      `  ${c.info("download")} <year> <day>  Download input for a specific day`,
    );
    console.log(
      `  ${c.info("run")} <year> <day>       Run solution for a specific day`,
    );
    console.log(
      `  ${c.info("new")} <year> <day>       Scaffold a new day's solution`,
    );
    console.log(
      `  ${c.info("run-all")} <year>         Run all solutions for a year`,
    );
    console.log(
      `  ${c.info("help")}                   Show this help message\n`,
    );
    console.log(`${c.bold("Examples:")}`);
    console.log(`  aoc bootstrap 2025 1    # Setup day 1`);
    console.log(`  aoc bootstrap 2025      # Setup all days`);
    console.log(`  aoc download 2025 1`);
    console.log(`  aoc run 2025 1`);
    console.log(`  aoc new 2025 3`);
    console.log(`  aoc run-all 2025\n`);
    console.log(`${c.bold("Environment:")}`);
    console.log(
      `  ${c.info("AOC_SESSION")}  Your Advent of Code session cookie`,
    );
    process.exit(0);
  }

  switch (command) {
    case "bootstrap": {
      if (!args[1]) {
        console.log(c.error("Usage: aoc bootstrap <year> [day]"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = args[2] ? parseInt(args[2]!, 10) : undefined;
      if (isNaN(year) || (day && isNaN(day))) {
        console.log(c.error("Year and day must be numbers"));
        process.exit(1);
      }
      await bootstrap(year, day);
      break;
    }

    case "download": {
      if (args.length < 3) {
        console.log(c.error("Usage: aoc download <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("Year and day must be numbers"));
        process.exit(1);
      }
      await downloadInput(year, day);
      break;
    }

    case "run": {
      if (args.length < 3) {
        console.log(c.error("Usage: aoc run <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("Year and day must be numbers"));
        process.exit(1);
      }
      await runSolution(year, day);
      break;
    }

    case "new": {
      if (args.length < 3) {
        console.log(c.error("Usage: aoc new <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("Year and day must be numbers"));
        process.exit(1);
      }
      scaffoldDay(year, day);
      break;
    }

    case "run-all": {
      if (args.length < 2) {
        console.log(c.error("Usage: aoc run-all <year>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      if (isNaN(year)) {
        console.log(c.error("Year must be a number"));
        process.exit(1);
      }
      await runAllSolutions(year);
      break;
    }

    default:
      console.log(c.error(`[!] Unknown command: ${command}`));
      printBanner();
      console.log(c.dim("Run 'aoc help' for usage information"));
      process.exit(1);
  }
}

main();
