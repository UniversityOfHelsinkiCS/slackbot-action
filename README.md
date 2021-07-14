# Toska slackbot-action

This action sends notifications to slack via Pingviini slackbot. Notifications are enriched with
some toska swag based on given inputs.

## Inputs

## `webhook-url`

**Required** Pingviini webhook url for some channel

## `message-type`

**Required** Kind of message you want to send. Either 'deployment', 'deployment-failure' or 'test-failure'.

## `softa-url`

**Required (only for message-type 'deployment')** Url for softa (e.g. suotar staging, oodikone prod), will
be a link in deployment message

## `deployment-target`

Optionally append deployment target to deployment message, e.g. "Oodikone master started deployment
to `deployment-target`". If not given, message will just have "Oodikone master started deployment".

## `softa-to-deploy`

Monorepos (e.g. importer, oodikone) usually have different workflows for different services. You can optionally append the name of the service that is going to be deployed to deployment message, e.g. "Oodikone trunk (sis-updater-scheduler) started deployment". If not given, message will just have "Oodikone trunk started deployment".

## Example usage

Check which tag version you want to use from
[releases](https://github.com/UniversityOfHelsinkiCS/slackbot-action/releases). Apply
that tag version to `uses: UniversityOfHelsinkiCS/slackbot-action@vX.X`. Then use
workflow as follows:

```bash
- name: "Send notification to slack when deploying"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: deployment
    softa-url: https://opetushallinto.cs.helsinki.fi/suoritustarkistin
    deployment-target: production
```

```bash
- name: "Send notification to slack when staging deployment fails"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: deployment-failure
    deployment-target: staging
```

```bash
- name: "Send notification to slack when tests fail"
  uses:  UniversityOfHelsinkiCS/slackbot-action@vX.X
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    message-type: test-failure
```
