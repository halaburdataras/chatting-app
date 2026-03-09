"use client";

import { useDropzone } from "react-dropzone";
import { useToast } from "../providers/toast-provider";
import { ToastType } from "../types";
import { cn } from "@repo/shared/utils";
import Image from "next/image";
import Button from "./button";
import { useCallback, useMemo } from "react";

type AvatarInputProps = {
  initialImage: File | string | null | undefined;
  onImageChange: (image: File | null) => void;
  fallbackImage?: string;
};

export default function AvatarInput({
  initialImage,
  onImageChange,
  fallbackImage,
}: AvatarInputProps) {
  const { showToast } = useToast();

  const {
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxSize: 1024 * 1024 * 5,
    maxFiles: 1,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    onDropAccepted: (acceptedFiles) => {
      onImageChange(acceptedFiles[0] || null);
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      showToast(
        rejection?.errors[0]?.message || "File is invalid",
        ToastType.ERROR,
      );
    },
  });

  const rootProps = useMemo(() => getRootProps(), [getRootProps]);

  const handleRemoveImage = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  const imageUrl = useMemo(() => {
    if (initialImage) {
      if (typeof initialImage === "string") {
        return initialImage;
      }

      return URL.createObjectURL(initialImage as File);
    }
    return fallbackImage || "/images/user-empty-avatar.svg";
  }, [initialImage, fallbackImage]);

  return (
    <div className="flex gap-4 items-center">
      <div
        {...rootProps}
        className={cn(
          "border rounded-full border-white overflow-hidden transition-colors duration-200 w-[100px] h-[100px] cursor-pointer hover:border-slate-700",
          isDragActive && "border-blue-400",
          isDragAccept && "border-green-400",
          isDragReject && "border-red-400",
        )}
      >
        <input {...getInputProps()} hidden />
        <Image
          alt="Avatar"
          src={imageUrl}
          width={100}
          height={100}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1 grid gap-3">
        <Button className="w-fit" onClick={rootProps.onClick}>
          Change Image
        </Button>
        <p className="text-sm text-gray-500">
          * File requirements: 5MB max, JPG, PNG, GIF, WEBP.
        </p>
      </div>

      <Button onClick={handleRemoveImage} variant="error">
        Delete Image
      </Button>
    </div>
  );
}
