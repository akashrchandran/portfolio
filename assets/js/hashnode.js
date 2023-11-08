const fetchBlogs = async () => {
    const query = `
    query GetUserArticles($page: Int!, $first: Int!) {
      user(username: "akashrchandran") {
        publication {
          posts(page: $page, first: $first) {
            slug
            title
            brief
            coverImage
            dateUpdated
            dateAdded
          }
        }
      }
    }
    `;

    // Define query variables
    const variables = {
        page: 1,
        first: 3
    };

    // Fetch data from GraphQL API endpoint
    const response = await fetch('https://api.hashnode.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    // Parse response data
    const data = await response.json();

    // Log fetched blogs
    console.log(data.data.user.publications.posts.edges);
}

fetchBlogs();