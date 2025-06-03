import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  getAllUsers,
  getUserDetails,
  updateUserRole,
} from "../../services/adminApi";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [roleUpdateOpen, setRoleUpdateOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(page, rowsPerPage);
      setUsers(response.data.content);
      setTotalUsers(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Mock data for development
      const mockUsers = Array(10)
        .fill()
        .map((_, index) => ({
          id: `USER-${2000 + index}`,
          username: `user${index + 1}`,
          email: `user${index + 1}@example.com`,
          role: ["USER", "ADMIN", "STAFF"][Math.floor(Math.random() * 3)],
          registeredAt: new Date(
            Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastLogin: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          orderCount: Math.floor(Math.random() * 10),
        }));
      setUsers(mockUsers);
      setTotalUsers(100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await getUserDetails(userId);
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Mock data for development
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser({
          ...user,
          fullName: `User ${userId.split("-")[1]}`,
          phone: `(+84) ${Math.floor(Math.random() * 900000000) + 100000000}`,
          addresses: Array(Math.floor(Math.random() * 3) + 1)
            .fill()
            .map((_, index) => ({
              id: `ADDR-${index}`,
              street: `${Math.floor(Math.random() * 100)} Main St`,
              district: ["District 1", "District 2", "District 3"][
                Math.floor(Math.random() * 3)
              ],
              city: "Ho Chi Minh City",
              postalCode: "70000",
              isDefault: index === 0,
            })),
          recentOrders: Array(Math.min(user.orderCount, 5))
            .fill()
            .map((_, index) => ({
              id: `ORD-${3000 + index}`,
              date: new Date(
                Date.now() -
                  Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
              ).toISOString(),
              total: Math.floor(Math.random() * 500000) + 100000,
              status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"][
                Math.floor(Math.random() * 4)
              ],
            })),
        });
      }
    }
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateRole = (userId, currentRole) => {
    setSelectedUser(users.find((u) => u.id === userId));
    setNewRole(currentRole);
    setRoleUpdateOpen(true);
  };

  const handleRoleChange = (event) => {
    setNewRole(event.target.value);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await updateUserRole(selectedUser.id, newRole);
      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      // For development, just update the UI anyway
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
    }

    setRoleUpdateOpen(false);
    setSelectedUser(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const roleColors = {
    USER: "primary",
    ADMIN: "error",
    STAFF: "success",
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search by ID, Username or Email"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={40} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={roleColors[user.role] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.registeredAt)}</TableCell>
                  <TableCell>{user.orderCount}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(user.id)}
                      sx={{ mr: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUpdateRole(user.id, user.role)}
                    >
                      Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* User Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        User Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>ID:</strong> {selectedUser.id}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Username:</strong> {selectedUser.username}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Email:</strong> {selectedUser.email}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Role:</strong>{" "}
                        <Chip
                          label={selectedUser.role}
                          color={roleColors[selectedUser.role] || "default"}
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body1">
                        <strong>Registered:</strong>{" "}
                        {formatDate(selectedUser.registeredAt)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Last Login:</strong>{" "}
                        {formatDate(selectedUser.lastLogin)}
                      </Typography>
                      {selectedUser.phone && (
                        <Typography variant="body1">
                          <strong>Phone:</strong> {selectedUser.phone}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Addresses
                      </Typography>
                      {selectedUser.addresses &&
                      selectedUser.addresses.length > 0 ? (
                        selectedUser.addresses.map((address) => (
                          <Box
                            key={address.id}
                            sx={{
                              mb: 2,
                              p: 1,
                              bgcolor: "background.paper",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {address.street}, {address.district},{" "}
                              {address.city}, {address.postalCode}
                              {address.isDefault && (
                                <Chip
                                  label="Default"
                                  color="primary"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No addresses found
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Recent Orders
              </Typography>

              {selectedUser.recentOrders &&
              selectedUser.recentOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUser.recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{formatDate(order.date)}</TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={
                                order.status === "DELIVERED"
                                  ? "success"
                                  : order.status === "SHIPPED"
                                  ? "primary"
                                  : order.status === "PROCESSING"
                                  ? "info"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  No recent orders found
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseDetails();
              handleUpdateRole(selectedUser.id, selectedUser.role);
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleUpdateOpen} onClose={() => setRoleUpdateOpen(false)}>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select value={newRole} onChange={handleRoleChange} label="Role">
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
