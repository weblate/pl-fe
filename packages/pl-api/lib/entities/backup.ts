import * as v from 'valibot';

import { dateSchema, mimeSchema } from './utils';

/** @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromabackups} */
const backupSchema = v.object({
  id: z.coerce.string(),
  contentType: mimeSchema,
  file_size: v.fallback(v.number(), 0),
  inserted_at: dateSchema,
  processed: v.fallback(v.boolean(), false),
  url: v.fallback(v.string(), ''),
});

type Backup = v.InferOutput<typeof backupSchema>;

export { backupSchema, type Backup };
