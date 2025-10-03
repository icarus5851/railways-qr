import os
import secrets
import string
import segno
import datamatrix
import svgwrite
import ezdxf
import io
from qrcodegen import QrCode
from datetime import datetime, timedelta
from flask import Flask, jsonify, abort, request
from pymongo import MongoClient
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, JWTManager

# --- 1. CONFIGURATION ---
load_dotenv()

# Configure Google AI
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
if not GOOGLE_AI_API_KEY:
    raise ValueError("Google AI API Key not found. Please set it in the .env file.")
genai.configure(api_key=GOOGLE_AI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash') 

# Configure MongoDB
MONGO_URI = os.getenv("MONGO_URI")

# QR Code/DXF settings
QR_MODULE_SIZE_MM = 0.606
DM_MODULE_SIZE_MM = 0.45

app = Flask(__name__)
CORS(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
jwt = JWTManager(app)

# Admin Credentials from .env
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD").encode('utf-8')

# Database Connection
client = MongoClient(MONGO_URI)
db = client.get_database()
components_collection = db.components


# --- 2. HELPER & DRAWING FUNCTIONS ---

def generate_uuid(collection, length=8):
    """Generates a secure, URL-safe, alphanumeric UUID and ensures it's unique."""
    alphabet = string.ascii_letters + string.digits
    while True:
        uuid = ''.join(secrets.choice(alphabet) for _ in range(length))
        if not collection.find_one({"component_id": uuid}):
            return uuid

def draw_dxf_code_to_string(matrix, module_size_mm, border_modules):
    """Draws a barcode matrix to a DXF string in memory."""
    dxf_buffer = io.StringIO()
    doc = ezdxf.new(dxfversion="R2018")
    msp = doc.modelspace()
    doc.layers.new(name="DPM_MARKING", dxfattribs={'color': 1})
    code_size = len(matrix)
    for y in range(code_size):
        for x in range(code_size):
            if matrix[y][x]:
                x_start = (x + border_modules) * module_size_mm
                y_start = (y + border_modules) * module_size_mm
                msp.add_solid([(x_start, y_start), (x_start + module_size_mm, y_start), (x_start + module_size_mm, y_start + module_size_mm), (x_start, y_start + module_size_mm)], dxfattribs={'layer': 'DPM_MARKING'})
    doc.write(dxf_buffer)
    return dxf_buffer.getvalue()

def generate_qr_content(data):
    """Generates QR code SVG and DXF content in memory for API responses."""
    # SVG Generation
    svg_buffer = io.BytesIO()
    qr_segno = segno.make(data, error='h')
    qr_segno.save(svg_buffer, kind='svg', scale=10, border=4)
    svg_content = svg_buffer.getvalue().decode('utf-8')
    
    # DXF Generation
    qr_codegen = QrCode.encode_text(data, QrCode.Ecc.HIGH)
    matrix = [[qr_codegen.get_module(x, y) for x in range(qr_codegen.get_size())] for y in range(qr_codegen.get_size())]
    dxf_content = draw_dxf_code_to_string(matrix, QR_MODULE_SIZE_MM, border_modules=4)
    
    return svg_content, dxf_content


# --- 3. API ENDPOINTS ---

@app.route("/api/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None).encode('utf-8')
    if username != ADMIN_USERNAME or not bcrypt.checkpw(password, ADMIN_PASSWORD_HASH):
        return jsonify({"msg": "Bad username or password"}), 401
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

@app.route("/api/components", methods=['GET'])
@jwt_required()
def get_all_components():
    all_components = list(components_collection.find({}, {'_id': 0}))
    return jsonify(all_components)

@app.route("/api/components/add", methods=['POST'])
@jwt_required()
def add_component():
    data = request.get_json()
    if not data:
        abort(400, "Invalid data provided")

    component_id = generate_uuid(components_collection)

    mfg_date = datetime.strptime(data['manufacturing_date'], '%Y-%m-%d')
    expiry_date = mfg_date + timedelta(days=int(data.get('warranty_years', 10)) * 365)
    
    installation_date = None
    if data.get('installation_date'):
        installation_date = datetime.strptime(data['installation_date'], '%Y-%m-%d')

    location = None
    if data.get('location_lat') and data.get('location_lon'):
        location = {"type": "Point", "coordinates": [float(data['location_lon']), float(data['location_lat'])]}

    db_document = {
        "component_id": component_id, "component_type": data['component_type'],
        "material": data['material'], "vendor_name": data['vendor_name'],
        "batch_no": data['batch_no'], "manufacturing_date": mfg_date,
        "installation_date": installation_date, "expiry_date": expiry_date,
        "track_section_id": data.get('track_section_id'), "location": location,
        "status": "Installed" if installation_date else "In Storage",
        "last_updated": datetime.utcnow()
    }
    components_collection.insert_one(db_document)
    svg_content, dxf_content = generate_qr_content(component_id)
    return jsonify({
        "message": "Component created successfully",
        "component": { "component_id": component_id, **data },
        "svg_content": svg_content, "dxf_content": dxf_content
    })

@app.route("/api/components/<string:component_uuid>", methods=['GET'])
@jwt_required()
def get_component_details(component_uuid):
    component = components_collection.find_one({"component_id": component_uuid}, {'_id': 0})
    if component is None:
        abort(404, description="Component not found")
    return jsonify(component)

@app.route("/api/components/delete/<string:component_uuid>", methods=['DELETE'])
@jwt_required()
def delete_component(component_uuid):
    result = components_collection.delete_one({"component_id": component_uuid})
    if result.deleted_count == 1:
        return jsonify({"message": f"Component {component_uuid} deleted successfully."})
    else:
        abort(404, description="Component not found or already deleted.")

@app.route("/api/report/generate", methods=['POST'])
@jwt_required()
def generate_ai_report():
    data = request.get_json()
    if not data or 'component_id' not in data:
        abort(400, description="Missing 'component_id' in request body")
    component_id = data['component_id']
    component = components_collection.find_one({"component_id": component_id}, {'_id': 0})
    if component is None:
        abort(404, description="Component not found")
        
    expiry_date_str = component.get('expiry_date').strftime('%d/%m/%Y') if component.get('expiry_date') else "Not Set"
    mfg_date_str = component.get('manufacturing_date').strftime('%d/%m/%Y') if component.get('manufacturing_date') else "Not Set"
    
    prompt = f"""
    You are a senior railway maintenance engineer writing official reports for Indian Railways.
    Your job: assess component health, lifecycle, and give actionable technical recommendations for maintenance staff.

    Generate a **Markdown report** with the following details:

    - **Component ID:** `{component.get('component_id')}`
    - **Type:** `{component.get('component_type')}`
    - **Material:** `{component.get('material')}`
    - **Vendor:** `{component.get('vendor_name')}`
    - **Batch No:** `{component.get('batch_no')}`
    - **Manufacturing Date:** `{mfg_date_str}`
    - **Expiry Date:** `{expiry_date_str}`
    - **Location:** `{component.get('track_section_id', 'In Storage')}`
    - **Status:** `{component.get('status', 'Unknown')}`

    The report must have **one main title** (`#` in Markdown) and **four sub-sections** (`##`):

    # Railway Component Maintenance Report

    ## 1. Component Overview
    Summarize all details in a clean, bulleted list.

    ## 2. AI-Powered Technical Analysis
    Write a concise analysis of **exactly 2-3 sentences** about the component’s condition and lifecycle stage.

    ## 3. Risk Assessment
    Provide the rating and justification as a bulleted list with bolded titles, like this:
    - **Rating:** Low / Medium / High
    - **Justification:** A brief 1-2 sentence explanation for the rating.

    ## 4. Recommended Actions
    List **3–4 clear actions, one-line short-medium recommendations,with bold title for each bullet point** as bullet points for the crew (e.g., inspections, preventive replacement, anti-rust treatment, track monitoring).

    The tone must be professional, technical, and directly useful for railway staff. No disclaimers—only actionable insights.
    """
    try:
        response = model.generate_content(prompt)
        return jsonify({"report_text": response.text})
    except Exception as e:
        print(f"AI generation failed: {e}")
        abort(500, description="Failed to generate AI report.")


# --- 4. MAIN EXECUTION BLOCK ---
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)