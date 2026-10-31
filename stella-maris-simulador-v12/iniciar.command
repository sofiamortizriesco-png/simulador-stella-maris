#!/bin/bash
cd -- "$(dirname -- "$0")"
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Necesitas Python 3 para iniciar el servidor. También puedes publicar esta carpeta en GitHub Pages.'
  read -r -p 'Presiona Enter para cerrar.'
  exit 1
fi
python3 abrir.py
