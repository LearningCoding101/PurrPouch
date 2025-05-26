import React from "react";
import { Box, Typography, Chip, Paper, Grid, Divider } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RepeatIcon from "@mui/icons-material/Repeat";
import PlaceIcon from "@mui/icons-material/Place";

const DeliveryStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_TRANSIT":
        return "info";
      case "DELIVERED":
        return "success";
      case "FAILED":
        return "error";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Chip
      label={status}
      color={getColor()}
      icon={<LocalShippingIcon />}
      variant="outlined"
    />
  );
};

const DeliveryInfo = ({ delivery, order }) => {
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "Not available";

    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "No address provided";

    const parts = [
      address.streetAddress,
      address.district,
      address.city,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getRecurringText = (order) => {
    if (!order || !order.isRecurring) return "One-time delivery";

    const frequency = order.recurringFrequency.toLowerCase();
    return `Recurring ${frequency} delivery`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle2">Scheduled Delivery:</Typography>
          </Box>
          <Typography variant="body1">
            {formatDate(delivery?.scheduledTime)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocalShippingIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle2">Status:</Typography>
          </Box>
          <DeliveryStatusChip status={delivery?.status || "PENDING"} />
        </Grid>

        {delivery?.status === "DELIVERED" && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="subtitle2">Delivered At:</Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(delivery.deliveredTime)}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PlaceIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle2">Delivery Address:</Typography>
          </Box>
          <Typography variant="body1">
            {formatAddress(delivery?.deliveryAddress)}
          </Typography>
          {delivery?.deliveryAddress?.additionalInfo && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Additional info: {delivery.deliveryAddress.additionalInfo}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RepeatIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle2" sx={{ mr: 1 }}>
              Delivery Schedule:
            </Typography>
            <Typography variant="body1">{getRecurringText(order)}</Typography>
          </Box>

          {order?.isRecurring && order?.preferredDeliveryTime && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Preferred delivery time: {order.preferredDeliveryTime}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DeliveryInfo;
