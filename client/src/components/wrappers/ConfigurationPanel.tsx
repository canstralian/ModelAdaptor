import { useState, useEffect } from 'react';
import { Wrapper } from '@shared/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ConfigurationPanelProps {
  wrapper: Partial<Wrapper>;
  onSave: (wrapper: Partial<Wrapper>) => void;
  isSaving: boolean;
}

const ConfigurationPanel = ({ wrapper, onSave, isSaving }: ConfigurationPanelProps) => {
  const [formData, setFormData] = useState<Partial<Wrapper>>(wrapper);

  // Update form data when wrapper changes
  useEffect(() => {
    setFormData(wrapper);
  }, [wrapper]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSliderChange = (value: number[], name: string) => {
    setFormData({ ...formData, [name]: value[0] });
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="lg:w-1/3 border-r border-gray-200">
      <form onSubmit={handleSubmit} className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Wrapper Configuration</h2>
        
        {/* Model Selection */}
        <div className="mb-6">
          <Label htmlFor="baseModel" className="text-sm font-medium text-gray-700 mb-1">Base Model</Label>
          <Select 
            value={formData.baseModel || 'Gemini Pro'} 
            onValueChange={(value) => handleSelectChange(value, 'baseModel')}
          >
            <SelectTrigger id="baseModel" className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gemini Pro">Gemini Pro</SelectItem>
              <SelectItem value="Gemini Pro Vision">Gemini Pro Vision</SelectItem>
              <SelectItem value="Gemini Flash">Gemini Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Wrapper Name */}
        <div className="mb-6">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Wrapper Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name || ''} 
            onChange={handleInputChange} 
            className="block w-full"
          />
        </div>
        
        {/* Wrapper Description */}
        <div className="mb-6">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            rows={3} 
            value={formData.description || ''} 
            onChange={handleInputChange} 
            className="block w-full resize-none"
          />
        </div>
        
        {/* System Prompt */}
        <div className="mb-6">
          <Label htmlFor="systemPrompt" className="text-sm font-medium text-gray-700 mb-1">System Prompt</Label>
          <Textarea 
            id="systemPrompt" 
            name="systemPrompt" 
            rows={4} 
            value={formData.systemPrompt || ''} 
            onChange={handleInputChange} 
            className="code-font block w-full resize-none"
          />
        </div>
        
        {/* Model Parameters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Model Parameters</h3>
          
          <div className="space-y-4">
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature" className="text-sm text-gray-700">Temperature</Label>
                <span className="text-sm text-gray-500">{(formData.temperature || 70) / 100}</span>
              </div>
              <Slider 
                id="temperature"
                min={0} 
                max={100} 
                step={10} 
                value={[formData.temperature || 70]} 
                onValueChange={(value) => handleSliderChange(value, 'temperature')} 
                className="w-full"
              />
            </div>
            
            {/* Max Tokens */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens" className="text-sm text-gray-700">Max Tokens</Label>
                <span className="text-sm text-gray-500">{formData.maxTokens || 2048}</span>
              </div>
              <Slider 
                id="maxTokens"
                min={256} 
                max={4096} 
                step={256} 
                value={[formData.maxTokens || 2048]} 
                onValueChange={(value) => handleSliderChange(value, 'maxTokens')} 
                className="w-full"
              />
            </div>
            
            {/* Top P */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="topP" className="text-sm text-gray-700">Top P</Label>
                <span className="text-sm text-gray-500">{(formData.topP || 90) / 100}</span>
              </div>
              <Slider 
                id="topP"
                min={0} 
                max={100} 
                step={10} 
                value={[formData.topP || 90]} 
                onValueChange={(value) => handleSliderChange(value, 'topP')} 
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Context Management */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Context Management</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox 
                id="enableMemory" 
                checked={formData.enableMemory || false} 
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'enableMemory')} 
                className="mr-2"
              />
              <Label htmlFor="enableMemory" className="text-sm text-gray-700">Enable Conversation Memory</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="knowledgeBaseIntegration" 
                checked={formData.knowledgeBaseIntegration || false} 
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'knowledgeBaseIntegration')} 
                className="mr-2"
              />
              <Label htmlFor="knowledgeBaseIntegration" className="text-sm text-gray-700">Knowledge Base Integration</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="webSearchAccess" 
                checked={formData.webSearchAccess || false} 
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'webSearchAccess')} 
                className="mr-2"
              />
              <Label htmlFor="webSearchAccess" className="text-sm text-gray-700">Web Search Access</Label>
            </div>
          </div>
        </div>
        
        {/* Save Config */}
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationPanel;
