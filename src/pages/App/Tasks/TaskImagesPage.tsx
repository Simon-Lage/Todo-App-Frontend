import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonSpinner, IonButton, IonList, IonItem, IonLabel, IonThumbnail, IonCard, IonCardContent, IonIcon, useIonAlert } from '@ionic/react';
import { cloudUploadOutline, arrowBackOutline, trashOutline, imageOutline } from 'ionicons/icons';
import { imageService } from '../../../services/imageService';
import type { ImageView } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import { getErrorMessage } from '../../../utils/errorUtils';
import AuthenticatedImage from '../../../components/AuthenticatedImage';

const TaskImagesPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { authSession } = useAuthSession();
  const [presentAlert] = useIonAlert();
  const [images, setImages] = useState<ImageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canUpload = Boolean(authSession.permissions?.['perm_can_edit_tasks']);

  useEffect(() => {
    loadImages();
  }, [taskId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const imageList = await imageService.list({ taskId });
      setImages(imageList);
    } catch (err) {
      setError('Fehler beim Laden der Bilder');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await imageService.uploadForTask(taskId, file);
      await loadImages();
    } catch (err) {
      setError('Fehler beim Hochladen des Bildes');
      console.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await imageService.delete(imageId);
      await loadImages();
    } catch (err) {
      setError('Fehler beim Löschen des Bildes');
      console.error(getErrorMessage(err));
    }
  };

  const confirmDelete = (image: ImageView) => {
    presentAlert({
      header: 'Bild löschen',
      message: `Möchten Sie das Bild "${image.original_filename}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive', handler: () => void handleDelete(image.id) },
      ],
    });
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Bilder...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Aufgaben-Bilder</h1>
        <p className="page-subtitle">{images.length} Bild{images.length !== 1 ? 'er' : ''} vorhanden</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {canUpload ? (
        <IonCard className="app-card">
          <IonCardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <IonButton
              expand="block"
              disabled={uploading}
              className="app-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <IonIcon slot="start" icon={cloudUploadOutline} />
              {uploading ? 'Lädt hoch...' : 'Bild hochladen'}
            </IonButton>
          </IonCardContent>
        </IonCard>
      ) : null}

      {images.length === 0 ? (
        <div className="empty-state">
          <IonIcon icon={imageOutline} className="empty-state-icon" />
          <p>Keine Bilder vorhanden</p>
        </div>
      ) : (
        <IonList className="app-list" style={{ padding: '0 16px' }}>
	          {images.map((image) => (
	            <IonItem key={image.id} className="app-list-item">
	              <IonThumbnail slot="start">
	                <AuthenticatedImage imageId={image.id} alt={image.original_filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
	              </IonThumbnail>
	              <IonLabel>
	                <h3>{image.original_filename}</h3>
                <p>Größe: {(image.size / 1024).toFixed(2)} KB</p>
                <p>Hochgeladen: {new Date(image.created_at).toLocaleDateString('de-DE')}</p>
              </IonLabel>
              {canUpload ? (
                <IonButton slot="end" color="danger" size="small" onClick={() => confirmDelete(image)}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              ) : null}
            </IonItem>
          ))}
        </IonList>
      )}

      <div style={{ padding: '16px' }}>
        <IonButton routerLink={`/app/tasks/${taskId}`} expand="block" fill="outline" className="app-button-secondary">
          <IonIcon slot="start" icon={arrowBackOutline} />
          Zurück zur Aufgabe
        </IonButton>
      </div>
    </IonContent>
  );
};

export default TaskImagesPage;

