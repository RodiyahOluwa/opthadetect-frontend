// src/LandingPage.tsx
import "./LandingPage.css";
import odLogo from "./assets/Logo.png";
import eyeLogo from "./assets/eye logo.png";

interface Props {
  onEnter: () => void;
  onTeam:  () => void;   // ← add this
}

export default function LandingPage({ onEnter, onTeam }: Props) {
  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-logo" onClick={() => window.scrollTo(0,0)} style={{ cursor: "pointer" }}>
          <img src={odLogo} alt="OpthaDetect" className="logo-img" />
        </div>
        <button className="landing-nav-cta" onClick={onEnter}>
          Clinician Login →
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow"></div>
        <h1 className="hero-title">
          Detect Diabetic Retinopathy
          <br />
          <span className="hero-highlight">Earlier. Smarter. Together.</span>
        </h1>
        <p className="hero-desc">
          OpthaDetect uses deep learning to classify retinal fundus photographs
          for Diabetic Retinopathy and generates Grad-CAM heatmaps that
          highlight clinically relevant regions, giving clinicians a powerful
          second opinion in seconds.
        </p>
        <p className="hero-desc hero-desc--africa">
        Africa faces one of the world’s highest burdens of diabetic retinopathy,
        while retinal screening remains limited outside major urban centres.
        OpthaDetect is designed to support screening in low-resource settings,
        bringing AI-powered detection closer to frontline care.
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={onEnter}>
            Access the Tool
          </button>
          <a href="#how-it-works" className="btn-hero-ghost">
            How it works ↓
          </a>
        </div>
        <div className="hero-disclaimer">
          Prototype tool · Not approved for independent clinical use
        </div>
      </section>

      {/* GLOBAL STATS STRIP */}
      <div className="stats-strip stats-strip--global">
        <div className="stats-strip-inner">
          <div className="stats-strip-label">🌍 Globally</div>
          <div className="stats-strip-stats">
            <div className="stat">
              <span className="stat-number">537M+</span>
              <span className="stat-label">adults living with diabetes worldwide</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">~35%</span>
              <span className="stat-label">of diabetic patients develop retinopathy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">90%</span>
              <span className="stat-label">vision loss preventable with early detection</span>
            </div>
          </div>
        </div>
      </div>
     

        {/* AFRICA STATS STRIP */}
        <div className="stats-strip stats-strip--africa">
          <div className="stats-strip-inner">
            <div className="stats-strip-label">🌍 Africa</div>
            <div className="stats-strip-stats">          {/* ← wraps all 3 stats */}
              <div className="stat">
                <span className="stat-number">47M</span>
                <span className="stat-label">adults projected to have diabetes across Africa by 2045</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">28%</span>
                <span className="stat-label">pooled diabetic retinopathy prevalence reported across East Africa</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">50%</span>
                <span className="stat-label">of patients with untreated proliferative diabetic retinopathy may become legally blind within 5 years</span>
              </div>
            </div>
          </div>
        </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From fundus photo to clinical insight in 3 steps</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">📤</div>
            <div className="step-num">01</div>
            <h3>Upload</h3>
            <p>
              Securely upload a colour retinal fundus photograph along with
              basic patient metadata (name, ID, age, eye).
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-icon">🧠</div>
            <div className="step-num">02</div>
            <h3>Analyse</h3>
            <p>
              A fine-tuned ResNet-50 model classifies the image as DR or No DR
              and generates a Grad-CAM saliency heatmap.
            </p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-icon">📋</div>
            <div className="step-num">03</div>
            <h3>Report</h3>
            <p>
              Download a structured PDF report containing the original image,
              heatmap, confidence score, and patient details.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Built for clinical workflows</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Individual clinician accounts</h3>
            <p>
              Every clinician registers their own account. Scan history is
              private, only the clinician can see their patients' data.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Grad-CAM explainability</h3>
            <p>
              Heatmaps highlight which regions of the retina drove the model's
              decision, supporting clinical reasoning.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>One-click PDF reports</h3>
            <p>
              Generate and download professional reports for every scan,
              ready for patient records or referrals.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗑️</div>
            <h3>Right to erasure (GDPR)</h3>
            <p>
              Clinicians and patients can request deletion of any uploaded scan
              at any time, we make it easy.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVACY SECTION */}
      <section className="section privacy-section" id="privacy">
        <div className="section-label">Data Privacy</div>
        <h2 className="section-title">GDPR &amp; UK Data Protection Compliance</h2>
        <div className="privacy-box">
          <div className="privacy-intro">
            OpthaDetect is committed to protecting the privacy and security of
            patient data in full compliance with the UK GDPR and the Data
            Protection Act 2018.
          </div>

          <div className="privacy-grid">
            <div className="privacy-item">
              <div className="privacy-item-icon">👤</div>
              <div>
                <strong>Access control</strong>
                <p>
                  Only the clinician or medical professional who uploads a
                  patient's fundus image can access the resulting scan,
                  prediction, and report. No other user, including other
                  clinicians can view your patients' data.
                </p>
              </div>
            </div>

            <div className="privacy-item">
              <div className="privacy-item-icon">🔬</div>
              <div>
                <strong>Research use of image data</strong>
                <p>
                  Retinal fundus images uploaded to OpthaDetect may be retained
                  for the purpose of improving and retraining the detection model.
                  Images are used solely for this research purpose and are never
                  shared with third parties or used for commercial gain.
                </p>
              </div>
            </div>

            <div className="privacy-item">
              <div className="privacy-item-icon">🗑️</div>
              <div>
                <strong>Right to erasure</strong>
                <p>
                  In accordance with Article 17 of the UK GDPR, any clinician or
                  patient representative may request the deletion of any uploaded
                  scan and its associated data at any time. Deletions are
                  permanent and irreversible.
                </p>
              </div>
            </div>

            <div className="privacy-item">
              <div className="privacy-item-icon">🔒</div>
              <div>
                <strong>Data minimisation &amp; security</strong>
                <p>
                  We collect only the minimum data required for screening
                  (image, patient ID, name, age, eye). Data is stored securely
                  and access is authenticated via individual user credentials.
                </p>
              </div>
            </div>

            <div className="privacy-item">
              <div className="privacy-item-icon">🏥</div>
              <div>
                <strong>Lawful basis for processing</strong>
                <p>
                  Processing of special category health data is carried out
                  under Article 9(2)(h) (medical diagnosis and treatment) and
                  Article 9(2)(j) (scientific research) of the UK GDPR,
                  alongside the DPA 2018 Schedule 1 research condition.
                </p>
              </div>
            </div>

            <div className="privacy-item">
              <div className="privacy-item-icon">📩</div>
              <div>
                <strong>Contact the Data Controller</strong>
                <p>
                  For any data privacy enquiries, subject access requests, or
                  erasure requests, please contact{" "}
                  <a href="mailto:privacy@opthadetect.com">
                    privacy@opthadetect.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


    {/* MEET THE TEAM */}
    <section className="section team-preview-section" id="team">
      <button className="btn-hero-primary" onClick={onTeam}>
        Meet the Team
      </button>
    </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Ready to try OpthaDetect?</h2>
        <p>Create your free clinician account and run your first analysis in minutes.</p>
        <button className="btn-hero-primary" onClick={onEnter}>
          Get Started
        </button>
      </section>

      {/* FOOTER */}
    <footer className="landing-footer">
      <div className="landing-footer-logo">
        <img src={eyeLogo} alt="OpthaDetect" className="logo-img-circle" />
        <span>OpthaDetect</span>
      </div>
      <p>
        Prototype ophthalmic decision-support tool. Not approved for independent
        clinical use. © {new Date().getFullYear()} OpthaDetect.
      </p>
      <div className="footer-links">
        <a href="#privacy">Privacy Policy</a>
        <span>·</span>
        <a href="mailto:privacy@opthadetect.com">Contact</a>
      </div>
      <div className="footer-social">
        <a href="https://www.linkedin.com/company/opthadetect" target="_blank" rel="noopener noreferrer" className="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <a href="https://x.com/opthadetect" target="_blank" rel="noopener noreferrer" className="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>
    </footer>
    </div>
  );
}

