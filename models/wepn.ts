export enum WepnEffect { DAMAGE = `Damage` };
export enum WepnTarget { SELF = `Self`, ENEMY = `Enemy` };
export enum WepnEffectType { INSTANTHIT = `InstantHit`, BULLET = `Bullet`, MISSILE = `Missile`, MINE = `Mine`, SPHEREBURST = `SphereBurst` };
export enum WepnType { FIXED = `Fixed`, GIMBLE = `Gimble`, ANIMATEDTURRET = `AnimatedTurret` };

export type Wepn = {
	name: string,
	effect: WepnEffect,
	effect_target: WepnTarget,
	effect_type: WepnEffectType,
	min_effect: number,
	max_effect: number,
	type: WepnType,
	projectile_speed: number,
	shots_per_second: number,
	spawn_effect: string,
};

export const calcShotsPerSecond = (wepn_config: { [key: string]: any }): number => {
	const fire_burst_duration = parseFloat(wepn_config.fire_burst_duration);
	const time_between_shots = parseFloat(wepn_config.time_between_shots);
	const time_between_bursts = parseFloat(wepn_config.time_between_bursts);
	return parseFloat((() => {
		if (fire_burst_duration === 0) {
			return (1 / time_between_shots);
		} else {
			return ((fire_burst_duration / time_between_shots) / time_between_bursts);
		}
	})().toFixed(2));
}