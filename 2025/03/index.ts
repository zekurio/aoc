import * as fs from "fs";

function readInput(): string {
  return fs.readFileSync("./2025/03/input", "utf8").trim();
}

export function part1(): number {
  const input = readInput();
  const lines = input.split("\n");

  let totalJoltage = 0;

  for (const line of lines) {
    const digits = line.split("").map(Number);

    let firstDigit = {
      value: digits[0]!,
      position: 0,
    };

    let maxJoltage = 10 * digits[0]! + digits[1]!;

    for (let i = 1; i < digits.length; i++) {
      const currentSecondDigit = digits[i]!;

      const candidateJoltage = 10 * firstDigit.value + currentSecondDigit;
      maxJoltage = Math.max(maxJoltage, candidateJoltage);

      if (currentSecondDigit > firstDigit.value) {
        firstDigit = { value: currentSecondDigit, position: i };
      }
    }

    totalJoltage += maxJoltage;
  }

  return totalJoltage;
}

export function part2(): number {
  const input = readInput();
  const lines = input.split("\n").filter((line) => line.length > 0);

  const k = 12;
  let totalJoltage = 0;

  for (const line of lines) {
    const digits = line.split("").map(Number);

    if (digits.length < k) continue;

    let dropsLeft = digits.length - k;
    const stack: number[] = [];

    for (const digit of digits) {
      // greedy stack
      while (
        dropsLeft > 0 &&
        stack.length > 0 &&
        stack[stack.length - 1]! < digit
      ) {
        stack.pop();
        dropsLeft--;
      }
      stack.push(digit);
    }

    const maxJoltage = Number(stack.slice(0, k).join(""));
    totalJoltage += maxJoltage;
  }

  return totalJoltage;
}

// Allow running directly
if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
