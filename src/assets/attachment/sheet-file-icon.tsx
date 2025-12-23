import React from "react";
// image
// import SheetFileIcon from "@/public/attachment/excel-icon.png";
import SheetFileIcon from "../icons/attachment/excel-icon.png";
import { Image } from "react-bootstrap";
import { ImageIconPros } from "../types";
// type

export const SheetIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={SheetFileIcon} height={height} width={width} alt="SheetFileIcon" />
);
