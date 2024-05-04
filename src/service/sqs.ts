import { CONST } from "../common/const.js";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: "ap-northeast-1" });

async function sendMessage(messageBody) {
  const params = {
    QueueUrl: CONST.SQS_QUEUE_URL,
    MessageBody: messageBody,
  };
  const command = new SendMessageCommand(params);

  try {
    const data = await sqsClient.send(command);
    console.log("Success, message sent. Message ID:", data.MessageId);
  } catch (err) {
    console.error("Error", err);
  }
}

const sqsService = {
  sendMessage,
};

export default sqsService;
