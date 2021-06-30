# Toska slackbot-action

This action sends notifications to slack via Pingviini slackbot. Notifications are enriched with
some toska swag based on given inputs.

## Inputs

## `webhook-url`

**Required** Pingviini webhook url for some channel

## `message-type`

**Required** Kind of message you want to send. Either 'deployment' or 'test-failure'.

## Example usage

```bash
- name: "Send notification to slack after test failure"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: test-failure
```
