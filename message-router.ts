import { Message, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import fetchInfo from './fetch-info';
import { resolveArg, resolveFlag } from './args';
import { prettyPrintObj, toCodeBlock } from './formatting';
import logger from './logger';
import ModelType from './models/model_types';

const isBotCommand = (msg_content: string) => {
	const prepend = msg_content.slice(0, 3);
	return prepend.toLowerCase() === `bb `;
};

const dispatchCommand = async (msg: Message, cmd_type: string, args: { [key: string]: string }, flags?: { [key: string]: boolean }) => {
	if ((flags?.verbose || flags?.raw) && msg.channel.type !== `dm`) {
		return `❌ Flags \`verbose (--v)\` and \`raw (--r)\` are not allowed outside direct messages.`;
	} 
	switch (cmd_type.toLowerCase()) {
		case `info`:
			if (!args.type || !args.name) {
				return undefined;
			}
			const {data, others, url} = await fetchInfo({ type: args.type as ModelType, name: args.name, verbose: (flags?.verbose || flags?.raw) });
			if (data && url) {
				const balcora_gate_url = `${process.env.BALCORA_REF_LINK!}?name=${args.name}&type=${args.type}`;

				// hacky, pls refactor
				const and_others_str = others?.length && others.length > 5 ? `... and **${others.length - 5}** others.` : ``;
				const top_5_others_str = others?.slice(0, 5).reduce((acc, entity) => {
					if (acc.length) return `${acc}, \`${entity.name}\``;
					else return `\`${entity.name}\``;
				}, ``);
				const also_found_str = others?.length ? `⚠️ Also indexed: ${top_5_others_str}${and_others_str}` : ``;
				
				const balcora_link = `On balcora: ${balcora_gate_url}`;
				const direct_api_link = `API: ${url.href}`;

				const data_str = (() => {
					if (flags?.raw || flags?.as_json) {
						return toCodeBlock(JSON.stringify(data));
					} else {
						return prettyPrintObj(data);
					}
				})();
				if (flags?.verbose || flags?.raw) {
					return `${also_found_str}\n${balcora_link}\n${direct_api_link}\n${data_str}`;
				} else {
					return new MessageEmbed()
						.setColor(`#e0683b`)
						.setTitle(data.name ?? data.Name ?? `Data`)
						.setURL(balcora_gate_url)
						.setDescription(also_found_str)
						.addField(`Reference:`, `${balcora_link}\n${direct_api_link}`)
						.addField(`Data:`, data_str);
				}
			} else {
				return new MessageEmbed()
					.setColor(`#e0683b`)
					.setTitle(`Search data`)
					.setURL(process.env.BALCORA_REF_LINK!)
					.setDescription(`**❌ No data found!**`)
					.addFields([
						{
							name: `Name:`,
							value: `\`${args.name ?? `**Not defined!**`}\``
						},
						{
							name: `Category (type):`,
							value: `\`${args.type ?? `**Not defined!**`}\``
						},
						{
							name: `Search:`,
							value: url?.href ?? `**Not defined!**`
						}
					]);
			}
	}
	return undefined;
};

export default async (msg: Message) => {
	const content = msg.content;

	if (isBotCommand(content)) {
		const [ type, ...payload ] = [...content.matchAll(/^bb\s+(.+)/gm)][0][1].split(/\s+/gm); // split into cmd type | payload
		logger.verbose(type);
		logger.verbose(payload);
		const { args } = payload.reduce((acc: { [key: string]: any }, word: string) => {
			logger.verbose(`word: ${word}`);
			logger.verbose(`regex: ${/^-\w+/gm.test(word)}`);
			if (word.length > 1 && /^-\w+/gm.test(word)) { // word beginning with '-' is an arg
				const raw = word.slice(1);
				const parsed = resolveArg(raw);
				logger.verbose(`word is arg: (${raw} -> ${parsed})`);
				acc.args[parsed] = null;
				acc.last.key = parsed;
			} else if (acc.last.key !== null) { // words after arg words are values
				acc.args[acc.last.key] = word;
				acc.last.key = null;
			}
			logger.verbose(acc);
			return acc;
		}, {
			last: {
				key: null,
			},
			args: {}
		});
		logger.verbose(`args:`);
		logger.verbose(args);

		const { flags } = payload.reduce((acc: { [key: string]: any }, word: string) => {
			logger.verbose(word);
			const pattern = /^--\w+/gm;
			if (word.length > 2 && pattern.test(word)) {
				const raw = word.slice(2);
				const parsed = resolveFlag(raw);
				logger.verbose(`word is flag: (${raw} -> ${parsed})`);
				acc.flags[parsed] = true;
			}
			return acc;
		}, {
			flags: {},
		});
		logger.verbose(`flags:`);
		logger.verbose(flags);

		logger.verbose(`router success`);
		return dispatchCommand(msg, type, args, flags);
	}
	return undefined;
};