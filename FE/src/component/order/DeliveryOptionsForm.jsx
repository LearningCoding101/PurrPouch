import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const DeliveryOptionsForm = ({ onSubmit }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [deliveryAddress, setDeliveryAddress] = useState({
    streetAddress: "",
    city: "",
    district: "",
    postalCode: "",
    additionalInfo: "",
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format delivery time to LocalTime format (HH:mm:ss)
    const hours = deliveryTime.getHours().toString().padStart(2, "0");
    const minutes = deliveryTime.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:00`;

    onSubmit({
      isRecurring,
      recurringFrequency: isRecurring ? frequency : null,
      preferredDeliveryTime: formattedTime,
      deliveryAddress,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Options
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Delivery Address */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Delivery Address
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="streetAddress"
              label="Street Address"
              value={deliveryAddress.streetAddress}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="city"
              label="City"
              value={deliveryAddress.city}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="district"
              label="District"
              value={deliveryAddress.district}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="postalCode"
              label="Postal Code"
              value={deliveryAddress.postalCode}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="additionalInfo"
              label="Additional Information (optional)"
              multiline
              rows={2}
              value={deliveryAddress.additionalInfo}
              onChange={handleAddressChange}
            />
          </Grid>

          {/* Delivery Time */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Preferred Delivery Time
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Delivery Time"
                value={deliveryTime}
                onChange={(newValue) => setDeliveryTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          {/* Recurring Options */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
              }
              label="Set up recurring delivery"
            />
          </Grid>

          {isRecurring && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Frequency
                </Typography>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="BIWEEKLY">Bi-weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Save Delivery Options
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DeliveryOptionsForm;
