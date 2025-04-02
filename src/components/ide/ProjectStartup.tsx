
import React, { useState } from 'react';
import { Github, FileCode, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { useWebContainer } from '@/contexts/WebContainerContext';
import { convertToWebContainerFormat } from '@/utils/webContainerUtils';
import { toast } from 'sonner';
import { GithubRepoLoader } from './GithubRepoLoader';

export const ProjectStartup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showGithubLoader, setShowGithubLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetFileSystem, files } = useFileSystem();
  const { mountFiles, isFallbackMode } = useWebContainer();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStartNewProject = async () => {
    setIsLoading(true);
    
    try {
      // Reset file system to default state
      resetFileSystem();
      
      // Wait for file system state to update
      setTimeout(async () => {
        try {
          if (!isFallbackMode) {
            // Convert file system to WebContainer format and mount
            const webContainerFiles = convertToWebContainerFormat(files);
            await mountFiles(webContainerFiles);
          } else {
            // In fallback mode, just simulate mounting
            await mountFiles({});
          }
          
          toast.success('New project created successfully' + (isFallbackMode ? ' (fallback mode)' : ''));
          handleClose();
        } catch (error: any) {
          toast.error('Failed to initialize project: ' + error.message);
          console.error('Project initialization error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 800);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to create new project');
    }
  };

  const handleLoadFromGithub = () => {
    if (isFallbackMode) {
      toast.warning('GitHub loading is limited in fallback mode');
    }
    setShowGithubLoader(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-sidebar border-border">
          <DialogHeader>
            <DialogTitle className="text-sidebar-foreground">
              Welcome to Code Editor {isFallbackMode && "(Fallback Mode)"}
            </DialogTitle>
            <DialogDescription className="text-sidebar-foreground opacity-70">
              {isFallbackMode 
                ? "Running in fallback mode with limited functionality. Some features may be simulated."
                : "Choose how you want to get started with your project"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 h-20 px-4 bg-terminal hover:bg-terminal/90 border-border text-sidebar-foreground"
              onClick={handleLoadFromGithub}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-6 w-6 text-blue-500 animate-spin" />
              ) : (
                <Github className="h-6 w-6 text-blue-500" />
              )}
              <div className="text-left">
                <div className="font-medium">Load from GitHub</div>
                <div className="text-sm text-muted-foreground">
                  {isFallbackMode 
                    ? "Limited functionality in fallback mode"
                    : "Import code from an existing public repository"}
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-start gap-2 h-20 px-4 bg-terminal hover:bg-terminal/90 border-border text-sidebar-foreground"
              onClick={handleStartNewProject}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-6 w-6 text-green-500 animate-spin" />
              ) : (
                <FileCode className="h-6 w-6 text-green-500" />
              )}
              <div className="text-left">
                <div className="font-medium">Start New Project</div>
                <div className="text-sm text-muted-foreground">
                  {isFallbackMode
                    ? "Some features will be simulated"
                    : "Begin with a blank workspace"}
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showGithubLoader && (
        <GithubRepoLoader 
          isOpen={showGithubLoader} 
          onClose={() => {
            setShowGithubLoader(false);
            handleClose();
          }}
        />
      )}
    </>
  );
};
