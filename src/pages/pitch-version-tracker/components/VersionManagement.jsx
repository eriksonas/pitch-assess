import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const VersionManagement = ({ versions, onRename, onArchive, onExport }) => {
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const handleStartEdit = (version) => {
    setEditingId(version?.id);
    setNewName(version?.fileName);
  };

  const handleSaveEdit = (versionId) => {
    if (onRename) {
      onRename(versionId, newName);
    }
    setEditingId(null);
    setNewName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };

  const handleExportAll = () => {
    if (onExport) {
      onExport('all');
    }
  };

  const handleExportVersion = (versionId) => {
    if (onExport) {
      onExport(versionId);
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Version Management
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Organize, rename, and export your pitch versions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          onClick={handleExportAll}
        >
          Export All
        </Button>
      </div>

      <div className="space-y-3">
        {versions?.map((version) => (
          <div
            key={version?.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-base"
          >
            <Icon name="FileText" size={20} className="text-primary flex-shrink-0" />

            {editingId === version?.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e?.target?.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Check"
                  onClick={() => handleSaveEdit(version?.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={handleCancelEdit}
                />
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {version?.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {version?.versionNumber} • Score: {version?.overallScore?.toFixed(1)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Edit2"
                    onClick={() => handleStartEdit(version)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Download"
                    onClick={() => handleExportVersion(version?.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Archive"
                    onClick={() => onArchive && onArchive(version?.id)}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionManagement;