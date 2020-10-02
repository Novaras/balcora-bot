import fetch from 'node-fetch';
import { URLSearchParams, URL } from 'url';

import logger from './logger';
import ModelType from './models/model_types';
import TerseWepn, { calcShotsPerSecond } from './models/wepn';
import TerseShip from './models/ship';
import TerseSubs from './models/subs';

const cleanVal = (val: string | number | undefined) => {
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
	} else if (typeof val === `undefined`) {
		return `<none>`;
	}
	return val;
};

const tersifyWepnData = (data: {[key: string]: any}): TerseWepn => {
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
	}, {}) as TerseWepn;
};

const tersifyShipData = (data: {[key: string]: any}): TerseShip => {
	return Object.entries({
		'Name': data.name,
		'Class': data.attribs.DisplayFamily,
		'Hitpoints': data.attribs.maxhealth,
		'Build Cost': data.attribs.buildCost,
		'Build Time': data.attribs.buildTime,
		'Max Forward Speed': data.attribs.mainEngineMaxSpeed,
		'Max Strafe Speed': data.attribs.thrusterMaxSpeed,
		'Armour Type': data.attribs.ArmourFamily,
	}).reduce<Record<string, string | number>>((acc, [key, val]) => {
		acc[key] = cleanVal(val);
		return acc;
	}, {}) as TerseShip;
};

const tersifySubsData = (data: {[key: string]: any}): TerseSubs => {
	return Object.entries({
		'Name': data.name,
		'Hitpoints': data.attribs.maxhealth,
		'Build Cost': data.attribs.costToBuild,
		'Build Time': data.attribs.timeToBuild,
		'Innate': data.attribs.innate || 0,
		'Visible': data.attribs.visible || 0,
		'Linked weapon': data.weapon
	}).reduce<Record<string, string | number>>((acc, [key, val]) => {
		acc[key] = cleanVal(val);
		return acc;
	}, {}) as TerseSubs;
};

const tersifyData = (data: {[key: string]: any}, type: ModelType): TerseWepn | TerseShip | TerseSubs => {
	switch (type) {
		case 'ship':
			return tersifyShipData(data);
		case 'wepn':
			return tersifyWepnData(data);
		case 'subs':
			return tersifySubsData(data);
		case `unknown`:
			return tersifyWepnData(data);
	}
};

export default async (arg_pairs: { type: ModelType, name: string, verbose?: boolean }) => {
	try {
		const url = new URL(process.env.API_LINK!);
		const params = new URLSearchParams();
		params.append(`type`, arg_pairs.type);
		params.append(`name`, arg_pairs.name);
		url.search = params.toString();
		logger.verbose(`Fetching!: ${url.href}`);
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
					data: tersifyData(data, arg_pairs.type),
					others,
					url
				};
			}	
		}
	} catch (err) {
		logger.error(err);
		console.trace();
	}
	return {};
};
