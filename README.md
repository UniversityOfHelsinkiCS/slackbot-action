# Toska slackbot-action

This action sends notifications to slack via Pingviini slackbot. Notifications are enriched with
some toska swag based on given inputs.

## Inputs

## `webhook-url`

**Required** Pingviini webhook url for some channel

## `header`

**Required** Header for pingviini message

## `body`

**Required** Optional body for pingviini message, accepts markdown

## Example usage

```bash
- name: "Send notification to slack"
  uses:  UniversityOfHelsinkiCS/slackbot-action@v1.0.1
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    header: Branch x started auto deployment to production
    body: "Commit: <https://github.com/UniversityOfHelsinkiCS/reponame/commit/${{ github.sha }}>"
```
