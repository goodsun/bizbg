import dotenv from "dotenv";
dotenv.config();

export const CONST = {
  API_ENV: process.env.API_ENV,
  API_URL: process.env.API_URL,
  PROVIDER_URL: process.env.PROVIDER_URL,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
  DISCORD_BOT_KEY: process.env.DISCORD_BOT_KEY,
  DISCORD_PUB_KEY: process.env.DISCORD_PUB_KEY,
  DISCORD_DUMMY_ICON: "https://example.com",
  DISCORD_SYNC_ROLE: process.env.DISCORD_SYNC_ROLE,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  DYNAMO_REGION: process.env.DYNAMO_REGION,
  DYNAMO_MEMBER_TABLENAME: process.env.DYNAMO_MEMBER_TABLENAME,
  DYNAMO_SOFT_DELETE: process.env.DYNAMO_SOFT_DELETE,
  DYNAMO_WRITE_WAIT_TIME: 200,

  RETRY_WAIT: 500,
  RETRY_LIMIT: 2,
  roles: {},

  // 暫定表示
  CONTENTS: {
    TITLE: "<h1>DISCORD BOT API | ENV:" + process.env.API_ENV + "</h1>",
    DEVTITLE: "<h1>DEVELOPER TOOL | ENV:" + process.env.API_ENV + "</h1>",
    MENU: {
      TOP:
        "<div>" +
        '<a href="/discord">discord</a>' +
        ' | <a href="/notion">notion</a>' +
        ' | <a href="/member">memberDB</a>' +
        "</div>",
      DEV:
        "<div>" +
        ' <a href="/list/member">list</a>' +
        ' | <a href="/read/member/1">read sample</a>' +
        ' | <a href="/write/member/1/sample/testNote">create sample</a>' +
        ' | <a href="/update/member/1/UpdateNote">update sample</a>' +
        ' | <a href="/delete/member/1">delete sample</a>' +
        ' | <a href="/create/member">createTable</a>' +
        "</div>",
      NOTION:
        "<div>" +
        ' <a href="/notion">list</a>' +
        ' | <a href="/notion/update">update</a></div>' +
        "</div>",
      MEMBER:
        "<div>" +
        ' <a href="/member">list</a>' +
        ' | <a href="/member/update">update</a>' +
        "</div>",
    },
  },
};
