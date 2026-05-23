import { forwardRef } from "react";
import { formatDate } from "../../lib/utils";

const CLINIC = {
  name: "KLINIK RABIAH",
  address: "K-200 Bangunan SMNY, Taman Baiduri, 24000 Geliga, Kemaman, Terengganu",
  tel: "09-8683684",
};

// ── Shared header ──────────────────────────────────────────────────────────
const ClinikHeader = ({ layout = "center" }) => (
  <div style={{ textAlign: layout, marginBottom: "24px" }}>
    <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>
      {CLINIC.name}
    </div>
    <div style={{ fontSize: "11px" }}>{CLINIC.address}</div>
    <div style={{ fontSize: "11px" }}>Tel / Faks : {CLINIC.tel}</div>
  </div>
);

const Field = ({ label, value, style = {} }) => (
  <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "10px", ...style }}>
    <span style={{ minWidth: "160px", fontWeight: "500", fontSize: "13px" }}>{label}</span>
    <span style={{ flex: 1, borderBottom: "1px solid #333", paddingBottom: "2px", fontSize: "13px", marginLeft: "8px" }}>
      {value || ""}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontWeight: "bold", textDecoration: "underline", margin: "18px 0 10px", fontSize: "14px" }}>
    {children}
  </div>
);

// ── Amount in Malay words (for receipt) ───────────────────────────────────
const ones = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Lapan", "Sembilan",
  "Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas",
  "Enam Belas", "Tujuh Belas", "Lapan Belas", "Sembilan Belas"];
const tens = ["", "", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh",
  "Enam Puluh", "Tujuh Puluh", "Lapan Puluh", "Sembilan Puluh"];

function numToMalay(n) {
  n = Math.round(n);
  if (n === 0) return "Sifar";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000) return (n < 200 ? "Seratus" : ones[Math.floor(n / 100)] + " Ratus") +
    (n % 100 ? " " + numToMalay(n % 100) : "");
  if (n < 1000000) return (n < 2000 ? "Seribu" : ones[Math.floor(n / 1000)] + " Ribu") +
    (n % 1000 ? " " + numToMalay(n % 1000) : "");
  return n.toString();
}

function amountToMalayWords(amount) {
  const ringgit = Math.floor(amount);
  const sen = Math.round((amount - ringgit) * 100);
  let result = numToMalay(ringgit) + " Ringgit";
  if (sen > 0) result += " Dan " + numToMalay(sen) + " Sen";
  return result + " Sahaja";
}

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════════════════════════════

