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

const getDeploymentDetails = (isRelease) => {
  if (isRelease) {
    const release = github.context.payload.release;
    return {
      deploymentSource: `release ${release.tag_name}`,
      infoText: `<${release.html_url}|Release> by *${release.author.login}*: ${release.body}`,
    };
  } else {
    const branchName = github.context.payload.ref.split("/").pop();
    const commit = github.context.payload.head_commit;
    const committer = commit.committer.username;
    return {
      deploymentSource: branchName,
      infoText: `<${commit.url}|Commit> by *${committer}*: ${commit.message}`,
    };
  }
};

const getCat = ({ fail }) => {
  return fail
    ? {
        type: "image",
        image_url: `https://cataas.com/cat/fail?_=${github.context.runId}`,
        alt_text: "cat failing",
      }
    : {
        type: "image",
        image_url: `https://cataas.com/cat/gif?_=${github.context.runId}`,
        alt_text: "cute cat",
      };
};

const getEmoji = ({ fail }) => {
  return fail
    ? failureEmojis[Math.floor(Math.random() * failureEmojis.length)]
    : successEmojis[Math.floor(Math.random() * successEmojis.length)];
};

const run = async () => {
  try {
    const webhookUrl = core.getInput("webhook-url");
    const messageType = core.getInput("message-type");

    let message = {
      blocks: [],
    };

    const repoName = github.context.payload.repository.name;
    const repoUrl = github.context.payload.repository.url;

    const isRelease = !!github.context.payload.release;

    const { deploymentSource, infoText } = getDeploymentDetails(isRelease);

    if (messageType === "deployment") {
      const softaUrl = core.getInput("softa-url");

      if (!softaUrl) {
        core.setFailed(
          "softa-url must be included when using message-type 'deployment'"
        );
        exit(1);
      }

      const emoji = getEmoji({ fail: false });

      const deploymentTarget = core.getInput("deployment-target");
      const deploymentText = deploymentTarget
        ? `${repoName} ${deploymentSource} started deployment to ${deploymentTarget} :${emoji}:`
        : `${repoName} ${deploymentSource} started deployment :${emoji}:`;

      message.blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: deploymentText,
          emoji: true,
        },
      });

      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: infoText,
        },
        accessory: getCat({ fail: false }),
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
    } else if (messageType === "deployment-failure") {
      const emoji = getEmoji({ fail: true });

      const deploymentTarget = core.getInput("deployment-target");
      const deploymentText = deploymentTarget
        ? `Oh no! ${repoName} ${deploymentSource} failed deployment to ${deploymentTarget} :${emoji}:`
        : `Oh no! ${repoName} ${deploymentSource} failed deployment :${emoji}:`;

      message.blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: deploymentText,
          emoji: true,
        },
      });
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${repoUrl}/runs/${github.context.runId}|Workflow run> failed \n ${infoText}`,
        },
        accessory: getCat({ fail: true }),
      });
    } else if (messageType === "test-failure") {
      const emoji = getEmoji({ fail: true });

      const branchName = github.context.payload.ref.split("/").pop();
      const commit = github.context.payload.head_commit;
      const committer = commit.committer.username;

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
        accessory: getCat({ fail: true }),
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
