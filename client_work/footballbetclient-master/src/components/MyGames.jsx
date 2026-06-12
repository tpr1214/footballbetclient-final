import {useEffect, useState} from "react";
import {getMatches} from "../service/leagueApi.js";

function MyGames() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        getMatches()
            .then((response) => setMatches(response.data.filter((match) => match.status === "PENDING")))
            .catch(() => setMatches([]));
    }, []);

    return (
        <div className="page-shell">
            <h1>המשחקים העתידיים שלי</h1>
            <div className="grid-list">
                {matches.map((match) => (
                    <section className="match-card" key={match.id}>
                        <h3>{match.homeTeam.name} נגד {match.awayTeam.name}</h3>
                        <p>מחזור {match.roundNumber}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default MyGames;
