/**
 * SQS Consumer — Order Fulfillment Queue Handler
 *
 * Processes messages from the OrderFulfillmentQueue. Each message
 * contains a Stripe webhook event that needs fulfillment processing.
 *
 * This handler is invoked by SST's Queue subscriber (Lambda trigger).
 * It receives SQS event records, parses them, and delegates to the
 * fulfillment logic.
 *
 * SST wiring (add to sst.config.ts when deploying):
 *   orderFulfillmentQueue.subscribe("app/api/webhooks/stripe/consumer.handler");
 */
import type { SQSEvent, SQSRecord, SQSHandler } from "aws-lambda";
import { processStripeEvent } from "@/lib/stripe/fulfillment";
import type { FulfillmentMessage } from "@/lib/stripe/queue";

/**
 * Lambda handler for SQS messages.
 *
 * Processes each record independently. If a record fails, the SQS
 * partial batch response mechanism will retry just that record
 * (up to the DLQ retry limit of 3).
 */
export const handler: SQSHandler = async (event: SQSEvent) => {
  const failedMessageIds: string[] = [];

  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (err) {
      console.error(
        `[consumer] Failed to process record ${record.messageId}:`,
        err,
      );
      failedMessageIds.push(record.messageId);
    }
  }

  // Report partial failures so SQS retries only the failed messages
  if (failedMessageIds.length > 0) {
    return {
      batchItemFailures: failedMessageIds.map((id) => ({
        itemIdentifier: id,
      })),
    };
  }
};

async function processRecord(record: SQSRecord): Promise<void> {
  const message: FulfillmentMessage = JSON.parse(record.body);

  console.log(
    `[consumer] Processing SQS message ${record.messageId} — event ${message.eventId} (${message.eventType})`,
  );

  await processStripeEvent(message);

  console.log(
    `[consumer] Completed SQS message ${record.messageId}`,
  );
}