const MedicalCheckup = ({ data, patient }) => (
  <div>
    <ClinikHeader layout="center" />
    <div style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "16px", marginBottom: "20px" }}>
      MEDICAL CHECK-UP
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
      <Field label="Name" value={patient?.fullName} />
      <Field label="Sex" value={patient?.gender} />
      <Field label="NRIC No" value={patient?.icNumber} />
      <Field label="Age" value={data.age} />
    </div>
    <Field label="Address" value={patient?.address} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
      <Field label="Marital Status" value={data.maritalStatus} />
      <Field label="Occupational" value={data.occupation} />
    </div>
    <Field label="Personal Medical History" value={data.personalMedicalHistory} />
    <Field label="Family Medical History" value={data.familyMedicalHistory} />

    <SectionTitle>A) General Examination</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
      <Field label="Weight" value={data.weight ? `${data.weight} kgs` : ""} />
      <Field label="Height" value={data.height ? `${data.height} cm` : ""} />
      <Field label="BMI" value={data.bmi} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
      <Field label="Pulse Rate" value={data.pulseRate ? `${data.pulseRate} per minute` : ""} />
      <Field label="Pulse Volume" value={data.pulseVolume} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
      <Field label="Blood Pressure" value="" />
      <Field label="Systolic" value={data.systolic ? `${data.systolic} mmHg` : ""} />
      <Field label="Diastolic" value={data.diastolic ? `${data.diastolic} mmHg` : ""} />
    </div>
    <Field label="Physical Appearance" value={data.physicalAppearance} />
    <Field label="Comments" value={data.comments} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
      <Field label="Pallor / Anaemia" value={data.pallor} />
      <Field label="Jaundice" value={data.jaundice} />
      <Field label="Oedema" value={data.oedema} />
    </div>

    <SectionTitle>B) Head and Neck</SectionTitle>
    <div style={{ marginBottom: "8px", fontSize: "13px" }}>Eye — Vision with / without aided</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
      <Field label="RIGHT" value={data.eyeRight} />
      <Field label="LEFT" value={data.eyeLeft} />
    </div>
    <Field label="Ear" value={data.ear} />
    <Field label="Others" value={data.headNeckOthers} />

    <SectionTitle>C) Cardiovascular System</SectionTitle>
    <Field label="" value={data.cardiovascular} />
    <SectionTitle>D) Respiratory System</SectionTitle>
    <Field label="" value={data.respiratory} />
    <SectionTitle>E) Abdomen</SectionTitle>
    <Field label="" value={data.abdomen} />
    <SectionTitle>F) Central Nervous System</SectionTitle>
    <Field label="" value={data.centralNervous} />
    <SectionTitle>G) Musculoskeletal System</SectionTitle>
    <Field label="" value={data.musculoskeletal} />
    <SectionTitle>H) Skin</SectionTitle>
    <Field label="" value={data.skin} />
    <SectionTitle>I) Genitalia</SectionTitle>
    <Field label="" value={data.genitalia} />
    <Field label="Comment / Suggestion" value={data.commentSuggestion} />

    <SectionTitle>INVESTIGATION</SectionTitle>
    <Field label="1) Urine" value={data.urine} />
    <Field label="2) Blood Test" value={data.bloodTest} />
    <Field label="3) Chest X-ray" value={data.chestXray} />

    <SectionTitle>Doctor Finding and Recommendations</SectionTitle>
    <div style={{ fontSize: "13px", marginBottom: "12px" }}>
      I, Dr <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "200px", paddingBottom: "2px" }}>{data.doctorName}</span> there by certify that I have this day examined{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "160px", paddingBottom: "2px" }}>{patient?.fullName}</span> and found HIM/HER to be medically <strong>FIT / UNFIT</strong>.
    </div>
    <Field label="Signed" value="" />
    <Field label="Name" value={data.doctorName} />
    <Field label="Qualification" value={data.qualification} />
    <Field label="Date" value={data.date || formatDate(new Date())} />
  </div>
);

const ReferralLetter = ({ data, patient }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
      <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "1px" }}>{CLINIC.name}</div>
      <div style={{ fontSize: "11px", textAlign: "right" }}>
        <div>K-200 TAMAN BAIDURI GELIGA, 24000</div>
        <div>KEMAMAN, TERENGGANU</div>
        <div>TEL/FAKS : 09 - 8683684</div>
      </div>
    </div>
    <hr style={{ borderTop: "2px solid #333", marginBottom: "20px" }} />

    <div style={{ marginBottom: "8px", fontSize: "13px" }}>
      <strong>TARIKH :</strong> {data.date || formatDate(new Date())}
    </div>
    <div style={{ marginBottom: "4px", fontSize: "13px" }}><strong>KEPADA:</strong></div>
    <div style={{ borderBottom: "1px solid #333", marginBottom: "6px", minHeight: "22px", fontSize: "13px" }}>{data.recipientLine1}</div>
    <div style={{ borderBottom: "1px solid #333", marginBottom: "20px", minHeight: "22px", fontSize: "13px" }}>{data.recipientLine2}</div>

    <Field label="Nama Pesakit" value={patient?.fullName} />
    <Field label="No. Kad Pengenalan" value={patient?.icNumber} />

    <div style={{ minHeight: "200px", marginTop: "20px", fontSize: "13px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
      {data.body}
    </div>

    <div style={{ marginTop: "40px", fontSize: "13px" }}>
      <div>YANG BENAR,</div>
      <div style={{ marginTop: "48px", borderTop: "1px dotted #666", paddingTop: "4px", width: "200px" }}></div>
      <div style={{ fontSize: "13px" }}>(DR. YANG BERTUGAS)</div>
    </div>
  </div>
);

const TimeSlip = ({ data, patient }) => (
  <div>
    <ClinikHeader layout="center" />
    <div style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "16px", marginBottom: "28px" }}>
      TIME SLIP
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "13px" }}>
      <div>
        <div>Kepada,</div>
        <div>Yang Berkenaan,</div>
      </div>
      <div>Tarikh: <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.date || formatDate(new Date())}</span></div>
    </div>

    <div style={{ fontSize: "13px", lineHeight: "2.2", marginBottom: "20px" }}>
      Disahkan bahawa{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "180px" }}>{patient?.fullName}</span>{" "}
      telah datang ke klinik dari{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "80px" }}>{data.timeFrom}</span>{" "}
      hingga{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "80px" }}>{data.timeTo}</span>{" "}
      untuk mendapatkan rawatan/membawa anak/isterinya ke klinik.
    </div>

    <div style={{ fontSize: "13px", marginBottom: "32px" }}>Terima Kasih.</div>
    <div style={{ fontSize: "13px", marginBottom: "48px" }}>Yang Benar,</div>
    <div style={{ borderTop: "1px dotted #666", paddingTop: "4px", width: "200px", fontSize: "13px" }}>
      (DR. YANG BERTUGAS)
    </div>
  </div>
);

