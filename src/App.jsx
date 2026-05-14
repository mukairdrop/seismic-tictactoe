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
  const [status, setStatus] = useState("Connecting Wallet...");

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Install MetaMask");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const game = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );

      setContract(game);

      loadBoard(game);

      setStatus("Your Turn");
    } catch (err) {
      setStatus("Wallet Connection Failed");
    }
  }

  async function loadBoard(game) {
    const data = await game.getBoard();
    setBoard([...data]);
  }

  function checkWinner(tempBoard) {
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let combo of wins) {
      const [a, b, c] = combo;

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
      setStatus("You Win");
      return;
    }

    if (!updated.includes(0)) {
      setStatus("Draw Game");
      return;
    }

    setStatus("Computer Thinking...");

    setTimeout(() => computerMove(updated), 700);
  }

  async function computerMove(currentBoard) {
    const empty = currentBoard
      .map((v, i) => (v === 0 ? i : null))
      .filter((v) => v !== null);

    if (empty.length === 0) return;

    const move =
      empty[Math.floor(Math.random() * empty.length)];

    const tx = await contract.play(move, 2);

    await tx.wait();

    const updated = [...currentBoard];

    updated[move] = 2;

    setBoard(updated);

    const winner = checkWinner(updated);

    if (winner === 2) {
      setStatus("Computer Wins");
      return;
    }

    if (!updated.includes(0)) {
      setStatus("Draw Game");
      return;
    }

    setStatus("Your Turn");
  }

  async function resetGame() {
    if (!contract) return;

    const tx = await contract.resetBoard();

    await tx.wait();

    setBoard(Array(9).fill(0));

    setStatus("Your Turn");
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            marginTop: 0,
            fontSize: "42px",
            marginBottom: "10px"
          }}
        >
          Tic Tac Toe
        </h1>

        <p
          style={{
            opacity: 0.8,
            marginBottom: "25px"
          }}
        >
          Play on Seismic Testnet
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "12px",
            marginBottom: "20px",
            fontWeight: "bold"
          }}
        >
          {status}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px"
          }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => playerMove(index)}
              style={{
                aspectRatio: "1",
                borderRadius: "18px",
                border: "none",
                fontSize: "42px",
                fontWeight: "bold",
                background:
                  cell === 1
                    ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                    : cell === 2
                    ? "linear-gradient(135deg,#ef4444,#dc2626)"
                    : "rgba(255,255,255,0.08)",
                color: "white"
              }}
            >
              {cell === 1 ? "X" : cell === 2 ? "O" : ""}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            background: "white",
            color: "black"
          }}
        >
          Reset Game
        </button>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "18px",
            borderTop: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <p
            style={{
              fontSize: "14px",
              opacity: 0.75,
              marginBottom: "12px"
            }}
          >
            Built by Mukul
          </p>

          <a
            href="https://github.com/mukairdrop"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            <img
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub"
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%"
              }}
            />

            Follow me on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
