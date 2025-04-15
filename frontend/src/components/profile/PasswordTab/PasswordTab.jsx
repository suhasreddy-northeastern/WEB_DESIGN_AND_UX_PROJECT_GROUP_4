import React from "react";
import PasswordChangeForm from "./PasswordChangeForm";

const PasswordTab = ({
  passwordData,
  errors,
  handlePasswordChange,
  handlePasswordSubmit,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  updating,
}) => {
  return (
    <PasswordChangeForm
      passwordData={passwordData}
      errors={errors}
      handlePasswordChange={handlePasswordChange}
      handlePasswordSubmit={handlePasswordSubmit}
      showCurrentPassword={showCurrentPassword}
      showNewPassword={showNewPassword}
      showConfirmPassword={showConfirmPassword}
      setShowCurrentPassword={setShowCurrentPassword}
      setShowNewPassword={setShowNewPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      updating={updating}
    />
  );
};

export default PasswordTab;