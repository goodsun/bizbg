import controller from "./service/controller.js";
import { Message } from "./types/message";

const message: Message = {
  function: "dynamo-update",
  params: {
    input1: "dynamoSync",
    input2: "値を投げる",
    input3: "テスト",
  },
};
console.log("\n sqsTestを実行します。");
await controller.sqsSend(message);

console.log("\n discordTestを実行します。");
await controller.discordList();

console.log("\n dynamoTestを実行します。");
await controller.dynamoList();

console.log("\n notionTestを実行します。");
await controller.notionList();
