"use strict";

var axios_1 = require("axios")

var url = process.env.SLACK_WEBHOOK_URL
var pr = JSON.parse(process.env.PULL_REQUEST)

var prNum = pr.number || 0
var prTitle = pr.title || "Title missing"
var prUrl = pr.url || "https://github.com"
var prBody = pr.body || "No description provided."
var authorName = pr.user.login || "Unknown user"
var authorIconUrl = pr.user.avatar_url
var compareBranchOwner = pr.head.repo.owner.login
var compareBranchName = pr.head.ref
var baseBranchOwner = pr.base.repo.owner.login
var baseBranchName = pr.base.ref
var prReviewers = (pr.requested_reviewers || []).map(element => element.login)
var prLabels = (pr.labels || []).map(element => element.name)
var idPairs = (process.env.GITHUB_SLACK_ID || "").split(",").reduce((map, element) => {
    var kv = element.split("=")
    map[kv[0]] = kv[1]
    return map
}, {})

var sendHereMention = process.env.IS_SEND_HERE_MENTION.toLowerCase() === "true" ? "<!here>" : ""
var sendGroupIDMentions = process.env.SEND_GROUP_ID_MENTIONS ? process.env.SEND_GROUP_ID_MENTIONS.split(",").map(id => "<!subteam^" + id + ">").join(" ") : ""
var sendUserIDMentions = prReviewers.map(element => idPairs[element] != undefined ? "<@" + idPairs[element] + ">" : "").join(" ")
var mentions = sendHereMention + sendUserIDMentions + sendGroupIDMentions

var priority =
    prLabels.indexOf("High Priority") != -1 ? "🔴" :
        prLabels.indexOf("Medium Priority") != -1 ? "🟡" :
            prLabels.indexOf("Low Priority") != -1 ? "🟢" : ""

var prFromFork = process.env.IS_PR_FROM_FORK
var compareBranchText = prFromFork === "true" ? compareBranchOwner + ":" + compareBranchName : compareBranchName
var baseBranchText = prFromFork === "true" ? baseBranchOwner + ":" + baseBranchName : baseBranchName

//Priority is pretty > compact > normal
var makePretty = process.env.MAKE_PRETTY.toLowerCase() === "true"
var makeCompact = process.env.MAKE_COMPACT.toLowerCase() === "true"

console.log("IDPAIRS: " + idPairs)
console.log("REVIEWERS: " + prReviewers)
console.log("LABELS: " + prLabels)
console.log("PRIORITY: " + priority)
console.log("MENTIONS: " + mentions)

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
    }
    axios_1["default"].post(url, message)
}
else if (makeCompact) {
    var text = priority + " " + mentions + "PR#*<" + prUrl + "|" + prNum + ">* from *" + compareBranchText + "* to *" + baseBranchText + "* by: *" + authorName + "*"
    var message = {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: text
                }
            }
        ]
    }
    console.log("TEXT: " + text)
    //axios_1["default"].post(url, message)

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
    }
    axios_1["default"].post(url, message)
}
