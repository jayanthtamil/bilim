import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaFile } from "types";
import { RootState } from "redux/types";
import { uploadFiles, clearFile, addFiles, removeFiles, openDialog } from "redux/actions";
import { createUUID, validateFile } from "utils";

export type UploadMediaChangeEvent = CustomChangeEvent<MediaFile | undefined>;

export interface UploadMediaProps {
  elementId: string;
  name: string;
  data?: MediaFile | null;
  isLinked?: boolean;
  onChange?: (event: UploadMediaChangeEvent) => void;
}

export function useUploadMedia(props: UploadMediaProps) {
  const { elementId, name, data, isLinked = false, onChange } = props;
  const [uploadId, setUploadId] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const files = useSelector((state: RootState) => state.course.file.files.uploaded);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const updateChange = useCallback(
    (value?: MediaFile) => {
      if (data && !isLinked) {
        dispatch(removeFiles([data]));
      }

      if (onChange) {
        onChange({ target: { name, value } });
      }
    },
    [name, data, isLinked, onChange, dispatch]
  );

  useEffect(() => {
    if (uploadId) {
      const medias = files[uploadId];

      if (medias) {
        const [media] = medias;

        if (media) {
          updateChange(media);
          setUploadId(undefined);
          dispatch(clearFile(uploadId));
          dispatch(addFiles([media]));
        }
      }
    }
  }, [uploadId, files, updateChange, dispatch]);

  const startUpload = (file: File) => {
    const id = createUUID();

    dispatch(uploadFiles(id, elementId, [file]));
    setUploadId(id);
  };

  const browseMedia = (event: MouseEvent) => {
    if (fileRef.current) {
      let file = fileRef.current;
      file.click();
      file.value = "";
    }
  };

  const uploadMedia = (files: FileList | null) => {
    if (files && files.length !== 0) {
      const file = files[0];

      try {
        validateFile(file);
        startUpload(file);
      } catch (error) {
        dispatch(openDialog(t("alert.warning"), (error as Error).message));
      }
    }
  };

  const deleteMedia = () => {
    updateChange();
  };

  return { fileRef, browseMedia, uploadMedia, deleteMedia };
}