const SickLeave = ({ data, patient, serialNumber }) => (
  <div>
    <ClinikHeader layout="center" />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <div style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "16px", flex: 1 }}>
        SICK LEAVE CERTIFICATE
      </div>
      {serialNumber && (
        <div style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
          <strong>No: {serialNumber}</strong>
        </div>
      )}
    </div>

    <div style={{ fontSize: "13px", marginBottom: "6px", textAlign: "right" }}>
      Date: <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.date || formatDate(new Date())}</span>
    </div>

    <Field label="Patient Name" value={patient?.fullName} />
    <Field label="NRIC No" value={patient?.icNumber} />

    <div style={{ fontSize: "13px", lineHeight: "2.2", margin: "20px 0" }}>
      This is to certify that the above-named patient is medically unfit for work / duty for{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "60px", textAlign: "center" }}>{data.days}</span>{" "}
      day(s), from{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.dateFrom}</span>{" "}
      to{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.dateTo}</span>.
    </div>

    {data.diagnosis && (
      <Field label="Diagnosis" value={data.diagnosis} />
    )}

    <div style={{ marginTop: "40px", fontSize: "13px" }}>
      <div style={{ marginBottom: "48px" }}>Yours sincerely,</div>
      <div style={{ borderTop: "1px dotted #666", paddingTop: "4px", width: "200px" }}></div>
      <div>{data.doctorName || "(DR. YANG BERTUGAS)"}</div>
      <div style={{ fontSize: "12px", color: "#555" }}>{data.qualification}</div>
      <div style={{ fontSize: "12px" }}>Klinik Rabiah</div>
    </div>
  </div>
);

