import React, { createContext } from "react";

type MinesweeperGrid = Cell[][];
const Difficulty = ["easy", "medium", "hard"] as const;
type Difficulty = (typeof Difficulty)[number];
type GameRunning = "running" | "won" | "lost";
const difficultyRowMap: Record<Difficulty, number> = {
  easy: 9,
  medium: 16,
  hard: 24,
};
const difficultyMineMap: Record<Difficulty, number> = {
  easy: 10,
  medium: 40,
  hard: 99,
};
type CellState = "hidden" | "revealed" | "flagged";
type Cell = {
  state: CellState;
  hasMine: boolean;
  adjacentMines?: number;
};

const emptyCell: Cell = {
  state: "hidden",
  hasMine: false,
};

const generateCell = (hasMine: boolean): Cell => ({
  ...emptyCell,
  hasMine,
});

function calculateAdjacentMines(grid: MinesweeperGrid): MinesweeperGrid {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].hasMine) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = r + i;
            const newCol = c + j;
            if (
              newRow >= 0 &&
              newRow < rows &&
              newCol >= 0 &&
              newCol < cols &&
              !(i === 0 && j === 0)
            ) {
              newGrid[newRow][newCol].adjacentMines =
                (newGrid[newRow][newCol].adjacentMines || 0) + 1;
            }
          }
        }
      }
    }
  }

  return newGrid;
}

function generateMinesweeperGrid(
  rows: number = 9,
  cols: number = 9,
  mineCount: number = 10,
): MinesweeperGrid {
  const grid: MinesweeperGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(emptyCell),
  );

  let placedMines = 0;

  while (placedMines < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (!grid[r][c].hasMine) {
      grid[r][c] = generateCell(true); // Place mine
      placedMines++;
    }
  }

  return calculateAdjacentMines(grid);
}

type MinesweeperContextState = {
  map: MinesweeperGrid;
  hasStarted: GameRunning;
  difficulty: Difficulty;
  setMap: (map: MinesweeperGrid) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  revealCell: (row: number, col: number) => void;
  markCell: (row: number, col: number) => void;
  newGame: (difficulty?: Difficulty) => void;
  explosionOrigin?: { x: number; y: number };
};

const MinesweeperContext = createContext<MinesweeperContextState | undefined>(
  undefined,
);

const MinesweeperProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = React.useState<MinesweeperGrid>(
    generateMinesweeperGrid(),
  );
  const [hasStarted, setHasStarted] = React.useState<GameRunning>("running");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [explosionOrigin, setExplosionOrigin] = React.useState<
    { x: number; y: number } | undefined
  >(undefined);

  const newGame = (difficulty: Difficulty = "easy") => {
    setDifficulty(difficulty);
    setMap(
      generateMinesweeperGrid(
        difficultyRowMap[difficulty],
        difficultyRowMap[difficulty],
        difficultyMineMap[difficulty],
      ),
    );
    setHasStarted("running");
  };

  const checkForWin = (map: MinesweeperGrid) => {
    const allCells = map.flat();
    const allRevealed = allCells.every(
      (cell) => cell.state === "revealed" || cell.hasMine,
    );
    if (allRevealed) {
      alert("You win!");
      setHasStarted("won");
      setExplosionOrigin(undefined);
    }
    return allRevealed;
  };

  const updateCellInMap = (row: number, col: number, cell: Cell) => {
    setMap((prevMap: MinesweeperGrid) => {
      const newMap = [...prevMap];
      newMap[row][col] = cell;
      return newMap;
    });
  };

  const recurrsiveRevealCell = (
    row: number,
    col: number,
    map: MinesweeperGrid,
  ) => {
    const cell = { ...map[row][col] };
    // check if cell is already revealed
    if (cell.state === "hidden" && hasStarted) {
      cell.state = "revealed";
      map[row][col] = cell;

      if (cell.hasMine) {
        //alert('Game Over! You hit a mine!');
        setHasStarted("lost");
        setExplosionOrigin({ x: row, y: col });
      } else {
        // use adjacentMines to reveal adjacent cells
        if (!cell.adjacentMines) {
          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) {
                const adjacentCell = { ...map[r][c] };
                if (adjacentCell.state === "hidden") {
                  recurrsiveRevealCell(r, c, map);
                }
              }
            }
          }
        } else {
          cell.state = "revealed";
          map[row][col] = cell;
        }
      }
    }

    return map;
  };

  const revealCell = (row: number, col: number) => {
    if (hasStarted !== "running") return;
    const newMap = recurrsiveRevealCell(row, col, map);
    checkForWin(newMap);
    setMap([...newMap]);
  };

  const markCell = (row: number, col: number) => {
    const cell = { ...map[row][col] };
    if (cell.state === "hidden") {
      cell.state = "flagged";
    } else if (cell.state === "flagged") {
      cell.state = "hidden";
    }
    updateCellInMap(row, col, cell);
  };

  return (
    <MinesweeperContext.Provider
      value={{
        map,
        hasStarted,
        difficulty,
        setMap,
        setDifficulty,
        revealCell,
        markCell,
        newGame,
        explosionOrigin,
      }}
    >
      {children}
    </MinesweeperContext.Provider>
  );
};

const useMinesweeperContext = () => {
  const context = React.useContext(MinesweeperContext);
  if (!context) {
    throw new Error(
      "useMinesweeperContext must be used within a MinesweeperProvider",
    );
  }
  return context;
};

export {
  MinesweeperProvider,
  MinesweeperContext,
  useMinesweeperContext,
  generateMinesweeperGrid,
  emptyCell,
  generateCell,
  type CellState,
  type Cell,
  Difficulty,
  type MinesweeperGrid,
  type MinesweeperContextState,
};
