"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Archive, Plus, Save, Trash2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carEditorSchema, type CarEditorInput } from "@/lib/admin/car-schema";
import { carFields, seoFields, specificationFields, variantFields, chargingFields, featureFields, mediaFields, type EditorField } from "@/lib/admin/car-fields";

type Values = Record<string, unknown>;
type Row = { key: string; value: Values };
type Issues = Record<string, string>;
type Brand = { id: string; name: string };
type RecordData = { id: string; updatedAt: string; createdAt: string; car: CarEditorInput };
const inputClass = "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-offset-2 focus:outline-sky-700 disabled:bg-slate-100";
const createRows = (values: Values[] = []): Row[] => values.map((value, index) => ({ key: typeof value.id === "string" ? value.id : `saved-${index}`, value }));

function Fields({ fields, initial = {}, prefix, issues }: { fields: EditorField[]; initial?: Values; prefix: string; issues: Issues }) {
  return <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">{fields.map(field => {
    const name = `${prefix}${field.key}`;
    const value = initial[field.key];
    const error = issues[name];
    const props = { id: name, name, "aria-invalid": Boolean(error), "aria-describedby": error ? `${name}-error` : undefined };
    return <div key={field.key} className={field.type === "textarea" || field.type === "json" ? "min-w-0 sm:col-span-2 xl:col-span-3" : "min-w-0"}>
      {field.type === "checkbox" ? <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor={name}><input {...props} type="checkbox" defaultChecked={value === true} className="size-4 accent-sky-800" />{field.label}</label> : <>
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}{field.required ? " *" : ""}</label>
        {field.options ? <select {...props} defaultValue={String(value ?? field.options[0])} className={inputClass}>{field.options.map(option => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>
        : field.type === "textarea" || field.type === "json" ? <textarea {...props} rows={field.type === "json" ? 5 : 3} defaultValue={field.type === "json" ? (value ? JSON.stringify(value, null, 2) : "") : String(value ?? "")} className={`${inputClass} ${field.type === "json" ? "font-mono" : ""}`} />
        : <input {...props} type={field.type === "number" ? "number" : "text"} inputMode={field.type === "number" ? "decimal" : undefined} step={field.step ?? "1"} defaultValue={String(value ?? "")} required={field.required} className={inputClass} />}
      </>}
      {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>;
  })}</div>;
}
function Collection({ title, prefix, initial, fields, issues, dirty }: { title: string; prefix: string; initial?: Values[]; fields: EditorField[]; issues: Issues; dirty: () => void }) {
  const [rows, setRows] = useState(() => createRows(initial));
  return <div className="mt-6 min-w-0">
    <div className="flex items-center justify-between gap-3"><h3 className="text-base font-semibold">{title}</h3><Button type="button" variant="outline" size="sm" onClick={() => { dirty(); setRows([...rows, { key: crypto.randomUUID(), value: { sortOrder: rows.length } }]); }}><Plus className="mr-2 size-4" />Add</Button></div>
    <input type="hidden" name={`${prefix}count`} value={rows.length} />
    {rows.map((row, index) => <fieldset className="mt-4 min-w-0 border-t border-slate-200 pt-4" key={row.key}>
      <legend className="px-1 text-sm text-slate-500">{title} {index + 1}</legend>
      {typeof row.value.id === "string" && <input type="hidden" name={`${prefix}${index}.id`} value={row.value.id} />}
      <div className="mb-3 flex justify-end"><Button type="button" variant="ghost" size="sm" aria-label={`Remove ${title.toLowerCase()} ${index + 1}`} title="Remove item" onClick={() => { dirty(); setRows(rows.filter(item => item.key !== row.key)); }}><Trash2 className="size-4" /></Button></div>
      <Fields fields={fields} initial={row.value} prefix={`${prefix}${index}.`} issues={issues} />
    </fieldset>)}
    {rows.length === 0 && <p className="mt-3 text-sm text-slate-500">No {title.toLowerCase()} added.</p>}
  </div>;
}
function readFields(form: FormData, fields: EditorField[], prefix: string): Values {
  return Object.fromEntries(fields.map(field => {
    const raw = form.get(`${prefix}${field.key}`);
    const text = typeof raw === "string" ? raw.trim() : "";
    if (field.type === "checkbox") return [field.key, raw === "on"];
    if (field.type === "number") return [field.key, text === "" ? null : Number(text)];
    if (field.type === "json") {
      try { return [field.key, text ? JSON.parse(text) as unknown : null]; }
      catch { throw new Error(`${field.label} must contain valid JSON.`); }
    }
    return [field.key, text || (field.required ? "" : null)];
  }));
}
function readCollection(form: FormData, fields: EditorField[], prefix: string) {
  return Array.from({ length: Number(form.get(`${prefix}count`) ?? 0) }, (_, index) => ({
    ...readFields(form, fields, `${prefix}${index}.`), ...(form.get(`${prefix}${index}.id`) ? { id: form.get(`${prefix}${index}.id`) } : {}),
  }));
}

