"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
}) => {
  const getConfirmButtonProps = () => {
    if (confirmVariant === "danger") {
      return { variant: "contained", color: "error" };
    }
    return { variant: "contained", color: "primary" };
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>

      <DialogContent>
        <Typography id="confirmation-dialog-description">{message}</Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} {...getConfirmButtonProps()} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
