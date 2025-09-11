import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string;
    category: string;
    icon?: LucideIcon;
    tags?: string[];
    color?: string;
    usageCount?: number;
  };
  onUse?: () => void;
  isLoading?: boolean;
  selectedTheme?: string;
}

export function TemplateCard({ template, onUse, isLoading, selectedTheme }: TemplateCardProps) {
  const Icon = template.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            template.color ? `bg-${template.color}/10` : 'bg-primary/10'
          }`}>
            {Icon ? (
              <Icon className={`w-6 h-6 ${template.color ? `text-${template.color}` : 'text-primary'}`} />
            ) : (
              <div className="w-6 h-6 bg-muted rounded" />
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors" data-testid={`text-template-title-${template.id}`}>
            {template.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {template.description}
          </p>
        </div>
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {template.usageCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              Used {template.usageCount} times
            </span>
          )}
          {selectedTheme && (
            <Badge variant="outline" className="text-xs">
              {selectedTheme} theme
            </Badge>
          )}
        </div>
        
        {onUse && (
          <Button 
            onClick={onUse}
            className="w-full mt-4"
            disabled={isLoading}
            data-testid={`button-use-template-${template.id}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Use Template'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
