import { CONST } from "../common/const.js";
import sqsService from "../service/sqs.js";
import discordService from "../service/discord.js";
import dynamoService from "../service/dynamo.js";
import notionService from "../service/notion.js";
import memberModel from "../model/members.js";
import { Message } from "../types/message.js";

const discordList = async () => {
  const result = await discordService.getDisplayData();
  console.log("Discord test:" + result);
  return result;
};

const dynamoList = async () => {
  console.log("DYNAMO SETTING : " + CONST.DYNAMO_TABLE_PREFIX);
  const result = await dynamoService.getDisplayData(
    CONST.DYNAMO_TABLE_PREFIX + "_member"
  );
  console.log("Dynamo test:" + result);
  return result;
};

const notionList = async () => {
  const result = await notionService.getDisplayData();
  console.log("Notion test:" + result);
  return result;
};

const sqsSend = async (message: Message) => {
  const result = await sqsService.sendMessage(JSON.stringify(message));
  console.log("SendMes SQS" + JSON.stringify(message));
  return result;
};
const notionUpdate = async () => {
  const discordList = await discordService.getMemberList();
  const notionList = await notionService.getMemberList();
  await notionService.memberListUpdate(discordList, notionList);
};

const dynamoUpdate = async () => {
  const discordList = await discordService.getMemberList();
  const dynamoList = await memberModel.getAllList();
  await memberModel.memberListUpdate(discordList, dynamoList);
};

const controller = {
  discordList,
  dynamoList,
  notionList,
  dynamoUpdate,
  notionUpdate,
  sqsSend,
};

export default controller;
