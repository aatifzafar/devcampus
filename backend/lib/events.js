// Live updates over Server-Sent Events.
// Every open browser tab keeps one connection; when something changes the
// server sends a small "what changed" message and the tab re-fetches.
const clients = new Set();

function subscribe(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(': connected\n\n');
  const client = { res, user: req.user };
  clients.add(client);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(ping);
    clients.delete(client);
  });
}

// kind: 'store' | 'state:<key>' | 'rooms'
function broadcast(kind, data = {}) {
  const msg = `data: ${JSON.stringify({ kind, ...data })}\n\n`;
  for (const c of clients) {
    try {
      c.res.write(msg);
    } catch {
      clients.delete(c);
    }
  }
}

module.exports = { subscribe, broadcast };
