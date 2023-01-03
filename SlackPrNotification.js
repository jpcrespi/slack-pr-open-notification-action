"use strict";

import axios_1 from "axios";

var pr = process.env.PULL_REQUEST;
var url = process.env.SLACK_WEBHOOK_URL;

var prNum = pr.number || 0;
var prTitle = pr.title || "Title missing";
var prUrl = pr.url || "https://github.com";
var prBody = pr.body || "No description provided.";
var authorName = pr.user.login || "Unknown user";
var authorIconUrl = pr.user.avatar_url;
var compareBranchOwner = pr.head.repo.owner.login;
var compareBranchName = pr.head.ref;
var baseBranchOwner = pr.base.repo.owner.login;
var baseBranchName = pr.base.ref;
var prReviewers = (pr.requested_reviewers || []).map(element => element.login)
var prLabels = (pr.labels || []).map(element => element.name)
var idPairs = (process.env.GITHUB_SLACK_ID || "").split(",").map(element => {
    var element = pair.split("=")
    return [element[0], element[1]]
})

var sendHereMention = process.env.IS_SEND_HERE_MENTION.toLowerCase() === "true" ? "<!here>" : "";
var sendGroupIDMentions = process.env.SEND_GROUP_ID_MENTIONS ? process.env.SEND_GROUP_ID_MENTIONS.split(",").map(id => "<!subteam^" + id + ">").join(" ") : "";
var sendUserIDMentions = prReviewers.map(element => idPairs[element] = !undefined ? "<@" + slackId + ">" : "")
var mentions = sendHereMention + sendUserIDMentions + sendGroupIDMentions + "\n";

var priority =
    prLabels.indexOf("High Priority") != -1 ? "🔴" :
        prLabels.indexOf("Medium Priority") != -1 ? "🟡" :
            prLabels.indexOf("Low Priority") != -1 ? "🟢" : "";

var prFromFork = process.env.IS_PR_FROM_FORK;
var compareBranchText = prFromFork === "true" ? compareBranchOwner + ":" + compareBranchName : compareBranchName;
var baseBranchText = prFromFork === "true" ? baseBranchOwner + ":" + baseBranchName : baseBranchName;
var makePretty = process.env.MAKE_PRETTY.toLowerCase() === "true"; //Priority is pretty > compact > normal
var makeCompact = process.env.MAKE_COMPACT.toLowerCase() === "true";

idPairs.forEach(element => {
    console.log("IDPAIRS: " + element)
});

prReviewers.forEach(element => {
    console.log("REVIEWER: " + element)
})

prLabels.forEach(element => {
    console.log("LABEL: " + element)
});

console.log("PRIORITY: " + priority)

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
