import React from "react";
// image
import PDFFileIcon from "../icons/attachment/pdf-icon.png";
// import PDFFileIcon from "@/public/attachment/pdf-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const PdfIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={PDFFileIcon} height={height} width={width} alt="PDFFileIcon" />
);
