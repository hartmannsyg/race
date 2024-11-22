const fs = require('fs');
// Function to fetch data from the URL

const MAX_ATTEMPTS = 3;

async function fetchURL(url, attempts = 0) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const res = await response.json(); // Assuming the response is JSON
        if (!res.success) throw new Error(`NK error: ${res.error}`);

        return res.body;
    } catch (error) {
        if (attempts < MAX_ATTEMPTS) fetchData(attempts+1);
        else console.error(`[${Date.now()}] Failed to fetch ${url} in 3 tries:`, error);        
    }
}

async function fetchLB(race) {
    
    const { start, leaderboard, end } = race

    if (Date.now() < start) return;
    if (Date.now() > end) return;

    const lb = fetch(leaderboard)
    const lb2 = fetch(leaderboard + '?page=2')

    if (!lb || !lb2) return; // RIP
    
    const scores = lb.map((obj) => {
        return obj.scoreParts[0].score;
    });

    const scores2 = lb2.map((obj) => {
        return obj.scoreParts[0].score;
    });

    const text = await fs.readFileSync('scores.json', 'utf-8');
    const past = JSON.parse(text);
    
    const minutes = Math.round((Date.now() - start) / 60000)

    past.push([minutes, scores.concat(scores2)]);
        
    await fs.writeFileSync('scores.json', JSON.stringify(past));
    
    // console.log("Data stored:", scores);
}
async function main() {
    const races = await fetchURL(atob('aHR0cHM6Ly9kYXRhLm5pbmpha2l3aS5jb20vYnRkNi9yYWNlcw'))

    if (!races) console.error(`[${Date.now()}] OH FUCK FAILED TO FETCH RACES`)

    // Schedule the fetch every minute (60000 milliseconds)
    const fetchLeaderboardIntervalID = setInterval(fetchLB, 60000, races[0]);
}
main() 
