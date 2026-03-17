/**
 * Stratos Site — SQS Queue Publisher for Order Fulfillment
 *
 * Publishes Stripe webhook events to the OrderFulfillmentQueue for
 * async processing. The queue is configured in sst.config.ts with
 * a DLQ (3 retries before dead-lettering).
 *
 * In local development (no SQS), falls back to direct processing
 * via the fulfillment handler.
 */
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import type { StripeWebhookEventType } from "@/lib/types/stripe";

export interface FulfillmentMessage {
  eventId: string;
  eventType: StripeWebhookEventType;
  data: Record<string, unknown>;
  created: number;
}

// SST injects the queue URL as a linked resource
const QUEUE_URL = process.env.SST_RESOURCE_OrderFulfillmentQueue;

let sqsClient: SQSClient | null = null;

function getSQSClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient({
      region: process.env.AWS_REGION ?? "us-east-1",
    });
  }
  return sqsClient;
}

/**
 * Publish a webhook event to the fulfillment queue.
 *
 * Uses the Stripe event ID as the SQS deduplication ID for
 * additional idempotency at the queue level.
 *
 * Falls back to direct processing if SQS is not configured
 * (local development).
 */
export async function publishToFulfillmentQueue(
  message: FulfillmentMessage,
): Promise<void> {
  if (!QUEUE_URL) {
    // Local development — process directly
    console.warn(
      "[queue] SQS not configured — processing event directly:",
      message.eventId,
    );
    const { processStripeEvent } = await import("./fulfillment");
    await processStripeEvent(message);
    return;
  }

  const client = getSQSClient();

  await client.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageGroupId: "stripe-webhooks",
      // Use event ID for deduplication (5-minute window in FIFO queues)
      MessageDeduplicationId: message.eventId,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: message.eventType,
        },
      },
    }),
  );

  console.log(
    `[queue] Published event ${message.eventId} (${message.eventType}) to SQS`,
  );
}
