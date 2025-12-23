import React from "react";
// image
import DocFileIcon from "../icons/attachment/doc-icon.png";
// import DocFileIcon from "@/public/attachment/doc-icon.png";
// type
import type { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";

export const DocIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={DocFileIcon} height={height} width={width} alt="DocFileIcon" />
);
