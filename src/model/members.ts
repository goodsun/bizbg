import { CRUD } from "../types/crud.js";
import { CONST } from "../common/const.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_MEMBER_TABLENAME;

const getMemberList = async () => {
  let params = CRUD.query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  return result;
};

const getAllList = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getMember = async (req) => {
  let params = CRUD.read;
  params.TableName = TableName;
  params.Key.DiscordId.N = req.params.id;
  return await dynamoService.getItem(params);
};

const getDisplayMember = async (req) => {
  const member = await getMember(req);
  let result = "<div>";
  if (member != undefined) {
    result = result + "<img src='" + member.Icon.S + "' />";
    result = result + "<br />id : " + req.params.id;
    result = result + "<br /> name : " + member.Name.S;
    result = result + "<br /> roles : " + member.Roles.SS;
    result = result + "<br /> join : " + member.Join.S;
    result = result + "<br /> exit : " + member.DeleteFlag.BOOL;
    result = result + "<br /> update : " + member.Updated.S;
  }
  result = result + "</div>";
  return result;
};

const getDisplayData = async () => {
  const list = await getMemberList();
  if (list == undefined) {
    let params = CRUD.create;
    params.TableName = TableName;
    dynamoService.createTable(params);
    return "TABLE CREATE : " + TableName;
  } else {
    let result = "<div>";
    for (let key in list.Items) {
      const data = list.Items[key];
      result =
        result +
        key +
        " | " +
        'Id: <b><a href="/member/' +
        data.DiscordId.N +
        '">' +
        data.DiscordId.N +
        "</a></b>" +
        " name: <b>" +
        data.Name.S +
        "</b><br />";
    }
    result = result + "</div>";
    return result;
  }
};

const memberCreate = async (member) => {
  console.log("dynamo メンバー登録");
  let params = CRUD.write;
  params.TableName = TableName;
  params.Item.DiscordId.N = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Icon.S = member.icon;
  params.Item.Join.S = member.join;
  if (member.roles.length == 0) {
    params.Item.Roles.SS = [""];
  } else {
    params.Item.Roles.SS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberUpdate = async (member) => {
  console.log("dynamo メンバー更新");
  let params = CRUD.write;
  params.TableName = TableName;
  params.Item.DiscordId.N = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Icon.S = member.icon;
  if (member.roles.length == 0) {
    params.Item.Roles.SS = [""];
  } else {
    params.Item.Roles.SS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberDelete = async (member) => {
  console.log(
    "dynamo メンバー削除 " + member.DiscordId.N + " name:" + member.Name.S
  );
  let params = CRUD.delete;
  params.TableName = TableName;
  params.Key.DiscordId.N = member.DiscordId.N;
  await dynamoService.deleteItem(params);
};

const memberSoftDelete = async (member) => {
  console.log(
    "dynamo メンバー退会 " + member.DiscordId.N + " name:" + member.Name.S
  );
  let params = CRUD.update;
  params.TableName = TableName;
  params.Key.DiscordId.N = member.DiscordId.N;
  params.UpdateExpression = "SET DeleteFlag = :newVal";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
  };
  await dynamoService.updateItem(params);
};

const memberListUpdate = async (discordList, dynamoList) => {
  let addCnt = 0;
  let updateCnt = 0;
  let delCnt = 0;
  for (let key in discordList) {
    const member = discordList[key];
    const filteredItems = dynamoList.filter(
      (item) => String(item.DiscordId.N) === String(member.id)
    );
    if (filteredItems.length == 0) {
      addCnt++;
      await memberModel.memberCreate(member);
    } else {
      const dcRoles = JSON.stringify(
        member.roles.filter((role) => role !== "").sort()
      );
      const dyRoles = JSON.stringify(
        filteredItems[0].Roles.SS.filter((role) => role !== "").sort()
      );
      if (
        member.name !== filteredItems[0].Name.S ||
        member.icon !== filteredItems[0].Icon.S ||
        dcRoles !== dyRoles
      ) {
        updateCnt++;
        await memberModel.memberUpdate(member);
      }
    }
  }

  for (let key in dynamoList) {
    const member = dynamoList[key];
    if (member) {
      const filteredItems = discordList.filter(
        (item) => String(item.id) === String(member.DiscordId.N)
      );
      if (filteredItems.length == 0) {
        delCnt++;
        if (CONST.DYNAMO_SOFT_DELETE == "true") {
          await memberModel.memberSoftDelete(member);
        } else {
          await memberModel.memberDelete(member);
        }
      }
    }
  }
  console.log("dis:" + discordList.length + " dyn:" + dynamoList.length);
  console.log("add:" + addCnt + " update:" + updateCnt + " del:" + delCnt);
};

const memberModel = {
  getAllList,
  getMemberList,
  getMember,
  memberCreate,
  memberUpdate,
  memberDelete,
  memberSoftDelete,
  memberListUpdate,
  getDisplayData,
  getDisplayMember,
};
export default memberModel;
