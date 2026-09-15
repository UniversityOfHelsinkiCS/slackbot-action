import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { post } from "axios";

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
  const softaToDeploy = getInput("softa-to-deploy");
  if (isRelease) {
    const release = context.payload.release;

    let deploymentSource = `release ${release.tag_name}`
    if (softaToDeploy) deploymentSource.concat(` (${softaToDeploy})`)

    return {
      deploymentSource,
      infoText: `<${release.html_url}|Release> by *${release.author.login}*: ${release.body}`,
    };
  } else {
    const branchName = context.payload.ref.split("/").pop();
    const commit = context.payload.head_commit;
    const committer = commit.committer.username;

    let deploymentSource = branchName
    if (softaToDeploy) deploymentSource.concat(` (${softaToDeploy})`)

    return {
      deploymentSource,
      infoText: `<${commit.url}|Commit> by *${committer}*: ${commit.message}`,
    };
  }
};

const getCat = ({ fail }) => {
  return fail
    ? {
        type: "image",
        image_url: `https://cataas.com/cat/fail?_=${context.runId}`,
        alt_text: "cat failing",
      }
    : {
        type: "image",
        image_url: `https://cataas.com/cat/gif?_=${context.runId}`,
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
    const webhookUrl = getInput("webhook-url");
    const messageType = getInput("message-type");

    let message = {
      blocks: [],
    };

    const repoName = context.payload.repository.name;
    const repoUrl = context.payload.repository.url;

    const isRelease = !!context.payload.release;

    const { deploymentSource, infoText } = getDeploymentDetails(isRelease);

    if (messageType === "deployment") {
      const softaUrl = getInput("softa-url");

      if (!softaUrl) {
        setFailed(
          "softa-url must be included when using message-type 'deployment'"
        );
        exit(1);
      }

      const emoji = getEmoji({ fail: false });

      const deploymentTarget = getInput("deployment-target");
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

      const deploymentTarget = getInput("deployment-target");
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
          text: `<${repoUrl}/actions/runs/${context.runId}|Workflow run> failed \n ${infoText}`,
        },
        accessory: getCat({ fail: true }),
      });
    } else if (messageType === "test-failure") {
      const emoji = getEmoji({ fail: true });

      const branchName = context.payload.ref.split("/").pop();
      const commit = context.payload.head_commit;
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
          text: `<${repoUrl}/actions/runs/${context.runId}|Workflow run> by *${committer}* failed \n<${commit.url}|Commit>: ${commit.message}`,
        },
        accessory: getCat({ fail: true }),
      });
    } else {
      setFailed(`${messageType} not accepted message type`);
      exit(1);
    }

    await post(webhookUrl, JSON.stringify(message));
  } catch (error) {
    setFailed(error.message);
  }
};

run();
