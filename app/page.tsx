"use client";

import { ChangeEvent, useState } from "react";


type AnalysisResult = {
  disease: string;
  confidence: number;
  severity: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  environment_risk: string;
  risk: string;
  recommendation: string;
};

type HistoryItem = {
  id: number;
  disease: string;
  crop: string;
  confidence: number;
  risk: string;
  date: string;
};

type Section =
  | "scan"
  | "crops"
  | "history"
  | "weather"
  | "insights"
  | "settings"
  | "help";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("scan");
  

  const [crop, setCrop] = useState("Tomato");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  async function analyzeCrop() {
    if (!image) {
      setError("Please select a leaf image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed.");
      }

      const data: AnalysisResult = await response.json();

      setResult(data);

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        disease: data.disease,
        crop,
        confidence: data.confidence,
        risk: data.risk,
        date: new Date().toLocaleDateString("en-IN"),
      };

      setHistory((previous) => [
        newHistoryItem,
        ...previous,
      ].slice(0, 5));
    } catch {
      setError(
        "Unable to connect to the AI server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeImage() {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#03130d] text-white">

      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(1,20,13,0.78), rgba(1,20,13,0.94)), url('/farm.jpg')",
        }}
      />

      <div className="fixed inset-0 -z-10 bg-[#03130d]/40" />

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="fixed left-0 top-0 z-30 flex h-screen w-[334px] flex-col border-r border-white/10 bg-[#02150d]/90 px-8 py-8 backdrop-blur-2xl">

          {/* LOGO */}

          <div className="mb-12">
            <div className="flex items-center gap-3">

              <div className="text-3xl">
                🌱
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  AgriVision AI
                </h1>

                <p className="mt-1 text-sm text-white/40">
                  Smart crop intelligence
                </p>
              </div>

            </div>
          </div>

          {/* MENU */}

          <nav className="space-y-3">

            <SideItem
              icon="📷"
              text="Scan Crop"
              active={activeSection === "scan"}
              onClick={() => setActiveSection("scan")}
            />

            <SideItem
              icon="🌿"
              text="My Crops"
              active={activeSection === "crops"}
              onClick={() => setActiveSection("crops")}
            />

            <SideItem
              icon="◷"
              text="Analysis History"
              active={activeSection === "history"}
              onClick={() => setActiveSection("history")}
            />

            <SideItem
              icon="☁"
              text="Weather & Risk"
              active={activeSection === "weather"}
              onClick={() => setActiveSection("weather")}
            />

            <SideItem
              icon="◇"
              text="Field Insights"
              active={activeSection === "insights"}
              onClick={() => setActiveSection("insights")}
            />

            <SideItem
              icon="⚙"
              text="Settings"
              active={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            />

            <SideItem
              icon="?"
              text="Help"
              active={activeSection === "help"}
              onClick={() => setActiveSection("help")}
            />

          </nav>

          {/* FARMER CARD */}

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-5">

            <p className="text-base font-semibold">
              Farmer
            </p>

            <p className="mt-1 text-sm text-white/40">
              AgriVision User
            </p>

          </div>

        </aside>


        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="ml-[334px] min-h-screen flex-1 px-12 py-8">

          {/* TOP BAR */}

          <header className="mb-8 flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#B8F34A]/70">
                FIELD MONITORING
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                {getSectionTitle(activeSection)}
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-white/60 backdrop-blur-xl">
              ● System Online
            </div>

          </header>


          {/* =================================================
              SCAN CROP
          ================================================== */}

          {activeSection === "scan" && (
            <ScanSection
              crop={crop}
              setCrop={setCrop}
              image={image}
              preview={preview}
              result={result}
              loading={loading}
              error={error}
              history={history}
              handleImageChange={handleImageChange}
              analyzeCrop={analyzeCrop}
              changeImage={changeImage}
            />
          )}


          {/* =================================================
              MY CROPS
          ================================================== */}

          {activeSection === "crops" && (
  <SimpleSection
    label="MY CROPS"
    title="Your Crops"
    description="Monitor the crops you are currently tracking with AgriVision AI."
  >
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <InfoCard
        icon="🍅"
        title="Tomato"
        subtitle="Primary crop"
        value={
          result
            ? `Latest: ${result.disease}`
            : "Ready for analysis"
        }
      />

      <InfoCard
        icon="🥔"
        title="Potato"
        subtitle="Supported crop"
        value="Ready for analysis"
      />

      <InfoCard
        icon="🌾"
        title="Rice"
        subtitle="Supported crop"
        value="Coming soon"
      />

      <InfoCard
        icon="🌽"
        title="Maize"
        subtitle="Supported crop"
        value="Coming soon"
      />

    </div>
  </SimpleSection>
)}


          {/* =================================================
              ANALYSIS HISTORY
          ================================================== */}

          {activeSection === "history" && (
            <SimpleSection
              label="ANALYSIS HISTORY"
              title="Recent Scans"
              description="Review your latest crop health analyses."
            >

              {history.length === 0 ? (
                <EmptyState
                  icon="◷"
                  text="No previous scans yet."
                />
              ) : (
                <div className="space-y-3">

                  {history.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                    >

                      <div>

                        <p className="font-semibold">
                          {scan.disease}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {scan.crop} • {scan.date}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold text-[#B8F34A]">
                          {scan.confidence}%
                        </p>

                        <p
                          className={`text-xs ${
                            scan.risk === "High"
                              ? "text-red-300"
                              : "text-white/40"
                          }`}
                        >
                          {scan.risk} Risk
                        </p>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </SimpleSection>
          )}


          {/* =================================================
              WEATHER & RISK
          ================================================== */}

          {activeSection === "weather" && (
            <SimpleSection
              label="WEATHER & RISK"
              title="Environmental Conditions"
              description="Environmental factors used by AgriVision AI for crop-risk assessment."
            >

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                <WeatherCard
                  icon="🌡️"
                  title="Temperature"
                  value={
                    result
                      ? `${result.temperature}°C`
                      : "26.1°C"
                  }
                />

                <WeatherCard
                  icon="💧"
                  title="Humidity"
                  value={
                    result
                      ? `${result.humidity}%`
                      : "93%"
                  }
                />

                <WeatherCard
                  icon="☁️"
                  title="Rainfall"
                  value={
                    result
                      ? `${result.rainfall}mm`
                      : "0.2mm"
                  }
                />

                <WeatherCard
                  icon="⚠️"
                  title="Environment Risk"
                  value={
                    result
                      ? result.environment_risk
                      : "High"
                  }
                />

              </div>

            </SimpleSection>
          )}


          {/* =================================================
              FIELD INSIGHTS
          ================================================== */}

          {activeSection === "insights" && (
            <SimpleSection
              label="FIELD INSIGHTS"
              title="Crop Health Insights"
              description="A lightweight overview of what AgriVision AI can help you understand."
            >

              <div className="grid gap-5 md:grid-cols-3">

                <InfoCard
                  icon="🔬"
                  title="Disease Detection"
                  subtitle="AI-powered analysis"
                  value="Leaf image analysis"
                />

                <InfoCard
                  icon="⚠️"
                  title="Risk Assessment"
                  subtitle="Context-aware"
                  value="Disease + environment"
                />

                <InfoCard
                  icon="💡"
                  title="Early Warning"
                  subtitle="Action focused"
                  value="Preventive guidance"
                />

              </div>

            </SimpleSection>
          )}


          {/* =================================================
              SETTINGS
          ================================================== */}

          {activeSection === "settings" && (
            <SimpleSection
              label="SETTINGS"
              title="Application Settings"
              description="Basic preferences for the AgriVision AI dashboard."
            >

              <div className="max-w-2xl space-y-4">

                <SettingRow
                  title="Default Crop"
                  description="Crop selected when starting a new scan."
                  value="Tomato"
                />

                <SettingRow
                  title="Risk Notifications"
                  description="Future option for crop-risk alerts."
                  value="Coming Soon"
                />

                <SettingRow
                  title="Language"
                  description="Multilingual support will be added later."
                  value="English"
                />

              </div>

            </SimpleSection>
          )}


          {/* =================================================
              HELP
          ================================================== */}

          {activeSection === "help" && (
            <SimpleSection
              label="HELP"
              title="How AgriVision AI Works"
              description="Follow these simple steps to analyze a crop."
            >

              <div className="grid gap-4 md:grid-cols-2">

                <HelpCard
                  number="01"
                  title="Select a crop"
                  text="Choose the crop you want to analyze."
                />

                <HelpCard
                  number="02"
                  title="Upload a leaf image"
                  text="Upload a clear image of the crop leaf."
                />

                <HelpCard
                  number="03"
                  title="Analyze with AI"
                  text="The computer vision model identifies a potential disease."
                />

                <HelpCard
                  number="04"
                  title="Understand the risk"
                  text="Environmental conditions are combined with the detection result."
                />

              </div>

            </SimpleSection>
          )}

        </div>

      </div>

    </main>
  );
}


/* ============================================================
   SCAN SECTION
============================================================ */

function ScanSection({
  crop,
  setCrop,
  image,
  preview,
  result,
  loading,
  error,
  history,
  handleImageChange,
  analyzeCrop,
  changeImage,
}: {
  crop: string;
  setCrop: (value: string) => void;
  image: File | null;
  preview: string | null;
  result: AnalysisResult | null;
  loading: boolean;
  error: string;
  history: HistoryItem[];
  handleImageChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
  analyzeCrop: () => void;
  changeImage: () => void;
}) {
  return (
    <>

      <section className="grid gap-6 xl:grid-cols-[315px_minmax(0,1fr)_375px]">

        {/* LEFT - HEALTH STATUS */}

        <div className="rounded-3xl border border-white/10 bg-[#061910]/80 p-7 backdrop-blur-xl">

          <p className="text-xs text-white/40">
            HEALTH STATUS
          </p>

          <div className="my-10 flex justify-center">

            <div
              className="flex h-48 w-48 items-center justify-center rounded-full border-[10px] border-[#8CDA35]"
              style={{
                boxShadow:
                  "0 0 45px rgba(184,243,74,0.08)",
              }}
            >

              <div className="text-center">

                <p className="text-4xl font-bold">
                  {result
                    ? `${result.confidence}%`
                    : "—"}
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Confidence
                </p>

              </div>

            </div>

          </div>


          <div className="space-y-3">

            <DataRow
              icon="🌱"
              label="Crop"
              value={crop}
            />

            <DataRow
              icon="⚠"
              label="Severity"
              value={
                result
                  ? result.severity
                  : "Not analyzed"
              }
            />

            <DataRow
              icon="⚠"
              label="Risk"
              value={
                result
                  ? result.risk
                  : "Not analyzed"
              }
              danger={result?.risk === "High"}
            />

          </div>

        </div>


        {/* CENTER - AI ANALYSIS */}

        <div className="rounded-3xl border border-white/10 bg-[#03150d]/85 p-8 backdrop-blur-xl">

          <div className="flex justify-center">

            <span className="rounded-full border border-[#8CDA35]/30 bg-[#8CDA35]/10 px-5 py-2 text-sm font-semibold text-[#B8F34A]">
              AI CROP ANALYSIS
            </span>

          </div>


          {/* CROP SELECT */}

          <div className="mt-7 flex justify-center">

            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b2117] px-5 py-3 text-sm outline-none"
            >
              <option>Tomato</option>
              <option>Potato</option>
              <option>Rice</option>
              <option>Maize</option>
            </select>

          </div>


          {/* IMAGE */}

          <div className="mt-6 flex min-h-[410px] items-center justify-center rounded-3xl border border-white/10 bg-black/10 p-6">

            {preview ? (
              <img
                src={preview}
                alt="Selected crop leaf"
                className="max-h-[380px] max-w-full rounded-2xl object-contain"
              />
            ) : (
              <label className="flex h-full min-h-[350px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02]">

                <div className="mb-4 text-5xl">
                  🌿
                </div>

                <p className="font-semibold">
                  Upload Leaf Image
                </p>

                <p className="mt-2 text-xs text-white/40">
                  JPG, PNG or WEBP
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>
            )}

          </div>


          {/* RESULT */}

          {result && (
            <div className="mt-7 text-center">

              <p className="text-xs tracking-[0.25em] text-white/40">
                DISEASE DETECTED
              </p>

              <h3 className="mt-3 text-4xl font-bold text-[#B8F34A]">
                {result.disease}
              </h3>

              <p className="mt-2 text-white/50">
                Confidence {result.confidence}%
              </p>

            </div>
          )}


          {/* ERROR */}

          {error && (
            <p className="mt-5 text-center text-sm text-red-300">
              {error}
            </p>
          )}


          {/* BUTTONS */}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">

            <button
              onClick={changeImage}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-semibold transition hover:bg-white/[0.08]"
            >
              Change Leaf Image
            </button>

            <button
              onClick={analyzeCrop}
              disabled={!image || loading}
              className="rounded-2xl bg-[#B8F34A] px-5 py-4 font-bold text-black transition hover:bg-[#c8ff65] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Analyzing..."
                : "🔬 Analyze with AI"}
            </button>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="space-y-6">

          {/* SCAN OVERVIEW */}

          <div className="rounded-3xl border border-white/10 bg-[#03150d]/85 p-7 backdrop-blur-xl">

            <p className="text-xs text-white/40">
              SCAN OVERVIEW
            </p>

            <div className="mt-8 space-y-6">

              <DataBlock
                label="Crop"
                value={crop}
              />

              <DataBlock
                label="Disease"
                value={
                  result
                    ? result.disease
                    : "Awaiting analysis"
                }
              />

              <DataBlock
                label="Confidence"
                value={
                  result
                    ? `${result.confidence}%`
                    : "—"
                }
              />

              <DataBlock
                label="Risk Level"
                value={
                  result
                    ? result.risk
                    : "—"
                }
                danger={result?.risk === "High"}
              />

            </div>

          </div>


          {/* ENVIRONMENT */}

          <div className="rounded-3xl border border-white/10 bg-[#03150d]/85 p-7 backdrop-blur-xl">

            <p className="text-xs text-white/40">
              ENVIRONMENT
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <MiniData
                icon="🌡️"
                label="Temperature"
                value={
                  result
                    ? `${result.temperature}°C`
                    : "26.1°C"
                }
              />

              <MiniData
                icon="💧"
                label="Humidity"
                value={
                  result
                    ? `${result.humidity}%`
                    : "93%"
                }
              />

              <MiniData
                icon="☁️"
                label="Rainfall"
                value={
                  result
                    ? `${result.rainfall}mm`
                    : "0.2mm"
                }
              />

              <MiniData
                icon="⚠️"
                label="Env. Risk"
                value={
                  result
                    ? result.environment_risk
                    : "High"
                }
              />

            </div>

          </div>


          {/* SMART GUIDANCE */}

          <div className="rounded-3xl border border-[#8CDA35]/20 bg-[#071d11]/90 p-7 backdrop-blur-xl">

            <p className="text-xs text-[#B8F34A]">
              💡 SMART GUIDANCE
            </p>

            <p className="mt-4 text-sm leading-6 text-white/60">

              {result
                ? result.recommendation
                : "Get actionable guidance after analyzing your crop."}

            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ANALYSIS HISTORY
      ====================================================== */}

      <div className="mt-6 rounded-3xl border border-white/10 bg-[#03150d]/85 p-6 backdrop-blur-xl">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <p className="text-xs text-white/40">
              ANALYSIS HISTORY
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Recent Scans
            </h3>

          </div>

          <span className="text-xs text-white/30">
            Last 5 scans
          </span>

        </div>


        {history.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/40">
            No previous scans yet.
          </p>
        ) : (
          <div className="space-y-2">

            {history.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] p-4"
              >

                <div>

                  <p className="text-sm font-semibold">
                    {scan.disease}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {scan.crop} • {scan.date}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-sm font-semibold text-[#B8F34A]">
                    {scan.confidence}%
                  </p>

                  <p
                    className={`text-xs ${
                      scan.risk === "High"
                        ? "text-red-300"
                        : "text-white/40"
                    }`}
                  >
                    {scan.risk} Risk
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>


      {/* =====================================================
          FEATURE CARDS
      ====================================================== */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <BottomCard
          title="AI Detection"
          text="Identify potential crop diseases from leaf images."
          icon="🔬"
        />

        <BottomCard
          title="Risk Assessment"
          text="Combine disease detection with environmental conditions."
          icon="⚠️"
        />

        <BottomCard
          title="Early Warning"
          text="Get actionable guidance before crop damage spreads."
          icon="💡"
        />

      </div>

    </>
  );
}


/* ============================================================
   SIDEBAR ITEM
============================================================ */

function SideItem({
  icon,
  text,
  active = false,
  onClick,
}: {
  icon: string;
  text: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-5 rounded-2xl px-6 py-4 text-left text-sm font-medium transition ${
        active
          ? "bg-[#163b1b] text-[#B8F34A]"
          : "text-white/50 hover:bg-white/[0.04] hover:text-white"
      }`}
    >

      <span className="w-5 text-center text-base">
        {icon}
      </span>

      <span>
        {text}
      </span>

    </button>
  );
}


/* ============================================================
   DATA ROW
============================================================ */

function DataRow({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-5 py-4">

      <div className="flex items-center gap-3">

        <span>
          {icon}
        </span>

        <span className="text-sm">
          {label}
        </span>

      </div>

      <span
        className={
          danger
            ? "text-sm font-semibold text-red-300"
            : "text-sm text-white/50"
        }
      >
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   DATA BLOCK
============================================================ */

function DataBlock({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="border-b border-white/10 pb-5 last:border-0 last:pb-0">

      <p className="text-xs text-white/30">
        {label}
      </p>

      <p
        className={`mt-2 font-semibold ${
          danger ? "text-red-300" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   MINI DATA
============================================================ */

function MiniData({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-4">

      <div className="text-xl">
        {icon}
      </div>

      <p className="mt-4 text-[11px] text-white/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   BOTTOM CARD
============================================================ */

function BottomCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#03150d]/80 p-5 backdrop-blur-xl">

      <div className="text-xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/40">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   SIMPLE SECTION
============================================================ */

function SimpleSection({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>

      <div className="mb-7 rounded-3xl border border-white/10 bg-[#03150d]/80 p-8 backdrop-blur-xl">

        <p className="text-xs tracking-[0.2em] text-[#B8F34A]/70">
          {label}
        </p>

        <h3 className="mt-3 text-3xl font-semibold">
          {title}
        </h3>

        <p className="mt-2 max-w-2xl text-sm text-white/40">
          {description}
        </p>

      </div>

      {children}

    </section>
  );
}


/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon,
  title,
  subtitle,
  value,
}: {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#03150d]/80 p-6 backdrop-blur-xl">

      <div className="text-3xl">
        {icon}
      </div>

      <p className="mt-6 text-xs text-white/35">
        {subtitle}
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm text-[#B8F34A]">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   WEATHER CARD
============================================================ */

function WeatherCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#03150d]/80 p-6 backdrop-blur-xl">

      <div className="text-3xl">
        {icon}
      </div>

      <p className="mt-6 text-xs text-white/35">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#03150d]/80 backdrop-blur-xl">

      <div className="text-4xl text-white/30">
        {icon}
      </div>

      <p className="mt-4 text-sm text-white/40">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   SETTINGS ROW
============================================================ */

function SettingRow({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#03150d]/80 p-5">

      <div>

        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/35">
          {description}
        </p>

      </div>

      <span className="rounded-full bg-white/[0.05] px-4 py-2 text-xs text-white/50">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   HELP CARD
============================================================ */

function HelpCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#03150d]/80 p-6 backdrop-blur-xl">

      <span className="text-sm font-bold text-[#B8F34A]">
        {number}
      </span>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   SECTION TITLE
============================================================ */

function getSectionTitle(section: Section) {
  switch (section) {
    case "scan":
      return "Crop Health";

    case "crops":
      return "My Crops";

    case "history":
      return "Analysis History";

    case "weather":
      return "Weather & Risk";

    case "insights":
      return "Field Insights";

    case "settings":
      return "Settings";

    case "help":
      return "Help";

    default:
      return "Crop Health";
  }
}