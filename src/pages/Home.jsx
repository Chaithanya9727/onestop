import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Stack,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material"
import { Link as ScrollLink } from "react-scroll"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import SchoolIcon from "@mui/icons-material/School"
import SecurityIcon from "@mui/icons-material/Security"
import PeopleIcon from "@mui/icons-material/People"
import FolderIcon from "@mui/icons-material/Folder"
import './styles.css'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <Box sx={{ width: "100%", overflowX: "hidden", color: "#fff" }}>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/bgvid.mp4" type="video/mp4" />
      </video>

      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          px: 4,
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ letterSpacing: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            🎓 OneStop
          </Typography>

          <Stack direction="row" spacing={3}>
            <ScrollLink to="home" smooth duration={500}>
              <Button color="inherit">Home</Button>
            </ScrollLink>
            <ScrollLink to="about" smooth duration={500}>
              <Button color="inherit">About</Button>
            </ScrollLink>
            <ScrollLink to="features" smooth duration={500}>
              <Button color="inherit">Features</Button>
            </ScrollLink>
            <ScrollLink to="contact" smooth duration={500}>
              <Button color="inherit">Contact</Button>
            </ScrollLink>
            {!user ? (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/login")}
                  sx={{ borderRadius: "20px" }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    background: "linear-gradient(90deg, #ff4081, #f50057)",
                  }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            textShadow: "3px 3px 10px rgba(0,0,0,0.8)",
          }}
        >
          Welcome to OneStop
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 4, maxWidth: "700px", textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
        >
          Your one-stop platform for Notes, Tutorials, Resources, and Smarter
          Learning 🚀
        </Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, #42a5f5, #1976d2)",
              px: 4,
            }}
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
          <ScrollLink to="about" smooth duration={500}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#fff",
                color: "#fff",
                px: 4,
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
            >
              Learn More
            </Button>
          </ScrollLink>
        </Stack>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: 12, background: "rgba(0,0,0,0.75)" }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            About Us
          </Typography>
          <Typography align="center" sx={{ maxWidth: "700px", mx: "auto" }}>
            OneStop is a collaborative platform designed for students,
            teachers, and professionals to access quality learning materials.
            Our mission is to make education more accessible, engaging, and
            modern with role-based access and smart tools. 📚
          </Typography>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, background: "rgba(255,255,255,0.1)" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Features
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 40, color: "#42a5f5" }} />,
                title: "Easy Learning",
                desc: "Get instant access to notes, tutorials, and curated content.",
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 40, color: "#f50057" }} />,
                title: "Secure Authentication",
                desc: "Stay protected with role-based login and JWT security.",
              },
              {
                icon: <FolderIcon sx={{ fontSize: 40, color: "#66bb6a" }} />,
                title: "Resource Management",
                desc: "Upload, share, and organize your resources seamlessly.",
              },
              {
                icon: <PeopleIcon sx={{ fontSize: 40, color: "#ffa726" }} />,
                title: "Community Driven",
                desc: "Collaborate with peers, mentors, and admins effectively.",
              },
            ].map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  sx={{
                    height: "100%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    textAlign: "center",
                    borderRadius: 3,
                    p: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-8px)", boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    {f.icon}
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contact" sx={{ py: 12, background: "rgba(0,0,0,0.85)" }}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
          <Typography sx={{ mb: 1 }}>📧 Onestophub</Typography>
          <Typography>📍 Hyderabad, India</Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          background: "rgba(0,0,0,0.9)",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} OneStop — All Rights Reserved
        </Typography>
      </Box>
    </Box>
  )
}
