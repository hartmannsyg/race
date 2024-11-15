const url = atob("aHR0cHM6Ly9kYXRhLm5pbmpha2l3aS5jb20vYnRkNi9yYWNlcy9EZWNyeXB0ZWRfbTNoaHBwdWkvbGVhZGVyYm9hcmQ="); // Replace with your desired URL
const fs = require('fs');
// Function to fetch data from the URL
async function fetchData(attempts = 0) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);


        const res = await response.json(); // Assuming the response is JSON

        if (!res.success) throw new Error(`NK error: ${res.error}`);

        // responseStorage.push(data); // Store the data
        const scores = res.body.map((obj) => {
            return obj.scoreParts[0].score;
        });

        let text = await fs.readFileSync('scores.json', 'utf-8');
        let past = JSON.parse(text);
        console.log(past);
        past.push(scores);
        
        await fs.writeFileSync('scores.json', JSON.stringify(past));
    
        console.log("Data stored:", scores);

    } catch (error) {
        if (attempts < 3) fetchData(attempts+1);
        else console.error(`[${Date.now()}] Failed to fetch data in 3 tries:`, error);
        
    }


}
fetchData(0)
// Schedule the fetch every minute (60000 milliseconds)
setInterval(fetchData, 60000);