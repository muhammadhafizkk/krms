import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DocumentRenderer from "./DocumentRenderer";

const today = () => new Date().toISOString().split("T")[0];

const FORMS = {
  "medical-checkup": {
    label: "Medical Check-Up",
    defaults: {
      date: today(), age: "", maritalStatus: "", occupation: "",
      personalMedicalHistory: "", familyMedicalHistory: "",
      weight: "", height: "", bmi: "", pulseRate: "", pulseVolume: "",
      systolic: "", diastolic: "", physicalAppearance: "", comments: "",
      pallor: "", jaundice: "", oedema: "",
      eyeRight: "", eyeLeft: "", ear: "", headNeckOthers: "",
      cardiovascular: "", respiratory: "", abdomen: "", centralNervous: "",
      musculoskeletal: "", skin: "", genitalia: "", commentSuggestion: "",
      urine: "", bloodTest: "", chestXray: "",
      doctorName: "", qualification: "", fitUnfit: "FIT",
    },
  },
  referral: {
    label: "Referral Letter",
    defaults: { date: today(), recipientLine1: "", recipientLine2: "", body: "" },
  },
  "time-slip": {
    label: "Time Slip",
    defaults: { date: today(), timeFrom: "", timeTo: "" },
  },
  "sick-leave": {
    label: "Sick Leave",
    defaults: { date: today(), days: "", dateFrom: today(), dateTo: "", diagnosis: "", doctorName: "", qualification: "" },
  },
  "cuti-sekolah": {
    label: "Cuti Sekolah",
    defaults: { date: today(), schoolName: "", days: "", dateFrom: today(), dateTo: "" },
  },
  receipt: {
    label: "Official Receipt",
    defaults: { date: today(), amount: "", paymentFor: "", chequeNo: "" },
  },
};

const Field = ({ label, children }) => (
  <div className="form-control w-full">
    <label className="label py-1"><span className="label-text text-xs font-medium">{label}</span></label>
    {children}
  </div>
);

const FormFields = ({ type, form, onChange }) => {
  const inp = (field, placeholder = "") => (
    <input className="input input-bordered input-sm w-full" value={form[field] || ""}
      onChange={e => onChange(field, e.target.value)} placeholder={placeholder} />
  );
  const area = (field, rows = 3, placeholder = "") => (
    <textarea className="textarea textarea-bordered textarea-sm w-full" rows={rows}
      value={form[field] || ""} onChange={e => onChange(field, e.target.value)} placeholder={placeholder} />
  );
  const grid2 = (...items) => (
    <div className="grid grid-cols-2 gap-3">{items}</div>
  );

  switch (type) {
    case "medical-checkup":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          {grid2(
            <Field label="Marital Status">{inp("maritalStatus")}</Field>,
            <Field label="Occupation">{inp("occupation")}</Field>
          )}
          <Field label="Personal Medical History">{inp("personalMedicalHistory")}</Field>
          <Field label="Family Medical History">{inp("familyMedicalHistory")}</Field>
          <div className="divider text-xs my-1">A) General Examination</div>
          {grid2(
            <Field label="Weight (kg)">{inp("weight")}</Field>,
            <Field label="Height (cm)">{inp("height")}</Field>
          )}
          {grid2(
            <Field label="BMI">{inp("bmi")}</Field>,
            <Field label="Pulse Rate (per min)">{inp("pulseRate")}</Field>
          )}
          {grid2(
            <Field label="Systolic (mmHg)">{inp("systolic")}</Field>,
            <Field label="Diastolic (mmHg)">{inp("diastolic")}</Field>
          )}
          <Field label="Physical Appearance">{inp("physicalAppearance")}</Field>
          {grid2(
            <Field label="Pallor / Anaemia">{inp("pallor")}</Field>,
            <Field label="Jaundice">{inp("jaundice")}</Field>
          )}
          <Field label="Oedema">{inp("oedema")}</Field>
          <div className="divider text-xs my-1">B) Head and Neck</div>
          {grid2(
            <Field label="Eye Right">{inp("eyeRight")}</Field>,
            <Field label="Eye Left">{inp("eyeLeft")}</Field>
          )}
          <Field label="Ear">{inp("ear")}</Field>
          <div className="divider text-xs my-1">Systems</div>
          <Field label="C) Cardiovascular">{inp("cardiovascular")}</Field>
          <Field label="D) Respiratory">{inp("respiratory")}</Field>
          <Field label="E) Abdomen">{inp("abdomen")}</Field>
          <Field label="F) Central Nervous">{inp("centralNervous")}</Field>
          <Field label="G) Musculoskeletal">{inp("musculoskeletal")}</Field>
          <Field label="H) Skin">{inp("skin")}</Field>
          <Field label="I) Genitalia">{inp("genitalia")}</Field>
          <Field label="Comment / Suggestion">{area("commentSuggestion", 2)}</Field>
          <div className="divider text-xs my-1">Investigation</div>
          <Field label="Urine">{inp("urine")}</Field>
          <Field label="Blood Test">{inp("bloodTest")}</Field>
          <Field label="Chest X-ray">{inp("chestXray")}</Field>
          <div className="divider text-xs my-1">Doctor Certification</div>
          <Field label="Doctor Name">{inp("doctorName")}</Field>
          <Field label="Qualification">{inp("qualification")}</Field>
          <Field label="Fit / Unfit">
            <select className="select select-bordered select-sm w-full"
              value={form.fitUnfit} onChange={e => onChange("fitUnfit", e.target.value)}>
              <option>FIT</option><option>UNFIT</option>
            </select>
          </Field>
        </div>
      );

    case "referral":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          <Field label="Recipient (Line 1)">{inp("recipientLine1", "e.g. Hospital Kemaman")}</Field>
          <Field label="Recipient (Line 2)">{inp("recipientLine2", "Department or ward (optional)")}</Field>
          <Field label="Letter Body">{area("body", 8, "Write referral details here...")}</Field>
        </div>
      );

    case "time-slip":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          {grid2(
            <Field label="Time From">{inp("timeFrom", "e.g. 9:00 AM")}</Field>,
            <Field label="Time To">{inp("timeTo", "e.g. 11:30 AM")}</Field>
          )}
        </div>
      );

    case "sick-leave":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          <Field label="Diagnosis">{inp("diagnosis")}</Field>
          <Field label="Number of Days">{inp("days")}</Field>
          {grid2(
            <Field label="From">{inp("dateFrom")}</Field>,
            <Field label="To">{inp("dateTo")}</Field>
          )}
          <Field label="Doctor Name">{inp("doctorName")}</Field>
          <Field label="Qualification">{inp("qualification")}</Field>
        </div>
      );

    case "cuti-sekolah":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          <Field label="School Name">{inp("schoolName", "e.g. SK Taman Baiduri")}</Field>
          <Field label="Number of Days">{inp("days")}</Field>
          {grid2(
            <Field label="From">{inp("dateFrom")}</Field>,
            <Field label="To">{inp("dateTo")}</Field>
          )}
        </div>
      );

    case "receipt":
      return (
        <div className="flex flex-col gap-2">
          <Field label="Date">{inp("date")}</Field>
          <Field label="Amount (RM)">{inp("amount", "e.g. 45.00")}</Field>
          <Field label="Payment For">{inp("paymentFor", "e.g. Consultation & medication")}</Field>
          <Field label="Cheque No. (leave blank if cash)">{inp("chequeNo")}</Field>
        </div>
      );

    default: return null;
  }
};

