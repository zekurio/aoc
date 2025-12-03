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
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

const c = {
  success: (text: string) => `${colors.green}${text}${colors.reset}`,
  error: (text: string) => `${colors.red}${text}${colors.reset}`,
  warn: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bold}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`,
  header: (text: string) =>
    `${colors.bold}${colors.magenta}${text}${colors.reset}`,
  result: (text: string) =>
    `${colors.bold}${colors.green}${text}${colors.reset}`,
};

const BANNER = `
${colors.cyan}Advent of Code Runner${colors.reset}
`;

function printBanner() {
  console.log(BANNER);
}

function printUsage() {
  printBanner();
  console.log(`${c.bold("Usage:")} aoc <command> [options]\n`);
  console.log(`${c.bold("Commands:")}`);
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
  console.log(`  ${c.info("help")}                   Show this help message\n`);
  console.log(`${c.bold("Examples:")}`);
  console.log(`  aoc download 2025 1`);
  console.log(`  aoc run 2025 1`);
  console.log(`  aoc new 2025 3`);
  console.log(`  aoc run-all 2025\n`);
  console.log(`${c.bold("Environment Variables:")}`);
  console.log(`  ${c.info("AOC_SESSION")}  Your Advent of Code session cookie`);
  console.log(
    `                (or create a .session file in the project root)\n`,
  );
}

function getSessionToken(): string | null {
  // Check environment variable first
  if (process.env.AOC_SESSION) {
    return process.env.AOC_SESSION;
  }

  // Check for .session file
  const sessionPath = path.join(process.cwd(), ".session");
  if (fs.existsSync(sessionPath)) {
    return fs.readFileSync(sessionPath, "utf8").trim();
  }

  return null;
}

async function downloadInput(year: number, day: number): Promise<void> {
  const session = getSessionToken();
  if (!session) {
    console.log(c.error("[!] No session token found!"));
    console.log(
      c.dim(
        "    Set the AOC_SESSION environment variable or create a .session file",
      ),
    );
    console.log(
      c.dim("    Get your session cookie from the Advent of Code website"),
    );
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
      if (response.status === 404) {
        console.log(c.error(`[!] Puzzle not available yet (404)`));
      } else if (response.status === 400) {
        console.log(c.error(`[!] Invalid session token (400)`));
      } else {
        console.log(c.error(`[!] Failed to download: ${response.status}`));
      }
      process.exit(1);
    }

    const input = await response.text();

    // Create directory if it doesn't exist
    if (!fs.existsSync(dayDir)) {
      fs.mkdirSync(dayDir, { recursive: true });
    }

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
        `${c.info("Part 1:")} ${c.result(String(result1))} ${c.dim(`(${time1}ms)`)}`,
      );
    } else if (typeof module.solvep1 === "function") {
      const result1 = await module.solvep1();
      const time1 = (performance.now() - startTime1).toFixed(2);
      console.log(
        `${c.info("Part 1:")} ${c.result(String(result1))} ${c.dim(`(${time1}ms)`)}`,
      );
    }

    const startTime2 = performance.now();
    if (typeof module.part2 === "function") {
      const result2 = await module.part2();
      const time2 = (performance.now() - startTime2).toFixed(2);
      console.log(
        `${c.info("Part 2:")} ${c.result(String(result2))} ${c.dim(`(${time2}ms)`)}`,
      );
    } else if (typeof module.solvep2 === "function") {
      const result2 = await module.solvep2();
      const time2 = (performance.now() - startTime2).toFixed(2);
      console.log(
        `${c.info("Part 2:")} ${c.result(String(result2))} ${c.dim(`(${time2}ms)`)}`,
      );
    }

    console.log(c.dim("─".repeat(40)) + "\n");
  } catch (error) {
    console.log(c.error(`[!] Error running solution: ${error}`));
    process.exit(1);
  }
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

  // TODO: Implement part 1

  return 0;
}

export function part2(): number | string {
  const input = readInput();
  const lines = input.split("\\n");

  // TODO: Implement part 2

  return 0;
}

// Allow running directly
if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
`;

  // Create directory if it doesn't exist
  if (!fs.existsSync(dayDir)) {
    fs.mkdirSync(dayDir, { recursive: true });
  }

  fs.writeFileSync(solutionPath, template);
  console.log(c.success(`[+] Created ${solutionPath}`));

  // Create empty input file
  const inputPath = path.join(dayDir, "input");
  if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(inputPath, "");
    console.log(c.success(`[+] Created ${inputPath}`));
  }

  console.log(c.info(`\n    Next steps:`));
  console.log(c.dim(`    1. Download input: aoc download ${year} ${day}`));
  console.log(c.dim(`    2. Implement your solution in ${solutionPath}`));
  console.log(c.dim(`    3. Run: aoc run ${year} ${day}\n`));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help") {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case "download": {
      if (args.length < 3) {
        console.log(c.error("[!] Missing arguments"));
        console.log(c.dim("    Usage: aoc download <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("[!] Year and day must be numbers"));
        process.exit(1);
      }
      await downloadInput(year, day);
      break;
    }

    case "run": {
      if (args.length < 3) {
        console.log(c.error("[!] Missing arguments"));
        console.log(c.dim("    Usage: aoc run <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("[!] Year and day must be numbers"));
        process.exit(1);
      }
      await runSolution(year, day);
      break;
    }

    case "new": {
      if (args.length < 3) {
        console.log(c.error("[!] Missing arguments"));
        console.log(c.dim("    Usage: aoc new <year> <day>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      const day = parseInt(args[2]!, 10);
      if (isNaN(year) || isNaN(day)) {
        console.log(c.error("[!] Year and day must be numbers"));
        process.exit(1);
      }
      scaffoldDay(year, day);
      break;
    }

    case "run-all": {
      if (args.length < 2) {
        console.log(c.error("[!] Missing arguments"));
        console.log(c.dim("    Usage: aoc run-all <year>"));
        process.exit(1);
      }
      const year = parseInt(args[1]!, 10);
      if (isNaN(year)) {
        console.log(c.error("[!] Year must be a number"));
        process.exit(1);
      }
      await runAllSolutions(year);
      break;
    }

    default:
      console.log(c.error(`[!] Unknown command: ${command}`));
      printUsage();
      process.exit(1);
  }
}

main();
