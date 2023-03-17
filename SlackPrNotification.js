"use strict";

var axios = require("axios");
var url = process.env.SLACK_WEBHOOK_URL;
var pr = JSON.parse(process.env.PULL_REQUEST);

// Check PR data
var prNum = pr.number || 0;
var prTitle = pr.title || "Title missing";
var prUrl = pr.html_url || "https://github.com";
var prBody = pr.body || "No description provided.";

// Check PR priority
var prLabels = (pr.labels || []).map((element) => element.name);
var priorities = {
    "Urgent Priority": "🔴",
    "High Priority": "🟠",
    "Medium Priority": "🟡",
    "Low Priority": "🟢",
};
var prPriority = prLabels
    .map((element) =>
        priorities[element] !== undefined ? priorities[element] : ""
    )
    .filter((element) => element.length > 0);
if (prPriority.length === 0) {
    console.log("Ignoring PR without priority...")
    return
}
var priority = prPriority.join(" ");

// Check PR Mentions
var prReviewers = (pr.requested_reviewers || []).map(
    (element) => element.login
);
var idPairs = (process.env.GITHUB_SLACK_IDS || "")
    .split(",")
    .reduce((map, element) => {
        var kv = element.split("=");
        map[kv[0]] = kv[1];
        return map;
    }, {});
var sendHereMention =
    process.env.IS_SEND_HERE_MENTION.toLowerCase() === "true" ? "<!here>" : "";
var sendGroupIDMentions = process.env.SEND_GROUP_ID_MENTIONS
    ? process.env.SEND_GROUP_ID_MENTIONS.split(",")
        .map((id) => "<!subteam^" + id + ">")
        .join(" ")
    : "";
var sendUserIDMentions = prReviewers
    .map((reviewer) =>
        idPairs[reviewer] !== undefined ? "<@" + idPairs[reviewer] + ">" : ""
    )
    .join(" ");
var mentions = sendHereMention + sendUserIDMentions + sendGroupIDMentions;

// Check PR fork
var compareBranchOwner = pr.head.repo.owner.login;
var compareBranchName = pr.head.ref;
var baseBranchOwner = pr.base.repo.owner.login;
var baseBranchName = pr.base.ref;
var prFromFork = process.env.IS_PR_FROM_FORK;
var compareBranchText =
    prFromFork === "true"
        ? compareBranchOwner + ":" + compareBranchName
        : compareBranchName;
var baseBranchText =
    prFromFork === "true"
        ? baseBranchOwner + ":" + baseBranchName
        : baseBranchName;

// Check PR author
var authorName = pr.user.login || "Unknown user";
var author =
    idPairs[authorName] !== undefined
        ? "<@" + idPairs[authorName] + ">"
        : authorName;

// Send message
var text = [
    priority,
    mentions,
    "PR#*<" + prUrl + "|" + prNum + ">*",
    "from",
    "*" + compareBranchText + "*",
    "to",
    "*" + baseBranchText + "*",
    "opened by",
    author,
].join(" ");
var message = {
    blocks: [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: text,
            },
        },
    ],
};
axios["default"].post(url, message)