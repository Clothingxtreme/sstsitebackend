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
SMTP_PORT=465
SMTP_SECURE=true
SMTP_REJECT_UNAUTHORIZED=false
SMTP_USER=your-mailbox@senscrypt.tech
SMTP_PASS=your-mailbox-password
SMTP_FROM=your-mailbox@senscrypt.tech
CONTACT_TO_EMAIL=your-mailbox@senscrypt.tech
```

The current `mail.senscrypt.tech` server responds on port `465`. Port `587` may be closed, so use SSL mode unless the mail server configuration changes.

If CyberPanel has a valid production SSL certificate for `mail.senscrypt.tech`, remove this line or set it to `true`:

```env
SMTP_REJECT_UNAUTHORIZED=true
```
