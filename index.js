const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const run = async () => {

  try {
    const webhookUrl = core.getInput('webhook-url')
    const header = core.getInput('header')
  
    let message = {
      blocks: [
        { type: "header", 
          text: {
            type: "plain_text",
            text: `${header} :kurkkumopo:`,
            emoji: true
          }
        }
      ]
    }

    const body = core.getInput('body') || undefined
    if (body) {
      message.blocks.push(
        { type: "section",
          text: {
            type: "mrkdwn",
            text: body
          }
      }
      )
    }

    await axios.post(webhookUrl, JSON.stringify(message))

  } catch (error) {
    core.setFailed(error.message);
  }

}

run()

