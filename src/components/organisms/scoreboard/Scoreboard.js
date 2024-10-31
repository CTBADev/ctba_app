// components/Scoreboard.js
import React, { useEffect, useState } from "react";
import classes from "./Scoreboard.module.scss";
import { createClient } from "contentful-management";
import ImageUpload from "../imageUpload/ImageUpload";
import Link from "next/link";

const { C_SPACE_ID, C_CMA_KEY } = require("../../../helpers/contentful-config");

const contentfulClient = createClient({
  accessToken: C_CMA_KEY,
});

const Scoreboard = ({
  entryId,
  initialTeamA,
  initialTeamB,
  initialScoreA,
  initialScoreB,
  scoresheet,
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
  const [gamePeriods, setGamePeriods] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [inputMinutes, setInputMinutes] = useState(12);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial image URL from scoresheet prop
  useEffect(() => {
    if (scoresheet?.fields?.file?.url) {
      setImageUrl(`https:${scoresheet.fields.file.url}`);
    }
  }, [scoresheet]);

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

  const togglePossession = () => {
    setPossession((prevPossession) => (prevPossession === "A" ? "B" : "A"));
  };

  // Function to update score
  const updateScore = async (team, newScore) => {
    if (team === "A") setScoreA(newScore);
    if (team === "B") setScoreB(newScore);

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
  const handleImageUpload = async (file) => {
    try {
      setImageUrl(null); // Clear any existing image
      setIsLoading(true);
      const space = await contentfulClient.getSpace(C_SPACE_ID);
      const environment = await space.getEnvironment("master");

      // Step 1: Create an asset with the uploaded file
      let asset = await environment.createAssetFromFiles({
        fields: {
          title: {
            "en-US": file.name,
          },
          file: {
            "en-US": {
              contentType: file.type,
              fileName: file.name,
              file: file,
            },
          },
        },
      });

      // Step 2: Process the asset to prepare it for publishing
      await asset.processForAllLocales();

      // Step 3: Wait for processing to complete and refetch the latest version
      let isProcessed = false;
      while (!isProcessed) {
        asset = await environment.getAsset(asset.sys.id);
        isProcessed = asset.fields.file["en-US"].url ? true : false;
        if (!isProcessed) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
        }
      }

      // Step 4: Publish the asset
      const publishedAsset = await asset.publish();

      // Step 5: Retrieve and update the game entry with a link to the uploaded asset
      let entry = await environment.getEntry(entryId);
      entry.fields.scoresheet = {
        "en-US": {
          sys: {
            type: "Link",
            linkType: "Asset",
            id: publishedAsset.sys.id, // Link the uploaded asset ID here
          },
        },
      };

      // Update and wait for changes to propagate
      entry = await entry.update();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get a fresh version before publishing
      entry = await environment.getEntry(entry.sys.id);
      await entry.publish();

      // Set the image URL for display in the component
      setImageUrl(`https:${publishedAsset.fields.file["en-US"].url}`);
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={classes.oScoreBoard}>
        <div className="countdown">
          <div className={`${classes.oClock}`}>
            <span className={`${classes.mClock} fnt150`}>{`${String(
              minutes
            ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(
              milliseconds
            ).padStart(2, "0")}`}</span>
          </div>
        </div>
        <div className={`${classes.oTeams}`}>
          <div className={`${classes.oTeam} ${classes.teamA}`}>
            <div className={classes.oTeamData}>
              <div className={`${classes.mTeamData}`}>
                <p className={`${classes.aScore} fnt150`}>
                  {String(scoreA).padStart(3, "0")}
                </p>
                <div className={classes.mTeamFouls}>
                  <div className={classes.mFoulIcons}>
                    {[...Array(foulsA)].map((_, index) => (
                      <div key={index} className={classes.aFoulIcon}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <h2>{initialTeamA}</h2>
            <div className="timeOuts">
              <p>Timeouts: {timeOutsA}</p>
              <div className="foul-icons">
                {[...Array(timeOutsA)].map((_, index) => (
                  <div key={index} className="foul-icon"></div>
                ))}
              </div>
            </div>
          </div>
          <div className={classes.oGameData}>
            <figure
              className={`${classes.mPossessionArrow} ${
                possession === "A" ? classes.teamA : classes.teamB
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 100 100"
              >
                <path d="M26.1,97.3l.9-94.6,46.9,46.9-47.8,47.8Z" />
              </svg>
              <span>POS</span>
            </figure>
            <div className={classes.oGamePeriods}>
              <div className={classes.mGamePeriods}>
                {[...Array(gamePeriods)].map((_, index) => (
                  <div key={index} className={classes.aGamePeriod}></div>
                ))}
              </div>
              <p>QTR</p>
            </div>
          </div>
          <div className={`${classes.oTeam} ${classes.teamB}`}>
            <div className={classes.oTeamData}>
              <div className={`${classes.mTeamData}`}>
                <p className={`${classes.aScore} fnt150`}>
                  {String(scoreB).padStart(3, "0")}
                </p>
                <div className={classes.mTeamFouls}>
                  <div className={classes.mFoulIcons}>
                    {[...Array(foulsB)].map((_, index) => (
                      <div key={index} className={classes.aFoulIcon}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <h2>{initialTeamB}</h2>
            <div className={classes.mTimeOuts}>
              <p>Timeouts: {timeOutsB}</p>
              <div className="foul-icons">
                {[...Array(timeOutsB)].map((_, index) => (
                  <div key={index} className="foul-icon"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .arrow-button {
            padding: 8px 12px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
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
      <div className={`${classes.oContainer} container`}>
        <div className={`${classes.oRow} row`}>
          <div className={`${classes.oColStatsTeamA} col`}>
            <div className={`${classes.mGameScore}`}>
              <h4>ATTEMPTS</h4>
              <button onClick={() => updateScore("A", scoreA + 3)}>+3</button>
              <button onClick={() => updateScore("A", scoreA + 2)}>+2</button>
              <button onClick={() => updateScore("A", scoreA + 1)}>+1</button>
              <button onClick={() => updateScore("A", Math.max(0, scoreA - 1))}>
                -1
              </button>
              <button onClick={() => setScoreA(0)}>Reset Score</button>
            </div>
            <div className={`${classes.mTeamFouls}`}>
              <h4>TEAM FOULS</h4>
              <button onClick={() => foulsA < 5 && setFoulsA(foulsA + 1)}>
                +1 Foul
              </button>
              <button onClick={() => setFoulsA(Math.max(0, foulsA - 1))}>
                -1 Foul
              </button>
              <button onClick={() => setFoulsA(0)}>Reset Fouls</button>
            </div>
            <div className={`${classes.mTeamTimeOuts}`}>
              <h4>TIMEOUTS</h4>
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
          <div className={`${classes.oColGameControl} col`}>
            <div className={classes.mCtaRegion}>
              <h3>GAME TIME</h3>
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
            <div className={classes.mGamePeriodControls}>
              <h3>PERIODS</h3>
              <button
                onClick={() =>
                  gamePeriods < 8 && setGamePeriods(gamePeriods + 1)
                }
              >
                +1 Quarter
              </button>
              <button
                onClick={() => setGamePeriods(Math.max(1, gamePeriods - 1))}
              >
                -1 Quarter
              </button>
              <button onClick={() => setGamePeriods(1)}>Reset Quarters</button>
            </div>
            <h3>POSSESSION ARROW</h3>
            <button onClick={togglePossession} className="arrow-button">
              Toggle Possession
            </button>
          </div>
          <div className={`${classes.oColStatsTeamB} col`}>
            <div className={`${classes.mGameScore}`}>
              <h4>ATTEMPTS</h4>
              <button onClick={() => updateScore("B", scoreB + 3)}>+3</button>
              <button onClick={() => updateScore("B", scoreB + 2)}>+2</button>
              <button onClick={() => updateScore("B", scoreB + 1)}>+1</button>
              <button onClick={() => updateScore("B", Math.max(0, scoreB - 1))}>
                -1
              </button>
              <button onClick={() => setScoreB(0)}>Reset Score</button>
            </div>
            <div className={`${classes.mTeamFouls}`}>
              <h4>TEAM FOULS</h4>
              <button onClick={() => foulsB < 5 && setFoulsB(foulsB + 1)}>
                +1 Foul
              </button>
              <button onClick={() => setFoulsB(Math.max(0, foulsB - 1))}>
                -1 Foul
              </button>
              <button onClick={() => setFoulsB(0)}>Reset Fouls</button>
            </div>
            <div className={`${classes.mTeamTimeOuts}`}>
              <h4>TIMEOUTS</h4>
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
          <div className={`${classes.oColStatsTeamB} col`}>
            {scoresheet ? (
              <p>
                <Link href={`http:${scoresheet}`} target="_blank">
                  scoresheet uploaded
                </Link>
              </p>
            ) : (
              <>
                <ImageUpload onUpload={handleImageUpload} />
                {isLoading ? (
                  <p>uploading</p>
                ) : (
                  <>
                    <img src={imageUrl} width="20" height="20" />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Scoreboard;
