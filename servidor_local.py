import http.server
import socketserver
import webbrowser
import os

PORT = 5500
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"Servidor iniciado en http://localhost:{PORT}")
webbrowser.open(f"http://localhost:{PORT}/index.html")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")

