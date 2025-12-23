import React from "react";
// image
import JpgFileIcon from "../icons/attachment/jpg-icon.png";
// import JpgFileIcon from "@/public/attachment/jpg-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const JpgIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={JpgFileIcon} height={height} width={width} alt="JpgFileIcon" />
);
