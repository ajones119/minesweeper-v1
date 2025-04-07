import React, { useEffect, useMemo, useRef } from "react";
import { Cell, useMinesweeperContext } from "../MinesweeperContext";

type CellProps = {
  row: number;
  col: number;
};

type CellState = "hidden" | "revealed" | "flagged" | "mine";

const BackgroundColorMap: Record<CellState, string> = {
  hidden: "bg-cell",
  revealed: "bg-safe",
  flagged: "bg-accent2",
  mine: "bg-mine",
};

const CellSquare: React.FC<CellProps> = ({ row, col }) => {
  const { map, revealCell, markCell, hasStarted, explosionOrigin } =
    useMinesweeperContext();
  const scope = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (explosionOrigin && scope.current) {
      const distance = Math.sqrt(
        Math.pow(explosionOrigin.x - row, 2) +
          Math.pow(explosionOrigin.y - col, 2),
      );
      const delay = distance * 0.25; // in seconds
      // add class "exploded" to teh cell after delay
      console.log(
        "explosionOrigin",
        explosionOrigin,
        row,
        col,
        distance,
        delay,
      );
      timeoutRef.current = setTimeout(() => {
        if (scope.current) {
          scope.current.classList.remove("reset");
          scope.current.classList.add("exploded");
        }
      }, delay * 1000);
    }
  }, [explosionOrigin]);

  useEffect(() => {
    if (hasStarted === "running") {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      //reset the cell to its original state
      // make a delay based on the index, where the index is the row * col
      const delay = row * col * 0.02; // in seconds
      timeoutRef.current = setTimeout(() => {
        console.log("exploded");
        if (scope.current) {
          scope.current.classList.remove("exploded");
          scope.current.classList.add("reset");
        }
      }, delay * 1000);
    }
  }, [hasStarted]);

  const handleClick = () => {
    revealCell(row, col);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    markCell(row, col);
  };

  const cell: Cell = map[row][col];

  const adjecentMines = useMemo(() => {
    if (cell.state !== "revealed") return 0;
    if (cell.hasMine) return 0;

    let mineCount = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) {
          if (map[r][c].hasMine) {
            mineCount++;
          }
        }
      }
    }
    return mineCount;
  }, [cell.state, row, col]);

  const cellState =
    cell?.hasMine && cell.state === "revealed" ? "mine" : cell.state;

  return (
    <div
      ref={scope}
      className={`w-full aspect-square border flex items-center justify-center text-light ${BackgroundColorMap[cellState]}`}
    >
      {cell.state === "hidden" ? (
        <div
          className="w-full h-full cursor-crosshair hover:bg-accent hover:animate-pulse"
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {" "}
        </div>
      ) : cell.state === "flagged" ? (
        <span>🚩</span>
      ) : cell.hasMine ? (
        <span>💣</span>
      ) : adjecentMines > 0 ? (
        <span>{adjecentMines}</span>
      ) : cell.state === "revealed" ? (
        <span></span>
      ) : (
        cell.state
      )}
    </div>
  );
};

export default CellSquare;
