import React from "react";
import { Modal as BootstrapModal } from "react-bootstrap";

type ModalProps = {
  show: boolean;
  handleClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl";
  headerClassName?: string;
  bodyClassName?: string;
  headerTitleClassName?: string;
  footerClassName?: string;
  footerContent?: React.ReactNode;
  animation?: boolean;
  centered?: boolean;
  modalClass?: string;
};

export const Modal: React.FC<ModalProps> = ({
  show,
  handleClose,
  title,
  children,
  size = "lg",
  modalClass = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  headerTitleClassName = "",
  footerContent,
  animation = true,
  centered = true,
}) => {
  return (
    <BootstrapModal
      show={show}
      onHide={handleClose}
      animation={animation}
      size={size}
      centered={centered}
      aria-labelledby="modal-title"
      className={modalClass}
    >
      {/* {title && (
        
      )} */}
      <BootstrapModal.Header closeButton className={headerClassName}>
        <BootstrapModal.Title className={headerTitleClassName} id="modal-title">
          {title}
        </BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body className={bodyClassName}>
        {children}
      </BootstrapModal.Body>
      {footerContent && (
        <BootstrapModal.Footer className={footerClassName}>
          {footerContent}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};
