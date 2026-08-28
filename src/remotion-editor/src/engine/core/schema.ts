/**
 * Feature #10 — Schema validation for composition props.
 *
 * We ship a tiny Zod-shaped schema builder so consumers get validation without
 * pulling Zod in as a hard dependency; the `PropSchema<T>` interface used by
 * `<Composition schema={...}/>` accepts real Zod schemas one-for-one.
 */

export interface Issue { path: (string | number)[]; message: string }

export class SchemaError extends Error {
  constructor(public issues: Issue[]) {
    super(issues.map((i) => `[${i.path.join('.')}] ${i.message}`).join('\n'));
    this.name = 'SchemaError';
  }
}

export interface MiniSchema<T> {
  parse(v: unknown): T;
  safeParse(v: unknown): { success: true; data: T } | { success: false; error: SchemaError };
  optional(): MiniSchema<T | undefined>;
  default(fallback: T): MiniSchema<T>;
  describe(text: string): MiniSchema<T>;
}

function make<T>(fn: (v: unknown, path: (string | number)[]) => T): MiniSchema<T> {
  const self: MiniSchema<T> = {
    parse: (v) => fn(v, []),
    safeParse: (v) => {
      try { return { success: true, data: fn(v, []) }; }
      catch (err) {
        if (err instanceof SchemaError) return { success: false, error: err };
        return { success: false, error: new SchemaError([{ path: [], message: (err as Error).message }]) };
      }
    },
    optional: () => make<T | undefined>((v, p) => (v === undefined ? undefined : fn(v, p))),
    default: (fallback) => make<T>((v, p) => (v === undefined ? fallback : fn(v, p))),
    describe: () => self,
  };
  return self;
}

export const z = {
  string: () => make<string>((v, p) => {
    if (typeof v !== 'string') throw new SchemaError([{ path: p, message: 'expected string' }]);
    return v;
  }),
  number: () => make<number>((v, p) => {
    if (typeof v !== 'number' || Number.isNaN(v)) throw new SchemaError([{ path: p, message: 'expected number' }]);
    return v;
  }),
  boolean: () => make<boolean>((v, p) => {
    if (typeof v !== 'boolean') throw new SchemaError([{ path: p, message: 'expected boolean' }]);
    return v;
  }),
  literal: <L extends string | number | boolean>(lit: L) => make<L>((v, p) => {
    if (v !== lit) throw new SchemaError([{ path: p, message: `expected literal ${JSON.stringify(lit)}` }]);
    return v as L;
  }),
  enum: <L extends string>(values: readonly L[]) => make<L>((v, p) => {
    if (!values.includes(v as L)) throw new SchemaError([{ path: p, message: `expected one of ${values.join(', ')}` }]);
    return v as L;
  }),
  array: <T>(inner: MiniSchema<T>) => make<T[]>((v, p) => {
    if (!Array.isArray(v)) throw new SchemaError([{ path: p, message: 'expected array' }]);
    return v.map((item, i) => (inner as MiniSchema<T> & { _parse?: unknown }).parse(item));
  }),
  object: <S extends Record<string, MiniSchema<unknown>>>(shape: S) => {
    type Out = { [K in keyof S]: S[K] extends MiniSchema<infer U> ? U : never };
    return make<Out>((v, p) => {
      if (!v || typeof v !== 'object') throw new SchemaError([{ path: p, message: 'expected object' }]);
      const rec = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      const issues: Issue[] = [];
      for (const [k, s] of Object.entries(shape)) {
        try { out[k] = s.parse(rec[k]); }
        catch (err) {
          if (err instanceof SchemaError) issues.push(...err.issues.map((i) => ({ ...i, path: [k, ...i.path] })));
          else issues.push({ path: [k], message: (err as Error).message });
        }
      }
      if (issues.length) throw new SchemaError(issues);
      return out as Out;
    });
  },
};
