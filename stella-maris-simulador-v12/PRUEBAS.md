# Validación realizada

Pruebas ejecutadas en Chromium, con WebGL activo:

- Fecha objetivo: UTC y elevación/azimut contrastados con los cálculos previos.
- Un rayo desde el centro de la imagen de la estrella atraviesa el hueco; otro desde la sombra contigua intersecta el metal.
- Dibujo SVG importado como placa con hueco geométrico.
- Archivo Rhino 3DM real de ensayo: 350 × 320 × 700 mm convertido a 0,35 × 0,32 × 0,70 m.
- Importación de archivos GLB, STL y OBJ de ensayo.
- Importación y reapertura de un entorno 3DM conservando el origen.
- Modificación de coordenadas y orientación, duplicación.
- Guardado de cuatro objetos y reapertura conservando fuentes y transformaciones.
- Sol bajo el horizonte y retorno a la fecha objetivo.
- Exportación de captura PNG.
- Interfaz móvil de 390 píxeles de ancho, sin desbordamiento horizontal.
- Sin errores de JavaScript ni solicitudes locales fallidas durante las pruebas.

Pruebas adicionales de la corrección:

- Seis bancas, cuatro con el eje largo paralelo al borde de referencia y dos interiores transversales.
- Cámara Street View: azimut 177,75925°; sol relativo −107,81787°.
- Guía solar centrada en la cámara tras cambiar de vista, sin desplazamiento angular por traslación.
- Vista Sol alineada con el azimut solar.
- Planta y brújula con norte arriba.
- Edición del azimut de una banca conservada en los datos del proyecto.
- Referencia aérea disponible en el visor.

Esto valida el funcionamiento del software con archivos de ensayo. No valida las medidas del lugar, archivos Rhino aún no entregados ni un resultado físico de fabricación.

## Prototipo aportado prueba.3dm

Carga automática del archivo real, unidades originales en mm, dimensiones renderizadas verificadas (0,03996 × 0,00839 × 0,13000 m), cambio de escala a 10, reapertura de copia automática sin duplicados y reapertura de Prueba.stella con escala original. Sin errores JavaScript.

## Cuerpo y calado corregidos

Mallas cerradas: 0 bordes abiertos tras unificar vértices. Altura renderizada 1,30003 m, ancho 0,39961 m, espesor 0,07436 m. Rayos perpendiculares atraviesan G, I y acento sin intersecciones; intersectan las caras anterior y posterior en el cuerpo y en el centro sólido de A. Carga automática, no duplicación, reapertura y copia automática probadas con el archivo real; sin errores JavaScript.
