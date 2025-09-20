from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Note
from .serializers import NoteSerializer
from django.core.files.base import ContentFile
from django.db import models

class NoteUploadView(generics.CreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Save first to get the instance and file path
        serializer.save(by=self.request.user, is_approved=False)
        note: Note = serializer.instance

        # Try to create a cover image from first page of the uploaded PDF
        try:
            # Lazy import to prevent ModuleNotFoundError during migrations/startup
            import fitz  # type: ignore
            if note.notes_file and note.notes_file.path.lower().endswith('.pdf'):
                doc = fitz.open(note.notes_file.path)
                if doc.page_count > 0:
                    page = doc.load_page(0)
                    # scale for better resolution
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    png_bytes = pix.tobytes("png")
                    cover_name = f"note_{note.id}_cover.png"
                    note.cover_image.save(cover_name, ContentFile(png_bytes), save=True)
                doc.close()
        except Exception:
            # Silently ignore cover generation errors to not block upload
            pass

class NoteListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Note.objects.filter(is_approved=True).order_by('-uploaded_at')
        params = self.request.query_params
        course = params.get('course')
        branch = params.get('branch')
        semester = params.get('semester')
        subject = params.get('subject')
        q = params.get('q')

        if course:
            qs = qs.filter(course=course)
        if branch:
            qs = qs.filter(branch=branch)
        if semester:
            try:
                qs = qs.filter(semester=int(semester))
            except (TypeError, ValueError):
                pass
        if subject:
            qs = qs.filter(subject__iexact=subject)
        if q:
            qs = qs.filter(
                models.Q(subject__icontains=q)
                | models.Q(unit__icontains=q)
                | models.Q(by__username__icontains=q)
            )
        return qs

class NoteUserListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(by=self.request.user).order_by('-uploaded_at')

class NoteDeleteView(generics.DestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(by=self.request.user)

class SubjectsListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        # Include approved notes for everyone, plus own notes if authenticated
        qs = Note.objects.filter(is_approved=True)
        if request.user and request.user.is_authenticated:
            qs = Note.objects.filter(
                models.Q(is_approved=True) | models.Q(by=request.user)
            )
        course = request.query_params.get('course')
        branch = request.query_params.get('branch')
        semester = request.query_params.get('semester')

        if course:
            qs = qs.filter(course=course)
        if branch:
            qs = qs.filter(branch=branch)
        if semester:
            try:
                qs = qs.filter(semester=int(semester))
            except (TypeError, ValueError):
                pass

        subjects = (
            qs.order_by('subject')
              .values_list('subject', flat=True)
              .distinct()
        )
        return Response(list(subjects))
