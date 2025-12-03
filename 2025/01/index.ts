import * as fs from "fs";

function readInput(): string[] {
  return fs.readFileSync("./2025/01/input", "utf8").trim().split("\n");
}

const dial = (current: number, move: string): [number, number] => {
  const direction = move[0];
  const step = parseInt(move.slice(1));

  if (isNaN(step) || step < 0) {
    throw new Error(`Invalid step in move: ${move}`);
  }

  const moveLeft = (curr: number, s: number): [number, number] => {
    const newPosition = (((curr - s) % 100) + 100) % 100;
    const k0 = curr % 100;
    const effectiveK0 = k0 === 0 ? 100 : k0;
    const zerosPassed =
      effectiveK0 <= s ? Math.floor((s - effectiveK0) / 100) + 1 : 0;
    return [newPosition, zerosPassed];
  };

  const moveRight = (curr: number, s: number): [number, number] => {
    const newPosition = (curr + s) % 100;
    const k0 = (100 - curr) % 100;
    const effectiveK0 = k0 === 0 ? 100 : k0;
    const zerosPassed =
      effectiveK0 <= s ? Math.floor((s - effectiveK0) / 100) + 1 : 0;
    return [newPosition, zerosPassed];
  };

  switch (direction) {
    case "L":
      return moveLeft(current, step);
    case "R":
      return moveRight(current, step);
    default:
      throw new Error(`Invalid direction: ${direction} in move: ${move}`);
  }
};

export function part1(): number {
  const input = readInput();
  let zeroReached = 0;
  let current = 50;

  for (const line of input) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const [newCurrent] = dial(current, trimmedLine);
    if (newCurrent === 0) {
      zeroReached++;
    }
    current = newCurrent;
  }

  return zeroReached;
}

export function part2(): number {
  const input = readInput();
  let totalZeroHits = 0;
  let current = 50;

  for (const line of input) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const [newCurrent, zerosPassed] = dial(current, trimmedLine);
    current = newCurrent;
    totalZeroHits += zerosPassed;
  }

  return totalZeroHits;
}

// Allow running directly
if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
