import { Button as MuiButton } from "@mui/material";

const Button = ({
  children,
  onClick,
  variant = "contained",
  size = "medium",
  disabled = false,
  type = "button",
  color = "primary",
  sx = {},
  ...props
}) => {
  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      color={color}
      sx={sx}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
