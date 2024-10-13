import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { filteredArray } from './utils';

const pollOptionSchema = v.object({
  title: v.fallback(v.string(), ''),
  votes_count: v.fallback(v.number(), 0),

  title_map: z.record(v.string()).nullable().catch(null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Poll/} */
const pollSchema = v.object({
  emojis: filteredArray(customEmojiSchema),
  expired: v.fallback(v.boolean(), false),
  expires_at: z.string().datetime().nullable().catch(null),
  id: v.string(),
  multiple: v.fallback(v.boolean(), false),
  options: z.array(pollOptionSchema).min(2),
  voters_count: v.fallback(v.number(), 0),
  votes_count: v.fallback(v.number(), 0),
  own_votes: z.array(z.number()).nonempty().nullable().catch(null),
  voted: v.fallback(v.boolean(), false),

  non_anonymous: v.fallback(v.boolean(), false),
});

type Poll = v.InferOutput<typeof pollSchema>;
type PollOption = Poll['options'][number];

export { pollSchema, type Poll, type PollOption };
