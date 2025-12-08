import * as fs from "fs";

interface Range {
  start: number;
  end: number;
}

function readInput(): string {
  return fs.readFileSync("./2025/05/input", "utf8").trim();
}

export function part1(): number {
  const input = readInput();

  const [rangeBlock, idBlock] = input.trim().split("\n\n");

  const ranges: Range[] = rangeBlock!.split("\n").map((line) => {
    const [start, end] = line.split("-").map(Number);
    return { start: start!, end: end! };
  });

  const ids: number[] = idBlock!.split("\n").map(Number);

  let freshCount = 0;

  for (const id of ids) {
    const isFresh = ranges.some((r) => id >= r.start && id <= r.end);
    
    if (isFresh) {
      freshCount++;
    }
  }

  return freshCount;
}

export function part2(): number | string {
  const input = readInput();
  const [rangeBlock] = input.trim().split("\n\n");

  // 1. Parse and Sort Ranges by Start time
  // Sorting is crucial! We cannot merge efficiently if they aren't in order.
  const ranges: Range[] = rangeBlock!
    .split("\n")
    .map((line) => {
      const [start, end] = line.split("-").map(Number);
      return { start: start!, end: end! };
    })
    .sort((a, b) => a.start - b.start);

  let totalFreshIDs = 0;

  // Initialize with the first range
  // We use specific variables so we can modify 'currentEnd' as we merge
  let currentStart = ranges[0]!.start;
  let currentEnd = ranges[0]!.end;

  // 2. Iterate starting from the second range
  for (let i = 1; i < ranges.length; i++) {
    const nextRange = ranges[i]!;

    if (nextRange.start <= currentEnd + 1) {
      // OVERLAP or ADJACENT FOUND (e.g., 3-5 and 5-7, or 3-5 and 6-8)
      // Extend the current end if the new one is longer
      currentEnd = Math.max(currentEnd, nextRange.end);
    } else {
      totalFreshIDs += (currentEnd - currentStart) + 1;

      currentStart = nextRange.start;
      currentEnd = nextRange.end;
    }
  }

  // 3. Add the final block after the loop finishes
  totalFreshIDs += (currentEnd - currentStart) + 1;

  return totalFreshIDs;
}

if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
