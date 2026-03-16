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
    // Deploy Next.js app to AWS Lambda@Edge via CloudFront
    const site = new sst.aws.Nextjs("StratosSite", {
      // Uncomment and set your domain when ready
      // domain: {
      //   name: "stratosstrat.com",
      //   dns: sst.aws.dns(),
      //   redirects: ["www.stratosstrat.com"]
      // },

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
        architecture: "arm64"
      }
    });

    return {
      url: site.url
    };
  }
});
