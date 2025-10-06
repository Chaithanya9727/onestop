// import { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TablePagination,
//   CircularProgress,
//   Alert,
//   TextField,
//   Stack,
//   Button,
//   MenuItem,
// } from "@mui/material";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import useApi from "../hooks/useApi";

// export default function ActivityLogs() {
//   const { role } = useAuth();
//   const { get } = useApi();
//   const navigate = useNavigate();

//   const [logs, setLogs] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // ✅ filters
//   const [search, setSearch] = useState("");
//   const [action, setAction] = useState("all");
//   const [userId, setUserId] = useState("all");
//   const [users, setUsers] = useState([]);

//   const load = async () => {
//     try {
//       setLoading(true);
//       setErr("");

//       const params = new URLSearchParams({
//         page: String(page + 1),
//         limit: String(rowsPerPage),
//         search,
//       });
//       if (action !== "all") params.set("action", action);
//       if (userId !== "all") params.set("user", userId);

//       const data = await get(`/users/audit?${params.toString()}`);
//       const logsArr = Array.isArray(data) ? data : data.logs || [];
//       setLogs(logsArr);
//       setTotal(data.total ?? logsArr.length);

//       if (users.length === 0) {
//         const people = [
//           ...new Map(
//             logsArr
//               .filter((l) => l.performedBy?._id)
//               .map((l) => [l.performedBy._id, l.performedBy])
//           ).values(),
//         ];
//         setUsers(people);
//       }
//     } catch (e) {
//       console.error("Failed to load logs", e);
//       setErr("Failed to load logs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ local filtering fallback (without breaking pagination)
//   const filteredLogs = useMemo(() => {
//     let out = logs;
//     if (action !== "all") out = out.filter((l) => l.action === action);
//     if (userId !== "all") out = out.filter((l) => l.performedBy?._id === userId);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       out = out.filter(
//         (l) =>
//           l.action?.toLowerCase().includes(q) ||
//           l.details?.toLowerCase().includes(q) ||
//           (l.performedBy?.name || "").toLowerCase().includes(q)
//       );
//     }
//     return out;
//   }, [logs, action, userId, search]);

//   useEffect(() => {
//     if (role !== "admin") {
//       navigate("/dashboard");
//     } else {
//       load();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, rowsPerPage]);

//   const handleSearch = () => {
//     setPage(0);
//     load();
//   };

//   const clearFilters = () => {
//     setSearch("");
//     setAction("all");
//     setUserId("all");
//     setPage(0);
//     load();
//   };

//   if (loading) {
//     return (
//       <Box sx={{ p: 4, textAlign: "center" }}>
//         <CircularProgress />
//         <Typography sx={{ mt: 2 }}>Loading Activity Logs...</Typography>
//       </Box>
//     );
//   }

//   if (err) {
//     return (
//       <Box sx={{ p: 4, textAlign: "center" }}>
//         <Alert severity="error">{err}</Alert>
//         <Button variant="outlined" sx={{ mt: 2 }} onClick={load}>
//           Retry
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         📜 Activity Logs
//       </Typography>

//       {/* ✅ Filters */}
//       <Paper sx={{ p: 2, mb: 2 }}>
//         <Stack
//           direction={{ xs: "column", md: "row" }}
//           spacing={2}
//           alignItems={{ xs: "stretch", md: "center" }}
//         >
//           <TextField
//             label="Search logs"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             fullWidth
//           />
//           <TextField
//             select
//             label="Action"
//             value={action}
//             onChange={(e) => {
//               setAction(e.target.value);
//               setPage(0);
//             }}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All</MenuItem>
//             <MenuItem value="CREATE_NOTICE">CREATE_NOTICE</MenuItem>
//             <MenuItem value="UPDATE_NOTICE">UPDATE_NOTICE</MenuItem>
//             <MenuItem value="DELETE_NOTICE">DELETE_NOTICE</MenuItem>
//             <MenuItem value="CREATE_EVENT">CREATE_EVENT</MenuItem>
//             <MenuItem value="UPDATE_EVENT">UPDATE_EVENT</MenuItem>
//             <MenuItem value="DELETE_EVENT">DELETE_EVENT</MenuItem>
//             <MenuItem value="ROLE_CHANGE">ROLE_CHANGE</MenuItem>
//             <MenuItem value="DELETE_USER">DELETE_USER</MenuItem>
//             <MenuItem value="RESET_PASSWORD">RESET_PASSWORD</MenuItem>
//           </TextField>
//           <TextField
//             select
//             label="User"
//             value={userId}
//             onChange={(e) => {
//               setUserId(e.target.value);
//               setPage(0);
//             }}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All</MenuItem>
//             {users.map((u) => (
//               <MenuItem key={u._id} value={u._id}>
//                 {u.name || u.email || u._id}
//               </MenuItem>
//             ))}
//           </TextField>
//           <Button variant="contained" onClick={handleSearch}>
//             🔍 Search
//           </Button>
//           <Button variant="outlined" onClick={clearFilters}>
//             Clear
//           </Button>
//         </Stack>
//       </Paper>

//       {/* ✅ Table + Pagination (kept) */}
//       <Paper sx={{ width: "100%", overflow: "hidden" }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><b>User</b></TableCell>
//               <TableCell><b>Action</b></TableCell>
//               <TableCell><b>Details</b></TableCell>
//               <TableCell><b>Date</b></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredLogs.length > 0 ? (
//               filteredLogs.map((log) => (
//                 <TableRow key={log._id}>
//                   <TableCell>{log.performedBy?.name || "Unknown"}</TableCell>
//                   <TableCell>{log.action}</TableCell>
//                   <TableCell>{log.details}</TableCell>
//                   <TableCell>
//                     {new Date(log.createdAt).toLocaleString()}
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={4} align="center">
//                   No logs found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//         <TablePagination
//           component="div"
//           count={total}
//           page={page}
//           onPageChange={(e, newPage) => setPage(newPage)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRowsPerPage(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//           rowsPerPageOptions={[5, 10, 25]}
//         />
//       </Paper>
//     </Box>
//   );
// }
