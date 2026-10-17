import type { VehicleDef } from '../types'
import { poloGtTsi } from './polo-gt-tsi'

/**
 * Vehicle registry. Add new makes/models/variants here; each provides its own
 * renderer assets + geometry, and options declare `supportedVariants`.
 */
export const vehicles: VehicleDef[] = [poloGtTsi]

export const defaultVehicleId = poloGtTsi.id

export function getVehicle(id: string | null | undefined): VehicleDef {
  return vehicles.find((v) => v.id === id) ?? poloGtTsi
}

export const vehicleName = (v: VehicleDef) => `${v.make} ${v.model} ${v.variant}`
