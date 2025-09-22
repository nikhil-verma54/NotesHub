from django.urls import path
from .views import NoteUploadView, NoteListView, NoteUserListView, NoteDeleteView, SubjectsListView, NoteDownloadView

urlpatterns = [
    path('upload/', NoteUploadView.as_view(), name='note-upload'),
    path('list/', NoteListView.as_view(), name='note-list'),
    path('my-notes/', NoteUserListView.as_view(), name='note-user-list'),
    path('delete/<int:pk>/', NoteDeleteView.as_view(), name='note-delete'),
    path('subjects/', SubjectsListView.as_view(), name='subjects-list'),
    path('download/<int:pk>/', NoteDownloadView.as_view(), name='note-download'),
      
]
