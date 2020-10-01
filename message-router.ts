import { Message, MessageEmbed } from 'discord.js';
import fetchInfo from './fetch-info';
import { resolveArg, resolveFlag } from './args';
import { prettyPrintObj, toCodeBlock } from './formatting';
import { URL, URLSearchParams } from 'url';

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
			const {data, others, url} = await fetchInfo({ type: args.type, name: args.name, verbose: (flags?.verbose || flags?.raw) });
			if (data && url) {
				console.log(`the data:`);
				console.log(data);
				console.log(`verbose?: ${flags?.verbose}`);
				console.log(`raw?: ${flags?.raw}`);

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
	const username = msg.author.username;
	console.log(`${username}: ${content}`);
	if (isBotCommand(content)) {
		console.group(`COMMAND:`);
		const [ type, ...payload ] = [...content.matchAll(/^bb\s+(.+)/gm)][0][1].split(/\s+/gm); // split into cmd type | payload
		console.log(type);
		console.log(payload);
		const { args } = payload.reduce((acc: { [key: string]: any }, word: string) => {
			console.log(`word: ${word}`);
			console.log(`regex: ${/^-\w+/gm.test(word)}`);
			if (word.length > 1 && /^-\w+/gm.test(word)) { // word beginning with '-' is an arg
				const raw = word.slice(1);
				const parsed = resolveArg(raw);
				console.log(`word is arg: (${raw} -> ${parsed})`);
				acc.args[parsed] = null;
				acc.last.key = parsed;
			} else if (acc.last.key !== null) { // words after arg words are values
				acc.args[acc.last.key] = word;
				acc.last.key = null;
			}
			console.log(acc);
			return acc;
		}, {
			last: {
				key: null,
			},
			args: {}
		});
		console.log(`args:`);
		console.log(args);

		const { flags } = payload.reduce((acc: { [key: string]: any }, word: string) => {
			console.log(word);
			const pattern = /^--\w+/gm;
			if (word.length > 2 && pattern.test(word)) {
				const raw = word.slice(2);
				const parsed = resolveFlag(raw);
				console.log(`word is flag: (${raw} -> ${parsed})`);
				acc.flags[parsed] = true;
			}
			return acc;
		}, {
			flags: {},
		});
		console.log(`flags:`);
		console.log(flags);
		console.groupEnd();

		console.log(`router success`);
		return dispatchCommand(msg, type, args, flags);
	}
	return undefined;
};