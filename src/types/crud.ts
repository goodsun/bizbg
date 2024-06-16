import { CONST } from "../common/const.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_member";

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
      Username: { S: "Discord Name" },
      Icon: { S: "https://example.com/test.png" },
      Roles: { SS: ["none"] },
      Join: { S: new Date() },
      DeleteFlag: { BOOL: "false" },
      Updated: { S: new Date() },
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
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
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
