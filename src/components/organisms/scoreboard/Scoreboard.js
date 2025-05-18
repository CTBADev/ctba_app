import React, { useEffect, useState } from "react";
import classes from "./Scoreboard.module.scss";
import { createClient } from "contentful-management";
import ImageUpload from "../imageUpload/ImageUpload";
import Link from "next/link";
import { updateGameScore } from "../../../../lib/contentful";
const {
  C_SPACE_ID,
  C_CMA_KEY,
} = require("../../../../helpers/contentful-config");
const contentfulClient = createClient({ accessToken: C_CMA_KEY });
const Scoreboard = ({
  entryId,
  initialTeamA,
  initialTeamB,
  initialScoreA,
  initialScoreB,
  scoresheet,
  teamAId,
  teamBId,
  onScoreUpdate,
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
  const [resultPhoto, setResultPhoto] = useState(false);
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
      }, 10);
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
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  const togglePossession = () => {
    setPossession((prevPossession) => (prevPossession === "A" ? "B" : "A"));
  };
  const updateScore = async (team, newScore) => {
    try {
      if (team === "A") setScoreA(newScore);
      if (team === "B") setScoreB(newScore);
      await updateGameScore(
        entryId,
        team === "A" ? newScore : scoreA,
        team === "B" ? newScore : scoreB
      );
      if (onScoreUpdate) {
        await onScoreUpdate();
      }
    } catch (error) {
      console.error("Error updating score:", error);
      if (team === "A") setScoreA(scoreA);
      if (team === "B") setScoreB(scoreB);
    }
  };
  const handleImageUpload = async (file) => {
    try {
      setImageUrl(null);
      setIsLoading(true);
      const space = await contentfulClient.getSpace(C_SPACE_ID);
      const environment = await space.getEnvironment("master");
      let asset = await environment.createAssetFromFiles({
        fields: {
          title: { "en-US": file.name },
          file: {
            "en-US": {
              contentType: file.type,
              fileName: file.name,
              file: file,
            },
          },
        },
      });
      await asset.processForAllLocales();
      let isProcessed = false;
      while (!isProcessed) {
        asset = await environment.getAsset(asset.sys.id);
        isProcessed = asset.fields.file["en-US"].url ? true : false;
        if (!isProcessed) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      const publishedAsset = await asset.publish();
      let entry = await environment.getEntry(entryId);
      entry.fields.scoresheet = {
        "en-US": {
          sys: { type: "Link", linkType: "Asset", id: publishedAsset.sys.id },
        },
      };
      entry = await entry.update();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      entry = await environment.getEntry(entry.sys.id);
      await entry.publish();
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
        <div className={classes.oTime}>
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
            <h2>
              {initialTeamA}
              {teamAId && (
                <Link href={`/team/${teamAId}`} className={classes.teamLink}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </Link>
              )}
            </h2>
            <div className={classes.mTimeOuts}>
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
                  <div
                    key={index}
                    className={`${classes.aGamePeriod} ${
                      index + 1 === gamePeriods ? classes.active : ""
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
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
            <h2>
              {initialTeamB}
              {teamBId && (
                <Link href={`/team/${teamBId}`} className={classes.teamLink}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </Link>
              )}
            </h2>
            <div className="timeOuts">
              <p>Timeouts: {timeOutsB}</p>
              <div className="foul-icons">
                {[...Array(timeOutsB)].map((_, index) => (
                  <div key={index} className="foul-icon"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${classes.oControls} container-fluid`}>
        <div className={`${classes.oControlsRow} row`}>
          <div className={`${classes.oScoreControls} col`}>
            <div className={`${classes.oTeamControls}`}>
              <div className={classes.oTeamControl}>
                <div className={classes.oGameScore}>
                  <h3>SCORE</h3>
                  <div className={classes.mScorePoints}>
                    <button
                      onClick={() => updateScore("A", scoreA + 3)}
                      className={`aBtn`}
                    >
                      +3
                    </button>
                    <button
                      onClick={() => updateScore("A", scoreA + 2)}
                      className={`aBtn`}
                    >
                      +2
                    </button>
                    <button
                      onClick={() => updateScore("A", scoreA + 1)}
                      className={`aBtn`}
                    >
                      +1
                    </button>
                  </div>
                  <div className={classes.mScorePoints}>
                    <button
                      onClick={() => updateScore("A", Math.max(0, scoreA - 1))}
                      className={`aBtn btnSmall`}
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to set score to 0?"
                          )
                        ) {
                          updateScore("A", 0);
                        }
                      }}
                      className={`aBtn btnSmall`}
                    >
                      reset
                    </button>
                  </div>
                  <div className={classes.oFoulControls}>
                    <h3>TEAM FOULS</h3>
                    <div className={classes.mScorePoints}>
                      <button
                        onClick={() => setFoulsA(Math.min(5, foulsA + 1))}
                        className={`aBtn btnSmall`}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setFoulsA(Math.max(0, foulsA - 1))}
                        className={`aBtn btnSmall`}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => setFoulsA(0)}
                        className={`aBtn btnSmall`}
                      >
                        reset
                      </button>
                    </div>
                  </div>
                  <div className={classes.oTimeoutControls}>
                    <h3>TIMEOUTS</h3>
                    <div className={classes.mScorePoints}>
                      <button
                        onClick={() => setTimeOutsA(Math.min(3, timeOutsA + 1))}
                        className={`aBtn btnSmall`}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setTimeOutsA(Math.max(0, timeOutsA - 1))}
                        className={`aBtn btnSmall`}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => setTimeOutsA(0)}
                        className={`aBtn btnSmall`}
                      >
                        reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${classes.oGameControls} col`}>
            <div className={`${classes.oGameScore}`}>
              <div className={`${classes.oTimeControls}`}>
                <div className={classes.oTimeButtons}>
                  <h3>GAME CLOCK</h3>
                  <div className={`${classes.mScorePoints}`}>
                    <button
                      onClick={isRunning ? stopCountdown : startCountdown}
                      className={`${classes.aButton} aBtn btnBig  ${
                        isRunning ? classes.active : ""
                      }`}
                    >
                      {isRunning ? "Stop" : "Start"}
                    </button>
                  </div>
                  <div className={`${classes.mScorePoints}`}>
                    <button onClick={togglePossession} className={`aBtn`}>
                      Possession
                    </button>
                  </div>
                  <h3>PERIODS</h3>
                  <div className={`${classes.mScorePoints}`}>
                    <button
                      className={`aBtn btnSmall`}
                      onClick={() =>
                        setGamePeriods((prev) => Math.min(8, prev + 1))
                      }
                    >
                      +1
                    </button>
                    <button
                      className={`aBtn btnSmall`}
                      onClick={() =>
                        setGamePeriods((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -1
                    </button>
                    <button
                      className={`aBtn btnSmall`}
                      onClick={() => setGamePeriods(1)}
                    >
                      Reset
                    </button>
                  </div>
                  <h3>clock settings</h3>
                  <div className={`${classes.mScorePoints}`}>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputMinutes}
                      onChange={(e) =>
                        setInputMinutes(parseInt(e.target.value) || 0)
                      }
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputSeconds}
                      onChange={(e) =>
                        setInputSeconds(parseInt(e.target.value) || 0)
                      }
                    />
                    <button onClick={updateTime} className={`aBtn btnSmall`}>
                      Set Time
                    </button>
                    {/* <button
                      onClick={resetCountdown}
                      className={`aBtn btnSmall`}
                    >
                      Reset
                    </button> */}
                  </div>
                  <h3>upload scoresheet</h3>
                  <div className={`${classes.oImageUpload}`}>
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      isLoading={isLoading}
                    />
                    {imageUrl && (
                      <div className={classes.oImagePreview}>
                        <img src={imageUrl} alt="Scoresheet" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${classes.oScoreControls} col`}>
            <div className={`${classes.oTeamControls}`}>
              <div className={classes.oTeamControl}>
                <div className={classes.oGameScore}>
                  <h3>SCORE</h3>
                  <div className={classes.mScorePoints}>
                    <button
                      onClick={() => updateScore("B", scoreB + 3)}
                      className={`aBtn `}
                    >
                      +3
                    </button>
                    <button
                      onClick={() => updateScore("B", scoreB + 2)}
                      className={`aBtn `}
                    >
                      +2
                    </button>
                    <button
                      onClick={() => updateScore("B", scoreB + 1)}
                      className={`aBtn `}
                    >
                      +1
                    </button>
                  </div>
                  <div className={classes.mScorePoints}>
                    <button
                      onClick={() => updateScore("B", Math.max(0, scoreB - 1))}
                      className={`aBtn btnSmall`}
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to set score to 0?"
                          )
                        ) {
                          updateScore("B", 0);
                        }
                      }}
                      className={`aBtn btnSmall`}
                    >
                      reset
                    </button>
                  </div>
                  <div className={`${classes.oFoulControls}`}>
                    <h3>TEAM FOULS</h3>
                    <div className={classes.mScorePoints}>
                      <button
                        onClick={() => setFoulsB(Math.min(5, foulsB + 1))}
                        className={`aBtn btnSmall`}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setFoulsB(Math.max(0, foulsB - 1))}
                        className={`aBtn btnSmall`}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => setFoulsB(0)}
                        className={`aBtn btnSmall`}
                      >
                        reset
                      </button>
                    </div>
                  </div>
                  <div className={classes.oTimeoutControls}>
                    <h3>TIMEOUTS</h3>
                    <div className={classes.mScorePoints}>
                      <button
                        onClick={() => setTimeOutsB(Math.min(3, timeOutsB + 1))}
                        className={`aBtn btnSmall`}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setTimeOutsB(Math.max(0, timeOutsB - 1))}
                        className={`aBtn btnSmall`}
                      >
                        -1
                      </button>
                      <button
                        onClick={() => setTimeOutsB(0)}
                        className={`aBtn btnSmall`}
                      >
                        reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Scoreboard;
