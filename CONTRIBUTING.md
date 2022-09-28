## How to **contribute**?

If you're not comfortable with the command line, [here are tutorials using GUI tools.](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/overview/getting-started-with-github-desktop). If you don't have git on your machine, [install it](https://help.github.com/articles/set-up-git/).

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/fork.png" alt="fork this repository" />

**1.** Fork [this](https://github.com/akashrchandran/portfolio) repository.

**2.** Clone your forked copy of the project.

```
git clone https://github.com/<your_name>/portfolio.git
```

**3.** Navigate to the project directory :file_folder: .

```
cd portfolio
```

**4.** Add a reference(remote) to the original repository.

```
git remote add upstream https://github.com/akashrchandran/portfolio.git
```

**5.** Check the remotes for this repository.

```
git remote -v
```

**6.** Always take a pull from the upstream repository to your main branch to keep it at par with the main project(updated repository).

```
git pull upstream main
```

**7.** Create a new branch.

```
git checkout -b <your_branch_name>
```

**8.** Perform your desired changes to the code base on that branch.

**9.** Track your changes :heavy_check_mark: .

```
git add .
```

**10.** Commit your changes.

```
git commit -m "Relevant message"
```

**11.** Push the committed changes in your feature branch to your remote repo.

```
git push -u origin <your_branch_name>
```


**12.** To create a pull request, click on `compare and pull requests. Please ensure you compare your feature branch to the desired branch of the repository you are supposed to make a PR to.

**13.** Add an appropriate title and description to your pull request explaining your changes and efforts.

**14.** Click on `Create Pull Request`.

**15** Voila! You have made a PR to portfolio website. Sit back patiently and relax while your PR is reviewed.
