import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendDeploymentEmail(
  to: string,
  appName: string,
  ipAddress: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Your ${appName} deployment is ready!`,
    html: `
      <h2>🚀 Deployment Successful</h2>
      <p>Your <strong>${appName}</strong> instance has been deployed to CloudStack.</p>
      <p>IP Address: <code>${ipAddress}</code></p>
      <p>You can access your instance at: <a href="http://${ipAddress}">http://${ipAddress}</a></p>
    `,
  })
}

export async function sendWelcomeEmail(to: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Welcome to CloudStack Marketplace!',
    html: `
      <h2>Welcome to CloudStack Marketplace 🎉</h2>
      <p>Your account has been created successfully.</p>
      <p>Start exploring apps and deploy to your CloudStack environment.</p>
    `,
  })
}
