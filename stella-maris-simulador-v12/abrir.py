"""Serve this folder only on localhost and open the simulator."""
import http.server
import socketserver
import webbrowser
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parent)
http.server.SimpleHTTPRequestHandler.extensions_map.update({'.js':'text/javascript','.wasm':'application/wasm'})
for port in range(8765,8785):
    try:
        server=socketserver.TCPServer(('127.0.0.1',port),http.server.SimpleHTTPRequestHandler)
        break
    except OSError:
        continue
else:
    raise SystemExit('No se encontró un puerto libre entre 8765 y 8784.')
url=f'http://127.0.0.1:{port}'
print(f'Stella Maris: {url}\nMantén esta ventana abierta. Para detener: Ctrl+C.')
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
