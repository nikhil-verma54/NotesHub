from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    # Allow flexible course/branch values (e.g., Pharma, BBA, MBA, BCom)
    course = models.CharField(max_length=50)
    branch = models.CharField(max_length=50)
    semester = models.IntegerField()
    subject = models.CharField(max_length=100)
    unit = models.CharField(max_length=100, blank=True, null=True)
    notes_file = models.FileField(upload_to='notes/')
    cover_image = models.ImageField(upload_to='notes/covers/', blank=True, null=True)
    by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} by {self.by.username}"
