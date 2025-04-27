export default ({ env }) => ({
    email: {
      config: {
        provider: 'nodemailer',       // ← tell Strapi to use the Nodemailer driver
        providerOptions: {
          host: env('SMTP_HOST', 'smtp.gmail.com'),
          port: env('SMTP_PORT', 587),
          secure: false,               // true for port 465, false for 587
          auth: {
            user: env('SMTP_USERNAME'),
            pass: env('SMTP_PASSWORD'),
          },
          // you can re-enable debug here if you want:
          // logger: true,
          // debug: true,
        },
        settings: {
          defaultFrom: env('SMTP_USERNAME'),
          defaultReplyTo: env('SMTP_USERNAME'),
        },
      },
    },
  });
  