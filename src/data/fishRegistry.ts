import knowledge from "./verifiedFishKnowledge.json";
import type { TankSpecies } from "../types/aquarium";

export const speciesCatalog = knowledge.species;
export type FishSpecies = (typeof knowledge.species)[number];

export function cleanSpecies(input: unknown): TankSpecies[] {
  if (!Array.isArray(input)) return [];
  const result: TankSpecies[] = [];
  for (const record of input.slice(0, 50)) {
    if (!record || typeof record !== "object") continue;
    const x = record as Record<string, unknown>;
    const fish = speciesCatalog.find((f) => f.id === x.id);
    if (!fish) continue;
    const count = Number(x.count);
    if (!Number.isInteger(count) || count < 1 || count > 100) continue;
    const previous = result.find((item) => item.id === fish.id);
    if (previous) previous.count = count;
    else result.push({id: fish.id, name: fish.name, count});
  }
  return result;
}

export function parseFishList(text: string): TankSpecies[] {
  if (!text.trim()) return [];
  const parts = text.split(/[,，\n]+/).map((x)=>x.trim()).filter(Boolean);
  const parsed: TankSpecies[] = [];
  for (const part of parts) {
    const m = part.match(/^(.+?)\s*(\d+)\s*마리$/);
    if (!m) continue;
    const candidate = m[1].trim();
    const fish = speciesCatalog.find((f) => [f.name, ...f.aliases].some((name)=>name === candidate));
    if (!fish) continue;
    const count = Number(m[2]);
    if (count > 0 && count <= 100) {
      const previous=parsed.find((p)=>p.id===fish.id);
      if (previous) previous.count=count;
      else parsed.push({id:fish.id,name:fish.name,count});
    }
  }
  return parsed;
}

export function formatFishList(list: TankSpecies[]): string {
  return list.map((item)=>`${item.name} ${item.count}마리`).join(", ");
}

export function mergeFishList(legacy: string, list: TankSpecies[]): string {
  const pieces = legacy.split(/[,，\n]+/).map((x)=>x.trim()).filter(Boolean);
  const unmanaged = pieces.filter((x) => {
    const parsed = parseFishList(x);
    return parsed.length === 0;
  });
  return [...unmanaged, ...list.map((f)=>`${f.name} ${f.count}마리`)].join(", ");
}
