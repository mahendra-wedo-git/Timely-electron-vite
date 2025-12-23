import React from "react";
// image
// import ZipFileIcon from "@/public/attachment/zip-icon.png";
import ZipFileIcon from "../icons/attachment/zip-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const ZipIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={ZipFileIcon} height={height} width={width} alt="ZipFileIcon" />
);
