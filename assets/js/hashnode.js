let postcards = [];
let postBtn = document.getElementById("blogBtn");
const featured = `<span class="badge featured-badge">
      <img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1638537289044/KeDRCKlY_.png" alt="Featured on Hashnode" class="img-fluid" title="Featured on Hashnode">
      Featured on Hashnode
    </span>
`

const fetchBlogs = async (after = "") => {
  postBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
  const query = `
    query PostsByPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        posts(first: $first, after: $after) {
          edges {
            node {
              title
              url
              publishedAt
              featured
              brief
              coverImage {
                url
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `;

  const variables = {
    host: "blog.akashrchandran.in",
    first: 3,
    after: after,
  };

  try {
    const response = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const { data } = await response.json();

    const posts = data?.publication?.posts?.edges || [];
    const pageInfo = data?.publication?.posts?.pageInfo;
    generateBlogs(posts);
    postBtn.innerHTML = "Load More";
    if (pageInfo.hasNextPage) {
      postBtn.onclick = () => {
        fetchBlogs(pageInfo.endCursor);
      };
    } else {
      postBtn.remove();
    }
  } catch (error) {
    postBtn.style = "background: red";
    postBtn.innerHTML = '<i class="fa fa-times"></i> Failed';
    console.error('Error fetching data:', error.message);
    throw error;
  }
};

const generateBlogs = (blogs) => {
  const cardContainer = document.getElementById('blogContainer');
  blogs.forEach((blog) => {
    const card = document.createElement('div');
    card.className = 'col-sm-4 mb-4';

    card.innerHTML = `
      <div class="card p-0">
        <a href="${blog.node.url}" target="_blank" rel="noopener noreferrer">
          <img class="card-img-top" src="${blog.node.coverImage.url}" alt="Card image cap" />
          ${blog.node.featured ? featured : ""}
          <div class="card-body">
            <h3 class="text-center">${blog.node.title}</h3>
            <span style="display: flex; justify-content: space-between;">
              <h6 class="text-start">${parseDate(blog.node.publishedAt)}</h6>
            </span>
            <p>${blog.node.brief}</p>
          </div>
        </a>
      </div>
    `;
    cardContainer.appendChild(card, cardContainer.firstChild);
  });
}

const parseDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const parsedData = new Date(date);
  return `${parsedData.getDate()} ${months[parsedData.getMonth()]} ${parsedData.getFullYear()}`
}

fetchBlogs();