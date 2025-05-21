import React, { useEffect, useState } from "react";
import { getAllGames, getFutureFixtures } from "../../lib/contentful";
import Link from "next/link";
import styles from "./Fixtures.module.css";
import { useRouter } from "next/router";
import { getGames, getDivisions, getVenues } from "../lib/contentful";
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

export async function getStaticProps() {
  const fixtures = await getFutureFixtures();
  return {
    props: {
      fixtures,
    },
    // Revalidate every 5 minutes
    revalidate: 300,
  };
}

export default function Fixtures() {
  const [games, setGames] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, divisionsData, venuesData] = await Promise.all([
          getGames(),
          getDivisions(),
          getVenues(),
        ]);

        // Sort games by date and time
        const sortedGames = gamesData.sort((a, b) => {
          const dateA = new Date(a.fixtureDate);
          const dateB = new Date(b.fixtureDate);
          return dateA - dateB;
        });

        setGames(sortedGames);
        setDivisions(divisionsData);
        setVenues(venuesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredGames = games.filter((game) => {
    const divisionMatch =
      selectedDivision === "all" || game.ageGroup?.name === selectedDivision;
    const venueMatch =
      selectedVenue === "all" || game.venue?.name === selectedVenue;
    return divisionMatch && venueMatch;
  });

  // Group games by venue
  const gamesByVenue = filteredGames.reduce((acc, game) => {
    const venueName = game.venue?.name || "Unassigned Venue";
    if (!acc[venueName]) {
      acc[venueName] = [];
    }
    acc[venueName].push(game);
    return acc;
  }, {});

  // Sort venues by name
  const sortedVenueNames = Object.keys(gamesByVenue).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="text-center">Loading...</div>
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
                  <option key={division.sys.id} value={division.name}>
                    {division.name}
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
                  <option key={venue.sys.id} value={venue.name}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Games by Venue */}
            <div className="mt-8 space-y-8">
              {sortedVenueNames.map((venueName) => (
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
                      {gamesByVenue[venueName].map((game) => (
                        <div
                          key={game.sys.id}
                          className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {game.gameNumber} - {game.ageGroup?.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {format(
                                  new Date(game.fixtureDate),
                                  "EEEE, MMMM d, yyyy"
                                )}{" "}
                                at{" "}
                                {format(new Date(game.fixtureDate), "h:mm a")}
                                {game.courtNumber &&
                                  ` - Court ${game.courtNumber}`}
                              </p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {game.teamA?.clubName} vs {game.teamB?.clubName}
                              </p>
                              {game.scoreA !== undefined &&
                                game.scoreB !== undefined && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {game.scoreA} - {game.scoreB}
                                  </p>
                                )}
                            </div>
                            {user && (
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  onClick={() =>
                                    router.push(`/update-score/${game.sys.id}`)
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
        </div>
      </div>
    </div>
  );
}
