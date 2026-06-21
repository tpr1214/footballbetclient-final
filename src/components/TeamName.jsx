import {useEffect, useState} from "react";
import {getTeamFallbackIcon, getTeamLogo, getTeamName} from "../utils/teamIcons.js";

function TeamName({team, className = ""}) {
    const name = getTeamName(team);
    const [logoUrl, setLogoUrl] = useState("");

    useEffect(() => {
        let isMounted = true;

        getTeamLogo(name)
            .then((url) => {
                if (isMounted) setLogoUrl(url);
            })
            .catch(() => {
                if (isMounted) setLogoUrl("");
            });

        return () => {
            isMounted = false;
        };
    }, [name]);

    return (
        <span className={`team-name-with-icon ${className}`.trim()} title={name}>
            {logoUrl ? (
                <img
                    className="team-logo"
                    src={logoUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={() => setLogoUrl("")}
                />
            ) : (
                <span className="team-icon" aria-hidden="true">{getTeamFallbackIcon(name)}</span>
            )}
            <span className="team-label">{name}</span>
        </span>
    );
}

export default TeamName;
