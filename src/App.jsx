import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0xabA4E0fe7B88ABceEd260eb1219E9c10247d3CE5";

const abi = [
  "function play(uint8 pos, uint8 player) public",
  "function getBoard() public view returns (uint8[9] memory)",
  "function resetBoard() public"
];

function App() {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [contract, setContract] = useState(null);
  const [status, setStatus] = useState("Connect Wallet");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const game = new ethers.Contract(contractAddress, abi, signer);

    setContract(game);

    loadBoard(game);

    setStatus("Your Turn (X)");
  }

  async function loadBoard(game) {
    const data = await game.getBoard();
    setBoard([...data]);
  }

  function checkWinner(tempBoard) {
    const wins = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6]
    ];

    for (let combo of wins) {
      const [a,b,c] = combo;

      if (
        tempBoard[a] !== 0 &&
        tempBoard[a] === tempBoard[b] &&
        tempBoard[a] === tempBoard[c]
      ) {
        return tempBoard[a];
      }
    }

    return 0;
  }

  async function playerMove(index) {
    if (!contract) return;

    if (board[index] !== 0) return;

    const tx = await contract.play(index, 1);

    await tx.wait();

    const updated = [...board];

    updated[index] = 1;

    setBoard(updated);

    const winner = checkWinner(updated);

    if (winner === 1) {
      setStatus("You Win!");
      return;
    }

    if (!updated.includes(0)) {
      setStatus("Draw!");
      return;
    }

    setStatus("Computer Thinking...");

    setTimeout(() => computerMove(updated), 1000);
  }

  async function computerMove(currentBoard) {
    const empty = currentBoard
      .map((v, i) => v === 0 ? i : null)
      .filter(v => v !== null);

    if (empty.length === 0) return;

    const move = empty[Math.floor(Math.random() * empty.length)];

    const tx = await contract.play(move, 2);

    await tx.wait();

    const updated = [...currentBoard];

    updated[move] = 2;

    setBoard(updated);

    const winner = checkWinner(updated);

    if (winner === 2) {
      setStatus("Computer Wins!");
      return;
    }

    if (!updated.includes(0)) {
      setStatus("Draw!");
      return;
    }

    setStatus("Your Turn (X)");
  }

  async function resetGame() {
    if (!contract) return;

    const tx = await contract.resetBoard();

    await tx.wait();

    setBoard(Array(9).fill(0));

    setStatus("Your Turn (X)");
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "40px"
      }}
    >
      <h1>Tic Tac Toe</h1>

      <p>{status}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,100px)",
          gap: "10px"
        }}
      >
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => playerMove(index)}
            style={{
              width: "100px",
              height: "100px",
              fontSize: "40px",
              borderRadius: "10px",
              border: "none"
            }}
          >
            {cell === 1 ? "X" : cell === 2 ? "O" : ""}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          fontSize: "16px"
        }}
      >
        Reset Game
      </button>
    </div>
  );
}

export default App;
