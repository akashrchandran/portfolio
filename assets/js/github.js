const cards = document.querySelectorAll('#github-repo');
const avatar = document.getElementById('github_avatar');
const public_name = document.getElementById('github_name');
const about = document.getElementById('github_about');
const username = document.getElementById('github_username');
const followers = document.getElementById('github_followers');
const following = document.getElementById('github_following');
const public_repo = document.getElementById('github_repo');
const gists = document.getElementById('github_gist');

async function getUserDetails() {
	const response = await fetch('https://api.github.com/users/akashrchandran');
	const data = await response.json();
	return data;
}

getUserDetails().then(data => {
	avatar.src = data.avatar_url;
	public_name.innerText = data.name;
	about.innerText = data.bio;
	username.innerText = `@${data.login}`;
	followers.innerHTML = `<span class="supernumber">${data.followers} </span>Followers`;
	following.innerHTML = `<span class="supernumber">${data.following} </span>Following`;
	public_repo.innerHTML = `<span class="supernumber">${data.public_repos} </span>Repos`;
	gists.innerHTML = `<span class="supernumber">${data.public_gists} </span>Gists`;
});