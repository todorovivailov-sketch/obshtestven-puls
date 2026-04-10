// Middleware е деактивиран — OG тагове се обработват от api/og.js чрез vercel.json rewrites
export const config = { matcher: [] }
export default function middleware() {}
