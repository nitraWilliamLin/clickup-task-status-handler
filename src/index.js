const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const githubToken = core.getInput("github_token");
const clickupApiKey = core.getInput("clickup_api_key");
const newStatus = core.getInput("new_clickup_status");

const prTitle = github.context.payload.pull_request.title;
console.log(`PR Title: ${prTitle}`);

const octokit = github.getOctokit(githubToken);
const prNumber = github.context.payload.pull_request.number;
const repo = github.context.repo;

// Updated regex to capture multiple ClickUp IDs inside square brackets
const matches = [...prTitle.matchAll(/\[([A-Za-z0-9]+)\]/g)];
if (matches.length === 0) {
  console.log("No ClickUp ID found in PR title. Skipping...");
  return;
}

// Extract all matched ClickUp IDs
const clickupIds = matches.map(match => match[1]);
console.log(`Extracted ClickUp IDs: ${clickupIds.join(", ")}`);

async function updateClickupTaskStatus() {
  for (const clickupId of clickupIds) {
    try {
      const response = await axios.put(
        `https://api.clickup.com/api/v2/task/${clickupId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: clickupApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Successfully updated ClickUp Task ${clickupId} to '${newStatus}'`);
      console.log(response.data);
    } catch (error) {
      core.setFailed(`Error updating ClickUp Task ${clickupId}: ${error.message}`);
    }
  }
}

async function updatePullRequestDescription() {
  try {
    // Get the current PR description
    const { data: pr } = await octokit.rest.pulls.get({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: prNumber,
    });

    const currentDescription = pr.body || "";

    let clickupSection = "### 📝 Linked ClickUp Tasks\n";

    for (const clickupId of clickupIds) {
      // Fetch ClickUp Task details
      const taskResponse = await axios.get(
        `https://api.clickup.com/api/v2/task/${clickupId}`,
        {
          headers: {
            Authorization: clickupApiKey,
          },
        }
      );

      const taskName = taskResponse.data.name;
      const clickupTaskUrl = `https://app.clickup.com/t/${clickupId}`;

      console.log(`ClickUp Task Name: ${taskName}`);
      console.log(`ClickUp Task URL: ${clickupTaskUrl}`);

      // Append each ClickUp Task to the section
      if (!currentDescription.includes(clickupTaskUrl)) {
        clickupSection += `- [${taskName}](${clickupTaskUrl})\n`;
      }
    }

    if (!clickupSection.includes("- [")) {
      console.log("All ClickUp tasks are already linked in PR description. Skipping update.");
      return;
    }

    // Append new content while preserving the existing description
    const updatedDescription = `${currentDescription}\n\n${clickupSection}`;

    // Update the PR description
    await octokit.rest.pulls.update({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: prNumber,
      body: updatedDescription,
    });

    console.log("Successfully updated PR description with ClickUp Task details.");
  } catch (error) {
    core.setFailed(`Error updating PR description: ${error.message}`);
  }
}

async function run() {
  await updateClickupTaskStatus();
  await updatePullRequestDescription();
}

run();
