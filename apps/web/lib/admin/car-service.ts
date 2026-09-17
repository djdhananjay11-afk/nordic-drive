import { Prisma } from "@nordicdrive/database";
import { prisma } from "@/lib/db";
import { carEditorSchema, type CarEditorInput, type CarSaveInput, type FeatureEditorInput, type MediaEditorInput } from "./car-schema";
import { carFields, seoFields, variantFields, specificationFields, chargingFields, type EditorField } from "./car-fields";

export class CarWriteError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const relations = {
  variants: { where: { deletedAt: null }, orderBy: { priceNok: "asc" as const }, include: { specification: true, evCharging: true, features: { include: { feature: true } }, media: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } } } },
  specifications: { where: { deletedAt: null, variantId: null }, take: 1 },
  features: { include: { feature: true } },
  media: { where: { deletedAt: null, variantId: null }, orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.CarInclude;

function selectFields(value: Record<string, unknown> | null | undefined, fields: EditorField[]) {
  return Object.fromEntries(fields.map(field => {
    const raw = value?.[field.key];
    return [field.key, field.type === "number" && raw != null ? Number(raw) : raw ?? (field.type === "checkbox" ? false : null)];
  }));
}
function editableFeatures(values: Array<{ feature: { name: string; slug: string; category: string; description: string | null; iconName: string | null; deletedAt: Date | null }; isHighlighted: boolean; sortOrder: number }>) {
  return values.filter(item => !item.feature.deletedAt).map(({ feature, isHighlighted, sortOrder }) => ({ name: feature.name, slug: feature.slug, category: feature.category, description: feature.description, iconName: feature.iconName, isHighlighted, sortOrder }));
}
function editableMedia(values: Array<Record<string, unknown>>) {
  return values.map(item => ({ id: item.id, type: item.type, url: item.url, title: item.title, altText: item.altText, width: item.width, height: item.height, blurDataUrl: item.blurDataUrl, sortOrder: item.sortOrder, isPrimary: item.isPrimary }));
}
export async function getCarEditor(id: string) {
  const car = await prisma.car.findFirst({ where: { id, deletedAt: null }, include: relations });
  if (!car) return null;
  return {
    id: car.id, updatedAt: car.updatedAt.toISOString(),
    createdAt: car.createdAt.toISOString(),
    car: carEditorSchema.parse({
      ...selectFields(car, [...carFields, ...seoFields]), brandId: car.brandId,
      specification: selectFields(car.specifications[0], specificationFields),
      features: editableFeatures(car.features), media: editableMedia(car.media),
      variants: car.variants.map(variant => ({
        ...selectFields(variant, variantFields), id: variant.id,
        specification: selectFields(variant.specification?.deletedAt ? null : variant.specification, specificationFields),
        evCharging: selectFields(variant.evCharging?.deletedAt ? null : variant.evCharging, chargingFields),
        features: editableFeatures(variant.features), media: editableMedia(variant.media),
      })),
    }),
  };
}
export async function getCarInventory(query = "", page = 1) {
  const where: Prisma.CarWhereInput = { deletedAt: null, ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { brand: { name: { contains: query, mode: "insensitive" } } }, { slug: { contains: query, mode: "insensitive" } }] } : {}) };
  const [total, cars] = await prisma.$transaction([
    prisma.car.count({ where }),
    prisma.car.findMany({ where, include: { brand: { select: { name: true } }, _count: { select: { variants: { where: { deletedAt: null } } } } }, orderBy: [{ updatedAt: "desc" }, { id: "asc" }], take: 25, skip: (page - 1) * 25 }),
  ]);
  return { total, cars, page, pages: Math.max(1, Math.ceil(total / 25)) };
}

async function syncFeatures(tx: Prisma.TransactionClient, parent: { carId: string } | { variantId: string }, items: FeatureEditorInput[]) {
  const rows: Array<{ featureId: string; isHighlighted: boolean; sortOrder: number }> = [];
  for (const item of items) {
    const { isHighlighted, sortOrder, ...definition } = item;
    const feature = await tx.feature.upsert({ where: { slug: definition.slug }, create: definition, update: definition });
    if (feature.deletedAt) throw new CarWriteError(409, "An archived feature uses this slug. Choose another slug.");
    rows.push({ featureId: feature.id, isHighlighted, sortOrder });
  }
  if ("carId" in parent) {
    await tx.carFeature.deleteMany({ where: parent });
    if (rows.length) await tx.carFeature.createMany({ data: rows.map(row => ({ ...parent, ...row })) });
  } else {
    await tx.variantFeature.deleteMany({ where: parent });
    if (rows.length) await tx.variantFeature.createMany({ data: rows.map(row => ({ ...parent, ...row })) });
  }
}
async function syncMedia(tx: Prisma.TransactionClient, carId: string, variantId: string | null, items: MediaEditorInput[]) {
  const current = await tx.media.findMany({ where: { carId, variantId, deletedAt: null }, select: { id: true } });
  const allowed = new Set(current.map(item => item.id));
  if (items.some(item => item.id && !allowed.has(item.id))) throw new CarWriteError(422, "Media does not belong to this car or variant.");
  await tx.media.updateMany({ where: { carId, variantId, deletedAt: null, id: { notIn: items.flatMap(item => item.id ? [item.id] : []) } }, data: { deletedAt: new Date() } });
  for (const { id, ...data } of items) {
    if (id) await tx.media.update({ where: { id }, data });
    else await tx.media.create({ data: { ...data, carId, variantId } });
  }
}
function specificationData(value: CarEditorInput["specification"]) {
  return { ...value, payload: value.payload == null ? Prisma.DbNull : value.payload as Prisma.InputJsonObject };
}

