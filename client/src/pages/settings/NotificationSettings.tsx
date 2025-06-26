import React, { useState } from "react";
import { FormControlLabel, Switch } from "@material-ui/core";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    smsEnabled: false,
  });

  const handleToggle = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.checked,
    });
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={settings.smsEnabled}
          onChange={handleToggle("smsEnabled")}
          color="primary"
        />
      }
      label="SMS Notifications"
    />
  );
};

export default NotificationSettings;
