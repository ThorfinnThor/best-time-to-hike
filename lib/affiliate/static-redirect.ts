function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function staticAffiliateRedirectHtml(target: string): string {
  const safe = escapeHtml(target);
  const scriptTarget = JSON.stringify(target).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="refresh" content="0;url=${safe}">
  <link rel="canonical" href="${safe}">
  <title>Opening partner site</title>
</head>
<body>
  <p>Opening the partner site. <a href="${safe}" rel="sponsored nofollow noopener noreferrer">Continue</a>.</p>
  <script>window.location.replace(${scriptTarget});</script>
</body>
</html>`;
}
