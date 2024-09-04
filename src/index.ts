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
      case "discord-message":
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
      case "nft-getkey":
        console.log("NFT| GETKEY." + CONST.API_ENV + "-" + CONST.VERSION);
        console.dir(message);

        const response = await fetch("https://nft.bon-soleil.com/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();

        await discordService.sendDiscordMessage(
          message.params.eoa + ":" + message.params.nftInfo + data,
          "1145185184543686776"
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
