import React from "react";
// image
import AudioFileIcon from "../icons/attachment/audio-icon.png";
// import AudioFileIcon from "@/public/attachment/audio-icon.png";
import { Image } from "react-bootstrap";

export type AudioIconProps = {
  width?: number;
  height?: number;
};

export const AudioIcon: React.FC<AudioIconProps> = ({ width, height }) => (
  <Image src={AudioFileIcon} height={height} width={width} alt="AudioFileIcon" />
);
