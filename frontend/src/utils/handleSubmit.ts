import { showToast } from "./toastUtil";
import { createFileFromPhotoString } from "./convertToFile";
import parse from "html-react-parser";
import { lang } from "../Lang/lang";

export const handleSubmit = async (
  initPosition: { lat: number | null; lon: number | null },
  fileField: { data: File | string; name: string },
  pictureField: { data: File | string; name: string },
  mobilePictureField: { data: File | string; name: string },
  uploadedPhotoCreatedDate: string | null,
  certainty: string | null,
  answerField: string,
  check: boolean,
  contestantName: string,
  mapAccuracy: number | null,
  fileGeoLocationField: { lat: number | null; lon: number | null },
  userObservedPosition: { lat: number | null; lon: number | null },
  apiURL: string,
  currentLanguage: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any
) => {
  type LanguageKeys = keyof typeof lang;

  const language = lang[currentLanguage as LanguageKeys] || lang["fi"];

  let errorMessage = "";

  if (!navigator.onLine) {
    errorMessage += `${language.errorMessages.offline}<br/>`;
  }

  if (!initPosition.lat || !initPosition.lon)
    errorMessage += `${language.errorMessages.position}<br/>`;

  if (
    fileField.data === "" &&
    pictureField.data === "" &&
    mobilePictureField.data === ""
  )
    errorMessage += `${language.errorMessages.pictureField}<br/>`;

  if (!answerField)
    errorMessage += `${language.errorMessages.answerField}<br/>`;

  if (!certainty)
    errorMessage += `${language.errorMessages.evaluteAnswer}<br/>`;

  if (!check) errorMessage += `${language.errorMessages.checkbox}<br/>`;

  if (errorMessage) {
    showToast(
      toast,
      `${language.errorMessages.error}`,
      parse(errorMessage),
      "error"
    );
    return false;
  }

  const currentFileName =
    fileField?.name || pictureField?.name || mobilePictureField?.name;
  const { file: fileData, contentType } = createFileFromPhotoString(
    fileField?.data || pictureField?.data || mobilePictureField?.data,
    currentFileName
  );

  try {
    const preSignedURLResponse = await fetch(
      `${apiURL}/presigned-url/${currentFileName}?contentType=${contentType}`
    );

    const { uploadURL, uuid } = await preSignedURLResponse.json();

    if (fileData instanceof File) {
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: fileData,
        headers: {
          "Content-Type": contentType,
        },
      });
      if (uploadResponse.ok) {
        const objectURL = uploadURL.split("?")[0];

        const data = {
          id: uuid,
          answer: answerField,
          contestantName: contestantName || "",
          certainty: certainty,
          file: objectURL,
          fileDateTime: uploadedPhotoCreatedDate || "",
          fileGeoLocation: [fileGeoLocationField.lon, fileGeoLocationField.lat],
          geoLocation: [initPosition.lon, initPosition.lat],
          geoLocationAccuracy: mapAccuracy,
          userGeoLocation: [
            userObservedPosition.lon,
            userObservedPosition.lat,
          ],
        };

        const postResponse = await fetch(`${apiURL}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (postResponse.status === 201) {
          console.info("Post successful");
          showToast(
            toast,
            language.responseSaved.text,
            `${postResponse.statusText}`,
            "success"
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          console.error(
            "Post failed with status:",
            postResponse.status,
            `Data ${postResponse.statusText}`
          );
          showToast(
            toast,
            `${language.errorMessages.error}`,
            `Tietokannassa ongelmia`,
            "error"
          );
        }
      } else {
        console.error("Upload failed with status:", uploadResponse.status);
        showToast(
          toast,
          `${language.errorMessages.error}`,
          `Lataus epäonnistui${navigator.onLine ? "" : ". " + language.errorMessages.offline}`,
          "error"
        );
      }
    }
  } catch (error) {
    showToast(toast, language.unknownError.title, language.unknownError.text, "error");
    if (error instanceof Error) {
      console.info("Error response: ", error.message);
    } else {
      console.error("Error response", error);
    }
  }
};
