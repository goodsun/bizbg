import { CONST } from "../common/const.js";
import { setTimeout } from "timers/promises";
import memberModel from "../model/members.js";
const guild_id = CONST.DISCORD_GUILD_ID;
const bot_key = CONST.DISCORD_BOT_KEY;
let json = [];
let mode = "get";
let roles = CONST.roles;

async function loadCustomConstants() {
  try {
    const { CUSTOM_SETTINGS } = await import("../common/customSettings.js");
    roles = CUSTOM_SETTINGS.roles;
  } catch (error) {
    roles = CONST.roles;
  }
}

const getMemberList = async (nextid = null) => {
  await loadCustomConstants();
  let endpoint = `https://discord.com/api/v10/guilds/${guild_id}/members?limit=1000`;
  if (nextid) {
    endpoint = `https://discord.com/api/v10/guilds/${guild_id}/members?limit=1000&after=${nextid}`;
  } else {
    json = [];
  }
  const response = await fetch(endpoint, {
    headers: {
      accept: "*/*",
      "User-Agent": "bonsoleilDiscordBot (https://github.com/goodsun/bizbot)",
      "accept-language": "ja,en-US;q=0.9,en;q=0.8",
      authorization: `Bot ${bot_key}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "x-discord-locale": "ja",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  });

  const result = await response.json();
  for (let i = 0; i < result.length; i++) {
    const data = result[i];
    if (data.user.bot) {
      continue;
    }

    const member: any = {};

    member.id = data.user.id;

    if (data.nick) {
      member.name = data.nick;
    } else {
      member.name = data.user.username;
    }

    member.roles = [];
    for (let i = 0; i < data.roles.length; i++) {
      if (roles[data.roles[i]]) {
        member.roles.push(roles[data.roles[i]]);
      }
    }

    if (data.avatar) {
      member.icon = `https://cdn.discordapp.com/guilds/${CONST.DISCORD_GUILD_ID}/users/${data.user.id}/avatars/${data.avatar}.png`;
    } else if (data.user.avatar) {
      member.icon = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
    } else {
      member.icon =
        "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png";
    }

    member.join = data.joined_at;
    json.push(member);
  }

  if (result.length === 1000) {
    const headers = await response.headers;
    // x-ratelimit-remaining残りが3を切ったら1秒待つ
    if (Number(headers.get("x-ratelimit-remaining")) <= 3) {
      console.log("set timeout", headers.get("x-ratelimit-reset-after"));
      await setTimeout(1000);
    }
    console.log(
      new Date().toLocaleTimeString("ja-JP") +
        " Get Discord Members:" +
        result[1000 - 1].user.id
    );
    await getMemberList(result[1000 - 1].user.id);
  }

  return json;
};

const getList = async () => {
  json = [];
  return await getMemberList();
};

const getDisplayData = async () => {
  const list = await getList();
  let result = "\n";
  for (let key in list) {
    const data = list[key];
    result =
      result +
      key +
      " | name:" +
      data.name +
      " discordId:" +
      data.id +
      " roles:" +
      data.roles +
      " join:" +
      data.join +
      "\n";
  }
  return result;
};

const discordService = {
  getList,
  getMemberList,
  getDisplayData,
};

export default discordService;
