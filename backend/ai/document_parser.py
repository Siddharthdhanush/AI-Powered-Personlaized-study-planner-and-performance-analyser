import pytesseract
from PIL import Image
import pdfplumber
import docx
import io

# Explicitly set the path to the Tesseract executable installed via Winget
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_image(file_bytes: bytes) -> str:
    """Extracts text from an image file using Tesseract OCR."""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error parsing image: {e}")
        return ""

def parse_pdf(file_bytes: bytes) -> str:
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            # Limit to 15 pages max to prevent OOM and timeouts on massive textbooks
            pages_to_read = min(15, len(pdf.pages))
            for i in range(pages_to_read):
                page_text = pdf.pages[i].extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def parse_docx(file_bytes: bytes) -> str:
    """Extracts text from a Word Document."""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error parsing Word Document: {e}")
        return ""

def parse_document(file_bytes: bytes, filename: str) -> str:
    """Routes the file to the correct parser based on extension."""
    ext = filename.lower().split('.')[-1]
    
    if ext in ['png', 'jpg', 'jpeg', 'bmp']:
        return parse_image(file_bytes)
    elif ext == 'pdf':
        return parse_pdf(file_bytes)
    elif ext in ['doc', 'docx']:
        return parse_docx(file_bytes)
    else:
        # Fallback for plain text
        try:
            return file_bytes.decode('utf-8')
        except:
            return ""
