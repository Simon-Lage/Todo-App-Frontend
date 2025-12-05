import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonButton, IonList, IonItem, IonLabel, IonThumbnail, IonCard, IonCardContent } from '@ionic/react';
import { imageService } from '../../../services/imageService';
import type { ImageView } from '../../../types/api';

const TaskImagesPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [images, setImages] = useState<ImageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [taskId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const imageList = await imageService.list({ taskId });
      setImages(imageList);
    } catch (err) {
      setError('Fehler beim Laden der Bilder');
      console.error(err?.message || err);
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
      console.error(err?.message || err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Möchten Sie dieses Bild wirklich löschen?')) return;

    try {
      await imageService.delete(imageId);
      await loadImages();
    } catch (err) {
      setError('Fehler beim Löschen des Bildes');
      console.error(err?.message || err);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Aufgaben-Bilder</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonCard>
          <IonCardContent>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <IonButton expand="block" disabled={uploading}>
                {uploading ? <IonSpinner /> : 'Bild hochladen'}
              </IonButton>
            </label>
          </IonCardContent>
        </IonCard>

        {images.length === 0 ? (
          <IonText className="ion-text-center">
            <p>Keine Bilder vorhanden</p>
          </IonText>
        ) : (
          <IonList>
            {images.map((image) => (
              <IonItem key={image.id}>
                <IonThumbnail slot="start">
                  <img src={imageService.getDownloadUrl(image.id)} alt={image.original_filename} />
                </IonThumbnail>
                <IonLabel>
                  <h2>{image.original_filename}</h2>
                  <p>Größe: {(image.size / 1024).toFixed(2)} KB</p>
                  <p>Hochgeladen: {new Date(image.created_at).toLocaleDateString()}</p>
                </IonLabel>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(image.id)}>
                  Löschen
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonButton routerLink={`/app/tasks/${taskId}`} expand="block" fill="outline">
          Zurück zur Aufgabe
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TaskImagesPage;

