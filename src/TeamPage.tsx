// src/TeamPage.tsx
import "./TeamPage.css";
import rodiyah from "./assets/Rodiyah2.jpg";
import muhammed from "./assets/Muhammed.jpeg";
import adewunmi from "./assets/Adewunmi.jpeg";
import odLogo from "./assets/Logo.png";


interface Props {
  onBack: () => void;
}

const team = [
  {
    name: "Rodiyah Oluwa",
    role: "Co-Founder · Data Scientist & ML Engineer",
    badge: "Co-Founder",
    badgeClass: "badge--founder",
    img: rodiyah,
    bio: [
      "Rodiyah is a Data Scientist and Machine Learning Engineer at Lifeful Medical Centre, developing machine learning and data-driven solutions to support healthcare operations and reporting.",
      "She holds a distinction in Applied Data Science from Teesside University and a First Class degree in Economics from Lagos State University. Her work spans predictive modelling, Power BI dashboards, time series forecasting, and healthcare analytics.",
    ],
    skills: ["Python", "SQL", "TensorFlow", "PyTorch", "Power BI", "Azure"],
  },
  {
    name: "Muhammed Alakitan",
    role: "Co-Founder · Doctoral Researcher",
    badge: "Co-Founder",
    badgeClass: "badge--founder",
    img: muhammed,
    bio: [
      "Muhammed is a doctoral candidate in Sociology at the University of Cambridge. His thesis examines how Nigerians navigate online visibility amid algorithmic, political, socio-economic, and gendered structures.",
      "His research blends in-depth interviews with computational social science, bringing a critical, human-centred lens to AI and digital society.",
    ],
    skills: ["Computational Social Science", "Qualitative Research", "Cambridge"],
  },
  {
    name: "Adewunmi Akingbola",
    role: "Advisor · Medical Doctor & Epidemiologist",
    badge: "Advisor",
    badgeClass: "badge--advisor",
    img: adewunmi,
    bio: [
      "Adewunmi is a medical doctor, infectious diseases epidemiologist, and founder of HealthDrive Nigeria. He holds a distinction from the University of Cambridge in Infectious Diseases and won the Cambridge Public Health Early Career Researcher Prize.",
      "He has published 50+ peer-reviewed papers and received international recognition for his work in viral hepatitis surveillance in low-resource settings.",
    ],
    skills: ["Forbes 30 Under 30 Europe 2025", "Passion in Science 2024", "Diana Award 2021", "AfriSAFE 2020"],
    isAdvisor: true,
  },
];

export default function TeamPage({ onBack }: Props) {
  return (
    <div className="team-page">
      {/* NAV */}
    <nav className="landing-nav">
      <div className="landing-nav-logo" onClick={onBack} style={{ cursor: "pointer" }}>
        <img src={odLogo} alt="OpthaDetect" className="logo-img" />
      </div>
      <button className="btn-hero-ghost" onClick={onBack}>
        ← Back to Home
      </button>
    </nav>

      {/* HERO */}
      <section className="team-hero">
        <div className="team-hero-eyebrow">The people behind the mission</div>
        <h1 className="team-hero-title">
          Meet the <span className="hero-highlight">Team</span>
        </h1>
        <p className="team-hero-sub">
          Built by researchers and practitioners who believe AI can transform
          eye care access across Africa and beyond.
        </p>
      </section>

      {/* CARDS */}
      <section className="team-cards-section">
        <div className="section-label">Our Team</div>
        <div className="team-cards">
          {team.map((member) => (
            <div className="team-card" key={member.name}>
              <div className="team-card-img-wrap">
                <img src={member.img} alt={member.name} />
                <span className={`team-badge ${member.badgeClass}`}>
                  {member.badge}
                </span>
              </div>
              <div className="team-card-body">
                <h2 className="team-card-name">{member.name}</h2>
                <p className="team-card-role">{member.role}</p>
                {member.bio.map((para, i) => (
                  <p className="team-card-bio" key={i}>
                    {para}
                  </p>
                ))}
                <div className="team-skills">
                  {member.skills.map((s) => (
                    <span
                      className={`team-skill-tag ${member.isAdvisor ? "team-skill-tag--gold" : ""}`}
                      key={s}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          <div className="logo-circle small">OD</div>
          <span>OpthaDetect</span>
        </div>
        <p>
          Prototype ophthalmic decision-support tool. Not approved for
          independent clinical use. © {new Date().getFullYear()} OpthaDetect.
        </p>
        <div className="footer-links">
          <a href="#" onClick={onBack}>Home</a>
          <span>·</span>
          <a href="mailto:privacy@opthadetect.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
