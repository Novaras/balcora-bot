export type SubsType = `System` | `Weapon`;

type TerseSubs = {
	type: SubsType,
	build_cost: number,
	build_time: number,
	regen_time: number,
	linked_weapon: string
};
export default TerseSubs;