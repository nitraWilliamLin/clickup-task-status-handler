const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  try {
    const githubToken = core.getInput("github_token");
    const clickupApiKey = core.getInput("clickup_api_key");
    const newStatus = core.getInput("new_clickup_status");

    const prTitle = github.context.payload.pull_request.title;
    console.log(`PR Title: ${prTitle}`);

    // Updated regex to capture any ClickUp ID inside square brackets
    const match = prTitle.match(/\[([A-Za-z0-9]+)\]/);
    if (!match) {
      console.log("No ClickUp ID found in PR title. Skipping...");
      return;
    }

    // Extract matched ClickUp ID
    const clickupId = match[1];
    console.log(`Extracted ClickUp ID: ${clickupId}`);

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
    core.setFailed(`Error updating ClickUp Task: ${error.message}`);
  }
}

run();
