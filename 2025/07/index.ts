import * as fs from "fs";

function readInput(): string {
  return fs.readFileSync("./2025/07/input", "utf8").trim();
}

export function part1(): number | string {
  const input = readInput();
  const lines = input.split("\n");
  return 0;
}

export function part2(): number | string {
  const input = readInput();
  const lines = input.split("\n");
  return 0;
}

if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
