const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Case = require('./src/models/Case');

const seedDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    await Case.deleteMany({});
    console.log("Cleared existing cases.");

    const areas = ['Kothrud', 'Hinjewadi', 'Hadapsar', 'Wakad', 'Baner'];
    const diseases = ['dengue', 'malaria', 'chikungunya', 'typhoid'];
    
    const finalData = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
        // generate random cases from the last 30 days
        const area = areas[Math.floor(Math.random() * areas.length)];
        const disease = diseases[Math.floor(Math.random() * diseases.length)];
        const cases = Math.floor(Math.random() * 25) + 1;
        const d = new Date(today.getTime() - Math.floor(Math.random() * 28) * 24 * 60 * 60 * 1000);
        
        finalData.push({
            area: area,
            city: 'Pune',
            date: d,
            disease: disease,
            cases: cases,
            source: 'seed_script'
        });
    }

    const result = await Case.insertMany(finalData);
    console.log(`Successfully seeded ${result.length} correct cases format.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
