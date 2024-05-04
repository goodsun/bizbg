import { CONST } from "./common/const.js";
import controller from "./service/controller.js";
console.log("BIZ BOT RUNNING : " + CONST.API_ENV);

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
    switch (message.function) {
      case "notion-sync":
        console.log("notionList updatedを実行します");
        await controller.notionUpdate();
        break;
      case "dynamo-sync":
        await controller.dynamoList();
        console.log("dynamoList updatedを実行します");
        await controller.dynamoUpdate();
        break;
      default:
        console.log("ファンクションを指定してください");
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("It Works."),
  };
  return response;
};
