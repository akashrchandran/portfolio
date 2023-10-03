const cards = document.querySelectorAll('#github-repo');
const avatar = document.getElementById('github_avatar');
const public_name = document.getElementById('github_name');
const about = document.getElementById('github_about');
const username = document.getElementById('github_username');
const followers = document.getElementById('github_followers');
const following = document.getElementById('github_following');
const public_repo = document.getElementById('github_repo');
const gists = document.getElementById('github_gist');

// Function to fetch data from the API or use cached data if available
async function getUserDetails() {
	const cachedData = localStorage.getItem('githubUserData');
	if (cachedData) {
		const { data, timestamp } = JSON.parse(cachedData);
		if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
			console.info("Cache Exists!");
			updateUI(data);
			return;
		}
	}

	// Fetch data from the API
	try {
		const response = await fetch('https://api.github.com/users/akashrchandran');
		if (response.ok) {
			const data = await response.json();

			// Cache the data along with the timestamp
			const timestamp = Date.now();
			localStorage.setItem('githubUserData', JSON.stringify({ data, timestamp }));

			updateUI(data);
		} else {
			console.error(`Failed to fetch data. Status code: ${response.status}`);
		}
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}

// Function to update the UI with user data
function updateUI(data) {
	avatar.src = data.avatar_url;
	public_name.innerText = data.name;
	about.innerText = data.bio;
	username.innerText = `@${data.login}`;
	followers.innerHTML = `<span class="supernumber">${data.followers} </span>Followers`;
	following.innerHTML = `<span class="supernumber">${data.following} </span>Following`;
	public_repo.innerHTML = `<span class="supernumber">${data.public_repos} </span>Repos`;
	gists.innerHTML = `<span class="supernumber">${data.public_gists} </span>Gists`;
}

// Fetch data when the page loads
getUserDetails();
