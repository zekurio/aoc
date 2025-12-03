import * as fs from "fs";

function readInput(): string {
  return fs.readFileSync("./2025/02/input", "utf8").trim();
}

export function part1(): string {
  const rawInput = readInput();

  // Remove newlines if the input is wrapped like the example text
  const ranges = rawInput.split(",");

  let invalidIds: string[] = [];

  for (const range of ranges) {
    if (!range.includes("-")) continue;

    const [startStr, endStr] = range.split("-");
    const start = parseInt(startStr!, 10);
    const end = parseInt(endStr!, 10);

    for (let i = start; i <= end; i++) {
      const s = i.toString();

      // An ID must have even length to be split into two equal parts
      if (s.length % 2 !== 0) continue;

      const mid = s.length / 2;
      const firstHalf = s.slice(0, mid);
      const secondHalf = s.slice(mid);

      // Check if the sequence is repeated exactly twice
      if (firstHalf === secondHalf) {
        invalidIds.push(s);
      }
    }
  }

  return invalidIds.reduce((sum, id) => sum + BigInt(id), 0n).toString();
}

export function part2(): string {
  const rawInput = readInput();

  // 1. Clean newlines before splitting
  const ranges = rawInput.replace(/\n/g, "").split(",");

  let invalidIds: string[] = [];

  for (const range of ranges) {
    const parts = range.split("-").map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) {
      // Skip empty or malformed parts resulting from trailing commas
      continue;
    }
    const lower = parts[0]!;
    const upper = parts[1]!;

    for (let id = lower; id <= upper; id++) {
      const s = id.toString();
      const n = s.length;

      let isInvalid = false;
      for (let len = 1; len <= n / 2; len++) {
        // 2. Optimization: Only check if length divides evenly
        if (n % len !== 0) continue;

        const chunk = s.slice(0, len);
        if (chunk.repeat(n / len) === s) {
          isInvalid = true;
          break;
        }
      }

      if (isInvalid) {
        invalidIds.push(s);
      }
    }
  }

  return invalidIds.reduce((sum, id) => sum + BigInt(id), 0n).toString();
}

// Allow running directly
if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
