"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var url = process.env.SLACK_WEBHOOK_URL;
var prNum = process.env.PULL_REQUEST_NUMBER;
var prTitle = process.env.PULL_REQUEST_TITLE;
var prUrl = process.env.PULL_REQUEST_URL;
var prBody = process.env.PULL_REQUEST_BODY || "No description provided.";
var prLabels = process.env.PULL_REQUEST_LABELS ? process.env.PULL_REQUEST_LABELS : []
var authorName = process.env.PULL_REQUEST_AUTHOR_NAME;
var authorIconUrl = process.env.PULL_REQUEST_AUTHOR_ICON_URL;
var compareBranchOwner = process.env.PULL_REQUEST_COMPARE_BRANCH_OWNER;
var compareBranchName = process.env.PULL_REQUEST_COMPARE_BRANCH_NAME;
var baseBranchOwner = process.env.PULL_REQUEST_BASE_BRANCH_OWNER;
var baseBranchName = process.env.PULL_REQUEST_BASE_BRANCH_NAME;
var sendHereMention = process.env.IS_SEND_HERE_MENTION.toLowerCase() === "true" ? "<!here>" : "";
// get github and slack ids from env var in this format { githubuser1=USERIDSLACK1,githubuser2=USERIDSLACK2 }
var idPairs = process.env.GITHUB_SLACK_IDS ? process.env.GITHUB_SLACK_IDS.split(",") : []
// get reviewers github ids from PR
var sendUserGithubIds = process.env.PULL_REQUEST_REQUESTED_REVIEWERS ? process.env.PULL_REQUEST_REQUESTED_REVIEWERS.map(function (reviewer) {
    return reviewer.id
}) : []

idPairs.forEach(element => {
    console.log("IDPAIRS: " + element)
});

sendUserGithubIds.forEach(element => {
    console.log("REVIEWER: " + element)
})

var sendUserIDMentions = idPairs ? idPairs.map(function (pair) {
    var split = pair.split("=")
    var githubId = split[0]
    var slackId = split[1]
    return sendUserGithubIds.indexOf(githubId) != -1 ? "<@" + slackId + ">" : ""
}).join(" ") : "";

console.log("LABELS: " + prLabels)
prLabels.forEach(element => {
    console.log("LABEL: " + element)
});

var priority =
    prLabels.indexOf("High Priority") != -1 ? "🔴" :
        prLabels.indexOf("Medium Priority") != -1 ? "🟡" :
            prLabels.indexOf("Low Priority") != -1 ? "🟢" : "";

console.log("PRIORITY: " + priority)

var sendGroupIDMentions = process.env.SEND_GROUP_ID_MENTIONS ? process.env.SEND_GROUP_ID_MENTIONS.split(",").map(function (id) {
    return "<!subteam^" + id + ">";
}).join(" ") : "";

var mentions = sendHereMention + sendUserIDMentions + sendGroupIDMentions + "\n";
var prFromFork = process.env.IS_PR_FROM_FORK;
var compareBranchText = prFromFork === "true" ? compareBranchOwner + ":" + compareBranchName : compareBranchName;
var baseBranchText = prFromFork === "true" ? baseBranchOwner + ":" + baseBranchName : baseBranchName;
var makePretty = process.env.MAKE_PRETTY.toLowerCase() === "true"; //Priority is pretty > compact > normal
var makeCompact = process.env.MAKE_COMPACT.toLowerCase() === "true";
if (makePretty) {
    var message = {
        attachments: [
            {
                color: "#00ff00",
                blocks: [
                    {
                        type: "section",
                        block_id: "commit_title",
                        text: {
                            type: "mrkdwn",
                            text: priority + " *<" + prUrl + "|" + prTitle + ">* #" + prNum + " from *" + compareBranchText + "* to *" + baseBranchText + "*." + mentions
                        }
                    },
                    {
                        type: "context",
                        block_id: "committer_meta",
                        elements: [
                            {
                                type: "image",
                                image_url: authorIconUrl,
                                alt_text: "images"
                            },
                            {
                                type: "mrkdwn",
                                text: authorName
                            }
                        ]
                    },
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "See Pull Request",
                                    emoji: true
                                },
                                value: prTitle,
                                url: prUrl,
                                action_id: "actionId-0",
                                style: "primary"
                            }
                        ]
                    }
                ]
            }
        ]
    };
    axios_1["default"].post(url, message);
}
else if (makeCompact) {
    var message = {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: priority + " " + mentions + "PR#*<" + prUrl + "|" + prNum + ">* #" + " from *" + compareBranchText + "* to *" + baseBranchText + "*." + " By: *" + authorName + "*"
                }
            }
        ]
    };
    console.log(message)
    //axios_1["default"].post(url, message);
}
else {
    var message = {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: priority + " " + mentions + "*<" + prUrl + "|" + prTitle + ">*"
                },
                accessory: {
                    type: "image",
                    image_url: authorIconUrl,
                    alt_text: "github icon"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: "*Author*\n" + authorName
                    },
                    {
                        type: "mrkdwn",
                        text: "*Base branch*\n" + baseBranchText
                    },
                    {
                        type: "mrkdwn",
                        text: "*Pull request number*\n#" + prNum
                    },
                    {
                        type: "mrkdwn",
                        text: "*Compare branch*\n" + compareBranchText
                    },
                ]
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: prBody,
                    emoji: true
                }
            },
        ]
    };
    axios_1["default"].post(url, message);
}
