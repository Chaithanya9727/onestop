import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  ArrowBack,
  Google,
  GitHub,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider.jsx";

/* ---------------------------------------------
   STEP COMPONENTS (OUTSIDE Register => STABLE)
----------------------------------------------*/

const Step1 = React.memo(function Step1({ role, onPickRole }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Typography variant="h5" fontWeight={700} textAlign="center">
        Create a new account
      </Typography>
      <Typography textAlign="center" sx={{ mb: 3 }} color="text.secondary">
        Choose how you want to get started
      </Typography>

      <Stack direction="row" spacing={2}>
        {[
          { id: "candidate", label: "Candidate", desc: "Apply & learn" },
          { id: "recruiter", label: "Recruiter", desc: "Host & hire" },
        ].map((opt) => (
          <motion.div
            key={opt.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPickRole(opt.id)}
            style={{
              flex: 1,
              padding: "20px",
              borderRadius: "16px",
              cursor: "pointer",
              background:
                role === opt.id
                  ? "linear-gradient(135deg,#667eea,#764ba2)"
                  : "#f5f5ff",
              color: role === opt.id ? "#fff" : "#333",
              boxShadow:
                role === opt.id
                  ? "0 4px 16px rgba(102,126,234,0.5)"
                  : "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {opt.label}
            </Typography>
            <Typography variant="body2">{opt.desc}</Typography>
          </motion.div>
        ))}
      </Stack>
    </motion.div>
  );
});

const Step2 = React.memo(function Step2({
  email,
  otp,
  emailVerified,
  otpSent,
  onBack,
  onChangeEmail,
  onChangeOtp,
  onSendOtp,
  onVerifyOtp,
  loading,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 1 }}>
        Back
      </Button>
      <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
        Verify your email ✉️
      </Typography>

      <TextField
        label="Email"
        value={email}
        onChange={onChangeEmail}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Email color={emailVerified ? "success" : "disabled"} />
            </InputAdornment>
          ),
        }}
      />

      {otpSent ? (
        <>
          <TextField
            label="Enter OTP"
            value={otp}
            onChange={onChangeOtp}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={onVerifyOtp}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Verify Email"}
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={onSendOtp}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Send OTP"}
        </Button>
      )}
    </motion.div>
  );
});

const Step3 = React.memo(function Step3({
  role,
  name,
  phone,
  orgName,
  password,
  confirmPassword,
  agree,
  showPassword,
  onBack,
  onChangeName,
  onChangePhone,
  onChangeOrgName,
  onChangePassword,
  onChangeConfirmPassword,
  onToggleShowPassword,
  onToggleAgree,
  onSubmit,
  loading,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 1 }}>
        Back
      </Button>
      <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
        Complete your profile 👤
      </Typography>

      <TextField
        label="Full Name"
        value={name}
        onChange={onChangeName}
        fullWidth
      />
      <TextField
        label="Phone Number"
        value={phone}
        onChange={onChangePhone}
        fullWidth
        sx={{ mt: 2 }}
      />
      {role === "recruiter" && (
        <TextField
          label="Organization Name"
          value={orgName}
          onChange={onChangeOrgName}
          fullWidth
          sx={{ mt: 2 }}
        />
      )}
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={onChangePassword}
        fullWidth
        sx={{ mt: 2 }}
        InputProps={{
          endAdornment: (
            <IconButton onClick={onToggleShowPassword}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />
      <TextField
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={onChangeConfirmPassword}
        fullWidth
        sx={{ mt: 2 }}
      />

      <FormControlLabel
        sx={{ mt: 1 }}
        control={<Checkbox checked={agree} onChange={onToggleAgree} />}
        label="I agree to the Terms & Privacy Policy"
      />

      <Button variant="contained" onClick={onSubmit} disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={20} /> : "Create Account"}
      </Button>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Stack spacing={1}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={() =>
            (window.location.href = "http://localhost:5000/api/auth/google")
          }
        >
          Continue with Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHub />}
          onClick={() =>
            (window.location.href = "http://localhost:5000/api/auth/github")
          }
        >
          Continue with GitHub
        </Button>
      </Stack>
    </motion.div>
  );
});

const Step4 = React.memo(function Step4() {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Typography variant="h5" textAlign="center">
        🎉 Account Created!
      </Typography>
      <Typography textAlign="center" color="text.secondary">
        Redirecting to login...
      </Typography>
    </motion.div>
  );
});

