import React, { useState } from 'react';
import { IonItem, IonLabel, IonTextarea, IonButton, IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { colorWandOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { taskService } from '../services/taskService';

type Props = {
  title: string;
  description: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const TaskDescriptionEnhancer: React.FC<Props> = ({ title, description, onChange, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNotProcessable, setShowNotProcessable] = useState(false);

  const handleBeautify = async () => {
    const trimmed = description.trim();
    const trimmedTitle = title.trim();

    if (!trimmed) {
      setError('Bitte geben Sie zuerst eine Beschreibung ein.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const improved = await taskService.beautifyDescription({
        title: trimmedTitle ? trimmedTitle : undefined,
        description: trimmed,
      });

      const cleaned = improved.trim();

      if (!cleaned) {
        setSuggestion(null);
        setError('Kein Vorschlag erhalten. Bitte erneut versuchen.');
      } else {
        setSuggestion(cleaned);
        setError(null);
      }
    } catch (err) {
      const message = (err as Error)?.message || '';
      if (message.includes('CONTENT_NOT_PROCESSABLE')) {
        setShowNotProcessable(true);
        setSuggestion(null);
        setError(null);
      } else {
        setError('Verschönern fehlgeschlagen. Bitte erneut versuchen.');
      }
      console.error(message || err);
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
    }
    setSuggestion(null);
    setError(null);
  };

  const rejectSuggestion = () => {
    setSuggestion(null);
    setError(null);
  };

  const tooShort = description.trim().length < 50;

  return (
    <IonItem className="app-form-item">
      <IonLabel position="stacked" className="app-form-label">Beschreibung</IonLabel>
      {suggestion ? (
        <>
          <div className="ai-compare-grid">
            <div>
              <div className="ai-compare-label">Bisher</div>
              <IonTextarea
                value={description}
                readonly
                disabled={disabled}
                className="app-form-textarea"
                autoGrow
              />
            </div>
            <div>
              <div className="ai-compare-label">Vorschlag</div>
              <IonTextarea
                value={suggestion}
                onIonInput={(e) => setSuggestion(e.detail.value || '')}
                disabled={disabled}
                className="app-form-textarea"
                autoGrow
              />
            </div>
          </div>
          <div className="ai-compare-actions">
            <IonButton onClick={acceptSuggestion} disabled={disabled}>
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              Übernehmen
            </IonButton>
            <IonButton color="medium" fill="outline" onClick={rejectSuggestion} disabled={disabled}>
              <IonIcon slot="start" icon={closeCircleOutline} />
              Nicht übernehmen
            </IonButton>
          </div>
        </>
      ) : (
        <>
          <div className="ai-textarea-wrapper">
            <IonTextarea
              value={description}
              onIonInput={(e) => onChange(e.detail.value || '')}
              placeholder="Beschreibung der Aufgabe"
              rows={4}
              className="app-form-textarea"
              disabled={loading || disabled}
              autoGrow
            />
            {loading && (
              <div className="ai-textarea-overlay">
                <IonSpinner name="circular" />
              </div>
            )}
          </div>
          <div className="ai-action-row">
            <IonButton
              size="small"
              onClick={handleBeautify}
              disabled={loading || disabled || tooShort}
              title={tooShort ? 'Mindestens 50 Zeichen erforderlich' : undefined}
            >
              <IonIcon slot="start" icon={colorWandOutline} />
              Verschönern
            </IonButton>
            {error && <div className="ai-inline-error">{error}</div>}
          </div>
        </>
      )}
      <IonToast
        isOpen={showNotProcessable}
        message="Inhalt kann nicht verarbeitet werden."
        duration={2200}
        color="warning"
        onDidDismiss={() => setShowNotProcessable(false)}
      />
    </IonItem>
  );
};

export default TaskDescriptionEnhancer;
