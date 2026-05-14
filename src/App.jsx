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
export default App;
