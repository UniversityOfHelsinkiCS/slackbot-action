# Toska slackbot-action

This action sends notifications to slack via Pingviini slackbot. Notifications are enriched with
some toska swag based on given inputs.

## Inputs

## `webhook-url`

**Required** Pingviini webhook url for some channel

## `message-type`

**Required** Kind of message you want to send. Either 'deployment' or 'test-failure'.

## `softa-url`

**Required (for deployment)** Url for softa (e.g. suotar staging, oodikone prod), will
be a link in deployment message

## Example usage

Check which tag version you want to use from
[releases](https://github.com/UniversityOfHelsinkiCS/slackbot-action/releases). Apply
that tag version to `uses: UniversityOfHelsinkiCS/slackbot-action@vX.X`. Then use
workflow as follows:

```bash
- name: "Send notification to slack when tests fail"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: test-failure
```

```bash
- name: "Send notification to slack when deploying"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: deployment
    softa-url: https://opetushallinto.cs.helsinki.fi/suoritustarkistin
```
