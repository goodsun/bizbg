import { CONST } from "../common/const.js";
const TableName = CONST.DYNAMO_MEMBER_TABLENAME;

export const CRUD = {
  create: {
    TableName: TableName,
    AttributeDefinitions: [
      { AttributeName: "PartitionName", AttributeType: "S" },
      { AttributeName: "DiscordId", AttributeType: "N" },
    ],
    KeySchema: [
      { AttributeName: "PartitionName", KeyType: "HASH" },
      { AttributeName: "DiscordId", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  write: {
    TableName: TableName,
    Item: {
      PartitionName: { S: "Users" },
      DiscordId: { N: "0" },
      Name: { S: "Discord Name" },
      Icon: { S: "https://example.com/test.png" },
      Roles: { SS: ["none"] },
      Join: { S: new Date() },
      DeleteFlag: { BOOL: "false" },
      Update: { S: new Date() },
    },
  },
  read: {
    TableName: TableName,
    Key: {
      PartitionName: { S: "Users" },
      DiscordId: { N: "0" },
    },
  },
  update: {
    TableName: TableName,
    Key: {
      PartitionName: { S: "Users" },
      DiscordId: { N: "0" },
    },
    UpdateExpression: "SET Icon = :newVal",
    ExpressionAttributeValues: {
      ":newVal": { S: CONST.DISCORD_DUMMY_ICON } as object,
    },
  },
  delete: {
    TableName: TableName,
    Key: {
      PartitionName: { S: "Users" },
      DiscordId: { N: "0" },
    },
  },
  query: {
    TableName: TableName,
    KeyConditionExpression: "#PartitionName = :PartitionName",
    FilterExpression: "#DeleteFlag = :DeleteFlag",
    ExpressionAttributeNames: {
      "#PartitionName": "PartitionName",
      "#DeleteFlag": "DeleteFlag",
    } as object,
    ExpressionAttributeValues: {
      ":PartitionName": { S: "Users" },
      ":DeleteFlag": { BOOL: false },
    } as object,
  },
  scan: { TableName: TableName, Limit: 1000 },
};
