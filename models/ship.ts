export type ShipClass = 
	`Fighter` |
	`Corvette` |
	`Frigate` |
	`Capital` |
	`Flagship` |
	`Platform` |
	`Utility` |
	`Resource` |
	`Noncombat` |
	`SubsystemModule` |
	`SubsystemSensors` |
	`Munition` |
	`Megalith`;

export type ArmourType =
	`Unarmoured` |
	`Unarmoured_hw1` |
	`LightArmour` |
	`LightArmour_hw1` |
	`MediumArmour` |
	`HeavyArmour` |
	`SubsystemArmour` |
	`TurretArmour` |
	`ResArmour` |
	`MoverArmour` |
	`PlanetKillerArmour` |
	`MineArmour` |
	`ChunkArmour` |
	`ResourceArmour` |
	`GravityWellArmour` |
	`SwarmerArmor` | // these new types drop the UK spelling ('armour' -> 'armor')
	`SpaceMineArmor` |
	`TorpedoArmor` |
	`HeavyMissileArmor` |
	`SmallMissileArmor` |
	`ProbeArmor`;

type TerseShip = {
	name: string,
	ship_class: ShipClass,
	hitpoints: number,
	build_cost: number,
	build_time: number,
	armour_type: ArmourType,
	max_forward_speed: number,
	max_strafe_speed: number
};
export default TerseShip;
