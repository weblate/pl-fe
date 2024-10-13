import * as v from 'valibot';

const adminDomainSchema = v.object({
  domain: v.fallback(v.string(), ''),
  id: z.coerce.string(),
  public: v.fallback(v.boolean(), false),
  resolves: v.fallback(v.boolean(), false),
  last_checked_at: z.string().datetime().catch(''),
});

type AdminDomain = v.InferOutput<typeof adminDomainSchema>

export { adminDomainSchema, type AdminDomain };
