from flask import Blueprint, request, send_file
from gtts import gTTS
import io

tts_bp = Blueprint('tts', __name__)

@tts_bp.route('/speak', methods=['GET'])
def speak():
    text = request.args.get('text', '')
    if not text:
        return "No text provided", 400
    
    try:
        # Create gTTS object
        tts = gTTS(text=text, lang='vi')
        
        # Stream bytes directly
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        data = mp3_fp.getvalue()
        
        return data, 200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': len(data),
            'Accept-Ranges': 'bytes'
        }
    except Exception as e:
        return str(e), 500
