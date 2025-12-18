import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonChip,
} from '@ionic/react';
import { saveOutline, closeOutline, cloudUploadOutline } from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import type { ProjectSummaryView, TaskStatus } from '../../../types/api';
import TaskDescriptionEnhancer from '../../../components/TaskDescriptionEnhancer';
import { toastService } from '../../../services/toastService';
import { imageService } from '../../../services/imageService';
import { getErrorMessage } from '../../../utils/errorUtils';

const TaskCreatePage: React.FC = () => {
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const defaultStatus: TaskStatus = 'open';
  const [projects, setProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.list({}, { limit: 100 });
        setProjects(response.items);
      } catch (err) {
        toastService.error('Fehler beim Laden der Projekte');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const onSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    const images = files.filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) {
      toastService.error('Bitte wählen Sie Bilddateien aus');
      return;
    }

    setSelectedImages((prev) => [...prev, ...images]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = (name: string) => {
    setSelectedImages((prev) => prev.filter((file) => file.name !== name));
  };

  const handleSubmit = async () => {
    if (!title || !projectId) {
      toastService.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setSaving(true);
      const newTask = await taskService.create({
        title,
        description: description || undefined,
        project_id: projectId,
        status: defaultStatus,
        priority,
        due_date: dueDate || undefined,
      });

      if (selectedImages.length > 0) {
        const uploads = selectedImages.map((file) => imageService.uploadForTask(newTask.id, file));
        const results = await Promise.allSettled(uploads);
        const failed = results.filter((result) => result.status === 'rejected').length;
        if (failed > 0) {
          toastService.error(`${failed} Bild${failed !== 1 ? 'er' : ''} konnte${failed === 1 ? '' : 'n'} nicht hochgeladen werden`);
        } else {
          toastService.success('Bilder hochgeladen');
        }
        history.push(`/app/tasks/${newTask.id}/images`);
        return;
      }

      history.push(`/app/tasks/${newTask.id}`);
    } catch (err) {
      toastService.error('Fehler beim Erstellen der Aufgabe');
      console.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Daten...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neue Aufgabe</h1>
        <p className="page-subtitle">Erstellen Sie eine neue Aufgabe</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Aufgabendetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Titel *</IonLabel>
              <IonInput
                value={title}
                onIonInput={(e) => setTitle(e.detail.value!)}
                placeholder="Aufgabentitel eingeben"
                className="app-form-input"
                required
              />
            </IonItem>

            <TaskDescriptionEnhancer
              title={title}
              description={description}
              onChange={setDescription}
              disabled={saving}
            />

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Projekt *</IonLabel>
              <IonSelect
                value={projectId}
                onIonChange={(e) => setProjectId(e.detail.value!)}
                interface="action-sheet"
                placeholder="Projekt auswählen"
                className="app-form-input"
              >
                {projects.map((project) => (
                  <IonSelectOption key={project.id} value={project.id}>
                    {project.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Priorität</IonLabel>
              <IonSelect
                value={priority}
                onIonChange={(e) => setPriority(e.detail.value!)}
                interface="action-sheet"
                className="app-form-input"
              >
                <IonSelectOption value="low">Niedrig</IonSelectOption>
                <IonSelectOption value="medium">Mittel</IonSelectOption>
                <IonSelectOption value="high">Hoch</IonSelectOption>
                <IonSelectOption value="urgent">Dringend</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Fälligkeitsdatum</IonLabel>
              <IonInput
                type="date"
                value={dueDate}
                onIonInput={(e) => setDueDate(e.detail.value!)}
                className="app-form-input"
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Bilder</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onSelectImages}
            style={{ display: 'none' }}
            disabled={saving}
          />
          <IonButton
            expand="block"
            fill="outline"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
          >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Bilder auswählen
          </IonButton>

          {selectedImages.length > 0 ? (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedImages.map((file) => (
                <IonChip key={file.name} className="app-chip" color="secondary" onClick={() => removeSelectedImage(file.name)}>
                  {file.name}
                </IonChip>
              ))}
            </div>
          ) : null}
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={saving}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {saving ? 'Speichert...' : 'Aufgabe erstellen'}
        </IonButton>

        <IonButton
          routerLink="/app/tasks/my"
          expand="block"
          fill="outline"
          className="app-button-secondary"
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default TaskCreatePage;
