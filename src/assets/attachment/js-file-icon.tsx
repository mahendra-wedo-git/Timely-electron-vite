import React from "react";
// image
// import JsFileIcon from "@/public/attachment/js-icon.png";
import JsFileIcon from "../icons/attachment/js-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const JavaScriptIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={JsFileIcon} height={height} width={width} alt="JsFileIcon" />
);
