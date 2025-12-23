import React from "react";
// image
// import RarFileIcon from "@/public/attachment/rar-icon.png";
import RarFileIcon from "../icons/attachment/rar-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const RarIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={RarFileIcon} height={height} width={width} alt="RarFileIcon" />
);
