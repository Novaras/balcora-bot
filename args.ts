import fs from 'fs';

export type AliasDictionary = {
	[key: string]: string[];
};

export const arg_aliases: AliasDictionary = JSON.parse(fs.readFileSync(`./arg-aliases.json`, 'utf-8'));
export const flag_aliases: AliasDictionary = JSON.parse(fs.readFileSync(`./flag-aliases.json`, `utf-8`));

export const resolveArg = (arg_alias: string): string => {
	return (Object.entries(arg_aliases).find(([real_name, alias_list]) => {
		return arg_alias === real_name || alias_list.includes(arg_alias);
	}) ?? [`unknown`])[0];
};

export const resolveFlag = (flag_alias: string): string => {
	return (Object.entries(flag_aliases).find(([real_name, alias_list]) => {
		return flag_alias === real_name || alias_list.includes(flag_alias);
	}) ?? [`unknown`])[0];
};
