import JsGoogleTranslateFree from "@kreisler/js-google-translate-free";

export async function translateGoogle(text, lang) {
    try {
        const from = "en";
        const to = lang;
        const translation = await JsGoogleTranslateFree.translate({ from, to, text });
        return translation;
      } catch (error) {
        console.error(error);
      }
}