## Empezar proyecto

Primero, haz correr el servidor con:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador.

## Configuración del entorno

1. Crea un archivo `.env.local` en la raíz del proyecto.
2. Copia los siguiente y pegalo en el archivo:
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
3. Genera tus claves en Google reCAPTCHA:
   - Ve a https://www.google.com/recaptcha/admin
   - Registra tu sitio con reCAPTCHA v2 (Checkbox) o reCAPTCHA v3
   - Copia `SITE KEY` y `SECRET KEY`
4. Pega las claves en `.env.local`