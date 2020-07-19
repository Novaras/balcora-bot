import Discord from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);
client.on(`ready`, () => console.log(`ready!`));
client.on(`error`, (err) => console.error(err));