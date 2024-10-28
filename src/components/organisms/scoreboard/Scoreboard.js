// components/Scoreboard.js
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

const Scoreboard = ({
  entryId,
  initialTeamA,
  initialTeamB,
  initialScoreA,
  initialScoreB,
  status,
}) => {
  const [scoreA, setScoreA] = useState(initialScoreA);
  const [scoreB, setScoreB] = useState(initialScoreB);
  const [time, setTime] = useState(5 * 60 * 1000); // Default time: 5 minutes (in milliseconds)
  const [isRunning, setIsRunning] = useState(false);

  // Input fields for setting time
  const [inputMinutes, setInputMinutes] = useState(5); // Default 5 minutes
  const [inputSeconds, setInputSeconds] = useState(0); // Default 0 seconds

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 10);
      }, 10); // Update every 10 milliseconds
    } else if (time <= 0) {
      clearInterval(timer);
      setIsRunning(false);
      alert("Time's up!");
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const startCountdown = () => {
    if (time > 0) {
      setIsRunning(true);
    }
  };

  const stopCountdown = () => {
    setIsRunning(false);
  };

  const resetCountdown = () => {
    setTime(inputMinutes * 60 * 1000 + inputSeconds * 1000);
    setIsRunning(false);
  };

  const updateTime = () => {
    const newTime = inputMinutes * 60 * 1000 + inputSeconds * 1000;
    setTime(newTime);
  };

  // Format time in minutes, seconds, milliseconds
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  useEffect(() => {
    // Initialize socket connection
    socket = io();

    // Listen for score updates
    socket.on("score-updated", (data) => {
      if (data.team === "A") setScoreA(data.newScore);
      if (data.team === "B") setScoreB(data.newScore);
    });

    return () => {
      // Clean up the socket connection
      socket.off("score-updated");
      socket.disconnect();
    };
  }, []);

  // Function to update score locally, emit it over Socket.io, and persist in Contentful
  const updateScore = async (team, newScore) => {
    if (team === "A") setScoreA(newScore);
    if (team === "B") setScoreB(newScore);

    // Emit the update to the server for real-time effect
    socket.emit("update-score", { team, newScore });

    // Call the API route to update the score in Contentful
    await fetch("/api/updateScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entryId,
        team,
        newScore,
      }),
    });
  };

  return (
    <div className="scoreboard">
      <h1>Basketball Scoreboard</h1>
      <div className="countdown">
        <h3>Countdown</h3>
        <p>{`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}:${String(milliseconds).padStart(2, "0")}`}</p>
        <button onClick={startCountdown}>Start</button>
        <button onClick={stopCountdown}>Stop</button>
        <button onClick={resetCountdown}>Reset</button>

        <div className="time-inputs">
          <label>
            Minutes:
            <input
              type="number"
              min="0"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(Number(e.target.value))}
            />
          </label>
          <label>
            Seconds:
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(Number(e.target.value))}
            />
          </label>
          <button onClick={updateTime}>Set Time</button>
        </div>
      </div>
      <div className="teams">
        <div className="team">
          <h2>{initialTeamA}</h2>
          <p>Score: {scoreA}</p>
          <button onClick={() => updateScore("A", scoreA + 3)}>+3</button>
          <button onClick={() => updateScore("A", scoreA + 2)}>+2</button>
          <button onClick={() => updateScore("A", scoreA + 1)}>+1</button>
          <button onClick={() => updateScore("A", Math.max(0, scoreA - 1))}>
            -1
          </button>
        </div>
        <div className="team">
          <h2>{initialTeamB}</h2>
          <p>Score: {scoreB}</p>
          <button onClick={() => updateScore("B", scoreB + 1)}>+1</button>
          <button onClick={() => updateScore("B", Math.max(0, scoreB - 1))}>
            -1
          </button>
        </div>
      </div>
      <div className="status">
        <p>Status: {status}</p>
      </div>
      <style jsx>{`
        .scoreboard {
          text-align: center;
          margin: 20px;
          padding: 20px;
          border: 2px solid #000;
          border-radius: 10px;
          background-color: #f5f5f5;
        }
        .teams {
          display: flex;
          justify-content: space-around;
        }
        .team {
          padding: 10px;
        }
        .status {
          margin-top: 10px;
        }
        button {
          margin: 5px;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .countdown {
          margin-top: 20px;
        }
        .countdown p {
          font-size: 2rem;
          margin: 10px 0;
        }
        .countdown button {
          margin: 5px;
          padding: 10px;
          font-size: 1rem;
          border-radius: 5px;
          border: none;
          background-color: #0070f3;
          color: white;
          cursor: pointer;
        }
        .countdown button:disabled {
          background-color: #aaa;
        }
        .time-inputs {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .time-inputs label {
          display: flex;
          flex-direction: column;
          font-size: 1rem;
        }
        .time-inputs input {
          width: 60px;
          padding: 5px;
          font-size: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Scoreboard;
