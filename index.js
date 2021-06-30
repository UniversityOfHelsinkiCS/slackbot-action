const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const failureEmojis = [
  "3am",
  "alienpls",
  "atk",
  "eiku",
  "eitoimi",
  "ennauti",
  "facepalm-picard",
  "feels_bad_man",
  "fffuuuu",
  "fine",
  "intense-brows",
  "jaahas",
  "jaahas-mayhem",
  "jumalauta",
  "jäsä",
  "kuumotus",
  "lgtm",
  "mad-mutka-shake",
  "minttuglitch",
  "minttujamw",
  "monkagiga",
  "notlikebuzz",
  "pahamintu",
  "pepe_hands",
  "pepejam",
  "ripperonis",
  "rocket_down",
  "roskis",
  "skeletonpls",
  "thonking-extreme",
  "thonking-mega-extreme",
  "thunking",
  "tori-peruttu",
  "tunkki",
  "työmaa",
  "wat",
];

const successEmojis = [
  "15keisaria",
  "acual_doubt",
  "acual_parrot",
  "alienpls",
  "aw_yeah",
  "bonezone",
  "catjam",
  "dogjam",
  "feels_good_man",
  "jesari",
  "konvehti",
  "kurkkumopo",
  "minttujamspiral",
  "mintu",
  "nautin",
  "ok_fidget",
  "pepejam",
  "pog",
  "postimerkki",
  "pp_dance",
  "rise",
  "rocket",
  "smoothminttujam",
  "stonks",
  "superformula",
  "toimii",
  "tonkka",
  "torille",
];

const run = async () => {
  try {
    const webhookUrl = core.getInput("webhook-url");
    const messageType = core.getInput("message-type");

    const repoName = github.context.payload.repository.name;
    const repoUrl = github.context.payload.repository.url;

    // Check if release or branch
    const ref = github.context.payload.ref;
    const branchName = ref ? ref.split("/").pop() : null;
    const deploymentSource = github.context.payload.release
      ? `release ${github.context.payload.release.tag_name}`
      : `${branchName}`;

    const commit = github.context.payload.head_commit;
    const committer = commit.committer.username;

    let message = {
      blocks: [],
    };

    if (messageType === "deployment") {
      const emoji =
        successEmojis[Math.floor(Math.random() * successEmojis.length)];
      const softaUrl = core.getInput("softa-url");
      const deploymentTarget = core.getInput("deployment-target");

      if (!softaUrl) {
        core.setFailed("softa-url must be included when using deployment");
        exit(1);
      }
      const deploymentText = deploymentTarget
        ? `${repoName} ${deploymentSource} started deployment to ${deploymentTarget} :${emoji}:`
        : `${repoName} ${deploymentSource} started deployment :${emoji}:`;

      message.blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `${deploymentText}`,
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
      let repoOpenText = `Open ${repoName}`;
      if (repoName === "suotar") {
        // add emoji for suotar
        repoOpenText.concat(" :suotar:");
      }
      message.blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: repoOpenText,
              emoji: true,
            },
            url: softaUrl,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Github",
            },
            url: repoUrl,
          },
        ],
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
          text: `<${repoUrl}/runs/${github.context.runId}|Workflow run> by *${committer}* failed \n<${commit.url}|Commit>: ${commit.message}`,
        },
        accessory: {
          type: "image",
          image_url: `https://cataas.com/cat/fail?_=${github.context.runId}`,
          alt_text: "cat failing",
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
