import { GoogleGenAI } from "@google/genai";

const PROMPT = `You are a medical records assistant for a Malaysian clinic. 
You will be given one or more photos of handwritten patient medical records.

Extract the following information and return ONLY a valid JSON object with no markdown, no backticks, no explanation.

JSON structure:
{
  "patient": {
    "fullName": "",
    "NRIC": "",
    "dateOfBirth": "",
    "race": "",
    "sex": "",
    "address": "",
    "contactNumber": ""
  },
  "record": {
    "diagnosis": "",
    "notes": "",
    "allergies": []
  }
}

Rules:
- fullName: full name in UPPERCASE as written
- NRIC: digits and dashes only, format 000000-00-0000
- dateOfBirth: derive from NRIC if not explicitly written. Format YYYY-MM-DD
- race: e.g. Malay, Chinese, Indian, Other
- sex: exactly "Male" or "Female" or "Other"
- address: full address as written, or empty string if not found
- contactNumber: digits only, or empty string if not found
- diagnosis: the main diagnosis or complaint, concise
- notes: all clinical notes, examination findings, and vitals as written. If medications or prescriptions are mentioned, append them clearly labeled as "Medications prescribed: ..." at the end of the notes
- allergies: array of strings, each a drug or substance allergy. Empty array if none mentioned
- If a field cannot be found in the image, use an empty string
- Do not invent or guess information that is not visible in the images`;

export const extractFromImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Initialize it here! By the time a user hits this API route, 
    // your .env file is guaranteed to be fully loaded into memory.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = [PROMPT];
    for (const file of req.files) {
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: contents,
    });

    const text = response.text.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(clean);

    res.status(200).json(extracted);
  } catch (error) {
    console.error("HTR error:", error);
    res.status(500).json({ message: "Failed to extract data from images" });
  }
};