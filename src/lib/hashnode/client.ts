import { GraphQLClient, gql } from 'graphql-request';
import {
  AllPostsDataSchema,
  PostDataSchema,
  type HashnodePost,
} from './schema';

const HASHNODE_GQL_ENDPOINT = 'https://gql.hashnode.com';
const DEFAULT_POST_LIMIT = 20;

const ALL_POST_FIELDS = `
  id
  title
  subtitle
  brief
  slug
  featured
  featuredAt
  publishedAt
  readTimeInMinutes
  tags {
    name
    slug
  }
  coverImage {
    url
  }
  author {
    name
    profilePicture
  }
`;

const POST_DETAIL_FIELDS = `
  id
  title
  subtitle
  brief
  slug
  featured
  featuredAt
  publishedAt
  readTimeInMinutes
  tags {
    name
    slug
  }
  coverImage {
    url
  }
  author {
    name
    profilePicture
  }
  content {
    html
  }
`;

const getPublicationHost = () => {
  const publicationHost = import.meta.env.HASHNODE_PUBLICATION_HOST;
  return publicationHost?.trim();
};

const getClient = () => new GraphQLClient(HASHNODE_GQL_ENDPOINT);

export const isHashnodeConfigured = () => Boolean(getPublicationHost());

export const sortHashnodePosts = (posts: HashnodePost[]) => {
  return [...posts].sort((a, b) => {
    const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    if (featuredDelta !== 0) {
      return featuredDelta;
    }

    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });
};

export const getAllPosts = async (limit = DEFAULT_POST_LIMIT): Promise<HashnodePost[]> => {
  const host = getPublicationHost();
  if (!host) {
    return [];
  }

  const client = getClient();
  const result = await client.request(
    gql`
      query allPosts($host: String!, $first: Int!) {
        publication(host: $host) {
          id
          title
          posts(first: $first) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                ${ALL_POST_FIELDS}
              }
            }
          }
        }
      }
    `,
    { host, first: limit },
  );

  const parsed = AllPostsDataSchema.parse(result);
  return parsed.publication?.posts.edges.map((edge) => edge.node) ?? [];
};

export const getSortedPosts = async (limit = DEFAULT_POST_LIMIT): Promise<HashnodePost[]> => {
  const posts = await getAllPosts(limit);
  return sortHashnodePosts(posts);
};

export const getPost = async (slug: string): Promise<HashnodePost | null> => {
  const host = getPublicationHost();
  if (!host) {
    return null;
  }

  const client = getClient();
  const result = await client.request(
    gql`
      query postDetails($host: String!, $slug: String!) {
        publication(host: $host) {
          id
          title
          post(slug: $slug) {
            ${POST_DETAIL_FIELDS}
          }
        }
      }
    `,
    { host, slug },
  );

  const parsed = PostDataSchema.parse(result);
  return parsed.publication?.post ?? null;
};
