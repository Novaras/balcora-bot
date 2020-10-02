import Discord, { Message, NewsChannel, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import logger from './logger';
import messageRouter from './message-router';

const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);
client.on(`ready`, () => logger.info(`Ready`));
client.on(`error`, (err) => logger.error(err));

client.on(`message`, async (msg: Message) => {
	const resolveOriginName = (msg: Message) => {
		const chan = msg.channel;
		switch (chan.type) {
			case `dm`:
				return `DM::${msg.author.username}`;
			default:
				return `${msg.guild?.name}::${(chan as TextChannel | NewsChannel).name}`;
		}
	}
	logger.info(`[${resolveOriginName(msg)}] ${msg.author.username}: ${msg.content}`);
	const response = await messageRouter(msg);
	if (response) {
		logger.info(`sending (${response.length} chars)...`);
		if (msg.channel.type === `dm`) {
			const user = msg.author;
			user.send(response);
		} else {
			msg.channel.send(response);
		} 
	}
});
