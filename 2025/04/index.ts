import * as fs from "fs";

type Grid = string[][];

function parseGrid(input: string): Grid {
  return input.trim().split('\n').map(line => line.split(''));
}

function readInput(filename = "./2025/04/input"): string {
  return fs.readFileSync(filename, "utf8").trim();
}

export function part1(): number {
  const input = readInput();
  const grid = parseGrid(input);
  
  const rows = grid.length;
  const cols = grid[0]!.length;
  let accessible = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r]![c]! !== '@') continue;

      let neighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (grid[r + dr]?.[c + dc] === '@') neighbors++;
        }
      }
      
      if (neighbors < 4) accessible++;
    }
  }
  
  return accessible;
}

export function part2(): number {
  const input = readInput();
  const grid = parseGrid(input);
  
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = grid[0]!.length;

  let totalRemoved = 0;
  let removedInIteration: [number, number][];

  do {
    removedInIteration = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r]![c]! !== '@') continue;

        let neighborCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (grid[r + dr]?.[c + dc] === '@') {
              neighborCount++;
            }
          }
        }
        
        if (neighborCount < 4) {
          removedInIteration.push([r, c]);
        }
      }
    }

    for (const [r, c] of removedInIteration) {
      grid[r]![c] = '.';
      totalRemoved++;
    }
    
  } while (removedInIteration.length > 0);

  return totalRemoved;
}

if (import.meta.main) {
  console.log("Part 1:", part1());
  console.log("Part 2:", part2());
}
