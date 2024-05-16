import { CONST } from "./common/const.js";
import controller from "./service/controller.js";
console.log("BIZ BOT RUNNING : " + CONST.API_ENV + ":" + CONST.VERSION);

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
    switch (message.function) {
      case "notion-sync":
        console.log("notionList updated processing");
        await controller.notionUpdate();
        break;
      case "dynamo-sync":
        await controller.dynamoList();
        console.log("dynamoList updated processing");
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
