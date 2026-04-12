import { z } from 'astro/zod';

const AuthorSchema = z.object({
  name: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
});

const TagSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

const CoverImageSchema = z
  .object({
    url: z.string(),
  })
  .nullable()
  .optional();

const ContentSchema = z
  .object({
    html: z.string(),
  })
  .nullable()
  .optional();

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  brief: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  featuredAt: z.string().nullable().optional(),
  publishedAt: z.string(),
  readTimeInMinutes: z.number(),
  tags: z.array(TagSchema).default([]),
  coverImage: CoverImageSchema,
  author: AuthorSchema.optional(),
  content: ContentSchema,
});

export const AllPostsDataSchema = z.object({
  publication: z
    .object({
      id: z.string().optional(),
      title: z.string().optional(),
      posts: z.object({
        pageInfo: z
          .object({
            hasNextPage: z.boolean(),
            endCursor: z.string().nullable().optional(),
          })
          .optional(),
        edges: z.array(
          z.object({
            node: PostSchema,
          }),
        ),
      }),
    })
    .nullable(),
});

export const PostDataSchema = z.object({
  publication: z
    .object({
      id: z.string().optional(),
      title: z.string().optional(),
      post: PostSchema.nullable(),
    })
    .nullable(),
});

export type HashnodePost = z.infer<typeof PostSchema>;
export type AllPostsData = z.infer<typeof AllPostsDataSchema>;
export type PostData = z.infer<typeof PostDataSchema>;
