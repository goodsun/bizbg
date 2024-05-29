import Notion from "@notionhq/client";
import { NotionMember } from "../types/notionMember.js";
import { CONST } from "../common/const.js";
import { sleep } from "../common/util.js";
let json = [];

const client = new Notion.Client({
  auth: CONST.NOTION_API_KEY,
});

const notionUpdate = async function (request, retryCount = 0) {
  let response;
  try {
    response = await client.pages.update(request);
  } catch (e) {
    retryCount++;
    if (retryCount > CONST.RETRY_LIMIT) {
      console.log("update failed");
      return false;
    }
    console.log("update retry:" + retryCount);
    sleep(CONST.RETRY_WAIT);
    response = await notionUpdate(request, retryCount);
  }
  return response;
};

const notionCreate = async function (request, retryCount = 0) {
  let response;
  try {
    response = await client.pages.create(request);
  } catch (e) {
    retryCount++;
    if (retryCount > CONST.RETRY_LIMIT) {
      console.log("create failed");
      return false;
    }
    console.log("create retry:" + retryCount);
    sleep(CONST.RETRY_WAIT);
    response = await notionCreate(request, retryCount);
  }
  return response;
};

const notionQuery = async function (request, retryCount = 0) {
  let response;
  try {
    response = await client.databases.query(request);
  } catch (e) {
    retryCount++;
    if (retryCount > CONST.RETRY_LIMIT) {
      console.log("fetch failed");
      return false;
    }
    console.log("fetch retry:" + retryCount);
    sleep(CONST.RETRY_WAIT);
    response = await notionQuery(request, retryCount);
  }
  return response;
};

const getMemberList = async (nextid = null) => {
  const request: any = { database_id: CONST.NOTION_DATABASE_ID };
  if (nextid) {
    request.start_cursor = nextid;
  } else {
    json = [];
  }
  const response = await notionQuery(request);
  const members = response.results.map((data) => {
    const member: any = {};
    member.id = data.properties.id.rich_text[0].plain_text;
    member.name = data.properties.name.title[0].plain_text;
    member.roles = data.properties.roles.multi_select.map((role) => {
      return role.name;
    });
    member.icon = "";
    if (data.properties.icon.files[0]) {
      member.icon = data.properties.icon.files[0].external.url;
    }
    member.exit = data.properties.exit.checkbox;
    member.page_id = data.id;
    return member;
  });
  json = json.concat(members);
  if (response.has_more) {
    console.log(
      new Date().toLocaleTimeString("ja-JP") +
        " get Notion Members: " +
        json.length +
        " next " +
        response.next_cursor
    );
    await getMemberList(response.next_cursor);
  }
  return json;
};

const memberListUpdate = async (discordList, notionList) => {
  let addCnt = 0;
  let updateCnt = 0;
  let delCnt = 0;
  for (let key in discordList) {
    const member = discordList[key];
    const filteredItems = notionList.filter((item) => item.id === member.id);
    console.log(new Date() + " UPDate Notion Member:" + member.name);

    const roles = [];
    for (let i = 0; i < member.roles.length; i++) {
      if (member.roles[i]) {
        roles.push({ name: member.roles[i] });
      }
    }
    const icon = [];
    if (member.icon) {
      icon.push({
        name:
          member.icon.length <= 100 ? member.icon : CONST.DISCORD_DUMMY_ICON,
        type: "external",
        external: {
          url:
            member.icon.length <= 100 ? member.icon : CONST.DISCORD_DUMMY_ICON,
        },
      });
    }

    if (filteredItems.length == 0) {
      addCnt++;
      console.log("CheckMemberId : " + String(member.id));

      const params = NotionMember.create;
      params.icon.external.url = member.icon;
      params.properties.name.title = [{ text: { content: member.name } }];
      params.properties.roles.multi_select = roles;
      params.properties.join.date.start = member.join;
      params.properties.id.rich_text = [{ text: { content: member.id } }];
      params.properties.icon.files = icon;
      await notionCreate(params);
    } else {
      const dcRoles = JSON.stringify(
        member.roles.filter((role) => role !== "").sort()
      );
      const ntRoles = JSON.stringify(
        filteredItems[0].roles.filter((role) => role !== "").sort()
      );

      if (
        member.name !== filteredItems[0].name ||
        member.icon !== filteredItems[0].icon ||
        dcRoles !== ntRoles
      ) {
        updateCnt++;
        console.log("UPDATE : " + member.name);

        const params = NotionMember.update;
        params.page_id = filteredItems[0].page_id;
        params.icon.external.url = member.icon;
        params.properties.name.title = [{ text: { content: member.name } }];
        params.properties.roles.multi_select = roles;
        params.properties.join.date.start = member.join;
        params.properties.id.rich_text = [{ text: { content: member.id } }];
        params.properties.icon.files = icon;
        await notionUpdate(params);
      }
    }
  }

  for (let key in notionList) {
    const member = notionList[key];
    if (member.page_id != undefined) {
      const filteredItems = discordList.filter((item) => item.id === member.id);
      if (filteredItems.length == 0 && !member.exit) {
        delCnt++;
        console.log("EXIT : " + member.page_id);
        const params = NotionMember.delete;
        params.page_id = member.page_id;
        await notionUpdate(params);
      }
    }
  }
  console.log("discord:" + discordList.length + " notion:" + notionList.length);
  console.log("add:" + addCnt + " update:" + updateCnt + " del:" + delCnt);
};

const getDisplayData = async () => {
  const list = await getMemberList();
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
      " exit:" +
      data.exit +
      "\n";
  }
  return result;
};

const notionService = {
  notionQuery,
  notionCreate,
  notionUpdate,
  getMemberList,
  memberListUpdate,
  getDisplayData,
};
export default notionService;