export async function saveCarInTransaction(tx: Prisma.TransactionClient, input: CarSaveInput, id?: string) {
  const data = carEditorSchema.parse(input.car);
  const { variants, specification, features, media, ...core } = data;
  const brand = await tx.brand.findFirst({ where: { id: core.brandId, deletedAt: null }, select: { id: true } });
  if (!brand) throw new CarWriteError(422, "Choose an existing, non-archived brand.");
  let carId: string;
  if (id) {
    if (!input.updatedAt) throw new CarWriteError(409, "Reload the car before editing.");
    const updated = await tx.car.updateMany({ where: { id, deletedAt: null, updatedAt: new Date(input.updatedAt) }, data: { ...core, updatedAt: new Date() } });
    if (updated.count !== 1) throw new CarWriteError(409, "This car changed or was archived. Reload before saving again.");
    carId = id;
  } else {
    if (input.updatedAt || variants.some(variant => variant.id) || [...media, ...variants.flatMap(variant => variant.media)].some(item => item.id)) throw new CarWriteError(422, "New cars cannot reuse existing record IDs.");
    carId = (await tx.car.create({ data: core })).id;
  }
  const current = await tx.variant.findMany({ where: { carId, deletedAt: null }, select: { id: true } });
  const allowed = new Set(current.map(variant => variant.id));
  if (variants.some(variant => variant.id && !allowed.has(variant.id))) throw new CarWriteError(422, "Variant does not belong to this car.");
  await tx.variant.updateMany({ where: { carId, deletedAt: null, id: { notIn: variants.flatMap(variant => variant.id ? [variant.id] : []) } }, data: { deletedAt: new Date() } });
  const currentSpec = await tx.specification.findFirst({ where: { carId, variantId: null, deletedAt: null }, select: { id: true } });
  if (currentSpec) await tx.specification.update({ where: { id: currentSpec.id }, data: specificationData(specification) });
  else await tx.specification.create({ data: { carId, ...specificationData(specification) } });
  await syncFeatures(tx, { carId }, features);
  await syncMedia(tx, carId, null, media);
  for (const variant of variants) {
    const { id: variantId, specification: variantSpec, evCharging, features: variantFeatures, media: variantMedia, ...details } = variant;
    const record = variantId ? await tx.variant.update({ where: { id: variantId }, data: details }) : await tx.variant.create({ data: { ...details, carId } });
    const spec = { ...specificationData(variantSpec), seats: details.seats, towingCapacityKg: details.towingCapacityKg, deletedAt: null };
    await tx.specification.upsert({ where: { variantId: record.id }, create: { ...spec, variantId: record.id }, update: spec });
    const charging = { ...evCharging, chargingAcKw: details.chargingAcKw, chargingDcKw: details.chargingDcKw, charging10To80Minutes: details.charging10To80Minutes, plugType: details.plugType, deletedAt: null };
    await tx.eVCharging.upsert({ where: { variantId: record.id }, create: { ...charging, variantId: record.id }, update: charging });
    await syncFeatures(tx, { variantId: record.id }, variantFeatures);
    await syncMedia(tx, carId, record.id, variantMedia);
  }
  return { id: carId, updatedAt: (await tx.car.findUniqueOrThrow({ where: { id: carId }, select: { updatedAt: true } })).updatedAt.toISOString() };
}
export async function saveAdminCar(input: CarSaveInput, id?: string) {
  return prisma.$transaction(tx => saveCarInTransaction(tx, input, id), { timeout: 60000 });
}
export async function archiveAdminCar(id: string, updatedAt: string) {
  const result = await prisma.car.updateMany({ where: { id, updatedAt: new Date(updatedAt), deletedAt: null }, data: { deletedAt: new Date() } });
  if (result.count !== 1) throw new CarWriteError(409, "This car changed. Reload before archiving.");
}
