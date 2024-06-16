import { CONST } from "./common/const.js";
import controller from "./service/controller.js";
import discordService from "./service/discord.js";

export const handler = async (event) => {
  for (let key in event.Records) {
    const message = JSON.parse(event.Records[key].body);
    switch (message.function) {
      case "notion-sync":
        console.log(
          "notionList updated processing | VER." +
            CONST.API_ENV +
            "-" +
            CONST.VERSION
        );
        await controller.notionUpdate();
        break;
      case "dynamo-sync":
        await controller.dynamoList();
        console.log(
          "dynamoList updated processing | VER." +
            CONST.API_ENV +
            "-" +
            CONST.VERSION
        );
        await controller.dynamoUpdate();
        break;
      case "discord-meessage":
        console.log(
          "dynamoList updated processing | VER." +
            CONST.API_ENV +
            "-" +
            CONST.VERSION
        );
        console.dir(message);
        await discordService.sendDiscordMessage(
          message.params.message,
          message.params.channelId
        );
        break;
      default:
        console.log(
          "function not found | VER." + CONST.API_ENV + "-" + CONST.VERSION
        );
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("It Works."),
  };
  return response;
};
