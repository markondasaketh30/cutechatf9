'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'app/components/ui/dropdown-menu';
import { Button } from 'app/components/ui/button';
import { Textarea, TextareaProps } from 'app/components/ui/textarea';
import { cn } from 'app/lib/utils';
import {
  ArrowUp,
  ChevronDown,
  File,
  Mic,
  Paperclip,
  X,
} from 'lucide-react';
import React, 'use-memo-with-strict-mode';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'app/components/ui/tooltip';

export const AIModels = {
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    icon: 'anthropic',
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    icon: 'anthropic',
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    icon: 'openai',
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    icon: 'openai',
  },
};

const PromptInputContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  selectedModel: keyof typeof AIModels;
  setSelectedModel: (model: keyof typeof AIModels) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  onSubmit: () => void;
}>({
  value: '',
  setValue: () => {},
  files: [],
  setFiles: () => {},
  isRecording: false,
  setIsRecording: () => {},
  selectedModel: 'claude-3-opus',
  setSelectedModel: () => {},
  isGenerating: false,
  setIsGenerating: () => {},
  onSubmit: () => {},
});

export function usePromptInput() {
  const context = React.use(PromptInputContext);
  if (!context) {
    throw new Error('usePromptInput must be used within a PromptInput');
  }
  return context;
}

export function PromptInput({
  value,
  setValue,
  files,
  setFiles,
  isRecording,
  setIsRecording,
  selectedModel,
  setSelectedModel,
  isGenerating,
  setIsGenerating,
  onSubmit,
  children,
  className,
  ...props
}: {
  value: string;
  setValue: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  selectedModel: keyof typeof AIModels;
  setSelectedModel: (model: keyof typeof AIModels) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  onSubmit: () => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...newFiles]);
  };

  return (
    <PromptInputContext.Provider
      value={{
        value,
        setValue,
        files,
        setFiles,
        isRecording,
        setIsRecording,
        selectedModel,
        setSelectedModel,
        isGenerating,
        setIsGenerating,
        onSubmit,
      }}
    >
      <div
        className={cn(
          'relative flex w-full flex-col gap-2 rounded-lg border bg-background p-2 focus-within:ring-1 focus-within:ring-ring',
          className,
        )}
        onDragOver={onDragOver}
        onDrop={onDrop}
        {...props}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

export function PromptTextInput(props: TextareaProps) {
  const { value, setValue, isRecording, isGenerating } = usePromptInput();

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      const newFiles = Array.from(e.clipboardData.files);
      // setFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <Textarea
      placeholder="Message"
      value={isRecording ? 'Listening...' : value}
      onChange={e => setValue(e.target.value)}
      onPaste={onPaste}
      disabled={isGenerating}
      className="border-none bg-transparent shadow-none focus-visible:ring-0"
      {...props}
    />
  );
}

export function PromptAttachments() {
  const { files, setFiles } = usePromptInput();

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="relative flex items-center gap-2 rounded-lg border bg-muted p-2"
        >
          <File size={16} />
          <p className="text-sm">{file.name}</p>
          <button
            onClick={() => removeFile(index)}
            className="absolute -right-2 -top-2 rounded-full border bg-background p-1"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function PromptActions({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex w-full items-end justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PromptAttachAction() {
  const { setFiles } = usePromptInput();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Attach files</TooltipContent>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        multiple
      />
    </Tooltip>
  );
}

export function PromptSpeechToAction() {
  const { isRecording, setIsRecording } = usePromptInput();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRecording(!isRecording)}
        >
          {isRecording ? (
            <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
          ) : (
            <Mic size={16} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isRecording ? 'Stop recording' : 'Record audio'}
      </TooltipContent>
    </Tooltip>
  );
}

export function PromptModelAction() {
  const { selectedModel, setSelectedModel } = usePromptInput();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <p>{AIModels[selectedModel].name}</p>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(AIModels).map(([key, model]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setSelectedModel(key as keyof typeof AIModels)}
          >
            {model.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PromptSubmitAction() {
  const { value, files, isGenerating, onSubmit } = usePromptInput();
  const hasContent = value.length > 0 || files.length > 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!hasContent || isGenerating}
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-background" />
          ) : (
            <ArrowUp size={16} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isGenerating ? 'Generating...' : 'Send message'}
      </TooltipContent>
    </Tooltip>
  );
}