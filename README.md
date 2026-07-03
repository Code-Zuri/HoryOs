# App del Clima (HoryOs)

Programa web simple que consulta la API de OpenWeather que muestra el clima por ubicación y ciudad.

Uso:

- Abrir `index.html` en el navegador (doble clic) o servir con un servidor local:       

Nota: la API key está incluida directamente en `app.js` para demostración.

Geolocalización automática:

- La app intentará obtener la ubicación del dispositivo al cargar la página y mostrará el reporte del clima automáticamente si el usuario concede permiso.
- Si el permiso se deniega o hay un error, se puede usar el formulario de búsqueda para consultar una ciudad manualmente.

Seguridad de la API key:

- Para producción, evita incluir la API key en código cliente. Usa un proxy/backend que oculte la clave.

