from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from paddleocr import PaddleOCR
from tempfile import NamedTemporaryFile
from dotenv import load_dotenv
import google.generativeai as genai
import os

app = FastAPI()
load_dotenv()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MediLens API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://medi-lens-pi.vercel.app","https://medilens-1.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GENAI_API_KEY:
    raise ValueError("Set GEMINI_API_KEY environment variable")
genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-lite")  


ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)

def preprocess_image(img):
   
    img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

  
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    gray = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    kernel = np.array([
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
])
    gray = cv2.filter2D(gray, -1, kernel)

    return gray

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        if not file:
            return JSONResponse({"success": False, "error": "No image provided"}, status_code=400)

       
        contents = await file.read()
        arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            return JSONResponse({"success": False, "error": "Invalid image file"}, status_code=400)

    
        preprocessed_img = preprocess_image(img)


        with NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            temp_path = tmp_file.name
            cv2.imwrite(temp_path, preprocessed_img)

        result = ocr.predict(temp_path)

        os.remove(temp_path)

      
        extracted_texts = []
        for res in result:
            res.print()
            res.save_to_img("output")
            if 'rec_texts' in res:
                extracted_texts.extend(res['rec_texts'])

       
        full_text = " ".join(extracted_texts)
        prompt = f"""
Act as a professional medical doctor. I have scanned a medicine label. 
Based on the EXTRACTED TEXT below, identify the medicine. 
If specific fields like 'usage' or 'side_effects' are missing from the text but you recognize the medicine name, use your medical knowledge to provide accurate information,also provide the generic name and alternatives and fetch best buy link for medicine.
Return ONLY a valid JSON object:
{{
  "medicineName": "Full name of medicine",
  "composition": "Ingredients",
  "usage": "detailed medical usage with examples and under what conditions it is used in simple language",
  "dosage": "Standard dosage",
  "manufacturer": "Company name",
  "side_effects": " Common side effects in detailed format",
  "warning": "Safety warnings",
  "buy_link": "URL",
  "alternatives": "Provide an ARRAY of strings (e.g., [\"Med A\", \"Med B\"]) containing generic medicines with the same composition.",
  "generic_name": "The primary active salt (e.g., \"Paracetamol\")"
  
  
  LINK LOGIC:
Construct the 'buy_link' using this exact format to ensure it never breaks:
https://www.1mg.com/search/all?name={{medicineName}}
Replace {{medicineName}} with the actual name, using '+' for spaces.
}}

EXTRACTED TEXT: {full_text}
        """

        gemini_response = model.generate_content(prompt)
        print("Gemini AI Response:\n", gemini_response.text)
        

        return {
            "success": True,
            "ocr_text": extracted_texts,
            "gemini_analysis": gemini_response.text
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Hugging Face defaults to 7860
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)