import fetch from 'node-fetch';
import { URLSearchParams, URL } from 'url';

import { Wepn, calcShotsPerSecond } from './models/wepn';

const tersifyData = (data: {[key: string]: any}): Wepn => {
	const cleanVal = (val: string | number) => {
		if (typeof val === `string`) {
			// double/single quotes
			const pattern = /["']/gm;
			if (pattern.test(val)) {
				const cleanStr = val.replace(pattern, ``);
				if (cleanStr.length === 0) {
					return `<none>`;
				}
				return cleanStr;
			}
			// potential numbers
			const cleanNum = parseFloat(val);
			if (!isNaN(cleanNum)) {
				return cleanNum;
			}
		}
		return val;
	};
	return Object.entries({
		'Name': data.name,
		'Effect': data.result.effect,
		'Target': data.result.target,
		'Effect Type': data.config.fire_type,
		'Min Effect': data.result.min_effect_val,
		'Max Effect': data.result.max_effect_val,
		'Weapon Type': data.config.type,
		'Projectile Speed': data.config.projectile_speed,
		'Shots/s': calcShotsPerSecond(data.config),
		'Spawn Effect': data.result.spawned_weapon_effect
	}).reduce<Record<string, string | number>>((acc, [key, val]): {[key: string]: string | number} => {
		acc[key] = cleanVal(val);
		return acc;
	}, {}) as Wepn;
};

export default async (arg_pairs: { type: string, name: string, verbose?: boolean }) => {
	try {
		const url = new URL(process.env.API_LINK!);
		const params = new URLSearchParams();
		params.append(`type`, arg_pairs.type);
		params.append(`name`, arg_pairs.name);
		url.search = params.toString();
		const res = await fetch(url);
		const [data, ...others]: {[key: string]: any}[] = (await res.json()).sort((a: any, b: any) => {
			if (a.name.length < b.name.length) {
				return -1;
			} else if (a.name.length > b.name.length) {
				return 1;
			}
			return 0;
		});
		if (data) {
			delete data._id;
			if (arg_pairs.verbose) {
				return {
					data,
					others,
					url
				};
			} else {
				return {
					data: tersifyData(data),
					others,
					url
				};
			}	
		}
	} catch (err) {
		console.error(err);
		console.trace();
	}
	return {};
};