/* ---------------------------------------------
                 MAIN REGISTER
----------------------------------------------*/

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    orgName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
    agree: false,
  });

  // stable setters (avoid recreating functions each render)
  const set = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    []
  );

  /* ===== Send OTP ===== */
  const sendOtp = useCallback(async () => {
    if (!form.email) return showToast("Please enter your email", "warning");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      showToast("OTP sent to your email ✅", "success");
      setOtpSent(true);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [form.email, showToast]);

  /* ===== Verify OTP ===== */
  const verifyOtp = useCallback(async () => {
    if (!form.otp) return showToast("Enter the OTP sent to your email", "warning");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      showToast("Email verified successfully ✅", "success");
      setEmailVerified(true);
      setStep(3);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [form.email, form.otp, showToast]);

  /* ===== Register ===== */
  const registerUser = useCallback(async () => {
    if (!form.name || !form.phone || !form.password || !form.confirmPassword)
      return showToast("All fields are required", "warning");
    if (form.password !== form.confirmPassword)
      return showToast("Passwords do not match", "error");
    if (!form.agree) return showToast("Please agree to the terms", "warning");

    setLoading(true);
    try {
      const endpoint =
        role === "recruiter" ? "register-recruiter" : "register-candidate";

      const payload =
        role === "recruiter"
          ? {
              name: form.name,
              orgName: form.orgName,
              email: form.email,
              password: form.password,
              mobile: form.phone,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              mobile: form.phone,
            };

      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      showToast("Account created successfully ✅", "success");
      setStep(4);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [form, role, navigate, showToast]);

  /* ===== Callbacks passed to Step2/3 to keep focus ===== */
  const handlers = useMemo(
    () => ({
      onChangeEmail: (e) => set("email", e.target.value),
      onChangeOtp: (e) => set("otp", e.target.value),
      onChangeName: (e) => set("name", e.target.value),
      onChangePhone: (e) => set("phone", e.target.value),
      onChangeOrgName: (e) => set("orgName", e.target.value),
      onChangePassword: (e) => set("password", e.target.value),
      onChangeConfirmPassword: (e) => set("confirmPassword", e.target.value),
    }),
    [set]
  );

  /* ===== UI ===== */
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff, #f7f8ff)",
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "92%",
          maxWidth: 980,
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left side (illustration/progress) */}
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" fontWeight={700} textAlign="center">
            Welcome to <span style={{ color: "#ffb6ec" }}>OneStop Hub</span>
          </Typography>
          <Typography sx={{ mt: 1 }} textAlign="center">
            Host hackathons, hire talent, and manage events.
          </Typography>

          <Box sx={{ width: "80%", mt: 4 }}>
            <LinearProgress
              variant="determinate"
              value={(step / 4) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,0.25)",
                "& .MuiLinearProgress-bar": { backgroundColor: "#fff" },
              }}
            />
            <Typography sx={{ mt: 1, fontWeight: 600, textAlign: "center" }}>
              Step {step} of 4
            </Typography>
          </Box>
        </Box>

        {/* Right side (form) */}
        <Box
          sx={{
            flex: 1,
            background: "#fff",
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step === 1 && (
            <Step1 role={role} onPickRole={(id) => { setRole(id); setStep(2); }} />
          )}

          {step === 2 && (
            <Step2
              email={form.email}
              otp={form.otp}
              emailVerified={emailVerified}
              otpSent={otpSent}
              onBack={() => setStep(1)}
              onChangeEmail={handlers.onChangeEmail}
              onChangeOtp={handlers.onChangeOtp}
              onSendOtp={sendOtp}
              onVerifyOtp={verifyOtp}
              loading={loading}
            />
          )}

          {step === 3 && (
            <Step3
              role={role}
              name={form.name}
              phone={form.phone}
              orgName={form.orgName}
              password={form.password}
              confirmPassword={form.confirmPassword}
              agree={form.agree}
              showPassword={showPassword}
              onBack={() => setStep(2)}
              onChangeName={handlers.onChangeName}
              onChangePhone={handlers.onChangePhone}
              onChangeOrgName={handlers.onChangeOrgName}
              onChangePassword={handlers.onChangePassword}
              onChangeConfirmPassword={handlers.onChangeConfirmPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              onToggleAgree={(e) => set("agree", e.target.checked)}
              onSubmit={registerUser}
              loading={loading}
            />
          )}

          {step === 4 && <Step4 />}
        </Box>
      </Box>
    </Box>
  );
}
