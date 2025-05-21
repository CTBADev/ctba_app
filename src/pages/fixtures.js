import React, { useEffect, useState } from "react";
import { getGames, getDivisions, getVenues } from "../lib/contentful";
import Link from "next/link";
import styles from "./Fixtures.module.css";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

// Helper function to format date consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/,/g, ""); // Remove commas for consistency
}

export async function getServerSideProps() {
  try {
    const [games, divisions, venues] = await Promise.all([
      getGames(),
      getDivisions(),
      getVenues(),
    ]);

    return {
      props: {
        games,
        divisions,
        venues,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        games: [],
        divisions: [],
        venues: [],
      },
    };
  }
}

export default function Fixtures({
  games: initialGames,
  divisions: initialDivisions,
  venues: initialVenues,
}) {
  const [games, setGames] = useState(initialGames);
  const [divisions, setDivisions] = useState(initialDivisions);
  const [venues, setVenues] = useState(initialVenues);
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Get current date and time
  const now = new Date();

  // Sort games by date and time, and filter for future games only
  const sortedGames = games
    .filter((game) => {
      const gameDate = new Date(game.fields.fixtureDate);
      return gameDate > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.fields.fixtureDate);
      const dateB = new Date(b.fields.fixtureDate);
      return dateA - dateB;
    });

  const filteredGames = sortedGames.filter((game) => {
    const divisionMatch =
      selectedDivision === "all" ||
      game.fields.ageGroup?.fields?.name === selectedDivision;
    const venueMatch =
      selectedVenue === "all" ||
      game.fields.venue?.fields?.name === selectedVenue;
    return divisionMatch && venueMatch;
  });

  // Group games by date first, then by venue
  const gamesByDateAndVenue = filteredGames.reduce((acc, game) => {
    const gameDate = new Date(game.fields.fixtureDate);
    const dateKey = format(gameDate, "yyyy-MM-dd");
    const venueName = game.fields.venue?.fields?.name || "Unassigned Venue";

    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][venueName]) {
      acc[dateKey][venueName] = [];
    }
    acc[dateKey][venueName].push(game);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(gamesByDateAndVenue).sort();

  // Debug log
  console.log("Current time:", now);
  console.log("Games by Date and Venue:", gamesByDateAndVenue);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // If no future games, show a message
  if (sortedGames.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-7xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Fixtures
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                  No upcoming fixtures scheduled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-7xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Fixtures
              </h1>
            </div>

            {/* Filters */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Divisions</option>
                {divisions.map((division) => (
                  <option key={division.sys.id} value={division.fields.name}>
                    {division.fields.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue.sys.id} value={venue.fields.name}>
                    {venue.fields.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Games by Date and Venue */}
            <div className="mt-8 space-y-12">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                  </h2>
                  <div className="space-y-8">
                    {Object.entries(gamesByDateAndVenue[dateKey])
                      .sort(([venueA], [venueB]) =>
                        venueA.localeCompare(venueB)
                      )
                      .map(([venueName, games]) => (
                        <div
                          key={venueName}
                          className="bg-white shadow overflow-hidden sm:rounded-lg"
                        >
                          <div className="px-4 py-5 sm:px-6 bg-gray-50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {venueName}
                            </h3>
                          </div>
                          <div className="border-t border-gray-200">
                            <div className="bg-white divide-y divide-gray-200">
                              {games.map((game) => (
                                <div
                                  key={game.sys.id}
                                  className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-indigo-600 truncate">
                                        {game.fields.gameNumber} -{" "}
                                        {game.fields.ageGroup?.fields?.name}
                                      </p>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {format(
                                          new Date(game.fields.fixtureDate),
                                          "h:mm a"
                                        )}
                                        {game.fields.courtNumber &&
                                          ` - Court ${game.fields.courtNumber}`}
                                      </p>
                                    </div>
                                    <div className="flex-1 text-center">
                                      <p className="text-sm font-medium text-gray-900">
                                        {game.fields.teamA?.fields?.clubName} vs{" "}
                                        {game.fields.teamB?.fields?.clubName}
                                      </p>
                                      {game.fields.scoreA !== undefined &&
                                        game.fields.scoreB !== undefined && (
                                          <p className="mt-1 text-sm text-gray-500">
                                            {game.fields.scoreA} -{" "}
                                            {game.fields.scoreB}
                                          </p>
                                        )}
                                    </div>
                                    {user && (
                                      <div className="ml-4 flex-shrink-0">
                                        <button
                                          onClick={() =>
                                            router.push(
                                              `/update-score/${game.sys.id}`
                                            )
                                          }
                                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Update Score
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
