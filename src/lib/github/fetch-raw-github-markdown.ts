interface ParsedRawGitHubUrl {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}

const RAW_GITHUB_HOSTNAME = 'raw.githubusercontent.com';

const parseRawGitHubUrl = (sourceRawUrl: string): ParsedRawGitHubUrl => {
  const url = new URL(sourceRawUrl);

  if (url.hostname !== RAW_GITHUB_HOSTNAME) {
    throw new Error(
      `Only raw.githubusercontent.com URLs are supported. Received: ${sourceRawUrl}`,
    );
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const [owner, repo, ref, ...pathSegments] = parts;

  if (!owner || !repo || !ref || pathSegments.length === 0) {
    throw new Error(`Invalid raw GitHub URL: ${sourceRawUrl}`);
  }

  return {
    owner,
    repo,
    ref,
    path: pathSegments.join('/'),
  };
};

export const fetchRawGitHubMarkdown = async (sourceRawUrl: string): Promise<string> => {
  const token = import.meta.env.GITHUB_TOKEN?.trim();
  const { owner, repo, ref, path } = parseRawGitHubUrl(sourceRawUrl);

  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `GitHub content fetch failed (${response.status} ${response.statusText}) for ${sourceRawUrl}${
        body ? `\n${body}` : ''
      }`,
    );
  }

  return response.text();
};
