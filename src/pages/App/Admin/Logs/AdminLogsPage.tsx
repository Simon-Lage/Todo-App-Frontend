import React, { useEffect, useState } from 'react';
import { IonContent, IonText, IonSpinner, IonSearchbar, IonButton } from '@ionic/react';
import { logService } from '../../../../services/logService';
import PaginationControls from '../../../../components/PaginationControls';
import type { LogView } from '../../../../types/api';
import { getErrorMessage } from '../../../../utils/errorUtils';
import { formatLogAction } from '../../../../utils/logUtils';

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('de-DE');
  };

  useEffect(() => {
    loadLogs();
  }, [offset, searchText]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [searchText]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.list(
        { q: searchText || undefined },
        { offset, limit, sort_by: 'performed_at', direction: 'desc' }
      );
      setLogs(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Fehler beim Laden der Logs');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Logs...</p>
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">System-Logs</h1>
        <p className="page-subtitle">{total} Log-Einträge gesamt</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar 
          value={searchText} 
          onIonInput={(e) => setSearchText(e.detail.value!)} 
          placeholder="Logs durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>Keine Logs gefunden</p>
        </div>
      ) : (
        <>
          <div className="admin-table" style={{ padding: '0 16px' }}>
            <div className="admin-table-header">
              <span>Aktion</span>
              <span>Datum</span>
              <span>Details</span>
            </div>
            {logs.map((log) => (
              <div className="admin-table-row" key={log.id}>
                <span>{formatLogAction(log.action)}</span>
                <span>{formatDateTime(log.performed_at)}</span>
                <span>
                  <IonButton size="small" routerLink={`/app/admin/logs/${log.id}`} fill="outline">
                    Details
                  </IonButton>
                </span>
              </div>
            ))}
          </div>
          <PaginationControls
            offset={offset}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </IonContent>
  );
};

export default AdminLogsPage;
