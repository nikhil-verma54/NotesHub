from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import google.generativeai as genai
import logging
from dotenv import load_dotenv
import os
import google.generativeai as genai

logger = logging.getLogger(__name__)

# --- Static FAQ intents (avoid model calls for known Q&A) ---
FAQS = [
    (
        ["what is noteshub", "about noteshub", "noteshub platform", "what is this"],
        "NotesHub is a platform created by Nikhil Verma where students can upload and access study notes to help each other learn better.",
    ),
    (
        ["who made this bot", "who built this bot", "who are you", "your name", "genie"],
        "I'm Genie 🤖, your study buddy chatbot! I was built by Nikhil Verma to guide you through NotesHub.",
    ),
    (
        ["how can i upload", "upload my notes", "upload notes", "submit notes"],
        "Log in, go to the 'Upload Notes' section, select your file, and submit. Your notes will be reviewed and then made available to others.",
    ),
    (
        ["can i download", "download notes", "how to download"],
        "Yes! Browse notes by subject or category and click the download button.",
    ),
    (
        ["need an account", "access notes account", "sign up required", "do i need account"],
        "Yes, you'll need to sign up for free to upload or download notes.",
    ),
    (
        ["types of notes", "what types of notes", "which formats", "pdf word scanned"],
        "You can upload PDFs, Word files, or scanned handwritten notes — as long as they’re clear and useful.",
    ),
    (
        ["reset my password", "forgot password", "password reset"],
        "Use 'Login via Google' on the login page to access your account.",
    ),
    (
        ["notes not showing", "uploaded not showing", "approval process", "why not visible"],
        "Every upload goes through an approval process to ensure quality. Once approved, your notes will appear.",
    ),
    (
        ["edit or delete", "remove my notes", "edit my uploads", "delete notes"],
        "Yes. Go to your profile → 'My Uploads' to edit or remove notes.",
    ),
    (
        ["is noteshub free", "cost", "pricing", "free to use"],
        "Absolutely! NotesHub is free to use for uploading and accessing notes.",
    ),
    (
        ["share noteshub", "tell friends", "share with friends"],
        "Of course! The more students use it, the better the community becomes.",
    ),
    (
        ["why upload my notes", "benefits of uploading", "help others"],
        "By sharing your notes, you help other students succeed while building a collaborative learning space.",
    ),
    (
        ["Who is Nikhil","nikhil verma","nikhil" ],
        "Nikhil Verma is the creator of NotesHub and Genie. He built this platform to help students share and access study notes easily, creating a helpful learning community."
    ),
]
# Load .env variables
load_dotenv()
def _normalize(text: str) -> str:
    return " ".join((text or "").lower().strip().split())

def try_answer_faq(user_message: str):
    q = _normalize(user_message)
    for patterns, answer in FAQS:
        for p in patterns:
            if p in q:
                return answer
    # Simple exact matches
    if q in ("help", "faq", "support"):
        return (
            "Here are some things I can help with:\n"
            "- What is NotesHub?\n"
            "- How can I upload my notes?\n"
            "- Can I download notes?\n"
            "- Do I need an account?\n"
            "- Types of notes allowed\n"
            "- Reset password\n"
            "- Uploaded notes not showing\n"
            "- Edit or delete my notes\n"
            "- Is NotesHub free?\n"
            "- Share NotesHub\n"
            "- Why upload my notes?\n"
            "- Who is Nikhil?"
        )
    return None

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("Gemini configured successfully.")
except Exception as e:
    logger.error("Failed to configure Google Generative AI: %s", e)

@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    # Parse JSON safely
    try:
        data = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)

    user_message = (data.get("message") or "").strip()
    if not user_message:
        return JsonResponse({"error": "Message cannot be empty"}, status=400)

    # Attempt to answer via FAQ first (avoids quota and speed up)
    faq_answer = try_answer_faq(user_message)
    if faq_answer:
        return JsonResponse({"reply": faq_answer})

    try:
        # Use a lighter model by default to reduce quota pressure
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(user_message)

        # Handle SDK response variations
        reply_text = getattr(response, "text", None) or getattr(response, "candidates", None)
        if not reply_text:
            logger.warning("GenAI returned no text. Raw response: %s", response)
            return JsonResponse({"error": "Model returned no response"}, status=502)

        # If candidates returned, try to extract first text
        if not isinstance(reply_text, str):
            try:
                # Best-effort extraction
                first = response.candidates[0]
                reply_text = first.content.parts[0].text if first.content.parts else ""
            except Exception:
                reply_text = ""

        if not reply_text:
            return JsonResponse({"error": "Empty response from model"}, status=502)

        return JsonResponse({"reply": reply_text})
    except Exception as e:
        logger.exception("Chatbot error: %s", e)
        # Common causes: invalid API key, network issues, quota exceeded
        err_text = str(e)
        lower = err_text.lower()
        if "quota" in lower or "429" in lower or "rate limit" in lower:
            # Try to extract a suggested retry delay if present
            import re
            m = re.search(r"retry in\s+([0-9]+(\.[0-9]+)?)s", err_text, re.IGNORECASE)
            retry_after = m.group(1) if m else None
            payload = {"error": "Rate limit exceeded. Please try again shortly."}
            if retry_after:
                payload["retry_after_seconds"] = retry_after
            return JsonResponse(payload, status=429)
        return JsonResponse({"error": err_text}, status=500)
