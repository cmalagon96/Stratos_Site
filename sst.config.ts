/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "stratos-site",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1"
        }
      }
    };
  },
  async run() {
    // P0-02: Set 90-day retention on all CloudWatch log groups to prevent
    // indefinite PII storage from SES failure fallback logs.
    $transform(aws.cloudwatch.LogGroup, (args) => {
      args.retentionInDays ??= 90;
    });

    // -----------------------------------------------------------------------
    // Secrets (set via `sst secret set <Name> <value>`)
    // -----------------------------------------------------------------------
    const secrets = {
      NeonDatabaseUrl: new sst.Secret("NeonDatabaseUrl"),
      StripeSecretKey: new sst.Secret("StripeSecretKey"),
      StripeWebhookSecret: new sst.Secret("StripeWebhookSecret"),
      UpstashRedisRestUrl: new sst.Secret("UpstashRedisRestUrl"),
      UpstashRedisRestToken: new sst.Secret("UpstashRedisRestToken"),
      KeygenAccountId: new sst.Secret("KeygenAccountId"),
      KeygenProductToken: new sst.Secret("KeygenProductToken"),
      ResendApiKey: new sst.Secret("ResendApiKey"),
      PosthogApiKey: new sst.Secret("PosthogApiKey"),
    };

    // -----------------------------------------------------------------------
    // S3 Bucket — product files (installers, templates, reports)
    // -----------------------------------------------------------------------
    // Restrict S3 CORS to known origins. In non-production stages,
    // localhost is included for local development.
    const corsOrigins = [
      "https://stratosstrategies.com",
      "https://www.stratosstrategies.com",
    ];
    if ($app.stage !== "production") {
      corsOrigins.push("http://localhost:3000", "http://localhost:4000");
    }

    const productFiles = new sst.aws.Bucket("ProductFiles", {
      cors: {
        allowHeaders: ["*"],
        allowOrigins: corsOrigins,
        allowMethods: ["GET", "PUT"],
        exposeHeaders: ["ETag"],
        maxAge: "1 day",
      },
    });

    // -----------------------------------------------------------------------
    // SQS Queue — async order fulfillment (license provisioning, email, etc.)
    // -----------------------------------------------------------------------
    const orderFulfillmentDlq = new sst.aws.Queue("OrderFulfillmentDLQ");

    const orderFulfillmentQueue = new sst.aws.Queue("OrderFulfillmentQueue", {
      dlq: {
        queue: orderFulfillmentDlq.arn,
        retry: 3,
      },
    });

    // -----------------------------------------------------------------------
    // Next.js Site — deployed to AWS Lambda@Edge via CloudFront
    // -----------------------------------------------------------------------
    const allSecrets = Object.values(secrets);

    const site = new sst.aws.Nextjs("StratosSite", {
      // Uncomment and set your domain when ready
      // domain: {
      //   name: "stratosstrat.com",
      //   dns: sst.aws.dns(),
      //   redirects: ["www.stratosstrat.com"]
      // },

      // Link all infrastructure resources for type-safe access via sst/node
      link: [...allSecrets, productFiles, orderFulfillmentQueue],

      // Environment variables
      environment: {
        NODE_ENV: "production",
        CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM ?? "",
        CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO ?? "",
      },

      // Build settings
      buildCommand: "npm run build",

      // Server function configuration
      server: {
        // Memory allocation for Lambda
        memory: "1024 MB",
        // Architecture
        architecture: "arm64",
      },
    });

    return {
      url: site.url,
      bucket: productFiles.name,
      queue: orderFulfillmentQueue.url,
    };
  }
});
