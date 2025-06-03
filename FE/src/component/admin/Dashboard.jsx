import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
} from "@mui/material";
import {
  getOrderAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
} from "../../services/adminApi";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [timeFrame, setTimeFrame] = useState("week");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderRes, revenueRes, customerRes] = await Promise.all([
          getOrderAnalytics(timeFrame),
          getRevenueAnalytics(timeFrame),
          getCustomerAnalytics(timeFrame),
        ]);

        setOrderStats(orderRes.data);
        setRevenueStats(revenueRes.data);
        setCustomerStats(customerRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // Use mock data for development
        setOrderStats({
          total: 125,
          pending: 42,
          processing: 38,
          shipped: 30,
          delivered: 15,
          chart: [
            /* chart data would be here */
          ],
        });

        setRevenueStats({
          total: 15250000,
          average: 122000,
          chart: [
            /* chart data would be here */
          ],
        });

        setCustomerStats({
          total: 78,
          new: 12,
          returning: 66,
          chart: [
            /* chart data would be here */
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <ButtonGroup variant="outlined" aria-label="time frame selection">
          <Button
            onClick={() => setTimeFrame("day")}
            variant={timeFrame === "day" ? "contained" : "outlined"}
          >
            Day
          </Button>
          <Button
            onClick={() => setTimeFrame("week")}
            variant={timeFrame === "week" ? "contained" : "outlined"}
          >
            Week
          </Button>
          <Button
            onClick={() => setTimeFrame("month")}
            variant={timeFrame === "month" ? "contained" : "outlined"}
          >
            Month
          </Button>
          <Button
            onClick={() => setTimeFrame("year")}
            variant={timeFrame === "year" ? "contained" : "outlined"}
          >
            Year
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Order Stats */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Orders" />
            <CardContent>
              <Typography variant="h3" component="div">
                {orderStats?.total || 0}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h6">
                      {orderStats?.pending || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Processing
                    </Typography>
                    <Typography variant="h6">
                      {orderStats?.processing || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipped
                    </Typography>
                    <Typography variant="h6">
                      {orderStats?.shipped || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Delivered
                    </Typography>
                    <Typography variant="h6">
                      {orderStats?.delivered || 0}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Stats */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Revenue" />
            <CardContent>
              <Typography variant="h3" component="div">
                {formatCurrency(revenueStats?.total || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Average Order Value:{" "}
                {formatCurrency(revenueStats?.average || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Stats */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Customers" />
            <CardContent>
              <Typography variant="h3" component="div">
                {customerStats?.total || 0}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      New
                    </Typography>
                    <Typography variant="h6">
                      {customerStats?.new || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Returning
                    </Typography>
                    <Typography variant="h6">
                      {customerStats?.returning || 0}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Recent Orders</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/admin/orders")}
              >
                View All Orders
              </Button>
            </Box>
            {/* We would add a table of recent orders here */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              View all orders in the Orders section
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
