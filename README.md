# clickup-task-status-handler

### Repository Description:
This is a GitHub Action project that helps you parse ClickUp Task IDs from a GitHub PR title, update the ClickUp task status to your desired state, and optionally add the ClickUp task link to the GitHub PR description.

### Inputs:
- `github_token` (required): The GitHub token used to authenticate the GitHub API.
- `clickup_api_key` (required): The ClickUp API key used to authenticate the ClickUp API.
- `new_clickup_status` (required): The new status you want to update the ClickUp task to.
- `should_update_pr_description` (required): A boolean value that determines whether to add the ClickUp task link to the GitHub PR description.

### Example usage:
```
jobs:
  update_clickup:
    runs-on: ubuntu-latest
    steps:
      - name: Use ClickUp Task Updater
        uses: nitraWilliamLin/clickup-task-status-handler@main  # 替換為你的 GitHub repo
        with:
          github_token: ${{ secrets.REPO_GITHUB_TOKEN }}
          clickup_api_key: ${{ secrets.CLICKUP_API_TOKEN }}
          new_clickup_status: "In Staging"
