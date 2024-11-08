from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import os
import re

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Base Class for Document Extraction
class DocumentExtractor:
    def __init__(self, text):
        self.text = text

    def extract_name(self):
        # Match patterns for names, accommodating various keywords
        match = re.search(r'(?:Name|FN|Full\s*Name|SAMPLE)\s*[:\-]*\s*([A-Z\s]+(?:\s+[A-Z]+)?)', self.text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    def extract_document_number(self):
    # Match document number patterns, flexible for different terms including Driving License and Driver License
        match = re.search(r'(?:DL\s*No|License\s*No|Document\s*No|ID\s*No|Number|pL|Driving\s*License|Driver\s*License)\s*[:\-]*\s*([A-Za-z0-9\s]+)', self.text, re.IGNORECASE)
        return match.group(1).strip() if match else None


    def extract_expiration_date(self):
        # Match expiration date patterns with various keywords
        match = re.search(r'(?:Expires|Valid\s*Till|Valid\s*Upto|Expiration|EXE|exp)\s*[:\-]*\s*(\d{2}[-/]\d{2}[-/]\d{4})', self.text, re.IGNORECASE)
        return match.group(1).strip() if match else None


# Factory function to select the appropriate extractor class (simplified for general case)
def get_extractor(text):
    return DocumentExtractor(text)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'document' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['document']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    text = pytesseract.image_to_string(Image.open(file_path))

    extractor = get_extractor(text)
    name = extractor.extract_name()
    document_number = extractor.extract_document_number()
    expiration_date = extractor.extract_expiration_date()

    extracted_data = {
        "text": text,
        "name": name,
        "documentNumber": document_number,
        "expirationDate": expiration_date,
    }

    return jsonify({"message": "File uploaded successfully", **extracted_data})

if __name__ == '__main__':
    app.run(debug=True)
