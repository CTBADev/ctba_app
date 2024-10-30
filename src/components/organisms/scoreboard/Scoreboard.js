// components/Scoreboard.js
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import classes from "./Scoreboard.module.scss";

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
  const [time, setTime] = useState(12 * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [possession, setPossession] = useState("A");
  const [foulsA, setFoulsA] = useState(0);
  const [foulsB, setFoulsB] = useState(0);
  const [timeOutsA, setTimeOutsA] = useState(0);
  const [timeOutsB, setTimeOutsB] = useState(0);

  // Input fields for setting time
  const [inputMinutes, setInputMinutes] = useState(12);
  const [inputSeconds, setInputSeconds] = useState(0);

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

  const togglePossession = () => {
    setPossession((prevPossession) => (prevPossession === "A" ? "B" : "A"));
  };

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
    <div className={classes.oScoreBoard}>
      <h2 className={`${classes.aTitle} fntH2`}>Basketball Scoreboard</h2>

      <div className="countdown">
        <div className={`${classes.oClock}`}>
          <span className={`${classes.mClock} fnt150`}>{`${String(
            minutes
          ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(
            milliseconds
          ).padStart(2, "0")}`}</span>
          <div className={classes.mCtaRegion}>
            <button
              onClick={() => {
                if (isRunning) {
                  stopCountdown();
                } else {
                  startCountdown();
                }
              }}
              className={`${classes.aBtn} ${
                isRunning ? classes.isOn : classes.isOff
              }`}
            >
              {isRunning ? "Stop" : "Start"}
            </button>
            <button onClick={resetCountdown} className={`${classes.aBtn} `}>
              Reset
            </button>
            <div className={classes.mClockEdit}>
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
        </div>
      </div>
      <div className={`${classes.oTeams}`}>
        <div className={`${classes.oTeam} ${classes.teamA}`}>
          <h2>
            {initialTeamA} {possession === "A" && "←"}
          </h2>

          <div className={classes.oTeamData}>
            <p className={`${classes.aScore} fnt150`}>{scoreA}</p>
            <div className={classes.oTeamFouls}>
              <div className={classes.oFoulIcons}>
                {[...Array(foulsA)].map((_, index) => (
                  <div key={index} className={classes.aFoulIcon}></div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => updateScore("A", scoreA + 3)}>+3</button>
          <button onClick={() => updateScore("A", scoreA + 2)}>+2</button>
          <button onClick={() => updateScore("A", scoreA + 1)}>+1</button>
          <button onClick={() => updateScore("A", Math.max(0, scoreA - 1))}>
            -1
          </button>

          <div className={classes.oTeamControls}>
            <button onClick={() => foulsA < 5 && setFoulsA(foulsA + 1)}>
              +1 Foul
            </button>
            <button onClick={() => setFoulsA(Math.max(0, foulsA - 1))}>
              -1 Foul
            </button>
            <button onClick={() => setFoulsA(0)}>Reset Fouls</button>
          </div>

          <div className="timeOuts">
            <p>Fouls: {timeOutsA}</p>
            <div className="foul-icons">
              {[...Array(timeOutsA)].map((_, index) => (
                <div key={index} className="foul-icon"></div>
              ))}
            </div>
            <button
              onClick={() => timeOutsA < 5 && setTimeOutsA(timeOutsA + 1)}
            >
              +1 Timeout
            </button>
            <button onClick={() => setTimeOutsA(Math.max(0, timeOutsA - 1))}>
              -1 Timeout
            </button>
            <button onClick={() => setTimeOutsA(0)}>Reset Timeouts</button>
          </div>
        </div>
        <div className={`${classes.oTeam} ${classes.teamB}`}>
          <h2>
            {initialTeamB} {possession === "B" && "←"}
          </h2>
          <div className={classes.oTeamData}>
            <p className={`${classes.aScore} fnt150`}>{scoreB}</p>
            <div className={classes.oTeamFouls}>
              <div className={classes.oFoulIcons}>
                {[...Array(foulsB)].map((_, index) => (
                  <div key={index} className={classes.aFoulIcon}></div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => updateScore("B", scoreB + 3)}>+3</button>
          <button onClick={() => updateScore("B", scoreB + 2)}>+2</button>
          <button onClick={() => updateScore("B", scoreB + 1)}>+1</button>
          <button onClick={() => updateScore("B", Math.max(0, scoreB - 1))}>
            -1
          </button>
          <div className={classes.oTeamControls}>
            <button onClick={() => foulsB < 5 && setFoulsB(foulsB + 1)}>
              +1 Foul
            </button>
            <button onClick={() => setFoulsB(Math.max(0, foulsB - 1))}>
              -1 Foul
            </button>
            <button onClick={() => setFoulsB(0)}>Reset Fouls</button>
          </div>

          <div className={classes.mTimeOuts}>
            <p>Fouls: {timeOutsB}</p>
            <div className="foul-icons">
              {[...Array(timeOutsB)].map((_, index) => (
                <div key={index} className="foul-icon"></div>
              ))}
            </div>
            <button
              onClick={() => timeOutsB < 5 && setTimeOutsB(timeOutsB + 1)}
            >
              +1 Timeout
            </button>
            <button onClick={() => setTimeOutsB(Math.max(0, timeOutsB - 1))}>
              -1 Timeout
            </button>
            <button onClick={() => setTimeOutsB(0)}>Reset Timeouts</button>
          </div>
        </div>
      </div>
      <div className="possession-arrow">
        <button onClick={togglePossession} className="arrow-button">
          Toggle Possession
        </button>
        <p>Possession: {possession === "A" ? initialTeamA : initialTeamB}</p>
      </div>
      <div className="status">
        <p>Status: {status}</p>
      </div>
      <style jsx>{`
        .scoreboard {
        }

        .possession-arrow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .arrow-button {
          padding: 8px 12px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .fouls {
          margin-top: 10px;
        }
        .fouls p {
          font-weight: bold;
        }

        .fouls button {
          margin: 5px;
          padding: 5px 10px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
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