const CutiSekolah = ({ data, patient }) => (
  <div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
      <div style={{ fontWeight: "bold", fontSize: "18px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
        KLINIK RABIAH
      </div>
      <div style={{ fontSize: "11px" }}>
        <div>K-200 TAMAN BAIDURI GELIGA, 24000 KEMAMAN, TERENGGANU</div>
        <div>NO TEL / FAKS : 09 - 8683684</div>
      </div>
    </div>
    <hr style={{ borderTop: "2px solid #333", marginBottom: "20px" }} />

    <div style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "16px", marginBottom: "20px" }}>
      CUTI SEKOLAH
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "13px", marginBottom: "16px" }}>
      Tarikh : <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px", marginLeft: "8px" }}>{data.date || formatDate(new Date())}</span>
    </div>

    <div style={{ fontSize: "13px", marginBottom: "6px" }}>Pengetua / Guru Besar,</div>
    <Field label="Sekolah Kebangsaan / Menengah" value={data.schoolName} />
    <Field label="NAMA PELAJAR" value={patient?.fullName} />

    <div style={{ fontSize: "13px", lineHeight: "2.2", margin: "20px 0" }}>
      Adalah dengan ini disahkan bahawa saya telah memeriksa pelajar di atas. Beliau didapati{" "}
      <strong>TIDAK SIHAT</strong> untuk meneruskan persekolahan dan diberi <strong>CUTI SAKIT</strong> selama{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "60px", textAlign: "center" }}>{data.days}</span>{" "}
      hari bermula pada{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.dateFrom}</span>{" "}
      hingga{" "}
      <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "120px" }}>{data.dateTo}</span>.
    </div>

    <div style={{ fontSize: "13px", marginBottom: "32px" }}>Sekian. Terima Kasih.</div>
    <div style={{ fontSize: "13px", marginBottom: "4px" }}>T.Tangan</div>
    <div style={{ marginTop: "48px", borderTop: "1px dotted #666", paddingTop: "4px", width: "200px", fontSize: "13px" }}>
      ( Dr. Yang Bertugas )
    </div>
  </div>
);

const OfficialReceipt = ({ data, patient, serialNumber }) => (
  <div style={{ border: "2px solid #333", padding: "28px", maxWidth: "520px", margin: "0 auto" }}>
    <ClinikHeader layout="center" />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #333", borderBottom: "1px solid #ccc", padding: "8px 0", marginBottom: "16px" }}>
      <div style={{ fontWeight: "bold", textDecoration: "underline", fontSize: "14px" }}>
        RESIT RASMI / OFFICIAL RECEIPT
      </div>
      {serialNumber && (
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>No. {serialNumber.replace("RC-", "")}</div>
      )}
    </div>

    <div style={{ textAlign: "right", fontSize: "13px", marginBottom: "16px" }}>
      Date / Tarikh: <span style={{ borderBottom: "1px solid #333", display: "inline-block", minWidth: "100px" }}>{data.date || formatDate(new Date())}</span>
    </div>

    <Field label="Diterima dari / (Received from)" value={patient?.fullName} />
    <Field label="Sebanyak / (Sum of)" value={data.amount ? amountToMalayWords(parseFloat(data.amount)) : ""} />
    <Field label="Untuk bayaran / (For the payment of)" value={data.paymentFor} />

    <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
        RM {data.amount ? parseFloat(data.amount).toFixed(2) : "______"}
        <div style={{ fontSize: "11px", fontWeight: "normal", marginTop: "4px" }}>Tunai / Cek No.: {data.chequeNo || ""}</div>
      </div>
      <div style={{ textAlign: "center", fontSize: "12px" }}>
        <div style={{ borderTop: "1px solid #333", paddingTop: "4px", width: "160px" }}>
          T.Tangan Penerima / (Signature of Recipient)
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// MAIN RENDERER
// ══════════════════════════════════════════════════════════════════════════

const DocumentRenderer = forwardRef(({ type, data, patient, serialNumber }, ref) => {
  const style = {
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    color: "#111",
    background: "#fff",
    padding: "40px",
    width: "210mm",
    minHeight: "297mm",
    boxSizing: "border-box",
  };

  const renderTemplate = () => {
    switch (type) {
      case "medical-checkup": return <MedicalCheckup data={data} patient={patient} />;
      case "referral": return <ReferralLetter data={data} patient={patient} />;
      case "time-slip": return <TimeSlip data={data} patient={patient} />;
      case "sick-leave": return <SickLeave data={data} patient={patient} serialNumber={serialNumber} />;
      case "cuti-sekolah": return <CutiSekolah data={data} patient={patient} />;
      case "receipt": return <OfficialReceipt data={data} patient={patient} serialNumber={serialNumber} />;
      default: return <div>Unknown document type</div>;
    }
  };

  return (
    <div ref={ref} style={style}>
      {renderTemplate()}
    </div>
  );
});

DocumentRenderer.displayName = "DocumentRenderer";
export default DocumentRenderer;