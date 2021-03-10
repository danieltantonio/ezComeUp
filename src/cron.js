const cron = require('node-cron');
const bot = require('./bot');

console.log('Will begin on scheduled time... ');
cron.schedule('0 7 * * *', () => { // Set at 7AM time of your computer (Set this to the time of SNKRS app)
    console.log(`Started on: ${Date()}`);
    bot();
    console.log(`Finished on: ${Date()}`);
});