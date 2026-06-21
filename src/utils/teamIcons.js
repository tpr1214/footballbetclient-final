const SPORT_DB_BASE_URL = "https://www.thesportsdb.com/api/v1/json/123";
const API_FOOTBALL_LOGO_BASE_URL = "https://media.api-sports.io/football/teams";
const LOGO_CACHE_KEY = "footballbet-team-logos-v1";
const LOGO_CACHE_TTL = 1000 * 60 * 60 * 24;

const TEAM_DATA_URLS = [
    `${SPORT_DB_BASE_URL}/search_all_teams.php?l=Israeli_Premier_League`,
    `${SPORT_DB_BASE_URL}/search_all_teams.php?l=English_Premier_League`,
    `${SPORT_DB_BASE_URL}/search_all_teams.php?l=Spanish_La_Liga`
];

const FALLBACK_ICONS = {
    "מכבי חיפה": "🟢",
    "הפועל באר שבע": "🔴",
    "מכבי תל אביב": "🟡",
    "ביתר ירושלים": "🦁",
    "הפועל פתח תקווה": "🔵",
    "מכבי נתניה": "🟠",
    "הפועל תל אביב": "🔴",
    "עירוני קרית שמונה": "❄️",
    "ברצלונה": "🔵",
    "ריאל מדריד": "⚪",
    "מנצ'סטר סיטי": "🔷",
    "ליברפול": "🔴"
};

const TEAM_ALIASES = {
    "מכבי חיפה": ["maccabi haifa"],
    "הפועל באר שבע": ["hapoel be'er sheva", "hapoel beer sheva", "hapoel beer-sheva"],
    "מכבי תל אביב": ["maccabi tel aviv"],
    "ביתר ירושלים": ["beitar jerusalem"],
    "הפועל פתח תקווה": ["hapoel petah tikva"],
    "מכבי נתניה": ["maccabi netanya"],
    "הפועל תל אביב": ["hapoel tel-aviv", "hapoel tel aviv"],
    "עירוני קרית שמונה": ["hapoel ironi kiryat shmona", "ironi kiryat shmona"],
    "ברצלונה": ["barcelona", "fc barcelona"],
    "ריאל מדריד": ["real madrid"],
    "מנצ'סטר סיטי": ["manchester city"],
    "ליברפול": ["liverpool"]
};

const STATIC_API_FOOTBALL_IDS = {
    "מכבי חיפה": "562",
    "הפועל באר שבע": "563",
    "מכבי תל אביב": "604",
    "ביתר ירושלים": "657",
    "הפועל פתח תקווה": "4488",
    "מכבי נתניה": "605",
    "הפועל תל אביב": "4501",
    "עירוני קרית שמונה": "4510"
};

let logoMapPromise;

export function getTeamName(team) {
    if (!team) return "";
    return (typeof team === "string" ? team : team.name || "").trim();
}

export function getTeamFallbackIcon(team) {
    return FALLBACK_ICONS[getTeamName(team)] || "⚽";
}

export function getTeamLabel(team) {
    const name = getTeamName(team);
    return name ? `${getTeamFallbackIcon(name)} ${name}` : "";
}

export async function getTeamLogo(team) {
    const name = getTeamName(team);
    if (!name) return "";

    const logoMap = await loadTeamLogos();
    return logoMap[normalizeName(name)] || getStaticApiFootballLogo(name) || "";
}

async function loadTeamLogos() {
    if (!logoMapPromise) {
        logoMapPromise = loadCachedTeamLogos() || fetchTeamLogos();
    }

    return logoMapPromise;
}

function loadCachedTeamLogos() {
    try {
        const cached = JSON.parse(localStorage.getItem(LOGO_CACHE_KEY) || "null");
        if (cached?.createdAt && Date.now() - cached.createdAt < LOGO_CACHE_TTL) {
            return Promise.resolve(cached.logos || {});
        }
    } catch {
        localStorage.removeItem(LOGO_CACHE_KEY);
    }

    return null;
}

async function fetchTeamLogos() {
    const responses = await Promise.allSettled(
        TEAM_DATA_URLS.map((url) => fetch(url).then((response) => response.json()))
    );

    const logos = {};
    responses.forEach((response) => {
        if (response.status !== "fulfilled") return;
        (response.value?.teams || []).forEach((team) => addTeamLogo(logos, team));
    });

    Object.entries(STATIC_API_FOOTBALL_IDS).forEach(([teamName, apiFootballId]) => {
        logos[normalizeName(teamName)] = `${API_FOOTBALL_LOGO_BASE_URL}/${apiFootballId}.png`;
    });

    try {
        localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify({createdAt: Date.now(), logos}));
    } catch {
        // Cache is optional; rendering should keep working without it.
    }

    return logos;
}

function addTeamLogo(logos, team) {
    const logoUrl = team.strTeamBadge || team.strTeamLogo || getApiFootballLogo(team.idAPIfootball);
    if (!logoUrl) return;

    getTeamKeys(team).forEach((key) => {
        logos[key] = logoUrl;
    });
}

function getTeamKeys(team) {
    const names = [
        team.strTeam,
        team.strTeamShort,
        ...(team.strTeamAlternate || "").split(",")
    ];

    Object.entries(TEAM_ALIASES).forEach(([hebrewName, aliases]) => {
        if (aliases.some((alias) => names.some((name) => normalizeName(name) === normalizeName(alias)))) {
            names.push(hebrewName);
        }
    });

    return [...new Set(names.map(normalizeName).filter(Boolean))];
}

function getStaticApiFootballLogo(teamName) {
    const apiFootballId = STATIC_API_FOOTBALL_IDS[getTeamName(teamName)];
    return getApiFootballLogo(apiFootballId);
}

function getApiFootballLogo(apiFootballId) {
    return apiFootballId && apiFootballId !== "0" ? `${API_FOOTBALL_LOGO_BASE_URL}/${apiFootballId}.png` : "";
}

function normalizeName(name) {
    return (name || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[׳'`"]/g, "")
        .replace(/[-–־]/g, " ")
        .replace(/\s+/g, " ");
}