const DocumentModal = ({ modalId, patient, defaultType = "time-slip" }) => {
  const [type, setType] = useState(defaultType);
  const [form, setForm] = useState(FORMS[defaultType].defaults);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [serialNumber, setSerialNumber] = useState(null);
  const [generated, setGenerated] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    setForm(FORMS[type].defaults);
    setPreview(false);
    setSerialNumber(null);
    setGenerated(null);
  }, [type]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleGenerate = async () => {
    setSaving(true);
    try {
      const res = await api.post("/documents/generate", {
        type,
        patientId: patient._id,
        data: form,
      });
      setSerialNumber(res.data.serialNumber);
      setGenerated(res.data);
      setPreview(true);
      toast.success("Document generated");
    } catch (err) {
      toast.error("Failed to generate document");
      console.log(err)
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Klinik Rabiah — ${FORMS[type].label}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; }
        @media print {
          body { margin: 0; }
          @page { size: A4; margin: 15mm; }
        }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const close = () => {
    setPreview(false);
    setSerialNumber(null);
    setGenerated(null);
    setForm(FORMS[type].defaults);
    document.getElementById(modalId)?.close();
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {!preview ? (
          <>
            <h3 className="font-bold text-lg mb-4">Generate Document</h3>

            {/* Doc type selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(FORMS).map(([key, { label }]) => (
                <button key={key}
                  className={`btn btn-sm ${type === key ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setType(key)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Patient info summary */}
            <div className="bg-base-200 rounded-lg p-3 mb-4 text-sm flex gap-6">
              <div><span className="opacity-60">Patient</span> <strong>{patient?.fullName}</strong></div>
              <div><span className="opacity-60">NRIC</span> <strong>{patient?.icNumber}</strong></div>
            </div>

            <FormFields type={type} form={form} onChange={handleChange} />

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={saving}>
                {saving && <span className="loading loading-spinner loading-xs" />}
                Generate & Preview
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{FORMS[type].label}</h3>
              {serialNumber && (
                <span className="badge badge-neutral font-mono">{serialNumber}</span>
              )}
            </div>

            {/* Print preview */}
            <div className="border border-base-300 rounded-lg overflow-auto bg-white mb-4">
              <div ref={printRef}>
                <DocumentRenderer
                  type={type}
                  data={form}
                  patient={patient}
                  serialNumber={serialNumber}
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setPreview(false)}>← Back</button>
              <button className="btn btn-ghost" onClick={close}>Close</button>
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨 Print
              </button>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={close}>close</button></form>
    </dialog>
  );
};

export default DocumentModal;