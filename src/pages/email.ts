import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL = 'hello@ihornone.site';
// Desktop: opens the authentic full Gmail inbox with the floating compose popup in the bottom right corner (Photo 2)
const GMAIL_INBOX_COMPOSE_URL = 'https://mail.google.com/mail/u/0/#inbox?compose=new';
const MAILTO_MOBILE_URL = `mailto:${EMAIL}?to=${EMAIL}`;

export const GET: APIRoute = async ({ request }) => {
  const ua = request.headers.get('user-agent') || '';
  const chMobile = request.headers.get('sec-ch-ua-mobile');
  const isMobile =
    chMobile === '?1' ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);

  // Desktop (PC / Linux / Mac / Windows):
  // Redirect directly to the full Gmail inbox view with the floating compose box in the bottom-right corner.
  // Avoids xdg-open OS prompt and avoids the ugly standalone fullscreen view=cm popup.
  if (!isMobile) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${GMAIL_INBOX_COMPOSE_URL}"><style>body{margin:0;background:#FAF1EC;}</style></head><body><script>(function(){try{navigator.clipboard.writeText(${JSON.stringify(EMAIL)});}catch(e){}window.location.replace(${JSON.stringify(GMAIL_INBOX_COMPOSE_URL)});})();</script></body></html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }

  // Mobile: trigger native mailto dispatch with recipient prefilled in Apple Mail / Gmail app
  const mobileHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${MAILTO_MOBILE_URL}"><style>body{margin:0;background:#FAF1EC;}</style></head><body><script>(function(){var u=${JSON.stringify(MAILTO_MOBILE_URL)};var a=document.createElement("a");a.href=u;document.body.appendChild(a);a.click();window.location.replace(u);})();</script></body></html>`;

  return new Response(mobileHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
};
