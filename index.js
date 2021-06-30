const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const failureEmojis = [
  "rocket_down",
  "ripperonis",
  "roskis",
  "fine",
  "lgtm",
  "tori-peruttu",
  "työmaa",
  "eiku",
  "eitoimi",
  "tunkki",
];
const successEmojis = [
  "catjam",
  "dogjam",
  "rocket",
  "stonks",
  "superformula",
  "minttujamspiral",
  "mintu",
  "bonezone",
  "kurkkumopo",
  "pp_dance",
  "pog",
  "feels_good_man",
];

const run = async () => {
  try {
    const webhookUrl = core.getInput("webhook-url");
    const messageType = core.getInput("message-type");

    const repoName = github.context.payload.repository.name;
    const repoUrl = github.context.payload.repository.url;
    const branchName = github.context.payload.ref.split("/").pop();
    const commit = github.context.payload.head_commit;
    const committer = commit.committer.username;

    let message = {
      blocks: [],
    };

    if (messageType === "deployment") {
      const emoji =
        successEmojis[Math.floor(Math.random() * successEmojis.length)];
      message.blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `${repoName} ${branchName} started deployment :${emoji}:`,
          emoji: true,
        },
      });
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${commit.url}|Commit> by *${committer}*: ${commit.message}`,
        },
        accessory: {
          type: "image",
          image_url: `https://cataas.com/cat/gif?_=${github.context.runId}`,
          alt_text: "cute cat",
        },
      });
    } else if (messageType === "test-failure") {
      const emoji =
        failureEmojis[Math.floor(Math.random() * failureEmojis.length)];

      message.blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `Uh oh, tests failed on ${repoName} ${branchName} :${emoji}:`,
          emoji: true,
        },
      });
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${repoUrl}/runs/${github.context.runId}|Workflow run> by *${committer}* failed`,
        },
        accessory: {
          type: "image",
          image_url: `https://cataas.com/cat/fail?_=${github.context.runId}`,
          alt_text: "cat failing",
        },
      });
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${commit.url}|Commit>: ${commit.message}`,
        },
      });
    } else {
      core.setFailed(`${messageType} not accepted message type`);
      exit(1);
    }

    await axios.post(webhookUrl, JSON.stringify(message));
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
