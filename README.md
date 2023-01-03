# Slack Pull Request Open Notification

Use GitHub Actions to notify Slack that a pull request has been opened.

![example](https://raw.githubusercontent.com/jpcrespi/slack-pr-open-notification-action/images/example.png)

## Usage

Add the following YAML to your new GitHub Actions workflow:

```yaml
name: Slack Pull Request Open Notification

on:
  pull_request:
    types: [opened, reopened]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: jpcrespi/slack-pr-open-notification-action@master
      env: 
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        PULL_REQUEST: ${{ toJson(github.event.pull_request) }}
        GITHUB_SLACK_IDS: githubuser1=SLACKUSERID1,githubuser2=SLACKUSERID2
        SEND_GROUP_ID_MENTIONS: GROUPIDDDD,GGGGROUPID
        IS_SEND_HERE_MENTION: false
        IS_PR_FROM_FORK: false
        MAKE_PRETTY : false
        MAKE_COMPACT : true
```

### Arguments

#### SLACK_WEBHOOK_URL

The incoming Slack webhook URL. Create a repository secret named 'SLACK_WEBHOOK_URL' and paste the URL as the value.

#### PULL_REQUEST_*

See the following URL: https://developer.github.com/v3/pulls/.

#### IS_SEND_HERE_MENTION

**boolean (DEFAULT: true)**  
Whether to include the '@here' Slack mention when sending a message.

#### MAKE_PRETTY

**boolean (DEFAULT: false)**  
Pretty prints the information. Adds a "See Pull Request" button.

![make_pretty](https://raw.githubusercontent.com/jun3453/slack-pr-open-notification-action/images/make_pretty.png)

#### MAKE_COMPACT

**boolean (DEFAULT: false)**  
Smaller visual footprint.

![make_compact](https://raw.githubusercontent.com/jun3453/slack-pr-open-notification-action/images/make_compact.png)

#### IS_PR_FROM_FORK

**boolean (DEFAULT: false)**  
Whether notifications should support PRs from forks. By default, only the branch name is listed when sending a message.  
If set to 'true', it will add the branch owner in front of the branch name ('owner:branch' vs 'branch'). If this option is used, you may need to enable fork pull request workflows under your repository's Actions settings.

![make_compact and is_pr_fork](https://raw.githubusercontent.com/jun3453/slack-pr-open-notification-action/images/make_compact_fork.png)

#### GITHUB_SLACK_IDS

**string (Optional)**
A list of "github,slack" user ids which will be compared to requested reviewers in the PR
for slack tagging in the following format "githubuser1=SLACKUSERID1,githubuser2=SLACKUSERID2"

#### SEND_GROUP_ID_MENTIONS

**string (Optional)**  
Throw mentions to a specific group.
Enter your Slack group ID separated by commas.
Please google how to find out your group ID.