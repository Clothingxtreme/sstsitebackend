# Sen-ScryptTech Backend

Node.js backend for Sen-ScryptTech inquiry and consultation forms. Deploy this folder as the service root on Northflank.

## Northflank

- Service root: `Backend`
- Start command: `npm start`
- Port: `8080`
- Health check path: `/health`

## Docker

If Northflank is connected to the backend repository, use:

- Build context: `/`
- Dockerfile location: `/Dockerfile`
- Port: `8080`
- Health check path: `/health`

## Environment Variables

Set these in Northflank:

```env
PORT=8080
HOST=0.0.0.0
ALLOWED_ORIGINS=https://senscrypt.tech,https://www.senscrypt.tech
SMTP_HOST=mail.senscrypt.tech
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailbox@senscrypt.tech
SMTP_PASS=your-mailbox-password
SMTP_FROM=your-mailbox@senscrypt.tech
CONTACT_TO_EMAIL=your-mailbox@senscrypt.tech
```

If your mail server requires SSL on port `465`, use:

```env
SMTP_PORT=465
SMTP_SECURE=true
```
