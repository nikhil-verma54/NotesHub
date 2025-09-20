from django.contrib import admin
from .models import Note

class NoteAdmin(admin.ModelAdmin):
    list_display = ('course', 'branch', 'semester', 'subject', 'by', 'is_approved', 'uploaded_at')  # ✅ Correct field name

admin.site.register(Note, NoteAdmin)
