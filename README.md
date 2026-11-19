# Hoja de vida web – Wilson Achagua

Sitio personal con mi hoja de vida, hecho para la **Actividad 4 (Etapa de Transferencia)** del curso
*Introducción a los lenguajes de Internet* de UCompensar. Está publicado gratis con **GitHub Pages**.

🔗 **Sitio en vivo:** https://USUARIO.github.io/hoja-de-vida/

## Páginas

| Archivo            | Contenido                                                       |
|--------------------|-----------------------------------------------------------------|
| `index.html`       | Inicio: avatar interactivo, cifras y accesos a las demás páginas |
| `sobre-mi.html`    | Perfil, tabla de datos personales y barras de habilidades        |
| `experiencia.html` | Línea de tiempo laboral con "Ver más"                            |
| `formacion.html`   | Estudios, anillo de progreso y tabla de asignaturas              |
| `proyectos.html`   | Proyectos con filtros por categoría                              |
| `contacto.html`    | Formulario validado que se envía por GET                         |
| `gracias.html`     | Lee los datos enviados en la URL y muestra un resumen            |
| `404.html`         | Página de error personalizada para GitHub Pages                  |

## Estructura

```
hoja-de-vida/
├── index.html … 404.html   # Una página HTML por sección
├── assets/
│   ├── css/styles.css      # Hoja de estilos externa (compartida)
│   ├── js/main.js          # JavaScript compartido
│   └── img/                # favicon.svg, perfil.svg
├── .nojekyll               # GitHub Pages publica los archivos tal cual
├── .editorconfig
├── .gitignore
└── README.md
```

## Ejecutar en local

Abrir `index.html` con doble clic, o en VS Code usar la extensión **Live Server** (*Go Live*).

## Publicar en GitHub Pages

1. Crear un repositorio público llamado `hoja-de-vida`.
2. Subir los archivos (`git push`).
3. En **Settings → Pages**, elegir *Deploy from a branch*, rama `main`, carpeta `/ (root)` y guardar.
4. En uno o dos minutos el sitio queda en `https://USUARIO.github.io/hoja-de-vida/`.

## Tecnologías

HTML5 · CSS3 (variables, Flexbox, Grid, animaciones, `@media print`) · JavaScript sin librerías · Git · GitHub Pages
