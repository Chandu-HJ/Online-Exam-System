import { useNavigate } from "react-router-dom";
import "../styles/CoverPage.css";




function CoverPage() {
    const navigate = useNavigate();

    const handleSignIn = () => {
        localStorage.setItem("isLoggedIn", "true");

        //  notify router
        window.dispatchEvent(new Event("auth-change"));

        navigate("/");
    };



    return (
        <div className="cover-page">
            {/* ===== Background Video ===== */}
            <video
                className="cover-video"
                autoPlay
                muted
                loop
                playsInline
            >
                <source
                    src="https://res.cloudinary.com/djynbhiqd/video/upload/v1766128265/exam-bg_tgbtyi.mp4"
                    type="video/mp4"
                />
            </video>


            {/* ===== Overlay (for readability) ===== */}
            <div className="cover-overlay" />

            {/* ===== Content ===== */}
            <div className="cover-content">
                <div className="cover-card">
                    <h1 className="cover-title">Online Examination System</h1>

                    <p className="cover-quote">
                        Integrity, focus, and fairness define true evaluation.
                    </p>

                    <button className="cover-btn" onClick={handleSignIn}>Sign In</button>
                </div>

                <div className="cover-footer">
                    © 2025 Exam System · Secure · Fair · Reliable
                </div>
            </div>



        </div>
    );
}

export default CoverPage;
