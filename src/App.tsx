import "./App.css";
import { Difficulty, useMinesweeperContext } from "./MinesweeperContext";
import CellSquare from "./components/cell";
import { StarCanvas } from "./components/pageBackground";

function App() {
  const { map, difficulty, newGame } = useMinesweeperContext();
  return (
    <div className="w-full m-auto p-3 bg-background">
      <StarCanvas />
      <div className="fixed bottom-1 right-1 flex gap-2 z-50">
        {Difficulty.map((diff) => (
          <button
            key={diff}
            className={`cursor-pointer p-1 border-accent border rounded-lg text-xl ${difficulty === diff ? "bg-accent" : ""}`}
            onClick={() => newGame(diff)}
          >
            {diff}
          </button>
        ))}
        <button
          className="cursor-pointer p-1 border-accent border rounded-lg text-xl bg-mine"
          onClick={() => newGame(difficulty)}
        >
          New Game
        </button>
      </div>
      <div className="w-full w-max-[600px] m-auto md:w-[80%] lg:w-[50%]">
        <div
          style={{ gridTemplateColumns: `repeat(${map[0].length}, 1fr)` }}
          className="grid"
        >
          {map.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <CellSquare
                key={`${difficulty}-${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
