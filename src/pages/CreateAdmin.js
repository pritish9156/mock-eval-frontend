import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./CreateAdmin.css";

const CreateAdmin = () => {

  const [mode, setMode] = useState("otp");
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =============================
  // 🔥 POLLING (APPROVAL LINK)
  // =============================
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (step === 3 && mode === "link" && email) {

      const interval = setInterval(async () => {
        try {
          const res = await axios.get(
            `http://localhost:8080/admin/status?email=${email}`,
            { headers: { Authorization: "Bearer " + token } }
          );

          if (res.data.approved === true) {
            clearInterval(interval);

            toast.success("Admin Approved ✅");

            setStep(4);

            setTimeout(() => {
              setStep(1);
              setMode("otp");
              setEmail("");
              setOtp(["","","","","",""]);
            }, 2000);
          }

        } catch {}

      }, 3000);

      return () => clearInterval(interval);
    }

  }, [step, mode, email]);

  // =============================
  // 🔥 SEND REQUEST
  // =============================
  const handleSend = async () => {

    if (!email) return toast.error("Enter email");

    try {
      setLoading(true);

      if (mode === "otp") {
        await axios.post(
          "http://localhost:8080/admin/send-otp",
          { email },
          { headers: { Authorization: "Bearer " + token } }
        );

        toast.success("OTP sent to Super Admin 🔐");
        setStep(2);

      } else {
        await axios.post(
          "http://localhost:8080/admin/send-approval-link",
          { email },
          { headers: { Authorization: "Bearer " + token } }
        );

        toast.success("Approval request sent 📩");
        setStep(3);
      }

    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🔥 OTP INPUT
  // =============================
  const handleOtpChange = (value, index) => {

    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // =============================
  // 🔥 VERIFY OTP
  // =============================
  const handleVerifyOtp = async () => {

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      return toast.error("Enter valid OTP");
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:8080/admin/create-via-otp",
        { email, otp: otpValue },
        { headers: { Authorization: "Bearer " + token } }
      );

      toast.success("Admin created. Reset link sent 📩");

      setStep(4);

      setTimeout(() => {
        setStep(1);
        setMode("otp");
        setEmail("");
        setOtp(["","","","","",""]);
      }, 2000);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ca-container">

      <div className="ca-card">

        <h2 className="ca-title">Create Admin</h2>

        <p className="ca-steps">
          Step {step}
        </p>

        {/* MODE */}
        {step === 1 && (
          <div className="ca-mode">
            <button 
              className={mode === "otp" ? "ca-mode-btn active" : "ca-mode-btn"}
              onClick={() => setMode("otp")}
            >
              OTP
            </button>
            <button 
              className={mode === "link" ? "ca-mode-btn active" : "ca-mode-btn"}
              onClick={() => setMode("link")}
            >
              Approval Link
            </button>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              className="ca-input"
              type="email"
              placeholder="Enter Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <p className="ca-info">
              Request will be sent to Super Admin
            </p>

            <button className="ca-btn" onClick={handleSend} disabled={loading}>
              {loading ? "Sending..." : "Continue →"}
            </button>
          </>
        )}

        {/* STEP 2 OTP */}
        {step === 2 && (
          <>
            <p className="ca-sub">Enter OTP from Super Admin</p>

            <input className="ca-input" value={email} disabled />

            <div className="ca-otp-container">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className="ca-otp-input"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                />
              ))}
            </div>

            <button className="ca-btn" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create 🚀"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="ca-success">
            <p>Waiting for Super Admin approval...</p>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="ca-success">
            <p>Admin Created Successfully ✅</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default CreateAdmin;