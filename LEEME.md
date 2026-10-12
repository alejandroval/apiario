# Apiario — registro de arnie

App para Android (Expo / React Native). Los datos se guardan en el teléfono, sin internet.

## Cómo probarla en el celular

1. En el celular Android, instala **Expo Go** desde Google Play.
2. En el computador (con Node.js instalado), descomprime la carpeta y abre una terminal dentro de ella:

   ```
   npm install
   npx expo start
   ```

3. Escanea el código QR que aparece en la terminal con Expo Go.
   El celular y el computador deben estar en la misma red Wi‑Fi.

## Qué incluye

- **Arnie**: 12 arnie con su estado (última visita, regina, telaini, varroa). Cada arnia se puede rinominare.
- **Visita di controllo** (por arnia): data, regina presente/assente/non vista, anno della regina, telaini occupati (max 10), covata opercolata, covata fresca, covata a fuco, telaini di scorte di miele (max 10), scorta di polline, tenuta al favo, presenza di varroa, note. Storico completo, con modifica y eliminación.
- **Trattamenti varroa**: data, prodotto, arnie trattate (tutto l'apiario o alcune), note y **foto dello scontrino** (cámara o galería, con vista ampliada).

## Notas

- Las fotos de los scontrini se guardan dentro de la app, junto con los datos.
- Dentro de Expo Go los datos permanecen mientras no se borre Expo Go ni sus datos. Para una instalación definitiva (APK propio) se genera una compilación con EAS.

## Generar el APK (instalable sin Expo Go)

Necesitas una cuenta gratuita en https://expo.dev. En la carpeta del proyecto:

```
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

La primera vez pregunta si crear el proyecto en Expo (responde que sí) y si generar la clave de firma (sí).
Al terminar (10-20 minutos) entrega un enlace y un QR para descargar el archivo `.apk`.
Ese archivo se puede enviar por WhatsApp o correo; quien lo reciba debe permitir "instalar apps desconocidas" en Android.

Importante: guarda siempre la misma clave de firma (EAS la conserva en tu cuenta). Para actualizar la app de otra persona
sin borrarle los datos, el APK nuevo debe generarse desde la misma cuenta y con el mismo `android.package`
(`app.apiario.registro`, en app.json). Si sube la `version`, también conviene subir `android.versionCode`.
