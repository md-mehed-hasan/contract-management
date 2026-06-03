import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number.parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

function fromAddress() {
  return process.env.EMAIL_USER || 'no-reply@soas.com';
}

export async function sendContractEmail(to, name, documentName, signLink, expiryDate, customMessage = '') {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: fromAddress(),
    to,
    subject: `[SOAS] Please sign your contract: ${documentName}`,
    html: `
      <p>Dear ${name},</p>
      <p>You have been requested to sign a contract: <strong>${documentName}</strong>.</p>
      <p><a href="${signLink}">Review and sign your contract</a></p>
      <p>This link will expire on ${expiryDate}.</p>
      ${customMessage ? `<p><strong>Custom message from admin:</strong><br>${customMessage}</p>` : ''}
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br>SOAS Pte. Ltd.</p>
    `
  });
}

export async function sendSignedConfirmation(to, name, documentName, signedPdfUrl, signedPdfBuffer) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: fromAddress(),
    to,
    subject: `[SOAS] Contract signed successfully - ${documentName}`,
    html: `
      <p>Dear ${name},</p>
      <p>Thank you for signing the contract: <strong>${documentName}</strong>.</p>
      <p>You can download it anytime using: <a href="${signedPdfUrl}">${signedPdfUrl}</a></p>
      <p>Best regards,<br>SOAS Pte. Ltd.</p>
    `,
    attachments: signedPdfBuffer
      ? [{ filename: `signed-${documentName.replace(/\.[^.]+$/, '')}.pdf`, content: signedPdfBuffer, contentType: 'application/pdf' }]
      : []
  });
}

export async function sendAdminNotification(adminEmail, clientName, documentName, signedDate, signedPdfUrl) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: fromAddress(),
    to: adminEmail,
    subject: `Contract signed - ${clientName} signed ${documentName}`,
    html: `
      <p>A contract has been signed:</p>
      <p>Client: ${clientName}<br>Document: ${documentName}<br>Signed Date: ${signedDate}</p>
      <p>View the signed document: <a href="${signedPdfUrl}">${signedPdfUrl}</a></p>
    `
  });
}
