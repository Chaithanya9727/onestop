import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, Stack, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PlayArrow, Pause, VolumeUp, VolumeOff } from "@mui/icons-material";

export default function Home() {
  const navigate = useNavigate();
  const lightRef = useRef(null);
  const flareRef = useRef(null);
  const videoRef = useRef(null);
  const welcomeAudioRef = useRef(null);
  const glowRef = useRef(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ✅ Welcome sound + cinematic glow
  useEffect(() => {
    const audio = new Audio("/sounds/welcome.mp3"); // make sure file exists in /public/sounds/
    audio.volume = 0.35;
    welcomeAudioRef.current = audio;

    const triggerGlow = () => {
      if (!glowRef.current) return;
      glowRef.current.style.opacity = "1";
      glowRef.current.style.transform = "scale(1.3)";
      setTimeout(() => {
        glowRef.current.style.opacity = "0";
        glowRef.current.style.transform = "scale(1)";
      }, 1200);
    };

    const tryPlay = async () => {
      try {
        await audio.play();
        console.log("✅ Welcome sound played automatically");
        triggerGlow();
      } catch {
        console.warn("Autoplay blocked — waiting for user interaction...");
        const playOnUserAction = async () => {
          try {
            await audio.play();
            console.log("🎵 Welcome sound triggered by user interaction");
            triggerGlow();
            document.removeEventListener("click", playOnUserAction);
            document.removeEventListener("touchstart", playOnUserAction);
          } catch (err) {
            console.error("Still blocked:", err);
          }
        };
        document.addEventListener("click", playOnUserAction, { once: true });
        document.addEventListener("touchstart", playOnUserAction, { once: true });
      }
    };

    tryPlay();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // 🌀 Parallax + Glow + Lens Flare + Video Motion
  useEffect(() => {
    const onMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (clientX == null || clientY == null) return;

      setMousePosition({ x: clientX, y: clientY });

      const px = (clientX / window.innerWidth - 0.5) * 40;
      const py = (clientY / window.innerHeight - 0.5) * 40;

      if (lightRef.current) {
        lightRef.current.style.left = `${clientX}px`;
        lightRef.current.style.top = `${clientY}px`;
      }

      if (flareRef.current) {
        const offsetX = (clientX / window.innerWidth - 0.5) * 60;
        const offsetY = (clientY / window.innerHeight - 0.5) * 30;
        flareRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX / 5}deg)`;
      }

      if (videoRef.current) {
        const rotateY = (clientX / window.innerWidth - 0.5) * 2;
        const rotateX = -(clientY / window.innerHeight - 0.5) * 2;
        videoRef.current.style.transform = `
          translate(${px / 8}px, ${py / 8}px)
          scale(1.05)
          rotateY(${rotateY}deg)
          rotateX(${rotateX}deg)
        `;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });

    const video = videoRef.current;
    if (video) {
      video.oncanplaythrough = () => {
        video.classList.add("loaded");
        setTimeout(() => (video.style.opacity = "1"), 300);
      };
    }

    createFloatingParticles();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  const createFloatingParticles = () => {
    const container = document.getElementById("floating-particles");
    if (!container) return;
    const total = 15;
    for (let i = 0; i < total; i++) {
      const p = document.createElement("div");
      p.className = "floating-particle";
      p.style.cssText = `
        position:absolute;
        width:${Math.random() * 6 + 2}px;
        height:${Math.random() * 6 + 2}px;
        background:rgba(255,255,255,${Math.random() * 0.4 + 0.1});
        border-radius:50%;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation:float ${Math.random() * 20 + 10}s infinite ease-in-out;
        animation-delay:${Math.random() * 5}s;
        filter:blur(${Math.random() * 2}px);
      `;
      container.appendChild(p);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    isVideoPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsVideoPlaying(!isVideoPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    if (welcomeAudioRef.current) {
      welcomeAudioRef.current.muted = newMuteState;
    }
    setIsMuted(newMuteState);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        backgroundColor: "#000",
        perspective: "1000px",
      }}
    >
      {/* 🎬 Background Video */}
      <video
        ref={videoRef}
        id="bg-video"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          objectFit: "cover",
          zIndex: -3,
          opacity: 0,
          transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
          filter: "brightness(0.7) contrast(1.2) saturate(1.3)",
        }}
      >
        <source src="/Home.mp4" type="video/mp4" />
      </video>

      {/* 🌈 Welcome Glow (cinematic flash) */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "radial-gradient(circle at center, rgba(108,99,255,0.25), rgba(255,51,102,0.15), transparent 80%)",
          filter: "blur(80px)",
          opacity: 0,
          transform: "scale(1)",
          transition: "all 1s ease-out",
          pointerEvents: "none",
        }}
      ></div>

      {/* ✨ Cursor Glow */}
      <div
        ref={lightRef}
        style={{
          position: "absolute",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(100,200,255,0.25) 0%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          transition: "all 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
          mixBlendMode: "screen",
        }}
      ></div>

      {/* 🌌 Floating Particles */}
      <Box id="floating-particles" sx={{ position: "absolute", inset: 0, zIndex: -1 }} />

      {/* 🎮 Video Controls */}
      <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 10, display: "flex", gap: 1 }}>
        <IconButton
          onClick={toggleVideoPlayback}
          sx={{
            color: "white",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": { background: "rgba(255,255,255,0.2)", transform: "scale(1.1)" },
          }}
        >
          {isVideoPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton
          onClick={toggleMute}
          sx={{
            color: "white",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": { background: "rgba(255,255,255,0.2)", transform: "scale(1.1)" },
          }}
        >
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Box>

      {/* 💎 Floating Hero Content */}
      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          zIndex: 2,
          maxWidth: 900,
          width: "90%",
          mx: "auto",
          animation: "glassAppear 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div
          ref={flareRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "350px",
            height: "80px",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.25), rgba(0,0,0,0) 70%)",
            mixBlendMode: "screen",
            filter: "blur(40px)",
            zIndex: -1,
            transition: "transform 0.2s ease-out",
          }}
        />

        <Typography
          variant="h1"
          fontWeight="900"
          sx={{
            mb: 3,
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
            background:
              "linear-gradient(135deg,#FFFFFF,#A8F7FF,#8CE3FF,#CBE8FF,#FFFFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(168,247,255,0.6)",
          }}
        >
          OneStop Smart Campus
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 6,
            color: "rgba(255,255,255,0.9)",
            fontWeight: 300,
            maxWidth: 700,
            mx: "auto",
            lineHeight: 1.7,
            textShadow: "0 0 20px rgba(0,255,255,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          Experience the future of campus life with our immersive digital ecosystem.
          Connecting candidates, mentors, and administrators through cutting-edge
          technology and elegant design.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center" spacing={3}>
          <AdvancedGlassButton
            label="Launch Experience"
            onClick={() => navigate("/login")}
            gradient="linear-gradient(135deg, #667eea, #764ba2)"
            glowColor="rgba(100,200,255,0.8)"
          />
          <AdvancedGlassButton
            label="Explore Campus"
            onClick={() => navigate("/contact")}
            gradient="linear-gradient(135deg, #f093fb, #f5576c)"
            glowColor="rgba(255,255,255,0.6)"
          />
        </Stack>
      </Box>

      <style jsx>{`
        @keyframes glassAppear {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
}

/* ⚡ Button Component */
function AdvancedGlassButton({ label, onClick, glowColor, gradient }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variant="text"
      disableRipple
      sx={{
        position: "relative",
        overflow: "hidden",
        px: 6,
        py: 2.2,
        fontSize: "1.1rem",
        fontWeight: 700,
        borderRadius: "35px",
        textTransform: "none",
        color: "rgba(255,255,255,0.95)",
        letterSpacing: "0.8px",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
        border: "1.5px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(25px) saturate(180%)",
        boxShadow: `
          inset 0 0 25px rgba(255,255,255,0.1),
          0 8px 40px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.1)
        `,
        transform: hovered ? "translateY(-4px) scale(1.05)" : "translateY(0)",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "35px",
          padding: "2px",
          background: gradient,
          opacity: hovered ? 1 : 0,
          filter: `blur(${hovered ? 15 : 0}px)`,
          transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        },
        "&:hover": {
          color: "#fff",
          boxShadow: `
            inset 0 0 30px rgba(255,255,255,0.2),
            0 12px 50px rgba(0,0,0,0.3),
            0 0 40px ${glowColor}
          `,
        },
      }}
    >
      {label}
    </Button>
  );
}