export function CarEditor({ record, brands: initialBrands, saved = false }: { record?: RecordData; brands: Brand[]; saved?: boolean }) {
  const [brands, setBrands] = useState(initialBrands);
  const [brandId, setBrandId] = useState(record?.car.brandId ?? "");
  const [variants, setVariants] = useState<Row[]>(() => createRows(record?.car.variants));
  const [issues, setIssues] = useState<Issues>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [brandPending, setBrandPending] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const dirty = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const markDirty = () => { dirty.current = true; };
  const car = record?.car;
  async function addBrand() {
    setBrandPending(true); setError("");
    try {
      const response = await fetch("/api/admin/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: brandName, slug: brandSlug }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not create brand.");
      setBrands([...brands, { id: body.data.id, name: body.data.name }].sort((a, b) => a.name.localeCompare(b.name)));
      setBrandId(body.data.id); setBrandName(""); setBrandSlug(""); markDirty();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create brand."); }
    finally { setBrandPending(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIssues({});
    const form = new FormData(event.currentTarget);
    try {
      const input = {
        ...readFields(form, [...carFields, ...seoFields], "car."), brandId,
        specification: readFields(form, specificationFields, "car.specification."),
        features: readCollection(form, featureFields, "car.features."), media: readCollection(form, mediaFields, "car.media."),
        variants: variants.map((variant, index) => {
          const prefix = `car.variants.${index}.`;
          return { ...readFields(form, variantFields, prefix), ...(variant.value.id ? { id: variant.value.id } : {}),
            specification: readFields(form, specificationFields.filter(field => !["seats", "towingCapacityKg"].includes(field.key)), `${prefix}specification.`),
            evCharging: readFields(form, chargingFields, `${prefix}evCharging.`), features: readCollection(form, featureFields, `${prefix}features.`), media: readCollection(form, mediaFields, `${prefix}media.`),
          };
        }),
      };
      const validation = carEditorSchema.safeParse(input);
      if (!validation.success) {
        setIssues(Object.fromEntries(validation.error.issues.map(issue => [`car.${issue.path.join(".")}`, issue.message])));
        throw new Error(validation.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
      }
      setPending(true);
      const response = await fetch(record ? `/api/admin/cars/${record.id}` : "/api/admin/cars", { method: record ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ car: validation.data, ...(record ? { updatedAt: record.updatedAt } : {}) }) });
      const body = await response.json();
      if (!response.ok) {
        if (body.error?.issues) setIssues(Object.fromEntries(body.error.issues.map((issue: { path: string; message: string }) => [issue.path, issue.message])));
        throw new Error(body.error?.message ?? "Could not save car.");
      }
      dirty.current = false;
      window.location.assign(`/admin/cars/${body.data.id}?saved=1`);
    } catch (caught) {
      setPending(false); setError(caught instanceof Error ? caught.message : "Could not save car.");
      requestAnimationFrame(() => summary.current?.focus());
    }
  }
  async function archive() {
    if (!record || !window.confirm(`Archive ${record.car.name}? It will remain in the database but leave the active inventory.`)) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/admin/cars/${record.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updatedAt: record.updatedAt }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not archive car.");
      dirty.current = false; window.location.assign("/admin/cars");
    } catch (caught) { setPending(false); setError(caught instanceof Error ? caught.message : "Could not archive car."); }
  }
  return <div className="mx-auto min-w-0 max-w-6xl">
    <Link href="/admin/cars" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-sky-800" onClick={event => { if (dirty.current && !window.confirm("Leave without saving?")) event.preventDefault(); }}><ArrowLeft className="size-4" />Cars</Link>
    <h1 className="text-3xl font-semibold">{record ? `Edit ${car?.name}` : "Add car"}</h1>
    {record && <p className="mt-2 break-all text-xs text-slate-500">ID: {record.id} · Updated {new Date(record.updatedAt).toLocaleString()}</p>}
    {saved && <p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Car saved to the database.</p>}
    <div ref={summary} tabIndex={-1} className="outline-none">{error && <p role="alert" className="mt-4 whitespace-pre-line rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}</div>
    <form onSubmit={save} onChange={markDirty} className="mt-6" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0">
        <section className="border-t border-slate-200 py-6">
          <h2 className="mb-5 text-xl font-semibold">Car details</h2>
          <label htmlFor="car-brand" className="mb-2 block text-sm font-medium">Brand *</label>
          <select id="car-brand" required value={brandId} onChange={event => setBrandId(event.target.value)} className={`${inputClass} mb-4 max-w-md`}><option value="">Select a brand</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>
          <details className="mb-6 text-sm"><summary className="cursor-pointer py-2 font-medium text-sky-800">Add a brand</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label>Brand name<input aria-label="New brand name" value={brandName} onChange={event => setBrandName(event.target.value)} className={inputClass} /></label>
              <label>Brand slug<input aria-label="New brand slug" value={brandSlug} onChange={event => setBrandSlug(event.target.value)} className={inputClass} /></label>
              <Button type="button" variant="outline" className="self-end" onClick={addBrand} disabled={brandPending || !brandName.trim() || !brandSlug.trim()}><Plus className="mr-2 size-4" />{brandPending ? "Adding..." : "Add brand"}</Button>
            </div>
          </details>
          <Fields fields={carFields} initial={car} prefix="car." issues={issues} />
        </section>
        <details open className="border-t border-slate-200 py-6"><summary className="cursor-pointer text-xl font-semibold">Dimensions and warranty</summary><div className="mt-5"><Fields fields={specificationFields} initial={car?.specification} prefix="car.specification." issues={issues} /></div></details>
        <section className="border-t border-slate-200 py-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Variants ({variants.length})</h2><Button type="button" variant="outline" onClick={() => { markDirty(); setVariants([...variants, { key: crypto.randomUUID(), value: {} }]); }}><Plus className="mr-2 size-4" />Add variant</Button></div>
          {variants.map((variant, index) => {
            const prefix = `car.variants.${index}.`;
            return <details open className="mt-6 min-w-0 border-t border-slate-200 pt-5" key={variant.key}>
              <summary className="cursor-pointer font-semibold">Variant {index + 1}{typeof variant.value.name === "string" ? `: ${variant.value.name}` : ""}</summary>
              <div className="my-4 flex justify-end"><Button type="button" variant="ghost" onClick={() => { if (window.confirm("Remove this variant from the active car record when you save?")) { markDirty(); setVariants(variants.filter(item => item.key !== variant.key)); } }}><Trash2 className="mr-2 size-4" />Remove variant</Button></div>
              <Fields fields={variantFields} initial={variant.value} prefix={prefix} issues={issues} />
              <h3 className="mb-4 mt-6 font-semibold">Variant specifications</h3><Fields fields={specificationFields.filter(field => !["seats", "towingCapacityKg"].includes(field.key))} initial={variant.value.specification as Values | undefined} prefix={`${prefix}specification.`} issues={issues} />
              <h3 className="mb-4 mt-6 font-semibold">EV charging</h3><Fields fields={chargingFields} initial={variant.value.evCharging as Values | undefined} prefix={`${prefix}evCharging.`} issues={issues} />
              <Collection title="Features" fields={featureFields} prefix={`${prefix}features.`} initial={variant.value.features as Values[] | undefined} issues={issues} dirty={markDirty} />
              <Collection title="Media" fields={mediaFields} prefix={`${prefix}media.`} initial={variant.value.media as Values[] | undefined} issues={issues} dirty={markDirty} />
            </details>;
          })}
        </section>
        <section className="border-t border-slate-200 py-6"><h2 className="text-xl font-semibold">Car features and media</h2>
          <Collection title="Features" fields={featureFields} prefix="car.features." initial={car?.features} issues={issues} dirty={markDirty} />
          <Collection title="Media" fields={mediaFields} prefix="car.media." initial={car?.media} issues={issues} dirty={markDirty} />
        </section>
        <section className="border-t border-slate-200 py-6"><h2 className="mb-5 text-xl font-semibold">SEO</h2><Fields fields={seoFields} initial={car} prefix="car." issues={issues} /></section>
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
          {record ? <Button type="button" variant="outline" onClick={archive} className="text-red-700"><Archive className="mr-2 size-4" />Archive car</Button> : <span />}
          <Button type="submit" className="bg-slate-950 text-white" disabled={pending || brandPending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}{pending ? "Saving..." : "Save car"}</Button>
        </div>
      </fieldset>
    </form>
  </div>;
}
