import http.server
import socketserver
import os

os.chdir('/workspace')
PORT = 8080

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Защитные HTTP-заголовки
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
        super().end_headers()
    
    def do_GET(self):
        # Блокировка доступа к чувствительным файлам
        if self.path.startswith('/.git') or self.path.endswith('.env') or self.path.endswith('.log'):
            self.send_error(403, 'Forbidden')
            return
        super().do_GET()

Handler = SecureHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Secure server running at http://localhost:{PORT}/")
    httpd.serve_forever()
