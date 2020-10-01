import Discord, { Message } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import messageRouter from './message-router';

const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);
client.on(`ready`, () => console.log(`ready!`));
client.on(`error`, (err) => console.error(err));

client.on(`message`, async (msg: Message) => {
	const response = await messageRouter(msg);
	if (response) {
		console.log(`sending (${response.length} chars)...`);
		if (msg.channel.type === `dm`) {
			const user = msg.author;
			user.send(response);
		} else {
			msg.channel.send(response);
		} 
	}
});
