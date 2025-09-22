from rest_framework import serializers
from .models import Note
from django.urls import reverse

class NoteSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="by.username")
    fileUrl = serializers.SerializerMethodField()  # 
    coverImageUrl = serializers.SerializerMethodField()
    downloadUrl = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id", "course", "branch", "semester", "subject", "unit",
            "notes_file", "fileUrl", "downloadUrl", "coverImageUrl", "by", "username",
            "is_approved", "uploaded_at"
        ]
        read_only_fields = ["by", "is_approved", "uploaded_at"]

    def get_fileUrl(self, obj):
        request = self.context.get("request")
        if obj.notes_file:
            return request.build_absolute_uri(obj.notes_file.url)
        return None

    def get_coverImageUrl(self, obj):
        request = self.context.get("request")
        if obj.cover_image:
            return request.build_absolute_uri(obj.cover_image.url)
        return None

    def get_downloadUrl(self, obj):
        request = self.context.get("request")
        url = reverse('note-download', args=[obj.pk])
        return request.build_absolute_uri(url)
